<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dialog.add')" :width="650" placement="center"
    :footer="false">
    <template #body>
      <t-form :data="formData" :rules="rules" :label-width="60" @submit="onSubmit">
        <t-form-item :label="$t('pages.setting.analyze.name')" name="name">
          <t-input v-model="formData.name" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.type')" name="type">
          <t-radio-group v-model="formData.type">
            <t-radio :value="0">web</t-radio>
            <t-radio :value="1">json</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.api')" name="url">
          <t-input v-model="formData.url" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">{{ $t('pages.setting.dialog.cancel') }}</t-button>
            <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch } from 'vue';

import { t } from '@/locales';
import { addAnalyzeItem } from '@/api/analyze';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  }
});
const formVisible = ref(false);
const formData = reactive({
  name: '',
  url: '',
  type: 0,
  isActive: true,
});
const emit = defineEmits(['update:visible', 'addTableData']);

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

const onSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    const res = await addAnalyzeItem(formData);
    MessagePlugin.success(t('pages.setting.form.success'));
    if (res) emit('addTableData', res);
    formVisible.value = false;
  } else {
    console.log('Validate Errors: ', firstError, validateResult);
    MessagePlugin.warning(`${t('pages.setting.form.fail')}: ${firstError}`);
  }
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};

const rules = {
  name: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  type: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped></style>
