<template>
  <div class="aigc view-component-container">
    <div v-if="isAvaildParam" class="aigc__main">
      <div class="aigc__content">
        <div class="aigc__chat">
          <t-chat
            ref="chatRef"
            :data="chatList"
            :clear-history="chatList.length > 0 && !active.isStreamLoad"
            :is-stream-load="active.isStreamLoad"
            @scroll="handleChatScroll"
            @clear="handleClearMessage"
          >
            <template #content="{ item }">
              <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
                <template #header>
                  <t-chat-loading v-if="active.isStreamLoad" :text="$t('aigc.reasoning')" />
                  <div v-else style="display: flex; align-items: center">
                    <check-circle-icon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                    <span>{{ $t('aigc.reasoned') }}</span>
                  </div>
                </template>
                <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
              </t-chat-reasoning>
              <t-chat-loading
                v-if="active.isStreamLoad && item.content.length === 0"
                animation="gradient"
                class="t-chat__text--loading"
              />
              <t-chat-content v-if="item.content.length > 0" :content="item.content" />
              <!-- <t-chat-item
              v-if="item.content.length > 0"
              :avatar="item.avatar"
              :role="item.role"
              :content="item.content"
              :text-loading="index === 0 && active.loading"
            /> -->
            </template>
            <template #actions="{ item, index }">
              <t-chat-action
                :disabled="active.isStreamLoad && index === 0"
                :content="item.content"
                :is-good="actionStatus[chatList.length - index]?.good"
                :is-bad="actionStatus[chatList.length - index]?.bad"
                :operation-btn="index === 0 ? ['good', 'bad', 'replay', 'copy'] : ['good', 'bad', 'copy']"
                @operation="(type: string, { e }) => handleOperation(type, { e, index })"
              />
            </template>
            <template #footer>
              <t-chat-sender
                v-model="promptValue"
                :stop-disabled="active.isStreamLoad"
                :textarea-props="{
                  placeholder: $t('common.placeholder.input'),
                }"
                @send="handlePromptSend"
                @stop="handleIReplyStreamStop"
              >
                <!-- 自定义操作区域的内容，默认支持图片上传、附件上传和发送按钮 -->
                <template #suffix="{ renderPresets }">
                  <!-- 在这里可以进行自由的组合使用，或者新增预设 -->
                  <!-- 不需要附件操作的使用方式 -->
                  <component :is="renderPresets([])" />
                  <!-- 只需要附件上传的使用方式 -->
                  <!-- <component :is="renderPresets([{ name: 'uploadAttachment' }])" /> -->
                  <!-- 只需要图片上传的使用方式 -->
                  <!-- <component :is="renderPresets([{ name: 'uploadImage' }])" /> -->
                  <!-- 任意配置顺序 -->
                  <!-- <component :is="renderPresets([{ name: 'uploadAttachment' }, { name: 'uploadImage' }])" /> -->
                </template>
              </t-chat-sender>
            </template>
          </t-chat>
        </div>
        <p class="aigc__declare">{{ $t('aigc.declare') }}</p>
      </div>

      <t-button
        v-show="active.isShowToBottom"
        shape="round"
        variant="outline"
        class="aigc__to-bottom"
        @click="scrollToBottom"
      >
        <template #icon>
          <arrow-down-icon />
        </template>
      </t-button>
    </div>

    <div v-else class="aigc__empty">
      <t-empty :title="$t('aigc.noParam')">
        <template #image>
          <error-circle-icon size="64" color="var(--td-text-color-placeholder)" />
        </template>
      </t-empty>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isHttp, isJsonStr } from '@shared/modules/validate';
import { ArrowDownIcon, CheckCircleIcon, ErrorCircleIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { createMemorySession, delMemoryMessage, delMemorySession, fetchAiStream } from '@/api/aigc';
import { getSettingDetail } from '@/api/setting';
import openaiIcon from '@/assets/ai/openai-kimi.png';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import emitter from '@/utils/emitter';

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'error' | 'model-change';
  avatar?: string;
  reasoning?: string;
  duration?: number;
}

const KEY = 'aigc';

const chatRef = useTemplateRef<{ scrollToBottom: (opt: object) => void }>('chatRef');

const config = ref({
  server: '',
  key: '',
  model: '',
});
const active = ref({
  loading: false,
  isStreamLoad: false,
  isShowToBottom: false,
});

