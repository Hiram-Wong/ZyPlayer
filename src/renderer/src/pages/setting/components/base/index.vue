<template>
  <div class="setting-base view-component-container">
    <t-form :data="formData" label-align="left">
      <t-form-item :label="$t('common.theme.title')" name="theme">
        <t-radio-group v-model="formData.theme" class="theme">
          <div v-for="item in THEME_OPTIONS" :key="item.value" class="theme-item">
            <t-radio-button :key="item.value" :value="item.value" class="theme-btn">
              <component :is="item.icon" class="theme-icon" />
            </t-radio-button>
            <p class="theme-text">{{ item.label }}</p>
          </div>
        </t-radio-group>
      </t-form-item>
      <t-form-item :label="$t('common.lang')" name="lang">
        <t-select v-model="formData.lang" :options="LANG_OPTIONS" :style="{ width: '296px' }" />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.bossKey')" name="bossKey">
        <t-space align="center">
          <input-shortcut
            v-model="formData.bossKey"
            :placeholder="$t('common.placeholder.inputSet')"
            :style="{ width: '296px' }"
          />
          <span class="title" @click="handleResetConf('bossKey')">{{ $t('common.reset') }}</span>
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.timeout')" name="timeout">
        <t-space align="center">
          <t-input-number
            v-model="formData.timeout"
            theme="column"
            :min="5000"
            :max="1000 * 60"
            :style="{ width: '296px' }"
            @change="handleNetTimeout"
          />
          <span class="title" @click="handleResetConf('timeout')">{{ $t('common.reset') }}</span>
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.hot')" name="hot">
        <t-select v-model="formData.hot" :options="HOT_OPTIONS" :style="{ width: '296px' }" />
      </t-form-item>
      <t-form-item :label="$t('pages.film.title')" name="site">
        <t-space align="center">
          <t-select v-model="formData.site.searchMode" :label="$t('common.search')" :style="{ width: '296px' }">
            <t-option value="site" :label="$t('pages.setting.base.site.searchMap.local')"></t-option>
            <t-option value="group" :label="$t('pages.setting.base.site.searchMap.group')"></t-option>
            <t-option value="all" :label="$t('pages.setting.base.site.searchMap.all')"></t-option>
          </t-select>
          <!-- <t-select v-model="formData.site.filterMode" :label="$t('common.filter')" :style="{ width: '140px' }">
            <t-option :value="true" :label="$t('common.enable')"></t-option>
            <t-option :value="false" :label="$t('common.disable')"></t-option>
          </t-select> -->
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.live.title')" name="live">
        <t-space direction="vertical">
          <t-space align="center">
            <t-radio v-model="formData.live.ipMark" allow-uncheck>
              {{ $t('pages.setting.base.live.ipMark') }}
            </t-radio>
            <t-radio v-model="formData.live.delay" allow-uncheck>
              {{ $t('pages.setting.base.live.delay') }}
            </t-radio>
            <t-radio v-model="formData.live.thumbnail" allow-uncheck>
              {{ $t('pages.setting.base.live.thumbnail') }}
              <t-popup
                destroy-on-close
                attach=".t-form-item__live"
                :content="$t('pages.setting.base.live.popup.thumbnail')"
              >
                <info-circle-icon :style="{ marginBottom: 'var(--td-comp-margin-xs)' }" />
              </t-popup>
            </t-radio>
          </t-space>
          <t-space align="center">
            <t-input
              v-model="formData.live.epg"
              clearable
              :label="$t('pages.live.field.epg')"
              :style="{ width: '296px' }"
            />
            <span class="title" @click="handleDialog('liveEpg')">{{ $t('common.explain') }}</span>
            <span class="title" @click="handleResetConf('live.epg')">{{ $t('common.reset') }}</span>
          </t-space>
          <t-space align="center">
            <t-input
              v-model="formData.live.logo"
              clearable
              :label="$t('pages.live.field.logo')"
              :style="{ width: '296px' }"
            />
            <span class="title" @click="handleDialog('liveLogo')">{{ $t('common.explain') }}</span>
            <span class="title" @click="handleResetConf('live.logo')">{{ $t('common.reset') }}</span>
          </t-space>
        </t-space>

        <dialog-document
          v-model:visible="isVisible.liveEpg"
          :attach="`.${attachContent}`"
          :title="$t('pages.md.liveEpg.title')"
          :content="$t('pages.md.liveEpg.content')"
        />
        <dialog-document
          v-model:visible="isVisible.liveLogo"
          :attach="`.${attachContent}`"
          :title="$t('pages.md.liveLogo.title')"
          :content="$t('pages.md.liveLogo.content')"
        />
      </t-form-item>
      <t-form-item :label="$t('aigc.subheading')" name="ai">
        <t-space direction="vertical">
          <t-select
            v-model="formData.aigc.type"
            :options="AIGC_PROVIDER_OPTIONS"
            :label="$t('common.provider')"
            disabled
            :style="{ width: '296px' }"
          />
          <t-input v-model="formData.aigc.server" clearable :label="$t('common.api')" :style="{ width: '296px' }" />
          <t-input
            v-model="formData.aigc.key"
            type="password"
            clearable
            :label="$t('aigc.field.key')"
            :style="{ width: '296px' }"
          />
          <t-input
            v-model="formData.aigc.model"
            clearable
            :label="$t('aigc.field.model')"
            :style="{ width: '296px' }"
          />
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.player.title')" name="player">
        <t-space direction="vertical">
          <t-space align="center">
            <t-select v-model="formData.player.type" :options="PLAYER_OPTIONS" :style="{ width: '296px' }" />
            <span class="title" @click="handleDialogForm('sniffer')">
              {{ $t('pages.setting.base.player.sniffer') }}
            </span>
            <span class="title" @click="handleDialogForm('barrage')">
              {{ $t('pages.setting.base.player.barrage') }}
            </span>
          </t-space>
          <t-space v-if="formData.player.type === PLAYER_TYPE.CUSTOM" align="center">
            <t-input
              v-model="formData.player.external"
              :label="$t('pages.setting.base.player.command')"
              :style="{ width: '296px' }"
            />
            <span class="title" @click="handleDialog('customPlayer')">{{ $t('common.explain') }}</span>
          </t-space>
        </t-space>

        <dialog-barrage-view v-model:visible="isVisible.barrage" :data="dialogFormData" @submit="onDialogSubmit" />
        <dialog-sniffer-view v-model:visible="isVisible.sniffer" :data="dialogFormData" @submit="onDialogSubmit" />
        <dialog-document
          v-model:visible="isVisible.customPlayer"
          :attach="`.${attachContent}`"
          :title="$t('pages.md.customPlayer.title')"
          :content="$t('pages.md.customPlayer.content')"
        />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.security.title')" name="security">
        <t-space align="center">
          <span class="title" @click="handleDialogForm('proxy')">{{ $t('pages.setting.base.security.proxy') }}</span>
          <span class="title" @click="handleDialogForm('ua')">{{ $t('pages.setting.base.security.ua') }}</span>
          <span class="title" @click="handleDialogForm('dns')">{{ $t('pages.setting.base.security.dns') }}</span>
        </t-space>

        <dialog-ua-view v-model:visible="isVisible.ua" :data="dialogFormData" @submit="onDialogSubmit" />
        <dialog-proxy-view v-model:visible="isVisible.proxy" :data="dialogFormData" @submit="onDialogSubmit" />
        <dialog-dns-view v-model:visible="isVisible.dns" :data="dialogFormData" @submit="onDialogSubmit" />
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.permission.title')" name="permission">
        <t-space align="center">
          <t-radio v-model="formData.autoLaunch" allow-uncheck @change="handleAutoLaunch">
            {{ $t('pages.setting.base.permission.autoLaunch') }}
          </t-radio>
          <t-radio v-model="formData.hardwareAcceleration" allow-uncheck @change="handleHardwareAcceleration">
            {{ $t('pages.setting.base.permission.hardwareAcceleration') }}
          </t-radio>
          <t-radio v-model="formData.debug" allow-uncheck>
            {{ $t('pages.setting.base.permission.debug') }}
          </t-radio>
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('pages.setting.base.other.title')" name="other">
        <t-space align="center">
          <span class="title" @click="handleFactoryReset">{{ $t('pages.setting.base.other.factoryReset') }}</span>
          <span class="title" @click="handleDialog('update')">{{ $t('pages.setting.base.other.checkUpdate') }}</span>
          <span class="title" @click="handleDialog('disclaimer')">{{ $t('pages.setting.base.other.disclaimer') }}</span>
        </t-space>

        <dialog-update-view v-model:visible="isVisible.update" />
        <dialog-disclaimer-view v-model:visible="isVisible.disclaimer" />
      </t-form-item>
    </t-form>
  </div>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { AIGC_PROVIDER_TYPE, PLAYER_TYPE, REC_HOT_TYPE } from '@shared/config/setting';
