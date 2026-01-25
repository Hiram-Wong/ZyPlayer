<template>
  <div class="setting-data view-component-container">
    <div class="content">
      <t-collapse default-expand-all>
        <t-collapse-panel value="simple-import" :header="$t('pages.setting.data.easyConfig.title')">
          <div class="form">
            <t-radio-group v-model="importSimpleFormData.type">
              <t-radio :value="DATA_SIMPLE_TYPE.TVBOX">
                {{ $t('pages.setting.data.easyConfig.field.typeMap.tvbox') }}
              </t-radio>
              <t-radio :value="DATA_SIMPLE_TYPE.CATVOD">
                {{ $t('pages.setting.data.easyConfig.field.typeMap.catvod') }}
              </t-radio>
              <!-- <t-radio :value="DATA_SIMPLE_TYPE.DRPY">
                {{ $t('pages.setting.data.easyConfig.field.typeMap.drpy') }}
              </t-radio> -->
            </t-radio-group>
            <t-select
              v-model="importSimpleFormData.url"
              :label="$t('pages.setting.data.config.field.url')"
              creatable
              filterable
              @create="createHistoryOptions(DATA_IMPORT_TYPE.SIMPLE, $event as string)"
            >
              <t-option
                v-for="item in importSimpleHistoryList"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                @click="handleHistoryFillFormData(DATA_IMPORT_TYPE.SIMPLE, item.type, item.value)"
              />
            </t-select>
            <div class="action">
              <t-popconfirm
                :content="$t('pages.setting.data.config.popup.additional')"
                placement="bottom"
                @confirm="importData(DATA_IMPORT_TYPE.SIMPLE, DATA_PUT_TYPE.ADDITIONAL)"
              >
                <t-button theme="default" variant="base" block>
                  {{ $t('pages.setting.data.additional') }}
                </t-button>
              </t-popconfirm>
              <t-popconfirm
                :content="$t('pages.setting.data.config.popup.override')"
                placement="bottom"
                @confirm="importData(DATA_IMPORT_TYPE.SIMPLE, DATA_PUT_TYPE.OVERWRITE)"
              >
                <t-button theme="primary" variant="base" block>
                  {{ $t('pages.setting.data.override') }}
                </t-button>
              </t-popconfirm>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <t-collapse>
        <t-collapse-panel value="complete-import" :header="$t('pages.setting.data.configImport.title')">
          <div class="form">
            <t-radio-group v-model="importCompleteFormData.type">
              <t-radio :value="DATA_COMPLETE_TYPE.REMOTE">
                {{ $t('pages.setting.data.configImport.field.typeMap.remote') }}
              </t-radio>
              <t-radio :value="DATA_COMPLETE_TYPE.LOCAL">
                {{ $t('pages.setting.data.configImport.field.typeMap.local') }}
              </t-radio>
            </t-radio-group>
            <div class="form-item-group">
              <t-select
                v-model="importCompleteFormData.url"
                :label="$t('pages.setting.data.config.field.url')"
                creatable
                filterable
                @create="createHistoryOptions(DATA_IMPORT_TYPE.COMPLETE, $event as string)"
              >
                <t-option
                  v-for="item in importCompleteHistoryList"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                  @click="handleHistoryFillFormData(DATA_IMPORT_TYPE.COMPLETE, item.type, item.value)"
                />
              </t-select>
              <t-button
                v-if="importCompleteFormData.type === DATA_COMPLETE_TYPE.LOCAL"
                theme="default"
                @click="uploadFileEvent"
              >
                {{ $t('common.upload') }}
              </t-button>
            </div>
            <div class="action">
              <t-popconfirm
                :content="$t('pages.setting.data.config.popup.additional')"
                placement="bottom"
                @confirm="importData(DATA_IMPORT_TYPE.COMPLETE, DATA_PUT_TYPE.ADDITIONAL)"
              >
                <t-button theme="default" variant="base" block>
                  {{ $t('pages.setting.data.additional') }}
                </t-button>
              </t-popconfirm>
              <t-popconfirm
                :content="$t('pages.setting.data.config.popup.override')"
                placement="bottom"
                @confirm="importData(DATA_IMPORT_TYPE.COMPLETE, DATA_PUT_TYPE.OVERWRITE)"
              >
                <t-button theme="primary" variant="base" block>
                  {{ $t('pages.setting.data.override') }}
                </t-button>
              </t-popconfirm>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <t-collapse default-expand-all>
        <t-collapse-panel value="export" :header="$t('pages.setting.data.configExport.title')">
          <div class="form">
            <div class="t-radio-group">
              <t-radio
                v-for="item in TABLE_OPTIONS"
                :key="item.value"
                v-model="exportFormData[item.value]"
                allow-uncheck
              >
                {{ item.label }}
              </t-radio>
            </div>
            <div class="action">
              <t-button theme="primary" variant="base" block @click="exportData">
                {{ $t('common.export') }}
              </t-button>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <t-collapse>
        <t-collapse-panel value="clear" :header="$t('pages.setting.data.clearData.title')">
          <div class="form">
            <div class="t-radio-group">
              <t-radio
                v-for="item in TABLE_OPTIONS"
                :key="item.value"
                v-model="clearFormData[item.value]"
                allow-uncheck
              >
                {{ item.label }}
              </t-radio>
              <t-radio v-model="clearFormData.cache" allow-uncheck>
                {{ $t('common.cache') }}
              </t-radio>
            </div>
            <div class="action">
              <t-popconfirm
                :content="$t('pages.setting.data.config.popup.clear')"
                placement="bottom"
                theme="danger"
                @confirm="clearData"
              >
                <t-button theme="danger" variant="base" block>
                  {{ $t('common.clear') }}
                </t-button>
              </t-popconfirm>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <t-collapse>
        <t-collapse-panel value="sync" :header="$t('pages.setting.data.sync.title')">
          <div class="form">
            <t-select v-model="cloudFormData.type" :label="$t('common.type')">
              <t-option
                v-if="isMacOS"
                value="icloud"
                :label="$t('pages.setting.data.sync.field.typeMap.icloud')"
              ></t-option>
              <t-option value="webdav" :label="$t('pages.setting.data.sync.field.typeMap.webdav')"></t-option>
            </t-select>
            <template v-if="cloudFormData.type === 'webdav'">
              <t-input v-model="cloudFormData.url" :label="$t('pages.setting.data.sync.field.url')" />
              <t-input v-model="cloudFormData.username" :label="$t('pages.setting.data.sync.field.username')" />
              <t-input
                v-model="cloudFormData.password"
                :label="$t('pages.setting.data.sync.field.password')"
                type="password"
              />
            </template>
            <div class="form-item-group">
              <span class="form-item-label">{{ $t('pages.setting.data.sync.field.autoSync') }}</span>
              <t-switch v-model="cloudFormData.sync" />
            </div>
            <div class="action">
              <t-button theme="primary" variant="base" block @click="saveWebdavConf">
                {{ $t('common.save') }}
              </t-button>
              <t-popconfirm
                :content="$t('pages.setting.data.sync.popup.backup')"
                placement="bottom"
                @confirm="cloudBackup"
              >
                <t-button theme="default" variant="base" block>
                  {{ $t('pages.setting.data.sync.action.backup') }}
                </t-button>
              </t-popconfirm>
              <t-popconfirm
                :content="$t('pages.setting.data.sync.popup.resume')"
                placement="bottom"
                @confirm="cloudResume"
              >
                <t-button theme="default" variant="base" block>
                  {{ $t('pages.setting.data.sync.action.resume') }}
                </t-button>
              </t-popconfirm>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  IDataCompleteType,
  IDataImportType,
  IDataPutType,
  IDataRemoteType,
  IDataSimpleType,
} from '@shared/config/data';
import {
  DATA_COMPLETE_TYPE,
  DATA_IMPORT_TYPE,
  DATA_PUT_TYPE,
  DATA_SIMPLE_TYPE,
  dataImportTypes,
} from '@shared/config/data';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { toUnix } from '@shared/modules/date';
import { isArray, isArrayEmpty, isHttp, isStrEmpty, isString } from '@shared/modules/validate';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { dataCloudBackup, dataCloudResume, dataDbClear, dataDbExport, dataDbImport } from '@/api/data';
import { addHistory, fetchHistoryPage } from '@/api/moment';
import { getSettingDetail, putSetting } from '@/api/setting';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import { isMacOS } from '@/utils/systeminfo';

