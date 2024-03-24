<template>
  <div class="setting-iptv-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="isVisible.dialogAdd = true">
              <add-icon />
              <span>添加</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <remove-icon />
              <span>删除</span>
            </div>
            <!-- <div class="item" @click="aliAuthEvent">
              <user-icon />
              <span>阿里授权</span>
            </div> -->
          </div>
        </div>
        <div class="right-operation-container">
          <div class="search">
            <t-input v-model="searchValue" placeholder="搜索网盘资源" clearable @enter="refreshEvent(true)" @clear="refreshEvent(true)" class="search-bar">
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
          </div>
        </div>
      </t-row>
    </div>
    <t-table
      row-key="id"
      :data="driveTableConfig.data"
      :sort="driveTableConfig.sort"
      height="calc(100vh - 180px)"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === driveTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="switchStatus(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="defaultEvent(slotProps.row)">默认</t-link> 
          <t-link theme="primary" @click="editEvent(slotProps)">编辑</t-link>
          <t-popconfirm content="确认删除吗" @confirm="removeEvent(slotProps.row)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>

    <dialog-add-view v-model:visible="isVisible.dialogAdd" @refresh-table-data="refreshEvent" />
    <dialog-edit-view v-model:visible="isVisible.dialogEdit" :data="formData" />
    <dialog-ali-auth-view v-model:visible="isVisible.dialogAliAuth" />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { AddIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive, watch } from 'vue';

import { fetchDrivePage, updateDriveItem, delDriveItem } from '@/api/drive';
import { setDefault } from '@/api/setting';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
// import DialogAliAuthView from './components/DialogAliAuth.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd: false,
  dialogEdit: false,
  dialogAliAuth: false,
});

const formData = ref();
const searchValue = ref();

const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
  pageSize: 20,
  current: 1,
});

const driveTableConfig = ref({
  data: [],
  sort: {},
  select: [],
  default: ''
})

const emitReload = useEventBus<string>('drive-reload');

watch(
  () => driveTableConfig.value.data,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitReload.emit('drive-reload');
    }
  }, {
    deep: true
  }
);

const rehandleSelectChange = (val) => {
  driveTableConfig.value.select = val;
};

const rehandlePageChange = (curr) => {
  pagination.current = curr.current;
  pagination.pageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  driveTableConfig.value.sort = sortVal;
  driveTableConfig.value.data = options.currentDataSource;
};

// Business Processing
const getData = async () => {
  try {
    const res = await fetchDrivePage(searchValue.value);
    if (_.has(res, 'default') && res["default"]) {
      driveTableConfig.value.default = res.default;
    }
    if (_.has(res, 'data') && res["data"]) {
      driveTableConfig.value.data = res.data;
    }
    if (_.has(res, 'total') && res["total"]) {
      pagination.total = res.total;
    }
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  getData();
});

const refreshEvent = (page = false) => {
  getData();
  if (page) pagination.current = 1;
};

const defaultEvent = async (row) => {
  try {
    await setDefault("defaultDrive", row.id)
    driveTableConfig.value.default = row.id;
    emitReload.emit('drive-reload');
    MessagePlugin.success('设置成功');
  } catch (err) {
    MessagePlugin.error(`设置默认源失败, 错误信息:${err}`);
  }
};

const editEvent = (row) => {
  const index = row.rowIndex + pagination.pageSize * (pagination.current - 1)
  formData.value = driveTableConfig.value.data[index];
  isVisible.dialogEdit = true;
};

const switchStatus = (row) => {
  console.log(row.isActive);
  updateDriveItem(row.id, { isActive: row.isActive });
};

const removeEvent = (row) => {
  try {
    delDriveItem(row.id);
    refreshEvent();
    MessagePlugin.success('删除成功');
  } catch (err) {
    MessagePlugin.error(`删除源失败, 错误信息:${err}`);
  }
};

const removeAllEvent = () => {
  try {
    const { select } = driveTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning('请先选择数据');
      return;
    }
    delDriveItem(select);
    refreshEvent();
    MessagePlugin.success('批量删除成功');
  } catch (err) {
    MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
  }
};


const aliAuthEvent = () => {
  isVisible.dialogAliAuth = true;
};
</script>

<style lang="less" scoped>
.setting-iptv-container {
  height: 100%;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
  .header {
    margin: var(--td-comp-margin-s) 0;
  }
  .left-operation-container {
    .component-op {
      display: flex;
      height: var(--td-comp-size-m);
      padding: 0 var(--td-comp-paddingLR-xs);
      background-color: var(--td-bg-content-input);
      border-radius: var(--td-radius-default);
      align-items: center;
      border-radius: var(--td-radius-medium);
      .item {
        color: var(--td-text-color-placeholder);
        border-radius: var(--td-radius-medium);
        display: flex;
        align-items: center;
        padding: 2px 4px;
        height: 22px;
        cursor: pointer;
        text-decoration: none;
        &:hover {
          transition: all 0.2s ease 0s;
          color: var(--td-text-color-primary);
          background-color: var(--td-bg-color-container-hover);
        }
      }
    }
  }

  :deep(.t-table) {
    background-color: var(--td-bg-color-container);
    tr {
      background-color: var(--td-bg-color-container);
      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }
  :deep(.t-table__header--fixed):not(.t-table__header--multiple) > tr > th {
    background-color: var(--td-bg-color-container);
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container);
  }
}
</style>
