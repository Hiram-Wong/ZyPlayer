<template>
  <t-dialog
    v-model:visible="formVisible"
    header="编辑解析源"
    :width="680"
    placement="center"
    :footer="false"
    class="dialog-edit"
  >
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" colon :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="接口名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="解析接口" name="url">
          <t-input v-model="formData.url" placeholder="请输入内容" />
        </t-form-item>

        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
            <t-button theme="primary" type="submit">确定</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { analyze } from '@/lib/dexie';

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
const onSubmit = ({ result, firstError }) => {
  if (!firstError) {
    analyze
      .update(formData.value.id, formData.value)
      .then(() => {
        MessagePlugin.success('修改成功！');
      })
      .catch((err) => {
        MessagePlugin.error(`修改失败, 错误信息:${err}`);
      });
    formVisible.value = false;
  } else {
    console.log('Errors: ', result);
    MessagePlugin.warning(firstError);
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
  url: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
</style>