import type { ISetting } from '@shared/config/tblSetting';
import { settingObj as tblSetting } from '@shared/config/tblSetting';
import { THEME } from '@shared/config/theme';
import { isObject, isObjectEmpty, isPositiveFiniteNumber } from '@shared/modules/validate';
import { cloneDeep, isEqual, pickBy } from 'es-toolkit';
import { InfoCircleIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, defineAsyncComponent, onActivated, onMounted, ref, watch } from 'vue';

import { dataDbClear } from '@/api/data';
import { fetchSettingList, sourceSetting } from '@/api/setting';
import ThemeAutoIcon from '@/assets/theme/auto.svg';
import ThemeDarkIcon from '@/assets/theme/dark.svg';
import ThemeLightIcon from '@/assets/theme/light.svg';
import DialogDocument from '@/components/dialog-docment/index.vue';
import InputShortcut from '@/components/input-shortcut/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { langList, t } from '@/locales';
import { usePlayerStore, useSettingStore } from '@/store';
import emitter from '@/utils/emitter';

const createAsyncComponentRefs = (components: string[]): Record<string, any> => {
  const refs: Record<string, any> = {};
  components.forEach((componentName) => {
    const refName = `Dialog${componentName}View`;
    refs[refName] = defineAsyncComponent(() => import(`./components/Dialog${componentName}.vue`));
  });
  return refs;
};

