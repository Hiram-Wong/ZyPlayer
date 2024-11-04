<template>
  <div class="custtom-player-dialog-container">
    <common-dialog
      v-model:visible="formVisible"
      :confirm-btn=null
      :cancel-btn="$t('pages.md.customPlayer.confirm')"
    >
      <template #title>
        {{ $t('pages.md.customPlayer.title') }}
      </template>
      <template #content>
        <md-render :markdownText="$t('pages.md.customPlayer.content')" />
      </template>
    </common-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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
</script>

<style lang="less" scoped></style>
