<template>
  <title-bar overlay class="system-controls" v-if="platform !== 'darwin'"></title-bar>
</template>

<script setup lang="ts">
import '@electron-uikit/titlebar/renderer';

const { platform } = process;
</script>

<style lang="less" scoped>
.system-controls {
  position: relative;
  width: 102px;
  height: 100%;
  overflow: hidden;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  --tb-control-height: 32px;
  --tb-control-hover-color: var(--td-bg-color-container-hover);
  --tb-control-symbol-color: rgba(132, 133, 141, 0.8);
  --tb-control-close-symbol-color: rgba(132, 133, 141, 0.8);
}
</style>
