<template>
  <div class="setting-site-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="formDialogVisibleAddApi = true">
              <add-icon size="1.5em" />
              <span>添加</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <remove-icon size="1.5em" />
              <span>删除</span>
            </div>
            <div class="item" @click="exportEvent">
              <arrow-up-icon size="1.5em" />
              <span>导出</span>
            </div>
            <div class="item" @click="checkAllSite">
              <refresh-icon size="1.5em" />
              <span>检测</span>
            </div>
          </div>
        </div>
        <div class="right-operation-container">
          <t-input v-model="searchValue" placeholder="请输入搜索关键词" clearable @enter="refreshEvent">
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
        </div>
      </t-row>
    </div>
    <t-table
      row-key="id"
      :data="emptyData ? [] : data"
      :sort="sort"
      height="calc(100vh - 240px)"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      :loading="dataLoading"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === defaultSite" size="small" :offset="[-5, 0]" count="默认">{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #search="{ row }">
        <t-tag v-if="row.search === 0" shape="round" theme="danger" variant="light-outline">关闭</t-tag>
        <t-tag v-else-if="row.search === 1" theme="success" shape="round" variant="light-outline">聚合</t-tag>
        <t-tag v-else-if="row.search === 2" theme="warning" shape="round" variant="light-outline">本站</t-tag>
      </template>
      <template #status="{ row }">
        <t-tag v-if="row.status" shape="round" theme="success" variant="light-outline">可用</t-tag>
        <t-tag v-else theme="danger" shape="round" variant="light-outline">失效</t-tag>
      </template>
      <template #op="slotProps">
        <a class="t-button-link" @click="defaultEvent(slotProps)">默认</a>
        <a class="t-button-link" @click="checkSingleEvent(slotProps)">检测</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <a class="t-button-link" @click="removeEvent(slotProps)">删除</a>
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
import { onMounted, ref } from 'vue';

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
const isCheckStatusChangeActive = ref();
const formGroup = ref();
const sort = ref();
const searchValue = ref();

// Define table
const emptyData = ref(false);
const dataLoading = ref(false);
const pagination = ref({
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
  dataLoading.value = true;
  defaultSite.value = await setting.get('defaultSite');
  try {
    const res = await sites.pagination(searchValue.value);
    if (!res) emptyData.value = true;
    data.value = res.list;
    pagination.value.total = res.total;
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

// 获取分类
const getGroup = () => {
  sites.group().then((res) => {
    formGroup.value = res;
  });
};

const getCheckStatusChangeActive = () => {
  setting.get('defaultCheckModel').then((res) => {
    isCheckStatusChangeActive.value = res;
  });
};

onMounted(() => {
  getSites();
  getGroup();
  getCheckStatusChangeActive();
});

const refreshEvent = () => {
  getSites();
  getGroup();
};
// op
const propChangeEvent = (row) => {
  console.log(row.isActive);
  sites.update(row.id, { isActive: row.isActive });
};

const checkAllSite = async () => {
  const uncheckedList = data.value.filter((e) => e.status === undefined || e.status === ' '); // 未检测过的优先
  const other = data.value.filter((e) => !uncheckedList.includes(e));
  await Promise.all(uncheckedList.map((site) => checkSingleEvent(site, true)));
  await Promise.all(other.map((site) => checkSingleEvent(site, true))).then(() => {
    getSites();
    MessagePlugin.success('源站批量检测完成,自动重置状态!');
  });
};

const checkSingleEvent = async (row, all = false) => {
  let res;
  if (!all) res = row.row;
  else res = row;

  const souceStatus = res.isActive; // 原状态
  const resultStatus = await zy.check(res.key); // 检测状态
  if (isCheckStatusChangeActive.value) res.isActive = resultStatus; // 检测是否开启变更状态
  res.status = resultStatus;
  console.log(souceStatus, resultStatus);
  if (souceStatus !== resultStatus) {
    console.log(res);
    sites.update(res.id, res);
  }
  if (!all) MessagePlugin.success('源站检测完成,自动重置状态!');
  return res.status;
};

const rehandlePageChange = (curr) => {
  pagination.value.defaultCurrent = curr.current;
  pagination.value.defaultPageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  sort.value = sortVal;
  data.value = options.currentDataSource;
};

const editEvent = (row) => {
  formData.value = data.value[row.rowIndex + pagination.value.defaultPageSize * (pagination.value.defaultCurrent - 1)];
  formDialogVisibleEditSite.value = true;
};

const removeEvent = (row) => {
  sites
    .remove(row.row.id)
    .then(() => {
      getSites();
      getGroup();
      MessagePlugin.success('删除成功');
    })
    .catch((err) => {
      MessagePlugin.error(`删除源失败, 错误信息:${err}`);
    });
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
  getSites();
  getGroup();
  MessagePlugin.success('批量删除成功');
};

const exportEvent = () => {
  const arr = [...data.value];
  const str = JSON.stringify(arr, null, 2);
  const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  const reader = new FileReader();
  reader.onload = () => {
    const result: ArrayBuffer = reader.result as ArrayBuffer;
    const buffer = Buffer.from(result);
    remote.dialog
      .showSaveDialog(remote.getCurrentWindow(), {
        defaultPath: 'sites.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      })
      .then((saveDialogResult) => {
        if (!saveDialogResult.canceled) {
          const { filePath } = saveDialogResult;
          const fs = remote.require('fs');
          fs.writeFile(filePath, buffer, 'utf-8', (err) => {
            if (err) {
              console.error('Failed to save file:', err);
              MessagePlugin.error('Failed to save file');
            } else {
              console.log('File saved successfully');
              MessagePlugin.success('File saved successfully');
            }
          });
        }
      })
      .catch((err) => {
        console.error('Failed to open save dialog:', err);
        MessagePlugin.error('Failed to open save dialog');
      });
  };
  reader.readAsArrayBuffer(blob);
};

const emitReload = useEventBus<string>('film-reload');

const defaultEvent = async (row) => {
  setting.update({
    defaultSite: row.row.id,
  });
  defaultSite.value = row.row.id;
  emitReload.emit('film-reload');
  MessagePlugin.success('设置成功');
};
</script>

<style lang="less" scoped>
.setting-site-container {
  height: calc(100vh - var(--td-comp-size-l));
  overflow: auto;

  .header {
    margin: 0 10px 10px 10px;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
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
      padding: 4px;
      height: 40px;
      background-color: var(--td-bg-input);
      backdrop-filter: blur(10px);
      border-radius: 6px;
      align-items: center;
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
