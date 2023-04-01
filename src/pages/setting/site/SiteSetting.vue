<template>
  <div class="setting-site-container">
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
            <div class="item" @click="formDialogVisibleAddApi = true">
              <t-icon size="1.5em" name="add" />
              <span>添加</span>
            </div>
            <div class="item" @click="checkAllSite">
              <t-icon size="1.5em" name="refresh" />
              <span>检测</span>
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
      :header-affixed-top="{ offsetTop: 0, container: `.setting-site-container` }"
      :reserve-selected-row-on-paginate="false"
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
import { ref, onMounted } from 'vue';
import { useEventBus } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { saveAs } from 'file-saver';
import { sites, setting } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const formDialogVisibleAddApi = ref(false);
const formDialogVisibleEditSite = ref(false);
const formData = ref();
const isCheckStatusChangeActive = ref();
const formGroup = ref();
const sort = ref();

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
    await sites.pagination().then((res) => {
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
  saveAs(blob, `sites.json`);
  MessagePlugin.success('导出成功');
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
@import '@/style/variables.less';
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
  .setting-site-container {
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
