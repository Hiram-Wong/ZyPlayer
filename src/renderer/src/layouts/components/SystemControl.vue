<template>
  <title-bar overlay class="system-controls" v-if="platform !== 'darwin'"></title-bar>
</template>

<script setup lang="ts">
import '@electron-uikit/titlebar/renderer';
import { platform } from '@/utils/tool';
</script>

<style lang="less" scoped>
.system-controls {
  z-index: 1;
  position: relative;
  width: 102px;
  height: 100%;
  overflow: hidden;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  --tb-control-height: 32px;
  --tb-control-hover-color: var(--td-bg-color-container-hover);
  --tb-control-symbol-color: var(--td-text-color-placeholder);
  --tb-control-close-symbol-color: var(--td-text-color-placeholder);
}
</style>
