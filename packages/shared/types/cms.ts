import type { IModels } from '@shared/types/db';

export type IConstructorOptions = Omit<IModels['site'], 'categories'> & {
  categories: string[];
};

// input options

export type ICmsInitOptions = any;

// export interface ICmsHomeOptions {}

// export interface ICmsHomeVodOptions {}

export interface ICmsCategoryOptions {
  tid: string;
  page?: number;
  extend?: Record<string, string>;
}

export interface ICmsDetailOptions {
  ids: string;
}

export interface ICmsSearchOptions {
  wd: string;
  page?: number;
  quick?: boolean;
}

export interface ICmsPlayOptions {
  flag: string;
  play: string;
}

export type ICmsProxyOptions = Record<string, string>;

export type ICmsRunMianOptions = Record<string, string>;

// output results

export interface ICmsInfoBase {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_blurb: string;
}

export type ICmsInfoBaseWithTag = ICmsInfoBase & {
  vod_tag: 'file' | 'folder' | 'action' | string;
};

export interface ICmsInfoEpisode {
  text: string;
  link: string;
}

export type ICmsInfo = ICmsInfoBase & {
  vod_lang?: string;
  vod_year?: string | number;
  vod_area?: string;
  vod_score?: string;
  vod_state?: string;
  vod_class?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  vod_douban_id?: string;
  vod_douban_type?: string;
  vod_douban_score?: string;
  type_name?: string;
  vod_play_from: string;
  vod_play_url: string;
  vod_episode?: Record<string, Array<ICmsInfoEpisode>>;
};

export type ICmsInit = void;

export interface ICmsHome {
  class: Array<{
    type_id: string;
    type_name: string;
  }>;
  filters: Record<
    string | number,
    Array<{
      key: string;
      name: string;
      value: Array<{
        n: string;
        v: string;
      }>;
    }>
  >;
}

export interface ICmsHomeVod {
  page?: number;
  pagecount?: number;
  total?: number;
  list: Array<ICmsInfoBaseWithTag>;
}

export interface ICmsCategory {
  page?: number;
  pagecount?: number;
  total?: number;
  list: Array<ICmsInfoBaseWithTag>;
}

export interface ICmsDetail {
  page?: number;
  pagecount?: number;
  total?: number;
  list: Array<ICmsInfo>;
}

export interface ICmsSearch {
  page?: number;
  pagecount?: number;
  total?: number;
  list: Array<ICmsInfoBaseWithTag>;
}

export interface ICmsPlay {
  url: string;
  quality?: Array<string | number>;
  jx?: number;
  parse?: number;
  headers?: Record<string, any>;
  script?: {
    runScript?: string;
    initScript?: string;
    customRegex?: string;
    snifferExclude?: string;
  };
}

export type ICmsProxy = [number, string, string] | [];

export type ICmsRunMian = any;

export interface IRecMatch {
  vod_douban_id: string;
  vod_douban_type: string;
  vod_pic: string;
  vod_name: string;
}

export interface ICms {
  init: () => Promise<void>;
  home: () => Promise<ICmsHome>;
  homeVod: () => Promise<ICmsHomeVod>;
  category: (doc: ICmsCategoryOptions) => Promise<ICmsCategory>;
  detail: (doc: ICmsDetailOptions) => Promise<ICmsDetail>;
  search: (doc: ICmsSearchOptions) => Promise<ICmsSearch>;
  play: (doc: ICmsPlayOptions) => Promise<ICmsPlay>;
  proxy: (doc: ICmsProxyOptions) => Promise<ICmsProxy>;
  runMian: (doc: ICmsRunMianOptions) => Promise<ICmsRunMian>;
}

export type ICmsAdapter = ICms & {
  prepare?: () => Promise<void> | void;
  terminate?: () => Promise<void> | void;
};
