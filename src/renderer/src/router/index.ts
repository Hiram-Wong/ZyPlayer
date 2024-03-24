import uniq from 'lodash/uniq';
import { createRouter, createWebHashHistory, RouteRecordRaw, useRoute } from 'vue-router';

// 导入homepage相关固定路由
const homepageModules = import.meta.glob('./modules/**/homepage.ts', { eager: true });

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob('./modules/**/!(homepage).ts', { eager: true });

// 其他固定路由
const defaultRouterList: Array<any> = [
  {
    path: '/',
    redirect: '/film/index',
    component: () => import('@/layouts/blank.vue'),
  },
  {
    path: '/:w+',
    name: '404Page',
    redirect: '/result/404',
  },
];

// 存放固定路由
export const homepageRouterList: Array<RouteRecordRaw> = mapModuleRouterList(homepageModules);
export const fixedRouterList: Array<RouteRecordRaw> = mapModuleRouterList(fixedModules);

export const allRoutes = [...homepageRouterList, ...fixedRouterList, ...defaultRouterList];

// 固定路由模块转换为路由
// 关于单层路由，meta 中设置 { single: true } 即可为单层路由，{ hidden: true } 即可在侧边栏隐藏该路由
export function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-ignore
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

export const getRoutesExpanded = () => {
  const expandedRoutes: Array<string> = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3): string => {
  const route = useRoute();
  console.log(route)
  if (!route.path) {
    return '';
  }
  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('');
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
