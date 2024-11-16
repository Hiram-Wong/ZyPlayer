<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.update.title')" placement="center" :footer="false" :close-on-esc-keydown="false" :close-on-overlay-click="false">
    <template #body>
      <div class="dialog-container-padding">
        <t-loading v-if="active.check" size="small" indicator :loading="active.check" :text="$t('pages.setting.update.checkWait')" style="min-height: 30px;" />
        <div v-else class="wrapper top">
          <div class="body">
            <template v-if="errorText">
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.setting.update.errorlog') }}</p>
                <div style="margin-bottom: var(--td-comp-margin-m);">{{ errorText }}</div>
                <t-button block @click="reCheckEvent">{{ $t('pages.setting.update.reCheck') }}</t-button>
              </div>
            </template>
            <template v-else>
              <template v-if="updateInfo.new">
                <div class="data-item">
                  <p class="title-label mg-b">{{ $t('pages.setting.update.foundNewVersion') }}: {{ updateInfo.version }}</p>
                </div>
                <div class="data-item">
                  <p class="title-label mg-b">{{ $t('pages.setting.update.changelog') }}</p>
                  <div class="content markdown-custom" v-html="updateInfo.releaseNotes"></div>
                </div>
                <p class="tip bottom-tip">
                  {{ $t('pages.setting.update.tip') }}
                  <t-link size="small" theme="primary" href="https://github.com/Hiram-Wong/ZyPlayer/releases/" target="_blank">github</t-link>
                </p>
                <div class="optios">
                  <div style="float: right">
                    <template v-if="platform === 'win32'">
                      <t-button variant="outline" :loading="active.download" :disabled="active.download" @click="startDownload">
                        {{ active.download ? $t('pages.setting.update.downloading') : $t('pages.setting.update.download') }}
                      </t-button>
                      <t-button theme="primary" :disabled="!active.download && downloadProgress !== 100" @click="installUpdate">{{ $t('pages.setting.update.install')}}</t-button>
                    </template>
                    <template v-else>
                      <div style="height: 32px;"></div>
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
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import '@/components/markdown-render/index.less';

import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const { platform } = window.electron.process;

const formVisible = ref(false);
const updateInfo = ref({
  new: false,
  version: '',
  releaseNotes: '',
});
const active = ref({
  check: true,
  download: false,
  downloaded: false,
});
const listener = ref<{ [key: string]: null | Function }>({
  'update-available': null,
  'update-not-available': null,
  'download-progress': null,
  'update-downloaded': null,
  'update-error': null,
});
const downloadProgress = ref(0);
const errorText = ref();

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
    if (val) {
      onError();
      checkUpdate();
    } else {
      active.value.check = false;
      updateInfo.value = {
        new: false,
        version: '',
        releaseNotes: '',
      }
      for (const item in listener.value) {
        if (listener.value[item]) {
          listener.value[item]();
          listener.value[item] = null;
        }
      }
    }
  },
);

const checkUpdate = () => {
  console.log('[setting][update]check-update');
  active.value.check = true;
  window.electron.ipcRenderer.send('check-for-update');
  if (listener.value['update-available']) listener.value['update-available']();
  listener.value['update-available'] = window.electron.ipcRenderer.on('update-available', (_, res) => {
    console.log('[setting][update]update-available');
    if (res.code === 0) {
      updateInfo.value.new = true;
      updateInfo.value.version = res.data.version;
      updateInfo.value.releaseNotes = res.data.releaseNotes;
      active.value.check = false;
    }
  });
  if (listener.value['update-not-available']) listener.value['update-not-available']();
  listener.value['update-not-available'] = window.electron.ipcRenderer.on('update-not-available', (_, res) => {
    console.log('[setting][update]update-not-available');
    if (res.code === 0) {
      updateInfo.value.new = false;
      active.value.check = false;
    }
  });
};

const startDownload = () => {
  console.log('[setting][update]start-download');
  active.value.download = true;
  window.electron.ipcRenderer.send('download-update');
  if (listener.value['download-progress']) listener.value['download-progress']();
  listener.value['download-progress'] = window.electron.ipcRenderer.on('download-progress', (_, res) => {
    console.log(`[setting][update]download-process: ${res.data.progress}`);
    if (res.code === 0) {
      downloadProgress.value = res.data.progress;
    }
  });
  if (listener.value['update-downloaded']) listener.value['update-downloaded']();
  listener.value['update-downloaded'] = window.electron.ipcRenderer.on('update-downloaded', (_, res) => {
    console.log('[setting][update]downloaded');
    if (res.code === 0) {
      active.value.download = false;
      downloadProgress.value = 100;
      MessagePlugin.success(t('pages.setting.update.message.downloaded'));
    }
  });
};
const installUpdate = () => {
  window.electron.ipcRenderer.send('quit-and-install');
};

const onError = () => {
  if (listener.value['update-error']) listener.value['update-error']();
  listener.value['update-error'] = window.electron.ipcRenderer.on('update-error', (_, res) => {
    console.log(`[setting][update]update-error: ${res.msg}`);
    active.value.check = false;
    errorText.value = res.msg;
  });
}

const reCheckEvent = () => {
  updateInfo.value = {
    new: false,
    version: '',
    releaseNotes: '',
  }
  active.value = {
    check: true,
    download: false,
    downloaded: false,
  };
  checkUpdate();
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
}
</style>
