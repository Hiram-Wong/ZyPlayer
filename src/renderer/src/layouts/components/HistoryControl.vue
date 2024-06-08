<template>
  <div class="history-control">
    <div class="back nav-item" @click="gotoBack">
      <chevron-left-icon size="large" />
    </div>
    <div class="forward nav-item" @click="gotoForward">
      <chevron-right-icon size="large" />
    </div>
    <div class="refresh nav-item" @click="gotoRefresh">
      <rotate-icon size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { ChevronLeftIcon, ChevronRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const gotoBack = () => {
  router.back()
};

const gotoForward = () => {
  router.forward()
};

const emitReload = useEventBus<string>('reload');
const gotoRefresh = () => {
  // 声明具有局部刷新钩子的模块
  const reloadHookModules = ['/film/index', '/iptv/index', '/analyze/index', '/chase/index', '/community/index'];
  if (route.path && reloadHookModules.includes(route.path)) {
    emitReload.emit('reload');
  } else {
    window?.location.reload();
  }
};
</script>

<style lang="less" scoped>
.history-control {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--td-bg-content-input-1);
  height: 100%;
  width: 100px;
  border-radius: 50px;

  .nav-item {
    color: rgba(132, 133, 141, 0.8);
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--td-primary-color);
    }
  }
}
</style>
