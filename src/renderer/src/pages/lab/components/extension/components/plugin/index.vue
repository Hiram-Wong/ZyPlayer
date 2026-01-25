<template>
  <div class="lab-extension-plugin view-component-container">
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
      <template #type="{ row }">
        <t-tag v-if="row.type === 1" theme="success" shape="round" variant="light-outline">
          {{ $t('pages.plugin.field.typeMap.ui') }}
        </t-tag>
        <t-tag v-else-if="row.type === 2" theme="warning" shape="round" variant="light-outline">
          {{ $t('pages.plugin.field.typeMap.system') }}
        </t-tag>
        <t-tag v-else-if="row.type === 3" theme="danger" shape="round" variant="light-outline">
          {{ $t('pages.plugin.field.typeMap.mix') }}
        </t-tag>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" :disabled="row.type === 1" @change="handleOpActiveSwitch(row.id)" />
      </template>
      <template #op="slotProps">
        <t-space>
          <t-link
            :disabled="![1, 3].includes(slotProps.row.type)"
            theme="primary"
            @click="handleOperation('preview', slotProps.row)"
          >
            {{ $t('common.preview') }}
          </t-link>
          <t-link theme="primary" @click="handleOperation('info', slotProps.row)">
            {{ $t('common.info') }}
          </t-link>
          <t-popconfirm
            :content="$t('common.popup.delete')"
            theme="danger"
            @confirm="handleOperation('delete', [slotProps.row.id])"
          >
            <t-link theme="danger">{{ $t('common.uninstall') }}</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </setting-table>

    <dialog-install-view
      v-model:visible="dialogState.visibleForm"
      :data="formData"
      :type="dialogState.formType"
      @submit="handleDialogUpdate"
    />
    <dialog-detail-view v-model:visible="dialogState.visibleDetail" :data="formData" />
  </div>
</template>
<script lang="tsx" setup>
import { PLUGIN_STORE_URL } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { isArray, isArrayEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import { cloneDeep } from 'es-toolkit';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onActivated, onMounted, ref } from 'vue';

import { fetchPluginPage } from '@/api/plugin';
// import { installPlugin, startPlugin, stopPlugin, uninstallPlugin } from '@/api/plugin';
import SettingTable from '@/components/setting-table/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import emitter from '@/utils/emitter';

import DialogDetailView from './components/DialogDetail.vue';
import DialogInstallView from './components/DialogInstall.vue';
import { COLUMNS } from './constants';

const emits = defineEmits(['change-nav']);

const installQueue = new PQueue({ concurrency: 1 });
const activeInstallIds = new Set<string>();

const operations = computed(() => [
  { label: t('common.install'), value: 'add' },
  { label: t('common.enable'), value: 'enable' },
  { label: t('common.disable'), value: 'disable' },
  { label: t('common.uninstall'), value: 'delete' },
  { label: t('common.store'), value: 'store' },
  { label: t('pages.lab.extension.env.title'), value: 'env' },
]);

const dialogState = ref({
  visibleForm: false,
  visibleDetail: false,
  formType: 'add',
  currentId: '',
});

const formData = ref({});
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
  list: [] as IModels['plugin'][],
  sort: {},
  filter: { type: [] },
  select: [],
  default: '',
});

onMounted(() => fetchTable());

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_PLUGIN_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_PLUGIN_CONFIG, reloadConfig);
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
  tableState.value = { list: [], sort: {}, filter: { type: [] }, select: [], default: '' };
};

const fetchTable = async () => {
  try {
    const resp = await fetchPluginPage({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      kw: searchValue.value,
    });
    if (resp?.default) tableState.value.default = resp.default;
    if (resp?.list) tableState.value.list = resp.list;
    if (resp?.total) pagination.value.total = resp.total;
  } catch (error) {
    console.error('Fail to fetch page', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const createItem = async (ids: string[]) => {
  const id = ids[0];

  if (activeInstallIds.has(id)) return;
  activeInstallIds.add(id);

  installQueue.add(async () => {
    try {
      // await installPlugin({ id: ids });
      await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PLUGIN_INSTALL, ids);
    } finally {
      activeInstallIds.delete(id);
    }

    if (activeInstallIds.size === 0) {
      fetchTable();
      MessagePlugin.success(`${t('common.success')}`);
    }
  });
};

const disableItem = async (ids: string[]) => {
  try {
    // await stopPlugin({ id: ids });
    await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PLUGIN_STOP, ids);
    MessagePlugin.success(`${t('common.success')}`);
  } catch (error) {
    console.error('Fail to create item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const enableItem = async (ids: string[]) => {
  try {
    // await startPlugin({ id: ids });
    await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PLUGIN_START, ids);
    MessagePlugin.success(`${t('common.success')}`);
  } catch (error) {
    console.error('Fail to create item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const uninstallItem = async (ids: string[]) => {
  try {
    // await uninstallPlugin({ id: ids });
    await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PLUGIN_UNINSTALL, ids);
    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to uninstall item', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleOpActiveSwitch = async (id: string) => {
  const list = tableState.value.list;
  const item = list.find((i: IModels['plugin']) => i.id === id);
  if (item) handleOperation(item.isActive ? 'enable' : 'disable', [id]);
};

// @ts-expect-error Not all code paths return values。ts-7030
const handleOperation = async (type: string, payload: any) => {
  const noSelectOps = ['enable', 'disable', 'delete'];
  if ((!isArray(payload) || isArrayEmpty(payload)) && noSelectOps.includes(type)) {
    return MessagePlugin.warning(t('common.message.noSelect'));
  }

  const op = {
    add: () => {
      dialogState.value.formType = 'add';
      formData.value = { id: '' };
      dialogState.value.visibleForm = true;
    },
    enable: () => enableItem(payload),
    disable: () => disableItem(payload),
    delete: () => uninstallItem(payload),
    preview: () => window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_BROWSER, payload.web),
    info: () => {
      const cloneDoc = cloneDeep(payload);
      formData.value = cloneDoc;
      dialogState.value.visibleDetail = true;
    },
    store: () => window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_BROWSER, PLUGIN_STORE_URL),
    env: () => emits('change-nav', 'env'),
  }[type];

  await op?.();

  if (['enable', 'disable', 'delete'].includes(type)) {
    fetchTable();
    emitter.emit(emitterChannel.REFRESH_LIVE_CONFIG, { source: emitterSource.SETTING_TABLE });
  }
};

const handleDialogUpdate = async (type: string, doc: Record<string, any>) => {
  if (type === 'table') {
    if (dialogState.value.formType === 'add') {
      await createItem(doc.id);
    }
  }

  fetchTable();
  emitter.emit(emitterChannel.REFRESH_LIVE_CONFIG, { source: emitterSource.SETTING_TABLE });
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
  height: 100%;
}
</style>
