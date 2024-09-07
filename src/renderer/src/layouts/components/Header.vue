<template>
  <div class="titlebar" @mousedown.self="handleMouseDown">
    <div class="left no-drag">
      <history-control />
      <search-bar class="mg-left" />
      <player-show class="mg-left" />
    </div>
    <div class="right no-drag">
      <div class="system-functions">
        <sponsor class="system-function" />
        <!-- <just-look class="system-function" /> -->
        <language class="system-function" />
        <system-skin class="system-function" />
        <system-config class="system-function" />
      </div>
      <system-control class="window mg-left" />
    </div>
  </div>
</template>

<script setup lang="ts">
import HistoryControl from './HistoryControl.vue';
// import JustLook from './JustLook.vue';
import Language from './Language.vue';
import PlayerShow from './PlayShow.vue';
import SearchBar from './SearchBar.vue';
import Sponsor from './Sponsor.vue';
import SystemConfig from './SystemConfig.vue';
import SystemControl from './SystemControl.vue';
import SystemSkin from './SystemSkin.vue';

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
    margin-left: var(--td-comp-margin-l);
  }

  .left {
    height: 100%;
    display: flex;
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

      &>.system-function:first-of-type {
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
            color: var(--td-text-color-placeholder);
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
  }
}
</style>
