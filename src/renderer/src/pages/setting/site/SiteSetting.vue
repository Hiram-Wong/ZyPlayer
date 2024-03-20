<template>
  <div class="setting-site-container">
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
            <div class="item" @click="checkAllSite">
              <refresh-icon />
              <span>检测</span>
            </div>
          </div>
        </div>
        <div class="right-operation-container">
          <div class="search">
            <t-input v-model="searchValue" placeholder="搜索站点资源" clearable @enter="refreshEvent(true)" @clear="refreshEvent(true)" class="search-bar">
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
      :data="siteTableConfig.data"
      :sort="siteTableConfig.sort"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === siteTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="switchStatus(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #resource="{ row }">
        <span v-if="row.resource">{{ row.resource }}</span>
        <span v-else>无数据</span>
      </template>
      <template #search="{ row }">
        <t-tag v-if="row.search === 0" shape="round" theme="danger" variant="light-outline">关闭</t-tag>
        <t-tag v-else-if="row.search === 1" theme="success" shape="round" variant="light-outline">聚合</t-tag>
        <t-tag v-else-if="row.search === 2" theme="warning" shape="round" variant="light-outline">本站</t-tag>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="defaultEvent(slotProps.row)">默认</t-link>
          <t-link theme="primary" @click="checkSingleEvent(slotProps.row)">检测</t-link>
          <t-link theme="primary" @click="editEvent(slotProps)">编辑</t-link>
          <t-popconfirm content="确认删除吗" @confirm="removeEvent(slotProps.row)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <dialog-add-view
      v-model:visible="isVisible.dialogAdd"
      :group="siteTableConfig.group"
      @refresh-table-data="refreshEvent"
    />
    <dialog-edit-view
      v-model:visible="isVisible.dialogEdit"
      :data="formData"
      :group="siteTableConfig.group"
      @refresh-table-data="refreshEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { AddIcon, RefreshIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive, watch } from 'vue';
import _ from 'lodash';

import { fetchSitePage, updateSiteItem, delSiteItem } from '@/api/site';
import { setDefault } from '@/api/setting';
import { checkValid } from '@/utils/cms';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd : false,
  dialogEdit : false
})

const formData = ref();
const searchValue = ref();

// Define table
const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
  pageSize: 20,
  current: 1,
});

const siteTableConfig = ref({
  data: [],
  sort: {},
  select: [],
  default: '',
  group: []
})

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

const rehandleSelectChange = (val) => {
  siteTableConfig.value.select = val;
};

const emitReload = useEventBus<string>('film-reload');

watch(
  () => siteTableConfig.value.data,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitReload.emit('film-reload');
    }
  }, {
    deep: true
  }
);

// Business Processing
const getData = async () => {
  try {
    const res = await fetchSitePage(searchValue.value);
    if (_.has(res, 'default') && res["default"]) {
      siteTableConfig.value.default = res.default;
    }
    if (_.has(res, 'data') && res["data"]) {
      siteTableConfig.value.data = res.data;
      siteTableConfig.value.group = _.uniqBy(res.data, 'group').map(item => ({ label: item.group, value: item.group }));
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

// op
const checkAllSite = async () => {
  let checkData = [];
  const { select, data } = siteTableConfig.value;
  if (select.length === 0) {
    checkData = [...data]
  } else {
    select.forEach((item) => {
      const res = _.find(data, {id: item})
      checkData.push(res)
    })
  }
  MessagePlugin.info('状态批量检测中, 请等待完成')
  try {
    await Promise.all(checkData.map(item => queue.add(() => checkSingleEvent(item, true))));
    emitReload.emit('film-reload');
    MessagePlugin.success('状态批量检测完成, 并设置状态');
  } catch (err) {
    MessagePlugin.error(`状态批量检测失败, 错误信息:${err}`);
  }
};

const checkSingleEvent = async (row, all = false) => {
  const { status, resource } = await checkValid(row); // 检测状态
  row.isActive = status; // 检测是否开启变更状态
  updateSiteItem(row.id, { isActive: row.isActive });
  row.resource = resource;
  if (!all) {
    emitReload.emit('film-reload');
    MessagePlugin.success('源站检测完成,自动重置状态!');
  }
  return status;
};

const rehandlePageChange = (curr) => {
  pagination.current = curr.current;
  pagination.pageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  siteTableConfig.value.sort = sortVal;
  siteTableConfig.value.data = options.currentDataSource;
};

const editEvent = (row) => {
  const index = row.rowIndex + pagination.pageSize * (pagination.current - 1)
  formData.value = siteTableConfig.value.data[index];
  isVisible.dialogEdit = true;
};

const switchStatus = async(row) => {
  console.log(row.isActive);
  updateSiteItem(row.id, { isActive: row.isActive });
};

const removeEvent = async (row) => {
  try {
    delSiteItem(row.id);
    refreshEvent();
    MessagePlugin.success('删除成功');
  } catch (err) {
    MessagePlugin.error(`删除源失败, 错误信息:${err}`);
  }
};

const removeAllEvent = () => {
  try {
    const { select } = siteTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning('请先选择数据');
      return;
    }
    delSiteItem(select);
    refreshEvent();
    MessagePlugin.success('批量删除成功');
  } catch (err) {
    MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
  }
};

const defaultEvent = async (row) => {
  try {
    await setDefault("defaultSite", row.id);
    siteTableConfig.value.default = row.id;
    emitReload.emit('film-reload');
    MessagePlugin.success('设置成功');
  } catch (err) {
    MessagePlugin.error(`设置默认源失败, 错误信息:${err}`);
  }
};
</script>

<style lang="less" scoped>
.setting-site-container {
  height: 100%;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
  .header {
    margin: var(--td-comp-margin-s) 0;
  }
  .default-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: var(--td-radius-circle);
    background-color: var(--td-error-color);
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
    background-color: var(--td-bg-color-container) !important;
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container) !important;
  }
}
</style>
