<template>
  <t-dialog v-model:visible="formVisible" header="数据" placement="center" :footer="false" >
    <template #body>
      <div class="data-dialog-container dialog-container-padding">
        <div class="data-item">
          <span class="separator"></span>
          <p class="title">配置文件</p>
          <p class="content">数据保存在数据库中, 为方便迁移可导出为json文件, 导入将覆盖原数据</p>
          <div class="config"> 
            <t-collapse expand-mutex>
              <t-collapse-panel value="easyConfig" header="一键配置">
                <t-radio-group v-model="formData.easyConfig.type">
                  <t-radio :value="0">此软件</t-radio>
                  <t-radio :value="1">drpy</t-radio>
                  <t-radio :value="2">tvbox</t-radio>
                  <t-radio :value="3">hipy</t-radio>
                </t-radio-group>
                <p v-if="formData.easyConfig.type === 0" class="tip">请严格遵守本软件接口格式</p>
                <p v-else-if="formData.easyConfig.type === 1" class="tip">目前仅支持sites中type:1的数据,请将js模式设置为0</p>
                <p v-else-if="formData.easyConfig.type === 2" class="tip">目前仅支持sites中type:0或1且的cms类型的数据</p>
                <t-input label="地址：" v-model="formData.easyConfig.url" class="input-item"></t-input>
                <t-popconfirm content="原有数据将清除，确认配置吗" placement="bottom" @confirm="easyConfig">
                  <t-button size="small" block ghost>配置</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="remoteImport" header="配置导入">
                <t-radio-group v-model="formData.importData.type">
                  <t-radio value="remote">远端导入</t-radio>
                  <t-radio value="local">本地导入</t-radio>
                </t-radio-group>
                <p class="content">由于兼容问题, 旧数据导入将丢弃历史和收藏数据</p>
                <div v-if="formData.importData.type === 'remote'">
                  <t-input label="地址：" v-model="formData.importData.remoteImpoUrl" class="input-item"></t-input>
                </div>
                <div v-else>
                  <t-upload 
                    v-model="formData.importData.localImpoFile"
                    class="input-item"
                    theme="file"
                    :max="1"
                    accept="application/json"
                    :draggable="true"
                    :request-method="requestMethod"
                  />
                </div>
                <t-popconfirm content="原有数据将清除，确认导入吗" placement="bottom" @confirm="importData">
                  <t-button size="small" block ghost>导入</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="exportData" header="配置导出">
                <t-radio v-model="active.export.site" allow-uncheck class="radio-item">影视源</t-radio>
                <t-radio v-model="active.export.iptv" allow-uncheck class="radio-item">电视源</t-radio>
                <t-radio v-model="active.export.channel" allow-uncheck class="radio-item">电视频道</t-radio>
                <t-radio v-model="active.export.analyze" allow-uncheck class="radio-item">解析源</t-radio>
                <t-radio v-model="active.export.drive" allow-uncheck class="radio-item">网盘源</t-radio>
                <t-radio v-model="active.export.history" allow-uncheck class="radio-item">历史</t-radio>
                <t-radio v-model="active.export.star" allow-uncheck class="radio-item">收藏</t-radio>
                <t-radio v-model="active.export.setting" allow-uncheck class="radio-item">基础配置</t-radio>
                <t-button size="small" block ghost @click="exportData">导出</t-button>
              </t-collapse-panel>
              <t-collapse-panel value="clearData" header="清理数据">
                <t-radio v-model="active.clear.site" allow-uncheck class="radio-item">影视源</t-radio>
                <t-radio v-model="active.clear.iptv" allow-uncheck class="radio-item">电视源</t-radio>
                <t-radio v-model="active.clear.channel" allow-uncheck class="radio-item">电视频道</t-radio>
                <t-radio v-model="active.clear.analyze" allow-uncheck class="radio-item">解析源</t-radio>
                <t-radio v-model="active.clear.drive" allow-uncheck class="radio-item">网盘源</t-radio>
                <t-radio v-model="active.clear.history" allow-uncheck class="radio-item">历史</t-radio>
                <t-radio v-model="active.clear.star" allow-uncheck class="radio-item">收藏</t-radio>
                <t-radio v-model="active.clear.thumbnail" allow-uncheck class="radio-item">缩略图
                  <span class="title">「{{ formData.size.thumbnail }}MB」</span>
                </t-radio>
                <t-radio v-model="active.clear.cache" allow-uncheck class="radio-item">缓存
                  <span class="title">「{{ formData.size.cache }}MB」</span>
                </t-radio>
                <t-button size="small" block ghost @click="clearData">清理</t-button>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item"></div>
          </div>
        </div>
        <div class="data-item">
          <span class="separator"></span>
          <p class="title">同步盘</p>
          <p class="content">1. 因不收集用户的数据, 可以选择同步盘作为配置文件保存服务</p>
          <p class="content">2. 内置webdav作为同步盘服务, 推荐坚果云</p>
          <div class="config"> 
            <t-collapse>
              <t-collapse-panel value="0" header="配置同步盘参数">
                <template #headerRightContent>
                  <t-space size="small">  
                    <t-button size="small" @click.stop="saveWebdev">保存</t-button>
                    <t-button theme="default" size="small" @click.stop="checkWebdev">校验</t-button>
                  </t-space>
                </template>
                <t-input label="云地址：" v-model="formData.url" class="input-item"></t-input>
                <t-input label="用户名：" v-model="formData.username" class="input-item"></t-input>
                <t-input label="授权码：" v-model="formData.password" type="password" class="input-item"></t-input>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item">
              <t-popconfirm content="云端数据将被覆盖,确认操作吗" placement="bottom"  @confirm="rsyncRemote">
                <t-button theme="default" class="btn-2">同步数据到帐号</t-button>
              </t-popconfirm>
              <t-popconfirm content="本地数据将被清除,确认操作吗" placement="bottom"  @confirm="rsyncLocal">
                <t-button theme="default" class="btn-2">云数据覆盖本地</t-button>
              </t-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import Base64 from 'crypto-js/enc-base64';
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import getUuid from 'uuid-by-string';
import { ref, watch, reactive } from 'vue';
import { createClient } from "webdav";

