import Layout from '@/layouts/index.vue';

export default [
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
    ]
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
    ]
  }
];
