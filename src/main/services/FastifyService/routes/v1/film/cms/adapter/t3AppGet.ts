import { request } from '@main/utils/request';
import { aes } from '@shared/modules/crypto';
import { buildUrl } from '@shared/modules/headers';
import type {
  ICmsCategory,
  ICmsCategoryOptions,
  ICmsDetail,
  ICmsDetailOptions,
  ICmsHome,
  ICmsHomeVod,
  ICmsPlay,
  ICmsPlayOptions,
  ICmsSearch,
  ICmsSearchOptions,
  IConstructorOptions,
} from '@shared/types/cms';

class T3AppGetAdapter {
  private host: string = '';
  private muban: string = '';
  private categories: string[] = [];
  private headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 MUOUAPP/10.8.4506.400',
  };

  private appConfig: Record<string, string> = {};
  private from: Record<string, string> = {};

  constructor(source: IConstructorOptions) {
    const ext = source.ext as unknown as Record<string, any>;
    this.appConfig = ext.appConfig || {};
    this.muban = source.api === 'csp_AppGet' ? 'AppGet' : 'AppQiji';

    let host = '';
    if (this.appConfig.host) {
      host = this.appConfig.host;
    } else {
      const _hosturl = this.appConfig.hosturl;
      // let hostdata = request(hosturl);
      // host = hostdata.split('\n')[0].replace(/\s+/g, '');
    }
    if (host.endsWith('/')) {
      host = host.slice(0, -1);
    }
    this.host = host;

    this.categories = source.categories;
  }

  async init(): Promise<void> {
    if (this.appConfig.username && this.appConfig.password) {
      try {
        const resp = await request.request({
          url: buildUrl(this.host, `/${this.API[this.muban].appLogin}`),
          method: 'POST',
          data: {
            password: this.appConfig.password,
            code: '',
            device_id: '',
            user_name: this.appConfig.username,
            invite_code: '',
            key: '',
            is_emulator: 0,
          },
          headers: this.headers,
        });

        const userInfo = JSON.parse(this.decrypt(JSON.parse(resp).data)).user;
        this.headers['app-user-token'] = userInfo.auth_token;
      } catch {}
    }
  }

  async home(): Promise<ICmsHome> {
    const resp = await request.request({
      url: buildUrl(this.host, `/${this.API[this.muban].initV}`),
      method: 'POST',
      headers: this.headers,
    });

    const srcList = JSON.parse(this.decrypt(JSON.parse(resp).data)).type_list;
    const rawList = Array.isArray(srcList) ? srcList : [];

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
        .filter(([k, v]) => !['state', 'star', 'director'].includes(k) && v && classIds.includes(rawKey))
        .map(([k, v]) => ({
          key: k,
          name: k,
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
    return { list: [], page: 1, pagecount: 0, total: 0 };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { page, tid, extend = {} } = doc || {};

    const resp = await request.request({
      url: buildUrl(this.host, `${this.API[this.muban].typeFilterVodList}`),
      method: 'POST',
      params: {
        area: extend.area || '全部',
        year: extend.year || '全部',
        type_id: tid,
        page,
        sort: extend.sort || '最新',
        lang: extend.lang || '全部',
        class: extend.class || '全部',
      },
      headers: this.headers,
    });

    const srcList = JSON.parse(this.decrypt(JSON.parse(resp).data)).recommend_list;
    const rawList = Array.isArray(srcList) ? srcList : [];

    const list: ICmsHomeVod['list'] = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb || v.vod_content || '').trim(),
      }))
      .filter((v) => v.vod_id);

    return { list };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc;
    const idsArr = ids.split(/[,，]/).map((c) => c.trim());

    const srcList = await Promise.all(
      idsArr.map(async (id) => {
        const resp = await request.request({
          url: buildUrl(this.host, `/${this.API[this.muban].vodDetail}`),
          method: 'POST',
          params: { vod_id: id },
          headers: this.headers,
        });

        const data = JSON.parse(this.decrypt(resp)).data.vod;
        return data;
      }),
    );
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos = rawList
      .map((v, i) => {
        try {
          const playform: string[] = [];
          const playurls: string[] = [];
          const playlist = v.vod_play_list;
          playlist.forEach((item) => {
            playform.push(item.player_info.show);
            playurls.push(
              item.urls
                .map((it) => {
                  return `${it.name}$${JSON.stringify(it)}`;
                })
                .join('#'),
            );
          });
          v.vod_play_from = playform.join('$$$');
          v.vod_play_url = playurls.join('$$$');
        } catch {
          v.vod_play_from = '暂无资源';
          v.vod_play_url = '暂无资源$0';
        }

        return {
          vod_id: String((v.vod_id || idsArr[i]) ?? ''),
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

    return { list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page } = doc || {};

    const resp = await request.request({
      url: buildUrl(this.host, `/${this.API[this.muban].searchList}`),
      method: 'POST',
      params: { keywords: wd, page, type_id: 0 },
      headers: this.headers,
    });

    const srcList = JSON.parse(this.decrypt(JSON.parse(resp).data)).search_list;
    const rawList = Array.isArray(srcList) ? srcList : [];

    const list: ICmsHomeVod['list'] = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb || v.vod_content || '').trim(),
      }))
      .filter((v) => v.vod_id);

    return { list };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { play } = doc;

    const json = JSON.parse(play);
    const url = json.url;
    const headers = this.appConfig.lazyheader || {};
    let parse_api_url = json.parse_api_url;

    if (/url=/.test(parse_api_url) && parse_api_url.startsWith('http')) {
      const parsedata = await request.request({
        url: parse_api_url,
        headers: this.headers,
      });
      if (parsedata) {
        try {
          if (parsedata.url) {
            let parseurl = parsedata.url;

            if (!/m3u8|mp4|mkv/.test(parseurl)) {
              parseurl = `${parseurl}&type=m3u8`;
            }
            return { url: parseurl, parse: 0, headers };
          }
        } catch {
          return { parse: 1, url: parse_api_url };
        }
      }
    } else {
      parse_api_url = parse_api_url.replace(url, '');
      const token = json.token;
      try {
        const resp = await request.request({
          url: `${this.host}/${this.API[this.muban].vodParse}`,
          method: 'POST',
          headers: this.headers,
          data: {
            parse_api: parse_api_url,
            url: encodeURIComponent(this.encrypt(url)),
            token,
          },
        });
        const parsejson = JSON.parse(JSON.parse(this.decrypt(resp.data)).json);
        let play = parsejson.url;
        if (play) {
          if (!/m3u8|mp4|mkv/.test(play)) {
            play = `${play}&type=m3u8`;
          }
          return { parse: 0, url: play, headers };
        }
      } catch {}
    }
    if (/m3u8|mp4|mkv/.test(url)) {
      return { url, parse: 0, headers };
    }
    return { parse: 1, jx: this.isofficial(url) ? 1 : 0, url };
  }

  async runMain(): Promise<any> {
    return '';
  }

  get API() {
    return {
      AppGet: {
        appLogin: 'api.php/getappapi.index/appLogin',
        initV: 'api.php/getappapi.index/initV119',
        typeFilterVodList: 'api.php/getappapi.index/typeFilterVodList',
        vodDetail: 'api.php/getappapi.index/vodDetail',
        searchList: 'api.php/getappapi.index/searchList',
        vodParse: 'api.php/getappapi.index/vodParse',
        mineInfo: 'api.php/getappapi.index/mineInfo',
        watchRewardAd: 'api.php/getappapi.index/watchRewardAd',
        userBuyVip: 'api.php/getappapi.index/userBuyVip',
      },
      AppQiji: {
        appLogin: 'api.php/qijiappapi.index/appLogin',
        initV: 'api.php/qijiappapi.index/initV120',
        typeFilterVodList: 'api.php/qijiappapi.index/typeFilterVodList',
        vodDetail: 'api.php/qijiappapi.index/vodDetail2',
        searchList: 'api.php/qijiappapi.index/searchList',
        vodParse: 'api.php/qijiappapi.index/vodParse',
        mineInfo: 'api.php/qijiappapi.index/mineInfo',
        watchRewardAd: 'api.php/qijiappapi.index/watchRewardAd',
        userBuyVip: 'api.php/qijiappapi.index/userBuyVip',
      },
    };
  }

  private async vipTime() {
    if (!this.会员时长 && this.appConfig['会员时长']) {
      // eslint-disable-next-line no-eval
      eval(`this.会员时长 = ${ungzip(this.appConfig['会员时长'])}`);
      console.log(`传入会员时长函数:${this.会员时长}`);
    }
    if (this.appConfig.username && this.appConfig.password) {
      // 获取用户信息
      let mineInfo = await request.request({
        url: buildUrl(this.host, `/${this.API[this.muban].mineInfo}`),
        method: 'POST',
        headers: this.headers,
      });
      mineInfo = JSON.parse(this.decrypt(mineInfo.data));
      if (!mineInfo.user) {
        this.init();
        mineInfo = await request.request({
          url: buildUrl(this.host, `${this.API[this.muban].mineInfo}`),
          method: 'POST',
          headers: this.headers,
        });
        mineInfo = JSON.parse(this.decrypt(mineInfo.data));
      }
      if (mineInfo.user.is_vip) {
        const user_end_time = new Date(mineInfo.user.user_end_time * 1000).toLocaleString();
        console.log(`会员到期时间:${user_end_time}`);
      } else {
        if (this.会员时长) {
          // 获取会员时长
          this.会员时长(mineInfo);
          this.init();
        }
      }
    }
  }

  private encrypt(value: string): string {
    return aes.encode({
      key: this.appConfig.key,
      iv: this.appConfig.iv,
      src: value,
      mode: 'cbc',
      pad: 'pkcs7padding',
      outputEncode: 'base64',
    });
  }

  private decrypt(value: string): string {
    try {
      return aes.decode({
        key: this.appConfig.key,
        iv: this.appConfig.iv,
        src: value,
        mode: 'cbc',
        pad: 'pkcs7padding',
      });
    } catch {
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'object') {
        return JSON.stringify(value);
      }
    }
    return '';
  }

  private isofficial(url) {
    const flag =
      /qq.com|iqiyi.com|youku.com|mgtv.com|bilibili.com|sohu.com|ixigua.com|pptv.com|miguvideo.com|le.com|1905.com|fun.tv/;
    return flag.test(url) && !/url=/.test(url);
  }
}

export default T3AppGetAdapter;
