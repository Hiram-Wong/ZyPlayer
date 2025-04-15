<template>
  <div class="ai-brain view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.aiBrain') }}</h3>
      </div>
      <div class="right-operation-container"></div>
    </div>
    <div class="content">
      <p class="ai-item">{{ $t('pages.lab.aiBrain.declare') }}</p>
      <div class="ai-item">
        <t-collapse>
          <t-collapse-panel :header="$t('pages.lab.aiBrain.params')">
            <template #headerRightContent>
              <t-space>
                <t-link theme="primary" underline href="https://platform.openai.com/api-keys" target="_blank">
                  1.{{ $t('pages.lab.aiBrain.tip1') }}
                </t-link>
                <t-link theme="primary" underline href="https://github.com/chatanywhere/GPT_API_free" target="_blank">
                  2.{{ $t('pages.lab.aiBrain.tip2') }}
                </t-link>
              </t-space>
            </template>
            <div class="parms-bar">
              <t-input
                v-model="formData.config.server"
                :label="$t('pages.lab.aiBrain.server')"
                class="input-item"
              />
              <t-input
                :label="$t('pages.lab.aiBrain.key')"
                v-model="formData.config.key"
                class="input-item"
                type="password"
              />
              <t-select
                v-model="formData.config.model"
                :label="$t('pages.lab.aiBrain.model')"
                creatable
                filterable
                @create="createModel"
              >
                <t-option v-for="item in AI_MODELS" :key="item.label" :value="item.value" :label="item.label" />
              </t-select>
              <t-button block class="input-item" style="margin-top: var(--td-comp-margin-s);" @click.stop="saveAi">
                {{ $t('pages.lab.aiBrain.save') }}
              </t-button>
            </div>
          </t-collapse-panel>
        </t-collapse>
      </div>
      <div class="ai-item command-library">
        <span class="ai-label">{{ $t('pages.lab.aiBrain.instructionLibrary') }}</span>
        <t-radio-group variant="default-filled" v-model="formData.aiType" style="margin-bottom: 0;">
          <t-radio-button value="qa">
            {{ $t('pages.lab.aiBrain.qa') }}
          </t-radio-button>
          <t-radio-button value="filter">
            {{ $t('pages.lab.aiBrain.filter') }}
          </t-radio-button>
          <t-radio-button value="cssSelector">
            {{ $t('pages.lab.aiBrain.cssSelector') }}
          </t-radio-button>
        </t-radio-group>
      </div>
      <div class="ai-item demand">
        <t-textarea
          v-model="formData.demand"
          class="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          :placeholder="$t('pages.lab.aiBrain.fetchTip')"
        />
      </div>
      <div class="ai-item codeSnippet" v-if="formData.aiType !== 'qa'">
        <t-textarea
          v-model="formData.codeSnippet"
          class="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          :placeholder="$t('pages.lab.aiBrain.codeSnippetTip')"
        />
      </div>
      <div class="ai-item demand">
        <t-button
          :loading="active.loading"
          block
          class="send"
          @click="AiAnswerEvent()"
        >
          {{ $t('pages.lab.aiBrain.fetch') }}
        </t-button>
      </div>
      <div class="ai-item result" v-if="formData.result && !active.loading">
        <t-card :title="$t('pages.lab.aiBrain.result')">
          <md-render :text="formData.contentHtml" class="chat-msg-content pa-3" />
          <template #actions>
            <t-button size="small" shape="round" @click.stop="copyAiAnswer">{{
              $t('pages.lab.aiBrain.copy') }}</t-button>
          </template>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from "json5";

import { t } from '@/locales';
import { fetchAiChat } from '@/api/lab';
import { fetchSettingDetail, putSetting } from '@/api/setting';
import { copyToClipboardApi } from '@/utils/tool';

import MdRender from '@/components/markdown-render/index.vue';

const AI_MODELS = [
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
];
const formData = ref({
  aiType: 'qa',
  config: {
    server: '',
    key: '',
    model: 'gpt-3.5-turbo',
  },
  codeSnippet: '',
  demand: '',
  result: '',
  contentHtml: ''
});
const active = ref({
  loading: false
});

onMounted(() => {
  fetchAi();
});

const createModel = (val) => {
  const targetIndex = AI_MODELS.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) AI_MODELS.push({ value: val, label: val });
};

const fetchAi = async () => {
  const res = await fetchSettingDetail('ai');
  if (res) {
    formData.value.config = res;
    createModel(res.model || 'gpt-3.5-turbo');
  }
};

const saveAi = async () => {
  try {
    await putSetting({ key: "ai", doc: formData.value.config });
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const AiAnswerEvent = async () => {
  try {
    active.value.loading = true;
    if (!formData.value.demand) {
      MessagePlugin.warning(t('pages.lab.aiBrain.message.contentEmpty'));
      return;
    };
    if (!formData.value.config.server || !formData.value.config.key || !formData.value.config.model) {
      MessagePlugin.warning(t('pages.lab.aiBrain.message.aiParmsEmpty'));
      return;
    };
    const doc = {
      type: formData.value.aiType,
      codeSnippet: formData.value.codeSnippet,
      demand: formData.value.demand,
    };
    const response = await fetchAiChat(doc);
    let content = response;
    try {
      const toObj = JSON5.parse(JSON5.stringify(content));
      if (toObj && typeof toObj === 'object') {
        content = JSON5.stringify(content);
      }
    } catch (err) {}
    formData.value.result = content;
    await nextTick();
  } catch (err: any) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  } finally {
    formData.value.contentHtml = formData.value.result;
    active.value.loading = false;
  }
};

const copyAiAnswer = async () => {
  try {
    await copyToClipboardApi(formData.value.result);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
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
    height: 100%;
    display: flex;
    grid-gap: var(--td-comp-margin-s);
    flex-direction: column;

    .ai-item {
      margin-bottom: var(--td-comp-margin-xs);
    }

    .parms-bar {
      height: auto;

      .input-item {
        margin-bottom: var(--td-comp-margin-s);
      }

      .input-item:last-child {
        margin-bottom: 0;
      }
    }

    .textarea {
      :deep(textarea) {
        border-color: transparent;
        background-color: var(--td-bg-content-input-2);
        border-radius: var(--td-radius-medium);
      }
    }

    .command-library {
      display: flex;
      flex-direction: row;
      align-content: center;
      align-items: center;
      justify-content: flex-start;

      .ai-label {
        font: var(--td-font-link-medium);
        margin-right: var(--td-comp-margin-s);
      }
    }
  }
}

:deep(.chat-msg-content) {
  a {
    pointer-events: none;
    cursor: not-allowed;
    color: var(--td-brand-color);
  }
}

:deep(.t-card--bordered) {
  border-color: transparent;
  background-color: var(--td-bg-content-input-2);
}

:deep(.t-card__header) {
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-xs);
}

:deep(.t-card__body) {
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-l);
}

:deep(.markdown-custom) {
  pre {
    background-color: var(--td-bg-color-secondarycontainer-active);
  }
}
</style>
