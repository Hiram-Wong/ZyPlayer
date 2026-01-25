import { cloneDeep } from 'es-toolkit';
import type { PiniaPluginContext } from 'pinia';
import { defineStore } from 'pinia';

import type { IBrowser, IBrowserItem } from '@/config/browser';
import BROWSER_CONFIG from '@/config/browser';
import { store } from '@/store';

const state: IBrowser = cloneDeep(BROWSER_CONFIG);

export const useBrowserStore = defineStore('browser', {
  state: () => state,
  getters: {},
  actions: {
    open(doc: IBrowserItem) {
      const upsert = (list: IBrowserItem[], limit: number, mode: 'push' | 'unshift' = 'push') => {
        const idx = list.findIndex((item) => item.id === doc.id);
        if (idx !== -1) list.splice(idx, 1);
        else if (list.length >= limit) list.pop();

        mode === 'push' ? list.push(doc) : list.unshift(doc);
      };

      upsert(this.history, 30, 'unshift');
      upsert(this.tabs, 10, 'push');

      this.activeTab = doc.id;
    },
    close(id: string) {
      const index = this.tabs.findIndex((item) => item.id === id);
      if (index >= 0) this.tabs.splice(index, 1);
    },
    update(doc: IBrowserItem) {
      const updateById = (list: IBrowserItem[]) => {
        const idx = list.findIndex((i) => i.id === doc.id);
        if (idx !== -1) list.splice(idx, 1, doc);
      };

      updateById(this.tabs);
      updateById(this.history);
    },
    clear(type: 'tabs' | 'history' | 'all' = 'all') {
      if (type === 'tabs' || type === 'all') {
        this.tabs = [];
      }
      if (type === 'history' || type === 'all') {
        this.history = [];
      }
    },

    getDetail(id: string | number, type: 'id' | 'idx' = 'id') {
      return type === 'idx' ? this.tabs[id as number] : (this.tabs.find((item) => item.id === id) ?? null);
    },
    isHasTab(id: string) {
      return this.tabs.some((item) => item.id === id);
    },
    getTabIndex(id: string) {
      return this.tabs.findIndex((item) => item.id === id);
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

export function getBrowserStore() {
  return useBrowserStore(store);
}
