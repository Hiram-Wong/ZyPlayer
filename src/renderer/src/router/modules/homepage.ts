import {
  ExtensionIcon,
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
        component: () => import('@/pages/film/index.vue'),
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
        en_US: 'Iptv',
      },
      icon: Tv1Icon,
    },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/iptv/index.vue'),
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
        component: () => import('@/pages/drive/index.vue'),
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
        component: () => import('@/pages/play/index.vue'),
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
        component: () => import('@/pages/analyze/index.vue'),
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
        component: () => import('@/pages/chase/index.vue'),
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
        component: () => import('@/pages/setting/index.vue'),
      },
    ],
  },
  {
    path: '/lab',
    name: 'lab',
    component: Layout,
    redirect: '/lab/index',
    meta: {
      title: {
        zh_CN: '实验室',
        en_US: 'Lab',
      },
      icon: ExtensionIcon,
      hidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'LabIndex',
        component: () => import('@/pages/lab/index.vue'),
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
        component: () => import('@/pages/test/index.vue'),
      },
    ],
  },
];
