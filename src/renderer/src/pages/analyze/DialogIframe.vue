<template>
  <t-dialog v-model:visible="formVisible" show-in-attached-element width="100%" :header="platformData.name"
    :footer="false" @close="closeEvent">
    <div v-if="platformData.url" class="platform-container">
      <webview ref="webviewRef" :src="platformData.url" class="platform-play-box" disablewebsecurity allowpopups />
      <div class="side-floatbtn">
        <div class="btn-lists">
          <div class="btn-list jx" @click="analysisEvent">
            <div class="btn">
              <play-circle-stroke-icon size="20px" class="icon" />
            </div>
          </div>
          <div class="btn-list back" @click="backEvent">
            <div class="btn">
              <rollback-icon size="20px" class="icon" />
            </div>
          </div>
          <div class="btn-list forward" @click="forwardEvent">
            <div class="btn">
              <rollfront-icon size="20px" class="icon" />
            </div>
          </div>
          <div class="btn-list refresh" @click="refreshEvent">
            <div class="btn">
              <refresh-icon size="20px" class="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import _ from 'lodash';
import { PlayCircleStrokeIcon, RefreshIcon, RollbackIcon, RollfrontIcon } from 'tdesign-icons-vue-next';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const formVisible = ref(false);
const platformData = ref(props.data);
const webviewRef = ref<any>(null);

const emit = defineEmits(['update:visible', 'platformPlay']);

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
  },
);
watch(
  () => props.data,
  (val) => {
    platformData.value = val;
  },
);

onMounted(() => {
  // 监听主进场拦截的url
  window.electron.ipcRenderer.on('blockUrl', async (_, url) => {
    console.log(`blockUrl: ${url}`);
    if (url !== 'about:blank') {
      platformData.value.url = url;
    }
  });
});

// 关闭dialog
const closeEvent = () => {
  clearIframe();

  formVisible.value = false;
};

// 解析播放
const analysisEvent = () => {
  const webviewCurrentUrl = webviewRef.value!.getURL();
  const webviewCurrentTitle = webviewRef.value!.getTitle();
  console.log(webviewCurrentUrl, webviewCurrentTitle);
  emit('platformPlay', webviewCurrentUrl, webviewCurrentTitle);
  clearIframe();

  formVisible.value = false;
};

// 后退
const backEvent = () => {
  if (webviewRef.value!.canGoBack()) webviewRef.value!.goBack();
};

// 前进
const forwardEvent = () => {
  if (webviewRef.value!.canGoForward()) webviewRef.value!.goForward();
};

// 刷新
const refreshEvent = () => {
  webviewRef.value!.reload();
};

// 设置src为空
const clearIframe = () => {
  platformData.value.url = '';
};
</script>

<style lang="less" scoped>
.platform-container {
  height: 100%;
  border-radius: var(--td-radius-large);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;

  .platform-play-box {
    flex: 1;
    width: 100%;
    height: 100%;

    &::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: content-box;
      background-color: var(--td-scrollbar-color);
    }
  }

  .side-floatbtn {
    position: absolute;
    left: 0;
    bottom: 40px;
    display: inline-block;

    .btn-lists {
      float: right;
      width: 32px;

      .btn-list {
        position: relative;
        float: left;
        display: block;
        width: 100%;
        margin-bottom: 10px;

        .btn {
          position: relative;
          left: 0;
          display: block;
          width: 32px;
          height: 40px;
          border-radius: 0 40px 40px 0;
          color: var(--td-text-color-primary);
          background: var(--td-bg-aside);

          .icon {
            position: absolute;
            top: 9px;
            left: 5px;
            overflow: hidden;
            color: #999;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
