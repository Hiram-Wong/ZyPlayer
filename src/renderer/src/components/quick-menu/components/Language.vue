<template>
  <div class="quick-menu__language">
    <t-dropdown trigger="click">
      <t-button theme="default" shape="square" class="btn">
        <template #icon><translate-icon /></template>
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item
          v-for="item in LANG_OPTIONS"
          :key="item.value"
          :value="item.value"
          :active="theme === item.value"
          @click="setLanguage(item.value as ILang)"
        >
          {{ item.label }}
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuLanguage',
});

import type { ILang } from '@shared/locales';
import { TranslateIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';

import { putSetting } from '@/api/setting';
import { langList, t } from '@/locales';
import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const LANG_OPTIONS = computed(() => [
  { value: 'auto', label: t('common.followSystem') },
  ...langList.value.map((lang) => ({ value: lang.value, label: lang.label })),
]);
const theme = computed(() => storeSetting.displayLang);

const setLanguage = async (lang: ILang) => {
  storeSetting.updateConfig({ lang });

  await putSetting({ key: 'lang', value: lang });
};
</script>
<style lang="less" scoped></style>
