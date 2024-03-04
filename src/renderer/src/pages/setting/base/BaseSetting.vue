<template>
  <div class="setting-base-container">
    <t-form ref="form" label-width="110px" :data="formData" label-align="left">
      <t-form-item label="外观" name="theme">
        <t-radio-group v-model="formData.theme">
          <div v-for="(item, index) in MODE_OPTIONS" :key="index" class="setting-layout-drawer">
            <div>
              <t-radio-button :key="index" :value="item.type">
                <component :is="getModeIcon(item.type)" class="mode-img" />
              </t-radio-button>
              <p :style="{ textAlign: 'center', marginTop: '8px' }">{{ item.text }}</p>
            </div>
          </div>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="老板键" name="shortcutKey">
        <t-space align="center">
          <t-input
            ref="shortcutInputRef"
            v-model="formatShortcut"
            class="shortcut-content"
            :placeholder="placeholderShortcut"
            :status="statusShortcut"
            :tips="tipShortcut"
            :style="{ width: '255px' }"
            @keydown="getShortKeys"
            @focus="focusShortcut"
            @blur="blurShortcut"
          >
            <template #suffix>
              <div @click.stop="cancelShortcut">
                <close-icon />
              </div>
            </template>
          </t-input>
          <span class="title" @click="reset('shortcut')">重置</span>
        </t-space>
      </t-form-item>
      <t-form-item label="热榜" name="hotRecommend">
        <div class="hot-recommend">
          <t-radio-group v-model="formData.defaultHot">
            <t-radio value="kylive">酷云数据</t-radio>
            <t-radio value="enlightent">云合数据</t-radio>
          </t-radio-group>
        </div>
      </t-form-item>
      <t-form-item label="搜索" name="search">
        <div class="search">
          <t-space direction="vertical">
            <t-radio-group v-model="formData.defaultSearchType">
              <t-radio value="site">本站搜索</t-radio>
              <t-radio value="group">组内搜索</t-radio>
              <t-radio value="all">全站搜索</t-radio>
            </t-radio-group>
          </t-space>
        </div>
        <div class="hot-recommend"></div>
      </t-form-item>
      <t-form-item label="直播" name="iptv">
        <div class="iptv">
          <t-space direction="vertical">
            <t-space align="center">
              <t-radio v-model="formData.iptvSkipIpv6" allow-uncheck>跳过ipv6</t-radio>
              <span class="title" @click="checkIpv6">检查</span>
              <t-radio v-model="formData.iptvStatus" allow-uncheck>延迟</t-radio>
              <t-radio v-model="formData.iptvThumbnail" allow-uncheck>预览图</t-radio>
              <span class="title" @click="isVisible.iptvThumbnail=true">说明</span>
            </t-space>
            <t-space align="center">
              <t-input
                v-model="formData.defaultIptvEpg"
                label="默认节目:"
                placeholder="仅支持DIYP"
                :style="{ width: '255px' }"
              />
              <span class="title" @click="reset('epg')">重置</span>
            </t-space>
            <t-space align="center">
              <t-input
                v-model="formData.defaultIptvLogo"
                label="全局台标:"
                placeholder="源台标失效"
                :style="{ width: '255px' }"
              />
              <span class="title" @click="reset('logo')">重置</span>
            </t-space>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="播放器" name="player">
        <div class="player">
          <t-space  align="center">
            <t-select v-model="formData.broadcasterType" :options="PLAYER_OPTIONS" placeholder="请选择播放器" />
            <span class="title" @click="snifferEvent">嗅探</span>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="安全" name="security">
        <t-space>
          <span v-if="platform !== 'linux'" class="title" @click="openProxySetting">网络代理</span>
          <span class="title" @click="uaEvnet">用户代理</span>
        </t-space>

        <dialog-ua-view v-model:visible="isVisible.ua" :data="uaDialogData" @receive-dns-data="flushDialogData" />
      </t-form-item>
      <t-form-item label="权限" name="jurisdiction">
        <t-space>
          <t-radio v-if="platform !== 'linux'" v-model="formData.selfBoot" allow-uncheck @change="selefBootEvnet">
            开机自启
          </t-radio>
          <t-radio v-model="formData.hardwareAcceleration" allow-uncheck @change="hardwareAccelerationEvnet">
            硬件加速
          </t-radio>
          <t-radio v-model="formData.windowPosition.status" allow-uncheck @change="windowPositionEvnet">
            窗口位置
          </t-radio>
        </t-space>
      </t-form-item>
      <t-form-item label="其他" name="other">
        <t-space>
          <span class="title" @click="resetOriginal">恢复出厂</span>
          <span class="title" @click="dataMange">数据管理</span>
          <span class="title" @click="isVisible.update = true">检查更新</span>
          <span class="title" @click="isVisible.privacyPolicy=true">用户协议</span>
        </t-space>

        <dialog-data-view v-model:visible="isVisible.data" :webdev="webdevDialogData"/>
        <dialog-update-view v-model:visible="isVisible.update" />
        <dialog-ffmpeg-caption-view v-model:visible="isVisible.iptvThumbnail" />
        <dialog-sniffer-view v-model:visible="isVisible.sniffer" :data="snifferDialogData" @receive-sniffer-data="flushDialogData"/>
        <dialog-privacy-policy-view v-model:visible="isVisible.privacyPolicy" />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { CloseIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch, reactive } from 'vue';
