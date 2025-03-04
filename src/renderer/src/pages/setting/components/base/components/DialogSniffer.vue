<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
  >
    <template #header>
      {{ $t('pages.setting.sniffer.title') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData.data.data" :rules="RULES" :label-width="60">
        <t-form-item :label="$t('pages.setting.sniffer.type')" name="type">
          <t-radio-group variant="default-filled" v-model="formData.data.data.type">
            <t-radio-button value="pie">{{ $t('pages.setting.sniffer.pie.sign') }}</t-radio-button>
            <t-radio-button value="custom">{{ $t('pages.setting.sniffer.other.sign') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.sniffer.url')" name="url" v-if="formData.data.data.type === 'custom'">
          <t-input v-model="formData.data.data.url" :placeholder="$t('pages.setting.placeholder.general')" />
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
import { ref, watch, useTemplateRef } from 'vue';
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
    default: { data: '', type: '' },
  },
});

const formVisible = ref<Boolean>(false);
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formData = ref({
  data: cloneDeep(props.data),
  raw: cloneDeep(props.data),
});

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
    formData.value = { data: cloneDeep(val), raw: cloneDeep(val) };
  },
);

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      const { data, type } = formData.value.data;
      emits('submit', { data, type });
      formVisible.value = false;
    }
  });
};

const onReset: FormProps['onReset'] = () => {
  formData.value.data = { ...formData.value.raw };
};

const RULES = {
  url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  type: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
