<template>
  <div class="quick-menu__theme">
    <t-dropdown trigger="click">
      <t-button theme="default" shape="square" class="btn">
        <template #icon>
          <component :is="themeIcon" />
        </template>
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item
          v-for="item in THEME_OPTIONS"
          :key="item.value"
          :value="item.value"
          :active="theme === item.value"
          @click="setTheme(item.value as ITheme)"
        >
          <component :is="item.icon" size="large" />
          <span class="theme-title">{{ item.label }}</span>
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuTheme',
});

import type { ITheme } from '@shared/config/theme';
import { THEME } from '@shared/config/theme';
import { ContrastIcon, ModeDarkIcon, ModeLightIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';

import { putSetting } from '@/api/setting';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const THEME_OPTIONS = computed(() => [
  { value: THEME.SYSTEM, label: t('common.followSystem'), icon: ContrastIcon },
  { value: THEME.LIGHT, label: t('common.theme.light'), icon: ModeLightIcon },
  { value: THEME.DARK, label: t('common.theme.dark'), icon: ModeDarkIcon },
]);
const theme = computed(() => storeSetting.theme);
const themeIcon = computed(() => {
  return THEME_OPTIONS.value.find((item) => item.value === theme.value)?.icon;
});

const setTheme = async (theme: ITheme) => {
  storeSetting.updateConfig({ theme });

  await putSetting({ key: 'theme', value: theme });
};
</script>
<style lang="less" scoped>
.theme-title {
  margin-left: var(--td-comp-margin-xs);
}
</style>
