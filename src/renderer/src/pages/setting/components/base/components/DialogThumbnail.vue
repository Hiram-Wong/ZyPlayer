<template>
  <div class="thumbnail-dialog-container">
    <common-dialog
      v-model:visible="formVisible"
      :confirm-btn="$t('pages.md.thumbanilFfmpeg.confirm')"
      :cancel-btn="$t('pages.md.thumbanilFfmpeg.cancel')"
      :on-confirm="dialogCheckFfmpeg"
    >
      <template #title>
        {{ $t('pages.md.thumbanilFfmpeg.title') }}
      </template>
      <template #content>
        <md-render :markdownText="$t('pages.md.thumbanilFfmpeg.content')" />
      </template>
    </common-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { t } from '@/locales';

import CommonDialog from '@/components/common-setting/note/index.vue';
import MdRender from '@/components/markdown-render/index.vue';

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
