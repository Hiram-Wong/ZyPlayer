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
        <t-space direction="vertical">
          <div class="shortcut-container">
            <t-input-adornment>
              <t-input
                ref="shortcutInputRef"
                v-model="formData.recordedShortcut"
                :format="formatShortcut"
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
              <template #append>
                <div
                  style="width: 24px; height: 100%; display: flex; align-items: center; justify-content: center"
                  @click.stop="resetShortcut"
                >
                  <t-popup content="重置快捷键">
                    <refresh-icon size="11px" style="margin-top: 3px" />
                  </t-popup>
                </div>
              </template>
            </t-input-adornment>
          </div>
        </t-space>
      </t-form-item>
      <t-form-item label="站点" name="site">
        <div class="site">
          <t-space direction="vertical">
            <div class="hot-recommend site-item">
              <t-radio-group v-model="formData.defaultHot">
                <t-radio value="site">站内推荐</t-radio>
                <t-radio value="douban">豆瓣推荐</t-radio>
              </t-radio-group>
            </div>
            <div class="hot-recommend site-item">
              <t-radio-group v-model="formData.defaultSearch">
                <t-radio value="site">站内搜索</t-radio>
                <t-radio value="group">组内搜索</t-radio>
                <t-radio value="all">全站搜索</t-radio>
              </t-radio-group>
            </div>
            <div class="check-status site-item">
              <t-space>
                <t-switch v-model="formData.defaultCheckModel">
                  <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                </t-switch>
                <span>检查源变更状态</span>
                <t-switch v-model="formData.defaultChangeModel">
                  <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                </t-switch>
                <span>切换源设置默认</span>
              </t-space>
            </div>
            <div class="filter site-item">
              <t-space direction="vertical">
                <div class="filter-item">
                  <t-space direction="vertical">
                    <t-space>
                      <t-switch v-model="formData.filterKeywordsDialogVisible">
                        <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                      </t-switch>
                      <span>主要分类</span>
                    </t-space>
                    <t-textarea
                      v-if="formData.filterKeywordsDialogVisible"
                      v-model="rootClassFilter"
                      class="textarea"
                      placeholder="请输入过滤关键词,逗号分隔"
                      autofocus
                    />
                  </t-space>
                </div>
                <div class="filter-item">
                  <t-space direction="vertical">
                    <t-space>
                      <t-switch v-model="formData.excludeR18Films">
                        <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                      </t-switch>
                      <span>青少年模式</span>
                    </t-space>
                    <t-textarea
                      v-if="formData.excludeR18Films"
                      v-model="r18ClassFilter"
                      class="textarea"
                      placeholder="请输入过滤关键词,逗号分隔"
                      autofocus
                    />
                  </t-space>
                </div>
              </t-space>
            </div>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="直播" name="iptv">
        <div class="iptv">
          <t-space direction="vertical">
            <t-space>
              <t-switch v-model="formData.iptvSkipIpv6">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>跳过ipv6</span>
              <t-switch v-model="formData.iptvStatus">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>检测可用性</span>
              <!-- <t-switch v-model="formData.iptvThumbnail" >
              <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
            </t-switch>
            <span>缩略图</span> -->
            </t-space>
            <t-input
              v-model="formData.defaultIptvEpg"
              label="默认EPG："
              placeholder="仅支持DIYP"
              :style="{ width: '300px' }"
            />
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="播放器" name="player">
        <div class="player">
          <t-space direction="vertical">
            <t-space>
              <t-switch v-model="formData.pauseWhenMinimize">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>最小化暂停播放</span>
              <t-switch v-model="formData.softSolution">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>软解</span>
              <t-switch v-model="formData.skipStartEnd">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>跳过开头</span>
            </t-space>
            <div v-if="formData.skipStartEnd" class="">
              <div class="skip">
                <span>开始</span>
                <t-slider v-model="formData.skipTimeInStart" :show-tooltip="true" :marks="MASKS" :max="180" />
              </div>
              <br />
              <!-- <div class="skip">
                <span>结尾</span>
                <t-slider v-model="formData.skipTimeInEnd" :show-tooltip="true" :marks="MASKS" :max="180" />
              </div> -->
            </div>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="代理" name="proxy">
        <t-space direction="vertical">
          <div class="proxy-switch">
            <t-select v-if="formData.proxy?.type" v-model="formData.proxy.type" :style="{ width: '300px' }">
              <t-option value="disable" label="无代理" />
              <t-option value="system" label="使用系统代理" />
              <t-option value="manual" label="指定代理服务器" />
            </t-select>
          </div>

          <div v-if="formData.proxy?.type == 'manual'" class="proxy-item">
            <t-space direction="vertical">
              <t-select v-model="formData.proxy.scheme" :style="{ width: '300px' }" placeholder="请选择代理协议">
                <t-option value="http" label="http">http</t-option>
                <t-option value="socks5" label="socks5">socks5</t-option>
              </t-select>
              <t-input-group separate>
                <t-input v-model="formData.proxy.url" :style="{ width: '200px' }" placeholder="ip" />
                <span :style="{ lineHeight: '32px' }">&nbsp;:&nbsp;</span>
                <t-input v-model="formData.proxy.port" :style="{ width: '88px' }" placeholder="端口" />
              </t-input-group>
            </t-space>
          </div>
        </t-space>
      </t-form-item>
      <t-form-item label="其他" name="data">
        <t-space>
          <t-button theme="default" variant="base" @click="resetEvent">重置应用</t-button>
          <!-- <t-button theme="default" variant="base" @click="checkUpdate">检查更新</t-button>
          <t-button theme="default" variant="base" @click="easyConfig">一键配置</t-button> -->
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { CloseIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import _ from 'lodash';
import db from '@/lib/dexie/dexie';
import { setting } from '@/lib/dexie';
import { useSettingStore, usePlayStore } from '@/store';
import SettingDarkIcon from '@/assets/assets-setting-dark.svg';
import SettingLightIcon from '@/assets/assets-setting-light.svg';
import SettingAutoIcon from '@/assets/assets-setting-auto.svg';

const { ipcRenderer } = require('electron');

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

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

const formData = ref({});

const rootClassFilter = computed({
  get() {
    return _.join(formData.value.rootClassFilter, ',');
  },
  set(val) {
    formData.value.rootClassFilter = _.split(val, '-');
  },
});

const r18ClassFilter = computed({
  get() {
    return _.join(formData.value.r18ClassFilter, ',');
  },
  set(val) {
    formData.value.r18ClassFilter = _.split(val, '-');
  },
});

watchEffect(() => {
  const res = JSON.parse(JSON.stringify(formData.value));
  setting.update(res);

  storeSetting.updateConfig({ mode: formData.value.theme });
  storePlayer.updateConfig({
    setting: {
      pauseWhenMinimize: formData.value.pauseWhenMinimize,
      softSolution: formData.value.softSolution,
      skipStartEnd: formData.value.skipStartEnd,
      skipTimeInStart: formData.value.skipTimeInStart,
      skipTimeInEnd: formData.value.skipTimeInEnd,
    },
  });
});

onMounted(() => {
  getSetting();
});

const getSetting = async () => {
  await setting.find().then((res) => {
    formData.value = res;
  });
};

const resetEvent = () => {
  clearDB();
  clearCache();
};

const clearDB = () => {
  db.delete().then(() => {
    MessagePlugin.success('重置成功,请手动重启软件！');
    win.relaunch();
    win.destroy();
  });
};

const clearCache = async () => {
  const ses = win.webContents.session;
  const size = (await ses.getCacheSize()) / 1024 / 1024;
  const mb = size.toFixed(2);
  await ses.clearCache();
  MessagePlugin.success(`清除缓存成功, 共清理 ${mb} MB`);
};

// 组合键格式化
const formatShortcut = () => {
  const sourceShortcut = formData.value.recordedShortcut;
  if (!sourceShortcut) return '';
  let shortcut;
  shortcut = sourceShortcut
    .replaceAll('+', ' + ')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace('Right', '→')
    .replace('Left', '←')
    .replace('Space', '空格');
  if (process.platform === 'darwin') {
    shortcut = sourceShortcut
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Meta', '⌘')
      .replace('Alt', '⌥')
      .replace('Control', '⌃')
      .replace('Shift', '⇧');
  }
  return shortcut.replace('CommandOrControl', 'Ctrl');
};

// 设置组合键更换焦点placeholder
const focusShortcut = () => {
  // 复制快捷键
  formData.value.recordedSourceShortcut = formData.value.recordedShortcut;
  formData.value.recordedShortcut = '';
  placeholderShortcut.value = '请按下快捷键组合';
};

// 设置组合键更换失去焦点placeholder
const blurShortcut = () => {
  // 还原快捷键
  if (formData.value.recordedSourceShortcut && !formData.value.recordedShortcut)
    formData.value.recordedShortcut = formData.value.recordedSourceShortcut;
  placeholderShortcut.value = '设置快捷键';
};

// 获取组合按键
const getShortKeys = (_, event) => {
  const { e } = event;

  e.preventDefault();
  const str = formData.value.recordedShortcut;
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
    formData.value.recordedShortcut = `${auxiliaryKey.join('+')}+${publicKey}`;
  } else {
    formData.value.recordedShortcut = str.substring(0, str.lastIndexOf('+') + 1) + publicKey;
  }
  isLegalShortcut(formData.value.recordedShortcut);
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
    shortcutInputRef.value.blur();
    ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordedShortcut });
  } else {
    tipShortcut.value = '当前组合键不合规';
    statusShortcut.value = 'error';
  }
};

// 取消快捷键
const cancelShortcut = () => {
  console.log('cancelShortcut');
  formData.value.recordedShortcut = '';
  ipcRenderer.send('uninstallShortcut');
};

// 重置快捷键
const resetShortcut = () => {
  console.log('resetShortcut');
  formData.value.recordedShortcut = 'Shift+Command+Z';
  shortcutInputRef.value.blur();
  ipcRenderer.send('updateShortcut', { shortcut: formData.value.recordedShortcut });
};

const checkUpdate = () => {
  console.log('checkUpdate');
  ipcRenderer.send('checkForUpdate');
};

const easyConfig = () => {
  console.log('easyConfig');
};
</script>

<style lang="less" scoped>
@import '@/style/variables';

.setting-base-container {
  :deep(.t-form__label) {
    label {
      font-weight: 500;
    }
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

  .textarea {
    width: 60vw;
  }
}
</style>
