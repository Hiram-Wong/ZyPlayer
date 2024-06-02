import { useBroadcastChannel } from '@vueuse/core';
import { watch } from 'vue';

export function createSyncPlugin() {
  return ({ store }) => {
    const { data, post } = useBroadcastChannel({ name: `pinia-sync-${store.$id}` });

    // 监听来自其他窗口的消息并更新 store
    watch(data, (newValue) => {
      if (newValue) {
        const parsedData = JSON.parse(newValue as string);
        store.$patch(parsedData);
      }
    });

    // 监听本窗口内的 store 变化并广播消息
    store.$subscribe((_mutation, state) => {
      const deserializeData = JSON.stringify(state);
      post(deserializeData);
    });
  };
}
