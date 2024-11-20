<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="formType === 'add' ? $t('pages.setting.dialog.add') : $t('pages.setting.dialog.edit')"
    :width="650"
    placement="center"
    :footer="false"
    @close="onClose"
  >
    <template #body>
      <t-form ref="form" :data="formData.data" :rules="RULES" :label-width="60" @submit="onSubmit" @reset="onReset">
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

        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" type="reset">{{ $t('pages.setting.dialog.reset') }}</t-button>
            <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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
const formVisible = ref(false);
const formData = ref({
  data: { ...props.data },
  raw: { ...props.data },
});
const formType = ref(props.type);

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
      data: { ...val },
      raw: { ...val },
    };
  },
);
watch(
  () => props.type,
  (val) => {
    formType.value = val;
  },
);

const onSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    emits('submit', 'table', formData.value.data);
    formVisible.value = false;
  };
};

const onReset = () => {
  formData.value.data = { ...formData.value.raw };
};

const onClose = () => {
  onReset();
};

const RULES = {
  name: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  type: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
