<template>
  <div class="setting-container">
    <div class="content">
      <div class="container">
        <analyze-view class="container-item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useSettingStore } from '@/store';

import analyzeView from './setting/analyze/AnalyzeSetting.vue';

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
      img{
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
          color: rgba(37,38,43,.72);
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
