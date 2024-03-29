<template>
  <div class="layout">
    <t-layout>
      <t-header height=60 :class="`${prefix}-header`">
        <layout-header />
      </t-header>
      <t-content :class="`${prefix}-content`">
        <layout-content />
      </t-content>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import '@/style/layout.less';

import { prefix } from '@/config/global';

import LayoutContent from './components/Content.vue';
import LayoutHeader from './components/Header.vue';
</script>

<style lang="less" scoped>
.t-layout {
  background: var(--td-bg-aside);
  overflow-x: hidden;
}
</style>
