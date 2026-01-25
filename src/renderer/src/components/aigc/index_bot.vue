<template>
  <div class="aigc">
    <div v-if="isAvaildParam" class="main">
      <t-chat-bot
        ref="chatRef"
        :default-messages="defaultMessages"
        :message-props="messageProps"
        :chat-service-config="chatServiceConfig"
        :on-chat-ready="onChatReady"
      />
    </div>

    <div v-else class="empty">
      <t-empty :title="$t('aigc.noParam')">
        <template #image>
          <error-circle-icon size="64" color="var(--td-text-color-placeholder)" />
        </template>
      </t-empty>
    </div>
  </div>
</template>
<script setup lang="ts">
import { APP_NAME } from '@shared/config/appinfo';
import { THEME } from '@shared/config/theme';
import { isHttp, isNil, isObject, isString } from '@shared/modules/validate';
import type {
  AIMessageContent,
  ChatMessagesData,
  ChatRequestParams,
  ChatServiceConfig,
  SSEChunkData,
  SuggestionItem,
  TdChatbotApi,
  TdChatMessageConfigItem,
} from '@tdesign-vue-next/chat';
import { ChatBot as TChatBot } from '@tdesign-vue-next/chat';
import { ErrorCircleIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

import { getSettingDetail } from '@/api/setting';
import openaiIcon from '@/assets/ai/openai-kimi.png';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';
import { aigcChatCompletionApi } from '@/utils/env';

/**
 * @see https://tdesign.tencent.com/vue-next/components/chatbot
 */

interface OpenAIStreamChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index: number;
    delta?: {
      role?: 'user' | 'assistant' | 'system';
      content?: string;
      function_call?: any;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }>;
}

const settingStore = useSettingStore();

const defaultMessages: ChatMessagesData[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: [
      {
        type: 'text',
        status: 'complete',
        data: t('aigc.chat.tip', [APP_NAME]),
      },
      {
        type: 'suggestion',
        status: 'complete',
        data: [
          {
            title: t('aigc.chat.suggestion.desc.title', [APP_NAME]),
            prompt: t('aigc.chat.suggestion.desc.prompt', [APP_NAME]),
          },
        ],
      },
    ],
  },
];

const chatRef = useTemplateRef<TdChatbotApi | null>('chatRef');

const config = ref<{ server: string; key: string; model: string }>({
  server: '',
  key: '',
  model: '',
});
const sessionId = ref<string | null>(null);

const isAvaildParam = computed(() => {
  const { server, model } = config.value;
  return isHttp(server) && !!model;
});

onMounted(() => setup());

const setup = async () => {
  emitter.off(emitterChannel.REFRESH_AIGC_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_AIGC_CONFIG, reloadConfig);

  getSetting();
};

const getSetting = async () => {
  try {
    const resp = await getSettingDetail('aigc');

    const currentModel = config.value.model;
    if (resp.model !== currentModel) {
      nextTick(() => {
        chatRef.value?.sendSystemMessage(t('aigc.chat.modelChange', [resp.model]));
      });
    }

    config.value = resp;
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
  }
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.LAYOUT_HEADER_QUICK) return;

  chatRef.value?.abortChat(); // abort current chat session

  await getSetting();
};

const chatServiceConfig: ChatServiceConfig = {
  endpoint: aigcChatCompletionApi,
  stream: true,
  protocol: 'default',
  onRequest: (params: ChatRequestParams) => {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        messageID: params.messageId,
        stream: true,
        model: config.value.model,
        sessionId: sessionId.value,
      }),
    };
  },
  onMessage: (chunk: SSEChunkData): AIMessageContent | null => {
    // console.debug('stream message raw data:', chunk);

    const data = chunk.data as OpenAIStreamChunk;

    if (isString(data) && data === '[DONE]') {
      return null;
    }

    if (isObject(data)) {
      const delta = data?.choices?.[0]?.delta;
      const reasoningContent = delta?.reasoning_content;
      const content = delta?.content ?? '';

      const isReasoning = !isNil(reasoningContent);

      if (isReasoning) {
        const isComplete = /完成|结束|finished|done/i.test(reasoningContent);

        return {
          type: 'thinking',
          data: {
            title: isComplete ? t('aigc.status.reasoned') : t('aigc.status.reasoning'),
            text: reasoningContent,
          },
          status: isComplete ? 'complete' : 'streaming',
        };
      }

      if (content) {
        return {
          type: 'markdown',
          data: content,
          strategy: 'merge',
        };
      }
    }

    return null;
  },
};

const messageProps = (msg: ChatMessagesData): TdChatMessageConfigItem => {
  const { role } = msg;

  if (role === 'user') {
    return { variant: 'base', placement: 'right' };
  }

  if (role === 'assistant') {
    return {
      variant: 'text',
      placement: 'left',
      avatar: openaiIcon,
      actions: ['copy', 'replay', 'good', 'bad'],
      handleActions: {
        copy: async ({ message }) => {
          try {
            const content = message?.choices?.[0]?.delta?.content || '';
            await navigator.clipboard.writeText(content);
            MessagePlugin.success(t('common.copySuccess'));
          } catch {
            MessagePlugin.error(t('common.copyFail'));
          }
        },
        replay: () => {
          chatRef.value?.regenerate();
        },
        suggestion: ({ content }: { content: SuggestionItem }) => {
          chatRef.value?.addPrompt(content.prompt!);
          // chatRef.value?.sendUserMessage({ prompt: content.prompt! });
        },
      },
      chatContentProps: {
        thinking: {
          collapsed: false,
          layout: 'block',
          maxHeight: 200,
        },
        search: {
          useCollapse: true,
          collapsed: false,
        },
        markdown: {
          options: {
            themeSettings: {
              codeBlockTheme: settingStore.displayTheme === THEME.LIGHT ? THEME.LIGHT : THEME.DARK,
            },
          },
        },
      },
    };
  }

  return {};
};

const onChatReady = () => {
  console.log('Chat bot is ready');
};
</script>
<style lang="less" scoped>
.aigc {
  height: 100%;
  width: 100%;

  .main {
    height: 100%;
    width: 100%;
    max-width: 734px;
    margin: 0 auto;
    overflow: hidden;
  }
}
</style>
