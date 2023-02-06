<template>
  <t-dialog v-model:visible="formVisible" header="默认解析接口" :width="680" :footer="false">
    <template #body>
      <t-form ref="form" colon :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="解析接口" name="defaultParseURL">
          <t-textarea v-model="formData.defaultParseURL" placeholder="请输入解析接口url" autofocus />
        </t-form-item>
        <t-form-item style="float: right">
          <t-space>
            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
            <t-button theme="primary" type="submit">确定</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { setting } from '@/lib/dexie';

// Get parent component pass-through
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

// Define form data & dialog status
const formVisible = ref(false);
const formData = ref({});

// watch data change
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
    getSetting();
  },
);

// Form rules
const rules = {
  defaultParseURL: [{ required: true, message: '请输入接口url', type: 'error' }],
};

// Business Processing
const updateSettingEvent = () => {
  setting.update(formData.value);
};
const getSetting = () => {
  setting.find().then((res) => {
    formData.value.defaultParseURL = res.defaultParseURL;
  });
};
onMounted(() => {
  getSetting();
});
const onSubmit = ({ result, firstError }) => {
  if (!firstError) {
    formData.value.defaultParseURL = formData.value.defaultParseURL?.trim(); // 处理空格
    updateSettingEvent();
    MessagePlugin.success('提交成功');
    formVisible.value = false;
  } else {
    console.log('Errors: ', result);
    MessagePlugin.warning(firstError);
  }
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>
<style lang="less" scoped></style>
