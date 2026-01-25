<template>
  <div class="layout">
    <t-layout :class="[`${prefix}-layout`, `${prefix}-layout-component`]">
      <t-aside :class="[`${prefix}-aside`, `${prefix}-layout-component`]">
        <layout-side-nav />
      </t-aside>
      <t-layout :class="[`${prefix}-main`, `${prefix}-layout-component`]">
        <t-header class="drag-region" :class="[`${prefix}-header`, `${prefix}-layout-component`]">
          <layout-header />
        </t-header>
        <t-content :class="[`${prefix}-content`, `${prefix}-layout-component`]">
          <layout-content />
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>
<script setup lang="ts">
import { prefix } from '@/config/global';

import LayoutContent from './components/LayoutContent.vue';
import LayoutHeader from './components/LayoutHeader.vue';
import LayoutSideNav from './components/LayoutSideNav.vue';
</script>
<style lang="less" scoped>
@import '@/style/layout.less';
</style>
