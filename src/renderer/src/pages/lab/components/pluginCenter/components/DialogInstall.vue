<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
  >
    <template #header>
      {{ $t('pages.lab.pluginCenter.control.install') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="60">
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}1</p>
          <p class="tip">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip1') }}</p>
          <t-button block @click="handleGoDir">{{ $t('pages.lab.pluginCenter.installDialog.goDir') }}</t-button>
        </div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}2</p>
          <p class="tip">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip2') }}</p>
          <t-form-item name="pluginName" label-width="0px" :requiredMark="false">
            <t-input v-model="formData.pluginName" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
          </t-form-item>
        </div>
      </t-form>
      {{ loading }}
    </template>
    <template #footer>
      <t-button variant="outline" @click="onCancel">{{ $t('pages.setting.dialog.cancel') }}</t-button>
      <t-button theme="primary" @click="onSubmit" v-model:loading="loading">{{ $t('pages.setting.dialog.install') }}</t-button>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref<Boolean>(false);
const formData = ref({
  pluginName: '',
});
const loading = ref<Boolean>(props.loading);
const emits = defineEmits(['update:visible', 'submit']);

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
watch(
  () => props.loading,
  (val) => {
    loading.value = val;
  },
);

const handleGoDir = () => {
  emits('submit', 'file', {});
};

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      emits('submit', 'install', { ...formData.value });
    }
  });
};

const onCancel = () => {
  formVisible.value = false;
};

const RULES = {
  pluginName: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
