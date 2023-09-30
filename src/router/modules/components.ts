import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/film',
    name: 'film',
    redirect: '/film/index',
    component: Layout,
    meta: { title: '影视', icon: 'movie-clapper' },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/Film.vue'),
        meta: { title: '影视', icon: 'movie-clapper' },
      },
    ],
  },
  {
    path: '/iptv',
    name: 'iptv',
    redirect: '/iptv/index',
    component: Layout,
    meta: { title: '电视', icon: 'tv-1' },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/Iptv.vue'),
        meta: { title: '电视', icon: 'tv-1' },
      },
    ],
  },
  {
    path: '/drive',
    name: 'drive',
    redirect: '/drive/index',
    component: Layout,
    meta: { title: '网盘', icon: 'cloud' },
    children: [
      {
        path: 'index',
        name: 'DriveIndex',
        component: () => import('@/pages/Drive.vue'),
        meta: { title: '网盘', icon: 'cloud' },
      },
    ],
  },
  {
    path: '/play/',
    name: 'play',
    redirect: '/play/index',
    meta: { title: '播放', icon: 'play-circle-stroke', hidden: true },
    children: [
      {
        path: 'index',
        name: 'PlayIndex',
        component: () => import('@/pages/Play.vue'),
        meta: { title: '播放', icon: 'play-circle-stroke' },
      },
    ],
  },
  {
    path: '/analyze/',
    name: 'Analyze',
    redirect: '/analyze/index',
    component: Layout,
    meta: { title: '解析', icon: 'view-in-ar' },
    children: [
      {
        path: 'index',
        name: 'AnalyzeIndex',
        component: () => import('@/pages/Analyze.vue'),
        meta: { title: '解析', icon: 'view-in-ar' },
      },
    ],
  },
  {
    path: '/community/',
    name: 'Community',
    redirect: '/community/index',
    component: Layout,
    meta: { title: '社区', icon: 'chat-bubble-smile', hidden: true },
    children: [
      {
        path: 'index',
        name: 'CommunityIndex',
        component: () => import('@/pages/Community.vue'),
        meta: { title: '社区', icon: 'chat-bubble-smile' },
      },
    ],
  },
  {
    path: '/chase',
    name: 'Chase',
    redirect: '/chase/index',
    component: Layout,
    meta: { title: '过刻', icon: 'data-display' },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/Chase.vue'),
        meta: { title: '过刻', icon: 'data-display' },
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    redirect: '/setting/index',
    meta: { title: '设置', icon: 'setting-1' },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/Setting.vue'),
        meta: { title: '设置', icon: 'setting-1' },
      },
    ],
  },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: '/test/index',
    meta: { title: '测试', icon: 'fill-color-1', hidden: true },
    children: [
      {
        path: 'index',
        name: 'TestIndex',
        component: () => import('@/pages/Test.vue'),
        meta: { title: '设置', icon: 'fill-color-1' },
      },
    ],
  },
];
