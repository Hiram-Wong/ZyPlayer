<template>
  <div class="setting-container">
    <common-nav :title="$t('pages.setting.name')" :list="settingSet.list" :active="settingSet.select"
      @change-key="changeClassEvent">
      <template #customize>
        <div class="sign-bar">
          <div class="sign-logo">
            <img src="@/assets/hipy.png" alt="logo">
          </div>
          <div class="sign-content">
            <div class="sign-text">
              <h2>{{ $t('pages.setting.ad.title') }}</h2>
              <p>{{ $t('pages.setting.ad.desc') }}</p>
            </div>
          </div>
          <div class="sign-btn">
            <a href="https://github.com/hjdhnx/hipy-server" target="_blank">{{ $t('pages.setting.ad.open') }}</a>
          </div>
        </div>
      </template>
    </common-nav>
    <div class="content">
      <div class="container">
        <keep-alive>
          <component :is="currentComponent"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, shallowRef, watch } from 'vue';

import { t } from '@/locales';
import { useSettingStore } from '@/store';

import CommonNav from '../components/common-nav/index.vue';

// 异步加载组件，也可以直接导入组件
const componentMap = {
  'configBase': defineAsyncComponent(() => import('./setting/base/BaseSetting.vue')),
  'siteSource': defineAsyncComponent(() => import('./setting/site/SiteSetting.vue')),
  'iptvSource': defineAsyncComponent(() => import('./setting/iptv/IptvSetting.vue')),
  'analyzeSource': defineAsyncComponent(() => import('./setting/analyze/AnalyzeSetting.vue')),
  'driveSource': defineAsyncComponent(() => import('./setting/drive/DriveSetting.vue')),
  'editSource': defineAsyncComponent(() => import('./setting/tool/EditSource.vue')),
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
    }, {
      id: 'editSource',
      name: t('pages.setting.nav.editSource')
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
  position: relative;
  flex-direction: row;
  overflow: hidden;
  flex: 1 1;

  .sign-bar {
    background-image: url(../assets/nav-bg.png);
    width: 148px;
    height: 78px;
    border-radius: 10px;
    background-size: contain;
    position: relative;

    .sign-logo {
      width: 32px;
      height: 32px;
      position: absolute;
      top: 8px;
      left: 8px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 5px;
      }
    }

    .sign-content {
      position: relative;
      display: flex;
      flex-direction: row;
      height: 32px;
      top: 9px;
      left: 42px;
      justify-content: space-between;
      align-items: center;

      .sign-text {
        display: flex;
        flex-direction: column;
        height: 32px;
        justify-content: space-between;

        h2 {
          font-size: 14px;
          font-weight: 600;
          line-height: 17px;
          color: #25262b;
        }

        p {
          font-size: 10px;
          line-height: 12px;
          color: rgba(37, 38, 43, .72);
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }

    .sign-btn {
      flex-direction: row;
      text-align: right;
      display: flex;
      align-items: center;
      color: #25262b;
      position: absolute;
      width: 136px;
      left: 5px;
      top: 48px;
      align-content: space-around;
      justify-content: space-around;

      a {
        width: 100%;
        height: 20px;
        font-size: 10px;
        border-radius: 11px;
        background-color: rgba(132, 133, 141, 0.16);
        border: 2px solid rgba(132, 133, 141, 0.16);
        display: flex;
        justify-content: center;
        align-items: center;
        color: inherit;
        text-decoration: none;
      }
    }
  }

  .membership-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 148px;
    border: 2px solid rgba(132, 133, 141, 0.16);
    transition: all .3s ease;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 20px;

    .member-name {
      font-size: 12px;
      margin-left: 4px;
    }
  }

  .nav-sub-tab-member-info {
    margin-top: 16px;
  }

  .content {
    flex: 1 1;
    position: relative;
    overflow: hidden;
    height: 100%;

    .container {
      height: 100%;
    }
  }
}
</style>
