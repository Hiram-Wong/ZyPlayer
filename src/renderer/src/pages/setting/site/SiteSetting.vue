<template>
  <div class="setting-site-container">
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
          <div class="item" @click="handleAllDataEvent('check')">
            <refresh-icon />
            <span>{{ $t('pages.setting.header.check') }}</span>
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
    <t-table row-key="id" height="calc(100vh - 172px)" :data="siteTableConfig.data" :sort="siteTableConfig.sort"
      :filter-value="siteTableConfig.filter" :columns="COLUMNS" :hover="true" :pagination="pagination"
      @sort-change="rehandleSortChange" @filter-change="rehandleFilterChange" @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange">
      <template #name="{ row }">
        <t-badge v-if="row.id === siteTableConfig.default" size="small" :offset="[0, 3]" count="默" dot>{{ row.name
          }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="switchStatus(row)" />
      </template>
      <template #resource="{ row }">
        <span v-if="row.resource > 0">{{ row.resource }}</span>
        <span v-else-if="row.resource === -1">{{ $t('pages.setting.table.skip') }}</span>
        <span v-else>{{ $t('pages.setting.table.noData') }}</span>
      </template>
      <template #search="{ row }">
        <t-tag v-if="row.search === 0" shape="round" theme="danger" variant="light-outline">{{
          $t('pages.setting.table.site.close') }}</t-tag>
        <t-tag v-else-if="row.search === 1" theme="success" shape="round" variant="light-outline">{{
          $t('pages.setting.table.site.together') }}</t-tag>
        <t-tag v-else-if="row.search === 2" theme="warning" shape="round" variant="light-outline">{{
          $t('pages.setting.table.site.local') }}</t-tag>
      </template>
      <template #type="{ row }">
        <span v-if="row.type === 0">cms[xml]</span>
        <span v-else-if="row.type === 1">cms[json]</span>
        <span v-else-if="row.type === 2">drpy[js0]</span>
        <span v-else-if="row.type === 3">app[v3]</span>
        <span v-else-if="row.type === 4">app[v1]</span>
        <span v-else-if="row.type === 6">hipy[t4]</span>
        <span v-else-if="row.type === 7">js[t3]</span>
        <span v-else-if="row.type === 8">catvod[nodejs]</span>
        <span v-else-if="row.type === 9">xbpq</span>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="defaultEvent(slotProps.row)">{{ $t('pages.setting.table.default') }}</t-link>
          <t-link theme="primary" @click="checkSingleEvent(slotProps.row)">{{ $t('pages.setting.table.check')
            }}</t-link>
          <t-link theme="primary" @click="editEvent(slotProps)">{{ $t('pages.setting.table.edit') }}</t-link>
          <t-popconfirm :content="$t('pages.setting.table.deleteTip')" @confirm="removeEvent(slotProps.row)">
            <t-link theme="danger">{{ $t('pages.setting.table.delete') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <dialog-add-view v-model:visible="isVisible.dialogAdd" :group="siteTableConfig.group" @add-table-data="tableAdd" />
    <dialog-edit-view v-model:visible="isVisible.dialogEdit" :data="formData" :group="siteTableConfig.group" />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import PQueue from 'p-queue';
import { AddIcon, CheckIcon, PoweroffIcon, RefreshIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, ref, reactive, watch } from 'vue';

import { t } from '@/locales';
import { setDefault } from '@/api/setting';
import { fetchSitePage, fetchSiteGroup, updateSiteItem, updateSiteStatus, delSiteItem } from '@/api/site';
import { checkValid } from '@/utils/cms';
import emitter from '@/utils/emitter';

import { COLUMNS } from './constants';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';

// Define item form data & dialog status
const isVisible = reactive({
  dialogAdd: false,
  dialogEdit: false
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
  rawData: [],
  sort: {},
  filter: {
    type: [],
  },
  select: [],
  default: '',
  group: []
});

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

const rehandleSelectChange = (val) => {
  siteTableConfig.value.select = val;
};

watch(
  () => siteTableConfig.value.rawData,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitter.emit('refreshFilmConfig', 111);
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
      siteTableConfig.value.rawData = res.data;
    }
    if (_.has(res, 'total') && res["total"]) {
      pagination.total = res.total;
    }
  } catch (e) {
    console.log(e);
  }
};

const getGroup = async () => {
  try {
    const res = await fetchSiteGroup();
    if (_.has(res, 'data') && res["data"]) {
      siteTableConfig.value.group = res.data;
    }
  } catch (e) {
    console.log(e);
  }
}

onMounted(() => {
  getData();
  getGroup();
});

onActivated(() => {
  const isListenedRefreshTableData = emitter.all.get('refreshSiteTable');
  if (!isListenedRefreshTableData) emitter.on('refreshSiteTable', refreshTable);
});

const defaultSet = () => {
  pagination.defaultPageSize = 20;
  pagination.total = 0;
  pagination.defaultCurrent = 1;
  pagination.pageSize = 20;
  pagination.current = 1;

  siteTableConfig.value = {
    data: [],
    rawData: [],
    sort: {},
    filter: {
      type: [],
    },
    select: [],
    default: '',
    group: []
  };
};

const refreshTable = () => {
  console.log('[siteSetting][bus][refresh]');
  defaultSet();
  getData();
  getGroup();
};

const refreshEvent = (page = false) => {
  getData();
  getGroup();
  if (page) pagination.current = 1;
  if (siteTableConfig.value.filter) siteTableConfig.value.filter = { type: [] };
};

// op
const checkAllSite = async (select) => {
  try {
    let checkData: any = [];
    const { data } = siteTableConfig.value;

    select.forEach((item) => {
      const res = _.find(data, { id: item })
      checkData.push(res)
    });

    await Promise.all(checkData.map(item => queue.add(() => checkSingleEvent(item, true))));
  } catch (err) {
    console.error('[setting][site][checkAllSite][error]', err);
    throw err;
  }
};

const checkSingleEvent = async (row, all = false) => {
  let isActive: boolean = row.isActive;
  if (row.type === 7 || row.type === 8  || row.type === 9) {
    row.resource = -1;
  } else {
    const { status, resource } = await checkValid(row); // 检测状态
    row.isActive = isActive = status; // 检测是否开启变更状态
    row.resource = resource;
    updateSiteItem(row.id, { isActive: row.isActive });
  };

  if (!all) {
    MessagePlugin.success(t('pages.setting.form.success'));
  };

  return isActive;
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

const request = (filters) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    const newData = siteTableConfig.value.rawData.filter((item: any) => {
      let result = true;
      if (result && filters.type && filters.type.length) {
        result = filters.type.filter((item_one) => item.type === item_one).length > 0;
      }
      return result;
    });
    siteTableConfig.value.data = newData;
    pagination.current = 1;
    pagination.total = newData.length;
  }, 100);
};

