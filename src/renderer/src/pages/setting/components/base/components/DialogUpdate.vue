<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.update.title')" placement="center" :footer="false"
    :close-on-esc-keydown="false" :close-on-overlay-click="false">
    <template #body>
      <t-loading v-if="load" size="small" indicator :loading="load" :text="$t('pages.setting.update.checkWait')"
        style="min-height: 30px;" />
      <div v-else class="wrapper">
        <div class="body">
          <div v-if="updateInfo.new">
            <div>{{ $t('pages.setting.update.foundNewVersion') }}: {{ updateInfo.version }}</div>
            <div class="content" v-html="updateInfo.releaseNotes"></div>
            <p class="tip">
              {{ $t('pages.setting.update.systemTip') }}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('pages.setting.update.macAndLinuxTip') }}
              <t-link theme="primary" href="https://github.com/Hiram-Wong/ZyPlayer/releases/" target="_blank">
                github
              </t-link>
              {{ $t('pages.setting.update.download') }}
            </p>
            <t-progress v-if="isDownload" :percentage="downloadProgress" />
            <div v-if="platform === 'win32'" class="footer">
              <t-button v-if="!isDownloaded" :loading="isDownload" @click="startDownload">
                {{ isDownload ? $t('pages.setting.update.downloading') : $t('pages.setting.update.download') }}
              </t-button>
              <t-button v-else :disabled="!isDownloaded" @click="installUpdate">{{ $t('pages.setting.update.install')
                }}</t-button>
            </div>
          </div>
          <p v-else>{{ $t('pages.setting.update.noUpdate') }}</p>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
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
const load = ref(true);
const isDownload = ref(false);
const isDownloaded = ref(false);
const updateInfo = ref({
  new: false,
  version: '',
  releaseNotes: '',
});
const downloadProgress = ref();

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
    console.log(val);
    if (val) checkUpdate();
  },
);

const checkUpdate = () => {
  console.log('checkUpdate');
  window.electron.ipcRenderer.send('checkForUpdate');
  window.electron.ipcRenderer.on('update-available', (_, info) => {
    console.log('存在可用更新');
    updateInfo.value.new = true;
    updateInfo.value.version = info.version;
    updateInfo.value.releaseNotes = info.releaseNotes;
    load.value = false;
  });
  window.electron.ipcRenderer.on('update-not-available', () => {
    console.log('没有可用更新');
    load.value = false;
    updateInfo.value.new = false;
  });
  console.log(updateInfo.value);
};

const startDownload = () => {
  console.log('startDownload');
  isDownload.value = true;
  window.electron.ipcRenderer.send('downloadUpdate');
  window.electron.ipcRenderer.on('download-progress', (_, progress) => {
    console.log(`downloadProcess: ${progress}`);
    downloadProgress.value = progress;
  });
  window.electron.ipcRenderer.on('update-downloaded', () => {
    console.log('downloaded');
    isDownloaded.value = true;
    downloadProgress.value = 100;
    MessagePlugin.success(t('pages.setting.update.downloaded'));
  });
};
const installUpdate = () => {
  window.electron.ipcRenderer.send('quitAndInstall');
};
</script>

<style lang="less" scoped>
.tip {
  color: var(--td-gray-color-6);
  font-size: var(--td-font-size-link-small);
}

.footer,
.tip {
  margin-top: var(--td-size-4);
}

.content {
  height: 300px;
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>
