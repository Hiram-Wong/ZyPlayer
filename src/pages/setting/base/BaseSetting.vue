<template>
  <div class="setting-base-container">
    <t-form ref="form" label-width="110px" :data="formData">
      <t-form-item label="外观" name="theme">
        <t-radio-group v-model="formData.theme">
          <div v-for="(item, index) in MODE_OPTIONS" :key="index" class="setting-layout-drawer">
            <t-radio-button :value="item.type">
              <component :is="getModeIcon(item.type)" class="theme-item" />
            </t-radio-button>
            <p class="theme-info">
              {{ item.text }}
            </p>
          </div>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="老板键" name="shortcutKey">
        <t-space>
          <t-input
            ref="shortcutInputRef"
            v-model="formatShortcut"
            class="shortcut-content"
            :placeholder="placeholderShortcut"
            :status="statusShortcut"
            :tips="tipShortcut"
            @keydown="getShortKeys"
            @focus="focusShortcut"
            @blur="blurShortcut"
          >
            <template #suffix>
              <div @click.stop="cancelShortcut">
                <t-popup content="取消快捷键">
                  <close-icon />
                </t-popup>
              </div>
            </template>
          </t-input>

          <t-popup content="重置快捷键">
            <t-button theme="default" variant="base" class="reset-boss-key" @click="resetShortcut">
              <refresh-icon size="11px" style="margin-top: 3px" />
            </t-button>
          </t-popup>
        </t-space>
      </t-form-item>
      <t-form-item label="热榜" name="hotRecommend">
        <div class="hot-recommend">
          <t-radio-group v-model="formData.defaultHot">
            <t-radio value="site">站内推荐</t-radio>
            <t-radio value="douban">豆瓣推荐</t-radio>
          </t-radio-group>
        </div>
      </t-form-item>
      <t-form-item label="搜索" name="search">
        <div class="search">
          <t-radio-group v-model="formData.defaultSearch">
            <t-radio value="site">站内搜索</t-radio>
            <t-radio value="group">组内搜索</t-radio>
            <t-radio value="all">全站搜索</t-radio>
          </t-radio-group>
        </div>
      </t-form-item>
      <t-form-item label="站点" name="site">
        <div class="site">
          <t-space>
            <t-radio v-model="formData.defaultCheckModel" allow-uncheck>检查源变更状态</t-radio>
            <t-radio v-model="formData.defaultChangeModel" allow-uncheck>切换源设置默认</t-radio>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="过滤" name="filter">
        <div class="filter">
          <t-space>
            <span class="title" @click="classEvent('main')">主要分类</span>
            <span class="title" @click="classEvent('r18')">青少年模式</span>
          </t-space>
          <dialog-class-view
            v-model:visible="isClassDialog"
            :data="classDialogData"
            @receive-class-data="flushDialogData"
          />
        </div>
      </t-form-item>
      <t-form-item label="直播" name="iptv">
        <div class="iptv">
          <t-space>
            <t-radio v-model="formData.iptvSkipIpv6" allow-uncheck>跳过ipv6</t-radio>
            <span class="title" @click="checkIpv6">检查</span>
            <t-radio v-model="formData.iptvStatus" allow-uncheck>检测可用性</t-radio>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="节目单" name="epg">
        <div class="epg">
          <t-input
            v-model="formData.defaultIptvEpg"
            label="默认EPG:"
            placeholder="仅支持DIYP"
            :style="{ width: '300px' }"
          />
        </div>
      </t-form-item>
      <t-form-item v-if="formData.analyzeSupport" label="解析" name="analyse">
        <div class="analyse">
          <t-radio-group v-model="formData.analyzeQuickSearchType">
            <t-radio value="search">快捷搜索</t-radio>
            <t-radio value="platform">支持平台</t-radio>
            <t-radio value="all">小孩子才做选择</t-radio>
          </t-radio-group>
        </div>
      </t-form-item>
      <t-form-item label="保险箱密码" name="analyse">
        <div class="analyse">
          <t-input v-model="formData.vaultPasswd" placeholder="请输入保险箱密码" :style="{ width: '300px' }" />
        </div>
      </t-form-item>
      <t-form-item label="播放器" name="player">
        <div class="player">
          <t-space direction="vertical" style="width: 280px">
            <t-space>
              <t-radio v-model="formData.softSolution" allow-uncheck>软解</t-radio>
              <t-radio v-model="formData.skipStartEnd" allow-uncheck>跳过片头片尾</t-radio>
            </t-space>
            <div v-if="formData.skipStartEnd" class="">
              <div class="skip">
                <span>开始 [记忆播放]</span>
                <t-slider v-model="formData.skipTimeInStart" :show-tooltip="true" :marks="MASKS" :max="180" />
              </div>
              <br />
              <div class="skip">
                <span>结尾 [自动播放下一集]</span>
                <t-slider v-model="formData.skipTimeInEnd" :show-tooltip="true" :marks="MASKS" :max="180" />
              </div>
            </div>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="安全" name="security">
        <t-space>
          <span v-if="platform !== 'linux'" class="title" @click="openProxySetting">网络代理</span>
          <span class="title" @click="dnsEvnet">安全DNS</span>
          <span class="title" @click="uaEvnet">用户代理</span>
        </t-space>

        <dialog-dns-view v-model:visible="isDnsDialog" :data="dnsDialogData" @receive-dns-data="flushDialogData" />
        <dialog-ua-view v-model:visible="isUaDialog" :data="uaDialogData" @receive-dns-data="flushDialogData" />
      </t-form-item>
      <t-form-item label="权限" name="data">
        <t-space>
          <t-radio v-if="platform !== 'linux'" v-model="formData.selfBoot" allow-uncheck @change="selefBootEvnet">
            开机自启
          </t-radio>
          <t-radio v-model="formData.hardwareAcceleration" allow-uncheck @change="hardwareAccelerationEvnet">
            硬件加速
          </t-radio>
        </t-space>
      </t-form-item>
      <t-form-item label="其他" name="data">
        <t-space>
          <span class="title" @click="resetEvent">恢复出厂</span>
          <span class="title" @click="resetCache">清理缓存</span>
          <span class="title" @click="easyConfig">一键配置</span>
          <span class="title" @click="checkUpdate">检查更新</span>
        </t-space>

        <dialog-easy-config-view v-model:visible="isEasyConfigDialog" />
        <dialog-update-view v-model:visible="isUpdateDialog" />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="jsx">
import { useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import { CloseIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';

import SettingAutoIcon from '@/assets/assets-setting-auto.svg';
import SettingDarkIcon from '@/assets/assets-setting-dark.svg';
import SettingLightIcon from '@/assets/assets-setting-light.svg';
import { setting } from '@/lib/dexie';
import db from '@/lib/dexie/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore, useSettingStore } from '@/store';

import DialogClassView from './components/DialogClass.vue';
import DialogDnsView from './components/DialogDns.vue';
import DialogEasyConfigView from './components/DialogEasyConfig.vue';
import DialogUaView from './components/DialogUA.vue';
import DialogUpdateView from './components/DialogUpdate.vue';

const ipcRenderer = useIpcRenderer();

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const { platform } = process;

const isClassDialog = ref(false);
const classDialogData = ref({ data: [], type: 'rootClassFilter' });
const isEasyConfigDialog = ref(false);
const isUpdateDialog = ref(false);
const isDnsDialog = ref(false);
const dnsDialogData = ref({ data: '', type: 'dns' });
const isUaDialog = ref(false);
const uaDialogData = ref({ data: '', type: 'dns' });

const MODE_OPTIONS = [
  { type: 'light', text: '浅色' },
  { type: 'dark', text: '深色' },
  { type: 'auto', text: '跟随系统' },
];

const MASKS = {
  0: '0s',
  30: '30s',
  60: '60s',
  90: '90s',
  120: '120s',
  150: '150s',
  180: '180s',
};

const shortcutInputRef = ref(null);
const placeholderShortcut = ref('点击设置快捷键');
const statusShortcut = ref('default');
const tipShortcut = ref('');

const getModeIcon = (mode) => {
  if (mode === 'light') {
    return SettingLightIcon;
  }
  if (mode === 'dark') {
    return SettingDarkIcon;
  }
  return SettingAutoIcon;
};

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const formData = ref({
  theme: storeSetting.getStateMode,
});

const filmEmitReload = useEventBus('film-reload');
const iptvEmitReload = useEventBus('iptv-reload');
const analyzeEmitReload = useEventBus('analyze-reload');

// 监听刷新film
watch(
  () => [
    formData.value.defaultHot,
    formData.value.defaultSearch,
    formData.value.defaultChangeModel,
    formData.value.defaultCheckModel,
  ],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      filmEmitReload.emit('film-reload');
    }
  },
);

// 监听刷新iptv
watch(
  () => [formData.value.iptvSkipIpv6, formData.value.iptvStatus, formData.value.defaultIptvEpg],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      iptvEmitReload.emit('iptv-reload');
    }
  },
);

// 监听刷新iptv
watch(
  () => [formData.value.analyzeQuickSearchType],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      analyzeEmitReload.emit('analyze-reload');
    }
  },
);