const TABLE_OPTIONS = computed(() => [
  { label: t('pages.film.title'), value: 'site' },
  { label: t('pages.live.title'), value: 'live' },
  { label: t('pages.parse.title'), value: 'analyze' },
  { label: t('pages.moment.history.title'), value: 'history' },
  { label: t('pages.moment.star.title'), value: 'star' },
  { label: t('pages.setting.title'), value: 'setting' },
  { label: t('pages.plugin.title'), value: 'plugin' },
]);

const HISTORY_TYPE_MAP: Record<IDataImportType, 6 | 7> = { simple: 6, complete: 7 };

const importSimpleFormData = ref<{ type: IDataSimpleType; url: string }>({
  type: DATA_SIMPLE_TYPE.TVBOX,
  url: '',
});
const importSimpleHistoryList = ref<Array<{ label: string; value: string; type: IDataSimpleType }>>([]);

const importCompleteFormData = ref<{ type: IDataCompleteType; url: string }>({
  type: DATA_COMPLETE_TYPE.REMOTE,
  url: '',
});
const importCompleteHistoryList = ref<Array<{ label: string; value: string; type: IDataCompleteType }>>([]);

const exportFormData = ref({
  site: false,
  // iptv: false,
  // channel: false,
  live: false,
  analyze: false,
  history: false,
  star: false,
  setting: false,
  plugin: false,
});