const componentNames = ['Ua', 'Proxy', 'Dns', 'Update', 'Sniffer', 'Barrage'];

const { DialogUaView, DialogProxyView, DialogDnsView, DialogUpdateView, DialogSnifferView, DialogBarrageView } =
  createAsyncComponentRefs(componentNames);
const DialogDisclaimerView = defineAsyncComponent(() => import('@/pages/Disclaimer.vue'));

const storePlayer = usePlayerStore();
const storeSetting = useSettingStore();

const isVisible = ref({
  liveEpg: false,
  liveLogo: false,
  customPlayer: false,
  sniffer: false,
  barrage: false,
  ua: false,
  proxy: false,
  dns: false,
  update: false,
  disclaimer: false,
});
const dialogFormData = ref({ data: {} });

const formData = ref<ISetting>(tblSetting);

const THEME_OPTIONS = computed(() => [
  { value: THEME.SYSTEM, label: t('common.followSystem'), icon: ThemeAutoIcon },
  { value: THEME.LIGHT, label: t('common.theme.light'), icon: ThemeLightIcon },
  { value: THEME.DARK, label: t('common.theme.dark'), icon: ThemeDarkIcon },
]);

const LANG_OPTIONS = computed(() => [
  { value: 'system', label: t('common.followSystem') },
  ...langList.value.map((lang) => ({ value: lang.value, label: lang.label })),
]);

