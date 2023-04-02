<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="platformData.name"
    width="85%"
    placement="center"
    :footer="false"
    @close="closeEvent"
  >
    <div class="platform-container">
      <iframe
        ref="iframeRef"
        :key="key"
        class="platform-play-box"
        :src="platformData.url"
        scrolling="yes"
        frameborder="no"
        style="width: 100%; height: 70vh; border-radius: 10px"
      ></iframe>
      <p class="tip">Tip: 如遇加载缓慢没出画面，请耐心等待！</p>
      <div class="host" @click="analysisEvenbt">
        <div class="analysis">
          <div class="analysis-inner">
            <play-circle-stroke-icon size="20px" />
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { PlayCircleStrokeIcon } from 'tdesign-icons-vue-next';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';

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
const iframeCurrentUrl = ref(''); // iframe
const key = new Date().getTime(); // 解决iframe不刷新问题
const ipcRenderer = useIpcRenderer();

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

// 监听主进场拦截的url
ipcRenderer.on('blockUrl', (_, url) => {
  console.log(`blockUrl: ${url}`);
  if (url !== 'about:blank') platformData.value.url = url;
});

// 关闭dialog
const closeEvent = () => {
  platformData.value.url = '';
  formVisible.value = false;
};

// 解析播放
const analysisEvenbt = () => {
  iframeCurrentUrl.value = iframeRef.value.contentWindow.location.href;
  console.log(iframeCurrentUrl.value);
  emit('platformPlay', iframeCurrentUrl.value);
  platformData.value.url = '';

  formVisible.value = false;
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.platform-container {
  .platform-play-box {
    background-color: #f5f5f7;
    border-radius: var(--td-radius-extraLarge);
    width: 100%;
    height: 70vh;
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
  .host {
    position: absolute;
    left: 30px;
    bottom: 40px;
  }
  .analysis {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
    background-color: var(--td-bg-color-container);
    cursor: pointer;
    transition: all 0.2s ease 0s;
    opacity: 1;
    visibility: visible;
    color: var(--td-brand-color);
    &-inner {
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--td-bg-color-container);
      box-sizing: border-box;
      transition: all 0.2s ease 0s;
    }
  }
  .tip {
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
  }
}
:root[theme-mode='dark'] {
  .platform-play-box {
    background-color: var(--td-bg-color-container) !important;
  }
}

:global(.t-dialog) {
  background-color: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: var(--td-radius-extraLarge);
}
:global(.t-dialog--default) {
  padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-xxs);
}
:global(.t-dialog__body) {
  padding: var(--td-comp-paddingTB-s) 0 0;
}
</style>
