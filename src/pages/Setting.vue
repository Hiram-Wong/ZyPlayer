<template>
  <div class="setting-container">
    <t-tabs v-model="settingTag">
      <t-tab-panel value="ConfigBase" label="基础配置">
        <base-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="siteSource" label="站点源">
        <site-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="iptvSource" label="直播源">
        <iptv-view class="container-item" />
      </t-tab-panel>
      <t-tab-panel value="analyze" label="解析源">
        <analyze-view class="container-item" />
      </t-tab-panel>
      <!-- <t-tab-panel value="lab" label=" 实验室">
        <lab-view class="container-item" />
      </t-tab-panel> -->
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import analyzeView from './setting/analyze/AnalyzeSetting.vue';
import baseView from './setting/base/BaseSetting.vue';
import iptvView from './setting/iptv/IptvSetting.vue';
// import labView from './setting/lab/labSetting.vue';
import siteView from './setting/site/SiteSetting.vue';

const settingTag = ref('ConfigBase');
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.setting-container {
  overflow: hidden;
  height: calc(100vh - var(--td-comp-size-l));

  .container-item {
    height: calc(100vh - var(--td-comp-size-l) - var(--td-comp-size-xxl));
    overflow: auto;
    padding: 20px 0;
  }

  :deep(.t-tabs) {
    background-color: var(--td-bg-color-specialcomponent);
    .t-tabs__nav-container.t-is-top:after {
      background-color: var(--td-bg-color-specialcomponent);
    }
  }
}
</style>
