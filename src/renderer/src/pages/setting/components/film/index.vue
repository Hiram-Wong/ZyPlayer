<template>
  <div class="setting-site view-component-container">
    <setting-table
      row-key="id"
      :op="operations"
      :data="tableState.list"
      :columns="COLUMNS"
      :pagination="pagination"
      @op-change="handleOperation"
      @page-change="handlePageChange"
      @op-search="handleSearch"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === tableState.default" size="small" dot :count="999">
          {{ row.name }}
        </t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="handleOpActiveSwitch(row.id)" />
      </template>
      <template #type="{ row }">
        <span v-if="row.type === SITE_TYPE.T0_XML">{{ $t('pages.film.field.typeMap.t0-xml') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T1_JSON">{{ $t('pages.film.field.typeMap.t1-json') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T4_DRPYJS0">{{ $t('pages.film.field.typeMap.t4-drpy_js0') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T4_DRPYS">{{ $t('pages.film.field.typeMap.t4-drpys') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_DRPY">{{ $t('pages.film.field.typeMap.t3-js_drpy') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T4_CATVOD">{{ $t('pages.film.field.typeMap.t4-catvod') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_XBPQ">{{ $t('pages.film.field.typeMap.t3-csp_xbpq') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_XYQ">{{ $t('pages.film.field.typeMap.t3-csp_xyq') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_APPYSV2">{{ $t('pages.film.field.typeMap.t3-csp_appysv2') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_PY">{{ $t('pages.film.field.typeMap.t3-py') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_QUICK">{{ $t('pages.film.field.typeMap.t3-js_quick') }}</span>
        <span v-else-if="row.type === SITE_TYPE.T3_ALIST">{{ $t('pages.film.field.typeMap.t3-alist') }}</span>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link theme="primary" @click="handleOperation('check', [slotProps.row.id])">
            {{ $t('common.check') }}
            <template v-if="slotProps.row.check" #prefix-icon>
              <loading-icon />
            </template>
          </t-link>
          <t-link theme="primary" @click="handleOperation('default', slotProps.row.id)">
            {{ $t('common.default') }}
          </t-link>
          <t-link theme="primary" @click="handleOperation('edit', slotProps.row)">
            {{ $t('common.edit') }}
          </t-link>
          <t-popconfirm
            :content="$t('common.popup.delete')"
            theme="danger"
            @confirm="handleOperation('delete', [slotProps.row.id])"
          >
            <t-link theme="danger">{{ $t('common.delete') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </setting-table>

    <dialog-form-view
      v-model:visible="dialogState.visibleForm"
      :data="formData"
      :type="dialogState.formType"
      :group="formGroup"
      @submit="handleDialogUpdate"
    />
  </div>
</template>
<script setup lang="ts">
import { SITE_TYPE } from '@shared/config/film';
import { isArray, isArrayEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import { cloneDeep } from 'es-toolkit';
import PQueue from 'p-queue';
import { LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onActivated, onMounted, ref } from 'vue';

import { addSite, delSite, fetchCmsCheck, fetchSitePage, putSite, putSiteDefault } from '@/api/film';
import SettingTable from '@/components/setting-table/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import emitter from '@/utils/emitter';

import DialogFormView from './components/DialogForm.vue';
import { COLUMNS } from './constants';

const operations = computed(() => [
  { label: t('common.add'), value: 'add' },
  { label: t('common.enable'), value: 'enable' },
  { label: t('common.disable'), value: 'disable' },
  { label: t('common.delete'), value: 'delete' },
  { label: t('common.check'), value: 'check' },
]);

const dialogState = ref({
  visibleForm: false,
  formType: 'add',
  currentId: '',
});

const formData = ref({});
const formGroup = ref([]);
const searchValue = ref('');

const pagination = ref({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
  pageSize: 20,
  current: 1,
  theme: 'simple',
});

const tableState = ref({
  list: [] as (IModels['site'] & { check: boolean })[],
  sort: {},
  filter: { type: [] },
  select: [],
  default: '',
  group: [],
});

const checkQueue = new PQueue({ concurrency: 1 });
const activeCheckIds = new Set<string>();

onMounted(() => fetchTable());

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_FILM_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_FILM_CONFIG, reloadConfig);
});

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.SETTING_TABLE) return;

  resetPagination();
  resetTable();

  await fetchTable();
};

const resetPagination = () => {
  pagination.value = { defaultCurrent: 1, defaultPageSize: 20, current: 1, pageSize: 20, total: 0, theme: 'simple' };
};

const resetTable = () => {
  tableState.value = { list: [], sort: {}, filter: { type: [] }, select: [], default: '', group: [] };
};

const fetchTable = async () => {
  try {
    const resp = await fetchSitePage({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      kw: searchValue.value,
    });
    if (resp?.default) tableState.value.default = resp.default;
    if (resp?.list) tableState.value.list = resp.list;
    if (resp?.total) pagination.value.total = resp.total;
    if (resp?.group) tableState.value.group = resp.group;
  } catch (error) {
    console.error('Fail to fetch page', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const createItem = async (doc: IModels['site']) => {
  try {
    await addSite(doc);
    MessagePlugin.success(`${t('common.success')}`);
  } catch (error) {
    console.error('Fail to create item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const deleteItem = async (ids: string[]) => {
  try {
    await delSite({ id: ids });
    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to delete item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const updateItem = async (ids: string[], doc: Partial<IModels['site']>) => {
  try {
    await putSite({ id: ids, doc });
    MessagePlugin.success(`${t('common.success')}`);
  } catch (error) {
    console.error('Fail to update item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const setDefaultItem = async (id: string) => {
  try {
    await putSiteDefault(id);
    MessagePlugin.success(`${t('common.success')}`);
  } catch (error) {
    console.error('Fail to set default item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const checkItem = async (ids: string[]) => {
  for (const id of ids) {
    if (activeCheckIds.has(id)) continue;

    const idx = tableState.value.list.findIndex((item: IModels['site']) => item.id === id);
    if (idx === -1) continue;

    activeCheckIds.add(id);

    checkQueue.add(async () => {
      try {
        const row = tableState.value.list[idx];
        tableState.value.list[idx].check = true;

        let isActive = false;
        try {
          isActive = await fetchCmsCheck({ uuid: id, type: 'simple' });
        } catch {
          // ignore error
        }

        if (row.isActive !== isActive) {
          tableState.value.list[idx].isActive = isActive;
          try {
            await putSite({ id, doc: { isActive } });
          } catch {
            // ignore error
          }
        }
      } finally {
        activeCheckIds.delete(id);
        tableState.value.list[idx].check = false;
      }

      if (activeCheckIds.size === 0) {
        fetchTable();
        emitter.emit(emitterChannel.REFRESH_FILM_CONFIG, { source: emitterSource.SETTING_TABLE });
        MessagePlugin.success(`${t('common.success')}`);
      }
    });
  }
};

const handleOpActiveSwitch = async (id: string) => {
  const list = tableState.value.list;
  const item = list.find((i: IModels['site']) => i.id === id);
  if (item) handleOperation(item.isActive ? 'enable' : 'disable', [id]);
};

// @ts-expect-error Not all code paths return values。ts-7030
const handleOperation = async (type: string, payload: any) => {
  const noSelectOps = ['enable', 'disable', 'delete', 'check'];
  if ((!isArray(payload) || isArrayEmpty(payload)) && noSelectOps.includes(type)) {
    return MessagePlugin.warning(t('common.message.noSelect'));
  }

  const op = {
    add: () => {
      dialogState.value.formType = 'add';
      formData.value = {
        name: '',
        key: '',
        api: '',
        playUrl: '',
        group: '',
        search: true,
        isActive: true,
        type: 1,
        ext: '',
        categories: '',
      };
      formGroup.value = cloneDeep(tableState.value.group);
      dialogState.value.visibleForm = true;
    },
    enable: () => updateItem(payload, { isActive: true }),
    disable: () => updateItem(payload, { isActive: false }),
    delete: () => deleteItem(payload),
    default: async () => {
      const activeItem = tableState.value.list.find((i: IModels['site']) => i.id === payload);
      if (!activeItem || !activeItem.isActive) {
        MessagePlugin.warning(t('common.message.noEnable'));
        return;
      }
      await setDefaultItem(payload);
    },
    edit: () => {
      dialogState.value.formType = 'edit';
      dialogState.value.currentId = payload.id;
      const cloneDoc = cloneDeep(payload);
      delete cloneDoc.id;
      formData.value = cloneDoc;
      formGroup.value = cloneDeep(tableState.value.group);
      dialogState.value.visibleForm = true;
    },
    check: () => checkItem(payload),
  };

  await op?.[type]?.();

  if (['enable', 'disable', 'delete', 'default'].includes(type)) {
    fetchTable();
    emitter.emit(emitterChannel.REFRESH_FILM_CONFIG, { source: emitterSource.SETTING_TABLE });
  }
};

const handleDialogUpdate = async (type: string, doc: object) => {
  if (type === 'table') {
    if (dialogState.value.formType === 'add') {
      await createItem(doc as IModels['site']);
    } else {
      await updateItem([dialogState.value.currentId], doc as IModels['site']);
    }
  }

  fetchTable();
  emitter.emit(emitterChannel.REFRESH_FILM_CONFIG, { source: emitterSource.SETTING_TABLE });
};

const handleSearch = (value: string) => {
  searchValue.value = value;
  pagination.value.current = 1;
  fetchTable();
};

const handlePageChange = (page: number, pageSize: number) => {
  pagination.value.current = page;
  pagination.value.pageSize = pageSize;
  fetchTable();
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding-bottom: var(--td-comp-paddingTB-s);
}
</style>
