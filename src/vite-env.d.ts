/// <reference types="vite/client" />

// https://cn.vitejs.dev/guide/env-and-mode.html#env-files
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}
