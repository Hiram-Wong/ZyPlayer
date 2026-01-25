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
      {{ $t('common.install') }}
    </template>
    <template #body>
      <div class="install view-container">
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
          <div class="data-item">
            <p class="title title-label">{{ $t('common.stepNum', [1]) }}</p>
            <p class="tip">{{ $t('pages.plugin.install.tip.file') }}</p>
            <t-button block class="mg-b-s" @click="handleGoDir">
              {{ $t('pages.plugin.install.goDir') }}
            </t-button>
          </div>
          <div class="data-item">
            <p class="title title-label">{{ $t('common.stepNum', [2]) }}</p>
            <p class="tip">{{ $t('pages.plugin.install.tip.input') }}</p>
            <t-form-item name="pluginName" label-width="0px">
              <t-select v-model="formData.id" :options="pluginList" clearable @focus="onInputFocus"></t-select>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.cancel') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.install') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';
import { delimiter } from '@/utils/systeminfo';

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
  id: [{ required: true }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref(false);
const formData = ref(props.data);
const formType = ref(props.type);
const pluginList = ref([]);

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

const handleGoDir = async () => {
  const path = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PATH_USER, 'plugin');
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.OPEN_PATH, path);
};

const getPluginDir = async () => {
  const path = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PATH_USER, 'plugin');
  const dirs = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_DIR_READ, path);
  const filtered = dirs
    .filter((item: string) => item.endsWith(delimiter) && item !== `${path}${delimiter}`)
    .map((item: string) => {
      const pathList = item.split(delimiter);
      const path = pathList[pathList.length - 2];
      return path;
    });
  pluginList.value = filtered.map((item: string) => ({ label: item, value: item }));
};

const onInputFocus = () => {
  getPluginDir();
};

const handleExecute = () => {
  emits('submit', 'table', { id: [formData.value.id] });
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

  .data-item {
    margin-bottom: var(--td-comp-margin-xs);

    .tip {
      margin-bottom: var(--td-comp-margin-xs);
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
