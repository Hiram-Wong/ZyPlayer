import { RouteRecordName, LocationQueryRaw } from 'vue-router';
import STYLE_CONFIG from '@/config/style';

export interface MenuRoute {
  path: string;
  title?: string;
  name?: string;
  icon?:
    | string
    | {
        render: () => void;
      };
  redirect?: string;
  children: MenuRoute[];
  meta: any;
}

export type ModeType = 'dark' | 'light';

export type SettingType = typeof STYLE_CONFIG;

export type ClassName = { [className: string]: any } | ClassName[] | string;

export type CommonObjType = {
  [key: string]: string | number;
};

export interface NotificationItem {
  id: string;
  content: string;
  type: string;
  status: boolean;
  collected: boolean;
  date: string;
  quality: string;
}

export interface TRouterInfo {
  path: string;
  query?: LocationQueryRaw;
  routeIdx?: number;
  title?: string;
  name?: RouteRecordName;
  isAlive?: boolean;
  isHome?: boolean;
  meta?: any;
}

export interface TTabRouterType {
  isRefreshing: boolean;
  tabRouterList: Array<TRouterInfo>;
}