import { updateSetting, clearDb, exportDb, setDefault, initDb } from '@/api/setting';
import { getConfig } from '@/utils/tool';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const filmEmitReload = useEventBus('film-reload');
const iptvEmitReload = useEventBus('iptv-reload');
const analyzeEmitReload = useEventBus('analyze-reload');
const historyEmitReload = useEventBus('history-reload');
const bingeEmitReload = useEventBus('binge-reload');
const driveEmitReload = useEventBus('drive-reload');

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
  url: '',
  username: '',
  password: '',
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

const clientWebdev = ref(null);

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
    formData.url = val.webdevUrl;
    formData.username = val.webdevUsername;
    formData.password = val.webdevPassword;
  }
)

// 一键配置
const easyConfig = async() => {
  const { url, type } = formData.easyConfig;
  if (!url) {
    MessagePlugin.warning('请输入一键配置地址');
    return;
  };

  let config = await getConfig(url);
  if (!_.isPlainObject(config)) return;

  let data = {};

  const formatType = (selectType, soureceType) => {
    // 0cms[xml] 1cms[json] 2drpy[js0] 6hipy[t4] 3app[v3] 4app[v3]

    if (selectType === 1) return 2; // drpy
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
          .filter((item) => [0, 1, 4].includes(item.type) || (item.type === 3 && item.api.endsWith('.js') && item.ext.endsWith('.js'))) // 先过滤掉不需要的数据
          .map((item) => ({
            id: getUuid(item.name, 5),
            name: item.name,
            type: formatType(type, item.type),
            api: item.api,
            group: formatGroup(type),
            search: _.has(item, "searchable") ? item.searchable : 0,
            categories: _.has(item, "categories") ? (_.isArray(item.categories) ? _.join(item.categories, ',') : item.categories) : null, // 转字符串
            ext: _.has(item, "ext") ? item.ext : '',
            isActive: true,
            status: true,
          }));
      };
      if (_.has(config, 'lives')) {
        const redirectChannels = _.find(config.lives, { group: 'redirect' }).channels;
        const iptv = redirectChannels.map(channel => {
          const urlBase64 = channel.urls[0].split('&ext=')[1];
          let url = urlBase64;

          // 使用正则表达式判断字符串是否为 Base64 编码
          const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(urlBase64);

          if (isBase64) {
            // 如果具有 Base64 编码的特征，则解码
            url = Base64.parse(urlBase64);
          }

          return {
            id: getUuid(channel.name, 5),
            name: channel.name,
            type: 'remote',
            isActive: true,
            url: url
          };
        });
        data['tbl_iptv'] = iptv;
      };
      if (_.has(config, 'parses')) {
        const analyze = _.filter(config.parses, item => _.startsWith(item.url, 'http'))
          .map(item => ({
            id: getUuid(item.name, 5),
            name: item.name,
            url: item.url,
            isActive: true,
          }));
        data['tbl_analyze'] = analyze;
      };
      if (_.has(config, 'drives')) {
        const drives = _.filter(config.drives, item => item.type === 'alist' || !item.type)
          .map(item => ({
            id: getUuid(item.name, 5),
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
    MessagePlugin.info(`一键配置成功`);
  } catch (err) {
    MessagePlugin.error(`一键配置失败：${err}`);
    console.log(err);
  }
};

// 配置导入
const importData = async() => {
  const { type, remoteImpoUrl, localImpoFile } = formData.importData;

  if ((type === 'remote' && !remoteImpoUrl)  || (type === 'local') && (localImpoFile.length === 0)) {
    MessagePlugin.warning('请选择或者填写数据');
    return;
  };

  if (type === 'remote') {
    await importFromRemote(remoteImpoUrl);
  } else {
    await importFromLocal(localImpoFile[0].raw);
  };
};

// 公共导入方法
const commonDelImportData = (data) => {
  try {
    // 先处理就数据
    ['sites', 'iptv', 'analyze', 'drive', 'setting', 'channel'].forEach(key => {
      if (_.has(data, key)) {
        if (key === 'setting') {
          data["tbl_setting"] = data['setting'][0] ? Object.entries(data['setting'][0]).map(([key, value]) => ({ key, value })) : [];
          const positionIndex = _.findIndex(data["tbl_setting"], {key: 'windowPosition'});
          const versionIndex = _.findIndex(data["tbl_setting"], {key: 'version'});
          if (positionIndex > -1) {
            data["tbl_setting"][positionIndex] = {
              key: 'windowPosition',
              value: {
                status: false,
                position: {
                  width: 1000,
                  height: 640,
                }
              }
            }
          } else {
            data["tbl_setting"].push({
              key: 'windowPosition',
              value: {
                status: false,
                position: {
                  width: 1000,
                  height: 640,
                }
              }
            })
          }
          if (versionIndex > -1) {
            data["tbl_setting"][versionIndex] = {
              key: 'version',
              value: process.env.npm_package_version
            }
          } else {
            data["tbl_setting"].push({
              key: 'version',
              value: process.env.npm_package_version
            })
          }
        } else {
          const tblKey = key === 'sites' ? 'site' : key;
          data[`tbl_${tblKey}`] = data[key].data || data[key];
        }
      }
    });

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
            data[dataType][i].id = getUuid(`${dataItem.name}`, 5); // getuuid必须是字符串
          }
        }
      }
    }

    // 移除非新数据类型中的字段
    for (const key in data) {
      if (!newDataTypes.includes(key)) {
        delete data[key];
      }
    }

    console.log(data)
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
    MessagePlugin.info(`导入成功`);
  } catch (error) {
    MessagePlugin.error(`导入失败：${error}`);
  }
};

