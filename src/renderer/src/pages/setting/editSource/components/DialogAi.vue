<template>
  <t-dialog v-model:visible="formVisible" :closeOnOverlayClick="false" :width="650"
    :header="$t('pages.setting.editSource.source.dialog.ai.title')" placement="center" :footer="false">
    <template #body>
      <div class="ai-dialog">
        <p class="ai-item">{{ $t('pages.setting.editSource.source.dialog.ai.declare') }}</p>
        <div class="ai-item">
          <t-collapse>
            <t-collapse-panel :header="$t('pages.setting.editSource.source.dialog.ai.parms')">
              <template #headerRightContent>
                <t-button size="small" shape="round" @click.stop="saveAi">{{
                  $t('pages.setting.editSource.source.dialog.ai.save') }}</t-button>
              </template>
              <div class="fetch-key-content">
                <t-space>
                  <t-link theme="primary" underline href="https://platform.openai.com/api-keys" target="_blank">
                    1.{{ $t('pages.setting.editSource.source.dialog.ai.tip1') }}
                  </t-link>
                  <t-link theme="primary" underline href="https://github.com/chatanywhere/GPT_API_free" target="_blank">
                    2.{{ $t('pages.setting.editSource.source.dialog.ai.tip2') }}
                  </t-link>
                </t-space>
              </div>
              <div class="parms-bar">
                <t-input :label="$t('pages.setting.editSource.source.dialog.ai.server')"
                  v-model="formData.config.server" class="input-item"></t-input>
                <t-input :label="$t('pages.setting.editSource.source.dialog.ai.key')" v-model="formData.config.key"
                  class="input-item" type="password"></t-input>
                <t-select :label="$t('pages.setting.editSource.source.dialog.ai.model')" creatable filterable
                  @create="createModel" v-model="formData.config.model">
                  <t-option v-for="item in models" :key="item.label" :value="item.value" :label="item.label" />
                </t-select>
              </div>
            </t-collapse-panel>
          </t-collapse>
        </div>
        <div class="ai-item instructionLibrary">
          <span class="ai-label">{{ $t('pages.setting.editSource.source.dialog.ai.instructionLibrary') }}</span>
          <t-radio-group variant="default-filled" size="small" v-model="formData.aiType" style="margin-bottom: 0;">
            <t-radio-button value="qa">{{ $t('pages.setting.editSource.source.dialog.ai.qa') }}</t-radio-button>
            <t-radio-button value="filter">{{ $t('pages.setting.editSource.source.dialog.ai.filter') }}</t-radio-button>
            <t-radio-button value="cssSelector">{{ $t('pages.setting.editSource.source.dialog.ai.cssSelector')
              }}</t-radio-button>
          </t-radio-group>
        </div>
        <div class="ai-item codeSnippet" v-if="formData.aiType !== 'qa'">
          <!-- <span class="ai-label">{{ $t('pages.setting.editSource.source.dialog.ai.codeSnippet') }}</span> -->
          <t-textarea v-model="formData.codeSnippet" :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="$t('pages.setting.editSource.source.dialog.ai.codeSnippetTip')"></t-textarea>
        </div>
        <div class="ai-item demand">
          <t-textarea v-model="formData.demand" class="textarea" :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="$t('pages.setting.editSource.source.dialog.ai.fetchTip')"></t-textarea>
          <t-button :loading="isVisible.loading" size="small" shape="round" class="send" @click="AiAnswerEvent()">
            {{ $t('pages.setting.editSource.source.dialog.ai.fetch') }}
          </t-button>
        </div>
        <div class="ai-item result" v-if="formData.result && !isVisible.loading">
          <t-card :title="$t('pages.setting.editSource.source.dialog.ai.result')">
            <div ref="contentElm" v-html="formData.contentHtml" class="chat-msg-content pa-3"></div>
            <template #actions>
              <t-button size="small" shape="round" @click.stop="copyAiAnswer">{{
                $t('pages.setting.editSource.source.dialog.ai.copy') }}</t-button>
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
const models = reactive([
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

const createModel = (val) => {
  const targetIndex = models.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) models.push({ value: val, label: val });
};

const fetchAi = async () => {
  const res = await fetchSettingDetail('ai');
  formData.value.config = res.value;
  createModel(res.value?.model || 'gpt-3.5-turbo');
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
      await nextTick();
      MessagePlugin.success(t('pages.setting.data.success'));
    } else {
      formData.value.result = response.msg;
      MessagePlugin.error(`${t('pages.setting.data.fail')}: ${response.msg}`);
    }
  } catch (err) {
    formData.value.result = err as string;
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err}`);
  } finally {
    formData.value.contentHtml = md.render(formData.value.result);
    isVisible.loading = false;
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
.parms-bar {
  height: auto;

  .input-item {
    margin-bottom: var(--td-comp-margin-s);
  }

  .input-item:last-child {
    margin-bottom: 0;
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
  margin-bottom: var(--td-comp-margin-s);
}

.hljs-code-container {
  border-radius: 3px;
  overflow: hidden;
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
</style>
