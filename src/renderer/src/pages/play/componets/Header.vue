<template>
  <div class="container-header" :class="!isVisible.macMaximize ? 'drag' : 'no-drag'">
    <div
      class="left no-drag"
      :style="{ 'padding-left': platform === 'darwin' && !isVisible.macMaximize ? '68px' : '0' }"
    >
      <div class="open-main-win" @click="openMainWinEvent">
        <home-icon size="1.5em" />
        <span class="tip-gotomain">{{ $t('pages.player.header.backMain') }}</span>
      </div>
    </div>
    <div class="spacer">
      <span>{{ formTitle }}</span>
    </div>
    <div class="right no-drag">
      <div class="system-functions">
        <sponsor class="system-function" />
        <language class="system-function" />
        <system-skin class="system-function" />
        <system-pin class="system-function" />
        <system-control class="mg-left window" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import { HomeIcon } from 'tdesign-icons-vue-next';
import logoIcon from '@/assets/icon.png';
import SystemControl from '@/layouts/components/SystemControl.vue';
import Language from '@/layouts/components/Language.vue';
import Sponsor from '@/layouts/components/Sponsor.vue';
import SystemSkin from '@/layouts/components/SystemSkin.vue';
import SystemPin from '@/layouts/components/SystemPin.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
});

watch(
  () => props.title,
  (val) => {
    formTitle.value = val;
    setSystemMediaInfo();
  },
);

const { getCurrentWindow } = require('@electron/remote');

const win = getCurrentWindow();
const { platform } = window.electron.process;
const isVisible = reactive({
  pin: false,
  macMaximize: false,
});
const formTitle = ref(props.title);

onMounted(() => {
  minMaxEvent();
});

// 打开主窗口
const openMainWinEvent = () => {
  window.electron.ipcRenderer.send('show-main-win');
};

// 全屏事件 mac修复状态栏 css 用
const minMaxEvent = () => {
  const handleFullScreen = (isFullScreen: boolean) => {
    isVisible.macMaximize = isFullScreen;
  };

  win.on('enter-full-screen', () => handleFullScreen(true));
  win.on('leave-full-screen', () => handleFullScreen(false));
};

// 设置系统媒体信息
const setSystemMediaInfo = () => {
  if ('mediaSession' in navigator) {
    const doc = {
      title: formTitle.value,
      // artist: 'zyfun',
      artwork: [{ src: logoIcon, sizes: '128x128', type: 'image/png' }],
    };

    navigator.mediaSession.metadata = new MediaMetadata(doc);
  }
  document.title = formTitle.value;
};
</script>

<style lang="less" scoped>
.drag {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--td-comp-margin-m) var(--td-comp-margin-xs);

  .mg-left {
    margin-left: 20px;
  }

  .left {
    .open-main-win {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      height: 32px;
      width: 120px;
      border-radius: var(--td-radius-default);
      background-color: var(--td-bg-color-container);
      padding: 2px 10px;
      transition: 0.15s linear;
      cursor: pointer;

      .tip-gotomain {
        display: inline-block;
        margin-left: 5px;
      }

      &:hover {
        background-color: var(--td-bg-content-hover-2);
      }
    }
  }

  .spacer {
    flex: 1 1 auto;
    overflow: hidden;
    text-align: center;

    span {
      font-weight: 700;
      text-align: center;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 80%;
      overflow: hidden;
    }
  }

  .right {
    display: flex;
    height: 100%;

    .system-functions {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: var(--td-bg-color-container);
      border-radius: var(--td-radius-default);

      & > .system-function:first-of-type {
        margin-left: 0;
      }

      .system-function {
        margin-left: var(--td-comp-margin-xs);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.t-button) {
          &:not(.t-is-disabled):not(.t-button--ghost) {
            --ripple-color: transparent;
          }
        }

        :deep(.t-button__text) {
          svg {
            color: rgba(132, 133, 141, 0.8);
          }
        }

        :deep(.t-button--variant-text) {
          &:hover {
            border-color: transparent;
            background-color: transparent;

            .t-button__text {
              svg {
                color: var(--td-primary-color);
              }
            }
          }
        }
      }
    }

    .window {
      height: 100%;
    }
  }
}
</style>
