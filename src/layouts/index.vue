<template>
  <div>
    <t-layout>
      <t-header height="36px" :class="`${prefix}-header`">
        <layout-header />
      </t-header>
      <t-layout :class="`${prefix}-layout`">
        <t-aside key="side" width="80px" :class="`${prefix}-aside`">
          <layout-side-nav :nav-data="sideMenu" />
        </t-aside>
        <t-content :class="`${prefix}-content`"><layout-content /></t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import '@/style/layout.less';

import { storeToRefs } from 'pinia';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { prefix } from '@/config/global';
import { usePermissionStore } from '@/store';

import LayoutContent from './components/Content.vue';
import LayoutHeader from './components/Header.vue';
import LayoutSideNav from './components/SideNav.vue';

const route = useRoute();

const permissionStore = usePermissionStore();
const { routers: menuRouters } = storeToRefs(permissionStore);

const sideMenu = computed(() => {
  const newMenuRouters = menuRouters.value;
  return newMenuRouters;
});

watch(
  () => route.path,
  () => {
    document.querySelector(`.${prefix}-layout`).scrollTo({ top: 0, behavior: 'smooth' });
  },
);
</script>

<style lang="less" scoped>
.t-layout {
  background: #fbfbfb !important;
}
:root[theme-mode='dark'] {
  .t-layout {
    background: #000 !important;
  }
}
</style>
