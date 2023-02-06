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
    getData: (state) => {
      return state.data;
    },
  },
  actions: {
    updateConfig(payload: Partial<PlayState>) {
      this.type = payload.type;
      this.data = payload.data;
    },
  },
});

export function getPlayStore() {
  return usePlayStore(store);
}
