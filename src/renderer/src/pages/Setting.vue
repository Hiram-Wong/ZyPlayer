<template>
  <div class="setting-container">
    <CommonNav title="设置" :list="settingSet.list" :active="settingSet.select" @change-key="changeClassEvent">
    </CommonNav>
    <div class="content">
      <div class="container">
        <base-view class="container-item" v-if="settingSet.select === 'configBase'"/>
        <site-view class="container-item" v-else-if="settingSet.select === 'siteSource'"/>
        <iptv-view class="container-item" v-else-if="settingSet.select === 'iptvSource'"/>
        <analyze-view class="container-item" v-else-if="settingSet.select === 'analyzeSource'"/>
        <drive-view class="container-item" v-else-if="settingSet.select === 'driveSource'"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useSettingStore } from '@/store';

import analyzeView from './setting/analyze/AnalyzeSetting.vue';
import baseView from './setting/base/BaseSetting.vue';
import iptvView from './setting/iptv/IptvSetting.vue';
import siteView from './setting/site/SiteSetting.vue';
import driveView from './setting/drive/driveSetting.vue';
import CommonNav from '../components/common-nav/index.vue';

const storeSetting = useSettingStore();
const sysConfigSwitch = computed(() => {
  return storeSetting.getSysConfigSwitch;
});

const settingSet = reactive({
  select: 'configBase',
  list: [
    {
      id: 'configBase',
      name: '基础配置'
    },{
      id: 'siteSource',
      name: '影视配置'
    },{
      id: 'iptvSource',
      name: '电视配置'
    },{
      id: 'analyzeSource',
      name: '解析配置'
    },{
      id: 'driveSource',
      name: '网盘配置'
    }
  ]
})

if (storeSetting.getSysConfigSwitch) {
  settingSet.select = storeSetting.getSysConfigSwitch;
}

watch(() => settingSet.select, (newValue) => {
  storeSetting.updateConfig({ sysConfigSwitch: newValue });
})

watch(() => sysConfigSwitch.value, (newValue) => {
  settingSet.select = newValue;
})

const changeClassEvent = (item) => {
  settingSet.select = item
}
</script>

<style lang="less" scoped>
.setting-container {
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  overflow: hidden;
  flex: 1 1;

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
