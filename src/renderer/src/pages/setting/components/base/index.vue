<template>
  <div class="setting-base-container">
    <t-form ref="form" label-width="110px" :data="formData" label-align="left">
      <t-form-item :label="$t('pages.setting.base.theme')" name="theme">
        <t-radio-group v-model="formData.theme">
          <div v-for="(item, index) in MODE_OPTIONS" :key="index" class="setting-layout-drawer">
            <t-radio-button :key="index" :value="item.type">
              <component :is="getModeIcon(item.type)" class="mode-img" />
            </t-radio-button>
            <p :style="{ textAlign: 'center', marginTop: '8px' }">{{ item.text }}</p>
          </div>
        </t-radio-group>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.bossKey')" name="shortcutKey">
        <t-space align="center">
          <shortcut-input
            v-model="formData.recordShortcut"
            class="shortcut-content"
            :style="{ width: '255px' }"
          />
          <span class="title" @click="handleReset('recordShortcut')">{{ $t('pages.setting.base.reset') }}</span>
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.timeout')" name="timeout">
        <div class="timeout">
          <t-space align="center">
            <t-input-number v-model="formData.timeout" theme="column" class="timeout-content"
              :placeholder="t('pages.setting.placeholder.general')"
              :style="{ width: '255px' }"
              :min="5000"
              :max="1000 * 60"
              @change="handleNetTimeout"
            />
            <span class="title" @click="handleReset('timeout')">{{ $t('pages.setting.base.reset') }}</span>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.film')" name="film">
        <div class="film">
          <t-space direction="vertical">
            <t-space align="center">
              <t-select v-model="formData.defaultHot" :placeholder="$t('pages.setting.placeholder.general')"
                :label="$t('pages.setting.base.hotRecommend')" :style="{ width: '255px' }">
                <t-option value="kylive" :label="$t('pages.setting.base.kylive')"></t-option>
                <t-option value="enlightent" :label="$t('pages.setting.base.enlightent')"></t-option>
                <t-option value="douban" :label="$t('pages.setting.base.douban')"></t-option>
                <t-option value="komect" :label="$t('pages.setting.base.komect')"></t-option>
              </t-select>
            </t-space>
            <t-space align="center">
              <t-select v-model="formData.defaultSearchType" :placeholder="$t('pages.setting.placeholder.general')"
                :label="$t('pages.setting.base.search')" :style="{ width: '120px' }">
                <t-option value="site" :label="$t('pages.setting.base.site')"></t-option>
                <t-option value="group" :label="$t('pages.setting.base.group')"></t-option>
                <t-option value="all" :label="$t('pages.setting.base.all')"></t-option>
              </t-select>
              <t-select v-model="formData.defaultFilterType" :placeholder="$t('pages.setting.placeholder.general')"
                :label="$t('pages.setting.base.filter')" :style="{ width: '120px' }">
                <t-option :value="true" :label="$t('pages.setting.base.on')"></t-option>
                <t-option :value="false" :label="$t('pages.setting.base.off')"></t-option>
              </t-select>
            </t-space>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.iptv')" name="iptv">
        <div class="iptv">
          <t-space direction="vertical">
            <t-space align="center">
              <t-radio v-model="formData.iptvMarkIp" allow-uncheck>{{ $t('pages.setting.base.markIp') }}</t-radio>
              <t-radio v-model="formData.iptvDelay" allow-uncheck>{{ $t('pages.setting.base.delay') }}</t-radio>
              <t-radio v-model="formData.iptvThumbnail" allow-uncheck>{{ $t('pages.setting.base.thumbnail') }}</t-radio>
              <span class="title" @click="handleDialog('iptvThumbnail')">{{ $t('pages.setting.base.info') }}</span>
            </t-space>
            <t-space align="center">
              <t-input v-model="formData.defaultIptvEpg" :label="$t('pages.setting.base.defaultEpg')"
                :placeholder="$t('pages.setting.placeholder.epgTip')" :style="{ width: '255px' }" />
              <span class="title" @click="handleReset('defaultIptvEpg')">{{ $t('pages.setting.base.reset') }}</span>
            </t-space>
            <t-space align="center">
              <t-input v-model="formData.defaultIptvLogo" :label="$t('pages.setting.base.globalLogo')"
                :placeholder="$t('pages.setting.placeholder.logoTip')" :style="{ width: '255px' }" />
              <span class="title" @click="handleReset('defaultIptvLogo')">{{ $t('pages.setting.base.reset') }}</span>
            </t-space>
          </t-space>
        </div>

        <dialog-thumbnail-view v-model:visible="isVisible.iptvThumbnail" destroy-on-close />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.player')" name="player">
        <div class="player">
          <t-space direction="vertical">
            <t-space align="center">
              <t-select v-model="formData.playerMode.type" :options="PLAYER_OPTIONS"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '255px' }" />
              <span class="title" @click="handleDialogForm('snifferMode')">{{ $t('pages.setting.base.sniffer') }}</span>
              <span class="title" @click="handleDialogForm('barrage')">{{ $t('pages.setting.base.barrage') }}</span>
            </t-space>
            <t-space align="center" v-if="formData.playerMode.type === 'custom'">
              <t-input v-model="formData.playerMode.external" :label="$t('pages.setting.base.command')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '255px' }" />
              <span class="title" @click="handleDialog('customPlayer')">{{ $t('pages.setting.base.info') }}</span>
            </t-space>
          </t-space>
        </div>

        <dialog-barrage-view v-model:visible="isVisible.barrage" :data="dialogFormData" @submit="handleDialogReceive" />
        <dialog-sniffer-view v-model:visible="isVisible.snifferMode" :data="dialogFormData" @submit="handleDialogReceive" />
        <dialog-custom-player-view v-model:visible="isVisible.customPlayer" />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.security')" name="security">
        <t-space>
          <span v-if="platform !== 'linux'" class="title" @click="handleNetProxy">
            {{ $t('pages.setting.base.proxy') }}
          </span>
          <span class="title" @click="handleDialogForm('ua')">{{ $t('pages.setting.base.ua') }}</span>
          <span class="title" @click="handleDialogForm('dns')">{{ $t('pages.setting.base.dns') }}</span>
        </t-space>

        <dialog-ua-view v-model:visible="isVisible.ua" :data="dialogFormData" @submit="handleDialogReceive" />
        <dialog-dns-view v-model:visible="isVisible.dns" :data="dialogFormData" @submit="handleDialogReceive" />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.permission')" name="permission">
        <t-space>
          <t-radio v-if="platform !== 'linux'" v-model="formData.selfBoot" allow-uncheck @change="handleSelefBoot">
            {{ $t('pages.setting.base.selefBoot') }}
          </t-radio>
          <!-- <t-radio v-model="formData.hardwareAcceleration" allow-uncheck @change="handleHardwareAcceleration">
            {{ $t('pages.setting.base.hardwareAcceleration') }}
          </t-radio> -->
          <t-radio v-model="formData.windowPosition.status" allow-uncheck>
            {{ $t('pages.setting.base.windowPosition') }}
          </t-radio>
          <t-radio v-model="formData.debug" allow-uncheck @change="handleDebug">
            {{ $t('pages.setting.base.debug') }}
          </t-radio>
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.other')" name="other">
        <t-space>
          <span class="title" @click="handleResetFactory">{{ $t('pages.setting.base.restoreFactory') }}</span>
          <span class="title" @click="handleDialogForm('webdev')">{{ $t('pages.setting.base.dataMange') }}</span>
          <span class="title" @click="handleDialog('update')">{{ $t('pages.setting.base.checkUpdate') }}</span>
          <span class="title" @click="handleDialog('disclaimer')">{{ $t('pages.setting.base.disclaimer') }}</span>
        </t-space>

        <dialog-data-view v-model:visible="isVisible.webdev" :data="dialogFormData" @submit="handleDialogReceive" />
        <dialog-update-view v-model:visible="isVisible.update" />
        <dialog-disclaimer-view v-model:visible="isVisible.disclaimer" />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, onActivated, ref, watch, defineAsyncComponent, shallowRef } from 'vue';

