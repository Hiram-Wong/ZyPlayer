<template>
  <div class="container-header" :class="!active.macMaximize ? 'drag' : 'no-drag'">
    <div
      class="left no-drag"
      :style="{ 'padding-left': platform === 'darwin' && !active.macMaximize ? '68px' : '0' }"
    >
      <div class="open-main-win" @click="openMainWinEvent">
        <home-icon size="1em"/>
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
      </div>
      <system-control class="mg-left window" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import { HomeIcon } from 'tdesign-icons-vue-next';
import { platform } from '@/utils/tool';

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

const active = ref({
  pin: false,
  macMaximize: false,
});
const formTitle = ref(props.title);

watch(
  () => props.title,
  (val) => {
    formTitle.value = val;
    setSystemMediaInfo();
  },
);

onMounted(() => {
  onFullscreenEvent();
});

// 打开主窗口
const openMainWinEvent = () => {
  window.electron.ipcRenderer.send('open-win', { action: 'main' });
};

// 全屏事件 mac修复状态栏 css 用
const onFullscreenEvent = () => {
  const handleFullScreen = (isFullScreen: boolean) => {
    active.value.macMaximize = isFullScreen;
  };

  window.electron.ipcRenderer.on('fullscreen', (_, isFullScreen) => {
    handleFullScreen(isFullScreen);
  });
};

// 设置系统媒体信息
const setSystemMediaInfo = () => {
  if ('mediaSession' in navigator) {
    const doc = {
      title: formTitle.value,
      artist: 'zyfun',
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
  height: 100%;

  .mg-left {
    margin-left: var(--td-comp-margin-l);
  }

  .left {
    .open-main-win {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      height: 32px;
      width: 120px;
      font-weight: 500;
      border-radius: var(--td-radius-default);
      color: var(--td-text-color-placeholder);
      background-color: var(--td-bg-color-container);
      padding: 1px 10px;
      transition: all 0.2s linear;
      cursor: pointer;

      .tip-gotomain {
        display: inline-block;
        margin-left: var(--td-comp-margin-xxs);
      }

      &:hover {
        color: var(--td-primary-color);
      }
    }
  }

  .spacer {
    flex: 1 1 auto;
    overflow: hidden;
    text-align: center;
    height: 100%;

    span {
      font-weight: 500;
      text-align: center;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 80%;
      overflow: hidden;
      line-height: 32px;
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
        width: 32px;
        height: 32px;
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
