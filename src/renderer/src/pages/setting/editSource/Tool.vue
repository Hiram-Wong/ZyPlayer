<template>
  <div class="lab view-container">
    <keep-alive>
      <component :is="currentComponent" @change-component="changeComponent"></component>
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, shallowRef } from 'vue';

const componentMap = {
  'Sift': defineAsyncComponent(() => import('./Sift.vue')),
  'Source': defineAsyncComponent(() => import('./Source.vue')),
};
const currentComponent = shallowRef(componentMap['Source']);
const active = reactive({
  select: 'Source',
});

const changeComponent = (key) => {
  console.log(key)
  active.select = key;
  currentComponent.value = componentMap[key];
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
}
</style>
