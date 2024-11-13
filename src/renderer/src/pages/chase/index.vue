<template>
  <div class="chase view-container">
    <common-nav :title="$t('pages.chase.name')" :list="chaseNav" :active="active.nav" @change-key="changeChaseEvent" />
    <div class="content">
      <div class="container">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="componentMap[active.nav]" class="content-wrapper"></component>
          </keep-alive>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive } from 'vue';

import { t } from '@/locales';

const componentMap = {
  'binge': defineAsyncComponent(() => import('./components/binge/index.vue')),
  'history': defineAsyncComponent(() => import('./components/history/index.vue')),
};

const active = reactive({
  nav: 'history',
});

const chaseNav = computed(() => {
  return [
    {
      id: 'history',
      name: t('pages.chase.history.title')
    }, {
      id: 'binge',
      name: t('pages.chase.binge.title')
    }
  ]
});

const changeChaseEvent = (item: string) => {
  active.nav = item;
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;

  .content {
    min-width: 750px;
    position: relative;
    padding: var(--td-pop-padding-l);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;
    display: flex;
    flex-direction: column;

    .container {
      flex: 1;
      height: 100%;
      width: 100%;

      .content-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }

  &-dialog {
    :deep(.t-dialog__body) {
      text-align: center;
    }
  }
}
</style>
