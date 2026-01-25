<template>
  <div class="req-html">
    <div class="input-group">
      <t-input-adornment class="input">
        <template #prepend>
          <t-select v-model="formData.method" auto-width>
            <t-option v-for="item in reqMethods" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </template>
        <template #append>
          <t-button theme="default" variant="text" size="small" @click="isVisible = true">
            <transform-icon />
          </t-button>
        </template>
        <t-input v-model="formData.url" />
      </t-input-adornment>

      <t-button class="button w-btn" theme="default" @click="handleExec">
        {{ $t('common.execute') }}
      </t-button>
    </div>

    <t-dialog v-model:visible="isVisible" show-in-attached-element :attach="`.${attachContent}`" placement="center">
      <template #header>
        {{ $t('common.request.param') }}
      </template>
      <template #body>
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
        >
          <t-form-item :label="$t('common.encode')" name="encode">
            <t-select v-model="formData.encode" :options="reqEncode" />
          </t-form-item>
          <t-form-item :label="$t('common.request.headers')" name="headers">
            <t-textarea
              v-model="formData.headers"
              :autosize="{ minRows: 2, maxRows: 5 }"
              :placeholder="$t('common.placeholder.request.headers')"
            />
          </t-form-item>
          <t-form-item v-if="formData.method !== 'GET'" :label="$t('common.request.contentType')" name="contentType">
            <t-select v-model="formData.contentType" :options="reqContentTypes" />
          </t-form-item>
          <t-form-item v-if="formData.method !== 'GET'" :label="$t('common.request.data')" name="data">
            <t-textarea
              v-model="formData.data"
              :autosize="{ minRows: 2, maxRows: 5 }"
              :placeholder="$t('common.placeholder.request.data')"
            />
          </t-form-item>
        </t-form>
      </template>
      <template #footer>
        <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
        <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
      </template>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'InputRequest',
});

const props = defineProps({
  modelValue: {
    type: Object as PropType<IReqConfig>,
    default: () => ({
      method: REQ_METHOD.GET,
      url: '',
      encode: REQ_ENCODE.UTF8,
      headers: '',
      contentType: REQ_CONTENT_TYPE.JSON,
      data: '',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'response']);

import { REQ_CONTENT_TYPE, REQ_ENCODE, REQ_METHOD } from '@shared/config/req';
import { TransformIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';
import { t } from '@/locales';

import type { IReqConfig } from './utils';
import { handleReq } from './utils';

export type { IReqConfig } from './utils';
export type { IReqResponse } from '@shared/config/req';

const reqMethods = [
  { label: REQ_METHOD.GET, value: 'GET' },
  { label: REQ_METHOD.POST, value: 'POST' },
  { label: REQ_METHOD.DELETE, value: 'DELETE' },
  { label: REQ_METHOD.PUT, value: 'PUT' },
  { label: REQ_METHOD.HEAD, value: 'HEAD' },
];

const reqEncode = [
  { label: REQ_ENCODE.UTF8, value: REQ_ENCODE.UTF8 },
  { label: REQ_ENCODE.GB2312, value: REQ_ENCODE.GB2312 },
  { label: REQ_ENCODE.GBK, value: REQ_ENCODE.GBK },
  { label: REQ_ENCODE.GB18030, value: REQ_ENCODE.GB18030 },
];

const reqContentTypes = [
  { label: REQ_CONTENT_TYPE.JSON, value: REQ_CONTENT_TYPE.JSON },
  { label: REQ_CONTENT_TYPE.FORM_URLENCODED, value: REQ_CONTENT_TYPE.FORM_URLENCODED },
];

const RULES = {
  encode: [{ required: true, type: 'error' }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const isVisible = ref<boolean>(false);
const formData = ref<IReqConfig>(props.modelValue);

watch(
  () => props.modelValue,
  (val) => (formData.value = val),
  { deep: true },
);
watch(
  () => formData.value,
  (val) => emits('update:modelValue', val),
  { deep: true },
);

const handleExec = async () => {
  try {
    const { url, method, encode, headers, data, contentType } = formData.value;
    const resp = await handleReq({ url, method, encode, headers, data, contentType });
    if (resp?.code === 200) {
      emits('response', resp);
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.error(t('common.fail'));
    }
  } catch (error) {
    console.error('Fetch Request Error:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleSubmit = () => {
  isVisible.value = false;
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.req-html {
  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: var(--td-size-4);

    :first-child {
      flex: 1;
    }

    :deep(.t-input-adornment__append) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .t-button {
        color: var(--td-text-color-secondary);
        border-radius: 0 var(--td-radius-medium) var(--td-radius-medium) 0;

        &:hover {
          color: var(--td-text-color-primary);
          border: 1px solid var(--td-brand-color);
        }
      }
    }
  }
}
</style>
