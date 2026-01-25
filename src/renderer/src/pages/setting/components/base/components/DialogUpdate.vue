<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    placement="center"
    destroy-on-close
    lazy
    :close-on-esc-keydown="false"
    :close-on-overlay-click="false"
    :footer="!active.check"
  >
    <template #header>
      {{ $t('pages.setting.update.title') }}
    </template>
    <template #body>
      <div class="update view-container">
        <t-loading v-if="active.check" size="small" :text="$t('common.checking')" class="loading" />

        <div v-else class="content">
          <div v-if="info.errText" class="container">
            <div class="data-item">
              <p class="title-label title">{{ $t('pages.setting.update.errorlog') }}</p>
              <div class="release-notes">{{ info.errText }}</div>
            </div>
          </div>
          <template v-else>
            <div v-if="info.available" class="container">
              <div class="data-item">
                <p class="title-label title">{{ $t('pages.setting.update.latestVersion') }}: {{ info.lastVersion }}</p>
              </div>
              <div class="data-item">
                <p class="title-label title">{{ $t('pages.setting.update.changelog') }}</p>
                <div class="release-notes">
                  <render-md :text="info.releaseNotes" />
                </div>
              </div>
            </div>
            <p v-else>{{ $t('pages.setting.update.noUpdate') }}</p>
          </template>
        </div>
      </div>
    </template>
    <template #footer>
      <t-button v-if="info.errText" theme="primary" variant="base" @click="handleReCheck">
        {{ $t('common.reCheck') }}
      </t-button>
      <template v-else>
        <template v-if="isWindows">
          <t-button theme="default" variant="base" :disabled="!active.downloaded" @click="handleInstall">
            {{ $t('common.install') }}
          </t-button>
          <t-button
            v-if="!active.downloaded"
            theme="primary"
            variant="base"
            :loading="active.download"
            :disabled="active.download"
            @click="handleDownStart"
          >
            <span v-if="active.download">
              {{ $t('pages.setting.update.downloadProcess', [info.downProcess]) }}
            </span>
            <span v-else>{{ $t('common.download') }}</span>
          </t-button>
        </template>
        <t-button v-else theme="primary" variant="base" @click="handleOpenDownLink">
          {{ $t('common.download') }}
        </t-button>
      </template>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SettingBaseDialogUpdate',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:visible']);

import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import RenderMd from '@/components/render-markdown/index.vue';
import { attachContent } from '@/config/global';
import { isWindows } from '@/utils/systeminfo';

const formVisible = ref(false);

const info = ref({
  available: false,
  currentVersion: '',
  lastVersion: '',
  releaseNotes: '',
  errText: '',
  downProcess: 0,
});
const active = ref({
  check: true,
  download: false,
  downloaded: false,
});

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) handleCheckUpdate();
  },
);

onMounted(() => setup());
onUnmounted(() => dispose());

const setup = () => {
  window.electron.ipcRenderer.on(IPC_CHANNEL.UPDATE_ERROR, (_, res) => {
    active.value.check = false;
    info.value.errText = res.message;
  });

  window.electron.ipcRenderer.on(IPC_CHANNEL.UPDATE_DOWNLOAD_PROGRESS, (_event, progress: number) => {
    info.value.downProcess = Number(progress.toFixed(2));

    active.value.download = progress < 100;
    active.value.downloaded = progress >= 100;
  });

  window.electron.ipcRenderer.on(IPC_CHANNEL.UPDATE_DOWNLOADED, () => {
    active.value.downloaded = true;
  });
};

const dispose = () => {
  const ipc = window.electron.ipcRenderer;
  [IPC_CHANNEL.UPDATE_DOWNLOAD_PROGRESS, IPC_CHANNEL.UPDATE_DOWNLOADED, IPC_CHANNEL.UPDATE_ERROR].forEach((event) =>
    ipc.removeAllListeners(event),
  );
};

const handleReCheck = () => {
  info.value.errText = '';
  active.value.check = true;
  handleCheckUpdate();
};

const handleInstall = () => {
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.UPDATE_INSTALL);
};

const handleOpenDownLink = () => {
  window.electron.ipcRenderer.invoke(
    IPC_CHANNEL.OPEN_WEBSITE,
    'https://github.com/Hiram-Wong/ZyPlayer/releases/latest',
  );
};

const handleDownStart = () => {
  active.value.download = true;
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.UPDATE_DOWNLOAD, true);
};

const handleCheckUpdate = async () => {
  try {
    const resp = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.UPDATE_CHECK);
    const { isValid, currentVersion, lastVersion, releaseNote } = resp || {};

    info.value.available = isValid;
    info.value.currentVersion = currentVersion;
    info.value.lastVersion = lastVersion;
    info.value.releaseNotes = releaseNote;
  } finally {
    active.value.check = false;
  }
};
</script>
<style lang="less" scoped>
.view-container {
  .loading {
    min-height: 30px;
  }

  .release-notes {
    max-height: 306px;
    overflow-y: auto;
  }
}
</style>
