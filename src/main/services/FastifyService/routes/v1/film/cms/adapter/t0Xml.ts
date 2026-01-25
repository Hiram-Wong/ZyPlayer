import { request } from '@main/utils/request';
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
import { XMLParser } from 'fast-xml-parser';
import { JSONPath } from 'jsonpath-plus';

// @see https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v6/3.Options.md
const xmlOptions = {
  trimValues: true,
  textNodeName: '$text',
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: true,
};
const parser = new XMLParser(xmlOptions);

class T0XmlAdapter {
  private api: string = '';
  private playUrl: string = '';
  private categories: string[] = [];

  constructor(source: IConstructorOptions) {
    this.api = source.api!;
    this.playUrl = source.playUrl || '';
    this.categories = source.categories;
  }

  async init(): Promise<ICmsInit> {}

  async home(): Promise<ICmsHome> {
    let xmlResp: string;
    try {
      const { data } = await request.request({
        url: this.api,
        method: 'GET',
        params: { ac: 'class' },
      });
      xmlResp = data;
    } catch {
      const { data } = await request.request({
        url: this.api,
        method: 'GET',
      });
      xmlResp = data;
    }

    const xml2json = parser.parse(xmlResp);
    const resp = xml2json?.rss;

    const rawClassList = Array.isArray(resp?.class?.ty) ? resp.class.ty : [];
    const classes = rawClassList
      .map((item) => ({
        type_id: String(item.id ?? '').trim(),
        type_name: item.$text?.toString().trim() ?? '',
      }))
      .filter(
        (item, index, self) =>
          item.type_id &&
          item.type_name &&
          !this.categories?.includes(item.type_name) &&
          self.findIndex((other) => other.type_id === item.type_id) === index,
      );

    const filters = {};

    return { class: classes, filters };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    let xmlResp: string;
    try {
      const { data } = await request.request({
        url: this.api,
        method: 'GET',
        params: { ac: 'class' },
      });
      xmlResp = data;
    } catch {
      const { data } = await request.request({
        url: this.api,
        method: 'GET',
      });
      xmlResp = data;
    }

    const xml2json = parser.parse(xmlResp);
    const resp = xml2json?.rss;

    // one item is object, so convert to ransform to array
    let rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];
    if (rawList.length && !rawList[0]?.pic) {
      const ids = rawList
        .map((v) => String(v.id))
        .filter(Boolean)
        .join(',');
      if (ids.length) resp.list.video = (await this.detail({ ids })).list;
    }
    rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];

    const videos = rawList
      .map((v) => ({
        vod_id: String((v.id || v.vod_id) ?? ''),
        vod_name: (v.name || v.vod_name) ?? '',
        vod_pic: v.pic || v.vod_pic || '',
        vod_remarks: (v.note || v.vod_remarks) ?? '',
        vod_blurb: ((v.desc || v.vod_blurb) ?? '')?.trim(),
        vod_tag: 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.list?.page) || 1;
    const pagecount = Number(resp?.list?.pagecount) || 0;
    const total = Number(resp?.list?.recordcount) || 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { page = 1, tid } = doc || {};

    const { data: xmlResp } = await request.request({
      url: this.api,
      method: 'GET',
      params: { ac: 'videolist', t: tid, pg: page },
    });

    const xml2json = parser.parse(xmlResp);
    const resp = xml2json?.rss;

    // one item is object, so convert to ransform to array
    const rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String((v.id || v.vod_id) ?? ''),
        vod_name: (v.name || v.vod_name) ?? '',
        vod_pic: v.pic || v.vod_pic || '',
        vod_remarks: (v.note || v.vod_remarks) ?? '',
        vod_blurb: ((v.desc || v.vod_blurb) ?? '')?.trim(),
        vod_tag: 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.list?.page) || page;
    const pagecount = Number(resp?.list?.pagecount) || 0;
    const total = Number(resp?.list?.recordcount) || 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const idsArray = ids.split(',');

    const { data: xmlResp } = await request.request({
      url: this.api,
      method: 'GET',
      params: { ac: 'detail', ids },
    });

    const parseDldd = (dldd: Array<any>, field: 'flag' | '$text'): string => {
      if (!dldd) return '';
      const arr = Array.isArray(dldd) ? dldd : [dldd];
      return arr
        .map((i) => i?.[field] ?? '')
        .filter(Boolean)
        .join('$$$');
    };

    const xml2json = parser.parse(xmlResp);
    const resp = xml2json?.rss;

    // one item is object, so convert to ransform to array
    const rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];
    const videos = rawList
      .map((v, i) => ({
        vod_id: String((v.id || idsArray[i]) ?? ''),
        vod_name: v.name ?? '',
        vod_pic: v.pic ?? '',
        vod_year: String(v.year ?? ''),
        vod_lang: v.lang ?? '',
        vod_area: v.area ?? '',
        vod_remarks: v.note ?? '',
        vod_score: '0.0',
        vod_state: v.state ?? '',
        vod_class: '',
        vod_actor: v.actor ?? '',
        vod_director: v.director ?? '',
        vod_content: (v.des ?? '')?.trim(),
        vod_blurb: (v.des ?? '')?.trim(),
        vod_play_from: parseDldd(v.dl.dd, 'flag') ?? '',
        vod_play_url: parseDldd(v.dl.dd, '$text') ?? '',
        type_name: v.type ?? '',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.list?.page) || 1;
    const pagecount = Number(resp?.list?.pagecount) || 0;
    const total = Number(resp?.list?.recordcount) || 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page = 1 } = doc || {};

    const { data: xmlResp } = await request.request({
      url: this.api,
      method: 'GET',
      params: { ac: 'list', wd, pg: page },
    });

    const xml2json = parser.parse(xmlResp);
    const resp = xml2json?.rss;

    // one item is object, so convert to ransform to array
    let rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];
    if (rawList.length && !rawList[0]?.pic) {
      const ids = rawList
        .map((v) => String(v.id))
        .filter(Boolean)
        .join(',');
      if (ids.length) resp.list.video = (await this.detail({ ids })).list;
    }
    rawList = Array.isArray(resp?.list?.video) ? resp.list.video : resp?.list?.video ? [resp.list.video] : [];

    const videos = rawList
      .map((v) => ({
        vod_id: String((v.id || v.vod_id) ?? ''),
        vod_name: (v.name || v.vod_name) ?? '',
        vod_pic: v.pic || v.vod_pic || '',
        vod_remarks: (v.note || v.vod_remarks) ?? '',
        vod_blurb: ((v.desc || v.vod_blurb) ?? '')?.trim(),
        vod_tag: 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.list?.page) || page;
    const pagecount = Number(resp?.list?.pagecount) || 0;
    const total = Number(resp?.list?.recordcount) || 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { play } = doc || {};
    const parseUrl = this.playUrl || '';

    if (/\.(?:m3u8|mp4|mpd|flv|mkv)/.test(play)) {
      return { parse: 0, url: play };
    } else {
      if (parseUrl.startsWith('json:')) {
        const purl = parseUrl.replace('json:', '') + play;
        const { data: resp } = await request.request({
          url: purl,
          method: 'GET',
        });

        try {
          const queryResult = JSONPath({ path: '$.url', json: resp });
          return { parse: 0, url: queryResult };
        } catch {
          return { parse: 1, url: play };
        }
      } else {
        return { parse: 1, url: parseUrl + play };
      }
    }
  }

  async proxy(_doc: ICmsProxyOptions): Promise<ICmsProxy> {
    return [];
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }
}

export default T0XmlAdapter;
