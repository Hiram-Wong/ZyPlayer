<template>
  <div class="setting-site-container">
    <common-setting
      row-key="id"
      :op="op"
      :data="tableConfig.data"
      :columns="COLUMNS"
      :pagination="pagination"
      @op-change="handleOpChange"
      @page-change="handlePageChange"
      @op-search="handleOpSearch"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === tableConfig.default" size="small" dot :count="999">
          {{ row.name }}
        </t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="handleOpDefault(row.id)" />
      </template>
      <template #type="{ row }">
        <span v-if="row.type === 0">T0[xml]</span>
        <span v-else-if="row.type === 1">T1[json]</span>
        <span v-else-if="row.type === 2">drpy[js0]</span>
        <!-- <span v-else-if="row.type === 3">app[v3]</span>
        <span v-else-if="row.type === 4">app[v1]</span> -->
        <span v-else-if="row.type === 6">T4[hipy]</span>
        <span v-else-if="row.type === 7">T3[drpy]</span>
        <span v-else-if="row.type === 8">catvod[nodejs]</span>
        <span v-else-if="row.type === 9">csp[XBPQ]</span>
        <span v-else-if="row.type === 10">csp[XYQ]</span>
        <span v-else-if="row.type === 11">csp[AppYsV2]</span>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="check_all_sites()">
            {{ $t('pages.setting.table.check_all') }}
            <template #prefix-icon v-if="slotProps.row.check">
              <loading-icon />
            </template>
          </t-link>
          <t-link theme="primary" @click="handleOpChange('check', slotProps)">
            {{ $t('pages.setting.table.check') }}
            <template #prefix-icon v-if="slotProps.row.check">
              <loading-icon />
            </template>
          </t-link>
          <t-link theme="primary" @click="handleOpChange('default', slotProps.row.id)">{{ $t('pages.setting.table.default') }}</t-link>
          <t-link theme="primary" @click="handleOpChange('edit', slotProps.row)">{{ $t('pages.setting.table.edit') }}</t-link>
          <t-popconfirm :content="$t('pages.setting.table.deleteTip')" @confirm="handleOpChange('delete', [slotProps.row.id])">
            <t-link theme="danger">{{ $t('pages.setting.table.delete') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </common-setting>

    <dialog-form-view v-model:visible="active.dialogForm" :data="formData" :type="active.formType" :group="formGroup" @submit="handleDialogUpdate" />
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { LoadingIcon } from 'tdesign-icons-vue-next';
import { onActivated, onMounted, ref, reactive, computed } from 'vue';

import { t } from '@/locales';
import { fetchSitePage, putSite, delSite, addSite, putSiteDefault, fetchCmsInit, fetchCmsHome } from '@/api/site';
import emitter from '@/utils/emitter';

import { COLUMNS } from './constants';

import DialogFormView from './components/DialogForm.vue';
import CommonSetting from '@/components/common-setting/table/index.vue';


const op = computed(() => {
  return[
    {
      label: t('pages.setting.header.add'),
      value: 'add'
    },
    {
      label: t('pages.setting.header.enable'),
      value: 'enable'
    },
    {
      label: t('pages.setting.header.disable'),
      value: 'disable'
    },
    {
      label: t('pages.setting.header.delete'),
      value: 'delete'
    }
  ]
});
const active = reactive({
  dialogForm: false,
  formType: 'add',
  opId: '',
  checkLoad: false,
});
const formData = ref({});
const formGroup = ref<any[]>([]);
const searchValue = ref<string>('');
const pagination = reactive({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
  pageSize: 20,
  current: 1,
  theme: "simple"
});
const tableConfig = ref({
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

onMounted(() => {
  reqFetch(pagination.current, pagination.pageSize, searchValue.value);
});

onActivated(() => {
  const isListenedRefreshTableData = emitter.all.get('refreshSiteTable');
  if (!isListenedRefreshTableData) emitter.on('refreshSiteTable', () => {
    console.log('[setting][site][bus][refresh]');
    defaultSet();
    refreshTable();
  });
});

const defaultSet = () => {
  pagination.defaultCurrent = 1;
  pagination.defaultPageSize = 20;
  pagination.current = 1;
  pagination.pageSize = 20;
  pagination.total = 0;

  tableConfig.value = {
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
  reqFetch(pagination.current, pagination.pageSize, searchValue.value);
};

const reqFetch = async (page, pageSize, kw) => {
  try {
    const res = await fetchSitePage({
      kw, page, pageSize,
    });
    if (res?.["default"]) {
      tableConfig.value.default = res.default;
    }
    if (res?.["data"]) {
      tableConfig.value.data = res.data;
      tableConfig.value.rawData = res.data;
    }
    if (res?.["total"]) {
      pagination.total = res.total;
    }
    if (res?.["group"]) {
      tableConfig.value.group = res.group;
    }
  } catch (err: any) {
    console.log('[setting][site][reqFetch][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqPut = async (index, doc) => {
  try {
    await putSite({ ids: index, doc });
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][site][reqPut][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqAdd = async (doc) => {
  try {
    await addSite(doc);
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][site][reqAdd][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqDefault = async (key) => {
  try {
    await putSiteDefault(key);
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][site][defaultEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqDel = async (index) => {
  try {
    await delSite({ ids: index });
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][site][reqDel][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const check_all_sites = async () => {
  if (active.checkLoad) {
    MessagePlugin.warning(t('pages.setting.message.checkLoading'));
    return;
  }

  for (let row_cnt = 0; row_cnt < pagination.total; row_cnt++) {
    let rowIndex = (row_cnt) % pagination.pageSize;
    let tableItem : any = tableConfig.value.data[rowIndex];
    try {
      const current_page =  Math.ceil((row_cnt) / pagination.defaultPageSize);
      // debug函数
      // if (current_page != pagination.current) {
      //   handlePageChange(current_page, pagination.defaultPageSize);
      // }

      if (rowIndex == 0 && row_cnt != 0) {
        handlePageChange(current_page + 1, pagination.defaultPageSize);
      }
      console.log("row index ", pagination.current, rowIndex)
      tableItem.check = true;
      active.checkLoad = true;
      const activeItem: any = { ...tableItem };
      const status = activeItem?.isActive;
      try {
        await fetchCmsInit({ sourceId: tableItem.id });
      } catch {
        tableItem.isActive = false;
        continue;
      }
      const res = await fetchCmsHome({ sourceId: tableItem.id });
      if (res && Array.isArray(res?.class) && res.class.length > 0) {
        if (!status) {
          await reqPut([tableItem.id], { isActive: true });
          tableItem.isActive = true;
        }
      } else {
        if (status) {
          await reqPut([tableItem.id], { isActive: false });
          tableItem.isActive = false;
        }
      }
    } finally {
      // @ts-ignore
      if (tableItem.hasOwnProperty("check")) {
        tableItem.check = false;
      } else if (tableItem.hasOwnProperty("isActive")) {
        tableItem.isActive = false;
      }
      active.checkLoad = false;
    }
  }

  
}

const handleOpDefault = async (id) => {
  const item: any = tableConfig.value.data.find((item: any) => item.id === id);
  handleOpChange(item.isActive ? 'enable' : 'disable', [id]);
};

const handleOpChange = async (type, doc) => {
  if (doc.length === 0 && ['enable', 'disable', 'delete'].includes(type)) {
    MessagePlugin.warning(t('pages.setting.message.noSelectData'));
    return;
  };

  if (type === 'add') {
    active.formType = 'add';
    formData.value = {
      name: '',
      key: '',
      api: '',
      playUrl: '',
      group: '',
      search: 1,
      isActive: true,
      type: 1,
      ext: '',
      categories: ''
    };
    formGroup.value = tableConfig.value.group;
    active.dialogForm = true;
  } else if (type === 'enable') {
    await reqPut(doc, { isActive: true });
  } else if (type === 'disable') {
    await reqPut(doc, { isActive: false });
  } else if (type === 'delete') {
    await reqDel(doc);
  } else if (type === 'default') {
    const activeItem: any = tableConfig.value.data.find((item:any) => item.id === doc)
    if (!activeItem || !activeItem.isActive) {
      MessagePlugin.warning(t('pages.setting.message.defaultDisable'));
      return;
    };
    await reqDefault(doc);
  } else if (type === 'edit') {
    active.formType = 'edit';
    active.opId = doc.id;
    delete doc.id;
    formData.value = doc;
    formGroup.value = tableConfig.value.group;
    active.dialogForm = true;
  } else if (type === 'check') {
    if (active.checkLoad) {
      MessagePlugin.warning(t('pages.setting.message.checkLoading'));
      return;
    }
    const { rowIndex, row } = doc;

    try {
      // @ts-ignore
      tableConfig.value.data[rowIndex].check = true;
      active.checkLoad = true;
      const activeItem: any = { ...row };
      const status = activeItem?.isActive;
      await fetchCmsInit({ sourceId: row.id });
      const res = await fetchCmsHome({ sourceId: row.id });
      if (res && Array.isArray(res?.class) && res.class.length > 0) {
        if (!status) {
          await reqPut([row.id], { isActive: true });
          // @ts-ignore
          tableConfig.value.data[rowIndex].isActive = true;
        }
      } else {
        if (status) {
          await reqPut([row.id], { isActive: false });
          // @ts-ignore
          tableConfig.value.data[rowIndex].isActive = false;
        }
      }
    } finally {
      // @ts-ignore
      tableConfig.value.data[rowIndex].check = false;
      active.checkLoad = false;
    }
  }

  if (['enable', 'disable', 'delete', 'default'].includes(type)) {
    refreshTable();
    emitter.emit('refreshFilmConfig');
  };
};

const handleDialogUpdate = async (type: string, doc: object) => {
  if (type === 'table') {
    if (active.formType === 'add') {
      await reqAdd(doc);
    } else {
      await reqPut([active.opId], doc);
    };
  };

  refreshTable();
  emitter.emit('refreshFilmConfig');
};

const handleOpSearch = (value: string) => {
  searchValue.value = value;
  pagination.current = 1;
  refreshTable();
};

const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  refreshTable();
};
</script>

<style lang="less" scoped></style>
