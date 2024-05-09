import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/film',
    name: 'film',
    redirect: '/film/index',
    component: Layout,
    meta: {
      title: {
        zh_CN: '影视',
        en_US: 'Film',
      },
      icon: 'movie-clapper',
    },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/Film.vue'),
        meta: {
          icon: 'movie-clapper',
          title: {
            zh_CN: '影视',
            en_US: 'Film',
          },
        },
      },
    ],
  },
  {
    path: '/iptv',
    name: 'iptv',
    redirect: '/iptv/index',
    component: Layout,
    meta: {
      title: {
        zh_CN: '电视',
        en_US: 'IPTV',
      },
      icon: 'tv-1',
    },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/Iptv.vue'),
        meta: {
          icon: 'tv-1',
          title: {
            zh_CN: '电视',
            en_US: 'IPTV',
          },
        },
      },
    ],
  },
  {
    path: '/drive',
    name: 'drive',
    redirect: '/drive/index',
    component: Layout,
    meta: {
      title: {
        zh_CN: '网盘',
        en_US: 'Drive',
      },
      icon: 'cloud',
    },
    children: [
      {
        path: 'index',
        name: 'DriveIndex',
        component: () => import('@/pages/Drive.vue'),
        meta: {
          icon: 'cloud',
          title: {
            zh_CN: '网盘',
            en_US: 'Drive',
          },
        },
      },
    ],
  },
  {
    path: '/play',
    name: 'play',
    redirect: '/play/index',
    meta: {
      title: {
        zh_CN: '播放',
        en_US: 'Play',
      },
      icon: 'play-circle-stroke',
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'PlayIndex',
        component: () => import('@/pages/Play.vue'),
        meta: {
          title: {
            zh_CN: '播放',
            en_US: 'Play',
          },
          icon: 'play-circle-stroke',
        },
      },
    ],
  },
  {
    path: '/analyze/',
    name: 'Analyze',
    redirect: '/analyze/index',
    component: Layout,
    meta: {
      title: {
        zh_CN: '解析',
        en_US: 'Analyze',
      },
      icon: 'view-in-ar',
    },
    children: [
      {
        path: 'index',
        name: 'AnalyzeIndex',
        component: () => import('@/pages/Analyze.vue'),
        meta: {
          icon: 'view-in-ar',
          title: {
            zh_CN: '解析',
            en_US: 'Analyze',
          },
        },
      },
    ],
  },
  {
    path: '/chase',
    name: 'Chase',
    redirect: '/chase/index',
    component: Layout,
    meta: {
      title: {
        zh_CN: '过刻',
        en_US: 'Moment',
      },
      icon: 'data-display',
    },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/Chase.vue'),
        meta: {
          icon: 'data-display',
          title: {
            zh_CN: '过刻',
            en_US: 'Moment',
          },
        },
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    redirect: '/setting/index',
    meta: {
      title: {
        zh_CN: '设置',
        en_US: 'Setting',
      },
      icon: 'setting-1',
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/Setting.vue'),
        meta: {
          icon: 'setting-1',
          title: {
            zh_CN: '设置',
            en_US: 'Setting',
          },
        },
      },
    ],
  },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: '/test/index',
    meta: {
      title: {
        zh_CN: '测试',
        en_US: 'Test',
      },
      icon: 'fill-color-1',
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'TestIndex',
        component: () => import('@/pages/Test.vue'),
        meta: {
          title: {
            zh_CN: '测试',
            en_US: 'Test',
          },
          icon: 'fill-color-1',
        },
      },
    ],
  },
];
