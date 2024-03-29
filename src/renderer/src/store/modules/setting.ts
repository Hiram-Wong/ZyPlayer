import { defineStore } from 'pinia';

import STYLE_CONFIG from '@/config/style';
import { store } from '@/store';

const state = {
  ...STYLE_CONFIG,
};

export type TState = typeof state;

export const useSettingStore = defineStore('setting', {
  persist: true, // 数据持久化
  state: () => state,
  getters: {
    getStateMode: (state): 'dark' | 'light' | 'auto' => {
      return state.mode as 'dark' | 'light' | 'auto';
    },
    displayMode: (state): 'dark' | 'light' => {
      if (state.mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          return 'dark';
        }
        return 'light';
      }
      return state.mode as 'dark' | 'light';
    },
    getSysConfigSwitch: (state): 'configBase' | 'siteSource' | 'iptvSource' | 'analyzeSource' | 'driveSource' => {
      return state.sysConfigSwitch as 'configBase' | 'siteSource' | 'iptvSource' | 'analyzeSource' | 'driveSource';
    },
  },
  actions: {
    async changeMode(mode: 'dark' | 'light' | 'auto') {
      let theme = mode;

      if (mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          theme = 'dark';
        } else {
          theme = 'light';
        }
      }
      const isDarkMode = theme === 'dark';

      document.documentElement.setAttribute('theme-mode', isDarkMode ? 'dark' : '');
    },
    updateConfig(payload: Partial<TState>) {
      for (const key in payload) {
        if (payload[key] !== undefined) {
          this[key] = payload[key];
        }
        if (key === 'mode') {
          this.changeMode(payload[key]);
        }
      }
    },
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
