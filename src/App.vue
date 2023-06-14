<template>
  <router-view></router-view>
  <privacy-policy-view v-model:visible="formDialogPrivacyPolicy" />
</template>

<script setup lang="ts">
import { platform } from '@tauri-apps/api/os';
import { appWindow } from '@tauri-apps/api/window';
import { computed, onMounted, ref } from 'vue';

import PLAY_CONFIG from '@/config/play';
import { setting } from '@/lib/dexie';
import PrivacyPolicyView from '@/pages/PrivacyPolicy.vue';
import { usePlayStore, useSettingStore } from '@/store';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const formDialogPrivacyPolicy = ref(false);

const appTheme = computed(() => {
  return storeSetting.getStateMode;
});

onMounted(() => {
  initTheme();
  initAgreementMask();
  initPlayerSetting();
  systemThemeListen();
  systemPlatform();
});

const initTheme = async () => {
  const res = await setting.get('theme');
  storeSetting.updateConfig({ mode: res });
};

const systemPlatform = async () => {
  const platformName = await platform();
  storeSetting.updateConfig({ platform: platformName });
};

const systemThemeListen = async () => {
  await appWindow.onThemeChanged(({ payload: theme }) => {
    if (appTheme.value === 'auto') {
      const themeMode = theme === 'dark' ? 'dark' : '';
      document.documentElement.setAttribute('theme-mode', themeMode);
      console.log(`system-theme-updated: ${theme}`);
    }
  });
};

const initAgreementMask = async () => {
  const res = await setting.get('agreementMask');
  formDialogPrivacyPolicy.value = !res;
};

const initPlayerSetting = async () => {
  const init = {
    ...PLAY_CONFIG.setting,
  };
  init.broadcasterType = await setting.get('broadcasterType');
  init.skipStartEnd = await setting.get('skipStartEnd');
  storePlayer.updateConfig({ setting: init });
};
</script>
