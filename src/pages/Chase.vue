<template>
  <div class="chase-container mx-auto">
    <div class="chase-container-left">
      <t-tabs v-model="chaseTag">
        <t-tab-panel value="history" label="历史记录">
          <history-view ref="historyRef" class="container-item" />
        </t-tab-panel>
        <t-tab-panel value="binge" label="我的收藏">
          <binge-view ref="bingeRef" class="container-item" />
        </t-tab-panel>
      </t-tabs>
    </div>
    <div class="chase-container-right">
      <div class="chase-container-op">
        <div v-if="chaseTag === 'binge'" class="check-update chase-container-op-item">
          <t-button theme="default" @click="checkUpdaterEvent">
            <span>更新</span>
            <template #icon>
              <time-icon />
            </template>
          </t-button>
        </div>
        <div class="clear chase-container-op-item">
          <t-button theme="default" @click="clearEvent">
            <span>清空</span>
            <template #icon>
              <delete-icon />
            </template>
          </t-button>
        </div>
      </div>
    </div>
    <div class="chase-container-dialog"></div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { DeleteIcon, TimeIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { star, history } from '@/lib/dexie';
import bingeView from './chase/binge/Binge.vue';
import historyView from './chase/history/History.vue';

const chaseTag = ref('history');
const bingeRef = ref(null);
const historyRef = ref(null);

// 一键清空
const clearEvent = () => {
  const confirmDia = DialogPlugin({
    body: '确认删除所有记录吗?',
    header: false,
    width: '300px',
    placement: 'center',
    attach: '.chase-container-dialog',
    onConfirm: () => {
      if (chaseTag.value === 'binge') {
        star.clear();
        bingeRef.value.clearEvent();
      } else if (chaseTag.value === 'history') {
        history.clear();
        historyRef.value.clearEvent();
      }
      MessagePlugin.success('删除成功');
      confirmDia.hide();
    },
    onClose: ({ e, trigger }) => {
      console.log('e: ', e);
      console.log('trigger: ', trigger);
      confirmDia.hide();
    },
  });
};

// 检查更新
const checkUpdaterEvent = () => {
  bingeRef.value.checkUpdaterEvent();
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';
.chase-container {
  overflow: hidden;
  height: calc(100vh - var(--td-comp-size-l));
  position: relative;
  &-right {
    position: absolute;
    top: 15px;
    right: 10px;
    .chase-container-op {
      gap: 16px;
      display: flex;
    }
    .chase-container-op-item {
      width: inherit;
    }
  }
  &-dialog {
    :deep(.t-dialog__body) {
      text-align: center !important;
    }
    :deep(.t-dialog__footer) {
      padding: var(--td-comp-paddingTB-l) 0 !important;
    }
  }
  .container-item {
    height: calc(86vh);
    overflow: auto;
    padding: 10px 0;
  }
  .t-tabs {
    background-color: rgba(0, 0, 0, 0) !important;
    :deep(.t-tabs__nav-container.t-is-top:after) {
      background-color: rgba(0, 0, 0, 0) !important;
    }
  }

  :deep(.t-tabs__nav-container) {
    padding-bottom: 10px !important;
  }
}
</style>
