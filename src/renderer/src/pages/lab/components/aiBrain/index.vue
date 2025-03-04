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
                <template v-for="item in AI_PLATFORMS">
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
      <t-chat ref="chatRef" :clear-history="chatList.length > 0 && !active.streamLoad" @clear="clearConfirm">
        <template v-for="(item, index) in chatList" :key="index">
          <t-chat-item
            :avatar="item.avatar"
            :role="item.role"
            :content="item.content"
            :text-loading="index === 0 && active.loading"
          >
          <template v-if="!active.streamLoad" #actions>
            <t-chat-action
              :is-good="actionStatus[chatList.length - index]?.good"
              :is-bad="actionStatus[chatList.length - index]?.bad"
              :content="item.content"
              @operation="(type: string, { e }) => handleOperation(type, { e, index })"
            />
          </template>
          </t-chat-item>
        </template>
        <template #footer>
          <t-chat-input
            :placeholder="$t('pages.lab.aiBrain.placeholder.send')"
            :stop-disabled="active.streamLoad"
            @send="handleInputEnter"
          />
          <div class="chat-action-footer">{{ $t('pages.lab.aiBrain.declare') }}</div>
        </template>
      </t-chat>
    </div>
  </div>
</template>
<script setup lang="ts">
import clone from 'lodash/clone';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatContent as TChatContent,
  ChatInput as TChatInput,
  ChatItem as TChatItem,
} from '@tdesign-vue-next/chat';

import { t } from '@/locales';
import { fetchAiAnswer } from '@/api/lab';
import { fetchSettingDetail, putSetting } from '@/api/setting';
import openaiIcon from '@/assets/ai/openai.png';
import userIcon from '@/assets/ai/user.png';
import '@/style/theme/index.less'; // 必须后引入, 不然样式冲突


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

const AI_PLATFORMS = computed(() => {
  return [
    {
      id: 'openai',
      name: t('pages.lab.aiBrain.platform.openai'),
      url: 'https://platform.openai.com/api-keys',
    },
    {
      id: 'deepseek',
      name: t('pages.lab.aiBrain.platform.deepseek'),
      url: 'https://platform.deepseek.com/api_keys',
    },
    {
      id: 'kimi',
      name: t('pages.lab.aiBrain.platform.kimi'),
      url: 'https://platform.moonshot.cn/console/api-keys',
    },
    {
      id: 'free',
      name: t('pages.lab.aiBrain.platform.free'),
      url: 'https://github.com/chatanywhere/GPT_API_free',
    },
  ]
});

const formData = ref({
  aiType: 'qa',
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
  codeSnippet: '',
  demand: '',
  result: '',
  contentHtml: ''
});
const chatRef = useTemplateRef('chatRef');
const active = ref({
  nav: '',
  setting: false,
  loading: false,
  streamLoad: false,
  good: false,
  bad: false,
});
const chatList = ref<any[]>([]);
const actionStatus = ref({});

// 滚动到底部
const backBottom = () => {
  if (!chatRef.value) return;
  // @ts-ignore
  chatRef.value.scrollToBottom({
    behavior: 'smooth',
  });
};

const clearConfirm = async () => {
  chatList.value = [];
  actionStatus.value = {};
};

onMounted(() => {
  fetchAiConf();
});

const handleOpChange = (type: string) => {
  active.value.nav = '';

  switch (type) {
    case 'setting':
      formData.value.config = clone(formData.value.rawConfig);
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
    }
    formData.value.rawConfig = clone(formData.value.config);
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
  if (!val) {
    MessagePlugin.warning(t('pages.lab.aiBrain.message.contentEmpty'));
    return;
  };
  if (!formData.value.config.server || !formData.value.config.key || !formData.value.config.model) {
    MessagePlugin.warning(t('pages.lab.aiBrain.message.aiParmsEmpty'));
    return;
  };
  if (active.value.streamLoad) {
    return;
  }

  chatList.value.unshift({
    avatar: userIcon,
    content: val,
    role: 'user',
  });

  const response = await fetchAiReply(val);
  if (response instanceof Error) {
    chatList.value.unshift({
      avatar: openaiIcon,
      content: response.message,
      role: 'error',
    })
  } else {
    chatList.value.unshift({
      avatar: openaiIcon,
      content: response,
      role: 'assistant',
    });
  }
}

const fetchAiReply = async (command: string) => {
  active.value.loading = true;
  active.value.streamLoad = true;
  let response;
  try {
    const doc = {
      type: formData.value.aiType,
      codeSnippet: formData.value.codeSnippet,
      demand: command,
    };
    response = await fetchAiAnswer(doc);
  } catch (err: any) {
    response = err;
  } finally {
    active.value.loading = false;
    active.value.streamLoad = false;
    return response;
  }
};

const handleOperation = (type: string, options: { e: MouseEvent, index: number }) => {
  console.log('handleOperation', type, options);
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
    const userQuery = chatList.value[index + 1].content; // 获取用户输入
    // delete chatList.value[index + 1]; // 删除机器回复
    // delete chatList.value[index]; // 删除用户输入

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

    :deep(.t-chat__text) {
      .t-chat__text__user {
        pre {
          background-color: transparent;
          color: var(--td-text-color-primary);
        }
      }

      .t-chat__text__assistant {
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
  }
}
</style>
