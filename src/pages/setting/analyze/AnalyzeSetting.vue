<template>
  <div class="setting-analyze-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-tag size="large" shape="mark">添加源后需设置默认哟！</t-tag>
        </div>
        <div class="right-operation-container">
          <div class="component-op">
            <div class="item" @click="exportEvent">
              <arrow-up-icon size="1.5em" />
              <span>导出</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <remove-icon size="1.5em" />
              <span>删除</span>
            </div>
            <div class="item" @click="formDialogVisibleAddAnalyze = true">
              <add-icon size="1.5em" />
              <span>添加</span>
            </div>
            <div class="item" @click="flagEvent">
              <discount-icon size="1.5em" />
              <span>标识</span>
            </div>
          </div>
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
      :header-affixed-top="{ offsetTop: 0, container: `.setting-analyze-container` }"
      :reserve-selected-row-on-paginate="false"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === defaultAnalyze" size="small" :offset="[-5, 0]" count="默认">{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <!-- <template #type="{ row }">
        <span v-if="row.type === 0">普通</span>
        <span v-if="row.type === 1">json</span>
        <span v-if="row.type === 2">多json</span>
        <span v-if="row.type === 3">聚合</span>
      </template> -->
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #ext="{ row }">
        <span v-for="item in row.ext" :key="item.id">{{ item }},</span>
      </template>
      <template #op="slotProps">
        <a class="t-button-link" @click="defaultEvent(slotProps)">默认</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <a class="t-button-link" @click="removeEvent(slotProps)">删除</a>
      </template>
    </t-table>
    <dialog-add-view v-model:visible="formDialogVisibleAddAnalyze" :data="data" @refresh-table-data="getAnalyze" />
    <dialog-edit-view v-model:visible="formDialogVisibleEditAnalyze" :data="formData" />
    <dialog-flag-view
      v-model:visible="formDialogVisibleFlagAnalyze"
      :data="analyzeFlagData"
      @receive-flag-data="setAnalyzeFlag"
    />
  </div>
</template>
<script setup lang="ts">
import { dialog, path } from '@tauri-apps/api';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { useEventBus } from '@vueuse/core';
import { AddIcon, ArrowUpIcon, DiscountIcon, RemoveIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { analyze, setting } from '@/lib/dexie';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import DialogFlagView from './components/DialogFlag.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const formDialogVisibleAddAnalyze = ref(false);
const formDialogVisibleEditAnalyze = ref(false);
const formDialogVisibleFlagAnalyze = ref(false);
const formData = ref();
const defaultAnalyze = ref();
const analyzeFlagData = ref([]);
const sort = ref();

// Define table
const emptyData = ref(false);
const dataLoading = ref(false);
const data = ref([]);
const pagination = ref({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
});
const selectedRowKeys = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
};

onMounted(() => {
  getAnalyze();
  getAnalyzeFlag();
});

const rehandlePageChange = (curr) => {
  pagination.value.defaultCurrent = curr.current;
  pagination.value.defaultPageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  sort.value = sortVal;
  data.value = options.currentDataSource;
};

// 获取列表
const getAnalyze = async () => {
  dataLoading.value = true;
  defaultAnalyze.value = await setting.get('defaultAnalyze');
  try {
    analyze.pagination().then((res) => {
      if (!res) emptyData.value = true;
      data.value = res.list;
      pagination.value.total = res.total;
    });
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

// 获取标识
const getAnalyzeFlag = async () => {
  analyzeFlagData.value = await setting.get('analyzeFlag');
};

// 是否启用
const propChangeEvent = (row) => {
  analyze.update(row.id, { isActive: row.isActive });
};

// 编辑
const editEvent = (row) => {
  formData.value = data.value[row.rowIndex + pagination.value.defaultPageSize * (pagination.value.defaultCurrent - 1)];
  formDialogVisibleEditAnalyze.value = true;
};

const flagEvent = () => {
  formDialogVisibleFlagAnalyze.value = true;
};

const setAnalyzeFlag = (item) => {
  const itemJson = JSON.parse(JSON.stringify(item));
  console.log(itemJson);
  analyzeFlagData.value = itemJson;
  setting.update({ analyzeFlag: itemJson });
};

// 删除
const removeEvent = (row) => {
  analyze
    .remove(row.row.id)
    .then(() => {
      getAnalyze();
      MessagePlugin.success('删除成功');
    })
    .catch((err) => {
      MessagePlugin.error(`删除源失败, 错误信息:${err}`);
    });
};

// 批量删除
const removeAllEvent = () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择数据');
    return;
  }
  selectedRowKeys.value.forEach((element) => {
    console.log(element);
    analyze.remove(element).catch((err) => {
      MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
    });
  });
  getAnalyze();
  MessagePlugin.success('批量删除成功');
};

// 导出接口
const exportEvent = async () => {
  try {
    const saveResult = await dialog.save({
      defaultPath: 'analyze.json',
      filters: [
        {
          name: 'JSON Files',
          extensions: ['json'],
        },
      ],
    });

    if (saveResult) {
      const outputPath = await path.resolve(saveResult);
      const arr = [...data.value];
      const serializedJson = JSON.stringify(arr, null, 2);
      const encodedData = new TextEncoder().encode(serializedJson);
      await writeBinaryFile(outputPath, encodedData);

      MessagePlugin.success('success');
    }
  } catch (err) {
    MessagePlugin.error(`fail:${err}`);
  }
};

const emitReload = useEventBus<string>('analyze-reload');

// 设置默认接口
const defaultEvent = async (row) => {
  setting.update({
    defaultAnalyze: row.row.id,
  });
  defaultAnalyze.value = row.row.id;
  emitReload.emit('analyze-reload');
  MessagePlugin.success('设置成功');
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
.setting-analyze-container {
  height: calc(100vh - var(--td-comp-size-l));
  .header {
    margin: 0 10px 10px 10px;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
  }
  .right-operation-container {
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
    background-color: var(--td-bg-color-container);
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container);
  }
}
</style>
