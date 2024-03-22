<template>
  <router-view></router-view>
  <disclaimer-view v-model:visible="isVisible.dialogDisclaimer" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import PLAY_CONFIG from '@/config/play';
import { setup } from '@/api/setting';
import DisclaimerView from '@/pages/Disclaimer.vue';
import { usePlayStore, useSettingStore } from '@/store';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const isVisible = reactive({
  dialogDisclaimer: false
})

const theme = computed(() => {
  return storeSetting.getStateMode;
});

onMounted(() => {
  initConfig();
});

const initConfig = async () => {
  const { agreementMask, theme, skipStartEnd, broadcasterType, externalPlayer, webdev } = await setup();

  storeSetting.updateConfig({ mode: theme });
  storeSetting.updateConfig({ webdev: webdev });
  isVisible.dialogDisclaimer = !agreementMask;

  const init = {
    ...PLAY_CONFIG.setting,
  };
  init.broadcasterType = broadcasterType;
  init.skipStartEnd = skipStartEnd;
  init.externalPlayer = externalPlayer;
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
