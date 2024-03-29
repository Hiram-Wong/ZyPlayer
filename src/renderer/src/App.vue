<template>
  <router-view></router-view>
  <disclaimer-view v-model:visible="isVisible.dialogDisclaimer" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { setup } from '@/api/setting';
import DisclaimerView from '@/pages/Disclaimer.vue';
import { useSettingStore } from '@/store';

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
  const { agreementMask, theme } = await setup();

  storeSetting.updateConfig({ mode: theme });
  isVisible.dialogDisclaimer = !agreementMask;
}

window.electron.ipcRenderer.on('system-theme-updated', (_, activeTheme) => {
  if (theme.value === 'auto') {
    const themeMode = activeTheme === 'dark' ? 'dark' : '';
    document.documentElement.setAttribute('theme-mode', themeMode);
    console.log(`system-theme-updated: ${activeTheme}`);
  }
})
</script>