import { publicIp } from 'public-ip';

import SettingAutoIcon from '@/assets/assets-setting-auto.svg';
import SettingDarkIcon from '@/assets/assets-setting-dark.svg';
import SettingLightIcon from '@/assets/assets-setting-light.svg';

import { fetchSettingList, updateSetting, clearDb } from '@/api/setting';
import { usePlayStore, useSettingStore } from '@/store';

import DialogDataView from './components/DialogData.vue';
import DialogUaView from './components/DialogUA.vue';
import DialogUpdateView from './components/DialogUpdate.vue';
import DialogFfmpegCaptionView from './components/DialogFfmpegCaption.vue';
import DialogSnifferView from './components/DialogSniffer.vue';
import DialogPrivacyPolicyView from '@/pages/PrivacyPolicy.vue';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const { platform } = window.electron.process;

const isVisible = reactive({
  data: false,
  update: false,
  dns: false,
  ua: false,
  iptvThumbnail: false,
  sniffer: false,
  privacyPolicy: false,
});

const uaDialogData = ref({ data: '', type: 'ua' });
const webdevDialogData = ref({ webdevUrl:'', webdevUsername:'' ,webdevPassword:'' });
const snifferDialogData = ref({ data: '', type:'snifferType' });

const MODE_OPTIONS = [
  { type: 'light', text: '浅色' },
  { type: 'dark', text: '深色' },
  { type: 'auto', text: '跟随系统' },
];

const PLAYER_OPTIONS = [
  { label: '西瓜播放器', value: 'xgplayer' },
  { label: '呆呆播放器', value: 'dplayer' },
  { label: 'iina(mac本地)', value: 'iina' },
  { label: 'potplayer(win本地)', value: 'potplayer' },
  { label: 'vlc(系统通用)', value: 'vlc' },
];

const shortcutInputRef = ref(null);
const placeholderShortcut = ref('点击设置快捷键');
const statusShortcut = ref('default');
const tipShortcut = ref('');

const getModeIcon = (mode) => {
  const modeIconMap = {
    light: SettingLightIcon,
    dark: SettingDarkIcon,
    auto: SettingAutoIcon,
  };
  return modeIconMap[mode];
};

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();
const theme = computed(() => {
  return storeSetting.getStateMode;
});

