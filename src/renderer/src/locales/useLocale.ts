import type { ILangWithoutSystem } from '@shared/locales';
import type { GlobalConfigProvider } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { defaultLang, i18n } from '@/locales/index';

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' });
  function changeLocale(value: ILangWithoutSystem) {
    const lang = defaultLang(value);
    locale.value = lang;
  }

  const getComponentsLocale = computed(() => {
    // @ts-expect-error `getLocaleMessage` is a method from vue-i18n
    return i18n.global.getLocaleMessage(locale.value).componentsLocale as GlobalConfigProvider;
  });

  return {
    changeLocale,
    getComponentsLocale,
    locale,
  };
}
