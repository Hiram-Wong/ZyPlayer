<template>
  <t-dialog v-model:visible="formVisible" header="添加" :width="650" placement="center" :footer="false">
    <template #body>
      <t-form :data="formData" :rules="rulesSingle" :label-width="60" @submit="onSubmit">
        <t-form-item label="名称" name="name">
          <t-input v-model="formData.name" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="配置" name="url">
          <t-space direction="vertical">
            <t-space>
              <t-radio-group v-model="formData.type">
                <t-radio value="remote">远程链接</t-radio>
                <t-radio value="local">本地文件</t-radio>
                <t-radio value="batches">批量频道</t-radio>
              </t-radio-group>
            </t-space>
            <t-space>
              <t-input
                v-if="formData.type !== 'batches'"
                v-model="formData.url"
                class="input-item"
                :class="formData.type === 'local' ? 'input-item-split' : ''"
                placeholder="请输入内容"
              />
              <t-upload
                v-if="formData.type === 'local'"
                class="upload-item"
                theme="file"
                accept="audio/mpegurl"
                auto-upload
                :max="1"
                :allow-upload-duplicate-file="true"
                :show-upload-progress="false"
                :request-method="requestMethod"
              />
              <t-textarea
                v-if="formData.type === 'batches'"
                v-model="formData.url"
                class="input-item input-textarea"
                :placeholder="'M3u格式示例:\n#EXTM3U\n#EXTINF:-1,Channel\nhttps://channel-url\n\ngenre格式示例\nChannel,https://channel-url'"
                :autosize="{ minRows: 7, maxRows: 7 }"
              />
            </t-space>
          </t-space>
        </t-form-item>
        <t-form-item label="节目单" name="epg">
          <t-input v-model="formData.epg" class="input-item" placeholder="请输入内容" />
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

import { addIptvItem } from '@/api/iptv';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const formVisible = ref(false);
const formData = reactive({
  name: '',
  url: '',
  epg: '',
  type: 'remote',
  isActive: true
});
const onSubmit = async() => {
  try {
    const res = await addIptvItem(formData);
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
  name: [{ required: true, message: '请输入直播源名', type: 'error' }],
  url: [{ required: true, message: '请输入直播源订阅url', type: 'error' }],
};
const requestMethod = (file) => {
  return new Promise((resolve) => {
    // file.percent 用于控制上传进度，如果不希望显示上传进度，则不对 file.percent 设置值即可。
    // 如果代码规范不能设置 file.percent，也可以设置 files
    file.percent = 0;
    const timer = setTimeout(() => {
      // resolve 参数为关键代码
      resolve({ status: 'success', response: { url: file.name, address: file.raw.path } });
      formData.url = file.raw.path;
      file.percent = 100;
      clearTimeout(timer);
    }, 1000);
  });
};
</script>
<style lang="less" scoped>
.input-item,
:deep(.t-upload__dragger) {
  width: calc(518px - var(--td-size-1));
}

.upload-item {
  :deep(.t-button--variant-outline) {
    background-color: var(--td-bg-input) !important;
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
