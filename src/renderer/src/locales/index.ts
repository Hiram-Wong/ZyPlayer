import type { ILangWithoutSystem } from '@shared/locales';
import { defaultLocale, fallbackLocale, lang, langCode, messages } from '@shared/locales';
import { usePreferredLanguages } from '@vueuse/core';
import { computed } from 'vue';
import type { Composer } from 'vue-i18n';
import { createI18n } from 'vue-i18n';

const importMessages = computed(() => messages());

export const defaultLang = (value?: ILangWithoutSystem | 'system'): ILangWithoutSystem => {
  let lang = value;

  if (!lang) {
    try {
      const store = localStorage.getItem('setting');
      if (store) {
        const parsed = JSON.parse(store);
        lang = parsed.lang;
      }
    } catch {}
  }

  if (!lang || lang === 'system') {
    const languages = usePreferredLanguages();
    const preferred = languages.value[0];
    lang = preferred as ILangWithoutSystem;
  }

  if (!langCode.includes(lang as ILangWithoutSystem)) {
    lang = defaultLocale;
  }

  return lang as ILangWithoutSystem;
};

export const i18n = createI18n({
  legacy: false,
  locale: defaultLang(),
  fallbackLocale,
  messages: importMessages.value,
  globalInjection: true,
});

export const langList = computed(() => lang());

export { langCode } from '@shared/locales';

// export const { t }: { t: Composer['t'] } = i18n.global;
export const t: Composer['t'] = i18n.global.t;

export default i18n;
