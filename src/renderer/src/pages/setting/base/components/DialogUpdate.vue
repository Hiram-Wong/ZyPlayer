<template>
  <t-dialog
    v-model:visible="formVisible"
    header="检查更新"
    placement="center"
    :footer="false"
    :close-on-esc-keydown="false"
    :close-on-overlay-click="false"
  >
    <template #body>
      <t-loading v-if="load" size="small" indicator :loading="load" text="请等待，检查更新中..." />
      <div v-else class="wrapper">
        <div class="body">
          <div v-if="updateInfo.new">
            <div>发现新版本：{{ updateInfo.version }}</div>
            <div class="content" v-html="updateInfo.releaseNotes"></div>
            <p class="tip">
              Tips: 仅windwos支持在线更新; mac需签名(没钱); linux不支持。
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mac和linux用户请前往
              <t-link theme="primary" href="https://github.com/Hiram-Wong/ZyPlayer/releases/" target="_blank">
                github
              </t-link>
              下载
            </p>
            <t-progress v-if="isDownload" :percentage="downloadProgress" />
            <div v-if="platform === 'win32'" class="footer">
              <t-button v-if="!isDownloaded" :loading="isDownload" @click="startDownload">
                {{ isDownload ? '下载中...' : '下载' }}
              </t-button>
              <t-button v-else :disabled="!isDownloaded" @click="installUpdate">安装</t-button>
            </div>
          </div>
          <p v-else>你当前使用的是最新版本</p>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

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
    MessagePlugin.success('安装包下载完成');
  });
};
const installUpdate = () => {
  window.electron.ipcRenderer.send('quitAndInstall');
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

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
