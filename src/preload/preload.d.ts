import type { ElectronAPI } from '@electron-toolkit/preload';

import type { WindowApiType } from './index';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: WindowApiType;
    removeLoading: () => void;
  }
}
