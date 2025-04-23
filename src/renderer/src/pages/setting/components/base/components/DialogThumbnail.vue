<template>
  <common-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :confirm-btn="$t('pages.md.thumbanilFfmpeg.confirm')"
    :cancel-btn="$t('pages.md.thumbanilFfmpeg.cancel')"
    :on-confirm="dialogCheckFfmpeg"
  >
    <template #title>
      <h1>{{ $t('pages.md.thumbanilFfmpeg.title') }}</h1>
    </template>
    <template #content>
      <md-render :text="$t('pages.md.thumbanilFfmpeg.content')" />
    </template>
  </common-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { t } from '@/locales';

import CommonDialog from '@/components/common-setting/note/index.vue';
import MdRender from '@/components/markdown-render/index.vue';

defineOptions({
  name: 'SettingBaseDialogThumbnail',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const formVisible = ref(false);
const emits = defineEmits(['update:visible']);

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);

const dialogCheckFfmpeg = () => {
  window.electron.ipcRenderer.invoke('ffmpeg-installed-check').then(status => {
    if (status) MessagePlugin.success(t('pages.setting.thumbanilFfmpeg.haveFfmpeg'));
    else MessagePlugin.error(t('pages.setting.thumbanilFfmpeg.noFfmpeg'));
  });
};
</script>

<style lang="less" scoped></style>
