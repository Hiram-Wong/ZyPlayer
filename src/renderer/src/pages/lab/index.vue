<template>
  <div class="lab view-container">
    <common-nav :title="$t('pages.lab.name')" :list="settingSet.list" :active="settingSet.select" @change-key="changeConf" />
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
import { computed, defineAsyncComponent, reactive, shallowRef } from 'vue';
import { t } from '@/locales';
import CommonNav from '@/components/common-nav/index.vue';

// 异步加载组件，也可以直接导入组件
const componentMap = {
  'dataCrypto': defineAsyncComponent(() => import('./components/dataCrypto/index.vue')),
  'aiBrain': defineAsyncComponent(() => import('./components/aiBrain/index.vue')),
  'jsEdit': defineAsyncComponent(() => import('./components/jsEdit/index.vue')),
  'staticFilter': defineAsyncComponent(() => import('./components/staticFilter/index.vue')),
  'snifferPlay': defineAsyncComponent(() => import('./components/snifferPlay/index.vue')),
};

const currentComponent = shallowRef(componentMap['dataCrypto']);

const settingNav = computed(() => {
  return [
    {
      id: 'dataCrypto',
      name: t('pages.lab.nav.dataCrypto')
    },
    {
      id: 'aiBrain',
      name: t('pages.lab.nav.aiBrain')
    }, {
      id: 'jsEdit',
      name: t('pages.lab.nav.jsEdit')
    }, {
      id: 'staticFilter',
      name: t('pages.lab.nav.staticFilter')
    }, {
      id: 'snifferPlay',
      name: t('pages.lab.nav.snifferPlay')
    }
  ]
});

const settingSet = reactive({
  select: 'dataCrypto',
  list: settingNav
});

const changeConf = (key: string) => {
  settingSet.select = key;
  currentComponent.value = componentMap[key];
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  flex: 1 1;

  .content {
    min-width: 750px;
    position: relative;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;

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
