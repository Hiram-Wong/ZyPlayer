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

class T3AppMumoAdapter {
  private api: string = '';
  private categories: string[] = [];
  private headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 MUOUAPP/10.8.4506.400',
    'brand-model': '22041216C',
    'app-device': 'DeT3Mr5/V+BAz7f+sWKNbxBmh4nMU0VtPYWTXjUUWl4SHrYkNPP/C8/RVvJkD5zOref+Cb+MDuBut1ETgOrGnw==',
    'app-time': '1749291895',
    'sys-version': '14',
    device: '578545e5f04dd2c5',
    os: 'Android',
    'content-type': 'application/x-www-form-urlencoded',
    'app-version': '4.2.0',
  };

  private appConfig: Record<string, string> = {};
  private host: string = '';
  private from: Record<string, string> = {};

  constructor(source: IConstructorOptions) {
    const ext = source.ext as unknown as Record<string, any>;
    this.appConfig = ext.appConfig || {};
    this.api = ext.appConfig.host || '';

    this.categories = source.categories;
  }

  async init(): Promise<void> {
    if (this.appConfig.username && this.appConfig.password) {
      try {
        const resp = await request.request({
          url: `${this.api}/${this.API[this.muban].appLogin}`,
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
      url: buildUrl(this.host, '/api.php/v1.vod/types'),
      method: 'GET',
      headers: this.headers,
    });
    const listdata = JSON.parse(this.decrypt(resp.data));
    const srcList = listdata?.data?.typelist;
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
      url: buildUrl(this.host, '/api.php/v1.vod'),
      method: 'GET',
      params: {
        type: tid,
        class: extend.class || '',
        area: extend.area || '',
        year: extend.year || '',
        by: extend.by || '',
        lang: extend.lang || '',
        version: extend.version || '',
        page,
        limit: 18,
      },
      headers: this.headers,
    });

    const listdata = JSON.parse(this.decrypt(resp.data));
    const srcList = listdata.list;
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
          url: buildUrl(this.api, '/api.php/v1.vod/detail'),
          method: 'GET',
          params: { vod_id: id },
          headers: this.headers,
        });

        const data = JSON.parse(this.decrypt(resp)).data;
        return data;
      }),
    );
    const rawList = Array.isArray(srcList) ? srcList : [];

    const videos = rawList
      .map((v, i) => {
        try {
          const playform: any[] = [];
          const playurls: any[] = [];
          const playlist: any[] = v.vod_play_list;
          if (playlist && playlist.length !== 0) {
            Object.keys(playlist).forEach((key) => {
              this.from[playlist[key].player_info.show] = playlist[key].player_info.from;
              playform.push(playlist[key].player_info.show);
              playurls.push(
                Object.keys(playlist[key].urls)
                  .map((it) => {
                    return `${playlist[key].urls[it].name}$${playlist[key].urls[it].url}`;
                  })
                  .join('#'),
              );
            });
            v.vod_play_from = playform.join('$$$');
            v.vod_play_url = playurls.join('$$$');
          } else {
            v.vod_play_from = '暂无资源';
            v.vod_play_url = '暂无资源$0';
          }
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
      url: buildUrl(this.host, '/api.php/v1.vod'),
      method: 'GET',
      params: { wd, page, limit: 18 },
      headers: this.headers,
    });

    const listdata = JSON.parse(this.decrypt(resp.data));
    const srcList = listdata.search_list || listdata.list;
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
    const { play, flag } = doc;
    let input = play;

    try {
      const playerinfo = await request.request({
        url: `${this.appConfig.jxhost}/api.php`,
        method: 'POST',
        headers: this.headers,
        params: {
          action: 'playerinfo',
        },
      });

      const data = JSON.parse(this.decrypt(playerinfo)).data;

      const parseInfo = data.playerinfo.find((it) => it.playername === this.from[flag]);
      if (parseInfo) {
        const playerjiekou = parseInfo.playerjiekou;
        const parseurl = playerjiekou + input;
        const parsedata = await request.request({
          url: parseurl,
          method: 'GET',
        });

        if (parsedata.url) {
          input = parsedata.url;
        }
      } else {
        const parsevod = await request.request({
          url: `${this.appConfig.jxhost}/json.php`,
          headers: this.headers,
          params: {
            url: input,
            playerkey: this.from[flag],
          },
        });
        if (parsevod) {
          const data = JSON.parse(this.decrypt(parsevod));
          input = data.url;
        }
      }
    } catch {}

    if (!/m3u8|mp4|mkv/.test(input)) {
      if (this.isofficial(input)) {
        return { parse: 1, jx: 1, url: input };
      }
      input = `${input}&type=m3u8`;
    }
    return { parse: 0, url: input };
  }

  async runMain(): Promise<any> {
    return '';
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

export default T3AppMumoAdapter;
