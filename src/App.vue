<template>
  <router-view :class="[mode]"></router-view>
  <privacy-policy-view v-model:visible="formDialogPrivacyPolicy" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useIpcRenderer } from '@vueuse/electron';

import PrivacyPolicyView from '@/pages/PrivacyPolicy.vue';
import { useSettingStore, usePlayStore } from '@/store';
import { setting } from '@/lib/dexie';

import PLAY_CONFIG from '@/config/play';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const ipcRenderer = useIpcRenderer();

const formDialogPrivacyPolicy = ref(false);

const mode = computed(() => {
  return storeSetting.displayMode;
});
const theme = ref('');

onMounted(() => {
  initTheme();
  initAgreementMask();
  initPlayerSetting();
});

const initTheme = () => {
  setting.get('theme').then((res: 'dark' | 'light' | 'auto') => {
    theme.value = res;
    storeSetting.updateConfig({ mode: res });
  });
};

ipcRenderer.on('system-theme-updated', (_, ativeTheme) => {
  console.log(`system-theme-updated: ${ativeTheme}`);
  if (theme.value === 'auto') {
    document.documentElement.setAttribute('theme-mode', ativeTheme === 'dark' ? 'dark' : '');
  }
});

const initAgreementMask = () => {
  setting.get('agreementMask').then((res) => {
    formDialogPrivacyPolicy.value = !res;
  });
};

const initPlayerSetting = () => {
  const init = {
    ...PLAY_CONFIG.setting,
  };
  setting.get('softSolution').then((res) => {
    init.softSolution = res;
  });
  setting.get('pauseWhenMinimize').then((res) => {
    init.pauseWhenMinimize = res;
  });

  setting.get('skipStartEnd').then((isSkip) => {
    init.skipStartEnd = isSkip;
    if (isSkip) {
      setting.get('skipTimeInStart').then((res) => {
        init.skipTimeInStart = res;
      });
      setting.get('skipTimeInEnd').then((res) => {
        init.skipTimeInEnd = res;
      });
    }
  });
  storePlayer.updateConfig({ setting: init });
};
</script>
