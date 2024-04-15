<template>
	<div class="system-config" @click="gotoSetting">
    <t-button theme="default" shape="square" variant="text">
      <setting-icon />
    </t-button>
	</div>
</template>

<script setup lang="ts">
import { SettingIcon } from 'tdesign-icons-vue-next';
import { useRoute, useRouter } from 'vue-router';

import { useSettingStore } from '@/store';

const router = useRouter();
const route = useRoute();
const storeSetting = useSettingStore();

const gotoSetting = () => {
  const view_name = route.name;
  const Match = {
    FilmIndex: 'siteSource',
    IptvIndex: 'iptvSource',
    DriveIndex: 'driveSource',
    AnalyzeIndex: 'analyzeSource',
  }
  const defaultConfigSwitch = 'configBase'; // 设置一个默认值，用于处理不在 Match 中的 view_name
  const sysConfigSwitch = Match[view_name] || defaultConfigSwitch;
  storeSetting.updateConfig({ sysConfigSwitch });
  console.log(storeSetting.getSysConfigSwitch);
  router.push({ name: 'SettingIndex' });
}
</script>