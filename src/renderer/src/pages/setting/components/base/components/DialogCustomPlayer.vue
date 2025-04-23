<template>
  <common-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :footer="false"
    :confirm-btn=null
    :cancel-btn="$t('pages.md.customPlayer.confirm')"
  >
    <template #title>
      <h1>{{ $t('pages.md.customPlayer.title') }}</h1>
    </template>
    <template #content>
      <md-render :text="$t('pages.md.customPlayer.content')" />
    </template>
  </common-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import CommonDialog from '@/components/common-setting/note/index.vue';
import MdRender from '@/components/markdown-render/index.vue';

defineOptions({
  name: 'SettingBaseDialogCustomPlayer',
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
</script>

<style lang="less" scoped></style>
