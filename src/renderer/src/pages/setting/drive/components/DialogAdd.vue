<template>
  <t-dialog v-model:visible="formVisible" header="添加" :width="650" placement="center" :footer="false">
    <template #body>
      <t-form :data="formData" :rules="rulesSingle" :label-width="60" @submit="onSubmit">
        <t-form-item label="名称" name="name">
          <t-input v-model="formData.name" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="地址" name="server">
          <t-input
            v-model="formData.server"
            class="input-item"
            placeholder="请输入内容"
          />
        </t-form-item>
        <t-form-item label="起始" name="startPage">
          <t-input
            v-model="formData.startPage"
            class="input-item"
            placeholder="请输入起始页路径, 如/home/"
          />
        </t-form-item>
        <!-- <t-form-item label="搜索" name="search">
          <t-switch v-model="formData.search"/>
        </t-form-item> -->
        <!-- <t-form-item label="请求头" name="headers">
          <t-textarea
            v-model="formData.headers"
            class="input-item input-textarea"
            :placeholder="`{\n\tAuthorization: ''\n}`"
            :autosize="{ minRows: 3, maxRows: 3 }"
          />
        </t-form-item> -->
        <t-form-item label="加密" name="params">
          <t-textarea
            v-model="formData.params"
            class="input-item input-textarea"
            :placeholder='`{\n\t"路径": { "password": "密码" }\n}`'
            :autosize="{ minRows: 3, maxRows: 3 }"
          />
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

import { addDriveItem } from '@/api/drive';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const formVisible = ref(false);
const formData = reactive({
  name: '',
  server: '',
  startPage: '',
  search: false,
  headers: null,
  params: null,
  isActive: true
});
const onSubmit = async() => {
  try {
    const res = await addDriveItem(formData);
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
const rulesSingle = {
  name: [{ required: true, message: '请输入内容', type: 'error' }],
  server: [{ required: true, message: '请输入内容', type: 'error' }],
};
</script>
<style lang="less" scoped>
.input-item,
:deep(.t-upload__dragger) {
  width: calc(518px - var(--td-size-1));
}

.upload-item {
  :deep(.t-button--variant-outline) {
    background-color: var(--td-bg-content-input) !important;
    border-color: transparent;
  }
}

.input-item-split {
  width: calc(518px - 130px);
}

.input-textarea {
  width: calc(518px - var(--td-size-2)) !important;
}
</style>
