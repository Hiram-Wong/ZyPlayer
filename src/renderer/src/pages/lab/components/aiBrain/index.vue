<template>
  <div class="ai-brain view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.aiBrain') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="setting">{{ $t('pages.lab.aiBrain.setting') }}</t-radio-button>
        </t-radio-group>

        <t-dialog
          v-model:visible="active.setting"
          show-in-attached-element
          attach="#main-component"
          placement="center"
          width="50%"
        >
        <template #header>
          {{ $t('pages.lab.aiBrain.setting') }}
        </template>
        <template #body>
          <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="60">
            <div class="data-item">
              <p class="title-label mg-b">{{ $t('pages.lab.aiBrain.platform.title') }}</p>
              <t-space>
                <template v-for="item in AI_PLATFORM">
                  <t-link theme="default" @click="handleOpenUrl(item.url)">{{ item.name }}</t-link>
                </template>
              </t-space>
            </div>
            <div class="data-item">
              <p class="title-label mg-tb">{{ $t('pages.lab.aiBrain.params') }}</p>
              <t-form-item :label="$t('pages.lab.aiBrain.server')" name="server">
                <t-input v-model="formData.config.server" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.aiBrain.key')" name="key">
                <t-input v-model="formData.config.key" type="password" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.aiBrain.model')" name="model">
                <t-select v-model="formData.config.model" creatable filterable>
                  <t-option v-for="item in AI_MODELS" :key="item.label" :value="item.value" :label="item.label" @create="handleAiModel"/>
                </t-select>
              </t-form-item>
            </div>
          </t-form>
        </template>
        <template #footer>
          <t-button variant="outline" @click="onCancel">{{ $t('pages.setting.dialog.cancel') }}</t-button>
          <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
        </template>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <t-chat
        ref="chatRef"
        :data="chatList"
        :clear-history="chatList.length > 0 && !active.isStreamLoad"
        :is-stream-load="active.isStreamLoad"
        @scroll="handleChatScroll"
        @clear="clearConfirm"
      >
        <template #content="{ item, index }">
          <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
            <template #header>
              <t-chat-loading v-if="active.isStreamLoad" :text="$t('pages.lab.aiBrain.reasoning')" indicator />
              <div v-else style="display: flex; align-items: center">
                <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                <span>{{ $t('pages.lab.aiBrain.reasoned') }}</span>
              </div>
            </template>
            <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
          </t-chat-reasoning>
          <t-chat-loading v-if="active.isStreamLoad && item.content.length === 0" animation="gradient" class="t-chat__text--loading" />
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
            :stop-disabled="active.isStreamLoad"
            :textarea-props="{
              placeholder: $t('pages.lab.aiBrain.placeholder.input'),
            }"
            @send="handleInputEnter"
            @stop="handleInputStop"
          />
        </template>
      </t-chat>
      <t-button v-show="active.isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
        <div class="to-bottom">
          <ArrowDownIcon />
        </div>
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ArrowDownIcon, CheckCircleIcon } from 'tdesign-icons-vue-next';
import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatContent as TChatContent,
  ChatInput as TChatInput,
  ChatItem as TChatItem,
  ChatLoading as TChatLoading,
  ChatReasoning as TChatReasoning,
  ChatSender as TChatSender,
} from '@tdesign-vue-next/chat';

import { t } from '@/locales';
import { fetchAiChat, fetchAiStream, delAiCache, addAiCache, createAiCache, putAiCache } from '@/api/lab';
import { fetchSettingDetail, putSetting } from '@/api/setting';
import { platform as AI_PLATFORM } from '@/config/ai';
import openaiIcon from '@/assets/ai/openai_kimi.png';
import userIcon from '@/assets/ai/user.png';

const AI_MODELS = ref([
  {
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
  },
  {
    label: 'gpt-4o',
    value: 'gpt-4o',
  },
  {
    label: 'gpt-4o-mini',
    value: 'gpt-4o-mini',
  },
]);

