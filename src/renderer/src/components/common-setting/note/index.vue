<template>
  <div class="common-dialog">
    <t-dialog
      v-model:visible="formVisible"
      v-bind="attrsCustom"
    >
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
  </div>
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
.common-dialog {
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

  .container {
    opacity: 1;

    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
      color: var(--td-text-color-primary);
    }

    .content {
      height: 220px;
      margin: var(--td-comp-margin-xxl) auto var(--td-comp-margin-l);
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }
}
</style>
