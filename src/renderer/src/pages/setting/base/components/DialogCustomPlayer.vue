<template>
  <div class="custtom-player-dialog-container dialog-container-padding">
    <t-dialog v-model:visible="formVisible" :close-btn="false" :header="false"
      :confirm-btn="$t('pages.md.customPlayer.confirm')" :cancel-btn=null :on-confirm="confirmEvent" placement="center"
      width="480px">
      <template #body>
        <div class="custtom-player">
          <div class="header">{{ $t('pages.md.customPlayer.title') }}</div>
          <div class="main-content">
            <div ref="contentElm" v-html="mdContent" class="content"></div>
          </div>
        </div>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import hljs from "highlight.js";
import MarkdownIt from 'markdown-it';
import { computed, ref, watch } from 'vue';

import { t } from '@/locales';


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const formVisible = ref(false);
const md = new MarkdownIt({
  linkify: true,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return `<pre class="hljs-code-container my-3"><div class="hljs-code-header d-flex align-center justify-space-between bg-grey-darken-3 pa-1"></div><code class="hljs language-${language}">${hljs.highlight(code, { language: language, ignoreIllegals: true }).value}</code></pre>`;
  },
});
const mdContent = computed(() => (md.render(t('pages.md.customPlayer.content'))));
const emit = defineEmits(['update:visible']);

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);

const confirmEvent = () => {
  formVisible.value = false;
}
</script>

<style lang="less" scoped>
.custtom-player-dialog-container {
  :deep(.t-dialog) {
    .t-dialog__footer {
      display: flex;
      justify-content: space-around;
      padding: 0 !important;

      .t-button {
        width: 180px;
        height: 45px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 15px;
        line-height: 45px;
      }
    }
  }

  .custtom-player {
    opacity: 1;

    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
    }

    .main-content {
      height: 280px;
      margin: 15px auto 10px;
      overflow-y: auto;
    }
  }

  :deep(.md-editor-preview-wrapper) {
    padding: 0;

    .md-editor-preview {
      color: var(--td-text-color-primary);

      blockquote {
        margin: 0;
      }

      p,
      li {
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
}
</style>
