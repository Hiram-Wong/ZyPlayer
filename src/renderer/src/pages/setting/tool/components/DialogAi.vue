<template>
  <t-dialog v-model:visible="formVisible" :closeOnOverlayClick="false" :width="650"
    :header="$t('pages.setting.editSource.dialog.ai.title')" placement="center" :footer="false">
    <template #body>
      <div class="ai-dialog">
        <p class="ai-item">{{ $t('pages.setting.editSource.dialog.ai.declare') }}</p>
        <div class="ai-item">
          <t-collapse>
            <t-collapse-panel :header="$t('pages.setting.editSource.dialog.ai.parms')">
              <template #headerRightContent>
                <t-button size="small" shape="round" @click.stop="saveAi">{{
                  $t('pages.setting.editSource.dialog.ai.save') }}</t-button>
              </template>
              <div class="fetch-key-content">
                <t-space>
                  <div>
                    <span>1.</span>
                    <t-link theme="primary" underline href="https://platform.openai.com/api-keys" target="_blank">
                      {{ $t('pages.setting.editSource.dialog.ai.tip1') }}
                    </t-link>
                  </div>
                  <div>
                    <span>2.</span>
                    <t-link theme="primary" underline href="https://github.com/chatanywhere/GPT_API_free"
                      target="_blank">
                      {{ $t('pages.setting.editSource.dialog.ai.tip2') }}
                    </t-link>
                  </div>
                </t-space>
              </div>
              <div class="code-bar">
                <div class="item server">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.dialog.ai.server') }}</span>
                  <t-input v-model="formData.config.server"></t-input>
                </div>

                <div class="item key">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.dialog.ai.key') }}</span>
                  <t-input v-model="formData.config.key" type="password"></t-input>
                </div>

                <div class="item model">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.dialog.ai.model') }}</span>
                  <t-select v-model="formData.config.model" auto-width>
                    <t-option v-for="item in models" :key="item.label" :value="item.label" :label="item.label" />
                  </t-select>
                </div>
              </div>
            </t-collapse-panel>
          </t-collapse>
        </div>
        <div class="ai-item instructionLibrary">
          <span class="ai-label">{{ $t('pages.setting.editSource.dialog.ai.instructionLibrary') }}</span>
          <t-radio-group variant="default-filled" size="small" v-model="formData.aiType" style="margin-bottom: 0;">
            <t-radio-button value="qa">{{ $t('pages.setting.editSource.dialog.ai.qa') }}</t-radio-button>
            <t-radio-button value="filter">{{ $t('pages.setting.editSource.dialog.ai.filter') }}</t-radio-button>
            <t-radio-button value="cssSelector">{{ $t('pages.setting.editSource.dialog.ai.cssSelector')
              }}</t-radio-button>
          </t-radio-group>
        </div>
        <div class="ai-item codeSnippet" v-if="formData.aiType !== 'qa'">
          <!-- <span class="ai-label">{{ $t('pages.setting.editSource.dialog.ai.codeSnippet') }}</span> -->
          <t-textarea v-model="formData.codeSnippet" :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="$t('pages.setting.editSource.dialog.ai.codeSnippetTip')"></t-textarea>
        </div>
        <div class="ai-item demand">
          <t-textarea v-model="formData.demand" class="textarea" :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="$t('pages.setting.editSource.dialog.ai.fetchTip')"></t-textarea>
          <t-button :loading="isVisible.loading" size="small" shape="round" class="send" @click="AiAnswerEvent()">
            {{ $t('pages.setting.editSource.dialog.ai.fetch') }}
          </t-button>
        </div>
        <div class="ai-item result" v-if="formData.result && !isVisible.loading">
          <t-card :title="$t('pages.setting.editSource.dialog.ai.result')">
            <div ref="contentElm" v-html="formData.contentHtml" class="chat-msg-content pa-3"></div>
            <template #actions>
              <t-button size="small" shape="round" @click.stop="copyAiAnswer">{{
                $t('pages.setting.editSource.dialog.ai.copy') }}</t-button>
            </template>
          </t-card>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from "json5";
import hljs from "highlight.js";
import MarkdownIt from 'markdown-it';
import mathjax3 from 'markdown-it-mathjax3';

import { t } from '@/locales';
import { fetchAiAnswer } from '@/api/lab';
import { fetchSettingDetail, updateSetting } from '@/api/setting';
import { copyToClipboardApi } from '@/utils/tool';

import 'highlight.js/styles/panda-syntax-dark.css';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  }
});

