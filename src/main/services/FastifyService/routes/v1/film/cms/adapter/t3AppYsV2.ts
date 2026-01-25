import { request } from '@main/utils/request';
import { buildUrl, getHome } from '@shared/modules/headers';
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

const lienName: Record<string, string> = {
  bfzym3u8: '暴风',
  '1080zyk': '优质',
  kuaikan: '快看',
  lzm3u8: '量子',
  ffm3u8: '非凡',
  haiwaikan: '海外看',
  gsm3u8: '光速',
  zuidam3u8: '最大',
  bjm3u8: '八戒',
  snm3u8: '索尼',
  wolong: '卧龙',
  xlm3u8: '新浪',
  yhm3u8: '樱花',
  tkm3u8: '天空',
  jsm3u8: '极速',
  wjm3u8: '无尽',
  sdm3u8: '闪电',
  kcm3u8: '快车',
  jinyingm3u8: '金鹰',
  fsm3u8: '飞速',
  tpm3u8: '淘片',
  lem3u8: '鱼乐',
  dbm3u8: '百度',
  tomm3u8: '番茄',
  ukm3u8: 'U酷',
  ikm3u8: '爱坤',
  hnzym3u8: '红牛资源',
  hnm3u8: '红牛',
  '68zy_m3u8': '68',
  kdm3u8: '酷点',
  bdxm3u8: '北斗星',
  qhm3u8: '奇虎',
  hhm3u8: '豪华',
  kbm3u8: '快播',
};

class T3AppYsV2Adapter {
  private api: string = '';
  private type: number = 1;
  private parseApis: Record<string, string> = {};
  private categories: string[] = [];
  private randomPrefix: string = '';

  constructor(source: IConstructorOptions) {
    const ext = source.ext!;
    this.type = ext.includes('.vod') ? 1 : 2;
    this.api = ext.endsWith('/') ? ext.replace(/\/$/, '') : ext;
    this.categories = source.categories;

    this.randomPrefix = `${Date.now() / 1000}Prefix:`;
  }

  async init(): Promise<ICmsInit> {}