import { fetchSettingList, clearDb, sourceSetting } from '@/api/setting';
import { usePlayStore, useSettingStore } from '@/store';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import { platform } from '@/utils/tool';

import SettingAutoIcon from '@/assets/assets-setting-auto.svg';
import SettingDarkIcon from '@/assets/assets-setting-dark.svg';
import SettingLightIcon from '@/assets/assets-setting-light.svg';

import ShortcutInput from '@/components/shortcut-input/index.vue';

defineOptions({
  name: 'SettingPage',
});

const createAsyncComponentRefs = (components: string[]): Record<string, any> => {
  const refs: Record<string, any> = {};
  components.forEach((componentName) => {
    const refName = `Dialog${componentName}View`;
    refs[refName] = defineAsyncComponent(() => import(`./components/Dialog${componentName}.vue`));
  });
  return refs;
};

const componentNames = [
  'Data', 'Ua', 'Dns', 'Update',
  'Thumbnail', 'CustomPlayer', 'Sniffer', 'Barrage',
];

// 生成异步组件引用
const {
  DialogDataView,
  DialogUaView,
  DialogDnsView,
  DialogUpdateView,
  DialogThumbnailView,
  DialogCustomPlayerView,
  DialogSnifferView,
  DialogBarrageView
} = createAsyncComponentRefs(componentNames);
const DialogDisclaimerView = shallowRef(defineAsyncComponent(() => import('@/pages/Disclaimer.vue')));

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const isVisible = ref({
  webdev: false,
  update: false,
  dns: false,
  ua: false,
  iptvThumbnail: false,
  snifferMode: false,
  customPlayer: false,
  barrage: false,
  disclaimer: false,
});
const dialogFormData = ref({ data: {}, type: '' });

