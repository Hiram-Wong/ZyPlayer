import { computed } from 'vue';
import { t } from '@/locales';

import logo360 from '@/assets/platform/logo/360.svg?raw';
import logoIqiyi from '@/assets/platform/logo/iqiyi.svg?raw';
import logoLe from '@/assets/platform/logo/le.svg?raw';
import logoMgtv from '@/assets/platform/logo/mgtv.svg?raw';
import logoPptv from '@/assets/platform/logo/pptv.svg?raw';
import logoSohu from '@/assets/platform/logo/sohu.svg?raw';
import logoTencent from '@/assets/platform/logo/tencent.svg?raw';
import logoYouku from '@/assets/platform/logo/youku.svg?raw';

import icon360 from '@/assets/platform/icon/360.svg?raw';
import iconIqiyi from '@/assets/platform/icon/iqiyi.svg?raw';
import iconLe from '@/assets/platform/icon/le.svg?raw';
import iconMgtv from '@/assets/platform/icon/mgtv.svg?raw';
import iconPptv from '@/assets/platform/icon/pptv.svg?raw';
import iconSohu from '@/assets/platform/icon/sohu.svg?raw';
import iconTencent from '@/assets/platform/icon/tencent.svg?raw';
import iconYouku from '@/assets/platform/icon/youku.svg?raw';

const platform = computed(() => {
  return [
    {
      url: 'https://www.360kan.com',
      host: '360kan.com',
      id: '360',
      name: t('pages.analyze.platform.360'),
      img: logo360,
      icon: icon360,
      show: true,
      search: 'https://so.360kan.com/?kw=',
    },
    {
      url: 'https://www.iqiyi.com',
      host: 'iqiyi.com',
      id: 'iqiyi',
      name: t('pages.analyze.platform.iqiyi'),
      img: logoIqiyi,
      icon: iconIqiyi,
      show: true,
      search: 'https://www.iqiyi.com/so/q_',
    },
    {
      url: 'https://v.qq.com',
      host: 'v.qq.com',
      id: 'tencent',
      name: t('pages.analyze.platform.tencent'),
      img: logoTencent,
      icon: iconTencent,
      show: true,
      search: 'https://v.qq.com/x/search/?q=',
    },
    {
      url: 'https://youku.com',
      host: 'youku.com',
      id: 'youku',
      name: t('pages.analyze.platform.youku'),
      img: logoYouku,
      icon: iconYouku,
      show: true,
      search: 'https://so.youku.com/search/q_',
    },
    {
      url: 'https://www.mgtv.com',
      host: 'mgtv.com',
      id: 'mgtv',
      name: t('pages.analyze.platform.mgtv'),
      img: logoMgtv,
      icon: iconMgtv,
      show: true,
      search: 'https://so.mgtv.com/so?k=',
    },
    {
      url: 'https://www.le.com',
      host:'le.com',
      id: 'letv',
      name: t('pages.analyze.platform.letv'),
      img: logoLe,
      icon: iconLe,
      show: true,
      search: 'https://so.le.com/s?wd=',
    },
    {
      url: 'https://tv.sohu.com',
      host:'sohu.com',
      id: 'sohu',
      name: t('pages.analyze.platform.sohu'),
      img: logoSohu,
      icon: iconSohu,
      show: true,
      search: 'https://so.tv.sohu.com/mts?wd=',
    },
    {
      url: 'https://www.pptv.com',
      host:'pptv.com',
      id: 'pptv',
      name: t('pages.analyze.platform.pptv'),
      img: logoPptv,
      icon: iconPptv,
      show: true,
      search: 'https://sou.pptv.com/s_video?kw=',
    },
  ];
});

export { platform };
