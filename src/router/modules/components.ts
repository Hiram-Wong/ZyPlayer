import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/film',
    name: 'film',
    redirect: '/film/index',
    component: Layout,
    meta: { title: '影视', icon: 'theater' },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/Film.vue'),
        meta: { title: '影视', icon: 'theater' },
      },
    ],
  },
  {
    path: '/iptv',
    name: 'iptv',
    redirect: '/iptv/index',
    component: Layout,
    meta: { title: '直播', icon: 'tv' },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/Iptv.vue'),
        meta: { title: '直播', icon: 'tv' },
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
    meta: { title: '解析', icon: 'internal-data' },
    children: [
      {
        path: 'index',
        name: 'AnalyzeIndex',
        component: () => import('@/pages/Analyze.vue'),
        meta: { title: '解析', icon: 'internal-data' },
      },
    ],
  },
  {
    path: '/community/',
    name: 'Community',
    redirect: '/community/index',
    component: Layout,
    meta: { title: '社区', icon: 'books', hidden: true },
    children: [
      {
        path: 'index',
        name: 'CommunityIndex',
        component: () => import('@/pages/Community.vue'),
        meta: { title: '社区', icon: 'books' },
      },
    ],
  },
  {
    path: '/chase',
    name: 'Chase',
    redirect: '/chase/index',
    component: Layout,
    meta: { title: '过刻', icon: 'time' },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/Chase.vue'),
        meta: { title: '过刻', icon: 'time' },
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    redirect: '/setting/index',
    meta: { title: '设置', icon: 'setting-two' },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/Setting.vue'),
        meta: { title: '设置', icon: 'setting-two' },
      },
    ],
  },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: '/test/index',
    meta: { title: '测试', icon: 'experiment-one', hidden: true },
    children: [
      {
        path: 'index',
        name: 'TestIndex',
        component: () => import('@/pages/Test.vue'),
        meta: { title: '设置', icon: 'experiment-one' },
      },
    ],
  },
];
