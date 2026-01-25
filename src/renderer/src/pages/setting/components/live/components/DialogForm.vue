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
              <t-radio-button :value="IPTV_TYPE.REMOTE">{{ $t('pages.live.field.apiMap.remote') }}</t-radio-button>
              <t-radio-button :value="IPTV_TYPE.LOCAL">{{ $t('pages.live.field.apiMap.local') }}</t-radio-button>
              <t-radio-button :value="IPTV_TYPE.MANUAL">{{ $t('pages.live.field.apiMap.manual') }}</t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('common.api')" name="api">
            <t-textarea
              v-if="formData.type === IPTV_TYPE.MANUAL"
              v-model="formData.api"
              class="input-item input-textarea"
              :placeholder="
                $t('common.placeholder.inputEg', [
                  '\nExample of M3U:\n#EXTM3U\n#EXTINF:-1, Channel\nhttps://channel-url\n\nExample of txt\nChannel, https://channel-url',
                ])
              "
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
            <div v-else class="input-horizontal-item">
              <t-input v-model="formData.api" :style="{ flex: 1 }" />
              <t-button
                v-if="formData.type === IPTV_TYPE.LOCAL"
                class="upload-item"
                theme="default"
                @click="uploadFileEvent"
              >
                {{ $t('common.upload') }}
              </t-button>
            </div>
          </t-form-item>
          <t-form-item name="logo">
            <template #label>
              {{ $t('pages.live.field.logo') }}
              <t-popup destroy-on-close attach=".t-form-item__logo" :content="$t('pages.live.popup.logo')">
                <info-circle-icon />
              </t-popup>
            </template>
            <t-input v-model="formData.logo" />
          </t-form-item>
          <t-form-item name="epg">
            <template #label>
              {{ $t('pages.live.field.epg') }}
              <t-popup destroy-on-close attach=".t-form-item__epg" :content="$t('pages.live.popup.epg')">
                <info-circle-icon />
              </t-popup>
            </template>
            <t-input v-model="formData.epg" />
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
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { IPTV_TYPE } from '@shared/config/live';
import { randomUUID } from '@shared/modules/crypto';
import { isArray, isArrayEmpty } from '@shared/modules/validate';
import { InfoCircleIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';
import { t } from '@/locales';

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
  api: [{ required: true }],
  logo: [{ url: { protocols: ['http', 'https'] } }],
  epg: [{ url: { protocols: ['http', 'https'] } }],
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

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};

const uploadFileEvent = async () => {
  try {
    const resp = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FILE_DIALOG, {
      config: {
        filters: [
          { name: 'M3u Files', extensions: ['m3u', 'm3u8', 'ts'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      },
    });
    if (!isArray(resp) || isArrayEmpty(resp)) {
      MessagePlugin.warning(t('common.fail'));
      return;
    }

    const path = resp[0];
    formData.value.api = path;
    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Upload file error:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
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
