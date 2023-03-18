<template>
  <router-view :class="[mode]"></router-view>
  <privacy-policy-view v-model:visible="formDialogPrivacyPolicy" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PrivacyPolicyView from '@/pages/PrivacyPolicy.vue';
import { useSettingStore, usePlayStore } from '@/store';
import { setting } from '@/lib/dexie';

import PLAY_CONFIG from '@/config/play';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const formDialogPrivacyPolicy = ref(false);

const mode = computed(() => {
  return storeSetting.displayMode;
});

onMounted(() => {
  initTheme();
  initAgreementMask();
  initPlayerSetting();
});

const initTheme = () => {
  setting.get('theme').then((res: 'dark' | 'light' | 'auto') => {
    storeSetting.updateConfig({ mode: res });
  });
};

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

// 注入自执行匿名函数来检测系统外观变化
(() => {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const status = !!e.matches;
      if (status) {
        storeSetting.updateConfig({ mode: 'dark' });
      } else {
        storeSetting.updateConfig({ mode: 'light' });
      }
    });
  }
})();
</script>
