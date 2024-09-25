import {
  MovieClapperIcon,
  Tv1Icon,
  CloudIcon,
  ViewInArIcon,
  DataDisplayIcon,
  Setting1Icon,
  FillColor1Icon,
  PlayCircleStrokeIcon,
} from 'tdesign-icons-vue-next';

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
      icon: MovieClapperIcon,
    },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/Film.vue'),
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
      icon: Tv1Icon,
    },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/Iptv.vue'),
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
      icon: CloudIcon,
    },
    children: [
      {
        path: 'index',
        name: 'DriveIndex',
        component: () => import('@/pages/Drive.vue'),
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
      icon: PlayCircleStrokeIcon,
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'PlayIndex',
        component: () => import('@/pages/Play.vue'),
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
      icon: ViewInArIcon,
    },
    children: [
      {
        path: 'index',
        name: 'AnalyzeIndex',
        component: () => import('@/pages/Analyze.vue'),
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
      icon: DataDisplayIcon,
    },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/Chase.vue'),
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
      icon: Setting1Icon,
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/Setting.vue'),
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
      icon: FillColor1Icon,
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'TestIndex',
        component: () => import('@/pages/Test.vue'),
      },
    ],
  },
];
