<template>
  <div class="titlebar" @mousedown="handleMouseDown" :style="[platform === 'darwin' ? 'margin-left: 80px' : '']">
    <div class="left no-drag">
      <!-- <img src="@/assets/icon.png" alt="logo" class="logo"/> -->
    </div>
    <div class="center no-drag">
      <search-bar class="search"/>
    </div>
    <div class="right no-drag">
      <div class="system-functions">
        <system-skin class="system-function"/>
      </div>
      <system-control v-if="platform !== 'darwin'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from './SearchBar.vue';
import SystemControl from './SystemControl.vue';
import SystemSkin from './SystemSkin.vue';

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
  margin: var(--td-comp-margin-m) var(--td-comp-margin-xs);
  .no-drag {
    -webkit-app-region: no-drag;
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
