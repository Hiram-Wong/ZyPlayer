import { cloneDeep } from 'es-toolkit';
import type { PiniaPluginContext } from 'pinia';
import { defineStore } from 'pinia';

import type { IStorePlayer } from '@/config/player';
import PLAY_CONFIG from '@/config/player';
import { store } from '@/store';

const state: IStorePlayer = cloneDeep(PLAY_CONFIG);

export const usePlayerStore = defineStore('play', {
  state: () => state,
  getters: {},
  actions: {
    updateConfig(payload: Partial<IStorePlayer>) {
      for (const key in payload) {
        if (payload[key] !== undefined) {
          this[key] = payload[key];
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

export function getPlayStore() {
  return usePlayerStore(store);
}
