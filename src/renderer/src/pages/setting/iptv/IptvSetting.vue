<template>
  <div class="setting-iptv-container">
    <div class="header operation-container">
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
    </div>
    <t-table row-key="id" height="calc(100vh - 172px)" :data="iptvTableConfig.data" :sort="iptvTableConfig.sort"
      :filter-value="iptvTableConfig.filter" :columns="COLUMNS" :hover="true" :pagination="pagination"
      @sort-change="rehandleSortChange" @filter-change="rehandleFilterChange" @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange">
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

    <dialog-add-view v-model:visible="isVisible.dialogAdd" @add-table-data="tableAdd" />
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
  rawData: [],
  sort: {},
  filter: {
    type: [],
  },
  select: [],
  default: ''
})

const emitReload = useEventBus<string>('iptv-reload');

watch(
  () => iptvTableConfig.value.rawData,
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


const request = (filters) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    const newData = iptvTableConfig.value.rawData.filter((item: any) => {
      let result = true;
      if (result && filters.type && filters.type.length) {
        result = filters.type.filter((item_one) => item.type === item_one).length > 0;
      }
      return result;
    });
    iptvTableConfig.value.data = newData;
    pagination.current = 1;
    pagination.total = newData.length;
  }, 100);
};

const rehandleFilterChange = (filters, ctx) => {
  console.log('filter-change', filters, ctx);
  iptvTableConfig.value.filter = {
    ...filters,
    type: filters.type || [],
  };
  request(filters);
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
      iptvTableConfig.value.rawData = res.data;
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
  if (iptvTableConfig.value.filter) iptvTableConfig.value.filter = { type: [] };
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

const tableUpdateIsActive = (select, isActiveValue: boolean) => {
  select.forEach((itemId) => {
    const item: any = _.find(iptvTableConfig.value.data, { id: itemId });
    const rawTtem: any = _.find(iptvTableConfig.value.rawData, { id: itemId });
    if (item) item.isActive = isActiveValue;
    if (item) rawTtem.isActive = isActiveValue;
  });
};

const tableDelete = (select) => {
  select.forEach((itemId) => {
    _.remove(iptvTableConfig.value.data, (item: any) => item.id === itemId);
    _.remove(iptvTableConfig.value.rawData, (item: any) => item.id === itemId);
  });
};

const tableAdd = (item) => {
  let { filter = { type: [] }, data = [] as any, rawData = [] as any } = iptvTableConfig.value;
  const filterType: any = filter?.type || [];

  const shouldFilter = filterType.length > 0 && !filterType.includes(item.type);

  if (!shouldFilter) {
    pagination.total += 1;
    data = [...data, item];
  }
  rawData = [...rawData, item];
  iptvTableConfig.value = { ...iptvTableConfig.value, data, rawData };
};

const removeEvent = (row) => {
  try {
    delIptvItem(row.id);
    tableDelete([row.id]);
    pagination.total -= 1;
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
      tableUpdateIsActive(select, true);
    } else if (type === 'disable') {
      updateIptvStatus('disable', select);
      tableUpdateIsActive(select, false);
    } else if (type === 'delete') {
      delIptvItem(select);
      tableDelete(select);
      pagination.total -= select.length;
    }

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
    display: flex;
    justify-content: space-between;
  }
}
</style>
