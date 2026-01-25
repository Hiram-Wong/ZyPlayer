import { loggerService } from '@logger';
import { request } from '@main/utils/request';
import { LOG_MODULE } from '@shared/config/logger';
import { randomNanoid } from '@shared/modules/crypto';
import { toM, toUnix, toY, toYMD } from '@shared/modules/date';
import { isArrayEmpty, isNil, isPositiveFiniteNumber, isStrEmpty, isString } from '@shared/modules/validate';

const logger = loggerService.withContext(LOG_MODULE.FILM_REC_HOT);

export interface IRecommHot {
  vod_id: string | number;
  vod_name: string;
  vod_hot: number;
  vod_pic?: string;
  vod_remarks?: string;
}

export interface IRecommHotOptions {
  type?: number;
  date?: string;
  pageSize?: number;
  page?: number;
}

/**
 * 百度
 *
 * @see https://www.baidu.com/s?wd=%E7%94%B5%E8%A7%86%E5%89%A7%E6%8E%92%E8%A1%8C%E6%A6%9C
 */
export const baidu = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  try {
    let { type = 1, pageSize = 20, page = 1 } = doc;

    if (isString(type)) type = Number.parseInt(type);
    if (![1, 2].includes(type)) type = 1; // 1:电影 2:电视剧

    if (isString(pageSize)) pageSize = Number.parseInt(pageSize);
    if (isString(page)) page = Number.parseInt(page);
    if (!isPositiveFiniteNumber(pageSize)) pageSize = 20;
    if (!isPositiveFiniteNumber(page)) page = 1;

    const TYPE_MAP = {
      1: '电影',
      2: '电视剧',
    };

    const url = 'https://opendata.baidu.com/api.php';
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      params: {
        resource_id: 51274,
        ks_from: 'aladdin',
        new_need_di: 1,
        from_mid: 1,
        sort_type: 1,
        query: `${TYPE_MAP[type]}排行榜`, // 电视剧排行榜 | 电影排行榜
        tn: 'wisexmlnew',
        dsp: 'iphone',
        format: 'json',
        ie: 'utf-8',
        oe: 'utf-8',
        q_ext: { query_key: 3, is_person_related: 0, video_type_list: [] },
        sort_key: 1, // 1:最热 2:最新 3:好评
        stat0: TYPE_MAP[type], // 电视剧 | 电影
        stat1: '全部',
        stat2: '全部',
        stat3: '全部',
        rn: pageSize,
        pn: (page - 1) * pageSize, // 从第几条开始
        trigger_srcid: 51251,
        sid: '60274_62325_63145_63948_64364_64437_64450_64566_64580_64647_64710_64740_64743_64739_64763_64702_64822_64818_64813_64839_64912_64915_64954_64934_64968_64985_65044_65050_65077_65085_65080',
        // cb: 'jsonp_1757148729846_55022'
      },
    });

    if (resp.ResultCode !== 0) return [];

    const rawList = resp.Result?.[0]?.DisplayData?.resultData?.tplData?.result?.result;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => ({
        vod_id: item.urlsign ?? '',
        vod_name: item.ename ?? '',
        vod_remarks: item.additional ?? '',
        vod_pic: item.img ?? '',
        vod_hot: Number(item?.douBanInfo?.score) || 0,
      }))
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch baidu hot', error as Error);
    return [];
  }
};

/**
 * 豆瓣
 *
 * @see 小程序
 */