const formData = ref({
  version: '3.3.2',
  theme: 'auto',
  defaultHot: 'kylive',
  defaultSearchRecommend: 'site',
  defaultSearchType: 'site',
  defaultCheckModel: true,
  defaultChangeModel: false,
  defaultIptvEpg: 'http://diyp.112114.xyz/',
  defaultIptvLogo: 'https://epg.112114.eu.org/logo/',
  iptvSkipIpv6: true,
  iptvThumbnail: false,
  iptvStatus: false,
  defaultSite: null,
  defaultIptv: null,
  defaultAnalyze: null,
  analyzeFlag: [
    'youku', 'qq',
    'iqiyi', 'qiyi',
    'letv',  'sohu',
    'tudou', 'pptv',
    'mgtv'
  ],
  defaultDrive: '',
  broadcasterType: 'xgplayer',
  snifferType: 'pie',
  softSolution: false,
  skipStartEnd: false,
  agreementMask: false,
  recordShortcut: '',
  selfBoot: false,
  hardwareAcceleration: true,
  ua: '',
  communitySubscribe: '',
  webdevUrl: '',
  webdevUsername: '',
  webdevPassword: '',
  windowPosition: { status: false, position: { width: 1000, height: 640 } }
});

const filmEmitReload = useEventBus('film-reload');
const hotEmitReload = useEventBus('hot-reload');
const iptvEmitReload = useEventBus('iptv-reload');
const analyzeEmitReload = useEventBus('analyze-reload');

watch(theme, (newValue,_) => {
  formData.value.theme = newValue;
})

// 监听刷新film
watch(
  () => [
    formData.value.defaultSearchType,
    formData.value.defaultSearchRecommend,
  ],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      filmEmitReload.emit('film-reload');
    }
  },
);

// 监听刷新hot
watch(
  () => [
    formData.value.defaultHot,
  ],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      hotEmitReload.emit('hot-reload');
    }
  },
);

// 监听刷新iptv
watch(
  () => [formData.value.iptvSkipIpv6, formData.value.iptvStatus, formData.value.iptvThumbnail, formData.value.defaultIptvEpg],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      iptvEmitReload.emit('iptv-reload');
    }
  },
);

// 监听刷新analyze
watch(
  () => [formData.value.analyzeQuickSearchType],
  (_, oldValue) => {
    if (oldValue.every((item) => typeof item !== 'undefined')) {
      analyzeEmitReload.emit('analyze-reload');
    }
  },
);

watch(formData,
  (newValue, _) => {
    storeSetting.updateConfig({ mode: formData.value.theme });
    storePlayer.updateConfig({
      setting: {
        broadcasterType: formData.value.broadcasterType,
        snifferType: formData.value.snifferType,
      },
    });
    if(newValue) {
      updateSetting(newValue)
    }
  }, {
    deep: true
  }
);

onMounted(() => {
  getData();
});

const getData = async () => {
  formData.value = await fetchSettingList();
};

const openProxySetting = () => {
  window.electron.ipcRenderer.send('open-proxy-setting');
};

// 出厂恢复
const resetOriginal = () => {
  const handleClear = () => {
    window.electron.ipcRenderer.send('reset-store'); // 清除config.json
    clearDB();
    clearCache();

    confirmDia.hide();
    MessagePlugin.success('重置成功, 即将重启应用!');
    setTimeout(() => {
      window.electron.ipcRenderer.send('reboot-app');
    }, 1000);
  };

  const confirmDia = DialogPlugin({
    body: '确定恢复出厂吗？出厂后恢复初始状态。',
    header: '恢复出厂',
    width: '320px',
    confirmBtn: '确认恢复',
    placement: 'center',
    closeBtn: '',
    onConfirm: handleClear,
    onClose: () => confirmDia.hide(),
  });
};

// 清除数据库
const clearDB = () => {
  clearDb(["all"]);
};

// 清除缓存
const clearCache = async () => {
  const { session } = win.webContents;
  await session.clearCache();
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
  if (platform === 'darwin') {
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
    window.electron.ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordShortcut });
  } else {
    tipShortcut.value = '当前组合键不合规';
    statusShortcut.value = 'error';
  }
};

// 取消快捷键
const cancelShortcut = () => {
  console.log('cancelShortcut');
  formData.value.recordShortcut = '';
  window.electron.ipcRenderer.send('uninstallShortcut');
};

