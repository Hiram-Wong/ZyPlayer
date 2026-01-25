<template>
  <div class="aigc">
    <div v-if="isAvaildParam" class="aigc-main">
      <div class="aigc-content">
        <t-chat-list :clear-history="messages.length > 0" @clear="clearHistory">
          <t-chat-message
            v-for="(message, idx) in messages"
            :key="message.id"
            :message="message"
            :variant="messageProps[message.role]?.variant"
            :placement="messageProps[message.role]?.placement"
            :avatar="messageProps[message.role]?.avatar"
            :handle-actions="message.role === 'user' ? {} : handleMsgActions"
            :chat-content-props="contentProps"
            :copy-text="handleCopyAction"
            allow-content-segment-custom
          >
            <template #actionbar>
              <t-chat-actionbar
                v-if="isAIMessage(message) && message.status === 'complete'"
                :comment="actionComment"
                :action-bar="getActionBar(idx === messages.length - 1)"
                @actions="handleAction"
              />
            </template>
          </t-chat-message>
        </t-chat-list>

        <t-chat-sender
          v-model="inputValue"
          :textarea-props="{
            placeholder: $t('common.placeholder.input'),
          }"
          :loading="senderLoading"
          @send="handleSend"
          @stop="handleStop"
        />
      </div>
      <p class="aigc-declare">{{ $t('aigc.declare') }}</p>
    </div>

    <div v-else class="aigc-empty">
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
  ChatContentProps,
  ChatMessagesData,
  ChatRequestParams,
  ChatServiceConfig,
  SSEChunkData,
  SuggestionItem,
  TdChatActionsName,
  TdChatContentMDOptions,
  TdChatMessageConfig,
} from '@tdesign-vue-next/chat';
import { isAIMessage, useChat } from '@tdesign-vue-next/chat';
import { cloneDeep } from 'es-toolkit';
import { ErrorCircleIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { createMemorySession, delMemoryMessage, delMemorySession } from '@/api/aigc';
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

const inputValue = ref<string>('');
const actionComment = ref<'good' | 'bad' | ''>('');

const config = ref<{ server: string; key: string; model: string }>({
  server: '',
  key: '',
  model: '',
});
const sessionId = ref<string | null>(null);

const messageProps = ref<TdChatMessageConfig>({
  user: { variant: 'base', placement: 'right' },
  assistant: {
    variant: 'text',
    placement: 'left',
    actions: ['copy', 'replay', 'good', 'bad'],
    avatar: openaiIcon,
  },
});

const contentProps = ref<ChatContentProps>({
  markdownProps: {
    engine: 'cherry-markdown',
    options: {
      themeSettings: {
        codeBlockTheme: settingStore.displayTheme === THEME.LIGHT ? THEME.LIGHT : THEME.DARK,
      },
    } as TdChatContentMDOptions,
  },
});

const defaultMessages = ref<ChatMessagesData[]>([
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
]);

const chatServiceConfig = ref<ChatServiceConfig>({
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
});

const { chatEngine, messages, status } = useChat({
  defaultMessages: defaultMessages.value,
  chatServiceConfig: chatServiceConfig.value,
});

const senderLoading = computed(() => status.value === 'pending' || status.value === 'streaming');
const isAvaildParam = computed(() => {
  const { server, model } = config.value;
  return isHttp(server) && !!model;
});

onMounted(() => setup());

const getActionBar = (isLast: boolean): TdChatActionsName[] => {
  const actions: TdChatActionsName[] = ['copy', 'good', 'bad'];
  if (isLast) actions.unshift('replay');
  return actions;
};

const handleMsgActions = {
  suggestion: ({ content }: { content: SuggestionItem }) => {
    inputValue.value = content?.prompt || '';
  },
};

const handleCopyAction = (content: string) => {
  console.debug('Copy content:', content);
  try {
    navigator.clipboard.writeText(content);
    MessagePlugin.success(t('common.copySuccess'));
  } catch (error) {
    console.error('Copy failed:', error);
    MessagePlugin.error(t('common.copyFail'));
  }
};

const handleAction = (name: string, data?: any) => {
  console.log(name, data);
  const handles = {
    bad: () => {
      actionComment.value = actionComment.value === 'bad' ? '' : 'bad';
    },
    copy: () => {},
    good: () => {
      actionComment.value = actionComment.value === 'good' ? '' : 'good';
    },
    replay: async () => {
      await delMessageMemory([-1, -2]);
      chatEngine.value?.regenerateAIMessage();
    },
  };

  handles?.[name]?.(data);
};

const handleSend = async (params: string) => {
  if (!sessionId.value) {
    const sessionStatus = await initSessionMemory();
    if (!sessionStatus) {
      MessagePlugin.error(t('aigc.message.createSessionFailed'));
      return;
    }
  }

  await chatEngine.value?.sendUserMessage({ prompt: params });
  inputValue.value = '';
};

const handleStop = () => {
  chatEngine.value?.abortChat();
};

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
      const systemIdx = messages.value.findIndex((m) => m.role === 'system');
      if (systemIdx < 0) {
        chatEngine.value?.sendSystemMessage(t('aigc.chat.modelChange', [resp.model]));
      } else {
        const clonedMessages = cloneDeep(messages.value);
        clonedMessages[systemIdx].content = [
          {
            type: 'text',
            status: 'complete',
            data: t('aigc.chat.modelChange', [resp.model]),
          },
        ];
        chatEngine.value?.setMessages(clonedMessages, 'replace');
      }
    }

    config.value = resp;
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
  }
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.LAYOUT_HEADER_QUICK) return;

  handleStop();

  await getSetting();
};