const rehandleFilterChange = (filters, ctx) => {
  console.log('filter-change', filters, ctx);
  siteTableConfig.value.filter = {
    ...filters,
    type: filters.type || [],
  };
  request(filters);
};

const editEvent = (row) => {
  const index = row.rowIndex + pagination.pageSize * (pagination.current - 1)
  formData.value = siteTableConfig.value.data[index];
  isVisible.dialogEdit = true;
};

const switchStatus = async (row) => {
  console.log(row.isActive);
  updateSiteItem(row.id, { isActive: row.isActive });
};

const tableUpdateIsActive = (select, isActiveValue: boolean) => {
  select.forEach((itemId) => {
    const item: any = _.find(siteTableConfig.value.data, { id: itemId });
    const rawTtem: any = _.find(siteTableConfig.value.rawData, { id: itemId });
    if (item) item.isActive = isActiveValue;
    if (item) rawTtem.isActive = isActiveValue;
  });
};

const tableDelete = (select) => {
  select.forEach((itemId) => {
    _.remove(siteTableConfig.value.data, (item: any) => item.id === itemId);
    _.remove(siteTableConfig.value.rawData, (item: any) => item.id === itemId);
  });
};

const tableAdd = (item) => {
  let { filter = { type: [] }, data = [] as any, rawData = [] as any } = siteTableConfig.value;
  const filterType: any = filter?.type || [];

  const shouldFilter = filterType.length > 0 && !filterType.includes(item.type);

  if (!shouldFilter) {
    pagination.total += 1;
    data = [...data, item];
  }
  rawData = [...rawData, item];
  siteTableConfig.value = { ...siteTableConfig.value, data, rawData };
};

const removeEvent = async (row) => {
  try {
    delSiteItem(row.id);
    tableDelete([row.id]);
    pagination.total -= 1;
    getGroup();
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][site][removeEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
  }
};

const handleAllDataEvent = async (type) => {
  try {
    const { select } = siteTableConfig.value;
    if (select.length === 0) {
      MessagePlugin.warning(t('pages.setting.message.noSelectData'));
      return;
    }
    if (type === 'enable') {
      updateSiteStatus('enable', select);
      tableUpdateIsActive(select, true);
    } else if (type === 'disable') {
      updateSiteStatus('disable', select);
      tableUpdateIsActive(select, false);
    } else if (type === 'delete') {
      delSiteItem(select);
      tableDelete(select);
      pagination.total -= select.length;
    } else if (type === 'check') {
      MessagePlugin.info(t('pages.setting.message.checking'));
      await checkAllSite(select);
    }

    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][site][handleAllDataEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
  }
}

const defaultEvent = async (row) => {
  try {
    await setDefault("defaultSite", row.id);
    siteTableConfig.value.default = row.id;
    emitter.emit('refreshFilmConfig');
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[setting][site][defaultEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err}`);
  }
};
</script>

<style lang="less" scoped>
.setting-site-container {
  height: 100%;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);

  .header {
    margin: var(--td-comp-margin-s) 0;
    display: flex;
    justify-content: space-between;
  }

  .default-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: var(--td-radius-circle);
    background-color: var(--td-error-color);
  }
}
</style>
