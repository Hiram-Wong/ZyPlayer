<template>
  <div class="titlebar" @mousedown.self="handleMouseDown">
    <div class="left no-drag">
      <history-control />
      <search-bar class="mg-left" />
      <player-show class="mg-left" />
    </div>
    <div class="right no-drag">
      <div class="system-functions">
        <sponsor class="system-function" style="margin: 0" />
        <just-look class="system-function" />
        <language class="system-function" />
        <system-skin class="system-function" />
        <system-config class="system-function" />
      </div>
      <title-bar overlay class="system-controls mg-left" v-if="platform !== 'darwin'"></title-bar>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@electron-uikit/titlebar/renderer';

import HistoryControl from './HistoryControl.vue';
import SearchBar from './SearchBar.vue';
import PlayerShow from './PlayShow.vue';
import SystemConfig from './SystemConfig.vue';
import SystemSkin from './SystemSkin.vue';
import Sponsor from './Sponsor.vue';
import Language from './Language.vue';
import JustLook from './JustLook.vue';

const { platform } = window.electron.process;

const handleMouseDown = (event) => {
  if (event.detail === 2) {
    window.electron.ipcRenderer.send('win:invoke', 'max');
  }
}
</script>

<style lang="less" scoped>
.titlebar {
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  height: 32px;
  margin: var(--td-comp-margin-m) var(--td-comp-margin-xs) var(--td-comp-margin-m) 0;

  .no-drag {
    -webkit-app-region: no-drag;
  }

  .mg-left {
    margin-left: 20px;
  }

  .left {
    height: 100%;
    display: flex;
  }

  .center {
    margin-left: 20px;
  }

  .right {
    display: flex;
    flex-direction: row;
    align-items: center;

    .system-functions {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: var(--td-bg-color-container);
      border-radius: var(--td-radius-default);

      .system-function {
        margin-left: var(--td-comp-margin-xs);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;

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

    .system-controls {
      width: 102px;
      height: 100%;
      overflow: hidden;
      background: var(--td-bg-color-container);
      border-radius: var(--td-radius-default);
      --tb-control-height: 32px;
      --tb-control-hover-color: var(--td-bg-color-container-hover);
      --tb-control-symbol-color: rgba(132, 133, 141, 0.8);
      --tb-control-close-symbol-color: rgba(132, 133, 141, 0.8);

      :deep(.titlebar__window-controls) {
        position: relative !important;
      }
    }
  }
}
</style>
