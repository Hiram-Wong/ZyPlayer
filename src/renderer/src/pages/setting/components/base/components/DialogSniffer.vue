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
      {{ $t('pages.setting.sniffer.title') }}
    </template>
    <template #body>
      <div class="sniffer view-container">
        <t-form
          ref="formRef"
          :data="formData.data"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item :label="$t('common.type')" name="type">
            <t-radio-group v-model="formData.data.type" variant="default-filled">
              <t-radio-button :value="SNIFFER_TYPE.CDP">
                {{ $t('pages.setting.sniffer.typeMap.puppeteer') }}
              </t-radio-button>
              <t-radio-button :value="SNIFFER_TYPE.CUSTOM">
                {{ $t('pages.setting.sniffer.typeMap.thirdParty') }}
              </t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item v-if="formData.data.type === SNIFFER_TYPE.CUSTOM" :label="$t('common.api')" name="url">
            <t-input v-model="formData.data.url" clearable />
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
  name: 'SettingBaseDialogSniffer',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({ data: { type: '', url: '' } }),
  },
});
const emits = defineEmits(['update:visible', 'submit']);

import { SNIFFER_TYPE } from '@shared/config/setting';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';

const RULES = {
  url: [{ required: true }, { url: { protocols: ['http', 'https'], require_protocol: true } }],
  type: [{ required: true }],
};
const TYPE = 'sniffer';

const formVisible = ref<boolean>(false);
const formData = ref(props.data);
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

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
  (val) => (formData.value = val),
);

const handleExecute = () => {
  if (formData.value.data.type !== SNIFFER_TYPE.CUSTOM) {
    formData.value.data.url = '';
  }

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
