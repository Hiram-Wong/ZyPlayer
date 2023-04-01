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
              <t-icon size="1.5em" name="arrow-up" />
              <span>导出</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <t-icon size="1.5em" name="remove" />
              <span>删除</span>
            </div>
            <div class="item" @click="formDialogVisibleAddAnalyze = true">
              <t-icon size="1.5em" name="add" />
              <span>添加</span>
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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventBus } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { saveAs } from 'file-saver';
import { analyze, setting } from '@/lib/dexie';
import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const formDialogVisibleAddAnalyze = ref(false);
const formDialogVisibleEditAnalyze = ref(false);
const formData = ref();
const defaultAnalyze = ref();
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
});

const rehandlePageChange = (curr) => {
  pagination.value.defaultCurrent = curr.current;
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

// 是否启用
const propChangeEvent = (row) => {
  analyze.update(row.id, { isActive: row.isActive });
};

// 编辑
const editEvent = (row) => {
  formData.value = data.value[row.rowIndex + pagination.value.defaultPageSize * (pagination.value.defaultCurrent - 1)];
  formDialogVisibleEditAnalyze.value = true;
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
const exportEvent = () => {
  const arr = [...data.value];
  const str = JSON.stringify(arr, null, 2);
  const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `analyzes.json`);
  MessagePlugin.success('导出成功');
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
      background: #f0f0f0;
      backdrop-filter: blur(10px);
      border-radius: 6px;
      color: #161616;
      align-items: center;
      box-shadow: 10px;
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
  }

  :deep(.t-table) {
    background-color: #fbfbfb;
    tr {
      background-color: #fbfbfb;
      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }
  :deep(.t-table__header--fixed):not(.t-table__header--multiple) > tr > th {
    background-color: #fbfbfb;
  }
  :deep(.t-table__pagination) {
    background-color: #fbfbfb;
  }
}

:root[theme-mode='dark'] {
  .setting-analyze-container {
    .component-op {
      background: #484848;
      color: #eee;
      .item:hover {
        background: #5e5e5e;
      }
    }
    :deep(.t-table) {
      background-color: #000;
      tr {
        background-color: #000;
        &:hover {
          background-color: var(--td-bg-color-container-hover);
        }
      }
    }
    :deep(.t-table__header--fixed):not(.t-table__header--multiple) > tr > th {
      background-color: #000 !important;
    }
    :deep(.t-table__pagination) {
      background-color: #000 !important;
    }
  }
}
</style>
