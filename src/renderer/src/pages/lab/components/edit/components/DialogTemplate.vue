<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    placement="center"
    destroy-on-close
    lazy
  >
    <template #header>
      {{ $t('pages.lab.edit.nav.template') }}
    </template>
    <template #body>
      <div class="template view-container">
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item name="template" :label="$t('pages.lab.edit.nav.template')">
            <t-select v-model="formData.template" :popup-props="popupProps">
              <t-option v-for="(item, index) in templateFormData" :key="index" :value="item" :label="item" />
            </t-select>
          </t-form-item>
        </t-form>
      </div>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
  template: {
    type: Array,
    default: () => [],
  },
});
const emits = defineEmits(['update:visible', 'submit']);

const RULES = {
  template: [{ required: true }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref(false);
const formData = ref(props.data);
const templateFormData = ref(props.template);

const popupProps = {
  placement: 'bottom',
  attach: '.template',
  overlayInnerStyle: {
    height: '200px',
  },
};

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.data,
  (val) => (formData.value = val),
);
watch(
  () => props.template,
  (val) => (templateFormData.value = val),
);

const handleExecute = () => {
  emits('submit', formData.value);
  formVisible.value = false;
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.view-container {
  padding: 0 var(--td-comp-paddingLR-xxs) var(--td-comp-paddingTB-xxs);
  max-height: 340px;
  overflow-y: auto;

  .data-item {
    margin-bottom: var(--td-comp-margin-xs);

    .tip {
      margin-bottom: var(--td-comp-margin-xs);
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
