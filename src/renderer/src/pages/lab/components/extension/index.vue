<template>
  <div class="lab-extension view-component-container">
    <keep-alive>
      <component :is="currentComponent" class="content-wrapper" @change-nav="onNavChange"></component>
    </keep-alive>
  </div>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, ref, shallowRef } from 'vue';

const componentMap = {
  plugin: defineAsyncComponent(() => import('./components/plugin/index.vue')),
  env: defineAsyncComponent(() => import('./components/env/index.vue')),
};

const active = ref({
  nav: 'plugin',
});

const currentComponent = shallowRef(componentMap[Object.keys(componentMap)[0]]);

const onNavChange = (item: string) => {
  active.value.nav = item;
  currentComponent.value = componentMap[item];
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding-bottom: var(--td-comp-paddingTB-s);
}
</style>
