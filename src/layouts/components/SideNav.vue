<template>
  <div :class="`${prefix}-sidebar-layout ${prefix}-sidebar-compact`">
    <t-menu :theme="theme" :value="active" collapsed :class="`${prefix}-block-column`" style="width: 80px">
      <t-menu-item value="logo" disabled>
        <template #icon>
          <asset-logo />
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
import { computed } from 'vue';
import type { PropType } from 'vue';
import { RefreshIcon } from 'tdesign-icons-vue-next';
import { useEventBus } from '@vueuse/core';
import { getActive } from '@/router';
import type { MenuRoute } from '@/types/interface';
import { prefix } from '@/config/global';

import AssetLogo from '@/assets/icon.svg?component';

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
  // ??????meta??????orderNo???????????????????????????
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
  // ???????????????????????????????????????
  const reloadHookModules = ['/film/index', '/iptv/index', '/analysis/index', '/chase/index'];
  if (active.value && reloadHookModules.includes(active.value)) {
    emitReload.emit('reload');
  } else {
    window?.location.reload();
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables';

.light {
  .t-default-menu {
    background: #fbfbfb !important;
  }
  .t-default-menu:not(.t-menu--dark) .t-menu__item.t-is-active:not(.t-is-opened) {
    background-color: #fff;
    color: #000;
    box-shadow: 0 2px 14px -6px rgb(0 0 0 / 15%);
    border-radius: var(--td-radius-large);
  }
  .t-default-menu .t-menu__item.t-is-active:not(.t-is-opened) .t-icon {
    color: #000;
  }
  .tdesign-starter-sidebar-compact {
    background: #fbfbfb !important;
  }
}

.dark {
  .t-default-menu {
    background: #000 !important;
  }
  .t-default-menu .t-menu__item.t-is-active:not(.t-is-opened) {
    color: #fff;
    box-shadow: 0 2px 14px -6px rgb(0 0 0 / 15%);
    border-radius: var(--td-radius-large);
  }
  .t-default-menu.t-menu--dark .t-menu__item.t-is-active:not(.t-is-opened) {
    background-color: #161616;
  }
  .t-default-menu .t-menu__item.t-is-active:not(.t-is-opened) .t-icon {
    color: #fff;
  }
  .tdesign-starter-sidebar-compact {
    background: #000 !important;
  }
}

:deep(.t-default-menu.t-is-collapsed .t-menu .t-menu__item),
:deep(.t-menu__item) {
  padding: 0;
  width: 42px;
  height: 42px;
  margin-bottom: 21px;
  border-radius: var(--td-radius-large);
  justify-content: center;
}

.tdesign-block-column {
  display: flex;
  flex-direction: row;
  grid-row: 40px;
}

:deep(.t-menu) {
  width: 80px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.t-menu__operations) {
  border-top: 0 !important;
}
</style>
