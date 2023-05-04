import logoIqiyi from '@/assets/platform/iqiyi.svg?raw';
import logoLe from '@/assets/platform/le.svg?raw';
import logoMgtv from '@/assets/platform/mgtv.svg?raw';
import logoPptv from '@/assets/platform/pptv.svg?raw';
import logoSohu from '@/assets/platform/sohu.svg?raw';
import logoVqq from '@/assets/platform/vqq.svg?raw';
import logoYouku from '@/assets/platform/youku.svg?raw';

export default {
  site: [
    {
      url: 'https://www.iqiyi.com/',
      name: '爱奇艺',
      img: logoIqiyi,
      show: true,
      search: 'https://so.iqiyi.com/so/q_',
    },
    {
      url: 'https://film.qq.com/',
      name: '腾讯视频',
      img: logoVqq,
      show: true,
      search: 'https://v.qq.com/x/search/?q=',
    },
    {
      url: 'https://vip.youku.com/',
      name: '优酷视频',
      img: logoYouku,
      show: true,
      search: 'https://so.youku.com/search_video/q_',
    },
    {
      url: 'https://www.mgtv.com/vip/',
      name: '芒果tv',
      img: logoMgtv,
      show: true,
      search: 'https://so.mgtv.com/so?k=',
    },
    {
      url: 'https://vip.le.com/',
      name: '乐视视频',
      img: logoLe,
      show: true,
      search: 'https://so.le.com/s?wd=',
    },
    {
      url: 'https://film.sohu.com/',
      name: '搜狐视频',
      img: logoSohu,
      show: true,
      search: 'https://so.tv.sohu.com/mts?wd=',
    },
    {
      url: 'https://www.pptv.com/',
      name: 'PPTV',
      img: logoPptv,
      show: true,
      search: 'https://sou.pptv.com/s_video?kw=',
    },
  ],
};