watchEffect(() => {
  const res = JSON.parse(JSON.stringify(formData.value));

  if (res) {
    setting.update(res);

    storeSetting.updateConfig({ mode: formData.value.theme });
    storePlayer.updateConfig({
      setting: {
        softSolution: formData.value.softSolution,
        skipStartEnd: formData.value.skipStartEnd,
        skipTimeInStart: formData.value.skipTimeInStart,
        skipTimeInEnd: formData.value.skipTimeInEnd,
      },
    });
  }
});

onMounted(() => {
  getSetting();
});

const getSetting = async () => {
  await setting.find().then((res) => {
    formData.value = res;
  });
};

const openProxySetting = () => {
  ipcRenderer.send('open-proxy-setting');
};

// 出厂恢复
const resetEvent = () => {
  ipcRenderer.send('reset-store'); // 清除config.json
  clearDB();
  clearCache();

  MessagePlugin.success('重置成功, 即将重启应用!');
  setTimeout(() => {
    ipcRenderer.send('reboot-app');
  }, 1000);
};

// 清理缓存
const resetCache = async () => {
  const size = await clearCache();
  MessagePlugin.success(`清除缓存成功, 共清理 ${size} MB`);
};

// 清除数据库
const clearDB = () => {
  db.delete();
};

// 清除缓存
const clearCache = async () => {
  const ses = win.webContents.session;
  const size = ((await ses.getCacheSize()) / 1024 / 1024).toFixed(2);
  await ses.clearCache();
  return size;
};

// 组合键格式化
const formatShortcut = computed(() => {
  const val = formData.value.recordShortcut;
  if (!val) return '';
  let shortcut;
  shortcut = val
    .replaceAll('+', ' + ')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace('Right', '→')
    .replace('Left', '←')
    .replace('Space', '空格');
  if (process.platform === 'darwin') {
    shortcut = val
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Meta', '⌘')
      .replace('Alt', '⌥')
      .replace('Control', '⌃')
      .replace('Shift', '⇧');
  }
  shortcut.replace('CommandOrControl', 'Ctrl');
  return shortcut;
});

// 设置组合键更换焦点placeholder
const focusShortcut = () => {
  // 复制快捷键
  formData.value.recordedSourceShortcut = formData.value.recordShortcut;
  formData.value.recordShortcut = '';
  placeholderShortcut.value = '请按下快捷键组合';
};

// 设置组合键更换失去焦点placeholder
const blurShortcut = () => {
  // 还原快捷键
  if (formData.value.recordedSourceShortcut && !formData.value.recordShortcut)
    formData.value.recordShortcut = formData.value.recordedSourceShortcut;
  placeholderShortcut.value = '设置快捷键';
};

// 获取组合按键
const getShortKeys = (_, event) => {
  const { e } = event;

  e.preventDefault();
  const str = formData.value.recordShortcut;
  // 已存储按键则跳过
  if (str.includes(e.key)) return;

  // 获取有没有按下特殊按键【'Control', 'Alt', 'Shift', 'Meta'】
  const auxiliaryKey = [
    e.ctrlKey ? 'Ctrl' : '',
    e.altKey ? 'Alt' : '',
    e.shiftKey ? 'Shift' : '',
    e.metaKey ? 'Meta' : '',
  ].filter((t) => t);

  // 获取普通字符【'0-9'，'a-Z'，'f1-f12'，'符号'】
  let publicKey = '';
  if (e.keyCode >= 65 && e.keyCode <= 90) {
    // A-Z
    publicKey = e.code.replace('Key', '');
  } else if (e.keyCode >= 48 && e.keyCode <= 57) {
    // 0-9
    publicKey = e.code.replace('Digit', '');
  } else if (e.keyCode >= 112 && e.keyCode <= 123) {
    // F1-F12
    publicKey = e.code;
  } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    // Arrows
    publicKey = e.code.replace('Arrow', '');
  } else if (['=', '-', '~', '[', ']', ';', "'", ',', '.', '/'].includes(e.key)) {
    publicKey = e.key;
  }

  if (auxiliaryKey.length) {
    formData.value.recordShortcut = `${auxiliaryKey.join('+')}+${publicKey}`;
  } else {
    formData.value.recordShortcut = str.substring(0, str.lastIndexOf('+') + 1) + publicKey;
  }
  isLegalShortcut(formData.value.recordShortcut);
};

