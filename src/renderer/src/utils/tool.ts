import { isPositiveFiniteNumber } from '@shared/modules/validate';

import { useBrowserStore, usePlayerStore, useSettingStore } from '@/store';

export const getPinia = (store: string, key: string): any => {
  switch (store) {
    case 'browser': {
      const storePlay = useBrowserStore();
      return storePlay[key] || null;
    }
    case 'play': {
      const storePlay = usePlayerStore();
      return storePlay[key] || null;
    }
    case 'setting': {
      const storeSetting = useSettingStore();
      return storeSetting[key] || null;
    }
    default:
      return null;
  }
};

/**
 * Get timeout value
 * Priority: Current > Option > Database > Default
 * @param timeout Current timeout(ms)
 * @param optionTimeout Option timeout(ms)
 * @returns Timeout(ms)
 */
export const getTimeout = (timeout?: number, optionTimeout?: number): number => {
  const MAX_TIMEOUT = 60 * 1000;
  const MIN_TIMEOUT = 0;
  const DEFAULT_TIMEOUT = 10 * 1000;

  const storeTimeout = Number.parseInt(String(getPinia('setting', 'timeout')));

  const isVisable = (val?: number): boolean => {
    if (isPositiveFiniteNumber(val) && val! >= MIN_TIMEOUT && val! <= MAX_TIMEOUT) {
      return true;
    }
    return false;
  };

  if (isVisable(timeout)) return timeout as number;
  if (isVisable(optionTimeout)) return optionTimeout as number;
  if (isVisable(storeTimeout)) return storeTimeout as number;

  return DEFAULT_TIMEOUT;
};
