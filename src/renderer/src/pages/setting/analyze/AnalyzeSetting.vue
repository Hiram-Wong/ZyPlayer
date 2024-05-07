<template>
  <div class="setting-analyze-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="isVisible.dialogAdd = true">
              <add-icon />
              <span>{{ $t('pages.setting.header.add') }}</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <remove-icon />
              <span>{{ $t('pages.setting.header.delete') }}</span>
            </div>
            <div class="item" @click="isVisible.dialogFlag = true">
              <discount-icon />
              <span>{{ $t('pages.setting.header.flag') }}</span>
            </div>
          </div>
        </div>
        <div class="right-operation-container">
          <div class="search">
            <t-input v-model="searchValue" :placeholder="$t('pages.setting.header.search')" clearable
              @enter="refreshEvent(true)" @clear="refreshEvent(true)" class="search-bar">
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
          </div>
        </div>
      </t-row>
    </div>
    <t-table row-key="id" :data="analyzeTableConfig.data" :sort="analyzeTableConfig.sort" height="calc(100vh - 180px)"
      :columns="COLUMNS" :hover="true" :pagination="pagination" @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange" @page-change="rehandlePageChange">
      <template #name="{ row }">
        <t-badge v-if="row.id === analyzeTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name
          }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #type="{ row }">
        <t-tag v-if="row.type === 0" shape="round" theme="danger" variant="light-outline">{{
          $t('pages.setting.table.analyze.web') }}</t-tag>
        <t-tag v-else-if="row.type === 1" theme="success" shape="round" variant="light-outline">{{
          $t('pages.setting.table.analyze.json') }}</t-tag>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="switchStatus(row)" />
      </template>
      <template #ext="{ row }">
        <span v-for="item in row.ext" :key="item.id">{{ item }},</span>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="defaultEvent(slotProps.row)">{{ $t('pages.setting.table.default') }}</t-link>
          <t-link theme="primary" @click="editEvent(slotProps)">{{ $t('pages.setting.table.edit') }}</t-link>
          <t-popconfirm :content="$t('pages.setting.table.deleteTip')" @confirm="removeEvent(slotProps.row)">
            <t-link theme="danger">{{ $t('pages.setting.table.delete') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <dialog-add-view v-model:visible="isVisible.dialogAdd" @refresh-table-data="refreshEvent" />
    <dialog-edit-view v-model:visible="isVisible.dialogEdit" :data="formData" />
    <dialog-flag-view v-model:visible="isVisible.dialogFlag" :data="analyzeTableConfig.flag" />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { AddIcon, DiscountIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive, watch } from 'vue';
import _ from 'lodash';

import { fetchAnalyzePage, updateAnalyzeItem, delAnalyzeItem } from '@/api/analyze';
import { setDefault } from '@/api/setting';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import DialogFlagView from './components/DialogFlag.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd: false,
  dialogEdit: false,
  dialogFlag: false,
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

const analyzeTableConfig = ref({
  data: [],
  sort: {},
  select: [],
  default: '',
  group: [],
  flag: []
})

const emitReload = useEventBus<string>('analyze-reload');

watch(
  () => analyzeTableConfig.value.data,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitReload.emit('analyze-reload');
    }
  }, {
  deep: true
}
);

const rehandleSelectChange = (val) => {
  analyzeTableConfig.value.select = val;
};

onMounted(() => {
  getData();
});

const refreshEvent = (page = false) => {
  getData();
  if (page) pagination.current = 1;
};

const rehandlePageChange = (curr) => {
  pagination.current = curr.current;
  pagination.pageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  analyzeTableConfig.value.sort = sortVal;
  analyzeTableConfig.value.data = options.currentDataSource;
};

// 获取列表
const getData = async () => {
  try {
    const res = await fetchAnalyzePage(searchValue.value);
    if (_.has(res, 'default') && res["default"]) {
      analyzeTableConfig.value.default = res.default;
    }
    if (_.has(res, 'data') && res["data"]) {
      analyzeTableConfig.value.data = res.data;
    }
    if (_.has(res, 'total') && res["total"]) {
      pagination.total = res.total;
    }
    if (_.has(res, 'flag') && res["flag"]) {
      analyzeTableConfig.value.flag = res.flag;
    }
  } catch (e) {
    console.log(e);
  }
};

// 编辑
const editEvent = (row) => {
  const index = row.rowIndex + pagination.pageSize * (pagination.current - 1)
  formData.value = analyzeTableConfig.value.data[index];
  isVisible.dialogEdit = true;
};

// 是否启用
const switchStatus = (row) => {
  console.log(row.isActive);
  updateAnalyzeItem(row.id, { isActive: row.isActive });
};

// 删除
const removeEvent = async (row) => {
  try {
    delAnalyzeItem(row.id);
    refreshEvent();
    MessagePlugin.success('删除成功');
  } catch (err) {
    MessagePlugin.error(`删除源失败, 错误信息:${err}`);
  }
};

// 批量删除
const removeAllEvent = () => {
  try {
    const { select } = analyzeTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning('请先选择数据');
      return;
    }
    delAnalyzeItem(select);
    refreshEvent();
    MessagePlugin.success('批量删除成功');
  } catch (err) {
    MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
  }
};

// 设置默认接口
const defaultEvent = async (row) => {
  try {
    await setDefault("defaultAnalyze", row.id);
    analyzeTableConfig.value.default = row.id;
    emitReload.emit('analyze-reload');
    MessagePlugin.success('设置成功');
  } catch (err) {
    MessagePlugin.error(`设置默认源失败, 错误信息:${err}`);
  }
};
</script>

<style lang="less" scoped>
.setting-analyze-container {
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

  :deep(.t-table__header--fixed):not(.t-table__header--multiple)>tr>th {
    background-color: var(--td-bg-color-container);
  }

  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container);
  }
}
</style>