// 重置
const reset = (type: string) => {
  console.log(`reset:${type}`);
  if (type === 'shortcut') {
    if (platform === 'darwin') formData.value.recordShortcut = 'Shift+Command+Z';
    else formData.value.recordShortcut = 'Shift+Alt+Z';
    shortcutInputRef.value.blur();
    window.electron.ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordShortcut });
  } else if (type === 'epg') {
    formData.value.defaultIptvEpg = 'https://epg.112114.eu.org/';
  } else if (type === 'logo') {
    formData.value.defaultIptvLogo = 'https://epg.112114.eu.org/logo/';
  }
};

// 开机自启
const selefBootEvnet = () => {
  console.log('开机自启', formData.value.selfBoot);
  window.electron.ipcRenderer.send('toggle-selfBoot', formData.value.selfBoot);
};

// 硬件加速
const hardwareAccelerationEvnet = () => {
  console.log('开机自启', formData.value.hardwareAcceleration);
  window.electron.ipcRenderer.send('update-hardwareAcceleration', formData.value.hardwareAcceleration);
  MessagePlugin.success(
    formData.value.hardwareAcceleration ? '已开启硬件加速，重启应用生效' : '已关闭硬件加速，重启应用生效',
  );
};

// 退出保存主窗口大小及位置
const windowPositionEvnet = () => {
  console.log('窗口位置', formData.value.windowPosition);
  window.electron.ipcRenderer.send('update-windowPosition', formData.value.windowPosition.status);
  MessagePlugin.success(
    formData.value.windowPosition.status ? '已开启记录主窗口退出时位置' : '已关闭记录退出主窗口时位置',
  );
};

// ua：打开dialog并设置数据
const uaEvnet = () => {
  const { ua } = formData.value;
  uaDialogData.value = {
    data: ua,
    type: 'ua',
  };

  isVisible.ua = true;
};

const snifferEvent = () => {
  const { snifferType } = formData.value;
  snifferDialogData.value = {
    data: snifferType,
    type: 'snifferType',
  };

  isVisible.sniffer = true;
}

const dataMange = () => {
  const { webdevUrl, webdevUsername, webdevPassword } = formData.value;
  console.log(webdevUrl, webdevUsername, webdevPassword)
  webdevDialogData.value = {
    webdevUrl,
    webdevUsername,
    webdevPassword
  }
  isVisible.data = true
};

// 分类：刷新dialog 数据class 嗅探snifferType
const flushDialogData = (item) => {
  const { data, type } = item;
  console.log(data, type);
  formData.value[type] = data;
};

// ipv6检查
const checkIpv6 = async () => {
  try {
    const ip = await publicIp(); // Falls back to IPv4

    const ipv4Regex: RegExp = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/
    const ipv6Regex: RegExp = /(^(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$)|(^\[(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))\](?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$)/i
    
    if (ip.match(ipv4Regex)) formData.value.iptvSkipIpv6 = true;
    if (ip.match(ipv6Regex)) formData.value.iptvSkipIpv6 = false;
    MessagePlugin.success(`网络地址:${ip}`);
  } catch(err) {
    MessagePlugin.error(`网络状态检测失败:${err}`);
    console.log(err);
  };
};

// 监听设置默认源变更
const eventBus = useEventBus('base-setting-reload');
eventBus.on(() => {
  getData();
});
</script>

<style lang="less" scoped>
.setting-base-container {
  height: 100%;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-xxl);
  overflow-y: auto;
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
      max-height: 78px;
      padding: 0;
      border-radius: var(--td-radius-default);
      border: 2px solid transparent;
      > :deep(.t-radio-button__label) {
        display: inline-flex;
        position: relative;
        .mode-img,
        .layout-img {
          border-radius: 9px;
        }
      }
    }
    .t-is-checked {
      border-radius: 10px;
      border: 2px solid var(--td-brand-color);
    }
    .t-form__controls-content {
      justify-content: end;
    }
  }
}
</style>
