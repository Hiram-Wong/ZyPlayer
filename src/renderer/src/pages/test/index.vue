<template>
  <div class="lab view-container">
    <common-nav :list="componentNav" :active="active.nav" class="sidebar" @change="onNavChange" />

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
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';

import CommonNav from '@/components/common-nav/index.vue';

const componentMap = {
  player: defineAsyncComponent(() => import('./components/player/index.vue')),
  editor: defineAsyncComponent(() => import('./components/editor/index.vue')),
  webview: defineAsyncComponent(() => import('./components/webview/index.vue')),
  demo: defineAsyncComponent(() => import('./components/demo/index.vue')),
};

const componentNav = computed(() => [
  { id: 'player', name: '播放器' },
  { id: 'editor', name: '编辑器' },
  { id: 'webview', name: '网页视图' },
  { id: 'demo', name: '演示' },
]);

const active = ref({
  nav: 'player',
});

const currentComponent = shallowRef(componentMap[Object.keys(componentMap)[0]]);

const onNavChange = (item: string) => {
  active.value.nav = item;

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
