import { defineStore } from 'pinia';

import SYSTEM_CONFIG from '@/config/system';
import { store } from '@/store';

import { ModeType } from '@/types/interface';

const state: Record<string, any> = {
  ...SYSTEM_CONFIG,
};

export type TState = typeof state;
export type TStateKey = keyof typeof state;

export const useSettingStore = defineStore('setting', {
  state: () => state,
  getters: {
    getStateMode: (state): ModeType | 'auto' => {
      return state.mode as ModeType | 'auto';
    },
    displayMode: (state): ModeType => {
      if (state.mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          return 'dark';
        }
        return 'light';
      }
      return state.mode as ModeType;
    },
  },
  actions: {
    async changeMode(mode: ModeType | 'auto') {
      let theme = mode;

      if (mode === 'auto') {
        theme = this.getMediaColor();
      }
      const isDarkMode = theme === 'dark';

      document.documentElement.setAttribute('theme-mode', isDarkMode ? 'dark' : '');
    },
    getMediaColor() {
      const media = window.matchMedia('(prefers-color-scheme:dark)');

      if (media.matches) {
        return 'dark';
      }
      return 'light';
    },
    updateConfig(payload: Partial<TState>) {
      for (const key in payload) {
        if (payload[key as TStateKey] !== undefined) {
          this[key as TStateKey] = payload[key as TStateKey];
        }
        if (key === 'mode') {
          this.changeMode(payload[key]);
        }
      }
    },
  },
  share: {
    enable: true,
  },
  // persist: true, // 数据持久化
});

export function getSettingStore() {
  return useSettingStore(store);
}
