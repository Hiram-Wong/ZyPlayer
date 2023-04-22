<template>
  <div :class="`${prefix}-drag`">
    <window-view />
  </div>
</template>

<script setup lang="ts">
import { prefix } from '@/config/global';

import windowView from './Window.vue';
</script>

<style lang="less" scoped>
.@{starter-prefix}-drag {
  height: var(--td-comp-size-l);
  padding: 5px 10px 0 0;
  -webkit-app-region: drag;
}
</style>
