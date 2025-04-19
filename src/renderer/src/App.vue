<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view />
    <!-- 需脱离文档流, 不然会影响后面dom渲染问题 -->
    <disclaimer-view v-model:visible="active.disclaimer" style="position: fixed; z-index: 999;"/>
  </t-config-provider>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

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
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const active = ref({
  disclaimer: false,
});

const handleThemeChange = (e: MediaQueryListEvent) => {
  const theme = e.matches? 'dark' : 'light';
  document.documentElement.setAttribute('theme-mode', theme);
  storeSetting.updateConfig({ theme });
};

watch(
  () => storeSetting.getStateMode,
  (val) => {
    if (val === 'auto') {
      (() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const theme = mediaQuery.matches ? 'dark' : 'light';
        storeSetting.updateConfig({ theme });
      })();
      mediaQuery?.addEventListener('change', handleThemeChange);
    } else {
      storeSetting.updateConfig({ theme: val });
      mediaQuery?.removeEventListener('change', handleThemeChange);
    };
  },
  { immediate: true },
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
  active.value.disclaimer = !agreementMask;

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
</script>
