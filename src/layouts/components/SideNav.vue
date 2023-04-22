<template>
  <div :class="`${prefix}-sidebar-layout ${prefix}-sidebar-compact`">
    <t-menu :value="active" collapsed :class="`${prefix}-block-column`" style="width: 80px">
      <t-menu-item value="logo" disabled>
        <template #icon>
          <img class="logo" src="@/assets/icon.png" alt="logo" />
        </template>
      </t-menu-item>
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
      <template #operations>
        <t-menu-item @click="refreshEvent">
          <template #icon><refresh-icon /></template>
        </t-menu-item>
      </template>
    </t-menu>
  </div>
</template>

<script setup lang="tsx">
import { useEventBus } from '@vueuse/core';
import { RefreshIcon } from 'tdesign-icons-vue-next';
import type { PropType } from 'vue';
import { computed } from 'vue';

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

const active = computed(() => getActive());

const list = computed(() => {
  const { navData } = props;
  return getMenuList(navData);
});

const menuIcon = (item: ListItemType) => {
  if (typeof item.icon === 'string') return <t-icon name={item.icon} />;
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

const emitReload = useEventBus<string>('reload');
const refreshEvent = () => {
  console.log('reload');
  // 声明具有局部刷新钩子的模块
  const reloadHookModules = ['/film/index', '/iptv/index', '/analysis/index', '/chase/index'];
  if (active.value && reloadHookModules.includes(active.value)) {
    emitReload.emit('reload');
  } else {
    window?.location.reload();
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.logo {
  width: var(--td-size-12);
  height: var(--td-size-12);
  padding: var(--td-pop-padding-s);
}
</style>