const initSessionMemory = async () => {
  try {
    const resp = await createMemorySession();
    sessionId.value = resp.id;
    return !!sessionId.value;
  } catch (error) {
    console.error('Failed to create session:', error);
    return false;
  }
};

const clearSessionMemory = async () => {
  try {
    if (sessionId.value) {
      await delMemorySession({ id: [sessionId.value] });
    }
    sessionId.value = null;
  } catch (error) {
    console.error('Failed to clear chat:', error);
    sessionId.value = null;
  }
};

const delMessageMemory = async (idx: number[]) => {
  try {
    if (sessionId.value) {
      await delMemoryMessage({ id: sessionId.value, index: idx });
    }
  } catch (error) {
    console.error('Failed to delete message memory:', error);
  }
};

const clearHistory = async () => {
  await clearSessionMemory();
  chatEngine.value?.clearMessages();
};
</script>
<style lang="less" scoped>
.aigc {
  height: 100%;
  width: 100%;

  .aigc-main {
    height: 100%;
    width: 100%;
    max-width: 734px;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--td-size-4);

    .aigc-content {
      height: 100%;
      width: 100%;
      flex: 1 1 auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--td-size-4);

      :deep(t-chat-loading),
      :deep(t-chat-item) {
        --td-chat-loading-circle-border-top-color: var(--td-brand-color);
        --td-chat-loading-circle-border: 2px solid var(--td-brand-color-1);
      }

      :deep(t-chat-item)::part(t-chat__text--user) {
        background-color: var(--td-chat-item-suggestion-background);
        color: var(--td-chat-item-suggestion-color);
      }

      :deep(.t-divider) {
        margin: var(--td-comp-margin-s) 0;
      }

      :deep(.t-chat-sender) {
        .t-chat-sender__textarea {
          background-color: var(--td-bg-color-component);
          box-shadow: none;
        }
      }
    }

    .aigc-declare {
      height: fit-content;
      width: 100%;
      flex: 0;
      color: var(--td-text-color-disabled);
      font-size: var(--td-font-size-link-small);
      text-align: center;
    }

    :deep(.t-chat__to-bottom) {
      bottom: 0;
      width: var(--td-comp-size-xl);
      height: var(--td-comp-size-xl);
      border-radius: var(--td-radius-circle);
    }
  }
}
</style>