  async home(): Promise<ICmsHome> {
    const { data: resp } = await request.request({
      url: buildUrl(this.api, this.type === 1 ? '/types' : '/nav'),
      method: 'GET',
    });

    const srcList = this.type === 1 ? resp?.data?.typelist || resp?.data?.list : resp?.list || resp?.data;
    const rawList: Array<{
      type_id: string;
      type_name: string;
      type_extend: Record<string, any>;
    }> = Array.isArray(srcList) ? srcList : [];

    const keyMap = new Map([
      ['class', '类型'],
      ['area', '地区'],
      ['lang', '语言'],
      ['year', '年份'],
      ['by', '排序'],
    ]);

    const classes = rawList
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

    const filters = rawList.reduce((acc, item) => {
      const rawFiltersObj = item?.type_extend || {};
      const rawKey = String(item?.type_id);

      const arr = Object.entries(rawFiltersObj)
        .filter(([k, v]) => keyMap.has(k) && v && classIds.includes(rawKey))
        .map(([k, v]) => ({
          key: k,
          name: keyMap.get(k)!,
          value: [
            { n: '全部', v: '' },
            ...v
              .split(',')
              .filter(Boolean)
              .map((v) => ({ n: v, v })),
          ],
        }));

      acc[rawKey] = arr;
      return acc;
    }, {});

    return { class: classes, filters };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    const { data: resp } = await request.request({
      url: buildUrl(this.api, this.type === 1 ? '/vodPhbAll' : '/index_video'),
      method: 'GET',
    });

    const srcList = this.type === 1 ? resp?.data?.list : resp?.list || resp?.data;
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos = rawList
      .flatMap((it) => {
        const vlist = this.type === 1 ? it.vod_list || [] : it.vlist || [];
        return vlist;
      })
      .filter((v) => v.vod_id)
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: this.fixPic(v.vod_pic),
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb || v.vod_content || '').trim(),
        vod_tag: v.vod_tag || 'file',
      }));

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { page, tid, extend: fl = {} } = doc || {};
    const f = `class=${fl.class || ''}&area=${fl.area || ''}&lang=${fl.lang || ''}&letter=${fl.letter || ''}&year=${fl.year || ''}&by=${fl.by || ''}`;

    const { data: resp } = await request.request({
      url: buildUrl(this.api, this.type === 1 ? `?tid=${tid}&page=${page}&${f}` : `/video?tid=${tid}&pg=${page}&${f}`),
      method: 'GET',
    });

    const srcList = this.type === 1 ? resp?.data?.list : resp?.list || resp?.data;
    const rawTotal = this.type === 1 ? resp?.data?.total : resp?.total;
    const rawPage = this.type === 1 ? resp?.data?.page : resp?.page;
    const rawLimit = this.type === 1 ? resp?.data?.limit : resp?.limit;
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos = rawList
      .filter((v) => v.vod_id)
      .map((v) => ({
        vod_id: String((v.vod_id || this.randomPrefix + v.vod_name) ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: this.fixPic(v.vod_pic),
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb || v.vod_content || '').trim(),
        vod_tag: v.vod_tag || 'file',
      }));

    const pagecurrent = Number(rawPage) || page;
    const total = Number(rawTotal) || 0;
    const pagecount = Number(total) ? (Number(rawLimit) ? Math.ceil(total / Number(rawLimit)) : videos.length) : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc;
    const idsArray = ids.split(',');

    const realIds = await Promise.all(
      idsArray.map(async (rawId) => {
        const isPrefixed = rawId.startsWith(this.randomPrefix);
        if (!isPrefixed) return rawId;

        const wd = rawId.replace(this.randomPrefix, '');
        const { data: resp } = await request.request({
          url: this.type === 1 ? `${this.api}?wd=${wd}` : `${this.api}/search?text=${wd}`,
          method: 'GET',
        });

        const list = this.type === 1 ? resp.data?.list : resp.list || resp.data;
        const newId = list?.[0]?.vod_id;
        return newId || rawId;
      }),
    );

    const srcList = await Promise.all(
      realIds.map(async (id) => {
        const { data: resp } = await request.request({
          url: buildUrl(this.api, this.type === 1 ? `/detail?vod_id=${id}` : `/video_detail?id=${id}`),
          method: 'GET',
        });

        return resp?.data?.vod_info || resp?.data;
      }),
    );
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos = rawList
      .map((v, i) => {
        const episodes = this.type === 1 ? v.vod_play_list : v.vod_url_with_player;
        const episodeList = Array.isArray(episodes) ? episodes : [];

        const playMap = {};
        const parseApis = new Map<string, string>();

        episodeList.forEach((ep) => {
          const from =
            this.type === 1 ? ep.player_info?.from || ep.player_info?.show || ep.from || ep.show : ep.code || ep.name;

          if (!from) return;

          if (!playMap[from]) playMap[from] = [];
          playMap[from].push(ep.url);

          if (ep.parse_api) {
            const flag = lienName[from] || from;
            parseApis.set(flag, ep.parse_api);
          }
        });

        if (parseApis.size) this.parseApis = Object.fromEntries(parseApis);

        const sortOrder = {
          bfzym3u8: 1,
          '1080zyk': 2,
          kuaikan: 3,
          lzm3u8: 4,
          ffm3u8: 5,
          snm3u8: 6,
          qhm3u8: 7,
        };

        const arr = Object.entries(playMap)
          .map(([key, urls]) => ({
            flag: lienName[key] || key,
            url: urls,
            sort: sortOrder[key] || 8,
          }))
          .sort((a, b) => a.sort - b.sort);

        const valid = arr.filter(({ flag }) => flag && !flag.includes('undefined'));
        const playFrom = valid.map((v) => v.flag);
        const playUrl = valid.map((v) => v.url);
        if (playFrom.length) v.vod_play_from = playFrom.join('$$$');
        if (playUrl.length) v.vod_play_url = playUrl.join('$$$');

        return {
          vod_id: String((v.vod_id || idsArray[i]) ?? ''),
          vod_name: v.vod_name ?? '',
          vod_pic: v.vod_pic ?? '',
          vod_remarks: v.vod_remarks ?? '',
          vod_year: String(v.vod_year ?? ''),
          vod_lang: v.vod_lang ?? '',
          vod_area: v.vod_area ?? '',
          vod_score: String((v.vod_score || v.vod_douban_score) ?? '0.0'),
          vod_state: v.vod_state ?? '', // '正片' | '预告' | '花絮'
          vod_class: v.vod_class ?? '', // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
          vod_actor: v.vod_actor ?? '',
          vod_director: v.vod_director ?? '',
          vod_content: (v.vod_content ?? '')?.trim(),
          vod_blurb: (v.vod_blurb ?? '')?.trim(),
          vod_play_from: v.vod_play_from ?? '',
          vod_play_url: v.vod_play_url ?? '',
          type_name: v.type_name ?? '',
        };
      })
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page } = doc || {};

    const { data: resp } = await request.request({
      url: buildUrl(this.api, this.type === 1 ? `?wd=${wd}&page=${page}` : `/search?text=${wd}&pg=${page}`),
      method: 'GET',
    });

    const srcList = this.type === 1 ? resp?.data?.list : resp?.list || resp?.data;
    const rawTotal = this.type === 1 ? resp?.data?.total : resp?.total;
    const rawPage = this.type === 1 ? resp?.data?.page : resp?.page;
    const rawLimit = this.type === 1 ? resp?.data?.limit : resp?.limit;
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos: ICmsHomeVod['list'] = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: this.fixPic(v.vod_pic),
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb || v.vod_content || '').trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(rawPage) || page;
    const total = Number(rawTotal) || 0;
    const pagecount = Number(total) ? (Number(rawLimit) ? Math.ceil(total / Number(rawLimit)) : videos.length) : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { play, flag } = doc;

    const res = {
      url: this.parseApis?.[flag] && !/\.(?:m3u8|mp4|mpd|flv|mkv)/i.test(play) ? this.parseApis[flag] + play : play,
      parse: +!/\.(?:m3u8|mp4|mpd|flv|mkv)$/i.test(play),
    };
    return res;
  }

  async proxy(_doc: ICmsProxyOptions): Promise<ICmsProxy> {
    return [];
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }

  private fixPic(pic: string): string {
    if (pic.startsWith('http')) return pic;
    if (pic.startsWith('//')) return `https:${pic}`;
    if (pic.startsWith('/')) return getHome(this.api) + pic;
    return `${getHome(this.api)}/${pic}`;
  }
}

export default T3AppYsV2Adapter;
