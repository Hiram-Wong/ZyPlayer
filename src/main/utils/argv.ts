import type { NativeParsedArgs } from '@main/types/argv';
import minimist from 'minimist';

export const parseCLIArgs = (): NativeParsedArgs => {
  return minimist(process.argv, {
    string: ['user-data-dir', 'locale', 'js-flags', 'crash-reporter-directory'],
    boolean: ['disable-chromium-sandbox'],
    default: {
      sandbox: true,
    },
    alias: {
      'no-sandbox': 'sandbox',
    },
  });
};
