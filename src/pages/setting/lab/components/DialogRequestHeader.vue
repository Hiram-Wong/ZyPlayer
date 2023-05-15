<template>
  <t-dialog v-model:visible="formVisible" header="请求头" placement="center" :footer="false">
    <template #body>
      <div class="class-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea
            v-model="requestHeaderData"
            class="textarea"
            placeholder="请输入请求头,如 User-Agent:MOBILE_UA "
            autofocus
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
          <p class="tip bottom-tip">多个请求头请换行</p>
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

<script setup>
import _ from 'lodash';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: String,
});
const formVisible = ref(false);
const formData = ref(props.data);
const onSubmit = () => {
  console.log(formData.value);
  emit('receiveRequestHeader', formData.value);
  formVisible.value = false;
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};
const emit = defineEmits(['update:visible', 'receiveRequestHeader']);
const requestHeaderData = computed({
  get() {
    if (formData.value) {
      return Object.entries(formData.value)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
    }
    return '';
  },
  set(val) {
    const dict = {};

    val.split('\n').forEach((header) => {
      const [key, value] = header.split(':');
      if (key && value) {
        dict[key.trim()] = value.trim();
      }
    });
    formData.value = dict;
  },
});
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formData.value = props.data;
    formVisible.value = val;
  },
);
watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
);
</script>
<style lang="less" scoped>
@import '@/style/variables.less';

.input-item,
:deep(.t-upload__dragger) {
  width: calc(480px - var(--td-size-1));
}

.input-item-split {
  width: calc(480px - 130px);
}

.input-textarea {
  width: calc(480px - var(--td-size-2)) !important;
}
</style>
