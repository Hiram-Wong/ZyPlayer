<template>
  <t-dialog v-model:visible="formVisible" header="编辑直播源" :width="646" placement="center" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" colon :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="直播源名" name="name">
          <t-input v-model="formData.name" placeholder="请输入内容" />
        </t-form-item>
        <!-- <t-form-item label="订阅地址" name="url">
          <t-input v-model="formData.url" placeholder="请输入内容" />
        </t-form-item> -->
        <t-form-item label="订阅配置" name="url">
          <t-space direction="vertical">
            <t-space>
              <t-radio-group v-model="formData.type">
                <t-radio value="remote">远程m3u链接</t-radio>
                <t-radio value="local">本地m3u文件</t-radio>
              </t-radio-group>
            </t-space>
            <t-space>
              <t-input
                v-model="formData.url"
                class="input-item"
                :class="formData.type === 'local' ? 'input-item-split' : ''"
                placeholder="请输入内容"
              />
              <t-upload
                v-if="formData.type === 'local'"
                v-model="file"
                theme="file"
                accept="audio/mpegurl"
                auto-upload
                :max="1"
                :allow-upload-duplicate-file="true"
                :show-upload-progress="false"
                :request-method="requestMethod"
              />
            </t-space>
          </t-space>
        </t-form-item>
        <t-form-item label="节目单地址" name="epg">
          <t-input v-model="formData.epg" placeholder="请输入内容" />
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

import { iptv } from '@/lib/dexie';

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
const file = ref([]);
const formVisible = ref(false);
const formData = ref(props.data);
const onSubmit = ({ result, firstError }) => {
  console.log(result, firstError);
  if (!firstError) {
    iptv
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
const rules = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  url: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};

const requestMethod = (file) => {
  return new Promise((resolve) => {
    // file.percent 用于控制上传进度，如果不希望显示上传进度，则不对 file.percent 设置值即可。
    // 如果代码规范不能设置 file.percent，也可以设置 files
    file.percent = 0;
    const timer = setTimeout(() => {
      // resolve 参数为关键代码
      resolve({ status: 'success', response: { url: file.name, address: file.raw.path } });
      if (formData.value.type === 'local') formData.value.url = file.raw.path;
      file.percent = 100;
      clearTimeout(timer);
    }, 1000);
  });
};
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
</style>
