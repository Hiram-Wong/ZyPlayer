<template>
  <div class="setting-container">
    <div class="nav-sub-tab">
      <div class="nav-sub-tab-top">
        <ul class="nav-menu">
          <li class="nav-menu-item" :class=" settingSet.select === item.key ? 'is-active' : ''" v-for="item in settingSet.list" :key="item.key" @click="changeClassEvent(item.key)">
            <div class="name-wrapper">
              <span>{{ item.value }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="nav-sub-tab-bottom"></div>
    </div>
    <div class="content">
      <header class="header">
        <div class="page-title">
          <p class="title">设置</p>
        </div>
        <div class="actions">
        </div>
      </header>
      <div class="container">
      <div class="content-wrapper">
        <base-view class="container-item" v-if="settingSet.select === 'configBase'"/>
        <site-view class="container-item" v-else-if="settingSet.select === 'siteSource'"/>
        <iptv-view class="container-item" v-else-if="settingSet.select === 'iptvSource'"/>
        <analyze-view class="container-item" v-else/>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import analyzeView from './setting/analyze/AnalyzeSetting.vue';
import baseView from './setting/base/BaseSetting.vue';
import iptvView from './setting/iptv/IptvSetting.vue';
import siteView from './setting/site/SiteSetting.vue';

const settingSet = reactive({
  select: 'configBase',
  list: [
    {
      key: 'configBase',
      value: '基础配置'
    },{
      key: 'siteSource',
      value: '站点配置'
    },{
      key: 'iptvSource',
      value: '直播配置'
    },{
      key: 'analyzeSource',
      value: '解析配置'
    }
  ]
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
  min-height: 0;
  overflow: hidden;
  flex: 1 1;

  .nav-sub-tab {
    width: 170px;
    border-right: 1px solid rgba(132,133,141,.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    z-index: 2;
    overflow: auto;
    .nav-sub-tab-top {
      .nav-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        line-height: 1.5;
        .nav-menu-item {
          width: 140px;
          height: 40px;
          padding-left: 8px;
          line-height: 14px;
          display: flex;
          align-items: center;
          color: var(--td-text-color-primary);
          cursor: pointer;
          transition: background-color .3s ease;
          border-radius: 10px;
          position: relative;
        }
        .is-active {
          background-color: rgba(132, 133, 141, 0.24);
        }
      }
    }
    .nav-sub-tab-bottom {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-bottom: 20px;
    }
  }

  .content {
    flex: 1 1;
    position: relative;
    overflow: hidden;
    .header {
      height: 40px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      justify-content: space-between;
      white-space: nowrap;
      flex-shrink: 0;
      .page-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-grow: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        .title {
          font-size: 18px;
          line-height: 1.4;
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
    }
    .container {
      height: calc(100% - 45px);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow-y: auto;
      width: 100%;
      .content-wrapper {
        width: 100%;
        height: 100%;
        padding: 0 40px;
        display: flex;
        flex-direction: column;
        position: relative;
        flex-grow: 1;
      }
    }
  }
}
</style>
