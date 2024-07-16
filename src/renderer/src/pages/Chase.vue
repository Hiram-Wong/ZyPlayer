<template>
  <div class="chase view-container">
    <common-nav :title="$t('pages.chase.name')" :list="chaseNav" :active="active.nav" @change-key="changeChaseEvent" />
    <div class="content">
      <div class="container">
        <history-view class="content-wrapper" v-if="active.nav === 'history'" />
        <binge-view class="content-wrapper" v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { t } from '@/locales';

import bingeView from './chase/binge/Binge.vue';
import historyView from './chase/history/History.vue';

const active = reactive({
  nav: 'history',
});

const chaseNav = computed(() => {
  return [
    {
      id: 'history',
      name: t('pages.chase.history.title')
    }, {
      id: 'like',
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
  overflow: hidden;

  .content {
    min-width: 750px;
    position: relative;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
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
