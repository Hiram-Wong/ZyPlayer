<template>
  <div class="setting-shortcut-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-space>
            <span></span>
            <span>说明：</span>
            <t-tag shape="mark" theme="primary" variant="light-outline">control = ctrl</t-tag>
            <t-tag shape="mark" theme="primary" variant="light-outline">option = alt</t-tag>
          </t-space>
        </div>
        <div class="right-operation-container">
          <!-- <div class="component-op">
            <div class="item" @click="exportEvent">
              <t-icon size="1.5em" name="arrow-up" />
              <span>导出</span>
            </div>
            <div class="item" @click="importEvent">
              <t-icon size="1.5em" name="arrow-down" />
              <span>导入</span>
            </div>
            <div class="item" @click="resetEvent">
              <t-icon size="1.5em" name="clear" />
              <span>重置</span>
            </div>
          </div> -->
        </div>
      </t-row>
    </div>
    <t-table
      row-key="name"
      :data="emptyData ? [] : data"
      :columns="COLUMNS"
      :editable-cell-state="editableCellState"
      :header-affixed-top="{ offsetTop: 0, container: `.setting-shortcut-container` }"
    />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { shortcut } from '@/lib/dexie';
import { COLUMNS } from './constants';

// Define table table
const emptyData = ref(false);
const data = ref([]);
const editableCellState = (cellParams) => {
  // 第一行不允许编辑
  const { row } = cellParams;
  return row.status !== 2;
};

// Business Processing
const getShortcut = () => {
  shortcut.all().then((res) => {
    if (!res) emptyData.value = true;
    data.value = res;
  });
};
onMounted(() => {
  getShortcut();
});

// op
// const exportEvent = () => {};
// const importEvent = () => {};
// const resetEvent = () => {};
</script>

<style lang="less" scoped>
@import '@/style/variables';
.setting-shortcut-container {
  .header {
    margin-bottom: 20px;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
  }
}
.component-op {
  display: flex;
  padding: 4px;
  height: 40px;
  background: #f0f0f0;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  color: #161616;
  align-items: center;
  box-shadow: 10px;
  margin-right: 20px;
  .item {
    border-radius: 5px;
    transition: all 0.2s ease 0s;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    line-height: 22px;
    cursor: pointer;
    text-decoration: none;
  }
  .item:hover {
    background: #dcdcdc;
  }
}
:root[theme-mode='dark'] {
  .component-op {
    background: #484848;
    color: #eee;
    .item:hover {
      background: #5e5e5e;
    }
  }
}
</style>