const formData = ref({
  version: '3.4.10',
  theme: 'auto',
  lang: 'zh_CN',
  defaultHot: 'kylive',
  defaultSearchType: 'site',
  defaultFilterType: false,
  defaultIptvEpg: 'https://epg.112114.eu.org/?ch={name}&date={date}',
  defaultIptvLogo: 'https://epg.112114.eu.org/logo/{name}.png',
  timeout: 5000,
  iptvMarkIp: true,
  iptvThumbnail: false,
  iptvDelay: false,
  defaultSite: null,
  defaultIptv: null,
  defaultAnalyze: null,
  analyzeFlag: [ 'youku', 'qq', 'iqiyi', 'qiyi', 'letv', 'sohu', 'tudou', 'pptv', 'mgtv' ],
  defaultDrive: '',
  defaultViewCasual: '',
  playerMode: { type: 'artplayer', external: '' },
  snifferMode: { type: 'pie', url: '' },
  barrage: { url: '', id: '', key: '', support: [], start: '', mode: '', color: '', content: '' },
  softSolution: false,
  skipStartEnd: false,
  agreementMask: false,
  recordShortcut: '',
  selfBoot: false,
  hardwareAcceleration: true,
  ua: '',
  communitySubscribe: '',
  webdev: { sync: false, data: { url: "https://dav.jianguoyun.com/dav/", username: "", password: "" } },
  windowPosition: { status: false, position: { width: 1000, height: 640 } },
  debug: false
});

const MODE_OPTIONS = computed(() => [
  { type: 'light', text: t('pages.setting.base.light') },
  { type: 'dark', text: t('pages.setting.base.dark') },
  { type: 'auto', text: t('pages.setting.base.auto') }
]);

const PLAYER_OPTIONS = computed(() => [
  { label: t('pages.setting.base.xgplayer'), value: 'xgplayer' },
  // { label: t('pages.setting.base.dplayer'), value: 'dplayer' },
  { label: t('pages.setting.base.artplayer'), value: 'artplayer' },
  // { label: t('pages.setting.base.nplayer'), value: 'nplayer' },
  { label: t('pages.setting.base.oplayer'), value: 'oplayer' },
  { label: t('pages.setting.base.custom'), value: 'custom' }
]);

const theme = computed(() => storeSetting.getStateMode);

const getModeIcon = (mode: string) => ({
  light: SettingLightIcon,
  dark: SettingDarkIcon,
  auto: SettingAutoIcon
})[mode];

watch(() => theme.value, val => formData.value.theme = val);

watch(() => formData.value, async (newVal) => {
  storeSetting.updateConfig({
    mode: newVal.theme,
    timeout: Math.max(newVal.timeout, 5000)
  });
  storePlayer.updateConfig({
    setting: {
      playerMode: newVal.playerMode,
      snifferMode: newVal.snifferMode,
      barrage: newVal.barrage
    },
  } as any);
  await putConf(newVal);
}, { deep: true });