const clearFormData = ref({
  site: false,
  // iptv: false,
  // channel: false,
  live: false,
  analyze: false,
  history: false,
  star: false,
  setting: false,
  plugin: false,
  cache: false,
});

const cloudFormData = ref({
  type: 'webdav' as 'webdav' | 'icloud',
  sync: false,
  url: '',
  username: '',
  password: '',
});

onMounted(() => setup());

const setup = () => {
  dataImportTypes.forEach((type) => getHistoryConf(type));
  getCloudConf();
};

const refreshEmitter = (types: string[] = []) => {
  const handlers: Record<string, string> = {
    site: emitterChannel.REFRESH_FILM_CONFIG,
    film: emitterChannel.REFRESH_FILM_CONFIG,

    iptv: emitterChannel.REFRESH_LIVE_CONFIG,
    channel: emitterChannel.REFRESH_LIVE_CONFIG,
    live: emitterChannel.REFRESH_LIVE_CONFIG,

    analyze: emitterChannel.REFRESH_PARSE_CONFIG,
    parse: emitterChannel.REFRESH_PARSE_CONFIG,

    history: emitterChannel.REFRESH_MOMENT_CONFIG,
    star: emitterChannel.REFRESH_MOMENT_CONFIG,
    moment: emitterChannel.REFRESH_MOMENT_CONFIG,

    setting: emitterChannel.REFRESH_SETTING_CONFIG,
  };

  if (isArrayEmpty(types)) {
    types = Object.keys(handlers);
  }

  for (const type of types) {
    const ch = handlers[type];
    if (ch) emitter.emit(ch, { source: emitterSource.SETTING_DATA });
  }
};

const getHistoryConf = async (importType: IDataImportType) => {
  try {
    const resp = await fetchHistoryPage({ page: 1, pageSize: 10, type: [HISTORY_TYPE_MAP[importType]] });

    const rawList = isArray(resp?.list) ? resp.list : [];
    const target = importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleHistoryList : importCompleteHistoryList;

    target.value = rawList
      .filter((o, i, arr) => arr.findIndex((t) => t.videoId === o.videoId) === i)
      .map((item) => ({ label: item.videoName, value: item.videoId, type: item.relateId }))
      .slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch history:', error);
  }
};

const getCloudConf = async () => {
  try {
    const resp = await getSettingDetail('cloud');

    if (Object.hasOwn(resp, 'sync') && Object.hasOwn(resp, 'type')) {
      cloudFormData.value = resp;
    }
  } catch (error) {
    console.error('Failed to fetch sync config:', error);
  }
};

const createHistoryOptions = async (importType: IDataImportType, val: string) => {
  try {
    const target = importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleHistoryList : importCompleteHistoryList;
    const targetIndex = target.value.findIndex((item) => item.value === val);
    if (targetIndex === -1) {
      if (target.value.length >= 5) {
        target.value.pop();
      }
      const type: IDataRemoteType =
        importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleFormData.value.type : importCompleteFormData.value.type;
      target.value.unshift({ value: val, label: val, type } as any);

      await addHistory({
        videoName: val,
        videoId: val,
        relateId: type,
        type: HISTORY_TYPE_MAP[importType],
      });
    }
  } catch (error) {
    console.error('Failed to create history options:', error);
  }
};

