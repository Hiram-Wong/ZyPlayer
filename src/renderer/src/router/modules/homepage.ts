import Layout from '@/layouts/index.vue';
import { isProd } from '@/utils/systeminfo';

export default [
  {
    path: '/',
    name: 'Base',
    redirect: '/film',
    component: Layout,
    children: [
      {
        path: 'film',
        name: 'Film',
        meta: {
          title: {
            'zh-CN': '影视',
            'zh-TW': '影視',
            'en-US': 'Film',
          },
          icon: 'movie-clapper',
        },
        component: () => import('@/pages/film/index.vue'),
      },
      {
        path: 'live',
        name: 'Live',
        meta: {
          title: {
            'zh-CN': '直播',
            'zh-TW': '直播',
            'en-US': 'Live',
          },
          icon: 'tv-1',
        },
        component: () => import('@/pages/live/index.vue'),
      },
      {
        path: 'parse',
        name: 'Parse',
        meta: {
          title: {
            'zh-CN': '解析',
            'zh-TW': '解析',
            'en-US': 'Parse',
          },
          icon: 'view-in-ar',
        },
        component: () => import('@/pages/parse/index.vue'),
      },
      {
        path: 'moment',
        name: 'Moment',
        meta: {
          title: {
            'zh-CN': '过刻',
            'zh-TW': '過刻',
            'en-US': 'Moment',
          },
          icon: 'compass',
        },
        component: () => import('@/pages/moment/index.vue'),
      },
      {
        path: 'test',
        name: 'Test',
        meta: {
          title: {
            'zh-CN': '测试',
            'zh-TW': '測試',
            'en-US': 'Test',
          },
          icon: 'fill-color-1',
          hidden: isProd,
        },
        component: () => import('@/pages/test/index.vue'),
      },
      {
        path: 'lab',
        name: 'Lab',
        meta: {
          title: {
            'zh-CN': '实验室',
            'zh-TW': '實驗室',
            'en-US': 'Lab',
          },
          icon: 'extension',
          position: 'bottom',
        },
        component: () => import('@/pages/lab/index.vue'),
      },
      {
        path: 'setting',
        name: 'Setting',
        meta: {
          title: {
            'zh-CN': '设置',
            'zh-TW': '設置',
            'en-US': 'Setting',
          },
          icon: 'setting-1',
          position: 'bottom',
        },
        component: () => import('@/pages/setting/index.vue'),
      },
    ],
  },
  {
    path: '/player',
    name: 'Player',
    meta: {
      title: {
        'zh-CN': '播放',
        'zh-TW': '播放',
        'en-US': 'Play',
      },
      icon: 'play-circle-stroke',
      hidden: true,
    },
    component: () => import('@/pages/player/index.vue'),
  },
  {
    path: '/browser',
    name: 'Browser',
    meta: {
      title: {
        'zh-CN': '浏览',
        'zh-TW': '瀏覽',
        'en-US': 'Browse',
      },
      icon: 'logo-chrome',
      hidden: true,
    },
    component: () => import('@/pages/browser/index.vue'),
  },
];
