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
        style="width: 100%; height: 65vh; border-radius: 10px"
      ></iframe>
      <p class="tip">Tip: 如遇加载缓慢没出画面，请耐心等待！</p>
      <div class="side-floatbtn">
        <div class="btn-list">
          <div class="jx" @click="analysisEvent">
            <div class="btn">
              <play-circle-stroke-icon size="20px" class="icon" />
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="host" @click="analysisEvent">
        <div class="analysis">
          <div class="analysis-inner">
            <play-circle-stroke-icon size="20px" />
          </div>
        </div>
      </div> -->
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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
  platformData.value.url = '';
  formVisible.value = false;
};

// 解析播放
const analysisEvent = () => {
  const iframeCurrentUrl = iframeRef.value.contentWindow.location.href;
  console.log(iframeCurrentUrl);
  emit('platformPlay', iframeCurrentUrl);
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
    bottom: 90px;
    display: inline-block;
    .btn-list {
      float: right;
      width: 52px;
      .jx {
        position: relative;
        float: left;
        display: block;
        display: inline;
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
    bottom: var(--td-comp-paddingTB-l);
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
