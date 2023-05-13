<template>
  <t-dialog v-model:visible="formVisible" header="编辑源站" :width="680" placement="center" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" colon :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="源站名" name="name">
          <t-input v-model="formData.name" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="类型" name="type">
          <t-radio-group v-model="formData.type">
            <t-radio :value="1">cms</t-radio>
            <t-radio :value="2">drpy</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="API接口" name="api">
          <t-input v-model="formData.api" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="下载接口" name="download">
          <t-input v-model="formData.download" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="解析接口" name="jiexiUrl">
          <t-input v-model="formData.jiexiUrl" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="分组" name="group">
          <t-select
            v-model="formData.group"
            creatable
            filterable
            placeholder="请选择分组"
            class="input-item"
            @create="createOptions"
          >
            <t-option
              v-for="item in formGroup"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              class="select-options"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="源站标识" name="key">
          <t-input v-model="formData.key" placeholder="请输入内容" />
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
import getUuid from 'uuid-by-string';
import { ref, watch } from 'vue';

import { sites } from '@/lib/dexie';

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
  group: {
    type: Object,
    default: () => {
      return [];
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);
const formGroup = ref(props.group);
const onSubmit = ({ result, firstError }) => {
  console.log(result, firstError);
  if (!firstError) {
    if (!formData.value.key) formData.value.key = getUuid(formData.value.name, 5);
    sites
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
const emit = defineEmits(['update:visible', 'refreshTableGroup']);
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
    if (!val) emit('refreshTableGroup');
  },
);
watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
);
watch(
  () => props.group,
  (val) => {
    formGroup.value = val;
  },
);

const createOptions = (val) => {
  const targetIndex = formGroup.value.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) formGroup.value.push({ value: val, label: val });
};

const rules = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  api: [{ required: true, message: '请输入Api接口url', type: 'error' }],
  type: [{ required: true, message: ' 请选择类型', type: 'error' }],
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
</style>