const promptValue = ref('');
const sessionId = ref('');
const chatList = ref<ChatMessage[]>([]);

const actionStatus = ref({});
const abortController = ref<AbortController | null>(null);

const isAvaildParam = computed(() => {
  const { server, model } = config.value;
  return isHttp(server) && !!model;
});

onMounted(() => {
  getSetting();

  emitter.off(emitterChannel.REFRESH_AIGC_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_AIGC_CONFIG, reloadConfig);
});

const getSetting = async () => {
  try {
    const resp = await getSettingDetail(KEY);

    if (resp.model !== config.value.model) {
      chatList.value.unshift({
        content: computed(() => t('aigc.chat.modelChange', [resp.model])) as unknown as string,
        role: 'model-change',
      } as ChatMessage);
    }

    config.value = resp;
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
  }
};

const scrollToBottom = () => {
  chatRef.value?.scrollToBottom({ behavior: 'smooth' });
};

const handleChatScroll = ({ e }: { e: Event }) => {
  const target = e.target as HTMLElement;
  active.value.isShowToBottom = target.scrollTop < 0;
};

const handleClearMessage = async () => {
  chatList.value = [];
  actionStatus.value = {};

  try {
    if (sessionId.value) {
      await delMemorySession({ id: [sessionId.value] });
      sessionId.value = '';
    }
  } catch (error) {
    console.error('Failed to clear chat:', error);
    sessionId.value = '';
  }
};

const handlePromptSend = async (val: string) => {
  if (!val) return;
  if (active.value.isStreamLoad) return;

  chatList.value.unshift({
    content: val,
    role: 'user',
  });

  if (!sessionId.value) {
    try {
      const resp = await createMemorySession();
      sessionId.value = resp.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      MessagePlugin.error(t('aigc.message.createSessionFailed'));
      return;
    }
  }

  promptValue.value = '';

  await fetchAiReply(val);
};

const handleIReplyStreamStop = () => {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
  }

  active.value.loading = false;
  active.value.isStreamLoad = false;

  if (chatList.value?.[0]?.content?.length === 0) {
    chatList.value[0].content = t('aigc.chat.stopGenerating');
  }
};

const fetchAiReply = async (prompt: string) => {
  active.value.loading = true;
  active.value.isStreamLoad = true;

  chatList.value.unshift({
    avatar: openaiIcon,
    role: 'assistant',
    content: '',
    reasoning: '',
    duration: 0,
  });

  const startTime = Date.now();

  try {
    const callback = (result: { data: any; done: boolean; ctrl?: AbortController; code: number }) => {
      const { data: dataRaw, done, ctrl, code } = result;
      const data = isJsonStr(dataRaw) ? JSON.parse(dataRaw) : {};
      const lastItem = chatList.value[0];

      if (ctrl) abortController.value = ctrl;

      if (code === 0) {
        lastItem.reasoning += data?.choices?.[0]?.delta?.reasoning_content ?? '';
        lastItem.content += data?.choices?.[0]?.delta?.content ?? '';
      } else {
        lastItem.role = 'error';
        lastItem.content = dataRaw;
        lastItem.reasoning = '';
      }

      if (done) {
        abortController.value?.abort();

        lastItem.duration = Math.floor((Date.now() - startTime) / 1000);

        active.value.isStreamLoad = false;
        active.value.loading = false;
      }
    };

    await fetchAiStream(
      {
        prompt,
        model: config.value.model,
        sessionId: sessionId.value,
        stream: true,
      },
      callback,
    );
  } catch (error) {
    console.error('AI reply error:', error);

    const lastItem = chatList.value[0];
    lastItem.role = 'error';
    lastItem.content = '';
    lastItem.reasoning = (error as Error).message;

    lastItem.duration = Math.floor((Date.now() - startTime) / 1000);

    active.value.isStreamLoad = false;
    active.value.loading = false;
  }
};

