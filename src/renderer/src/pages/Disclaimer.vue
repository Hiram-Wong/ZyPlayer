<template>
  <common-dialog
    v-model:visible="formVisible"
    :close-on-esc-keydown="false"
    :close-on-overlay-click="false"
    destroy-on-close
    :confirm-btn="$t('pages.md.privacyPolicy.confirm')"
    :cancel-btn="$t('pages.md.privacyPolicy.cancel')"
    :on-confirm="confirmDisclaimer"
    :on-close="cancelDisclaimer"
  >
    <template #title>
      <h1>{{ $t('pages.md.privacyPolicy.title') }}</h1>
    </template>
    <template #content>
      <md-render :text="$t('pages.md.privacyPolicy.content')" />
    </template>
  </common-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { t } from '@/locales';
import { putSetting } from '@/api/setting';

import CommonDialog from '@/components/common-setting/note/index.vue';
import MdRender from '@/components/markdown-render/index.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
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

const confirmDisclaimer = () => {
  updateAgreementMask(true);
  formVisible.value = false;
};

const updateAgreementMask = async (status: Boolean) => {
  await putSetting({ key: "agreementMask", doc: status });
};

const cancelDisclaimer = () => {
  updateAgreementMask(false);
  MessagePlugin.warning({ content: t('pages.md.privacyPolicy.quitTip'), duration: 5000 });
  setTimeout(() => {
    window.electron.ipcRenderer.send('quit-app');
  }, 5000);
};
</script>

<style lang="less" scoped></style>
