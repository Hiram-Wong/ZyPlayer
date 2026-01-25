import icon360 from '@/assets/platform/icon/360.svg?raw';
import iconBilibili from '@/assets/platform/icon/bilibili.svg?raw';
import iconIqiyi from '@/assets/platform/icon/iqiyi.svg?raw';
import iconLe from '@/assets/platform/icon/le.svg?raw';
import iconMgtv from '@/assets/platform/icon/mgtv.svg?raw';
import iconPptv from '@/assets/platform/icon/pptv.svg?raw';
import iconSohu from '@/assets/platform/icon/sohu.svg?raw';
import iconTencent from '@/assets/platform/icon/tencent.svg?raw';
import iconYouku from '@/assets/platform/icon/youku.svg?raw';
import logo360 from '@/assets/platform/logo/360.svg?raw';
import logoBilibili from '@/assets/platform/logo/bilibili.svg?raw';
import logoIqiyi from '@/assets/platform/logo/iqiyi.svg?raw';
import logoLe from '@/assets/platform/logo/le.svg?raw';
import logoMgtv from '@/assets/platform/logo/mgtv.svg?raw';
import logoPptv from '@/assets/platform/logo/pptv.svg?raw';
import logoSohu from '@/assets/platform/logo/sohu.svg?raw';
import logoTencent from '@/assets/platform/logo/tencent.svg?raw';
import logoYouku from '@/assets/platform/logo/youku.svg?raw';

export const china = [
  {
    url: 'https://www.360kan.com',
    host: '360kan.com',
    id: '360',
    img: logo360,
    icon: icon360,
    show: true,
    search: 'https://so.360kan.com/?kw={kw}',
    titleSplit: '',
  },
  {
    url: 'https://www.iqiyi.com',
    host: 'iqiyi.com',
    id: 'iqiyi',
    img: logoIqiyi,
    icon: iconIqiyi,
    show: true,
    search: 'https://www.iqiyi.com/search/{kw}.html',
    titleSplit: '-',
  },
  {
    url: 'https://v.qq.com',
    host: 'v.qq.com',
    id: 'tencent',
    img: logoTencent,
    icon: iconTencent,
    show: true,
    search: 'https://v.qq.com/x/search/?q={kw}',
    titleSplit: '_',
  },
  {
    url: 'https://youku.com',
    host: 'youku.com',
    id: 'youku',
    img: logoYouku,
    icon: iconYouku,
    show: true,
    search: 'https://so.youku.com/search/q_{kw}',
    titleSplit: '-',
  },
  {
    url: 'https://www.mgtv.com',
    host: 'mgtv.com',
    id: 'mgtv',
    img: logoMgtv,
    icon: iconMgtv,
    show: true,
    search: 'https://so.mgtv.com/so?k={kw}',
    titleSplit: '-',
  },
  {
    url: 'https://www.le.com',
    host: 'le.com',
    id: 'letv',
    img: logoLe,
    icon: iconLe,
    show: true,
    search: 'https://so.le.com/s?wd={kw}',
    titleSplit: '-',
  },
  {
    url: 'https://tv.sohu.com',
    host: 'sohu.com',
    id: 'sohu',
    img: logoSohu,
    icon: iconSohu,
    show: true,
    search: 'https://tv.sohu.com/mts/?key={kw}',
    titleSplit: '-',
  },
  {
    url: 'https://www.pptv.com',
    host: 'pptv.com',
    id: 'pptv',
    img: logoPptv,
    icon: iconPptv,
    show: true,
    search: 'https://sou.pptv.com/s_video?kw={kw}',
    titleSplit: '_',
  },
  {
    url: 'https://www.bilibili.com',
    host: 'bilibili.com',
    id: 'bilibili',
    img: logoBilibili,
    icon: iconBilibili,
    show: true,
    search: 'https://search.bilibili.com/all?keyword={kw}',
    titleSplit: '_',
  },
];

export const outher = [
  {
    url: 'https://www.360kan.com',
    host: '360kan.com',
    id: '360',
    img: logo360,
    icon: icon360,
    show: true,
    search: 'https://so.360kan.com/?kw={kw}',
    titleSplit: '',
  },
  {
    url: 'https://www.iq.com',
    host: 'iq.com',
    id: 'iqiyi',
    img: logoIqiyi,
    icon: iconIqiyi,
    show: true,
    search: 'https://www.iq.com/search?query={kw}',
    titleSplit: '–',
  },
  {
    url: 'https://wetv.vip',
    host: 'wetv.vip',
    id: 'tencent',
    img: logoTencent,
    icon: iconTencent,
    show: true,
    search: 'https://wetv.vip/zh-tw/search/{kw}',
    titleSplit: '-',
  },
  {
    url: 'https://youku.tv',
    host: 'youku.tv',
    id: 'youku',
    img: logoYouku,
    icon: iconYouku,
    show: true,
    search: 'https://so.youku.tv/search_video/q_{kw}',
    titleSplit: '-YOUKU',
  },
  {
    url: 'https://w.mgtv.com',
    host: 'w.mgtv.com',
    id: 'mgtv',
    img: logoMgtv,
    icon: iconMgtv,
    show: true,
    search: 'https://w.mgtv.com/so?k={kw}',
    titleSplit: '-MangoTV',
  },
  {
    url: 'https://www.le.com',
    host: 'le.com',
    id: 'letv',
    img: logoLe,
    icon: iconLe,
    show: true,
    search: 'https://so.le.com/s?wd=',
    titleSplit: '-',
  },
  {
    url: 'https://tv.sohu.com',
    host: 'sohu.com',
    id: 'sohu',
    img: logoSohu,
    icon: iconSohu,
    show: true,
    search: 'https://tv.sohu.com/mts/?key={kw}',
    titleSplit: '-',
  },
  {
    url: 'https://www.pptv.com',
    host: 'pptv.com',
    id: 'pptv',
    img: logoPptv,
    icon: iconPptv,
    show: true,
    search: 'https://sou.pptv.com/s_video?kw={kw}',
    titleSplit: '_',
  },
  {
    url: 'https://www.bilibili.tv',
    host: 'bilibili.tv',
    id: 'bilibili',
    img: logoBilibili,
    icon: iconBilibili,
    show: true,
    search: 'https://www.bilibili.tv/en/search-result?q={kw}',
    titleSplit: '- BiliBili',
  },
];
