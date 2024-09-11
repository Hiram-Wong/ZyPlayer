import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

import { allRoutes } from '@/router';
import { store } from '@/store';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: [],
    routers: [],
    removeRoutes: [],
  }),
  actions: {
    initRoutes() {
      let accessedRouters: Array<RouteRecordRaw> = allRoutes;
      // @ts-ignore
      this.routers = accessedRouters;
    }
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
