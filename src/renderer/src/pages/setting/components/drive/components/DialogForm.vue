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
        <t-form-item :label="$t('pages.setting.drive.name')" name="name">
          <t-input v-model="formData.data.name" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <div class="key-group">
          <t-form-item :label="$t('pages.setting.site.key')" name="key" style="flex: 1">
            <t-input v-model="formData.data.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-button theme="default" @click="randomKeyEvent">{{ $t('pages.setting.random') }}</t-button>
        </div>
        <t-form-item :label="$t('pages.setting.drive.server')" name="server">
          <t-input v-model="formData.data.server" class="input-item"
            :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.drive.showAll')" name="showAll">
          <t-radio-group v-model="formData.data.showAll" variant="default-filled" >
            <t-radio-button :value="true">{{ $t('pages.setting.drive.all') }}</t-radio-button>
            <t-radio-button :value="false">{{ $t('pages.setting.drive.video') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.drive.startPage')" name="startPage">
          <t-input v-model="formData.data.startPage" class="input-item"
            :placeholder="$t('pages.setting.placeholder.startPage')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.drive.params')" name="params">
          <t-textarea v-model="formData.data.params" class="input-item input-textarea" :placeholder="tip"
            :autosize="{ minRows: 3, maxRows: 3 }" />
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
import { computed, ref, useTemplateRef, watch } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { v4 as uuidv4 } from 'uuid';
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
const tip = computed(() => {
  return `{\n\t"${t('pages.setting.placeholder.paramsPath')}": { "password": "${t('pages.setting.placeholder.paramsPasswd')}" }\n}`
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
watch(
  () => props.type,
  (val) => {
    formType.value = val;
  },
);

const randomKeyEvent = () => {
  formData.value.data.key = uuidv4();
};

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
  key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  server: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  showAll: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped>
.key-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--td-comp-margin-m);
  gap: 10px;
  align-items: center;
}
</style>
