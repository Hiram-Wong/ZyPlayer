<template>
  <div class="setting-iptv-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="isVisible.dialogAdd = true">
              <add-icon />
              <span>{{ $t('pages.setting.header.add') }}</span>
            </div>
            <div class="item" @click="handleAllDataEvent('enable')">
              <check-icon />
              <span>{{ $t('pages.setting.header.enable') }}</span>
            </div>
            <div class="item" @click="handleAllDataEvent('disable')">
              <poweroff-icon />
              <span>{{ $t('pages.setting.header.disable') }}</span>
            </div>
            <div class="item" @click="handleAllDataEvent('delete')">
              <remove-icon />
              <span>{{ $t('pages.setting.header.delete') }}</span>
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
    <t-table row-key="id" height="calc(100vh - 180px)" :data="iptvTableConfig.data" :sort="iptvTableConfig.sort"
      :columns="COLUMNS" :hover="true" :pagination="pagination" @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange" @page-change="rehandlePageChange">
      <template #name="{ row }">
        <t-badge v-if="row.id === iptvTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name
          }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #type="{ row }">
        <t-tag v-if="row.type === 'remote'" theme="success" shape="round" variant="light-outline">{{
          $t('pages.setting.table.iptv.remote') }}</t-tag>
        <t-tag v-else-if="row.type === 'local'" theme="warning" shape="round" variant="light-outline">{{
          $t('pages.setting.table.iptv.local') }}</t-tag>
        <t-tag v-else-if="row.type === 'batches'" theme="danger" shape="round" variant="light-outline">{{
          $t('pages.setting.table.iptv.manual') }}</t-tag>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="switchStatus(row)" />
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
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { AddIcon, CheckIcon, PoweroffIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive, watch } from 'vue';

import { t } from '@/locales';
import { fetchIptvPage, updateIptvItem, updateIptvStatus, delIptvItem, addChannel, clearChannel } from '@/api/iptv';
import { setDefault } from '@/api/setting';
import { parseChannel } from '@/utils/channel';

import { COLUMNS } from './constants';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd: false,
  dialogEdit: false
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

const emitReload = useEventBus<string>('iptv-reload');

watch(
  () => iptvTableConfig.value.data,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitReload.emit('iptv-reload');
    }
  }, {
  deep: true
}
);

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

const switchStatus = async (row) => {
  console.log(row.isActive);
  updateIptvItem(row.id, { isActive: row.isActive });
};

const removeEvent = (row) => {
  try {
    delIptvItem(row.id);
    refreshEvent();
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][iptv][removeEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
  }
};

const handleAllDataEvent = (type) => {
  try {
    const { select } = iptvTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning(t('pages.setting.message.noSelectData'));
      return;
    }
    if (type === 'enable') {
      updateIptvStatus('enable', select);
    } else if (type === 'disable') {
      updateIptvStatus('disable', select);
    } else if (type === 'delete') {
      delIptvItem(select);
    }
    refreshEvent();
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][iptv][handleAllDataEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
  }
}

const defaultEvent = async (row) => {
  const { id, url, type } = row;

  try {
    iptvTableConfig.value.default = id;
    await setDefault('defaultIptv', id);
    await clearChannel();
    const docs = await parseChannel(type, url);
    await addChannel(docs);

    emitReload.emit('iptv-reload');
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][iptv][defaultEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
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
