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
import { ChevronLeftIcon, ChevronRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { useRoute, useRouter } from 'vue-router';

import emitter from '@/utils/emitter';

const router = useRouter();
const route = useRoute();

const gotoBack = () => {
  router.back()
};

const gotoForward = () => {
  router.forward()
};

const gotoRefresh = () => {
  const reloadHookModules = ['FilmIndex', 'IptvIndex', 'AnalyzeIndex', 'ChaseIndex', 'DriveIndex', 'SettingIndex'];
  if (route.name && reloadHookModules.includes(route.name as string)) {
    emitter.emit('reloadComponent');
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
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  height: 100%;
  width: 100px;

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
