<template>
  <div class="setting-container">
    <common-nav :title="$t('pages.setting.name')" :list="settingSet.list" :active="settingSet.select" @change-key="changeClassEvent" />
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
import { computed, defineAsyncComponent, reactive, shallowRef, watch } from 'vue';

import { t } from '@/locales';
import { useSettingStore } from '@/store';

import CommonNav from '@/components/common-nav/index.vue';

// 异步加载组件，也可以直接导入组件
const componentMap = {
  'configBase': defineAsyncComponent(() => import('./components/base/index.vue')),
  'siteSource': defineAsyncComponent(() => import('./components/site/index.vue')),
  'iptvSource': defineAsyncComponent(() => import('./components/iptv/index.vue')),
  'analyzeSource': defineAsyncComponent(() => import('./components/analyze/index.vue')),
  'driveSource': defineAsyncComponent(() => import('./components/drive/index.vue')),
};

const storeSetting = useSettingStore();
const currentComponent = shallowRef(componentMap['configBase']);

const settingNav = computed(() => {
  return [
    {
      id: 'configBase',
      name: t('pages.setting.nav.configBase')
    }, {
      id: 'siteSource',
      name: t('pages.setting.nav.siteSource')
    }, {
      id: 'iptvSource',
      name: t('pages.setting.nav.iptvSource')
    }, {
      id: 'analyzeSource',
      name: t('pages.setting.nav.analyzeSource')
    }, {
      id: 'driveSource',
      name: t('pages.setting.nav.driveSource')
    }
  ]
});

const settingSet = reactive({
  select: 'configBase',
  list: settingNav
});

// 初始化选中的组件
if (storeSetting.sysConfigSwitch) {
  settingSet.select = storeSetting.sysConfigSwitch;
  currentComponent.value = componentMap[storeSetting.sysConfigSwitch];
}

// 监听sysConfigSwitch的变化
watch(
  () => storeSetting.sysConfigSwitch,
  newValue => {
    currentComponent.value = componentMap[newValue];
    settingSet.select = newValue;
  }
);

const changeComponent = (key: string) => {
  currentComponent.value = componentMap[key];
  storeSetting.updateConfig({ sysConfigSwitch: key });
};

const changeClassEvent = (item: string) => {
  changeComponent(item);
};
</script>

<style lang="less" scoped>
.setting-container {
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
