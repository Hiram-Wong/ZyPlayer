<template>
  <div class="setting-analyze-container">
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
      <template #type="{ row }">
        <t-tag v-if="row.type === 0" shape="round" theme="danger" variant="light-outline">
          {{ $t('pages.setting.table.analyze.web') }}
        </t-tag>
        <t-tag v-else-if="row.type === 1" shape="round" theme="success" variant="light-outline">
          {{ $t('pages.setting.table.analyze.json') }}
        </t-tag>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" :disabled="row.key === 'debug'"  @change="handleOpDefault(row.id)" />
      </template>
      <template #ext="{ row }">
        <span v-for="item in row.ext" :key="item.id">{{ item }}</span>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="handleOpChange('default', slotProps.row.id)">{{ $t('pages.setting.table.default') }}</t-link>
          <t-link theme="primary" @click="handleOpChange('edit', slotProps.row)">{{ $t('pages.setting.table.edit') }}</t-link>
          <t-popconfirm :content="$t('pages.setting.table.deleteTip')" @confirm="handleOpChange('delete', [slotProps.row.id])">
            <t-link theme="danger">{{ $t('pages.setting.table.delete') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </common-setting>

    <dialog-form-view v-model:visible="active.dialogForm" :data="formData" :type="active.formType" @submit="handleDialogUpdate" />
    <dialog-flag-view v-model:visible="active.dialogFlag" :data="tableConfig.flag" @submit="handleDialogUpdate" />
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, ref, reactive, watch, computed } from 'vue';

import { t } from '@/locales';
import { fetchAnalyzePage, putAnalyze, delAnalyze, addAnalyze, putAnalyzeDefault } from '@/api/analyze';
import { putSetting } from '@/api/setting';
import emitter from '@/utils/emitter';

import { COLUMNS } from './constants';

import DialogFlagView from './components/DialogFlag.vue';
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
    },
    {
      label: t('pages.setting.header.flag'),
      value: 'flag'
    }
  ]
});

const active = reactive({
  dialogForm: false,
  dialogFlag: false,
  formType: 'add',
  opId: ''
})
const formData = ref({});
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
  group: [],
  flag: []
});

watch(
  () => tableConfig.value.rawData,
  (_, oldValue) => {
    if (oldValue.length > 0) {
      emitter.emit('refreshAnalyzeConfig');
    }
  }, {
    deep: true
  }
);

onMounted(() => {
  reqFetch(pagination.current, pagination.pageSize, searchValue.value);
});

onActivated(() => {
  const isListenedRefreshTableData = emitter.all.get('refreshAnalyzeTable');
  if (!isListenedRefreshTableData) emitter.on('refreshAnalyzeTable', () => {
    console.log('[setting][analyze][bus][refresh]');
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
    group: [],
    flag: []
  };
};

const refreshTable = () => {
  reqFetch(pagination.current, pagination.pageSize, searchValue.value);
};

const reqFetch = async (page, pageSize, kw) => {
  try {
    const res = await fetchAnalyzePage({
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
    if (res?.["flag"]) {
      tableConfig.value.flag = res.flag;
    }
  } catch (err: any) {
    console.log('[setting][analyze][reqFetch][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.mssage}`);
  }
};

const reqPut = async (index, doc) => {
  try {
    await putAnalyze({ ids: index, doc });
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][analyze][reqPut][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.mssage}`);
  }
};

const reqAdd = async (doc) => {
  try {
    await addAnalyze(doc);
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][analyze][reqAdd][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqDefault = async (key) => {
  try {
    await putAnalyzeDefault(key);
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][analyze][defaultEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqDefaultFlag = async (doc) => {
  try {
    await putSetting({ key: "analyzeFlag", doc: doc });
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][analyze][defaultEvent][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const reqDel = async (index) => {
  try {
    await delAnalyze({ ids: index });
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    console.log('[setting][analyze][reqDel][error]', err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

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
      type: 0,
      isActive: true,
      url: ''
    };
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
  } else if (type === 'flag') {
    active.dialogFlag = true;
  } else if (type === 'edit') {
    active.formType = 'edit';
    active.opId = doc.id;
    delete doc.id;
    formData.value = doc;
    active.dialogForm = true;
  };

  if (['enable', 'disable', 'delete', 'default'].includes(type)) {
    refreshTable();
  };

  emitter.emit('refreshAnalyzeConfig');
};

const handleDialogUpdate = async (type: string, doc: object) => {
  if (type === 'table') {
    if (active.formType === 'add') {
      await reqAdd(doc);
    } else {
      await reqPut([active.opId], doc);
    };
  } else if (type === 'flag') {
    await reqDefaultFlag(doc);
  };

  refreshTable();
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
