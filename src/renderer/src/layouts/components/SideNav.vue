<template>
  <div :class="[`${prefix}-sidebar-layout`, platform === 'darwin' && !macFull ? 'mac_unmax_style' : '']">
    <t-menu :value="active"  :class="`${prefix}-block-column`">
      <img class="logo" src="@/assets/icon.png" alt="logo" />
      <template v-for="item in list" :key="item.path">
        <t-menu-item v-if="getHref(item)" :name="item.path" :value="getPath(item)" @click="openHref(getHref(item)[0])">
          <template #icon>
            <component :is="menuIcon(item)"></component>
          </template>
          {{ item.title }}
        </t-menu-item>
        <t-menu-item v-else :name="item.path" :value="getPath(item)" :to="item.path">
          <template #icon>
            <component :is="menuIcon(item)"></component>
          </template>
          {{ item.title }}
        </t-menu-item>
      </template>
    </t-menu>
  </div>
</template>

<script setup lang="tsx">
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import { prefix } from '@/config/global';
import { getActive } from '@/router';
import type { MenuRoute } from '@/types/interface';

type ListItemType = MenuRoute & { icon?: string };

const props = defineProps({
  navData: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
  theme: {
    type: String as PropType<'dark' | 'light'>,
    default: 'light',
  },
});

const macFull = ref(false);
const { platform } = window.electron.process;

window.electron.ipcRenderer.on('screen', (_, args) => {
  macFull.value = args;
})

const active = computed(() => getActive());

const list = computed(() => {
  const { navData } = props;
  return getMenuList(navData);
});

const menuIcon = (item: ListItemType) => {
  if (typeof item.icon === 'string') return <t-icon name={item.icon} style="" stroke-width="2.5"/>;
  const RenderIcon = item.icon;
  return RenderIcon;
};

const getMenuList = (list: MenuRoute[], basePath?: string): ListItemType[] => {
  if (!list || list.length === 0) {
    return [];
  }
  // 如果meta中有orderNo则按照从小到大排序
  list.sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });

  return list
    .map((item) => {
      const path = basePath && !item.path.includes(basePath) ? `${basePath}/${item.path}` : item.path;
      return {
        path,
        title: item.meta?.title,
        icon: item.meta?.icon,
        children: getMenuList(item.children, path),
        meta: item.meta,
        redirect: item.redirect,
      };
    })
    .filter((item) => item.meta && item.meta.hidden !== true);
};

const getHref = (item: MenuRoute) => {
  const { frameSrc, frameBlank } = item.meta;
  if (frameSrc && frameBlank) {
    return frameSrc.match(/(http|https):\/\/([\w.]+\/?)\S*/);
  }
  return null;
};

const getPath = (item: ListItemType) => {
  if (active.value.startsWith(item.path)) {
    return active.value;
  }
  return item.meta?.single ? item.redirect : item.path;
};

const openHref = (url: string) => {
  window.open(url);
};
</script>

<style lang="less" scoped>
.mac_unmax_style {
  padding-top: var(--td-comp-size-xxl);
}

.logo {
  width: var(--td-size-12);
  height: var(--td-size-12);
  margin: var(--td-comp-paddingTB-s) 0 var(--td-comp-paddingTB-l) 0;
}
</style>
