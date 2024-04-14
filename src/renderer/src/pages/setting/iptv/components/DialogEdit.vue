<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dialog.edit')" :width="650" placement="center" :footer="false">
    <template #body>
      <t-form :data="formData" :rules="rules" :label-width="60" @submit="onSubmit">
        <t-form-item :label="$t('pages.setting.iptv.name')" name="name">
          <t-input v-model="formData.name" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.iptv.config')" name="url">
          <t-space direction="vertical">
            <t-space>
              <t-radio-group v-model="formData.type">
                <t-radio value="remote">{{ $t('pages.setting.table.iptv.remote') }}</t-radio>
                <t-radio value="local">{{ $t('pages.setting.table.iptv.local') }}</t-radio>
                <t-radio value="batches">{{ $t('pages.setting.table.iptv.manual') }}</t-radio>
              </t-radio-group>
            </t-space>
            <t-space>
              <t-input
                v-if="formData.type !== 'batches'"
                v-model="formData.url"
                class="input-item"
                :class="formData.type === 'local' ? 'input-item-split' : ''"
                :placeholder="$t('pages.setting.placeholder.general')"
              />
              <t-upload
                v-if="formData.type === 'local'"
                class="upload-item"
                v-model="file"
                theme="file"
                accept="audio/mpegurl;text/plain"
                auto-upload
                :max="1"
                :allow-upload-duplicate-file="true"
                :show-upload-progress="false"
                :request-method="requestMethod"
              >
                <t-button theme="primary" style="width: 110px;">
                  <template #icon>
                    <cloud-upload-icon />
                  </template>
                  {{ $t('pages.setting.iptv.upload') }}
                </t-button>
              </t-upload>
              <t-textarea
                v-if="formData.type === 'batches'"
                v-model="formData.url"
                class="input-item input-textarea"
                :placeholder="$t('pages.setting.placeholder.manualTip')"
                :autosize="{ minRows: 7, maxRows: 7 }"
              />
            </t-space>
          </t-space>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.iptv.epg')" name="epg">
          <t-input v-model="formData.epg" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">{{ $t('pages.setting.dialog.cancel') }}</t-button>
            <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { CloudUploadIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';

import { updateIptvItem } from '@/api/iptv';

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
const onSubmit = async() => {
  try {
    await updateIptvItem(formData.value.id, formData.value);
    MessagePlugin.success('修改成功');
    formVisible.value = false;
  } catch (err) {
    console.log('Errors: ', err);
    MessagePlugin.error(`修改失败, 错误信息:${err}`);
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
  name: [{ required: true, message: '请输入内容', type: 'error' }],
  url: [{ required: true, message: '请输入内容', type: 'error' }],
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
