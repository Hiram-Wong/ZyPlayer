<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
  >
    <template #header>
      {{ $t('pages.setting.dialog.flag') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="60" :requiredMark="false">
        <t-form-item name="flag" label-width="0px">
          <t-tag-input v-model="formData.data" multiple clearable :placeholder="$t('pages.setting.placeholder.enterConfirm')" @change="handleFlagFilter" />
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
import { cloneDeep, uniq } from 'lodash-es';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: [],
  },
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref<Boolean>(false);
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
    formData.value = {
      data: cloneDeep(val),
      raw: cloneDeep(val),
    };
  },
);

const handleFlagFilter = (value: string[]) => {
  formData.value.data = uniq(value);
};

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      emits('submit', 'flag', formData.value.data);
      formVisible.value = false;
    }
  });
};

const onReset: FormProps['onReset'] = () => {
  formData.value.data = [ ...formData.value.raw ];
};

const RULES = {
  // flag: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
