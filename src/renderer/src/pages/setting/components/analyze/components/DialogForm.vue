<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
  >
    <template #header>
      {{ formType === 'add' ? $t('pages.setting.dialog.add') : $t('pages.setting.dialog.edit') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData.data" :rules="RULES" :label-width="60">
        <t-form-item :label="$t('pages.setting.analyze.name')" name="name">
          <t-input v-model="formData.data.name" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.type')" name="type">
          <t-radio-group v-model="formData.data.type" variant="default-filled" >
            <t-radio-button :value="0">{{ $t('pages.setting.analyze.apiWeb') }}</t-radio-button>
            <t-radio-button :value="1">{{ $t('pages.setting.analyze.apiJson') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.api')" name="url">
          <t-input v-model="formData.data.url" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
      </t-form>
    </template>
    <template #footer>
      <t-button variant="outline" @click="onReset">{{ $t('pages.setting.dialog.reset') }}</t-button>
      <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { cloneDeep } from 'lodash-es';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {},
  },
  type: {
    type: String,
    default: 'add'
  },
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref<Boolean>(false);
const formData = ref({
  data: cloneDeep(props.data),
  raw: cloneDeep(props.data),
});
const formType = ref<string>(props.type);

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
  () => props.data,
  (val) => {
    formData.value = {
      data: cloneDeep(val),
      raw: cloneDeep(val),
    };
  },
);
watch(
  () => props.type,
  (val) => {
    formType.value = val;
  },
);

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      emits('submit', 'table', formData.value.data);
      formVisible.value = false;
    }
  });
};

const onReset: FormProps['onReset'] = () => {
  formData.value.data = { ...formData.value.raw };
};

const RULES = {
  name: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  type: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
