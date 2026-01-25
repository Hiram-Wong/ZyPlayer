<template>
  <div :class="[`${prefix}-aside-container`]">
    <t-menu collapsed :value="active" :style="{ width: '100%' }">
      <template v-if="!isMacOS" #logo>
        <img src="@/assets/icon.png" alt="logo" class="t-menu__icon" />
      </template>

      <template v-for="item in list.top" :key="item.path">
        <t-menu-item v-if="getHref(item)" :name="item.path" :value="getPath(item)" @click="openHref(getHref(item)![0])">
          <template #icon>
            <span class="t-menu__icon">
              <component :is="menuIcon(item)"></component>
            </span>
          </template>
          {{ renderMenuTitle(item.title!) }}
        </t-menu-item>
        <t-menu-item v-else :name="item.path" :value="getPath(item)" :to="item.path">
          <template #icon>
            <span class="t-menu__icon">
              <component :is="menuIcon(item)"></component>
            </span>
          </template>
          {{ renderMenuTitle(item.title!) }}
        </t-menu-item>
      </template>
      <template #operations>
        <t-menu collapsed :value="active" :style="{ width: '100%' }">
          <template v-for="item in list.bottom" :key="item.path">
            <t-menu-item
              v-if="getHref(item)"
              :name="item.path"
              :value="getPath(item)"
              @click="openHref(getHref(item)![0])"
            >
              <template #icon>
                <span class="t-menu__icon">
                  <component :is="menuIcon(item)"></component>
                </span>
              </template>
              {{ renderMenuTitle(item.title!) }}
            </t-menu-item>
            <t-menu-item v-else :name="item.path" :value="getPath(item)" :to="item.path">
              <template #icon>
                <span class="t-menu__icon">
                  <component :is="menuIcon(item)"></component>
                </span>
              </template>
              {{ renderMenuTitle(item.title!) }}
            </t-menu-item>
          </template>
        </t-menu>
      </template>
    </t-menu>
  </div>
</template>
<script setup lang="tsx">
import type { PropType } from 'vue';
import { computed } from 'vue';

import RenderIcon from '@/components/render-icon/index.vue';
import { prefix } from '@/config/global';
import { useLocale } from '@/locales/useLocale';
import { getActive } from '@/router';
import type { MenuRoute } from '@/types/interface';
import { isMacOS } from '@/utils/systeminfo';

type ListItemType = MenuRoute & { icon?: string };

const { menu } = defineProps({
  menu: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
});

const { locale } = useLocale();

const list = computed(() => {
  const menuList = getMenuList(menu);
  const topList: ListItemType[] = menuList.filter((item) => item.position === 'top' || !item.position);
  const bottomList: ListItemType[] = menuList.filter((item) => item.position === 'bottom');
  return { top: topList, bottom: bottomList };
});
const active = computed(() => getActive());

const menuIcon = (item: ListItemType) => {
  const filled = item.path === active.value;
  if (typeof item.icon === 'string') return <RenderIcon name={`${item.icon}${filled ? '-filled' : ''}`} />;
  return item.icon;
};

const renderMenuTitle = (title: string | Record<string, string>) => {
  if (typeof title === 'string') return title;
  return title[locale.value];
};

const getMenuList = (list: MenuRoute[], basePath?: string): ListItemType[] => {
  if (!list || list.length === 0) {
    return [];
  }

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
        position: item.meta?.position,
      };
    })
    .filter((item) => item.meta && item.meta.hidden !== true);
};

const getHref = (item: MenuRoute) => {
  const { frameSrc, frameBlank } = item.meta;
  if (frameSrc && frameBlank) {
    return frameSrc.match(/(https?):\/\/([\w.]+)(?:\/\S*)?/);
  }
  return null;
};

const getPath = (item: ListItemType) => {
  const activeLevel = active.value.split('/').length;
  const pathLevel = item.path.split('/').length;
  if (activeLevel > pathLevel && active.value.startsWith(item.path)) {
    return active.value;
  }

  if (active.value === item.path) {
    return active.value;
  }

  return item.meta?.single ? item.redirect : item.path;
};

const openHref = (url: string) => {
  window.open(url);
};
</script>
<style lang="less" scoped></style>
