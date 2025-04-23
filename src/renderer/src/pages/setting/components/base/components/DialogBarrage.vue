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
      {{ $t('pages.setting.barrage.title') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData.data.data" :rules="RULES" :label-width="60">
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.setting.barrage.base') }}</p>
          <t-form-item :label="$t('pages.setting.barrage.url')" name="url">
            <t-input v-model="formData.data.data.url" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.barrage.id')" name="id">
            <t-input v-model="formData.data.data.id" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.barrage.key')" name="key">
            <t-input v-model="formData.data.data.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.barrage.support')" name="support">
            <t-tag-input v-model="formData.data.data.support" clearable excess-tags-display-type="scroll" :placeholder="$t('pages.setting.placeholder.general')" @change="handleFlagFilter" />
          </t-form-item>
        </div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.setting.barrage.param') }}</p>
          <p class="t-tip mg-b-s">{{ $t('pages.setting.barrage.tip') }}</p>
          <t-space break-line size="small">
            <t-form-item :label="$t('pages.setting.barrage.start')" name="start">
              <t-input-number theme="column" :min="0" v-model="formData.data.data.start" :placeholder="$t('pages.setting.placeholder.general')" />
            </t-form-item>
            <t-form-item :label="$t('pages.setting.barrage.color')" name="color">
              <t-input-number theme="column" :min="0" v-model="formData.data.data.color" :placeholder="$t('pages.setting.placeholder.general')" />
            </t-form-item>
            <t-form-item :label="$t('pages.setting.barrage.mode')" name="mode">
              <t-input-number theme="column" :min="0" v-model="formData.data.data.mode" :placeholder="$t('pages.setting.placeholder.general')" />
            </t-form-item>
            <t-form-item :label="$t('pages.setting.barrage.content')" name="content">
              <t-input-number theme="column" :min="0" v-model="formData.data.data.content" :placeholder="$t('pages.setting.placeholder.general')" />
            </t-form-item>
          </t-space>
        </div>
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
import { cloneDeep, uniq } from 'lodash-es';
import { t } from '@/locales';

defineOptions({
  name: 'SettingBaseDialogBarrage',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: { data: { url: '', id: '', key: '', support: [], start: '', mode: '', color: '', content: ''  },  type: '' },
  },
});
const formVisible = ref(false);
const formData = ref({
  data: cloneDeep(props.data),
  raw: cloneDeep(props.data),
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

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

const handleFlagFilter = (value: string[]) => {
  formData.value.data.support = uniq(value);
};

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
  id: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  support: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  start: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  mode: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  color: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  content: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
