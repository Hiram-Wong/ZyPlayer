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
          </div>
        </div>
        <div class="right-operation-container">
          <div class="search">
            <t-input v-model="searchValue" placeholder="搜索频道资源" clearable @enter="refreshEvent(true)" @clear="refreshEvent(true)" class="search-bar">
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
      height="calc(100vh - 180px)"
      :data="iptvTableConfig.data"
      :sort="iptvTableConfig.sort"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === iptvTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #type="{ row }">
        <t-tag v-if="row.type === 'remote'" theme="success" shape="round" variant="light-outline">远程链接</t-tag>
        <t-tag v-else-if="row.type === 'local'" theme="warning" shape="round" variant="light-outline">本地文件</t-tag>
        <t-tag v-else-if="row.type === 'batches'" theme="danger" shape="round" variant="light-outline">手动配置</t-tag>
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
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { AddIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive } from 'vue';

import { fetchIptvPage, updateIptvItem, delIptvItem, addChannel, clearChannel } from '@/api/iptv';
import { setDefault } from '@/api/setting';
import { parseChannel } from '@/utils/channel';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd : false,
  dialogEdit : false
});

const searchValue = ref();
const formData = ref();

const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
  pageSize: 20,
  current: 1,
});

const iptvTableConfig = ref({
  data: [],
  sort: {},
  select: [],
  default: ''
})

const rehandleSelectChange = (val) => {
  iptvTableConfig.value.select = val;
};

const rehandlePageChange = (curr) => {
  pagination.current = curr.current;
  pagination.pageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  iptvTableConfig.value.sort = sortVal;
  iptvTableConfig.value.data = options.currentDataSource;
};

// Business Processing
const getData = async () => {
  try {
    const res = await fetchIptvPage(searchValue.value);
    if (_.has(res, 'default') && res["default"]) {
      iptvTableConfig.value.default = res.default;
    }
    if (_.has(res, 'data') && res["data"]) {
      iptvTableConfig.value.data = res.data;
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

const editEvent = (row) => {
  const index = row.rowIndex + pagination.pageSize * (pagination.current - 1)
  formData.value = iptvTableConfig.value.data[index];
  isVisible.dialogEdit = true;
};

const switchStatus = async(row) => {
  console.log(row.isActive);
  updateIptvItem(row.id, { isActive: row.isActive });
};

const removeEvent = (row) => {
  try {
    delIptvItem(row.id);
    refreshEvent();
    MessagePlugin.success('删除成功');
  } catch (err) {
    MessagePlugin.error(`删除源失败, 错误信息:${err}`);
  }
};

const removeAllEvent = () => {
  try {
    const { select } = iptvTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning('请先选择数据');
      return;
    }
    delIptvItem(select);
    refreshEvent();
    MessagePlugin.success('批量删除成功');
  } catch (err) {
    MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
  }
};

const emitReload = useEventBus<string>('iptv-reload');

const defaultEvent = async (row) => {
  const { id, url, type } = row;

  try {
    iptvTableConfig.value.default = id;
    await setDefault('defaultIptv', id);
    await clearChannel();
    const docs = await parseChannel(type, url);
    await addChannel(docs);

    MessagePlugin.success('设置成功');
    emitReload.emit('iptv-reload');
  } catch (err) {
    MessagePlugin.error(`设置失败, 错误信息:${err}`);
  }
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
      height: 32px;
      padding: 0 var(--td-comp-paddingLR-xs);
      background-color: var(--td-bg-input);
      border-radius: var(--td-radius-default);
      align-items: center;
      .item {
        border-radius: var(--td-radius-default);
        transition: all 0.2s ease 0s;
        display: flex;
        align-items: center;
        padding: 2px 4px;
        height: 22px;
        cursor: pointer;
        text-decoration: none;
      }
      .item:hover {
        color: var(--td-text-color-primary);
        background-color: var(--td-bg-color-component-hover);
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
