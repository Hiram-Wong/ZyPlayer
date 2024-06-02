import { useBroadcastChannel } from '@vueuse/core';
import { watch } from 'vue';

// 根据 key 更新 state 的值，特别处理 Map 类型的字段
const changeState = (state, key, value) => {
  if (state[key] instanceof Map) {
    state[key] = Array.isArray(value) ? new Map(value) : new Map(Object.entries(value));
  } else {
    state[key] = value;
  }
};

// 将包含 Map 的对象转换为普通对象形式
const cloneToObject = (obj) => {
  if (obj instanceof Map) {
    return Object.fromEntries(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(cloneToObject);
  } else if (obj instanceof Object) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, cloneToObject(value)]));
  }
  return obj;
};

// 自定义序列化方法，特别处理 Map 类型的字段
const stringify = (obj) => JSON.stringify(cloneToObject(obj));

export function createSyncPlugin() {
  return ({ store }) => {
    const { data, post } = useBroadcastChannel({ name: `pinia-sync-${store.$id}` });

    // 监听来自其他窗口的消息并更新 store
    watch(data, (newValue) => {
      if (newValue) {
        const parsedData = JSON.parse(newValue as string);
        Object.entries(parsedData).forEach(([key, value]) => {
          changeState(store.$state, key, value);
        });
        // store.$patch(parsedData);
      }
    });

    // 监听本窗口内的 store 变化并广播消息
    store.$subscribe((_mutation, state) => {
      const deserializeData = stringify(state);
      post(deserializeData);
    });
  };
}
