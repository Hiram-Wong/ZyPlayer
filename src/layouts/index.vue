<template>
  <div>
    <t-layout>
      <t-header height="36px" :class="`${prefix}-header`">
        <layout-header />
      </t-header>
      <t-layout :class="`${prefix}-layout`">
        <t-aside key="side" width="80px" :class="`${prefix}-aside`">
          <layout-side-nav :theme="settingStore.displayMode" :nav-data="sideMenu" />
        </t-aside>
        <t-content class="zy-content">
          <layout-content />
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePermissionStore, useSettingStore } from '@/store';
import LayoutSideNav from './components/SideNav.vue';
import LayoutContent from './components/Content.vue';
import LayoutHeader from './components/Header.vue';

import { prefix } from '@/config/global';
import '@/style/layout.less';

const settingStore = useSettingStore();
const permissionStore = usePermissionStore();
const { routers: menuRouters } = storeToRefs(permissionStore);

const sideMenu = computed(() => {
  const newMenuRouters = menuRouters.value;
  return newMenuRouters;
});
</script>

<style lang="less" scoped>
.dark {
  .t-layout {
    background: #000 !important;
  }
}
.light {
  .t-layout {
    background: #fbfbfb !important;
  }
}
</style>
