import { loggerService } from '@logger';
import { request } from '@main/utils/request';
import { LOG_MODULE } from '@shared/config/logger';
import {
  isArrayEmpty,
  isNil,
  isObjectEmpty,
  isPositiveFiniteNumber,
  isStrEmpty,
  isString,
} from '@shared/modules/validate';
import type { IRecMatch } from '@shared/types/cms';

const logger = loggerService.withContext(LOG_MODULE.FILM_REC_DOUBAN);

interface IRecommSearch {
  vod_douban_id?: string;
  vod_douban_type?: string;
  vod_score?: number;
  vod_name?: string;
  vod_year?: number;
}

interface IRecommDetail {
  type_name?: string;
  vod_douban_id?: string;
  vod_douban_type?: string;
  vod_lang?: string;
  vod_score?: number;
  vod_name?: string;
  vod_year?: number;
  vod_pic?: string;
  vod_blurb?: string;
  vod_content?: string;
  vod_director?: string;
  vod_actor?: string;
}

/**
 * Get douban base info with name and year
 */
export const fetchDoubanSearch = async (doc: { name: string; year: number }): Promise<IRecommSearch> => {
  try {
    let { name, year } = doc || {};

    if (isString(String(year)) && !isStrEmpty(String(year))) {
      year = Number.parseInt(String(year));
    }

    if (!isString(name) || isStrEmpty(name) || !isPositiveFiniteNumber(year)) {
      return {};
    }

    const url = 'https://m.douban.com/rexxar/api/v2/search/subjects';
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
      params: {
        q: name,
      },
    });

    const list = resp?.subjects?.items;
    if (isArrayEmpty(list)) return {};

    for (const node of list) {
      const t = node?.target;
      if (isNil(t) || isObjectEmpty(t)) continue;

      const isMovie = node.target_type === 'movie';
      const isTv = node.target_type === 'tv';
      if (!isMovie && !isTv) continue;

      if (t.title === name && Number(t.year) === year) {
        return {
          vod_douban_id: t.id ?? '',
          vod_douban_type: node.target_type,
          vod_score: Number(t.rating?.value) || 0,
          vod_name: t.title ?? '',
          vod_year: Number(t.year ?? 1970),
        };
      }
    }

    return {};
  } catch (error) {
    logger.error('Failed to fetch douban search', error as Error);
    return {};
  }
};

/**
 * Get douban detail info with id
 */
export const fetchDoubanDetail = async (doc: { id: string; type: string }): Promise<IRecommDetail> => {
  try {
    const { id, type } = doc || {};

    if (!isString(id) || isStrEmpty(id) || !isString(type) || isStrEmpty(type)) {
      return {};
    }

    const url = `https://m.douban.com/rexxar/api/v2/${type}/${id}`;
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
    });

    if (isObjectEmpty(resp)) return {};

    return {
      type_name: resp.genres.join(','),
      vod_douban_id: resp.id ?? '',
      vod_douban_type: resp.target_type ?? type,
      vod_lang: resp.languages.join(','),
      vod_score: Number(resp.rating?.value) || 0,
      vod_name: resp.title ?? '',
      vod_year: Number(resp.year ?? 1970),
      vod_pic: resp.pic?.normal || resp.pic?.large || '',
      vod_blurb: resp.intro ?? '',
      vod_content: resp.intro ?? '',
      vod_director: resp.directors.map((item) => item.name).join(',') ?? '',
      vod_actor: resp.actors.map((item) => item.name).join(',') ?? '',
    };
  } catch (error) {
    logger.error('Failed to fetch douban detail', error as Error);
    return {};
  }
};

/**
 * Get douban ratings
 */
export const fetchDoubanRate = async (doc: {
  id?: string;
  type?: string;
  name?: string;
  year?: number;
}): Promise<number> => {
  try {
    let { id, type, name, year } = doc || {};

    if (isString(String(year)) && !isStrEmpty(String(year))) {
      year = Number.parseInt(String(year));
    }

    const hasId = isString(id) && !isStrEmpty(id) && isString(type) && !isStrEmpty(type);
    const hasName = isString(name) && !isStrEmpty(name) && !isPositiveFiniteNumber(year);

    if (!hasId && !hasName) {
      return 0;
    }

    const resp = hasId
      ? await fetchDoubanDetail({ id: id!, type: type! })
      : await fetchDoubanSearch({ name: name!, year: year! });

    const score = Number(resp?.vod_score || 0);
    return isPositiveFiniteNumber(score) ? score : 0;
  } catch (error) {
    logger.error('Failed to fetch douban rate', error as Error);
    return 0.0;
  }
};

/**
 * Get douban related video recommendation list
 */
export const fetchDoubanRecomm = async (doc: {
  id?: string;
  type?: string;
  name?: string;
  year?: number;
}): Promise<IRecMatch[]> => {
  try {
    let { id, type, name, year } = doc || {};
    let doubanId = id;
    let doubanType = type;

    if (isString(String(year)) && !isStrEmpty(String(year))) {
      year = Number.parseInt(String(year));
    }

    const hasId = isString(id) && !isStrEmpty(id) && isString(type) && !isStrEmpty(type);
    const hasName = isString(name) && !isStrEmpty(name) && !isNil(year) && isPositiveFiniteNumber(year);

    if (!hasId && !hasName) {
      return [];
    }

    if (!hasId && hasName) {
      const searchResult = await fetchDoubanSearch({ name: name!, year: year! });
      doubanId = searchResult.vod_douban_id ?? '';
      doubanType = searchResult.vod_douban_type ?? '';
    }

    if (isStrEmpty(doubanId) || isStrEmpty(doubanType)) {
      return [];
    }

    const url = `https://m.douban.com/rexxar/api/v2/${doubanType}/${doubanId}/recommendations`;
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
    });

    const data = resp.map((item) => ({
      vod_name: item.title ?? '',
      vod_pic: item.pic?.large || item.pic?.normal || '',
      vod_douban_id: String(item.id ?? ''),
      vod_douban_type: item.type,
    }));

    return data ?? [];
  } catch (error) {
    logger.error('Failed to fetch douban recomm', error as Error);
    return [];
  }
};