const handleOperation = async (type: string, options: { e: MouseEvent; index: number }) => {
  const { index } = options;
  const position = chatList.value.length - index;

  switch (type) {
    case 'good':
    case 'bad': {
      if (!actionStatus.value[position]) {
        actionStatus.value[position] = { good: false, bad: false };
      }

      actionStatus.value[position][type] = !actionStatus.value[position][type];
      actionStatus.value[position][type === 'good' ? 'bad' : 'good'] = false;
      break;
    }
    // case 'copy': {
    //   e.preventDefault();

    //   const textToCopy = chatList.value[index].content;
    //   if (!textToCopy) return;

    //   try {
    //     await navigator.clipboard.writeText(textToCopy);
    //     MessagePlugin.success(t('common.copySuccess'));
    //   } catch (error) {
    //     console.error('Copy failed:', error);
    //     MessagePlugin.error(t('common.copyFail'));
    //   }
    //   break;
    // }
    case 'replay': {
      active.value.isStreamLoad = false;
      active.value.loading = false;

      const userQuery = chatList.value[index + 1].content;
      if (!userQuery) return;

      // 删除当前机器回复和用户输入 第一次机器回复 第二次用户输入
      for (let i = 1; i <= 2; i++) {
        if (sessionId.value) {
          await delMemoryMessage({ uuid: sessionId.value, index: [-1] });
        }
        chatList.value.shift();
      }

      await handlePromptSend(userQuery);
      break;
    }
  }
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.LAYOUT_HEADER_QUICK) return;

  if (abortController.value) {
    abortController.value.abort();
  }

  await getSetting();
};
</script>
<style lang="less" scoped>
.view-component-container {
  height: 100%;
  width: 100%;

  .aigc__main {
    height: 100%;
    width: 100%;
    max-width: 734px;
    margin: 0 auto;
    overflow: hidden;

    .aigc__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--td-size-4);
      height: 100%;
      width: 100%;

      .aigc__declare {
        color: var(--td-text-color-secondary);
        font: var(--td-font-link-small);
        text-align: center;
      }

      .aigc__chat {
        flex: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;

        :deep(.t-chat__inner) {
          .t-chat__content--base {
            padding-top: var(--td-comp-paddingTB-m);
          }

          .t-chat__notice {
            color: var(--td-text-color-secondary);
          }

          &.model-change {
            margin-top: 0;
          }
        }

        :deep(.t-chat__text--loading) {
          padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
        }

        :deep(.t-chat__text) {
          .t-chat__text__user,
          .t-chat__text--user {
            background: var(--td-bg-color-component);
            color: var(--td-text-color-primary);
            border-radius: var(--td-radius-medium);
            padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);

            pre {
              background-color: transparent;
              color: var(--td-text-color-primary);
            }
          }

          .t-chat__text__assistant,
          .t-chat__text--assistant {
            a {
              color: var(--td-text-color-primary);
              pointer-events: none;
            }
          }
        }

        :deep(.t-chat__actions) {
          border: none;
          background-color: transparent;

          .t-button {
            background-color: transparent;

            &:hover {
              background-color: var(--td-bg-content-input-2);
            }
          }
        }

        :deep(.t-chat__refresh-line) {
          display: none;
        }

        :deep(.t-chat__list) {
          padding-right: var(--td-comp-paddingTB-s);
        }

        :deep(.t-chat__footer) {
          padding: 2px;

          .t-chat__footer__textarea {
            border-radius: var(--td-radius-medium);

            .t-textarea {
              .t-textarea__inner {
                border-radius: var(--td-radius-medium);

                &:hover {
                  box-shadow: none;
                }
              }
            }

            .t-chat__footer__textarea__icon {
              .t-chat__footer__textarea__icon__default {
                border-radius: var(--td-radius-medium);
              }
            }
          }

          .t-chat__footer__stopbtn {
            .t-button {
              border-radius: var(--td-radius-medium);
            }
          }

          .chat-action-footer {
            text-align: center;
            font-size: 12px;
            color: var(--td-text-color-secondary);
          }
        }

        :deep(.t-divider) {
          margin: var(--td-comp-margin-m) 0;
        }

        :deep(.t-collapse) {
          .t-collapse-panel__header {
            padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-m);
          }

          .t-collapse-panel__body {
            color: var(--td-text-color-secondary);
          }
        }

        :deep(.t-chat-sender) {
          .t-chat-sender__textarea--focus {
            background-color: var(--td-bg-color-component);
          }
        }
      }
    }

    .aigc__to-bottom {
      position: absolute;
      left: 50%;
      margin-left: -20px;
      bottom: 180px;
      padding: 0;
      width: var(--td-comp-size-xl);
      height: var(--td-comp-size-xl);
      background: var(--td-bg-color-component);
      border-radius: var(--td-radius-circle);
      box-shadow: var(--td-shadow-3);
    }
  }
}
</style>
