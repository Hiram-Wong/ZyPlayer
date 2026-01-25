import type { ITheme } from '@shared/config/theme';
import type { ILang } from '@shared/locales';

export interface IStoreSetting {
  theme: ITheme;
  lang: ILang;
  brandTheme: string;
  isSidebarCompact: boolean;
  timeout: number;
  debug: boolean;
  bossKey: string;
  nav: {
    setting: string;
    lab: string;
  };
}

export const init: IStoreSetting = {
  theme: 'system',
  lang: 'system',
  brandTheme: '#85d46e',
  isSidebarCompact: false,
  timeout: 5000,
  debug: false,
  bossKey: '',
  nav: {
    setting: 'baseConfig',
    lab: 'crypto',
  },
};

export default init;
