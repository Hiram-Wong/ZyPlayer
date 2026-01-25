<template>
  <div class="lab-extension-binary view-component-container">
    <div class="header">
      <group-btn :data="op" @change="handleOpChange" />
    </div>
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

        <dialog-document
          v-model:visible="active.helpDialog"
          :attach="`.${attachContent}`"
          :title="$t('pages.md.binaryHelp.title')"
          :content="$t('pages.md.binaryHelp.content')"
        />
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
import { LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { getBinaryList } from '@/api/system';
import DialogDocument from '@/components/dialog-docment/index.vue';
import GroupBtn from '@/components/group-btn/index.vue';
import { attachContent } from '@/config/global';
import { t } from '@/locales';

const emits = defineEmits(['change-nav']);

const installQueue = new PQueue({ concurrency: 1 });
const activeInstallIds = new Set<string>();

const op = computed(() => [
  { label: t('pages.lab.extension.plugin.title'), value: 'plugin' },
  { label: t('common.help'), value: 'help' },
]);

const tableList = ref<{ name: string; path: string; exist: boolean; loading: boolean }[]>([]);

const active = ref({
  helpDialog: false,
});

onMounted(() => fetchTable());

const handleOpPlugin = () => {
  emits('change-nav', 'plugin');
};

const handleOpHelp = () => {
  active.value.helpDialog = true;
};

const handleOpChange = (val: string) => {
  const handlers = {
    plugin: handleOpPlugin,
    help: handleOpHelp,
  };

  handlers?.[val]?.();
};

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
