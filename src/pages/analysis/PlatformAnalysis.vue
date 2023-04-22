<template>
  <t-dialog
    v-model:visible="formVisible"
    mode="full-screen"
    :header="platformData.name"
    :footer="false"
    @close="closeEvent"
  >
    <div v-if="platformData.url" class="platform-container">
      <iframe
        ref="iframeRef"
        :key="key"
        class="platform-play-box"
        :src="platformData.url"
        scrolling="yes"
        frameborder="no"
        muted="true"
      ></iframe>
      <p class="tip">Tip: 如遇加载缓慢没出画面，请耐心等待！</p>
      <div class="side-floatbtn">
        <div class="btn-lists">
          <div class="btn-list jx" @click="analysisEvent">
            <div class="btn">
              <play-circle-stroke-icon size="20px" class="icon" />
            </div>
          </div>
          <!-- <div class="btn-list back" @click="backEvent">
            <div class="btn">
              <rollback-icon size="20px" class="icon" />
            </div>
          </div>
          <div class="btn-list forward" @click="forwardEvent">
            <div class="btn">
              <rollfront-icon size="20px" class="icon" />
            </div>
          </div> -->
          <div class="btn-list refresh" @click="refreshEvent">
            <div class="btn">
              <refresh-icon size="20px" class="icon" />
            </div>
          </div>
          <div class="btn-list mini" @click="miniEvent">
            <div class="btn">
              <layers-icon size="20px" class="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import { LayersIcon, PlayCircleStrokeIcon, RefreshIcon, RollbackIcon, RollfrontIcon } from 'tdesign-icons-vue-next';
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

const formVisible = ref(false); // 控制dialog
const platformData = ref(props.data);
const iframeRef = ref(); // iframe dom节点
const key = new Date().getTime(); // 解决iframe不刷新问题
const ipcRenderer = useIpcRenderer();

const emit = defineEmits(['update:visible', 'platformPlay', 'platform-play-status']);

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
  ipcRenderer.on('blockUrl', async (_, url) => {
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
  const iframeCurrentUrl = iframeRef.value.contentWindow.location.href;
  console.log(iframeCurrentUrl);
  emit('platformPlay', iframeCurrentUrl);
  clearIframe();

  formVisible.value = false;
};

// 后退
const backEvent = () => {
  iframeRef.value.contentWindow.history.back();
};

// 前进
const forwardEvent = () => {
  iframeRef.value.contentWindow.history.forward();
};

// 刷新
const refreshEvent = () => {
  iframeRef.value.contentWindow.location.reload();
};

// 最小化
const miniEvent = () => {
  emit(
    'platform-play-status',
    true,
    iframeRef.value.contentWindow.location.href,
    iframeRef.value.contentWindow.document.title,
  );

  clearIframe();

  formVisible.value = false;
};

// 设置src为空，且不记录到history
const clearIframe = () => {
  platformData.value.url = '';
  iframeRef.value.contentWindow.history.replaceState(null, '', '');
  // const stateObj = { url: iframeRef.value.contentWindow.location.href };
  // iframeRef.value.contentWindow.history.replaceState(stateObj, '', iframeRef.value.contentWindow.location.href);
  // 获取当前浏览器历史记录中的最新记录
  // const latestHistory = iframeRef.value.contentWindow.history.state;
  // console.log(latestHistory);
  // // 判断最新记录中是否包含需要删除的 URL
  // if (latestHistory && latestHistory.url === '') {
  //   // 创建一个新的浏览器历史记录对象，并将其替换为最新的历史记录
  //   const newHistory = { ...latestHistory };
  //   delete newHistory.url; // 删除需要删除的 URL 属性
  //   iframeRef.value.contentWindow.history.replaceState(newHistory, '');
  // }
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.platform-container {
  height: 100%;
  .platform-play-box {
    background-color: #f5f5f7;
    border-radius: var(--td-radius-extraLarge);
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
    left: var(--td-comp-paddingLR-xxl);
    bottom: 40px;
    display: inline-block;
    .btn-lists {
      float: right;
      width: 52px;
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
          width: 42px;
          height: 40px;
          border-radius: 0 40px 40px 0;
          color: var(--td-text-color-primary);
          background: var(--td-bg-color-container);
          .icon {
            position: absolute;
            top: 9px;
            left: 10px;
            overflow: hidden;
            color: #999;
            cursor: pointer;
          }
        }
      }
    }
  }
  .tip {
    position: absolute;
    left: var(--td-comp-paddingLR-xxl);
    bottom: 0;
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
  }
}
:root[theme-mode='dark'] {
  .platform-play-box {
    background-color: var(--td-bg-color-container) !important;
  }
}
</style>
