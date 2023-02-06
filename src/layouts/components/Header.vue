<template>
  <div :class="`${prefix}-drag`"></div>
</template>

<script setup lang="ts">
import { prefix } from '@/config/global';
</script>

<style lang="less" scoped>
.@{starter-prefix}-drag {
  height: var(--td-comp-size-xxs);
  -webkit-app-region: drag;
}
</style>
