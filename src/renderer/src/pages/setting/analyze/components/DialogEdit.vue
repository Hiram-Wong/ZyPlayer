<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dialog.edit')" :width="650" placement="center"
    :footer="false" class="dialog-edit">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" :data="formData" :rules="rules" :label-width="60" @submit="onSubmit">
        <t-form-item :label="$t('pages.setting.analyze.name')" name="name">
          <t-input v-model="formData.name" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.type')" name="type">
          <t-radio-group v-model="formData.type">
            <t-radio :value="0">web</t-radio>
            <t-radio :value="1">json</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.analyze.api')" name="url">
          <t-input v-model="formData.url" :placeholder="$t('pages.setting.placeholder.general')" />
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
import { ref, watch } from 'vue';

import { updateAnalyzeItem } from '@/api/analyze';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);

const onSubmit = async () => {
  try {
    await updateAnalyzeItem(formData.value.id, formData.value)
    MessagePlugin.success('修改成功');
    formVisible.value = false;
  } catch (err) {
    console.log('Errors: ', err);
    MessagePlugin.error(`修改失败, 错误信息:${err}`);
  }
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};
const emit = defineEmits(['update:visible']);
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
watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
);

// 表单校验
const rules = {
  name: [{ required: true, message: '请输入接口名称', type: 'error' }],
  type: [{ required: true, message: '请选择类型', type: 'error' }],
  url: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};
</script>
<style lang="less" scoped></style>
