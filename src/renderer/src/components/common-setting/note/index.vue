<template>
  <t-dialog v-model:visible="formVisible" v-bind="attrsCustom" class="common-dialog">
    <template #body>
      <div class="container">
        <div class="header">
          <slot name="title"></slot>
        </div>
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, useAttrs } from 'vue';

import { t } from '@/locales';

const attrs = useAttrs();

defineOptions({
  inheritAttrs: false
});
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  }
});
const attrsCustom = computed(() => {
  return {
    closeBtn: false,
    header: false,
    confirmBtn: t('pages.setting.dialog.confirm'),
    cancelBtn: t('pages.setting.dialog.cancel'),
    placement: "center",
    width: "480px",
    ...attrs
  }
});
const formVisible = ref(false);
const emit = defineEmits(['update:visible', 'cancel', 'confirm']);

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
</script>

<style lang="less" scoped>

.container {
  opacity: 1;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-5);

  :deep(.header) {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    span {
      font-weight: 700;
      font-size: 28px;
      line-height: 28px;
      text-align: center;
      color: var(--td-text-color-primary);
    }
  }

  .content {
    max-height: 340px;
    padding: 0 var(--td-comp-paddingLR-xs);
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
