<template>
  <div class="language">
    <t-dropdown trigger="click">
      <t-button theme="default" shape="square" variant="text">
        <translate-icon />
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item v-for="(lang, index) in langList" :key="index" :value="lang.value"
          @click="(options) => changeLang(options.value as string)">
          {{ lang.content }}
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>

<script setup lang="ts">
import { TranslateIcon } from 'tdesign-icons-vue-next';

import { langList } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';

// 切换语言
const { changeLocale } = useLocale();
const changeLang = (lang: string) => {
  changeLocale(lang);
};
</script>

<style lang="less" scoped></style>
