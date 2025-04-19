<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
  >
    <template #header>
      {{ formType === 'add' ? $t('pages.setting.dialog.add') : $t('pages.setting.dialog.edit') }}
    </template>
    <template #body>
      <t-form ref="formRef" :data="formData.data" :rules="RULES" :label-width="60">
        <t-form-item :label="$t('pages.setting.iptv.name')" name="name">
          <t-input v-model="formData.data.name" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <div class="key-group">
          <t-form-item :label="$t('pages.setting.site.key')" name="key" style="flex: 1">
            <t-input v-model="formData.data.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-button theme="default" @click="randomKeyEvent">{{ $t('pages.setting.random') }}</t-button>
        </div>
        <t-form-item :label="$t('pages.setting.iptv.config')" name="url">
          <div class="input-vertical-item">
            <t-radio-group v-model="formData.data.type" variant="default-filled" >
              <t-radio-button value="remote">{{ $t('pages.setting.iptv.apiRemote') }}</t-radio-button>
              <t-radio-button value="local">{{ $t('pages.setting.iptv.apiLocal') }}</t-radio-button>
              <t-radio-button value="manual">{{ $t('pages.setting.iptv.apiManual') }}</t-radio-button>
            </t-radio-group>
            <div class="input-horizontal-item">
              <t-input v-if="formData.data.type !== 'manual'" v-model="formData.data.url" class="input-item" style="flex: 1" :placeholder="$t('pages.setting.placeholder.general')" />
              <t-button v-if="formData.data.type === 'local'" class="upload-item" theme="default" @click="uploadFileEvent">
                {{ $t('pages.setting.upload') }}
              </t-button>
              <t-textarea v-if="formData.data.type === 'manual'" v-model="formData.data.url" class="input-item input-textarea"
                :placeholder="$t('pages.setting.placeholder.manualTip')" :autosize="{ minRows: 7, maxRows: 7 }" />
            </div>
          </div>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.iptv.logo')" name="logo">
          <t-input v-model="formData.data.logo" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.iptv.epg')" name="epg">
          <t-input v-model="formData.data.epg" class="input-item" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
      </t-form>
    </template>
    <template #footer>
      <t-button variant="outline" @click="onReset">{{ $t('pages.setting.dialog.reset') }}</t-button>
      <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash-es';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {},
  },
  type: {
    type: String,
    default: 'add'
  },
});
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref<Boolean>(false);
const formData = ref({
  data: cloneDeep(props.data),
  raw: cloneDeep(props.data),
});
const formType = ref<string>(props.type);

const emits = defineEmits(['update:visible', 'submit']);

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
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
    formData.value = {
      data: cloneDeep(val),
      raw: cloneDeep(val),
    };
  },
);
watch(
  () => props.type,
  (val) => {
    formType.value = val;
  },
);

const randomKeyEvent = () => {
  formData.value.data.key = uuidv4();
};

const onSubmit: FormProps['onSubmit'] = async () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      emits('submit', 'table', formData.value.data);
      formVisible.value = false;
    }
  });
};

const onReset: FormProps['onReset'] = () => {
  formData.value.data = { ...formData.value.raw };
};

const uploadFileEvent = async () => {
  const res = await window.electron.ipcRenderer.invoke('dialog-file-access', {
    properties: ['openFile'],
    filters: [{
      name: 'M3u Files', extensions: ['m3u', 'm3u8','ts']
    }, {
      name: 'Text Files', extensions: ['txt']
    }, {
      name: 'All Files', extensions: ['*']
    }],
  });
  if (!res || res?.filePaths?.length === 0) return;
  formData.value.data.url = res.filePaths[0];
};

const RULES = {
  name: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped>
.input-horizontal-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
};

.input-vertical-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.key-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--td-comp-margin-m);
  gap: 10px;
  align-items: center;
}
</style>
