<template>
  <div class="history-control">
    <t-button theme="default" shape="square" variant="text" @click="gotoBack">
      <chevron-left-icon />
    </t-button>
    <t-button theme="default" shape="square" variant="text" @click="gotoForward">
      <chevron-right-icon />
    </t-button>
    <t-button theme="default" shape="square" variant="text" @click="gotoRefresh">
      <rotate-icon />
    </t-button>
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

  :deep(.t-button) {
    &:not(.t-is-disabled):not(.t-button--ghost) {
      --ripple-color: transparent;
    }
  }

  :deep(.t-button__text) {
    svg {
      color: var(--td-text-color-placeholder);
    }
  }

  :deep(.t-button--variant-text) {
    &:hover {
      border-color: transparent;
      background-color: transparent;

      .t-button__text {
        svg {
          color: var(--td-primary-color);
        }
      }
    }
  }
}
</style>
