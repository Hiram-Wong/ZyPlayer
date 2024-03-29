<template>
  <div class="system-skin">
    <t-popup placement="bottom">
      <template v-if="currentIcon">
        <component :is="currentIcon" size="1.3em" />
      </template>
      <template #content>
        <div class="skin-items">
          <div v-for="(icon, name) in themeIcons" :key="name" class="skin-item" @click="setTheme(name)">
            <component :is="icon" size="large" />
            <div class="skin-title">{{ themeNames[name] }}</div>
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>

<script setup lang="ts">
import { Contrast1Icon, ModeDarkIcon, ModeLightIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';

import { useSettingStore } from '@/store';
import { setDefault } from '@/api/setting';

const theme = computed(() => {
  return storeSetting.getStateMode;
});

const storeSetting = useSettingStore();

const themeIcons = {
  light: ModeLightIcon,
  dark: ModeDarkIcon,
  auto: Contrast1Icon
};

const themeNames = {
  light: '浅色',
  dark: '深色',
  auto: '自动'
};

const currentIcon = computed(() => themeIcons[theme.value]);

const setTheme = (theme: 'light' | 'dark' | 'auto') => {
  setDefault('theme', theme);
  storeSetting.updateConfig({ mode: theme });
};
</script>

<style lang="less" scoped>
.skin-items {
  display: flex;
  .skin-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px;
  }
}
</style>