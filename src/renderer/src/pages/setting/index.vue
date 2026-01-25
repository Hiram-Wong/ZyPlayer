<template>
  <div class="setting view-container">
    <common-nav :list="componentNav" :active="active" class="sidebar" @change="onNavChange" />

    <div class="content">
      <div class="container">
        <keep-alive>
          <component :is="currentComponent" class="content-wrapper"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef } from 'vue';

import CommonNav from '@/components/common-nav/index.vue';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const settingStore = useSettingStore();

const componentMap = {
  baseConfig: defineAsyncComponent(() => import('./components/base/index.vue')),
  dataManage: defineAsyncComponent(() => import('./components/data/index.vue')),
  filmSource: defineAsyncComponent(() => import('./components/film/index.vue')),
  liveSource: defineAsyncComponent(() => import('./components/live/index.vue')),
  parseSource: defineAsyncComponent(() => import('./components/parse/index.vue')),
};

const currentComponent = shallowRef(componentMap[settingStore.nav.setting || 'baseConfig']);

const active = computed(() => settingStore.nav.setting || 'baseConfig');
const componentNav = computed(() => [
  { id: 'baseConfig', name: t('pages.setting.nav.baseConfig') },
  { id: 'dataManage', name: t('pages.setting.nav.dataManage') },
  { id: 'filmSource', name: t('pages.setting.nav.filmSource') },
  { id: 'liveSource', name: t('pages.setting.nav.liveSource') },
  { id: 'parseSource', name: t('pages.setting.nav.parseSource') },
]);

const onNavChange = (item: string) => {
  settingStore.updateConfig({ nav: { ...settingStore.nav, setting: item } });

  if (Object.hasOwn(componentMap, item)) {
    currentComponent.value = componentMap[item];
  }
};
</script>
<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: var(--td-size-4);

  .sidebar {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .content {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;
    position: relative;

    .container {
      flex: 1;
      height: 100%;
      width: 100%;

      .content-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
      }
    }
  }
}
</style>
