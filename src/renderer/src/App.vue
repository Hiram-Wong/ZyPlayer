<template>
  <router-view></router-view>
  <disclaimer-view v-model:visible="isVisible.dialogDisclaimer" />
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { localeConfigKey } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';
import { usePlayStore, useSettingStore } from '@/store';
import { setup } from '@/api/setting';
import PLAY_CONFIG from '@/config/play';
import { autoSync } from '@/utils/webdev';
import { loadExternalResource } from '@/utils/tool';

import DisclaimerView from '@/pages/Disclaimer.vue';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();
const { changeLocale } = useLocale();

const isVisible = reactive({
  dialogDisclaimer: false,
});

const theme = computed(() => {
  return storeSetting.getStateMode;
});

const webdev = computed(() => {
  return storeSetting.webdev;
});

const intervalId = ref();

watch(
  () => webdev.value,
  (val) => {
    if (intervalId.value) clearInterval(intervalId.value);
    if (val.sync) {
      intervalId.value = setInterval(
        () => {
          autoSync(val.data.url, val.data.username, val.data.password);
        },
        1000 * 5 * 60,
      );
    }
  },
  { deep: true },
);
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
  const { agreementMask, theme, playerMode, webdev, barrage, timeout, debug } = await setup();

  storeSetting.updateConfig({ mode: theme });
  storeSetting.updateConfig({ webdev: webdev });
  storeSetting.updateConfig({ timeout: timeout || 5000 });
  isVisible.dialogDisclaimer = !agreementMask;

  const init = {
    ...PLAY_CONFIG.setting,
  };
  init.playerMode = playerMode;
  init.barrage = barrage;
  storePlayer.updateConfig({ setting: init });

  if (debug) {
    const status = await loadExternalResource('https://test.jikejishu.com/page-spy/index.min.js', 'js');
    if (status) {
      window.$pageSpy = new PageSpy({
        api: 'test.jikejishu.com',
        clientOrigin: 'https://test.jikejishu.com',
        project: 'zyplayer',
        autoRender: true,
        title: 'zyplayer for debug',
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
