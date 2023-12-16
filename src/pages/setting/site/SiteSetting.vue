<template>
  <div class="setting-site-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="formDialogVisibleAddApi = true">
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
            <t-input v-model="searchValue" placeholder="搜索站点资源" clearable @enter="refreshEvent"  class="search-bar">
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
      :data="data"
      :sort="sort"
      height="calc(100vh - 205px)"
      table-layout="auto"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === defaultSite" size="small" :offset="[-5, 0]" count="默">{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
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
        <a class="t-button-link" @click="defaultEvent(slotProps.row)">默认</a>
        <a class="t-button-link" @click="checkSingleEvent(slotProps.row)">检测</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <t-popconfirm content="确认删除吗" @confirm="removeEvent(slotProps.row)">
          <a class="t-button-link">删除</a>
        </t-popconfirm>
      </template>
    </t-table>
    <dialog-add-view
      v-model:visible="formDialogVisibleAddApi"
      :data="data"
      :group="formGroup"
      @refresh-table-data="refreshEvent"
    />
    <dialog-edit-view
      v-model:visible="formDialogVisibleEditSite"
      :data="formData"
      :group="formGroup"
      @refresh-table-group="getGroup"
    />
  </div>
</template>
<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { AddIcon, ArrowUpIcon, RefreshIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive } from 'vue';
import _ from 'lodash';

import { setting, sites } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

const remote = window.require('@electron/remote');

// Define item form data & dialog status
const formDialogVisibleAddApi = ref(false);
const formDialogVisibleEditSite = ref(false);
const formData = ref();
const formGroup = ref();
const sort = ref();
const searchValue = ref();

// Define table
const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
});
const data = ref([]);
const selectedRowKeys = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
};
const defaultSite = ref();

// Business Processing
const getSites = async () => {
  defaultSite.value = await setting.get('defaultSite');
  try {
    const res = await sites.pagination(searchValue.value);
    data.value = res.list;
    pagination.total = res.total;
  } catch (e) {
    console.log(e);
  }
};

// 获取分类
const getGroup = () => {
  sites.group().then((res) => {
    formGroup.value = res;
  });
};

onMounted(() => {
  refreshEvent();
});

const refreshEvent = () => {
  getSites();
  getGroup();
};

// op
const propChangeEvent = async(row) => {
  console.log(row.isActive);
  await sites.update(row.id, { isActive: row.isActive });
};

const checkAllSite = async () => {
  let checkData = [];
  if (selectedRowKeys.value.length === 0) {
    checkData = [...data.value]
  } else {
    selectedRowKeys.value.forEach((item) => {
      const res = _.find(data.value, {id: item})
      checkData.push(res)
    })
  }
  try {
    await Promise.all(checkData.map((site) => checkSingleEvent(site, true)));
    emitReload.emit('film-reload');
    MessagePlugin.success('状态批量检测完成');
  } catch (err) {
    MessagePlugin.error(`状态批量检测失败, 错误信息:${err}`);
  }
};

const checkSingleEvent = async (row, all = false) => {
  const { status, resource } = await zy.check(row.key); // 检测状态
  row.isActive = status; // 检测是否开启变更状态
  row.resource = resource;
  await sites.update(row.id, row);
  if (!all) {
    emitReload.emit('film-reload');
    MessagePlugin.success('源站检测完成,自动重置状态!');
  }
  return status;
};

const rehandlePageChange = (curr) => {
  pagination.defaultCurrent = curr.current;
  pagination.defaultPageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  sort.value = sortVal;
  data.value = options.currentDataSource;
};

const editEvent = (row) => {
  formData.value = data.value[row.rowIndex + pagination.defaultPageSize * (pagination.defaultCurrent - 1)];
  formDialogVisibleEditSite.value = true;
};

const removeEvent = async (row) => {
  try {
    await sites.remove(row.id);
    refreshEvent();
    MessagePlugin.success('删除成功');
  } catch (err) {
    MessagePlugin.error(`删除源失败, 错误信息:${err}`);
  }
};

const removeAllEvent = () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择数据');
    return;
  }
  selectedRowKeys.value.forEach((element) => {
    console.log(element);
    sites.remove(element).catch((err) => {
      MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
    });
  });
  refreshEvent();
  MessagePlugin.success('批量删除成功');
};

const emitReload = useEventBus<string>('film-reload');

const defaultEvent = async (row) => {
  await setting.update({ defaultSite: row.id });
  defaultSite.value = row.id;
  emitReload.emit('film-reload');
  MessagePlugin.success('设置成功');
};
</script>

<style lang="less" scoped>
.setting-site-container {
  height: calc(100vh - var(--td-comp-size-l));
  .header {
    margin: var(--td-comp-margin-s) 0;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
    cursor: pointer;
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
      height: 32px;
      padding: 0 var(--td-comp-paddingLR-xs);
      background-color: var(--td-bg-input);
      backdrop-filter: blur(10px);
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
    background-color: var(--td-bg-color-container) !important;
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container) !important;
  }
}
</style>