export const douban = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  let { type = 1, pageSize = 20, page = 1 } = doc;

  if (isString(type)) type = Number.parseInt(type);
  if (![1, 2, 3].includes(type)) type = 1; // 1:电影(影院热映) 2:电视剧(豆瓣热播) 3:综艺(热播综艺)

  if (isString(pageSize)) pageSize = Number.parseInt(pageSize);
  if (isString(page)) page = Number.parseInt(page);
  if (!isPositiveFiniteNumber(pageSize)) pageSize = 20;
  if (!isPositiveFiniteNumber(page)) page = 1;

  const TYPE_MAP = {
    1: 'movie_showing',
    2: 'tv_hot',
    3: 'tv_variety_show',
  };

  try {
    const url = `https://m.douban.com/rexxar/api/v2/subject_collection/${TYPE_MAP[type]}/items`;
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
      params: {
        start: (page - 1) * pageSize,
        count: pageSize,
      },
    });

    const rawList = resp?.subject_collection_items;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => {
        const base = {
          vod_id: item.id ?? '',
          vod_name: item.title ?? '',
          vod_hot: Number(item.allHot) || 0,
          vod_pic: '',
          vod_remarks: item.card_subtitle ?? '',
        };

        if (item.type === 'tv') {
          base.vod_pic = item.pic?.large || item.pic?.normal || '';
          base.vod_hot = Number(item.rating?.count) || 0;
        } else if (item.type === 'movie') {
          base.vod_pic = item.cover?.url || '';
          base.vod_hot = Number(item.rating?.value) || 0;
        }

        return base;
      })
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch douban hot', error as Error);
    return [];
  }
};

/**
 * 云合
 *
 * @see https://www.enlightent.cn/program.html - 小程序
 */
export const enlightent = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  try {
    let { date, type } = doc;

    if (isStrEmpty(date) || isNil(date)) date = toYMD();
    date = date.replace(/-/g, '/');

    if (isString(type)) type = Number.parseInt(type);
    if (isNil(type) || ![1, 2, 3].includes(type)) type = 1; // 1:电影 2:电视剧 3:综艺

    const TYPE_MAP = {
      1: 'movie',
      2: 'tv',
      3: 'art',
    };

    const url = 'https://www.enlightent.cn/sxapi/top/getHeatTop.do';
    const { data: resp } = await request.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: {
        sort: 'allHot',
        channelType: TYPE_MAP[type],
        day: 1,
        date,
      },
    });

    const rawList = resp?.content;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => ({
        vod_id: item.nameId ?? '',
        vod_name: item.name ?? '',
        vod_hot: Number(item.allHot) || 0,
        vod_remarks: item.channel ?? '',
      }))
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch enlightent hot', error as Error);
    return [];
  }
};

/**
 * 酷云
 *
 * @see https://www.ky.live
 */
export const kylive = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  try {
    let { date, type } = doc;
    if (isStrEmpty(date) || isNil(date)) date = toYMD();
    if (isString(type)) type = Number.parseInt(type);
    if (isNil(type) || ![2, 3].includes(type)) type = 2; // 2:电视剧 3:综艺

    const month = (toM(date) as unknown as number) - 1 || 12;
    const year = (toY(date) as unknown as number) - (month === 12 ? 1 : 0);

    const TYPE_MAP = {
      2: 2,
      3: 3,
    };

    const url = 'https://www.ky.live/api/full';
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      params: {
        dt: 3,
        y: year,
        m: month,
        vt: TYPE_MAP[type],
      },
    });

    if (!resp?.status) return [];

    const rawList = resp.data;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => ({
        vod_id: item.caid ?? '',
        vod_name: item.epg ?? '',
        vod_remarks: isPositiveFiniteNumber(item.mr) ? `播放市占${(item.mr * 100).toFixed(2)}%` : '播放市占0.00%',
        vod_hot: Number(item.count) || 0,
      }))
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch kylive hot', error as Error);
    return [];
  }
};

/**
 * 移动爱家(未来电视数据)
 *
 * @see https://msi.nsoap.komect.com/minitvH5/index.html#/hotlist?licensedParty=未来电视&isOuter=undefined&provCode=42&deviceType=502090&isNewTheme=2
 */