const handleHistoryFillFormData = async (importType: IDataImportType, form: IDataRemoteType, value: string) => {
  const target = importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleFormData : importCompleteFormData;
  target.value.url = value;
  target.value.type = form;
};

const importData = async (importType: IDataImportType, putType: IDataPutType) => {
  try {
    const api =
      importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleFormData.value.url : importCompleteFormData.value.url;
    const type =
      importType === DATA_IMPORT_TYPE.SIMPLE ? importSimpleFormData.value.type : importCompleteFormData.value.type;

    if (isStrEmpty(api)) {
      MessagePlugin.warning(t('common.message.noRequiredParam'));
      return;
    }

    const resp = await dataDbImport({ importType, putType, api, remoteType: type });

    if (resp) {
      refreshEmitter();
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const uploadFileEvent = async () => {
  try {
    const resp = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FILE_DIALOG, {});
    if (!isArray(resp) || isArrayEmpty(resp)) {
      MessagePlugin.warning(t('common.fail'));
      return;
    }

    const path = resp[0];
    importCompleteFormData.value.url = path;

    try {
      createHistoryOptions(DATA_IMPORT_TYPE.COMPLETE, path);
    } catch {
      // do nothing
    }

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Upload file error:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const exportData = async () => {
  try {
    const keyList = Object.keys(exportFormData.value).filter((k) => exportFormData.value[k]) ?? [];
    if (isArrayEmpty(keyList)) return;

    const resp = await dataDbExport({ type: keyList });
    const content = JSON.stringify(resp, null, 2);

    const { status: writeStatus } = await window.electron.ipcRenderer.invoke(
      IPC_CHANNEL.FILE_SELECT_FILE_WRITE,
      content,
      { defaultPath: `zy_config_${toUnix()}.json` },
    );

    if (writeStatus) MessagePlugin.success(t('common.success'));
    else MessagePlugin.warning(t('common.fail'));
  } catch (error) {
    console.error(`Export data error:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const clearData = async () => {
  try {
    const keyList = Object.keys(clearFormData.value).filter((k) => clearFormData.value[k]) ?? [];
    if (isArrayEmpty(keyList)) return;

    const resp = await dataDbClear({ type: keyList });

    if (resp) {
      refreshEmitter(keyList);
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Clear data error:', error);
    MessagePlugin.error(`${t('common.error')}:${error}`);
  }
};

const saveWebdavConf = async () => {
  try {
    const doc = cloudFormData.value;
    const resp = await putSetting({ key: 'cloud', value: doc });
    if (isArray(resp) && !isArrayEmpty(resp)) {
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Failed to save cloud config error:', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const cloudBackup = async () => {
  try {
    const { url, username, password, type } = cloudFormData.value;
    if (
      type === 'webdav' &&
      (!isHttp(url) || !isString(username) || isStrEmpty(username) || !isString(password) || isStrEmpty(password))
    ) {
      MessagePlugin.warning(t('common.message.noRequiredParam'));
      return;
    }

    const syncStatus = await dataCloudBackup();
    if (syncStatus) {
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Failed to sync local error:', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const cloudResume = async () => {
  try {
    const { url, username, password, type } = cloudFormData.value;
    if (
      type === 'webdav' &&
      (!isHttp(url) || !isString(username) || isStrEmpty(username) || !isString(password) || isStrEmpty(password))
    ) {
      MessagePlugin.warning(t('common.message.noRequiredParam'));
      return;
    }

    const syncStatus = await dataCloudResume();
    if (syncStatus) {
      refreshEmitter();
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Failed to sync remote error:', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 0 var(--td-comp-paddingTB-s) 0;
  overflow-y: auto;

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    padding-right: var(--td-comp-paddingLR-s);

    .form {
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      &-item-group {
        display: flex;
        align-items: center;
        gap: var(--td-size-4);

        .form-item-label {
          color: var(--td-text-color-primary);
          font: var(--td-font-body-medium);
        }
      }

      .action {
        display: flex;
        gap: var(--td-size-4);
      }
    }
  }
}
</style>
