<template>
  <div class="lab-binary view-component-container">
    <div class="content">
      <template v-if="tableList.length">
        <t-row :gutter="[8, 8]" style="margin-left: -4px; margin-right: -4px">
          <t-col v-for="item in tableList" :key="item.name" :md="6" :xl="4" class="card">
            <t-card :title="item.name" :class="[!item.exist ? 'card-warning' : '']">
              <template #subtitle>
                <div class="card-subtitle texttxthide txthide1" @click="goBinDir">{{ item.path }}</div>
              </template>
              <template #actions>
                <t-link :disabled="item.exist || item.loading" theme="primary" @click="handleInstall(item.name)">
                  <template v-if="item.loading" #suffix-icon>
                    <loading-icon />
                  </template>
                  {{
                    item.exist ? $t('common.installed') : item.loading ? $t('common.installing') : $t('common.install')
                  }}
                </t-link>
              </template>
            </t-card>
          </t-col>
        </t-row>
        <div class="help" @click="handleGetHelp">
          <help-circle-icon />
          {{ $t('pages.lab.binary.help') }}
        </div>
        <dialog-install-help-view v-model:visible="isVisible.binaryHelp" />
      </template>
      <div v-else class="empty">
        <t-empty />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import PQueue from 'p-queue';
import { HelpCircleIcon, LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

// import { binaryInstall } from '@/api/system';
import { getBinaryList } from '@/api/system';
import { t } from '@/locales';

import DialogInstallHelpView from './components/DialogInstallHelp.vue';

const installQueue = new PQueue({ concurrency: 1 });
const activeInstallIds = new Set<string>();

const tableList = ref<{ name: string; path: string; exist: boolean; loading: boolean }[]>([]);

const isVisible = ref({
  binaryHelp: false,
});

onMounted(() => fetchTable());

const fetchTable = async () => {
  try {
    const resp = await getBinaryList();
    if (resp?.list) tableList.value = resp.list;
  } catch (error) {
    console.error('Fail to fetch page', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleInstall = async (id: string) => {
  if (activeInstallIds.has(id)) return;

  const idx = tableList.value.findIndex((item) => item.name === id);
  if (idx === -1) return;

  activeInstallIds.add(id);

  installQueue.add(async () => {
    try {
      tableList.value[idx].loading = true;

      // const resp = await binaryInstall({ id: [id] });
      const resp = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.BINARY_INSTALL, [id]);
      tableList.value[idx].exist = resp?.[0]?.exist;
    } finally {
      activeInstallIds.delete(id);
      tableList.value[idx].loading = false;
    }

    if (activeInstallIds.size === 0) {
      fetchTable();
      MessagePlugin.success(`${t('common.success')}`);
    }
  });
};

const goBinDir = async () => {
  const path = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PATH_HOME, 'bin');
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.OPEN_PATH, path);
};

const handleGetHelp = () => {
  isVisible.value.binaryHelp = true;
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);
  overflow-y: auto;

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .card {
      .t-card {
        background-color: var(--td-bg-color-component);

        .card-subtitle {
          cursor: pointer;
        }

        &.card-warning {
          border-color: var(--td-warning-color-active);
        }
      }
    }

    .help {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--td-size-2);
      cursor: pointer;
      font-size: var(--td-font-size-link-small);
      color: var(--td-text-color-secondary);
    }

    .empty {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
