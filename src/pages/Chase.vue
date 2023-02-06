<template>
  <div class="chase-container mx-auto">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div>
            <t-button theme="default" @click="clearEvent">
              <template #icon> <clear-icon /> </template>清空
            </t-button>
          </div>
        </div>
        <div class="right-operation-container">
          <div class="component-op">
            <t-radio-group v-model="selectView" variant="default-filled">
              <t-radio-button value="binge"><star-icon class="icon" />在追</t-radio-button>
              <t-radio-button value="history"><time-icon class="icon" />历史</t-radio-button>
            </t-radio-group>
          </div>
        </div>
      </t-row>
    </div>
    <div class="main">
      <div v-if="selectView == 'binge'">
        <binge-view />
      </div>
      <div v-if="selectView == 'history'">
        <history-view />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { ClearIcon, TimeIcon, StarIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { star, history } from '@/lib/dexie';
import bingeView from './chase/binge/Binge.vue';
import historyView from './chase/history/History.vue';

const selectView = ref('binge');
const clearEvent = async () => {
  if (selectView.value === 'binge') {
    await star.clear();
    MessagePlugin.success('在追列表清空');
  } else if (selectView.value === 'history') {
    await history.clear();
    MessagePlugin.success('历史浏览清空');
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';
.icon {
  margin-right: 2px;
}
.chase-container {
  .header {
    height: 50px;
    padding: 0 30px 0 5px !important;
  }
}
</style>
