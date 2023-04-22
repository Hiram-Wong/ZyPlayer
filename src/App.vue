<template>
  <router-view></router-view>
  <privacy-policy-view v-model:visible="formDialogPrivacyPolicy" />
</template>

<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron';
import { computed, onMounted, ref } from 'vue';

import PLAY_CONFIG from '@/config/play';
import { setting } from '@/lib/dexie';
import PrivacyPolicyView from '@/pages/PrivacyPolicy.vue';
import { usePlayStore, useSettingStore } from '@/store';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const ipcRenderer = useIpcRenderer();

const formDialogPrivacyPolicy = ref(false);

const theme = computed(() => {
  return storeSetting.getStateMode;
});

onMounted(() => {
  initTheme();
  initAgreementMask();
  initPlayerSetting();
});

const initTheme = async () => {
  const res = await setting.get('theme');
  storeSetting.updateConfig({ mode: res });
};

ipcRenderer.on('system-theme-updated', (_, activeTheme) => {
  if (theme.value === 'auto') {
    const themeMode = activeTheme === 'dark' ? 'dark' : '';
    document.documentElement.setAttribute('theme-mode', themeMode);
    console.log(`system-theme-updated: ${activeTheme}`);
  }
});

const initAgreementMask = async () => {
  const res = await setting.get('agreementMask');
  formDialogPrivacyPolicy.value = !res;
};

const initPlayerSetting = async () => {
  const init = {
    ...PLAY_CONFIG.setting,
  };

  init.softSolution = await setting.get('softSolution');
  init.pauseWhenMinimize = await setting.get('pauseWhenMinimize');
  const isSkip = await setting.get('skipStartEnd');
  init.skipStartEnd = isSkip;

  if (isSkip) {
    init.skipTimeInStart = await setting.get('skipTimeInStart');
    init.skipTimeInEnd = await setting.get('skipTimeInEnd');
  }

  storePlayer.updateConfig({ setting: init });
};
</script>