// 判断快捷键是否合法
const isLegalShortcut = (item) => {
  const specialKeys = ['Crl', 'Alt', 'Shift', 'Meta'];
  const pubilcKeys = [
    '=',
    '-',
    '~',
    '[',
    ']',
    ';',
    "'",
    ',',
    '.',
    '/',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'Right',
    'Left',
    'Up',
    'Down',
  ];
  let isPubilcKeys = false;
  let isSpecialKeys = false;

  const keys = _.split(item, '+');

  _.forIn(keys, (e) => {
    if (_.includes(specialKeys, e)) isSpecialKeys = true;
    if (_.includes(pubilcKeys, e)) isPubilcKeys = true;
  });
  if (isPubilcKeys && isSpecialKeys) {
    statusShortcut.value = 'default';
    tipShortcut.value = '';
    console.log(formData.value.recordShortcut);
    shortcutInputRef.value.blur();
    ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordShortcut });
  } else {
    tipShortcut.value = '当前组合键不合规';
    statusShortcut.value = 'error';
  }
};

// 取消快捷键
const cancelShortcut = () => {
  console.log('cancelShortcut');
  formData.value.recordShortcut = '';
  ipcRenderer.send('uninstallShortcut');
};

// 重置快捷键
const resetShortcut = () => {
  console.log('resetShortcut');
  formData.value.recordShortcut = 'Shift+Command+Z';
  shortcutInputRef.value.blur();
  ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordShortcut });
};

// 开机自启
const selefBootEvnet = () => {
  console.log('开机自启', formData.value.selfBoot);
  ipcRenderer.send('toggle-selfBoot', formData.value.selfBoot);
};

// 硬件加速
const hardwareAccelerationEvnet = () => {
  console.log('开机自启', formData.value.hardwareAcceleration);
  ipcRenderer.send('update-hardwareAcceleration', formData.value.hardwareAcceleration);
  MessagePlugin.success(
    formData.value.hardwareAcceleration ? '已开启硬件加速，重启应用生效' : '已关闭硬件加速，重启应用生效',
  );
};

// 更新
const checkUpdate = () => {
  isUpdateDialog.value = true;
};

// 一键配置
const easyConfig = async () => {
  console.log('easyConfig');
  isEasyConfigDialog.value = true;
};

// 分类：打开dialog并设置数据
const classEvent = (item) => {
  switch (item) {
    case 'r18':
      classDialogData.value = {
        data: [...formData.value.r18ClassFilter],
        type: 'r18ClassFilter',
      };
      break;
    default:
      classDialogData.value = {
        data: [...formData.value.rootClassFilter],
        type: 'rootClassFilter',
      };
      break;
  }
  isClassDialog.value = true;
};

// dns：打开dialog并设置数据
const dnsEvnet = () => {
  const { dns } = formData.value;
  dnsDialogData.value = {
    data: dns,
    type: 'dns',
  };

  isDnsDialog.value = true;
};

// ua：打开dialog并设置数据
const uaEvnet = () => {
  const { ua } = formData.value;
  uaDialogData.value = {
    data: ua,
    type: 'ua',
  };

  isUaDialog.value = true;
};

// 分类：刷新dialog数据class
const flushDialogData = (item) => {
  const { data, type } = item;
  console.log(data, type);
  formData.value[type] = data;
};

// ipv6检查
const checkIpv6 = async () => {
  await zy
    .checkSupportIpv6()
    .then((res) => {
      formData.value.iptvSkipIpv6 = !res;
    })
    .catch((err) => {
      formData.value.iptvSkipIpv6 = true;
      console.log(err);
    });
};

// 监听设置默认源变更
const eventBus = useEventBus('base-setting-reload');
eventBus.on(async () => {
  getSetting();
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.setting-base-container {
  :deep(.t-radio-group.t-size-m .t-radio-button) {
    height: auto;
  }
  :deep(.t-form__label) {
    label {
      font-weight: 500;
    }
  }

  .title {
    color: var(--td-brand-color);
    cursor: pointer;
    font-weight: 500;
  }
  .setting-layout-drawer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 35px;
    box-sizing: content-box;
    .t-radio-button {
      display: inline-flex;
      border: 2px solid transparent;
      padding: 0;
      > :deep(.t-radio-button__label) {
        display: inline-flex;
        height: 44px !important;
      }
      .theme-item {
        width: 68px;
        height: 44px;
        border-radius: 5px;
        :deep(.appearance) {
          width: 68px;
          height: 44px;
        }
      }
    }
    .t-is-checked {
      border-radius: 7px;
      border: 2px solid var(--td-brand-color);
    }
    .theme-info {
      text-align: center;
      margin-top: 3px;
      font-size: 13px;
      font-weight: 400;
    }
  }
  .reset-boss-key {
    background-color: var(--td-bg-input);
    border: transparent;
  }
}
</style>