const formVisible = ref(false);
const models = [
  {
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
  },
  {
    label: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
  },
  {
    label: 'gpt-3.5-turbo-1106',
    value: 'gpt-3.5-turbo-1106',
  },
  {
    label: 'gpt-3.5-turbo-0125',
    value: 'gpt-3.5-turbo-0125',
  },
  {
    label: 'gpt-4',
    value: 'gpt-4',
  },
  {
    label: 'gpt-4-32k',
    value: 'gpt-4-32k',
  },
  {
    label: 'gpt-4-1106-preview',
    value: 'gpt-4-1106-preview',
  },
  {
    label: 'gpt-4-0125-preview',
    value: 'gpt-4-0125-preview',
  },
  {
    label: 'gpt-4-turbo-preview',
    value: 'gpt-4-turbo-preview',
  },
  {
    label: 'gpt-4-vision-preview',
    value: 'gpt-4-vision-preview',
  },
];
const formData = ref({
  aiType: 'qa',
  config: {
    server: 'https://api.chatanywhere.tech',
    key: 'sk-PSdjGmy6NLidwP3ng17PivJ6OXFRK960r4IiboatlG5r9vBL',
    model: 'gpt-3.5-turbo',
  },
  codeSnippet: '',
  demand: '',
  result: '',
  contentHtml: ''
})
const isVisible = reactive({
  loading: false
})

const emit = defineEmits(['update:visible']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  }
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) fetchAi();
  },
);

const md = new MarkdownIt({
  linkify: true,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return `<pre class="hljs-code-container my-3"><div class="hljs-code-header d-flex align-center justify-space-between bg-grey-darken-3 pa-1"></div><code class="hljs language-${language}">${hljs.highlight(code, { language: language, ignoreIllegals: true }).value}</code></pre>`;
  },
});
md.use(mathjax3);

const fetchAi = async () => {
  const res = await fetchSettingDetail('ai');
  formData.value.config = res.value;
};

const saveAi = async () => {
  try {
    await updateSetting({ ai: formData.value.config });
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const AiAnswerEvent = async () => {
  try {
    isVisible.loading = true;
    const doc = {
      type: formData.value.aiType,
      codeSnippet: formData.value.codeSnippet,
      demand: formData.value.demand,
    };
    const response = await fetchAiAnswer(doc);
    if (response.code === 200) {
      let content = response.data;
      try {
        const toObj = JSON5.parse(JSON5.stringify(content));
        if (toObj && typeof toObj === 'object') {
          content = JSON5.stringify(content);
        }
      } catch (e) { }
      formData.value.result = content;
      formData.value.contentHtml = md.render(content);
      await nextTick();
      MessagePlugin.success(t('pages.setting.data.success'));
    } else {
      MessagePlugin.error(`${t('pages.setting.data.fail')}:${response.message}`);
    }
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  } finally {
    isVisible.loading = false;
  }
}

const copyAiAnswer = async () => {
  try {
    await copyToClipboardApi(formData.value.result);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
}
</script>

<style lang="less" scoped>
.code-bar {
  height: auto;

  .item {
    display: flex;
    flex-direction: row;
    align-items: center;

    .codebox-label {
      display: inline-block;
      width: 100px;
      white-space: nowrap;
      margin: var(--td-comp-margin-s) var(--td-comp-margin-l);
    }

    :deep(.t-input) {
      background-color: var(--td-bg-content-input) !important;
      border-color: transparent;
    }
  }
}

:deep(.t-collapse) {
  background-color: var(--td-bg-content-input);
  border-color: transparent;
  border-radius: var(--td-radius-default);

  .t-collapse-panel__header,
  .t-collapse-panel__body {
    border-color: transparent;
  }

  .t-collapse-panel__header {
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-l);
  }

  .t-collapse-panel__body {
    border-radius: var(--td-radius-default);
    margin-bottom: var(--td-comp-margin-xxs);

    .t-collapse-panel__content {
      padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-xxs);
    }
  }
}

.ai-dialog {
  .ai-item {
    margin-bottom: var(--td-comp-margin-xs);
  }

  .demand {
    position: relative;

    .textarea {
      :deep(textarea) {
        padding: calc(calc(var(--td-comp-size-m) - var(--td-line-height-body-medium)) / 2) calc(var(--td-comp-paddingLR-l) + 29px) calc(calc(var(--td-comp-size-m) - var(--td-line-height-body-medium)) / 2) var(--td-comp-paddingLR-s) !important;
      }
    }

    .send {
      position: absolute;
      right: calc(var(--td-comp-paddingLR-l) + 1px);
      bottom: 6px;
    }
  }

  .instructionLibrary {
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: flex-start;

    .ai-label {
      font-size: 12px;
      margin-right: var(--td-comp-margin-s);
    }
  }
}

.fetch-key-content {
  padding: 0 var(--td-comp-paddingLR-l);
}

.hljs-code-container {
  border-radius: 3px;
  overflow: hidden;
}

:deep(.t-card--bordered) {
  border-color: transparent;
  background-color: var(--td-bg-content-input);
}

:deep(.t-card__header) {
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-xs);
}

:deep(.t-card__body) {
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-l);
}
</style>
