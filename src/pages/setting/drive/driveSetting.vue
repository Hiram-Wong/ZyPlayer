<template>
  <div class="setting-iptv-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="isVisible.addDialog = true">
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
            <t-input v-model="searchValue" placeholder="搜索网盘资源" clearable @enter="getData" class="search-bar">
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
          </div>
        </div>
      </t-row>
    </div>
    <t-table
      :row-key="rowKey"
      :data="data"
      :sort="sort"
      height="calc(100vh - 205px)"
      table-layout="auto"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      :selected-row-keys="selectedRowKeys"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === defaultDrive" size="small" :offset="[-5, 0]" count="默">{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #op="slotProps">
        <a class="t-button-link" @click="defaultEvent(slotProps.row)">默认</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <t-popconfirm content="确认删除吗" @confirm="removeEvent(slotProps.row)">
          <a class="t-button-link">删除</a>
        </t-popconfirm>
      </template>
    </t-table>

    <dialog-add-view v-model:visible="isVisible.addDialog" :data="data" @refresh-table-data="getData" />
    <dialog-edit-view v-model:visible="isVisible.editDialog" :data="rowEditData" />
    <dialog-ali-auth-view v-model:visible="isVisible.aliAuthDialog" />
  </div>
</template>
<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { AddIcon, RemoveIcon, SearchIcon, UserIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive } from 'vue';

import { drive, setting } from '@/lib/dexie';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import DialogAliAuthView from './components/DialogAliAuth.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const isVisible = reactive({
  addDialog: false,
  editDialog: false,
  aliAuthDialog: false,
});
const searchValue = ref();
const rowEditData = ref();
const rowKey = 'id';
const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
});
const selectedRowKeys = ref([]);
const defaultDrive = ref();
const sort = ref();

// Define table table
const data = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
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

// Business Processing
const getData = async () => {
  defaultDrive.value = await setting.get('defaultDrive');
  try {
    const res = await drive.pagination(searchValue.value);
    data.value = res.list;
    pagination.total = res.total;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  getData();
});

const emitReload = useEventBus<string>('drive-reload');

const defaultEvent = async (row) => {
  await setting.update({ defaultDrive: row.id });
  defaultDrive.value = row.id;
  console.log(defaultDrive.value)
  emitReload.emit('drive-reload');
  MessagePlugin.success('设置成功');
};

const editEvent = (row) => {
  rowEditData.value =
    data.value[row.rowIndex + pagination.defaultPageSize * (pagination.defaultCurrent - 1)];
  isVisible.editDialog = true;
};

const propChangeEvent = (row) => {
  drive.update(row.id, { isActive: row.isActive === true });
};

const removeEvent = (row) => {
  drive
    .remove(row.id)
    .then(() => {
      getData();
      MessagePlugin.success('删除成功');
    })
    .catch((error) => {
      MessagePlugin.error(`删除源失败, 错误信息:${error}`);
    });
};

const removeAllEvent = () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择数据');
    return;
  }
  console.log(selectedRowKeys.value);
  selectedRowKeys.value.forEach((element) => {
    drive.remove(element).catch((error) => {
      MessagePlugin.error(`批量删除源失败, 错误信息:${error}`);
    });
  });
  getData();
  MessagePlugin.success('批量删除成功');
};

const aliAuthEvent = () => {
  isVisible.aliAuthDialog = true;
};
</script>

<style lang="less" scoped>
.setting-iptv-container {
  height: calc(100vh - var(--td-comp-size-l));
  .header {
    margin: var(--td-comp-margin-s) 0;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
    cursor: pointer;
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
    background-color: var(--td-bg-color-container);
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container);
  }
}
</style>
