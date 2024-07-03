// 通用声明
import { HTMLTitleBarElementAttributes } from '@electron-uikit/titlebar/renderer';

export {};

// Vue
declare module '*.vue' {
  import { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare type ClassName = { [className: string]: any } | ClassName[] | string;

declare module '*.svg' {
  const CONTENT: string;
  export default CONTENT;
}

declare type Recordable<T = any> = Record<string, T>;

declare global {
  interface Window {
    removeLoading: () => void;
  }
  namespace JSX {
    interface IntrinsicElements {
      // Define an interface for the web component props
      'title-bar': Partial<HTMLTitleBarElementAttributes>;
    }
  }
}
