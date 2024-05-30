import { defineStore } from 'pinia';

import PLAY_CONFIG from '@/config/play';
import { store } from '@/store';

const state = {
  ...PLAY_CONFIG,
};

export type PlayState = typeof state;

export const usePlayStore = defineStore('play', {
  persist: true, // 数据持久化
  state: () => state,
  getters: {
    getType: (state) => {
      return state.type;
    },
    getSetting: (state) => {
      return state.setting;
    },
    getData: (state) => {
      return state.data;
    },
  },
  actions: {
    updateConfig(payload: Partial<PlayState>) {
      for (const key in payload) {
        if (key === 'type') {
          this.type = payload.type;
        }
        if (key === 'status') {
          this.status = payload.status;
        }
        if (key === 'data') {
          this.data = payload.data;
        }
        if (key === 'setting') {
          this.setting = {
            ...this.setting, // 保留原有的 setting 属性
            ...payload.setting, // 更新传入的 setting 属性
          };
        }
      }
    },
  },
});

export function getPlayStore() {
  return usePlayStore(store);
}
