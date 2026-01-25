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
      {{ formType === 'add' ? $t('common.add') : $t('common.edit') }}
    </template>
    <template #body>
      <div class="form view-container">
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item :label="$t('common.name')" name="name">
            <t-input v-model="formData.name" />
          </t-form-item>
          <t-form-item :label="$t('common.id')" name="key">
            <div class="input-horizontal-item">
              <t-input v-model="formData.key" style="flex: 1" />
              <t-button theme="default" @click="randomKeyEvent">{{ $t('common.random') }}</t-button>
            </div>
          </t-form-item>
          <t-form-item :label="$t('common.type')" name="type">
            <t-radio-group v-model="formData.type" variant="default-filled">
              <t-radio-button :value="ANALYZE_TYPE.WEB">{{ $t('pages.parse.field.apiMap.web') }}</t-radio-button>
              <t-radio-button :value="ANALYZE_TYPE.JSON">{{ $t('pages.parse.field.apiMap.json') }}</t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('common.api')" name="api">
            <t-input v-model="formData.api" />
          </t-form-item>
          <t-form-item :label="$t('common.flag')" name="flag">
            <t-tag-input
              v-model="formData.flag"
              :placeholder="$t('common.placeholder.inputTag')"
              @change="handleFlagFilter"
            />
          </t-form-item>
          <t-form-item v-if="formData.type === 1" :label="$t('pages.parse.field.script')" name="script">
            <t-textarea
              v-model="formData.script"
              :placeholder="$t('common.placeholder.inputEg', ['document.querySelector(\'.play\').click()'])"
              :autosize="{ minRows: 3, maxRows: 3 }"
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
import { ANALYZE_TYPE } from '@shared/config/parse';
import { randomUUID } from '@shared/modules/crypto';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
  type: {
    type: String,
    default: 'add',
  },
});
const emits = defineEmits(['update:visible', 'submit']);

const RULES = {
  name: [{ required: true }],
  key: [{ required: true }],
  type: [{ required: true }],
  api: [{ required: true }, { api: { protocols: ['http', 'https'], require_protocol: true } }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref(false);
const formData = ref(props.data);
const formType = ref(props.type);

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
watch(
  () => props.type,
  (val) => (formType.value = val),
);

const randomKeyEvent = () => {
  formData.value.key = randomUUID();
};

const handleExecute = () => {
  if (formData.value.type !== 'json') {
    formData.value.exec = '';
  }

  emits('submit', 'table', formData.value);
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

const handleFlagFilter = (array: string[]) => {
  formData.value.flag = [...new Set(array)];
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

  .input-horizontal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--td-size-4);
    width: 100%;
  }

  .input-vertical-item {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
}
</style>
