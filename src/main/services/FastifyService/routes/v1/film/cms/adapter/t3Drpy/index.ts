// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [ChildProcess]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
import { join } from 'node:path';

import { loggerService } from '@logger';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import LruCache from '@shared/modules/lrucache';
import { isJson } from '@shared/modules/validate';
import type {
  ICmsCategory,
  ICmsCategoryOptions,
  ICmsDetail,
  ICmsDetailOptions,
  ICmsHome,
  ICmsHomeVod,
  ICmsInit,
  ICmsPlay,
  ICmsPlayOptions,
  ICmsProxy,
  ICmsProxyOptions,
  ICmsRunMian,
  ICmsRunMianOptions,
  ICmsSearch,
  ICmsSearchOptions,
  IConstructorOptions,
} from '@shared/types/cms';
import type { Pool } from 'workerpool';
import workerpool from 'workerpool';

interface IWorkerOptionsMap {
  init: any;
  home: undefined;
  homeVod: undefined;
  category: ICmsCategoryOptions;
  detail: ICmsDetailOptions;
  play: ICmsPlayOptions;
  search: ICmsSearchOptions;
  proxy: ICmsProxyOptions;
  runMain: ICmsRunMianOptions;
}

interface IWorkerResultMap {
  init: ICmsInit;
  home: ICmsHome;
  homeVod: ICmsHomeVod;
  category: ICmsCategory;
  detail: ICmsDetail;
  play: ICmsPlay & { parse_extra?: string; js?: string; header?: Record<string, any> };
  search: ICmsSearch;
  proxy: ICmsProxy;
  runMain: ICmsRunMian;
}

type IWorkerType = keyof IWorkerOptionsMap;

class WorkerLruCache<K = string, V = Pool> extends LruCache<K, V> {
  put(key: K, value: V): V {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      const pool = this.cache.get(firstKey!);
      (pool as any).terminate(true);
      this.cache.delete(this.cache.keys().next().value!);
    }
    this.cache.set(key, value);
    return value;
  }

  delete(key: K): boolean {
    if (!this.cache.has(key)) return false;

    (this.cache.get(key) as any).terminate(true);

    super.delete(key);
    return true;
  }
}
const cacheQueueSize: number = 6;
const lruCache = new WorkerLruCache(cacheQueueSize);

const logger = loggerService.withContext(SITE_LOGGER_MAP[SITE_TYPE.T3_DRPY]);

class T3DrpyAdapter {
  private id: string = '';
  private ext: string = '';
  private categories: string[] = [];

  constructor(source: IConstructorOptions) {
    this.id = source.id;
    this.ext = source.ext!;
    this.categories = source.categories;
  }

  private async execCtx<T extends IWorkerType>(type: T, options?: IWorkerOptionsMap[T]): Promise<IWorkerResultMap[T]> {
    let pool = lruCache.get(this.id);
    if (!pool) {
      pool = workerpool.pool(join(import.meta.dirname, 'film_cms_adapter_t3_drpy_worker.js'), {
        workerType: 'process',
        maxWorkers: cacheQueueSize,
        forkOpts: { silent: true },
      });
      lruCache.put(this.id, pool);
    }

    const resp = await pool.exec('main', [type, options], {
      on(payload) {
        const { type, level, msg } = payload;

        if (type === 'log') {
          const msgType = msg?.type;
          const msgList = msg?.msg ?? [];

          const log =
            msgType === 'single' ? msgList[0] : msgList.map((t: any) => (isJson(t) ? JSON.stringify(t) : t)).join(' ');

          logger[level](log);
        }
      },
    });

    return resp;
  }

  public async init(): Promise<ICmsInit> {
    await this.execCtx('init', this.ext);
  }

  public async home(): Promise<ICmsHome> {
    const resp = await this.execCtx('home');

    const rawClassList = Array.isArray(resp?.class) ? resp?.class : [];
    const classes = rawClassList
      .map((item) => ({
        type_id: String(item.type_id ?? '').trim(),
        type_name: item.type_name?.toString().trim() ?? '',
      }))
      .filter(
        (item, index, self) =>
          item.type_id &&
          item.type_name &&
          !this.categories?.includes(item.type_name) &&
          self.findIndex((other) => other.type_id === item.type_id) === index,
      );
    const classIds = classes.map((item) => item.type_id);

    const rawFiltersObj = resp?.filters && Object.keys(resp?.filters).length ? resp.filters : {};
    const filters = Object.keys(rawFiltersObj).reduce((acc, key) => {
      if (String(key) && classIds.includes(String(key))) {
        acc[String(key)] = rawFiltersObj[key];
      }
      return acc;
    }, {});

    return { class: classes, filters };
  }

  public async homeVod(): Promise<ICmsHomeVod> {
    const resp = await this.execCtx('homeVod');

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || 1;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  public async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { tid, page = 1, extend = {} } = doc || {};
    const resp = await this.execCtx('category', { tid, page, extend });

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  public async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const resp = await this.execCtx('detail', { ids });

    const idsArray = [ids];
    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v, i) => ({
        vod_id: String((v.vod_id || idsArray[i]) ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_year: String(v.vod_year ?? ''),
        vod_lang: v.vod_lang ?? '',
        vod_area: v.vod_area ?? '',
        vod_score: String(v.vod_score ?? '0.0'),
        vod_state: v.vod_state ?? '', // '正片' | '预告' | '花絮'
        vod_class: v.vod_class ?? '', // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
        vod_actor: v.vod_actor ?? '',
        vod_director: v.vod_director ?? '',
        vod_content: (v.vod_content ?? '')?.trim(),
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_play_from: v.vod_play_from ?? '',
        vod_play_url: v.vod_play_url ?? '',
        type_name: v.type_name ?? '',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || 1;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  public async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page = 1 } = doc || {};
    const resp = await this.execCtx('search', { wd, page });

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  public async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { flag, play } = doc || {};
    const resp = await this.execCtx('play', { flag, play });

    const qs = resp?.parse_extra;
    const scriptObj = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};

    const res = {
      url: resp?.url || '',
      quality: resp.quality || [],
      parse: resp.parse || 0,
      jx: resp.jx || 0,
      headers: resp?.header || resp?.headers || {},
      script: Object.keys(scriptObj).length
        ? {
            ...(resp.js ? { runScript: resp.js } : {}),
            ...(scriptObj.init_script ? { initScript: scriptObj.init_script } : {}),
            ...(scriptObj.custom_regex ? { customRegex: scriptObj.custom_regex } : {}),
            ...(scriptObj.sniffer_exclude ? { snifferExclude: scriptObj.sniffer_exclude } : {}),
          }
        : {},
    };

    return res;
  }

  async proxy(doc: ICmsProxyOptions): Promise<ICmsProxy> {
    const resp = await this.execCtx('proxy', doc);
    return resp;
  }

  public async runMain(doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    const resp = await this.execCtx('runMain', doc);
    return resp;
  }
}

export default T3DrpyAdapter;