const HOT_OPTIONS = computed(() => [
  { value: REC_HOT_TYPE.BAIDU, label: t('pages.setting.base.site.hotMap.baidu') },
  { value: REC_HOT_TYPE.DOUBAN, label: t('pages.setting.base.site.hotMap.douban') },
  { value: REC_HOT_TYPE.ENLIGHTENT, label: t('pages.setting.base.site.hotMap.enlightent') },
  { value: REC_HOT_TYPE.KOMECT, label: t('pages.setting.base.site.hotMap.komect') },
  { value: REC_HOT_TYPE.KYLIVE, label: t('pages.setting.base.site.hotMap.kylive') },
  { value: REC_HOT_TYPE.QUARK, label: t('pages.setting.base.site.hotMap.quark') },
]);

const PLAYER_OPTIONS = computed(() => [
  { value: PLAYER_TYPE.XGPLAYER, label: t('media.playerMap.xgplayer') },
  // { value: PLAYER_TYPE.DPLAYER, label: t('media.playerMap.dplayer') },
  { value: PLAYER_TYPE.ARTPLAYER, label: t('media.playerMap.artplayer') },
  // { value: PLAYER_TYPE.NPLAYER, label: t('media.playerMap.nplayer') },
  // { value: PLAYER_TYPE.OPLAYER, label: t('media.playerMap.oplayer') },
  { value: PLAYER_TYPE.CUSTOM, label: t('media.playerMap.customplayer') },
]);

const AIGC_PROVIDER_OPTIONS = computed(() => [
  // { value: AIGC_PROVIDER_TYPE.AMZON, label: t('aigc.field.providerMap.amazon') },
  { value: AIGC_PROVIDER_TYPE.ANTHROPIC, label: t('aigc.field.providerMap.anthropic') },
  { value: AIGC_PROVIDER_TYPE.AZURE, label: t('aigc.field.providerMap.azure') },
  { value: AIGC_PROVIDER_TYPE.GEMINI, label: t('aigc.field.providerMap.gemini') },
  { value: AIGC_PROVIDER_TYPE.OPENAI, label: t('aigc.field.providerMap.openai') },
]);

watch(
  () => ({
    theme: storeSetting.theme,
    lang: storeSetting.lang,
  }),
  (newVal, oldVal) => {
    const patch = pickBy(newVal, (value, key) => !isEqual(value, oldVal[key]));
    for (const key in patch) {
      if (formData.value[key] !== patch[key]) formData.value[key] = patch[key];
    }
  },
);

watch(
  () => formData.value,
  (val) => sourceSettingConf(val),
  { deep: true },
);

watch(
  () => ({
    theme: formData.value.theme,
    lang: formData.value.lang,
    timeout: formData.value.timeout,
    debug: formData.value.debug,
    bossKey: formData.value.bossKey,
  }),
  (newVal, oldVal) => {
    const patch = pickBy(
      { ...newVal, timeout: Math.max(newVal.timeout, 5000) },
      (value, key) => !isEqual(value, oldVal[key]),
    );
    if (!isObjectEmpty(patch)) storeSetting.updateConfig(patch);
  },
);

watch(
  () => ({
    player: formData.value.player,
    barrage: formData.value.barrage,
  }),
  (newVal, oldVal) => {
    const patch = pickBy(newVal, (value, key) => !isEqual(value, oldVal[key]));
    if (!isObjectEmpty(patch)) storePlayer.updateConfig(patch);
  },
  { deep: true },
);

watch(
  () => [formData.value.hot, formData.value.site],
  () => emitter.emit(emitterChannel.REFRESH_SEARCH_CONFIG, { source: emitterSource.SETTING_BASE }),
  { deep: true },
);

watch(
  () => formData.value.aigc,
  () => emitter.emit(emitterChannel.REFRESH_AIGC_CONFIG, { source: emitterSource.SETTING_BASE }),
  { deep: true },
);

watch(
  () => formData.value.live,
  () => emitter.emit(emitterChannel.REFRESH_LIVE_CONFIG, { source: emitterSource.SETTING_BASE }),
  { deep: true },
);

onMounted(() => setup());

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_SETTING_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_SETTING_CONFIG, reloadConfig);
});

const setup = () => {
  getSetting();
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.SETTING_BASE) return;

  await getSetting();
};

