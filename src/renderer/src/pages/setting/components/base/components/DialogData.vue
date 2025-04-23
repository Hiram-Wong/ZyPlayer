<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="$t('pages.setting.data.title')"
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :footer="false"
  >
    <template #body>
      <div class="data-dialog-container dialog-container-padding">
        <div class="data-item top">
          <p class="title-label mg-b-s">{{ $t('pages.setting.data.config') }}</p>
          <p class="content">{{ $t('pages.setting.data.configTip') }}</p>
          <div class="config mg-t">
            <t-collapse expand-mutex>
              <t-collapse-panel value="easyConfig" :header="$t('pages.setting.data.easyConfig.title')">
                <t-radio-group v-model="formData.easyConfig.type" class="input-item">
                  <t-radio value="drpy">{{ $t('pages.setting.data.easyConfig.drpy') }}</t-radio>
                  <t-radio value="tvbox">{{ $t('pages.setting.data.easyConfig.tvbox') }}</t-radio>
                  <t-radio value="catvod">{{ $t('pages.setting.data.easyConfig.catvod') }}</t-radio>
                </t-radio-group>
                <p v-if="formData.easyConfig.type === 'drpy'" class="tip">{{ $t('pages.setting.data.easyConfig.drpyTip') }}</p>
                <p v-else-if="formData.easyConfig.type === 'tvbox'" class="tip">{{ $t('pages.setting.data.easyConfig.tvboxTip') }}</p>
                <p v-else-if="formData.easyConfig.type === 'catvod'" class="tip">{{ $t('pages.setting.data.easyConfig.catvodTip') }}</p>
                <t-input :label="$t('pages.setting.data.easyConfig.address')" v-model="formData.easyConfig.url"
                  class="input-item" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
                <div class="button-group-item">
                  <t-popconfirm :content="$t('pages.setting.data.additionalTip')" placement="bottom"
                    @confirm="importData('easyConfig', 'additional')">
                    <t-button block variant="outline">{{ $t('pages.setting.data.additional') }}</t-button>
                  </t-popconfirm>
                  <t-popconfirm :content="$t('pages.setting.data.overrideTip')" placement="bottom"
                    @confirm="importData('easyConfig', 'override')">
                    <t-button block>{{ $t('pages.setting.data.override') }}</t-button>
                  </t-popconfirm>
                  <t-dropdown>
                    <t-button block variant="text">{{ $t('pages.setting.data.history') }}</t-button>
                    <t-dropdown-menu>
                      <t-dropdown-item
                        v-for="item in historyList.easyConfig"
                        :key="item.id"
                        :value="item.id"
                        @click="handleHistoryFill('easyConfig', item.id)"
                      >
                        <t-popup :content="item.videoId">{{ item.videoName }}</t-popup>
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </t-collapse-panel>
              <t-collapse-panel value="remoteImport" :header="$t('pages.setting.data.configImport.title')">
                <t-radio-group v-model="formData.completeConfig.type" class="input-item">
                  <t-radio value="remote">{{ $t('pages.setting.data.configImport.remote') }}</t-radio>
                  <t-radio value="local">{{ $t('pages.setting.data.configImport.local') }}</t-radio>
                </t-radio-group>
                <p class="tip">{{ $t('pages.setting.data.configImport.tip') }}</p>
                <div class="input-group-item">
                  <t-input :label="$t('pages.setting.data.configImport.address')"
                    v-model="formData.completeConfig.url"
                    :placeholder="$t('pages.setting.placeholder.general')"
                  />
                  <t-button v-if="formData.completeConfig.type === 'local'" class="upload-item" theme="default" @click="uploadFileEvent">
                    {{ $t('pages.setting.upload') }}
                  </t-button>
                </div>
                <div class="button-group-item">
                  <t-popconfirm :content="$t('pages.setting.data.additionalTip')" placement="bottom"
                    @confirm="importData('completeConfig', 'additional')">
                    <t-button block variant="outline">{{ $t('pages.setting.data.additional') }}</t-button>
                  </t-popconfirm>
                  <t-popconfirm :content="$t('pages.setting.data.overrideTip')" placement="bottom"
                      @confirm="importData('completeConfig', 'override')">
                    <t-button block>{{ $t('pages.setting.data.override') }}</t-button>
                  </t-popconfirm>
                  <t-dropdown>
                    <t-button block variant="text">{{ $t('pages.setting.data.history') }}</t-button>
                    <t-dropdown-menu>
                      <t-dropdown-item
                        v-for="item in historyList.completeConfig"
                        :key="item.id"
                        :value="item.id"
                        @click="handleHistoryFill('completeConfig', item.id)"
                      >
                        <t-popup :content="item.videoId">{{ item.videoName }}</t-popup>
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </t-collapse-panel>
              <t-collapse-panel value="exportData" :header="$t('pages.setting.data.configExport.title')">
                <div class="t-radio-group">
                  <t-radio v-model="active.export.site" allow-uncheck>{{
                    $t('pages.setting.data.table.site') }}</t-radio>
                  <t-radio v-model="active.export.iptv" allow-uncheck>{{
                    $t('pages.setting.data.table.iptv') }}</t-radio>
                  <t-radio v-model="active.export.channel" allow-uncheck>{{
                    $t('pages.setting.data.table.channel') }}</t-radio>
                  <t-radio v-model="active.export.analyze" allow-uncheck>{{
                    $t('pages.setting.data.table.analyze') }}</t-radio>
                  <t-radio v-model="active.export.drive" allow-uncheck>{{
                    $t('pages.setting.data.table.drive') }}</t-radio>
                  <t-radio v-model="active.export.history" allow-uncheck>{{
                    $t('pages.setting.data.table.history') }}</t-radio>
                  <t-radio v-model="active.export.star" allow-uncheck>{{
                    $t('pages.setting.data.table.star') }}</t-radio>
                  <t-radio v-model="active.export.setting" allow-uncheck>{{
                    $t('pages.setting.data.table.setting') }}</t-radio>
                </div>
                <t-popconfirm :content="$t('pages.setting.data.configExport.exportTip')" placement="bottom"
                  @confirm="exportData">
                  <t-button block  style="margin-top: var(--td-comp-margin-s);">{{ $t('pages.setting.data.configExport.export') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="clearData" :header="$t('pages.setting.data.clearData.title')">
                <div class="t-radio-group">
                  <t-radio v-model="active.clear.site" allow-uncheck>{{
                    $t('pages.setting.data.table.site') }}</t-radio>
                  <t-radio v-model="active.clear.iptv" allow-uncheck>{{
                    $t('pages.setting.data.table.iptv') }}</t-radio>
                  <t-radio v-model="active.clear.channel" allow-uncheck>{{
                    $t('pages.setting.data.table.channel') }}</t-radio>
                  <t-radio v-model="active.clear.analyze" allow-uncheck>{{
                    $t('pages.setting.data.table.analyze') }}</t-radio>
                  <t-radio v-model="active.clear.drive" allow-uncheck>{{
                    $t('pages.setting.data.table.drive') }}</t-radio>
                  <t-radio v-model="active.clear.history" allow-uncheck>{{
                    $t('pages.setting.data.table.history') }}</t-radio>
                  <t-radio v-model="active.clear.star" allow-uncheck>{{
                    $t('pages.setting.data.table.star') }}</t-radio>
                  <t-radio v-model="active.clear.thumbnail" allow-uncheck>
                    {{ $t('pages.setting.data.clearData.thumbnail') }}
                    <span class="">[{{ formData.size.thumbnail }}MB]</span>
                  </t-radio>
                  <t-radio v-model="active.clear.cache" allow-uncheck>
                    {{ $t('pages.setting.data.clearData.cache') }}
                    <span class="">[{{ formData.size.cache }}MB]</span>
                  </t-radio>
                </div>
                <t-popconfirm :content="$t('pages.setting.data.clearData.clearTip')" placement="bottom"
                  @confirm="clearData">
                  <t-button block style="margin-top: var(--td-comp-margin-s);">{{ $t('pages.setting.data.clearData.clear') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item"></div>
          </div>
        </div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.setting.data.syncDisk') }}</p>
          <p class="content">1.{{ $t('pages.setting.data.content1') }}</p>
          <p class="content">2.{{ $t('pages.setting.data.content2') }}</p>
          <p class="content">3.{{ $t('pages.setting.data.content3') }}</p>
          <div class="config mg-t">
            <t-collapse>
              <t-collapse-panel value="0" :header="$t('pages.setting.data.webdev.title')">
                <t-input :label="$t('pages.setting.data.webdev.url')" v-model="formData.webdev.data.url"
                  class="input-item"></t-input>
                <t-input :label="$t('pages.setting.data.webdev.username')" v-model="formData.webdev.data.username"
                  class="input-item"></t-input>
                <t-input :label="$t('pages.setting.data.webdev.password')" v-model="formData.webdev.data.password"
                  type="password" class="input-item"></t-input>
                <div class="sync-switch">
                  <span class="sync-switch-text">{{ $t('pages.setting.data.webdev.sync') }}</span>
                  <t-switch v-model="formData.webdev.sync" />
                </div>
                <t-button block @click="saveWebdev" style="margin-top: var(--td-comp-margin-s);">
                  {{ $t('pages.setting.data.webdev.save') }}
                </t-button>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item">
              <t-popconfirm :content="$t('pages.setting.data.syncToCloudTip')" placement="bottom"
                @confirm="rsyncRemoteEvent">
                <t-button theme="default" class="btn-2">{{ $t('pages.setting.data.syncToCloud') }}</t-button>
              </t-popconfirm>
              <t-popconfirm :content="$t('pages.setting.data.syncToLocalTip')" placement="bottom"
                @confirm="rsyncLocalEvent">
                <t-button theme="default" class="btn-2">{{ $t('pages.setting.data.syncToLocal') }}</t-button>
              </t-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch, reactive } from 'vue';
import moment from 'moment';
import { cloneDeep } from 'lodash-es';
import { useFileSystemAccess } from '@vueuse/core';

import { t } from '@/locales';
import { clearDb, exportDb, webdevLocal2Remote, webdevRemote2Local, initDb } from '@/api/setting';
import { fetchHistoryPage, delHistory, addHistory } from '@/api/history';
import emitter from '@/utils/emitter';

defineOptions({
  name: 'SettingBaseDialogData',
});

const file = useFileSystemAccess({
  dataType: 'Text',
  types: [{
    description: 'JavaScript Files',
    accept: { 'text/plain': ['.js'] },
  }, {
    description: 'Text Files',
    accept: { 'text/plain': ['.txt'] },
  }],
  excludeAcceptAllOption: false,
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {
      data: {
        sync: false,
        data: { url: '', username: '', password: '' }
      },
      type: 'data'
    },
  }
});
const formVisible = ref(false);
const formData = ref({
  webdev: {
    sync: false,
    data: { url: '', username: '', password: '' }
  },
  easyConfig: { type: 'tvbox', url: '' },
  completeConfig: { type: 'remote', url: '' },
  clearSeletct: {
    sites: false,
    iptv: false,
    analyze: false,
    drive: false,
    history: false,
    star: false,
    setting: false,
    cache: false,
    thumbnail: false,
  },
  size: { cache: 0, thumbnail: 0 },
});
const active = reactive({
  clear: {
    site: false,
    iptv: false,
    channel: false,
    analyze: false,
    drive: false,
    history: false,
    star: false,
    setting: false,
    cache: false,
    thumbnail: false,
  },
  export: {
    site: false,
    iptv: false,
    channel: false,
    analyze: false,
    drive: false,
    history: false,
    star: false,
    setting: false,
  }
});
const historyList = ref<any>({
  easyConfig: [],
  completeConfig: [],
});
const emits = defineEmits(['update:visible', 'submit']);

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) {
      Promise.all([getHistory('easyConfig'), getHistory('completeConfig')]);
      Promise.all([getCacheSize(), getThumbnailSize()]);
    };
  },
);
watch(
  () => props.data,
  (val) => {
    formData.value.webdev.sync = val.data.sync;
    formData.value.webdev.data = cloneDeep(val.data.data);
  }, { deep: true }
);

