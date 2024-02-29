<template>
  <t-dialog v-model:visible="formVisible" header="标识" placement="center" :footer="false">
    <template #body>
      <div class="class-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea
            v-model="flagData"
            class="textarea"
            placeholder="请输入过滤关键词,逗号分隔"
            autofocus
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
          <p class="tip bottom-tip">分隔符请使用英文状态下","</p>
          <div class="optios">
            <t-form-item style="float: right; margin: ">
              <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
              <t-button theme="primary" type="submit">确定</t-button>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';

import { setDefault } from '@/api/setting';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => {
      return [];
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);

const onSubmit = async() => {
  try {
    await setDefault("analyzeFlag", formData.value)
    MessagePlugin.success('修改成功');
    formVisible.value = false;
  } catch (err) {
    console.log('Errors: ', err);
    MessagePlugin.error(`修改失败, 错误信息:${err}`);
  }
};

const flagData = computed({
  get() {
    return _.join(
      (formData.value || []).filter((p) => p !== ''),
      ',',
    );
  },
  set(val) {
    formData.value = _.split(val, ',').filter((p) => p !== '');
  },
});

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

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
</style>