const formData = ref({
  config: {
    server: '',
    key: '',
    model: 'gpt-3.5-turbo',
  },
  rawConfig:  {
    server: '',
    key: '',
    model: 'gpt-3.5-turbo',
  },
  result: '',
  prompt: '',
  sessionId: '',
});
const chatRef = useTemplateRef<any>('chatRef');
const active = ref({
  nav: '',
  setting: false,
  loading: false,
  isStreamLoad: false,
  isShowToBottom: false,
  good: false,
  bad: false,
});
const chatList = ref<any[]>([]);
const actionStatus = ref({});
const ctrl = ref();

// 滚动到底部
const backBottom = () => {
  chatRef.value?.scrollToBottom({
    behavior: 'smooth',
  });
};

const handleChatScroll = ({ e }) => {
  const scrollTop = e.target.scrollTop;
  active.value.isShowToBottom = scrollTop < 0;
};

const clearConfirm = async () => {
  chatList.value = [];
  actionStatus.value = {};

  const { sessionId } = formData.value;
  if (sessionId) {
    await delAiCache({ ids: sessionId, metadata: [] });
    formData.value.sessionId = '';
  };
};

onMounted(() => {
  fetchAiConf();
});

const handleOpChange = (type: string) => {
  active.value.nav = '';

  switch (type) {
    case 'setting':
      formData.value.config = cloneDeep(formData.value.rawConfig);
      active.value.setting = true;
      break;
  };
};

const handleOpenUrl = (url: string) => {
  if (!/^(https?:\/\/)/.test(url)) return;
  window.electron.ipcRenderer.send('open-url', url);
};

const handleAiModel = (val: string) => {
  const targetIndex = AI_MODELS.value.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) AI_MODELS.value.push({ value: val, label: val });
};

const onCancel = () => {
  active.value.setting = false;
};