// 本地导入
const importFromLocal = (file) => {
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async(resultFile) => {
    const pointsTxt = resultFile.target.result;
    try {
      let json = JSON.parse(String(pointsTxt));
      json = await commonDelImportData(json);

      await initDb(json);
      MessagePlugin.info(`导入成功`);
    } catch (err) {
      MessagePlugin.error(`导入失败：${err}`);
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
const exportData = async() => {
  if (!_.includes(_.values(active.export), true)) {
    MessagePlugin.warning('请选择需要类型');
    return;
  };
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
      console.log('File saved successfully');
      MessagePlugin.success('File saved successfully');
    }
  } catch (err) {
    console.error('Failed to save or open save dialog:', err);
    MessagePlugin.error(`操作失败: ${err}`);
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
const clearData = async() => {
  if (!_.some(active.clear)) {
    MessagePlugin.warning('请选择需要类型');
    return;
  };
  
  try {
    const activeList = _.keys(_.pickBy(active.clear, _.identity));
    let activeToRemove = ["thumbnail"];
    const formatActive = _.difference(activeList, activeToRemove);
    await clearDb(formatActive);

    const actions = {
      'site': async () => {
        await setDefault('defaultSite', null);
        filmEmitReload.emit('film-reload');
      },
      'iptv': async () => {
        await setDefault('defaultIptv', null);
        iptvEmitReload.emit('iptv-reload');
      },
      'channel': async () => {
        await setDefault('defaultIptv', null);
        iptvEmitReload.emit('iptv-reload');
      },
      'analyze': async () => {
        await setDefault('defaultAnalyze', null);
        analyzeEmitReload.emit('analyze-reload');
      },
      'drive': async () => {
        await setDefault('defaultDrive', null);
        driveEmitReload.emit('drive-reload');
      },
      'history': () => {
        historyEmitReload.emit('history-reload');
      },
      'star': () => {
        bingeEmitReload.emit('binge-reload');
      },
      'cache': async () => {
        const { session } = win.webContents;
        await session.clearCache();
        await getCacheSize();
      },
      'thumbnail': async () => {
        await window.electron.ipcRenderer.send('tmpdir-manage', 'rmdir', 'thumbnail');
        iptvEmitReload.emit('iptv-reload');
      }
    };

    for (let action of activeList) {
      if (_.has(actions, action)) {
        await actions[action]();
      }
    }

    MessagePlugin.success('清理成功');
  } catch (err) {
    console.log('data clear fail', err);
    MessagePlugin.error(`操作失败: ${err}`);
  }
}

// 初始化
const initWebdav = async() => {
  if (!formData.url && !formData.username && !formData.password) {
    MessagePlugin.warning('请补全同步盘配置信息');
    return;
  };
  clientWebdev.value = await createClient(
    formData.url,
    {
      username: formData.username,
      password: formData.password
    }
  );
  if (await clientWebdev.value.exists("/zyplayer") === false) {
    await clientWebdev.value.createDirectory("/zyplayer");
  };
};

// 保存
const saveWebdev = async() => {
  try {
    await updateSetting({
      webdevUrl: formData.url,
      webdevUsername: formData.username,
      webdevPassword: formData.password,
    })
    MessagePlugin.success('保存成功');
  } catch (err) {
    MessagePlugin.error(`保存失败:${err}`)
  };
};

// 校验
const checkWebdev = async() => {
  try {
    if (!clientWebdev.value) await initWebdav();
    if (!formData.url && !formData.username && !formData.password) return;
    await clientWebdev.value.getDirectoryContents("/");
    MessagePlugin.success('连接成功');
  } catch (err) {
    MessagePlugin.error(`连接失败:${err}`)
  };
}

// 覆盖远端
const rsyncRemote = async() => {
  try {
    if (!clientWebdev.value) await initWebdav();
    if (!formData.url && !formData.username && !formData.password) return;
    const str = await exportDb(["all"]);
    const formatToJson = JSON.stringify(str);
    await clientWebdev.value.putFileContents("/zyplayer/config.json", formatToJson, { overwrite: false });
    MessagePlugin.success('传输成功');
  } catch (err) {
    MessagePlugin.error(`传输失败:${err}`);
    console.error(err);
  };
}

// 覆盖本地
const rsyncLocal = async() => {
  try {
    if (!clientWebdev.value) await initWebdav();
    if (!formData.url && !formData.username && !formData.password) return;
    const str: string = await clientWebdev.value.getFileContents("/zyplayer/config.json", { format: "text" });
    const formatToJson = JSON.parse(str);
    await initDb(formatToJson);
    MessagePlugin.success('获取云端文件成功');
  } catch (err) {
    MessagePlugin.error(`获取文件失败:${err}`);
    console.error(err);
  };
}

</script>
<style lang="less" scoped>
.data-dialog-container {
  max-height: 430px;
  .data-item {
    .separator {
      border: 0.1rem solid var(--td-brand-color);
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
      :deep(.t-collapse-panel__content) {
        padding: var(--td-pop-padding-m);
      }
      :deep(.t-form__controls-content .t-input) {
        background: aquamarine !important;
      }
      .input-item,
      :deep(.t-upload__dragger) {
        width: 100%;
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
  }
}
</style>
