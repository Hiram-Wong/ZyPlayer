<template>
  <div class="layout">
    <t-layout>
      <t-aside key="side" :class="`${prefix}-aside`">
        <layout-side-nav :nav-data="sideMenu" />
      </t-aside>
      <t-layout>
        <t-header height=60 :class="`${prefix}-header`">
          <layout-header />
        </t-header>
        <t-content :class="`${prefix}-content`">
          <layout-content />
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import '@/style/layout.less';

import { computed } from 'vue';

import { allRoutes } from '@/router';
import { prefix } from '@/config/global';

import LayoutContent from './components/Content.vue';
import LayoutHeader from './components/Header.vue';
import LayoutSideNav from './components/SideNav.vue';

const sideMenu = computed(() => { return allRoutes });
</script>

<style lang="less" scoped></style>
