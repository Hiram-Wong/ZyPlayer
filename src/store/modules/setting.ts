import { defineStore } from 'pinia';
import { Color } from 'tvision-color';
import STYLE_CONFIG from '@/config/style';
import { insertThemeStylesheet, generateColorMap } from '@/lib/utils/color';
import { store } from '@/store';

const state = {
  ...STYLE_CONFIG,
};

export type TState = typeof state;

export const useSettingStore = defineStore('setting', {
  state: () => state,
  getters: {
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
    changeBrandTheme(brandTheme: string) {
      const { colors: newPalette, primary: brandColorIndex } = Color.getColorGradations({
        colors: [brandTheme],
        step: 10,
        remainInput: false, // 是否保留输入 不保留会矫正不合适的主题色
      })[0];
      const { mode } = this;
      const colorMap = generateColorMap(brandTheme, newPalette, mode as 'light' | 'dark', brandColorIndex);

      insertThemeStylesheet(brandTheme, colorMap, mode as 'light' | 'dark');

      document.documentElement.setAttribute('theme-color', brandTheme);
    },
    updateConfig(payload: Partial<TState>) {
      for (const key in payload) {
        if (payload[key] !== undefined) {
          this[key] = payload[key];
        }
        if (key === 'mode') {
          this.changeMode(payload[key]);
        }
        if (key === 'brandTheme') {
          this.changeBrandTheme(payload[key]);
        }
      }
    },
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
