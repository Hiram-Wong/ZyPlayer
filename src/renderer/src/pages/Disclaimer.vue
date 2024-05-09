<template>
  <div class="disclaimer view-container">
    <t-dialog v-model:visible="formVisible" :close-btn="false" :close-on-esc-keydown="false" :header="false"
      :close-on-overlay-click="false" :confirm-btn="$t('pages.md.privacyPolicy.confirm')"
      :cancel-btn="$t('pages.md.privacyPolicy.cancel')" :on-confirm="confirmEvent" :on-close="cancelEvent"
      placement="center" width="480px">
      <div class="privacy-policy">
        <div class="header">{{ $t('pages.md.privacyPolicy.title') }}</div>
        <div class="main-content">
          <MdPreview editorId="privacy-policy" :modelValue="$t('pages.md.privacyPolicy.content')"
            previewTheme="vuepress" :theme="theme" />
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import 'md-editor-v3/lib/style.css';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';
import { MdPreview } from 'md-editor-v3';

import { useSettingStore } from '@/store';
import { setDefault } from '@/api/setting';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const storeSetting = useSettingStore();
const theme = computed(() => {
  return storeSetting.displayMode;
});
const formVisible = ref(false);
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
  updateAgreementMask(true);
  formVisible.value = false;
};

const updateAgreementMask = async (status) => {
  await setDefault("agreementMask", status)
};

const cancelEvent = () => {
  updateAgreementMask(false);
  MessagePlugin.warning({ content: '5秒后自动退出软件', duration: 5000 });
  setTimeout(() => {
    window.electron.ipcRenderer.send('quit-app');
  }, 5000);
};
</script>

<style lang="less" scoped>
.view-container {
  :deep(.t-dialog) {
    .t-dialog__footer {
      display: flex;
      justify-content: space-around;

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

  .privacy-policy {
    opacity: 1;

    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
      color: var(--td-text-color-primary);
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
