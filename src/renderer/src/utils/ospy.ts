import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';

import OSpy from '@huolala-tech/page-spy-plugin-ospy';

import { t } from '@/locales';
import { useSettingStore } from '@/store';

let oSpy: OSpy | null = null;

export const start = () => {
  if (oSpy) return;

  const storeSetting = useSettingStore();

  oSpy = new OSpy({
    lang: storeSetting.displayLang.includes('zh') ? 'zh' : 'en',
    title: t('common.debug'),
    primaryColor: 'var(--td-brand-color-active)',
  });
};

export const stop = () => {
  if (!oSpy) return;

  try {
    oSpy?.abort?.();
  } catch {}
  oSpy = null;
};
