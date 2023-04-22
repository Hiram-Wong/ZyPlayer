<template>
  <t-dialog v-model:visible="formVisible" header="编辑源站" :width="680" placement="center" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" colon :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="源站名" name="name">
          <t-input v-model="formData.name" placeholder="请输入内容" />
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
          <t-select v-model="formData.group" placeholder="请选择分组" :style="{ width: '514px' }">
            <t-option v-for="item in formGroup" :key="item.value" :value="item.value" :label="item.label"></t-option>
            <template #panelBottomContent>
              <div class="select-panel-footer">
                <t-button v-if="editOrCreate === 'create'" theme="primary" variant="text" block @click="onAdd"
                  >新增选项</t-button
                >
                <div v-else>
                  <t-input v-model="newOption" autofocus></t-input>
                  <t-button size="small" style="margin: 8px 0 0" @click="onAddConfirm"> 确认 </t-button>
                  <t-button theme="default" size="small" style="margin: 8px 0 0 8px" @click="onAddCancel">
                    取消
                  </t-button>
                </div>
              </div>
            </template>
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
const editOrCreate = ref('create');
const newOption = ref('');
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
    newOption.value = '';
    // if (!val) emit('refreshTableGroup');
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
const rules = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  api: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};
const onAdd = () => {
  editOrCreate.value = 'edit';
};
const onAddConfirm = () => {
  formGroup.value.push({ value: newOption, label: newOption });
  editOrCreate.value = 'create';
};
const onAddCancel = () => {
  editOrCreate.value = 'create';
  newOption.value = '';
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
.select-panel-footer {
  border-top: 1px solid var(--td-component-stroke);
  padding: 10px 5px;
}
</style>
