<template>
  <div class="lab view-container">
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
  crypto: defineAsyncComponent(() => import('./components/crypto/index.vue')),
  diff: defineAsyncComponent(() => import('./components/diff/index.vue')),
  edit: defineAsyncComponent(() => import('./components/edit/index.vue')),
  sift: defineAsyncComponent(() => import('./components/sift/index.vue')),
  sniffer: defineAsyncComponent(() => import('./components/sniffer/index.vue')),
  player: defineAsyncComponent(() => import('./components/player/index.vue')),
  extension: defineAsyncComponent(() => import('./components/extension/index.vue')),
};

const currentComponent = shallowRef(componentMap[settingStore.nav.lab || 'crypto']);

const active = computed(() => settingStore.nav.lab || 'crypto');
const componentNav = computed(() => [
  { id: 'crypto', name: t('pages.lab.crypto.title') },
  { id: 'diff', name: t('pages.lab.diff.title') },
  { id: 'edit', name: t('pages.lab.edit.title') },
  { id: 'sift', name: t('pages.lab.sift.title') },
  { id: 'sniffer', name: t('pages.lab.sniffer.title') },
  { id: 'player', name: t('pages.lab.player.title') },
  { id: 'extension', name: t('pages.lab.extension.title') },
]);

const onNavChange = (item: string) => {
  settingStore.updateConfig({ nav: { ...settingStore.nav, lab: item } });

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
