import { dbService } from '@main/services/DbService';
import {
  getCategorySchema,
  getCheckSchema,
  getDetailSchema,
  getHomeSchema,
  getHomeVodSchema,
  getInitchema,
  getPlaySchema,
  getProxySchema,
  getSearchSchema,
} from '@server/schemas/v1/flim/cms';
import {
  isArray,
  isArrayEmpty,
  isJsonStr,
  isNil,
  isObject,
  isObjectEmpty,
  isPositiveFiniteNumber,
  isString,
} from '@shared/modules/validate';
import type {
  ICmsCategory,
  ICmsDetail,
  ICmsHome,
  ICmsHomeVod,
  ICmsPlay,
  ICmsProxy,
  ICmsSearch,
} from '@shared/types/cms';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import JSON5 from 'json5';

import { prepare } from './utils/cache';
import { formatEpisode, formatInfoContent } from './utils/cms';

const API_PREFIX = 'film/cms';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/init`,
    { schema: getInitchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string; force?: boolean } }>) => {
      const { uuid, force = false } = req.query || {};

      try {
        await prepare(uuid, force);
        return { code: 0, msg: 'ok', data: true };
      } catch {
        return { code: -1, msg: 'fail', data: false };
      }
    },
  );

  fastify.get(
    `/${API_PREFIX}/home`,
    { schema: getHomeSchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string } }>) => {
      const { uuid } = req.query || {};

      const adapter = await prepare(uuid);
      const resp = await adapter.home();

      const source = await dbService.site.get(uuid);

      const categories = source.categories
        ? Array.from(
            new Set(
              source.categories
                .split(/[,，]/)
                .map((c) => c.trim())
                .filter(Boolean),
            ),
          )
        : [];

      const rawClassList = Array.isArray(resp?.class) ? resp?.class : [];
      const classes = rawClassList
        .filter(
          (item, index, self) =>
            item.type_id &&
            item.type_name &&
            !categories?.includes(item.type_name) &&
            self.findIndex((other) => other.type_id === item.type_id) === index,
        )
        .map((item) => ({
          type_id: String(item.type_id ?? '').trim(),
          type_name: item.type_name?.toString().trim() ?? '',
        }));
      const classIds = classes.map((item) => item.type_id);

      const rawFiltersObj = resp?.filters && Object.keys(resp?.filters).length ? resp.filters : {};
      const filters = Object.keys(rawFiltersObj).reduce((acc, key) => {
        if (String(key) && classIds.includes(String(key))) {
          acc[String(key)] = rawFiltersObj[key];
        }
        return acc;
      }, {});

      const res = { class: classes, filters } as ICmsHome;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/homeVod`,
    { schema: getHomeVodSchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string } }>) => {
      const { uuid } = req.query || {};

      const adapter = await prepare(uuid);
      const resp = await adapter.homeVod();

      const videos = (Array.isArray(resp?.list) ? resp.list : [])
        .filter((v) => v.vod_id && v.vod_id !== 'no_data')
        .map((v) => ({
          vod_id: String(v.vod_id ?? ''),
          vod_name: v.vod_name ?? '',
          vod_pic: v.vod_pic ?? '',
          vod_remarks: formatInfoContent(v.vod_remarks ?? ''),
          vod_blurb: formatInfoContent(v.vod_blurb ?? ''),
          vod_tag: v.vod_tag || 'file',
        }));
      const pagecurrent = Number.parseInt(String(resp?.page)) || 1;
      const pagecount = Number.parseInt(String(resp?.pagecount)) || 0;
      const total = Number.parseInt(String(resp?.total)) || 0;

      const res = { page: pagecurrent, pagecount, total, list: videos } as ICmsHomeVod;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/category`,
    { schema: getCategorySchema },
    async (
      req: FastifyRequest<{
        Querystring: { uuid: string; tid: string; page?: number; extend?: string };
      }>,
    ) => {
      let { uuid, tid, page = 1, extend: rawExtend = '{}' } = req.query || {};
      if (isString(page)) page = Number.parseInt(page);
      if (!isPositiveFiniteNumber(page)) page = 1;
      const extend = isJsonStr(rawExtend) ? JSON5.parse(rawExtend) : {};

      const adapter = await prepare(uuid);
      const resp = tid === '' ? await adapter.homeVod() : await adapter.category({ tid, page, extend });

      const videos = (Array.isArray(resp?.list) ? resp.list : [])
        .filter((v) => v.vod_id && v.vod_id !== 'no_data')
        .map((v) => ({
          vod_id: String(v.vod_id ?? ''),
          vod_name: v.vod_name ?? '',
          vod_pic: v.vod_pic ?? '',
          vod_remarks: formatInfoContent(v.vod_remarks ?? ''),
          vod_blurb: formatInfoContent(v.vod_blurb ?? ''),
          vod_tag: v.vod_tag || 'file',
        }));
      const pagecurrent = Number(resp?.page) || page;
      const pagecount = Number(resp?.pagecount) || 0;
      const total = Number(resp?.total) || 0;

      const res = { page: pagecurrent, pagecount, total, list: videos } as ICmsCategory;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/detail`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string; ids: string } }>) => {
      const { uuid, ids } = req.query || {};

      const adapter = await prepare(uuid);
      const resp = await adapter.detail({ ids });

      const videos = (Array.isArray(resp?.list) ? resp.list : [])
        .filter((v) => v.vod_id)
        .map((v) => ({
          vod_id: String(v.vod_id),
          vod_name: v.vod_name ?? '',
          vod_pic: v.vod_pic ?? '',
          vod_remarks: formatInfoContent(v.vod_remarks ?? ''),
          vod_year: formatInfoContent(String(v.vod_year ?? '')),
          vod_lang: formatInfoContent(v.vod_lang ?? ''),
          vod_area: formatInfoContent(v.vod_area ?? ''),
          vod_score: formatInfoContent(String((v.vod_score || v.vod_douban_score) ?? '0.0')),
          vod_state: formatInfoContent(v.vod_state ?? ''), // '正片' | '预告' | '花絮'
          vod_class: formatInfoContent(v.vod_class ?? ''), // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
          vod_actor: formatInfoContent(v.vod_actor ?? ''),
          vod_director: formatInfoContent(v.vod_director ?? ''),
          vod_content: formatInfoContent(v.vod_content ?? ''),
          vod_blurb: formatInfoContent(v.vod_blurb ?? ''),
          vod_play_from: v.vod_play_from ?? '',
          vod_play_url: v.vod_play_url ?? '',
          vod_episode: formatEpisode(v.vod_play_from, v.vod_play_url) || {},
          type_name: v.type_name ?? '',
        }));
      const pagecurrent = Number(resp?.page) || 1;
      const pagecount = Number(resp?.pagecount) || 0;
      const total = Number(resp?.total) || 0;

      const res = { page: pagecurrent, pagecount, total, list: videos } as ICmsDetail;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/search`,
    { schema: getSearchSchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string; wd: string; page?: number } }>) => {
      let { uuid, wd, page = 1 } = req.query || {};
      if (isString(page)) page = Number.parseInt(page);
      if (!isPositiveFiniteNumber(page)) page = 1;

      const adapter = await prepare(uuid);
      const resp = await adapter.search({ wd, page });

      const videos = (Array.isArray(resp?.list) ? resp.list : [])
        .filter((v) => v.vod_id)
        .map((v) => ({
          vod_id: String(v.vod_id ?? ''),
          vod_name: v.vod_name ?? '',
          vod_pic: v.vod_pic ?? '',
          vod_remarks: formatInfoContent(v.vod_remarks ?? ''),
          vod_blurb: formatInfoContent(v.vod_blurb ?? ''),
          vod_tag: v.vod_tag || 'file',
        }));
      const pagecurrent = Number(resp?.page) || page;
      const pagecount = Number(resp?.pagecount) || 0;
      const total = Number(resp?.total) || 0;

      const res = { page: pagecurrent, pagecount, total, list: videos } as ICmsSearch;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/play`,
    { schema: getPlaySchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string; play: string; flag: string } }>) => {
      const { uuid, flag, play } = req.query || {};

      const adapter = await prepare(uuid);
      const resp = await adapter.play({ flag, play });

      const res = {
        url: resp?.url || '',
        quality: isArray(resp?.quality) && !isArrayEmpty(resp.quality) ? resp.quality : [],
        parse: isPositiveFiniteNumber(resp?.parse) ? resp.parse : 0,
        jx: isPositiveFiniteNumber(resp?.jx) ? resp.jx : 0,
        headers: isObject(resp?.headers) && !isObjectEmpty(resp.headers) ? resp.headers : {},
        script: isObject(resp?.script) && !isObjectEmpty(resp.script) ? resp.script : {},
      } as ICmsPlay;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/proxy`,
    { schema: getProxySchema },
    async (
      req: FastifyRequest<{ Querystring: { uuid: string; do: 'js' | 'py'; url: string } & Record<string, any> }>,
    ) => {
      const { uuid, ...args } = req.query || {};

      const adapter = await prepare(uuid);
      const resp = await adapter.proxy(args);

      const res = resp as ICmsProxy;

      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/check`,
    { schema: getCheckSchema },
    async (req: FastifyRequest<{ Querystring: { uuid: string } & { type: 'simple' | 'complete' } }>) => {
      const { uuid, type } = req.query || {};
      const adapter = await prepare(uuid);

      const home = await adapter.home();
      if (isNil(home.class) || isArrayEmpty(home.class)) {
        return { code: 0, msg: 'ok', data: false };
      }

      const category = await adapter.category({ tid: String(home.class[0]) });
      if (isNil(category?.list) || isArrayEmpty(category.list) || category.list[0]?.vod_id === 'no_data') {
        return { code: 0, msg: 'ok', data: false };
      }

      if (type === 'simple') {
        return { code: 0, msg: 'ok', data: true };
      }

      const detail = await adapter.detail({ ids: String(category.list[0]?.vod_id) });
      if (
        isNil(detail?.list) ||
        isArrayEmpty(detail.list) ||
        !detail.list[0]?.vod_play_url ||
        detail.list[0]?.vod_play_from
      ) {
        return { code: 0, msg: 'ok', data: false };
      }

      const vod_episode = formatEpisode(detail.list[0].vod_play_from, detail.list[0].vod_play_url)!;
      const resPlay = await adapter.play({
        flag: Object.keys(vod_episode)[0] || '',
        play: vod_episode[Object.keys(vod_episode)[0]]?.[0].link || '',
      });
      if (isNil(resPlay?.url)) {
        return { code: 0, msg: 'ok', data: false };
      }

      return { code: 0, msg: 'ok', data: true };
    },
  );
};

export default api;
