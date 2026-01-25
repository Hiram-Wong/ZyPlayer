<template>
  <div class="moment view-container">
    <common-nav :list="componentNav" :active="active.nav" class="sidebar" @change="onNavChange" />

    <div class="content">
      <div class="container">
        <keep-alive>
          <component :is="currentComponent" class="content-wrapper" :related="relatedSiteData"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isArray, isArrayEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import { computed, defineAsyncComponent, onActivated, onMounted, ref, shallowRef } from 'vue';

import { fetchMomentRelated } from '@/api/moment';
import CommonNav from '@/components/common-nav/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import emitter from '@/utils/emitter';

const componentMap = {
  history: defineAsyncComponent(() => import('./components/history/index.vue')),
  star: defineAsyncComponent(() => import('./components/star/index.vue')),
};

const relatedSiteData = ref({
  parse: [] as IModels['analyze'][],
  live: [] as IModels['iptv'][],
  film: [] as IModels['site'][],
});

const active = ref({
  nav: 'history',
});

const currentComponent = shallowRef(componentMap[Object.keys(componentMap)[0]]);

const componentNav = computed(() => [
  { id: 'history', name: t('pages.moment.history.title') },
  { id: 'star', name: t('pages.moment.star.title') },
]);

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_MOMENT_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_MOMENT_CONFIG, reloadConfig);
});

onMounted(() => setup());

const setup = () => {
  getRelatedSiteConfig();
};

const onNavChange = (item: string) => {
  active.value.nav = item;

  if (Object.hasOwn(componentMap, item)) {
    currentComponent.value = componentMap[item];
  }
};

const getRelatedSiteConfig = async () => {
  try {
    const resp = await fetchMomentRelated();

    if (isArray(resp.parse) && !isArrayEmpty(resp.parse)) relatedSiteData.value.parse = resp.parse;
    if (isArray(resp.live) && !isArrayEmpty(resp.live)) relatedSiteData.value.live = resp.live;
    if (isArray(resp.film) && !isArrayEmpty(resp.film)) relatedSiteData.value.film = resp.film;
  } catch (error) {
    console.error(`Failed to load related site config:`, error);
    relatedSiteData.value = { parse: [], live: [], film: [] };
  }
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  relatedSiteData.value = { parse: [], live: [], film: [] };

  await getRelatedSiteConfig();
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
