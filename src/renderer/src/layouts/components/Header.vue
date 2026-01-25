<template>
  <div :class="[`${prefix}-header-container`]">
    <div class="left system-functions">
      <router-control :filter="routerControlFilter" class="system-function no-drag-region" />
      <search-panel class="system-function no-drag-region" />
      <player-show class="system-function no-drag-region" />
    </div>
    <div class="right system-functions">
      <quick-menu :filter="quickMenuFilter" class="system-functions no-drag-region" />
      <system-control :filter="systemControlFilter" class="system-function no-drag-region" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import PlayerShow from '@/components/play-show/index.vue';
import QuickMenu from '@/components/quick-menu/index.vue';
import RouterControl from '@/components/router-control/index.vue';
import SearchPanel from '@/components/search-panel/index.vue';
import SystemControl from '@/components/system-control/index.vue';
import { prefix } from '@/config/global';

const routerControlFilter = ref([]);
const quickMenuFilter = ref(['language', 'skin', 'setting', 'lab']);
const systemControlFilter = ref([]);
</script>
<style lang="less" scoped></style>
