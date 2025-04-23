<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
  >
    <template #header>
      {{ $t('pages.setting.ua.title') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData.data" :rules="RULES" :label-width="60"  :requiredMark="false">
        <t-form-item name="data" :label-width="0">
          <t-textarea v-model="formData.data.data" :placeholder="$t('pages.setting.placeholder.general')" :autosize="{ minRows: 2, maxRows: 4 }" @change="handleMatchTag" />
        </t-form-item>
        <t-radio-group v-model="select" variant="default-filled" size="small" class="mg-t" @change="handleChangeSelect">
          <t-radio-button v-for="item in LIST" :key="item.name" :value="item.ua">{{ item.name }}</t-radio-button>
        </t-radio-group>
      </t-form>
    </template>
    <template #footer>
      <t-button variant="outline" @click="onReset">{{ $t('pages.setting.dialog.reset') }}</t-button>
      <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, useTemplateRef } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';

import { t } from '@/locales';
import UA_CONFIG from '@/config/ua';

defineOptions({
  name: 'SettingBaseDialogUA',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: { data: '',  type: '' },
  },
});
const formVisible = ref<Boolean>(false);
const formData = ref({
  data: { data: '',  type: '' },
  raw: { data: '',  type: '' },
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const LIST = reactive([...UA_CONFIG]);
const select = ref('');

const emits = defineEmits(['update:visible', 'submit']);

watch(() => formVisible.value, (val) => emits('update:visible', val));
watch(() => props.visible, (val) => formVisible.value = val);
watch(() => props.data,
  (val) => {
    formData.value = { data: val, raw: val } as any;
    handleMatchTag(val.data);
  },
);

const handleMatchTag = (ua: string) => {
  const index = LIST.findIndex((item) => item.ua === ua);

  if (index === -1) select.value = '';
  else select.value = LIST[index].ua;
};

const handleChangeSelect = (item: string) => {
  formData.value.data.data = item;
};

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      const { data, type } = formData.value.data;
      emits('submit', { data, type });
      window.electron.ipcRenderer.send('update-global', 'ua', data);
      formVisible.value = false;
    }
  });
};

const onReset: FormProps['onReset'] = () => {
  formData.value.data = { ...formData.value.raw };

  handleMatchTag(formData.value.raw.data);
};

const RULES = {
  data: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
