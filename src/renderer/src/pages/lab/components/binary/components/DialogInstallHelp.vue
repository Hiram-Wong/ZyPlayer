<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    placement="center"
    destroy-on-close
    lazy
    :footer="null"
  >
    <template #header>
      {{ $t('pages.md.binaryHelp.title') }}
    </template>
    <template #body>
      <div class="content-overflow">
        <div class="content-tips">
          <render-md :text="$t('pages.md.binaryHelp.content')" />
        </div>
      </div>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SettingBaseDialogLiveEpg',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:visible']);
import { ref, watch } from 'vue';

import RenderMd from '@/components/render-markdown/index.vue';
import { attachContent } from '@/config/global';

const formVisible = ref(false);

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
<style lang="less" scoped>
.content-overflow {
  position: relative;

  .content-tips {
    max-height: 340px;
    overflow: hidden auto;
    position: relative;
  }
}
</style>