export const komect = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  try {
    let { type = 1, pageSize = 20, page = 1 } = doc;

    if (isString(type)) type = Number.parseInt(type);
    if (![1, 2, 3, 4].includes(type)) type = 1; // 1:电影 2:电视剧 3:综艺 4:少儿(动漫)

    if (isString(pageSize)) pageSize = Number.parseInt(pageSize);
    if (isString(page)) page = Number.parseInt(page);
    if (!isPositiveFiniteNumber(pageSize)) pageSize = 20;
    if (!isPositiveFiniteNumber(page)) page = 1;

    const TYPE_MAP = {
      1: '电影',
      2: '电视剧',
      3: '综艺',
      4: '少儿',
    };

    const url = 'https://msi.nsoap.komect.com/msi/cbiz/dp/contentInfo/homePage/list';
    const { data: resp } = await request.request({
      url,
      method: 'POST',
      headers: {
        auth: '3637df52d98ce8815fe47bbe49fe6459',
        Origin: 'https://msi.nsoap.komect.com',
        Referer: 'https://msi.nsoap.komect.com/minitvH5/index.html',
        channelId: 'H5',
      },
      data: {
        openId: '111',
        provCode: '42',
        licensedParty: '未来电视',
        deviceType: '502090',
        contentTypeIndexs: [
          {
            contentType: TYPE_MAP[type],
            pageNum: page,
            pageSize,
          },
        ],
      },
    });

    if (resp.recode !== 1) return [];

    const rawList = resp.data?.items?.[0]?.contentInfoList;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => ({
        vod_id: item.psId ?? '',
        vod_name: item.dpContentName ?? '',
        vod_pic: item.dpContentPicUrl ?? '',
        vod_hot: Number(item.dpPlayCount) || 0,
        vod_remarks: item.dpContentShortDesc ?? '',
      }))
      .filter((v) => v.vod_id)
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch komect hot', error as Error);
    return [];
  }
};

/**
 * 夸克
 *
 * @see https://vt.quark.cn/blm/video-list-544/tab?app=college&hot=电视剧&type=电视剧热搜&hottype=true&video=电视剧
 * @see https://vt.quark.cn/blm/video-list-544/tab?app=college&hot=电影&type=电影热搜&hottype=true&video=电影
 * @see https://vt.quark.cn/blm/video-list-544/tab?app=college&hot=综艺&type=综艺热搜&hottype=true&video=综艺
 */
export const quark = async (doc: IRecommHotOptions = {}): Promise<IRecommHot[]> => {
  try {
    let { type = 1, pageSize = 20, page = 1 } = doc;

    if (isString(type)) type = Number.parseInt(type);
    if (![1, 2, 3].includes(type)) type = 1; // 1:电影 2:电视剧 3:综艺

    if (isString(pageSize)) pageSize = Number.parseInt(pageSize);
    if (isString(page)) page = Number.parseInt(page);
    if (!isPositiveFiniteNumber(pageSize)) pageSize = 20;
    if (!isPositiveFiniteNumber(page)) page = 1;

    const TYPE_MAP = {
      1: '电影',
      2: '电视剧',
      3: '综艺',
    };

    const url = 'https://quark.sm.cn/api/rest';
    const { data: resp } = await request.request({
      url,
      method: 'GET',
      params: {
        method: 'yingshi_list.getData',
        q: 'default',
        hit: pageSize,
        fi_channel: TYPE_MAP[type],
        vendor: 100002,
        belong: 'other',
        start: page,
        fi_rank_type: '最新',
        fi_cate: '全部',
        fi_area: '全部',
        fi_year: '全部',
        second_tag: true,
        _: toUnix(),
      },
    });

    const rawList = resp.item;
    if (isNil(rawList) || isArrayEmpty(rawList)) return [];

    return rawList
      .map((item) => ({
        vod_id: randomNanoid() ?? '',
        vod_name: item.title ?? '',
        vod_remarks: item.episode_count ?? '',
        vod_pic: item.src ?? '',
        vod_hot: Number(item.hot_score) || 0,
      }))
      .sort((a, b) => b.vod_hot - a.vod_hot);
  } catch (error) {
    logger.error('Failed to fetch quark hot', error as Error);
    return [];
  }
};

export default {
  komect,
  douban,
  quark,
  baidu,
  kylive,
  enlightent,
};
