<template>
  <div class="titlebar">
    <div class="left no-drag">
      <history-control />
      <search-bar class="search"/>
    </div>
    <div class="right no-drag">
      <div class="system-functions">
        <sponsor class="system-function"/>
        <system-skin class="system-function"/>
        <system-config class="system-function"/>
      </div>
      <system-control v-if="platform !== 'darwin'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import HistoryControl from './HistoryControl.vue';
import SearchBar from './SearchBar.vue';
import SystemConfig from './SystemConfig.vue';
import SystemControl from './SystemControl.vue';
import SystemSkin from './SystemSkin.vue';
import Sponsor from './Sponsor.vue';

const { platform } = window.electron.process;

</script>

<style lang="less" scoped>
.titlebar {
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  height: 32px;
  margin: var(--td-comp-margin-m) var(--td-comp-margin-xs);
  .no-drag {
    -webkit-app-region: no-drag;
  }
  .left {
    height: 100%;
    display: flex;
    .search {
      margin-left: 20px;
    }
  }
  .center {
    margin-left: 20px;
    // .search {

    // }
  }
  .right {
    display: flex;
    .system-functions {
      display: flex;
      align-items: center;
      justify-content: space-around;
      .system-function {
        margin-left: var(--td-comp-margin-xs);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .system-controls {
      display: flex;
    }
  }
}
</style>
