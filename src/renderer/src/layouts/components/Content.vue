<template>
  <router-view v-if="isRouterAlive" v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="Component" :key="activeRouteFullPath" :class="`${prefix}-component`" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

import { prefix } from '@/config/global';

const activeRouteFullPath = computed(() => {
  const router = useRouter();
  return router.currentRoute.value.fullPath;
});

const isRouterAlive = ref(true);
const eventBus = useEventBus('reload');
eventBus.on(() => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
});
</script>
<style lang="less" scoped>
.fade-leave-active,
.fade-enter-active {
  transition: opacity @anim-duration-slow @anim-time-fn-easing;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
