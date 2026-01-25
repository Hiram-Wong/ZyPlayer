<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    placement="center"
    destroy-on-close
    lazy
  >
    <template #header>
      {{ $t('pages.setting.dns.title') }}
    </template>
    <template #body>
      <div class="dns view-container">
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="0"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item :style="{ marginBottom: 'var(--td-comp-margin-s)' }">
            <t-radio-group v-model="select" variant="default-filled" @change="handleChangeSelect">
              <t-radio-button v-for="item in LIST" :key="item.name" :value="item.value">{{ item.name }}</t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('common.content')" name="data">
            <t-textarea
              v-model="formData.data"
              :placeholder="$t('common.placeholder.input')"
              :autosize="{ minRows: 4, maxRows: 4 }"
              @change="handleMatchTag"
            />
          </t-form-item>
        </t-form>
      </div>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SettingBaseDialogDns',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({ data: '' }),
  },
});
const emits = defineEmits(['update:visible', 'submit']);

import { DNS } from '@shared/config/dns';
import { cloneDeep } from 'es-toolkit';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';

const LIST = [
  { name: 'Tencent', value: DNS.TENCENT },
  { name: 'Ali', value: DNS.ALI },
  { name: 'Qihoo', value: DNS.QIHOO },
  { name: 'Cloudflare', value: DNS.CLOUDFLARE },
  { name: 'OpenDNS', value: DNS.OPENDNS },
  { name: 'Google', value: DNS.GOOGLE },
];
const TYPE = 'dns';
const RULES = {
  data: [{ url: { protocols: ['http', 'https'], require_protocol: true } }],
};

const formVisible = ref<boolean>(false);
const formData = ref(cloneDeep(props.data));
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const select = ref<string>('');

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.data,
  (val) => (formData.value = cloneDeep(val)),
);
watch(
  () => formData.value.data,
  (val) => handleMatchTag(val),
);

const handleMatchTag = (value: string) => {
  const index = LIST.findIndex((item) => item.value === value);

  if (index === -1) select.value = '';
  else select.value = LIST[index].value;
};

const handleChangeSelect = (item: string) => {
  formData.value.data = item;
};

const handleExecute = () => {
  emits('submit', TYPE, formData.value.data);
  formVisible.value = false;
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.view-container {
  padding: 0 var(--td-comp-paddingLR-xxs) var(--td-comp-paddingTB-xxs);
  max-height: 340px;
  overflow-y: auto;
}
</style>