const refreshEmitter = (arryList: string[]) => {
  const actions = {
    site: () => {
      emitter.emit('refreshFilmConfig');
      emitter.emit('refreshSiteTable');
    },
    iptv: () => {
      emitter.emit('refreshIptvConfig');
      emitter.emit('refreshIptvTable');
    },
    channel: () => {
      emitter.emit('refreshIptvConfig');
    },
    analyze: () => {
      emitter.emit('refreshAnalyzeConfig');
      emitter.emit('refreshAnalyzeTable');
    },
    drive: () => {
      emitter.emit('refreshDriveConfig');
      emitter.emit('refreshDriveTable');
    },
    history: () => {
      emitter.emit('refreshHistory');
    },
    star: () => {
      emitter.emit('refreshBinge');
    },
    setting: () => {
      emitter.emit('refreshSetting');
    },
  };

  for (const action of arryList) {
    const key = action.indexOf('tbl_') > -1 ? action.split('tbl_')[1] : action;
    if (actions[key]) {
      actions[key]();
    }
  }
};

// 获取历史
const getHistory = async (type: string) => {
  try {
    const res = await fetchHistoryPage({ page: 1, pageSize: 5, type: [type] });
    if (res.hasOwnProperty('list')) historyList.value[type] = res.list;
  } catch (err: any) {
    console.error('Failed to fetch history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
  }
};

// 清除数据
const clearHistory = async (type: string) => {
  try {
    await delHistory({ type });
    historyList.value[type] = [];
  } catch (err: any) {
    console.error('Failed to clear history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
  }
};

// 增加
const addHistoryItem = async (type: string, data: { [key: string]: string}) => {
  try {
    const doc = {
      date: moment().unix(),
      relateId: data.relateId,
      videoName: data.videoName,
      videoId: data.videoId,
      type,
    };

    const isExist = historyList.value[type].some(item => item.videoId === doc.videoId);
    if (isExist) return;

    await addHistory(doc);
    await getHistory(type);
  } catch (err: any) {
    console.error('Failed to add history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
  }
};

// 填充数据
const handleHistoryFill = async (type: string, id: string) => {
  const item = historyList.value[type].find(item => item.id === id);
  if (!item) return;
  formData.value[type].url = item.videoId;
  formData.value[type].type = item.relateId;
};

// 配置导入
const importData = async (importType, importMode) => {
  try {
    let url, type, host;
    if (importType === 'easyConfig') {
      url = formData.value.easyConfig.url;
      type = formData.value.easyConfig.type;
    } else {
      url = formData.value.completeConfig.url;
      type = formData.value.completeConfig.type;
    };

    if (!url) {
      MessagePlugin.warning(t('pages.setting.data.noData'));
      return;
    };

    try { host = new URL(url).host; } catch { host = url; };

    const res = await initDb({ url, importType, remoteType: type, importMode });
    await addHistoryItem(importType, { relateId: type, videoName: host, videoId: url });
    refreshEmitter(res?.table);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.error('Failed to init db:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

// 文件事件
const uploadFileEvent = async () => {
  const res = await window.electron.ipcRenderer.invoke('dialog-file-access', {
    properties: ['openFile'],
    filters: [{
      name: 'Json Files', extensions: ['json']
    }, {
      name: 'Text Files', extensions: ['txt']
    }, {
      name: 'All Files', extensions: ['*']
    }],
  });
  if (!res || res?.filePaths?.length === 0) return;
  formData.value.completeConfig.url = res.filePaths[0];
};

// 导出
const exportData = async () => {
  if (!Object.values(active.export).some(value => value)) {
    MessagePlugin.warning(t('pages.setting.data.noSelectData'));
    return;
  }

  const activeList = Object.keys(active.export).filter(key => active.export[key]);
  const dbData = await exportDb(activeList);
  const str = JSON.stringify(dbData, null, 2);

  try {
    file.data.value = str;
    await file.saveAs({
      suggestedName: 'config.json',
    });
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err: any) {
    console.error('Failed to save or open save dialog:', err);
    if (err?.name === 'AbortError') return;
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

//  获取 cache 大小
const getCacheSize = async (): Promise<void> => {
  const size = await window.electron.ipcRenderer.invoke('manage-session', 'size');
  formData.value.size.cache = size;
};

// 删除 cache
const delCache = async (): Promise<void> => {
  await window.electron.ipcRenderer.invoke('manage-session','clearCache');
};

//  获取 thumbnail 文件夹大小
const getThumbnailSize = async (): Promise<void> => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, 'thumbnail');
  const size = await window.electron.ipcRenderer.invoke('manage-file', 'size', defaultPath);
  formData.value.size.thumbnail = size;
};

// 删除 thumbnail 文件夹
const delThumbnail = async (): Promise<void> => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, 'thumbnail');
  await window.electron.ipcRenderer.invoke('manage-file','rm', defaultPath);
};

// 清理缓存
const clearData = async () => {
  if (!Object.values(active.clear).some(value => value)) {
    MessagePlugin.warning(t('pages.setting.data.noSelectData'));
    return;
  }

  try {
    const activeList = Object.keys(active.clear).filter(key => active.clear[key]);
    const activeToRemove = ["thumbnail"];
    const formatActive = activeList.filter(item => !activeToRemove.includes(item));
    await clearDb(formatActive);

    const actions = {
      'site': async () => {
        emitter.emit('refreshFilmConfig');
        emitter.emit('refreshSiteTable');
      },
      'iptv': async () => {
        emitter.emit('refreshIptvConfig');
        emitter.emit('refreshIptvTable');
      },
      'channel': async () => {
        emitter.emit('refreshIptvConfig');
      },
      'analyze': async () => {
        emitter.emit('refreshAnalyzeConfig');
        emitter.emit('refreshAnalyzeTable');
      },
      'drive': async () => {
        emitter.emit('refreshDriveConfig');
        emitter.emit('refreshDriveTable');
      },
      'history': async () => {
        emitter.emit('refreshHistory');
        await Promise.all([getHistory('easyConfig'), getHistory('completeConfig')]);
      },
      'star': () => {
        emitter.emit('refreshBinge');
      },
      'cache': async () => {
        await delCache();
        await getCacheSize();
      },
      'thumbnail': async () => {
        await delThumbnail();
        await getThumbnailSize();
        emitter.emit('refreshIptvConfig');
      }
    };

    for (const action of activeList) {
      if (actions.hasOwnProperty(action)) {
        await actions[action]();
      }
    }

    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log('[setting][clearData] error', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

// 保存
const saveWebdev = () => {
  emits('submit', {
    data: JSON.parse(JSON.stringify(formData.value.webdev)),
    type: 'webdev'
  });
};

// 覆盖远端
const rsyncRemoteEvent = async () => {
  const { url, username, password } = formData.value.webdev.data;
  if (!url || !username || !password) {
    MessagePlugin.warning(t('pages.setting.data.noData'));
    return;
  };
  const res = await webdevLocal2Remote();
  if (res) {
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  };
};

// 覆盖本地
const rsyncLocalEvent = async () => {
  const { url, username, password } = formData.value.webdev.data;
  if (!url || !username || !password) {
    MessagePlugin.warning(t('pages.setting.data.noData'));
    return;
  };
  const res = await webdevRemote2Local();
  if (res) {
    refreshEmitter(['site','iptv','channel','analyze','drive','history','star','setting'])
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  };
};
</script>

<style lang="less" scoped>
.data-dialog-container {
  max-height: 430px;

  .data-item {
    .content {
      font: var(--td-font-link-small);
    }

    .config {
      .input-item {
        margin-bottom: var(--td-comp-margin-s);
      }
      .input-group-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--td-comp-margin-m);
        gap: 10px;
        align-items: center;

        :deep(.t-button) {
          background-color: var(--td-bg-content-input-1);
          border-color: transparent;
          &:hover {
            background-color: var(--td-bg-color-component-hover);
          }
        }
      }
      .button-group-item {
        display: flex;
        gap: 6px;
      }
    }

    .action {
      .action-item {
        margin-top: var(--td-comp-margin-s);
        display: flex;
        justify-content: space-between;

        .btn-2 {
          width: 49%;
        }

        .btn-3 {
          width: 33%;
        }
      }
    }

    .sync-switch {
      background-color: var(--td-bg-content-input-1);
      border-color: transparent;
      margin: 0;
      padding: 0;
      list-style: none;
      position: relative;
      height: var(--td-comp-size-m);
      border-width: 1px;
      border-style: solid;
      border-radius: var(--td-radius-default);
      padding: 0 var(--td-comp-paddingLR-s);
      outline: none;
      color: var(--td-text-color-primary);
      font: var(--td-font-body-medium);
      width: 100%;
      box-sizing: border-box;
      transition: border cubic-bezier(0.38, 0, 0.24, 1) 0.2s, box-shadow cubic-bezier(0.38, 0, 0.24, 1) 0.2s, background-color cubic-bezier(0.38, 0, 0.24, 1) 0.2s;
      display: flex;
      align-items: center;
      overflow: hidden;
      .sync-switch-text {
        margin-right: var(--td-comp-margin-s);
        z-index: 2;
        height: 100%;
        text-align: center;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
