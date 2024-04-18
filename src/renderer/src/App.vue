<template>
  <router-view></router-view>
  <disclaimer-view v-model:visible="isVisible.dialogDisclaimer" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { usePlayStore, useSettingStore } from '@/store';
import { setup } from '@/api/setting';
import { autoSync } from '@/utils/webdev';
import PLAY_CONFIG from '@/config/play';

import DisclaimerView from '@/pages/Disclaimer.vue';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const isVisible = reactive({
  dialogDisclaimer: false
})

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
      intervalId.value = setInterval(() => {
        autoSync(val.data.url, val.data.username, val.data.password);
      }, 1000 * 5 * 60);
    }
  }, { deep : true }
);

onMounted(() => {
  initConfig();
});

const initConfig = async () => {
  const { agreementMask, theme, skipStartEnd, playerMode, webdev } = await setup();

  storeSetting.updateConfig({ mode: theme });
  storeSetting.updateConfig({ webdev: webdev });
  isVisible.dialogDisclaimer = !agreementMask;

  const init = {
    ...PLAY_CONFIG.setting,
  };
  init.playerMode = playerMode;
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
