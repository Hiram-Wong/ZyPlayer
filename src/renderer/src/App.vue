<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view />
    <!-- 需脱离文档流, 不然会影响后面dom渲染问题 -->
    <disclaimer-view v-model:visible="active.disclaimer" style="position: fixed; z-index: 999;"/>
  </t-config-provider>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { computed, onMounted, reactive, watch } from 'vue';

import { localeConfigKey } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';
import { usePlayStore, useSettingStore } from '@/store';
import { fetchSetup } from '@/api/setting';
import PLAY_CONFIG from '@/config/play';
import { loadExternalResource } from '@/utils/tool';

import DisclaimerView from '@/pages/Disclaimer.vue';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();
const { getComponentsLocale, changeLocale } = useLocale();

const active = reactive({
  disclaimer: false,
});

const theme = computed(() => {
  return storeSetting.getStateMode;
});

watch(
  () => storeSetting.displayMode,
  (val) => {
    const isDarkMode = val === 'dark';
    document.documentElement.setAttribute('theme-mode', isDarkMode ? 'dark' : '');
  },
);
watch(
  () => useLocalStorage(localeConfigKey, 'zh_CN').value,
  (val) => {
    changeLocale(val);
  },
);

onMounted(() => {
  initConfig();
});

const initConfig = async () => {
  const { agreementMask, theme, playerMode, barrage, timeout, debug } = await fetchSetup();

  storeSetting.updateConfig({
    mode: theme,
    timeout: timeout || 5000
  });
  active.disclaimer = !agreementMask;

  const init = Object.assign(
    { ...PLAY_CONFIG.setting },
    { playerMode, barrage }
  )
  storePlayer.updateConfig({ setting: init });

  if (debug) {
    const status = await loadExternalResource('https://pagespy.jikejishu.com/page-spy/index.min.js', 'js');
    if (status) {
      // @ts-ignore
      window.$pageSpy = new PageSpy({
        api: 'pagespy.jikejishu.com',
        clientOrigin: 'https://pagespy.jikejishu.com',
        project: 'zyfun',
        autoRender: true,
        title: 'zyfun for debug',
      });
    }
  }
};

window.electron.ipcRenderer.on('system-theme-updated', (_, activeTheme) => {
  if (theme.value === 'auto') {
    const themeMode = activeTheme === 'dark' ? 'dark' : '';
    document.documentElement.setAttribute('theme-mode', themeMode);
    console.log(`system-theme-updated: ${activeTheme}`);
  }
});
</script>
