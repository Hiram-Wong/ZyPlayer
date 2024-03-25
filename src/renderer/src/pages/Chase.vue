<template>
  <div class="chase view-container">
    <header class="header">
      <div class="page-title">
        <p class="title">过刻</p>
        <div class="container">
          <t-radio-group v-model="chaseTag" variant="default-filled" size="small">
          <t-radio-button value="history">看过</t-radio-button>
          <t-radio-button value="binge">收藏</t-radio-button>
        </t-radio-group>
        </div>
      </div>
      <div class="actions">
        <div v-if="chaseTag === 'binge'" class="check-update chase-container-op-item">
          <t-button theme="default" size="small" @click="checkUpdaterEvent">
            <span>更新</span>
            <template #icon>
              <time-icon />
            </template>
          </t-button>
        </div>
      </div>
    </header>
    <div class="layout-container" id="back-top">
      <div class="layout-content-wrapper">
        <history-view ref="historyRef" class="container-item" v-if="chaseTag === 'history'"/>
        <binge-view ref="bingeRef" class="container-item" v-else/>
      </div>
    </div>
    
    <t-back-top
      container="#back-top"
      size="small"
      :offset="['1.4rem', '0.5rem']"
      :duration="2000"
    />
  </div>
</template>
<script setup lang="ts">
import { TimeIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

import bingeView from './chase/binge/Binge.vue';
import historyView from './chase/history/History.vue';

const chaseTag = ref('history');
const bingeRef = ref(null);
const historyRef = ref(null);

// 检查更新
const checkUpdaterEvent = () => {
  bingeRef.value.checkUpdaterEvent();
};
</script>

<style lang="less" scoped>
.view-container {
  width: 100%;
  height: 100%;
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
      .container {
        width: 128px;
        height: 26px;
        margin-left: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
    }
    .actions {
      flex-shrink: 0;
      display: flex;
      height: 32px;
      justify-content: flex-end;
      gap: 5px;
      align-items: center;
    }
  }

  .layout-container {
    height: calc(100% - 45px);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    .layout-content-wrapper {
      width: 100%;
      height: 100%;
      padding: 0 40px;
      display: flex;
      flex-direction: column;
      position: relative;
      flex-grow: 1;
    }
  }

  &-dialog {
    :deep(.t-dialog__body) {
      text-align: center;
    }
  }
}
</style>