const onSubmit = async () => {
  try {
    await putSetting({ key: "ai", doc: formData.value.config });
    if (formData.value.config.model !== formData.value.rawConfig.model) {
      chatList.value.unshift({
        content: t('pages.lab.aiBrain.chat.modelChange', { model: formData.value.config.model }),
        role: 'model-change',
      });
    };
    formData.value.rawConfig = cloneDeep(formData.value.config);
    MessagePlugin.success(t('pages.setting.data.success'));
    active.value.setting = false;
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const fetchAiConf = async () => {
  const res = await fetchSettingDetail('ai');
  if (res) {
    formData.value.config = res;
    formData.value.rawConfig = res;
    const model = res.model || 'gpt-3.5-turbo';
    handleAiModel(model);
    chatList.value.unshift({
      content: computed(() => t('pages.lab.aiBrain.chat.modelChange', { model })),
      role: 'model-change',
    });
  }
};

const handleInputEnter = async (val: string) => {
  if (!formData.value.config.server || !formData.value.config.key || !formData.value.config.model) {
    MessagePlugin.warning(t('pages.lab.aiBrain.message.aiParmsEmpty'));
    return;
  };
  if (!val) {
    MessagePlugin.warning(t('pages.lab.aiBrain.message.contentEmpty'));
    return;
  };
  if (active.value.isStreamLoad) {
    return;
  };

  chatList.value.unshift({
    // avatar: userIcon,
    content: val,
    role: 'user',
  });

  if (!formData.value.sessionId) {
    const res = await createAiCache();
    formData.value.sessionId = res.id;
  };

  await fetchAiReply(val);
};

const handleInputStop = () => {
  ctrl.value.abort();
  ctrl.value = null;
  active.value.loading = false;
  active.value.isStreamLoad = false;
  if (chatList.value[0].content.length === 0) {
    chatList.value[0].content = "用户已停止内容生成";
  };
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

  try {
    const startTime = Date.now();
    ctrl.value = new AbortController();
    const { config: { model }, sessionId } = formData.value;
    fetchAiStream({
      data: { prompt, model, sessionId },
      ctrl: ctrl.value,
      options: {
        success(result) {
          if (!result) return;
          const lastItem = chatList.value[0];
          lastItem.reasoning += result.delta?.reasoning_content || '';
          lastItem.content += result.delta?.content || '';
        },
        fail(err) {
          const lastItem = chatList.value[0];
          lastItem.role = 'error';
          lastItem.content = err.message;
          lastItem.reasoning = err.message;
          // 显示用时
          lastItem.duration = Math.floor((Date.now() - startTime) / 1000);
          // 控制终止按钮
          active.value.isStreamLoad = false;
          active.value.loading = false;
        },
        complete(isOk, msg) {
          if (!isOk) {
            const lastItem = chatList.value[0];
            lastItem.role = 'error';
            lastItem.content = msg;
            lastItem.reasoning = msg;
          }
          const lastItem = chatList.value[0];
          // 显示用时
          lastItem.duration = Math.floor((Date.now() - startTime) / 1000);
          // 控制终止按钮
          active.value.isStreamLoad = false;
          active.value.loading = false;
        },
      },
    });
  } catch (err: any) {
    console.error(err);
    const lastItem = chatList.value[0];
    lastItem.role = 'error';
    lastItem.content = err.message;
    lastItem.reasoning = err.message;
  }
};

const handleOperation = async (type: string, options: { e: MouseEvent, index: number }) => {
  const { index } = options;
  if (type === 'good') {
    const postion = chatList.value.length - index;
    if (!actionStatus.value[postion]) {
      actionStatus.value[postion] = {
        good: false,
        bad: false,
      };
    }
    actionStatus.value[postion].good = !actionStatus.value[postion].good;
    actionStatus.value[postion].bad = false;
  } else if (type === 'bad') {
    const postion = chatList.value.length - index;
    if (!actionStatus.value[postion]) {
      actionStatus.value[postion] = {
        good: false,
        bad: false,
      };
    }
    actionStatus.value[postion].bad = !actionStatus.value[postion].bad;
    actionStatus.value[postion].good = false;
  } else if (type === 'replay') {
    active.value.isStreamLoad = false;
    active.value.loading = false;

    const userQuery = chatList.value[index + 1].content; // 获取用户输入

    // 删除当前机器回复和用户输入 第一次机器回复 第二次用户输入
    for (let i = 1; i <= 2; i++) {
      chatList.value.shift();
      await delAiCache({ ids: formData.value.sessionId, metadata: [-1] })
    };

    handleInputEnter(userQuery);
  }
};

const RULES = {
  server: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  model: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 36px;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px
      }
    }

    .right-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;
        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
      }
    }
  }

  .content {
    flex: 1;
    width: 100%;
    max-width: 734px;
    margin: 0 auto;
    height: auto;
    overflow: hidden;

    :deep(.t-chat__inner) {
      .t-chat__notice {
        color: var(--td-text-color-secondary);
        background-color: var(--td-bg-content-input-2);
      }
    }

    :deep(.t-chat__text--loading) {
      padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
    }

    :deep(.t-chat__text) {
      .t-chat__text__user, .t-chat__text--user {
        background: var(--td-bg-color-secondarycontainer);
        color: var(--td-text-color-primary);
        border-radius: var(--td-radius-default);
        padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-s);

        pre {
          background-color: transparent;
          color: var(--td-text-color-primary);
        }
      }

      .t-chat__text__assistant, .t-chat__text--assistant {
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
        border-radius: var(--td-radius-default);

        .t-textarea {
          .t-textarea__inner {
            border-radius: var(--td-radius-default);
            background-color: var(--td-bg-content-input-2);

            &:hover {
              box-shadow: none;
            }
          }
        }

        .t-chat__footer__textarea__icon {
          .t-chat__footer__textarea__icon__default {
            border-radius: var(--td-radius-default);
          }
        }
      }

      .t-chat__footer__stopbtn {
        .t-button {
          border-radius: var(--td-radius-default);
          background-color: var(--td-bg-content-input-2);
          // border-color: transparent;
        }
      }

      .chat-action-footer {
        text-align: center;
        font-size: 12px;
        color: var(--td-text-color-secondary);
      }
    }

    .bottomBtn {
      position: absolute;
      left: 50%;
      margin-left: -20px;
      bottom: 200px;
      padding: 0;
      border: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      box-shadow: var(--td-shadow-3);
    }

    .to-bottom {
      width: 40px;
      height: 40px;
      border: 2px solid var(--td-font-white-1);
      box-sizing: border-box;
      background: var(--td-bg-color-container);
      border-radius: 50%;
      font-size: 24px;
      line-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .t-icon {
        font-size: 24px;
      }
    }
  }
}
</style>

<style lang="less">
@import '@/style/theme/index.less';
@import '@/style/layout.less';
</style>