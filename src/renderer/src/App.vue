<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view />
    <disclaimer-view type="init" />
  </t-config-provider>
</template>
<script setup lang="ts">
import type { ISetup } from '@shared/config/tblSetting';
import { setupObj as tblSetup } from '@shared/config/tblSetting';
import { onMounted, ref, watch } from 'vue';

import { fetchSetup } from '@/api/setting';
import { useLocale } from '@/locales/useLocale';
import DisclaimerView from '@/pages/Disclaimer.vue';
import { usePlayerStore, useSettingStore } from '@/store';
import { start as startOSpy, stop as stopOSpy } from '@/utils/ospy';
import { start as startVitals, stop as stopVitals } from '@/utils/vitalsObserver';

const storePlayer = usePlayerStore();
const storeSetting = useSettingStore();

const { getComponentsLocale } = useLocale();

const setupConf = ref<ISetup>(tblSetup);

const active = ref({
  disclaimer: false,
});

watch(
  () => ({
    theme: storeSetting.theme,
    lang: storeSetting.lang,
    debug: storeSetting.debug,
  }),
  (val) => {
    if (val.theme !== setupConf.value?.theme) storeSetting.changePreferredTheme();
    if (val.lang !== setupConf.value?.lang) storeSetting.changePreferredLang();
    if (val.debug !== setupConf.value?.debug) debugMode(val.debug);
  },
  { deep: true },
);

onMounted(() => setup());

const setup = () => {
  syncStore();
};

const syncStore = async () => {
  const resp = await fetchSetup();
  const { barrage, bossKey, debug, disclaimer, lang, player, theme, timeout } = resp;

  setupConf.value = resp;

  // privacy policy
  active.value.disclaimer = !disclaimer;

  // setting store sync config
  storeSetting.updateConfig({ bossKey, debug, lang, theme, timeout: timeout || 5000 });
  // play store sync config
  storePlayer.updateConfig({ barrage, player });
};

const debugMode = (type: boolean) => {
  if (type) {
    startVitals();
    startOSpy();
  } else {
    stopVitals();
    stopOSpy();
  }
};
</script>
