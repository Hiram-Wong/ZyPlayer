<template>
  <div class="setting-container">
    <t-tabs v-model="settingTag">
      <t-tab-panel value="ConfigBase" label="基础配置">
        <base-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="iptvSource" label="直播源">
        <iptv-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="siteSource" label="站点源">
        <site-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="analyze" label="解析源">
        <analyze-view class="container-item" />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import baseView from './setting/base/BaseSetting.vue';
import iptvView from './setting/iptv/IptvSetting.vue';
import siteView from './setting/site/SiteSetting.vue';
import analyzeView from './setting/analyze/AnalyzeSetting.vue';

const settingTag = ref('ConfigBase');
</script>

<style lang="less" scoped>
@import '@/style/variables';

:deep(.t-radio-group.t-size-m .t-radio-button) {
  height: auto;
}

.setting-container {
  overflow: hidden;
  .container-item {
    height: calc(86vh);
    overflow: auto;
    padding: 20px 0;
  }
  .t-tabs {
    background-color: rgba(0, 0, 0, 0) !important;
    :deep(.t-tabs__nav-container.t-is-top:after) {
      background-color: rgba(0, 0, 0, 0) !important;
    }
  }
}
</style>
