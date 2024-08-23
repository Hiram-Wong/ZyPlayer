<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.data.title')" placement="center" :footer="false">
    <template #body>
      <div class="data-dialog-container dialog-container-padding">
        <div class="data-item">
          <span class="separator"></span>
          <p class="title">{{ $t('pages.setting.data.config') }}</p>
          <p class="content">{{ $t('pages.setting.data.configTip') }}</p>
          <div class="config">
            <t-collapse expand-mutex>
              <t-collapse-panel value="easyConfig" :header="$t('pages.setting.data.easyConfig.title')">
                <t-radio-group v-model="formData.easyConfig.type">
                  <t-radio :value="0">{{ $t('pages.setting.data.easyConfig.app') }}</t-radio>
                  <t-radio :value="1">{{ $t('pages.setting.data.easyConfig.drpy') }}</t-radio>
                  <t-radio :value="2">{{ $t('pages.setting.data.easyConfig.tvbox') }}</t-radio>
                  <t-radio :value="3">{{ $t('pages.setting.data.easyConfig.hipy') }}</t-radio>
                </t-radio-group>
                <p v-if="formData.easyConfig.type === 0" class="tip">{{ $t('pages.setting.data.easyConfig.appTip') }}
                </p>
                <p v-else-if="formData.easyConfig.type === 1" class="tip">{{ $t('pages.setting.data.easyConfig.drpyTip')
                  }}</p>
                <p v-else-if="formData.easyConfig.type === 2" class="tip">{{
                  $t('pages.setting.data.easyConfig.tvboxTip') }}</p>
                <t-input :label="$t('pages.setting.data.easyConfig.address')" v-model="formData.easyConfig.url"
                  class="input-item" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
                <t-popconfirm :content="$t('pages.setting.data.easyConfig.confirmTip')" placement="bottom"
                  @confirm="easyConfig">
                  <t-button size="small" block ghost>{{ $t('pages.setting.data.easyConfig.confirm') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="remoteImport" :header="$t('pages.setting.data.configImport.title')">
                <t-radio-group v-model="formData.importData.type">
                  <t-radio value="remote">{{ $t('pages.setting.data.configImport.remote') }}</t-radio>
                  <t-radio value="local">{{ $t('pages.setting.data.configImport.local') }}</t-radio>
                </t-radio-group>
                <p class="content">{{ $t('pages.setting.data.configImport.dropTip') }}</p>
                <div v-if="formData.importData.type === 'remote'">
                  <t-input :label="$t('pages.setting.data.configImport.address')"
                    v-model="formData.importData.remoteImpoUrl" class="input-item"
                    :placeholder="$t('pages.setting.placeholder.general')"></t-input>
                </div>
                <div v-else>
                  <t-upload v-model="formData.importData.localImpoFile" class="input-item" theme="file" :max="1"
                    accept="application/json" :draggable="true" :request-method="requestMethod" />
                </div>
                <t-popconfirm :content="$t('pages.setting.data.configImport.importTip')" placement="bottom"
                  @confirm="importData">
                  <t-button size="small" block ghost>{{ $t('pages.setting.data.configImport.import') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="exportData" :header="$t('pages.setting.data.configExport.title')">
                <t-radio v-model="active.export.site" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.site') }}</t-radio>
                <t-radio v-model="active.export.iptv" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.iptv') }}</t-radio>
                <t-radio v-model="active.export.channel" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.channel') }}</t-radio>
                <t-radio v-model="active.export.analyze" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.analyze') }}</t-radio>
                <t-radio v-model="active.export.drive" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.drive') }}</t-radio>
                <t-radio v-model="active.export.history" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.history') }}</t-radio>
                <t-radio v-model="active.export.star" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.star') }}</t-radio>
                <t-radio v-model="active.export.setting" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.configExport.setting') }}</t-radio>
                <t-popconfirm :content="$t('pages.setting.data.configExport.exportTip')" placement="bottom"
                  @confirm="exportData">
                  <t-button size="small" block ghost>{{ $t('pages.setting.data.configExport.export') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="clearData" :header="$t('pages.setting.data.clearData.title')">
                <t-radio v-model="active.clear.site" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.site') }}</t-radio>
                <t-radio v-model="active.clear.iptv" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.iptv') }}</t-radio>
                <t-radio v-model="active.clear.channel" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.channel') }}</t-radio>
                <t-radio v-model="active.clear.analyze" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.analyze') }}</t-radio>
                <t-radio v-model="active.clear.drive" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.drive') }}</t-radio>
                <t-radio v-model="active.clear.history" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.history') }}</t-radio>
                <t-radio v-model="active.clear.star" allow-uncheck class="radio-item">{{
                  $t('pages.setting.data.clearData.star') }}</t-radio>
                <t-radio v-model="active.clear.thumbnail" allow-uncheck class="radio-item">
                  {{ $t('pages.setting.data.clearData.thumbnail') }}
                  <span class="title">「{{ formData.size.thumbnail }}MB」</span>
                </t-radio>
                <t-radio v-model="active.clear.cache" allow-uncheck class="radio-item">
                  {{ $t('pages.setting.data.clearData.cache') }}
                  <span class="title">「{{ formData.size.cache }}MB」</span>
                </t-radio>
                <t-popconfirm :content="$t('pages.setting.data.clearData.clearTip')" placement="bottom"
                  @confirm="clearData">
                  <t-button size="small" block ghost>{{ $t('pages.setting.data.clearData.clear') }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item"></div>
          </div>
        </div>
        <div class="data-item">
          <span class="separator"></span>
          <p class="title">{{ $t('pages.setting.data.syncDisk') }}</p>
          <p class="content">1.{{ $t('pages.setting.data.content1') }}</p>
          <p class="content">2.{{ $t('pages.setting.data.content2') }}</p>
          <p class="content">3.{{ $t('pages.setting.data.content3') }}</p>
          <div class="config">
            <t-collapse>
              <t-collapse-panel value="0" :header="$t('pages.setting.data.webdev.title')">
                <template #headerRightContent>
                  <t-space size="small">
                    <span class="sync-switch">
                      <span class="sync-switch-text">{{ $t('pages.setting.data.webdev.sync') }}</span>
                      <t-switch v-model="formData.webdev.sync" />
                    </span>
                    <t-button size="small" shape="round" @click.stop="saveWebdev">{{
                      $t('pages.setting.data.webdev.save') }}</t-button>
                    <t-button size="small" shape="round" theme="default" @click.stop="checkWebdevEvent">{{
                      $t('pages.setting.data.webdev.check') }}</t-button>
                  </t-space>
                </template>
                <t-input :label="$t('pages.setting.data.webdev.url')" v-model="formData.webdev.data.url"
                  class="input-item"></t-input>
                <t-input :label="$t('pages.setting.data.webdev.username')" v-model="formData.webdev.data.username"
                  class="input-item"></t-input>
                <t-input :label="$t('pages.setting.data.webdev.password')" v-model="formData.webdev.data.password"
                  type="password" class="input-item"></t-input>
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
import Base64 from 'crypto-js/enc-base64';
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import { nanoid } from 'nanoid';
import { ref, watch, reactive } from 'vue';
import joinUrl from 'url';

import { t } from '@/locales';
import { initializeWebdavClient, rsyncLocal, rsyncRemote } from '@/utils/webdev';
import { updateSetting, clearDb, exportDb, setDefault, initDb } from '@/api/setting';
import emitter from '@/utils/emitter';
import { getConfig, encodeMd5 } from '@/utils/tool';

import pkg from '../../../../../../../package.json'

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  webdev: {
    type: Object,
    default: () => {
      return {};
    },
  }
});
const formVisible = ref(false);
const formData = reactive({
  webdev: {
    sync: false,
    data: {
      url: '',
      username: '',
      password: ''
    }
  },
  easyConfig: {
    type: 0,
    url: ''
  },
  importData: {
    type: 'remote',
    remoteImpoUrl: '',
    localImpoFile: [],
  },
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
  size: {
    cache: '',
    thumbnail: '',
  },
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

const emit = defineEmits(['update:visible']);

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) {
      getCacheSize();
      getThumbnailSize();
    };
  },
);
watch(
  () => props.webdev,
  (val) => {
    formData.webdev = val.webdev;
  }
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
  };

  for (const action of arryList) {
    const key = action.indexOf('tbl_') > -1 ? action.split('tbl_')[1] : action;
    console.log(key);
    if (actions[key]) {
      actions[key]();
    }
  }
};

// 一键配置
const easyConfig = async () => {
  const { url, type } = formData.easyConfig;
  if (!url) return;

  let config = await getConfig(url);
  if (!_.isPlainObject(config)) return;

  let data = {};

  const formatType = (selectType: number, soureceType: number, type: string) => {
    // 0cms[xml] 1cms[json] 2drpy[js0] 6hipy[t4] 3app[v3] 4app[v3]

    if (selectType === 1) return 2; // drpy
    else if (type === 'csp_XBPQ') return 9; // xbpq
    else if (selectType === 2) return 1; // tvbox
    else if (selectType === 3) {
      switch (soureceType) {
        case 0: return 0; // 0cms[xml]
        case 1: return 1; // 1cms[json]
        case 3: return 7; // 1cms[json]
        case 4: return 6; // hipy
      }
    } // hipy
  };

  const formatGroup = (type) => {
    switch (type) {
      case 1: return 'drpy';
      case 2: return 'tvbox';
      case 3: return 'hipy';
      default: return '';
    }
  };

  const formatUrl = (relativeUrl: string, baseUrl: string): string => {
    if (!relativeUrl) return '';
    console.log(relativeUrl)
    if (typeof relativeUrl === 'object') return JSON.stringify(relativeUrl);
    if (relativeUrl.startsWith('csp_XBPQ')) return relativeUrl;
    return joinUrl.resolve(baseUrl, relativeUrl);
  };

  try {
    // 添加数据
    const defaultObject = {
      defaultSite: '',
      defaultIptv: '',
      defaultAnalyze: '',
      defaultDrive: ''
    };

    if (type === 0) {
      ['sites', 'iptv', 'analyze', 'drive'].forEach(key => {
        if (_.has(config, key)) {
          const tblKey = key === 'sites' ? 'site' : key;
          data[`tbl_${tblKey}`] = config[key].data;
          defaultObject[`default${_.upperFirst(tblKey)}`] = `${config[key].default}`;
        }
      });

      for (const key in defaultObject) {
        if (defaultObject[key]) {
          await setDefault(key, defaultObject[key]);
        }
      }
    } else {
      if (_.has(config, "sites")) {
        data["tbl_site"] = config.sites
          .filter((item) => [0, 1, 4].includes(item.type)|| (item.type === 3 && item.api === 'csp_XBPQ') || (item.type === 3 && item.api.includes('.js') && item.ext && typeof item.ext === 'string' && item.ext.includes('.js')))
          .map((item) => ({
            // id: [0, 1].includes(item.type) ? nanoid() : encodeMd5(item.api.split('/').slice(-1)[0] + '|' + (item.ext && typeof item.ext === 'string' ? item.ext.split('/').slice(-1)[0] : '')),
            id: nanoid(),
            name: item.name,
            type: formatType(type, item.type, item.api),
            api: formatUrl(item.api, url),
            group: formatGroup(type),
            search: _.has(item, "searchable") ? item.searchable : 0,
            categories: _.has(item, "categories") ? (_.isArray(item.categories) ? _.join(item.categories, ',') : item.categories) : null, // 转字符串
            ext: _.has(item, "ext") ? formatUrl(item.ext, url) : '',
            isActive: true,
            status: true,
          }));
      };
      if (_.has(config, 'lives')) {
        let oldLives = _.find(config.lives, { group: 'redirect' });
        if (oldLives && !Array.isArray(oldLives)) {
          oldLives = [oldLives]
        }
        let iptv: any = [];
        if (oldLives && oldLives.length > 0 && oldLives[0].channels) {
          oldLives.forEach(live => {
            live.channels.forEach(channel => {
              const urlBase64 = channel.urls[0].split('&ext=')[1];
              let url = urlBase64;

              // 使用正则表达式判断字符串是否为 Base64 编码
              const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(urlBase64);

              if (isBase64) {
                // 如果具有 Base64 编码的特征，则解码
                url = Base64.parse(urlBase64);
              }

              iptv.push({
                id: nanoid(),
                name: channel.name,
                type: 'remote',
                isActive: true,
                url: url
              });

            });
          });
        } else {
          iptv = config.lives.map(live => {
            return {
              id: nanoid(),
              name: live.name,
              type: 'remote',
              isActive: true,
              url: formatUrl(live.url, url)
            };
          });
        }
        data['tbl_iptv'] = iptv;
      };
      if (_.has(config, 'parses')) {
        const analyze = _.filter(config.parses, item => _.startsWith(item.url, 'http'))
          .map(item => ({
            id: nanoid(),
            name: item.name,
            url: item.url,
            type: item.type ? item.type : 0,
            isActive: true,
          }));
        data['tbl_analyze'] = analyze;
      };
      if (_.has(config, 'drives')) {
        const drives = _.filter(config.drives, item => item.type === 'alist' || !item.type)
          .map(item => ({
            id: nanoid(),
            name: item.name,
            server: item.server,
            startPage: item.startPage || '',
            search: !!item.search,
            headers: item.headers || null,
            params: item.params || null,
            isActive: true,
          }));
        data['tbl_drive'] = drives;
      }
    };

    data = await commonDelImportData(data);
    await initDb(data);
    await refreshEmitter(Object.keys(data));
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log('[setting][easyConfig] error', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

// 配置导入
const importData = async () => {
  const { type, remoteImpoUrl, localImpoFile } = formData.importData;

  if ((type === 'remote' && !remoteImpoUrl) || (type === 'local') && (localImpoFile.length === 0)) {
    return;
  };

  if (type === 'remote') {
    await importFromRemote(remoteImpoUrl);
  } else {
    await importFromLocal(localImpoFile[0]['raw']);
  };
};

// 格式化设置数据
const formatSet = (data) => {
  const pkgVersion = pkg.version;

  // 更新或添加新键值对
  const newEntries = [
    {
      key: "windowPosition", value: {
        status: _.get(data, ["restoreWindowPositionAndSize", "value"], false),
        position_main: { width: 1000, height: 640 },
        position_play: { width: 875, height: 550 }
      }
    },
    {
      key: "webdev", value: {
        sync: false, data: {
          url: _.get(data, ["webdevUrl", "value"], "https://dav.jianguoyun.com/dav/"),
          username: _.get(data, ["webdevUsername", "value"], ""),
          password: _.get(data, ["webdevPassword", "value"], "")
        }
      }
    },
    { key: "lang", value: "zh_CN" },
    { key: "defaultViewCasual", value: "" },
    { key: "barrage", value: { url: "", key: "danmuku", support: ["qq", "qiyi", "youku", "mgtv"], start: "0", mode: "1", color: "2", content: "4" } },
    { key: "playerMode", value: { type: _.get(data, ["broadcasterType", "value"], 'xgplayer'), external: _.get(data, ["externalPlayer", "value"], '') } },
    { key: "snifferMode", value: { type: _.get(data, ["snifferType", "value"], "pie"), url: "" } },
    { key: "timeout", value: 5000 },
    {
      key: "ai", value: {
        server: "",
        key: "",
        model: ""
      }
    },
    { key: "defaultFilterType", value: "off" },
    { key: "debug", value: false },
    { key: "dns", value: "" },
    { key: "version", value: pkgVersion },
    // ... 其他新键值对
  ];

  newEntries.forEach(({ key, value }) => {
    const index = _.findIndex(data, { key });
    if (index > -1) {
      const entry = data[index];
      if (key === 'windowPosition' && typeof entry.value !== 'object') {
        data[index].value = value;
      } else if (key === 'version') {
        data[index].value = value;
      }
    } else {
      data.push({ id: nanoid(), key, value });
    }
  });

  // 删除不再需要的旧键
  const keysToRemove = [
    'webdevUrl', 'webdevUsername', 'webdevPassword',
    'broadcasterType', 'externalPlayer', 'snifferType',
    'restoreWindowPositionAndSize', 'analyzeSupport', 'analyzeQuickSearchType',
    'pauseWhenMinimize', 'skipStartEnd'
  ];
  keysToRemove.forEach((key) => {
    const index = _.findIndex(data, { key });
    if (index > -1) {
      data.splice(index, 1);
    }
  });

  return data;
}

// 公共导入方法
const commonDelImportData = (data) => {
  try {
    // 先处理旧数据
    ['sites', 'iptv', 'analyze', 'drive', 'setting', 'channel'].forEach(key => {
      if (_.has(data, key)) {
        const tblKey = key === 'sites' ? 'site' : key;
        if (key === 'setting') {
          const tblSetting = data.setting[0]
            ? Object.entries(data.setting[0]).map(([k, v]) => ({ key: k, value: v }))
            : [];

          data[`tbl_${tblKey}`] = tblSetting;
        } else {
          data[`tbl_${tblKey}`] = data[key].data || data[key];
        }
      }
    });

    // 处理设置, 兼容一键配置
    if (_.has(data, "tbl_setting") && !_.isEmpty(data["tbl_setting"])) data['tbl_setting'] = formatSet(data['tbl_setting']);

    // 规范化 id 字段
    const newDataTypes = ['tbl_site', 'tbl_iptv', 'tbl_channel', 'tbl_analyze', 'tbl_drive', 'tbl_history', 'tbl_star', 'tbl_setting'];
    for (const dataType of newDataTypes) {
      if (_.has(data, dataType)) {
        const dataArray = data[dataType];

        for (let i = 0; i < dataArray.length; i++) {
          const dataItem = dataArray[i];
          if (_.has(dataItem, 'id')) {
            // 使用 _.isString() 检查 dataItem.id 是否为字符串类型
            if (!_.isString(dataItem.id)) {
              data[dataType][i].id = `${dataArray[i].id}`;
            }
          } else {
            data[dataType][i].id = nanoid();
          }
        }
      }
    }

    // 移除非新数据类型中的字段
    for (const key in data) {
      if (!newDataTypes.includes(key)) {
        delete data[key];
      }
    };

    return data;
  } catch (err) {
    throw err;
  }
}

// 远端导入
const importFromRemote = async (url) => {
  try {
    let config = await getConfig(url);
    config = await commonDelImportData(config);

    await initDb(config);
    await refreshEmitter(Object.keys(config));
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

// 本地导入
const importFromLocal = (file) => {
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async (resultFile) => {
    const pointsTxt = resultFile.target!.result;
    try {
      let json = JSON.parse(String(pointsTxt));
      json = await commonDelImportData(json);

      await initDb(json);
      await refreshEmitter(Object.keys(json));
      MessagePlugin.success(t('pages.setting.data.success'));
    } catch (err) {
      MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    }
  }
}

// 文件事件
const requestMethod = (file) => {
  return new Promise((resolve) => {
    // file.percent 用于控制上传进度，如果不希望显示上传进度，则不对 file.percent 设置值即可。
    // 如果代码规范不能设置 file.percent，也可以设置 files
    file.percent = 0;
    const timer = setTimeout(() => {
      // resolve 参数为关键代码
      resolve({ status: 'success', response: { url: file.name } });
      file.percent = 100;
      clearTimeout(timer);
    }, 1000);
  });
};

// 导出
const exportData = async () => {
  if (!_.includes(_.values(active.export), true)) return;

  const activeList = _.keys(_.pickBy(active.export, _.identity));
  const dbData = await exportDb(activeList);
  const str = JSON.stringify(dbData, null, 2);

  try {
    const saveDialogResult = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      defaultPath: 'config.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!saveDialogResult.canceled) {
      const { filePath } = saveDialogResult;
      const fs = remote.require('fs').promises;
      await fs.writeFile(filePath, str, 'utf-8');
      MessagePlugin.success(t('pages.setting.data.success'));
    }
  } catch (err) {
    console.error('Failed to save or open save dialog:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

//  获取 cache 大小
const getCacheSize = async () => {
  const { session } = win.webContents;
  const getSize = await session.getCacheSize() / 1024 / 1024;
  const formatToMb = getSize.toFixed(2);
  formData.size.cache = formatToMb;
};

//  获取 thumbnail 文件夹大小
const getThumbnailSize = () => {
  window.electron.ipcRenderer.removeAllListeners("tmpdir-manage-size"); // 移除之前的事件监听器
  window.electron.ipcRenderer.send('tmpdir-manage', 'size', 'thumbnail');
  window.electron.ipcRenderer.on("tmpdir-manage-size", (_, data) => {
    const getSize = data / 1024 / 1024;
    const formatToMb = getSize.toFixed(2);
    formData.size.thumbnail = formatToMb;
  });
};

// 清理缓存
const clearData = async () => {
  if (!_.some(active.clear)) return;

  try {
    const activeList = _.keys(_.pickBy(active.clear, _.identity));
    let activeToRemove = ["thumbnail"];
    const formatActive = _.difference(activeList, activeToRemove);
    await clearDb(formatActive);

    const actions: any = {
      'site': async () => {
        await setDefault('defaultSite', null);
        emitter.emit('refreshFilmConfig');
        emitter.emit('refreshSiteTable');
      },
      'iptv': async () => {
        await setDefault('defaultIptv', null);
        emitter.emit('refreshIptvConfig');
        emitter.emit('refreshIptvTable');
      },
      'channel': async () => {
        await setDefault('defaultIptv', null);
        emitter.emit('refreshIptvConfig');
      },
      'analyze': async () => {
        await setDefault('defaultAnalyze', null);
        emitter.emit('refreshAnalyzeConfig');
        emitter.emit('refreshAnalyzeTable');
      },
      'drive': async () => {
        await setDefault('defaultDrive', null);
        emitter.emit('refreshDriveConfig');
        emitter.emit('refreshDriveTable');
      },
      'history': () => {
        emitter.emit('refreshHistory');
      },
      'star': () => {
        emitter.emit('refreshBinge');
      },
      'cache': async () => {
        const { session } = win.webContents;
        await session.clearCache();
        await getCacheSize();
      },
      'thumbnail': async () => {
        await window.electron.ipcRenderer.send('tmpdir-manage', 'rmdir', 'thumbnail');
        emitter.emit('refreshIptvConfig');
      }
    };

    for (let action of activeList) {
      if (_.has(actions, action)) {
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
const saveWebdev = async () => {
  try {
    await updateSetting({ webdev: formData.webdev });
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

// 校验
const checkWebdevEvent = async () => {
  const { url, username, password } = formData.webdev.data;
  const res = await initializeWebdavClient(url, username, password);
  if (res) {
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  };
};

// 覆盖远端
const rsyncRemoteEvent = async () => {
  const { url, username, password } = formData.webdev.data;
  const res = await rsyncRemote(url, username, password);
  if (res) {
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  };
};

// 覆盖本地
const rsyncLocalEvent = async () => {
  const { url, username, password } = formData.webdev.data;
  const res = await rsyncLocal(url, username, password);
  if (res) {
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
    .separator {
      border: 1px solid var(--td-brand-color);
      height: 0.6rem;
      border-radius: var(--td-radius-default);
      display: inline-block;
    }

    .title {
      color: var(--td-brand-color);
      margin-left: 5px;
      display: inline-block;
      text-align: left;
      font-weight: 500;
    }

    .content {
      font-size: 12px;
    }

    .config {
      .input-item {
        margin-bottom: var(--td-comp-margin-s);
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
      .sync-switch-text {
        margin-right: var(--td-comp-margin-xs);
      }
    }
  }
}
</style>
