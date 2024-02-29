<template>
  <router-view></router-view>
  <privacy-policy-view v-model:visible="isVisible.dialogPrivacyPolicy" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import moment from 'moment';
import PLAY_CONFIG from '@/config/play';
import { setup } from '@/api/setting';
import PrivacyPolicyView from '@/pages/PrivacyPolicy.vue';
import { usePlayStore, useSettingStore } from '@/store';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const isVisible = reactive({
  dialogPrivacyPolicy: false
})

const theme = computed(() => {
  return storeSetting.getStateMode;
});

onMounted(() => {
  initConfig();
});

const initConfig = async () => {
  const { agreementMask, theme, skipStartEnd, broadcasterType } = await setup();

  storeSetting.updateConfig({ mode: theme });
  isVisible.dialogPrivacyPolicy = !agreementMask;

  const init = {
    ...PLAY_CONFIG.setting,
  };
  init.broadcasterType = broadcasterType;
  init.skipStartEnd = skipStartEnd;
  storePlayer.updateConfig({ setting: init });
}

window.electron.ipcRenderer.on('system-theme-updated', (_, activeTheme) => {
  if (theme.value === 'auto') {
    const themeMode = activeTheme === 'dark' ? 'dark' : '';
    document.documentElement.setAttribute('theme-mode', themeMode);
    console.log(`system-theme-updated: ${activeTheme}`);
  }
})
</script>