const getSetting = async () => {
  try {
    const resp = await fetchSettingList();

    if (isObject(resp) && !isObjectEmpty(resp)) {
      formData.value = resp as ISetting;
    }
  } catch (error) {
    console.error(`Failed to get setting conf:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const sourceSettingConf = async (val: ISetting) => {
  await sourceSetting(val);
};

const handleNetTimeout = (val: number) => {
  const timeout = isPositiveFiniteNumber(val) ? (val < 5000 || val > 60000 ? 5000 : val) : 5000;
  formData.value.timeout = timeout;
};

const handleReboot = () => {
  MessagePlugin.warning(t('pages.setting.message.willReboot'));
  setTimeout(() => window.electron.ipcRenderer.invoke(IPC_CHANNEL.APP_REBOOT), 3000);
};

const handleAutoLaunch = () => {
  const isLaunchOnBoot = formData.value.autoLaunch;
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.APP_AUTO_LAUNCH, isLaunchOnBoot);
};

const handleHardwareAcceleration = () => {
  MessagePlugin.warning(t('pages.setting.message.warnReboot'));
};

const handleFactoryReset = () => {
  const dialog = DialogPlugin({
    header: t('pages.setting.factoryReset.title'),
    body: t('pages.setting.factoryReset.content'),
    width: '320px',
    confirmBtn: t('common.confirm'),
    cancelBtn: t('common.cancel'),
    placement: 'center',
    closeBtn: '',
    onConfirm: async () => {
      await dataDbClear({ types: '' });
      dialog.hide();
      handleReboot();
    },
    onClose: () => dialog.hide(),
  });
};

const handleResetConf = (type: string) => {
  const defaultMap = {
    bossKey: 'Shift + Alt + Z',
    'live.epg': 'https://epg.112114.eu.org/?ch={name}&date={date}',
    'live.logo': 'https://epg.112114.eu.org/logo/{name}.png',
    timeout: 10000,
  };

  if (Object.hasOwn(defaultMap, type)) {
    const keys = type.split('.');
    const last = keys.pop()!;

    let target: any = formData.value;
    for (const k of keys) {
      if (target[k] == null || typeof target[k] !== 'object') target[k] = {};
      target = target[k];
    }

    target[last] = defaultMap[type as keyof typeof defaultMap];
  }
};

const handleDialogForm = (type: string) => {
  const doc = { data: formData.value[type] };
  dialogFormData.value = cloneDeep(doc);
  isVisible.value[type] = true;
};

const handleDialog = (type: string) => {
  isVisible.value[type] = true;
};

const onDialogSubmit = (type: string, doc: any) => {
  formData.value[type] = doc;

  switch (type) {
    case 'dns': {
      window.electron.ipcRenderer.invoke(IPC_CHANNEL.APP_DNS, doc);
      break;
    }
    case 'proxy': {
      const { type, url, bypass } = doc;
      window.electron.ipcRenderer.invoke(
        IPC_CHANNEL.APP_PROXY,
        type,
        ...(type === 'custom' && url ? [url, bypass] : []),
      );
      // window.electron.ipcRenderer.invoke(IPC_CHANNEL.APP_PROXY_SYSTEM);
      break;
    }
  }
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 0 var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
  overflow-y: auto;

  .t-radio-group.t-size-m .t-radio-button {
    height: auto;
  }

  .title {
    color: var(--td-brand-color);
    cursor: pointer;
    font-weight: 500;
  }

  .theme {
    display: flex;
    flex-direction: row;
    gap: var(--td-size-8);

    .theme-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .theme-btn {
        display: inline-flex;
        max-height: 78px;
        padding: 0;
        border-radius: var(--td-radius-s);
        border: 2px solid transparent;

        > :deep(.t-radio-button__label) {
          display: inline-flex;
        }
      }

      .t-is-checked {
        border: 2px solid var(--td-brand-color);
      }

      .theme-text {
        margin-top: var(--td-comp-margin-s);
        text-align: center;
      }
    }
  }
}
</style>
