import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import type { IThemeWithoutSystem } from '@shared/config/theme';
import { THEME } from '@shared/config/theme';
import type { ILangWithoutSystem } from '@shared/locales';
import { defaultLocale } from '@shared/locales';
import { usePreferredDark, usePreferredLanguages } from '@vueuse/core';
import { cloneDeep } from 'es-toolkit';
import type { PiniaPluginContext } from 'pinia';
import { defineStore } from 'pinia';

import type { IStoreSetting } from '@/config/setting';
import SYSTEM_CONFIG from '@/config/setting';
import i18n, { langCode } from '@/locales';
import { store } from '@/store';

const state: IStoreSetting = cloneDeep(SYSTEM_CONFIG);

export const useSettingStore = defineStore('setting', {
  state: () => state,
  getters: {
    displayTheme: (state): IThemeWithoutSystem => {
      let theme = state.theme;

      if (theme === THEME.SYSTEM) {
        const isDark = usePreferredDark();
        theme = isDark.value ? THEME.DARK : THEME.LIGHT;
      }

      return theme;
    },
    displayLang: (state): ILangWithoutSystem => {
      let lang = state.lang;

      if (lang === 'system') {
        const languages = usePreferredLanguages();
        lang = languages.value[0] as ILangWithoutSystem;
      }

      lang = langCode.includes(lang) ? lang : defaultLocale;

      return lang;
    },
    isChinaMainland: (state): boolean => {
      let lang = state.lang;

      if (lang === 'system') {
        const languages = usePreferredLanguages();
        lang = languages.value[0] as ILangWithoutSystem;
      }

      lang = langCode.includes(lang) ? lang : defaultLocale;

      return lang === 'zh-CN';
    },
  },
  actions: {
    changePreferredTheme() {
      const theme = this.displayTheme;

      document.documentElement.setAttribute('theme-mode', theme);
    },
    changePreferredLang() {
      const lang = this.displayLang;

      i18n.global.locale.value = lang;
      document.documentElement.setAttribute('lang', lang);

      window.electron.ipcRenderer.invoke(IPC_CHANNEL.CHANGE_LANG, lang);
    },
    changePreferredBossKey() {
      const bossKey = this.bossKey;

      window.electron.ipcRenderer.invoke(
        IPC_CHANNEL.SHORTCUT_REGISTER,
        'bossKey',
        { type: 'global', shortcut: bossKey, handler: 'bossKey' },
        true,
      );
    },
    updateConfig(payload: Partial<IStoreSetting>) {
      for (const key in payload) {
        if (payload[key] !== undefined) {
          this[key] = payload[key];
        }

        if (key === 'theme') {
          this.changePreferredTheme();
        }
        if (key === 'lang') {
          this.changePreferredLang();
        }
        if (key === 'bossKey') {
          this.changePreferredBossKey();
        }
      }
    },
  },
  persist: {
    beforeHydrate: (context: PiniaPluginContext) => {
      const key = context.store.$id;
      const state = context.store.$state;

      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(state));
      }
    },
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
