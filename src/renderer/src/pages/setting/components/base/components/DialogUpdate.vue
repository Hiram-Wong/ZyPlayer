<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :footer="false"
    :close-on-esc-keydown="false"
    :close-on-overlay-click="false"
  >
    <template #header>
      {{ $t('pages.setting.update.title') }}
    </template>
    <template #body>
      <div class="dialog-container-padding">
        <t-loading
          v-if="active.check"
          size="small"
          :text="$t('pages.setting.update.checkWait')"
          style="min-height: 30px;"
        />

        <div v-else class="wrapper top">
          <template v-if="updateInfo.errText">
            <div class="data-item">
              <p class="title-label mg-b">{{ $t('pages.setting.update.errorlog') }}</p>
              <div style="margin-bottom: var(--td-comp-margin-m);">{{ updateInfo.errText }}</div>
              <t-button block @click="handleReCheck">{{ $t('pages.setting.update.reCheck') }}</t-button>
            </div>
          </template>
          <template v-else>
            <template v-if="updateInfo.available">
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.setting.update.foundNewVersion') }}: {{ updateInfo.version }}</p>
              </div>
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.setting.update.changelog') }}</p>
                <div class="text-black content">
                  <div ref="textRef" class="leading-relaxed break-words">
                    <div class="markdown-body" v-html="updateInfo.releaseNotes"></div>
                  </div>
                </div>
              </div>
              <div class="optios">
                <div style="float: right">
                  <template v-if="platform === 'win32'">
                    <t-button
                      v-if="!active.downloaded"
                      variant="outline"
                      :loading="active.download"
                      :disabled="active.download"
                      @click="handleDownStart"
                    >
                      <span v-if="active.download">{{ $t('pages.setting.update.downloadProcess') }} {{ updateInfo.downProcess }}%</span>
                      <span v-else>{{ $t('pages.setting.update.download') }}</span>
                    </t-button>
                    <t-button
                      theme="primary"
                      :disabled="!active.downloaded"
                      @click="handleInstallAfterDown"
                    >
                      {{ $t('pages.setting.update.install')}}
                    </t-button>
                  </template>
                  <template v-else>
                    <t-button theme="primary" @click="handleOpenDownLink">
                      {{ $t('pages.setting.update.download')}}
                    </t-button>
                  </template>
                </div>
              </div>
            </template>
            <template v-else>
              <p>{{ $t('pages.setting.update.noUpdate') }}</p>
            </template>
          </template>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import '@/components/markdown-render/style/index.less';

import { ref, watch } from 'vue';

import { platform } from '@/utils/tool';

defineOptions({ name: 'SettingBaseDialogUpdate' });

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible']);

const formVisible = ref(false);
const updateInfo = ref({
  available: false,
  version: '',
  releaseNotes: '',
  errText: '',
  downProcess: 0,
});
const active = ref({
  check: true,
  download: false,
  downloaded: false,
});

watch(() => formVisible.value, (val) => emit('update:visible', val));
watch(() => props.visible, (val) => {
  formVisible.value = val;
  if (val) handleReCheck();
});

const resetConf = () => {
  updateInfo.value = {
    available: false,
    version: '',
    releaseNotes: '',
    errText: '',
    downProcess: 0,
  };

  active.value = {
    check: true,
    download: false,
    downloaded: false,
  };
};

const handleInstallAfterDown = () => {
  window.electron.ipcRenderer.send('quit-and-install');
};

const handleOpenDownLink = () => {
  window.electron.ipcRenderer.send('open-url', 'https://github.com/Hiram-Wong/ZyPlayer/releases/latest');
};

const handleDownStart = () => {
  onIpcDown();
};

const handleReCheck = () => {
  resetConf();
  setupUpdateListeners();
  window.electron.ipcRenderer.send('check-for-update');
};

const setupUpdateListeners = () => {
  offIpcListeners();

  window.electron.ipcRenderer.on('update-error', (_, res) => {
    console.log(`[update-error] ${res.msg}`);
    active.value.check = false;
    updateInfo.value.errText = res.msg;
  });

  window.electron.ipcRenderer.on('update-available', (_, res) => {
    console.log('[update-available]', res);
    updateInfo.value = {
      ...updateInfo.value,
      available: res.data.available,
      version: res.data.version,
      releaseNotes: res.data.releaseNotes,
    }
    active.value.check = false;
  });

  window.electron.ipcRenderer.on('update-not-available', (_, res) => {
    console.log('[update-not-available]', res);
    updateInfo.value = {
      ...updateInfo.value,
      available: res.data.available,
      version: res.data.version,
      releaseNotes: res.data.releaseNotes,
    }
    active.value.check = false;
  });

  window.electron.ipcRenderer.on('download-progress', (_, res) => {
    updateInfo.value.downProcess = res.data.percent;
    active.value.downloaded = res.data.downloaded;
    if (res.data.downloaded) active.value.download = false;
  });

  window.electron.ipcRenderer.on('update-downloaded', (_, res) => {
    updateInfo.value.downProcess = res.data.percent;
    active.value.downloaded = res.data.downloaded;
    active.value.download = false;
  });
};

const onIpcDown = () => {
  active.value.download = true;
  window.electron.ipcRenderer.send('download-update');
};

const offIpcListeners = () => {
  const ipc = window.electron.ipcRenderer;
  ['update-error', 'update-available', 'update-not-available', 'download-progress', 'update-downloaded'].forEach(event =>
    ipc.removeAllListeners(event)
  );
};
</script>

<style lang="less" scoped>
.data-item {
  .title-label {
    font-weight: 500;
  }
}

.content {
  height: 300px;
  overflow-x: hidden;
  overflow-y: scroll;

  :deep(blockquote p) {
    padding: 0 var(--td-comp-paddingLR-s);
  }

  :deep(a) {
    pointer-events: none;
  }
}
</style>
