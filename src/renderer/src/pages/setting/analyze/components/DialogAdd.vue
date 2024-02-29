<template>
  <t-dialog v-model:visible="formVisible" header="添加" :width="650" placement="center" :footer="false">
    <template #body>
      <t-form
        :data="formData"
        :rules="rulesSingle"
        :label-width="60"
        @submit="onSubmit"
      >
        <t-form-item label="名称" name="name">
          <t-input v-model="formData.name" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="接口" name="url">
          <t-input v-model="formData.url" class="input-item" placeholder="请输入内容" />
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

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch } from 'vue';

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
  isActive: true,
});

const emit = defineEmits(['update:visible', 'refreshTableData']);
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

const onSubmit = async() => {
  try {
    const res = await addAnalyzeItem(formData);
    MessagePlugin.success('添加成功');
    if (res) emit('refreshTableData');
    formVisible.value = false;
  } catch (error) {
    MessagePlugin.error(`添加失败: ${error}`);
  }
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};

// 表单校验
const rulesSingle = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  url: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};
</script>

<style lang="less" scoped>
</style>
