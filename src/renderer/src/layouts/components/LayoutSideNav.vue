<template>
  <l-side-nav :menu="sideMenu" />
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { allRoutes } from '@/router';
import type { MenuRoute } from '@/types/interface';

import LSideNav from './SideNav.vue';

const sideMenu = computed(() => {
  let newMenuRouters = allRoutes as Array<MenuRoute>;

  newMenuRouters
    .filter((item) => item.name === 'Base')
    .forEach((menu) => {
      newMenuRouters = menu.children.map((subMenu) => ({
        ...subMenu,
        path: `${menu.path}/${subMenu.path}`.replace(/\/\//, '/'),
      }));
    });

  return newMenuRouters;
});
</script>