// 监听刷新hot
watch(() => [
  formData.value.defaultHot,
  formData.value.defaultSearchType,
  formData.value.defaultFilterType
], () => emitter.emit('refreshHotConfig'));

// 监听刷新iptv
watch(() => [
  formData.value.iptvMarkIp,
  formData.value.iptvDelay,
  formData.value.iptvThumbnail,
  formData.value.defaultIptvEpg
], () => emitter.emit('refreshIptvConfig'));

// 监听快捷键
watch(
  () => formData.value.recordShortcut,
  async (val) => {
    await window.electron.ipcRenderer.invoke('manage-boss-shortcut', { action: 'unRegister', config: { name: 'boss' }});
    if (!val) return;

    const isAvailable = await window.electron.ipcRenderer.invoke('manage-boss-shortcut', { action: 'isRegistered', config: { shortcut: val }});
    if (isAvailable) {
      formData.value.recordShortcut = '';
      MessagePlugin.error(t('pages.setting.placeholder.shortcutErrRegistered'));
    } else {
      await window.electron.ipcRenderer.invoke('manage-boss-shortcut', { action: 'register', config: { shortcut: val, name: 'boss' }});
    }
  }
);

onMounted(() => {
  fetchConf();
});

onActivated(() => !emitter.all.get('refreshConf') && emitter.on('refreshConf', refreshConf));

const fetchConf = async () => {
  formData.value = await fetchSettingList();
};

const putConf = async (val) => {
  await sourceSetting(val);
};

// 网络超时
const handleNetTimeout = (val: number) => {
  formData.value.timeout = val < 5000 || val > 60000 ? 5000 : val;
};

// 网络代理
const handleNetProxy = () => window.electron.ipcRenderer.send('open-proxy-setting');

// 重启应用
const handleReboot = () => {
  MessagePlugin.success(t('pages.setting.message.reboot'));
  setTimeout(() => window.electron.ipcRenderer.send('reboot-app'), 1000);
};

// 出厂恢复
const handleResetFactory = () => {
  const dialog = DialogPlugin({
    body: t('pages.setting.dialog.restoreFactoryBody'),
    header: t('pages.setting.dialog.restoreFactoryHeader'),
    width: '320px',
    confirmBtn: t('pages.setting.dialog.confirm'),
    cancelBtn: t('pages.setting.dialog.cancel'),
    placement: 'center',
    closeBtn: '',
    onConfirm: async () => {
      await clearDb(["reset", "cache"]);
      window.electron.ipcRenderer.send('clearCache');
      dialog.hide();
      handleReboot();
    },
    onClose: () => dialog.hide(),
  });
};

// 开机自启
const handleSelefBoot = () => window.electron.ipcRenderer.send('toggle-selfBoot', formData.value.selfBoot);

// 硬件加速
const handleHardwareAcceleration = () => handleReboot();

// 调试模式
const handleDebug = () => handleReboot();

// 重置
const handleReset = (type: string): void => {
  console.log(`reset action: ${type}`);
  const defaultMap = {
    recordShortcut: 'Shift+Alt+Z',
    defaultIptvEpg: 'https://epg.112114.eu.org/?ch={name}&date={date}',
    defaultIptvLogo: 'https://epg.112114.eu.org/logo/{name}.png',
    timeout: 5000,
    defaultViewCasual: 'http://api.yujn.cn/api/zzxjj.php',
  };

  if (defaultMap.hasOwnProperty(type)) {
    formData.value[type] = defaultMap[type as keyof typeof defaultMap];
  };
};

// 对话框 + 传参
const handleDialogForm = (type: string) => {
  dialogFormData.value = { data: formData.value[type], type };
  isVisible.value[type] = true;
};

// 对话框
const handleDialog = (type: string) => {
  isVisible.value[type] = true;
};

// 数据接收
const handleDialogReceive = ({ data, type }) => {
  formData.value[type] = data;
};

const refreshConf = () => {
  console.log('[setting][bus][refresh]');
  fetchConf();
};
</script>

<style lang="less" scoped>
.setting-base-container {
  height: 100%;
  padding: 0 var(--td-comp-paddingLR-xxl);
  overflow: auto;

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
