import request from '@main/utils/request';
import { JSONPath } from 'jsonpath-plus';

class T1Adapter {
  api: string = '';
  playurl: string = '';
  categoryfilter: any[] = [];
  constructor(source) {
    this.api = source.api;
    this.playurl = source.playurl;
    this.categoryfilter = source.categories.split(/[,，]/).map((category) => category.trim());
  }

  async init() {}
  async home() {
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'class',
      },
    });
    let classes: any[] = [];

    // 分类
    if (response?.class) {
      const seenTypeIds = new Set();
      for (const cls of response.class) {
        const n = cls.type_name.toString().trim();
        if (!seenTypeIds.has(cls.type_id)) {
          seenTypeIds.add(cls.type_id.toString());
          classes.push({
            type_id: cls.type_id.toString(),
            type_name: n,
          });
        }
      }
      if (
        Array.isArray(classes) &&
        classes.length > 0 &&
        Array.isArray(this.categoryfilter) &&
        this.categoryfilter.length > 0
      ) {
        classes = classes.filter((v) => !this.categoryfilter.includes(v.type_name));
      }
    }

    return {
      class: classes,
      filters: {},
    };
  }
  async homeVod() {
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'class',
      },
    });
    const videos: any[] = [];
    for (const vod of response.list) {
      videos.push({
        vod_id: vod.vod_id.toString(),
        vod_name: vod.vod_name.toString(),
        vod_pic: vod.vod_pic,
        vod_remarks: vod.vod_remarks,
      });
    }
    return {
      page: parseInt(response.page),
      pagecount: parseInt(response.pagecount),
      total: parseInt(response.total),
      list: videos,
    };
  }
  async category(doc: { [key: string]: string }) {
    let { page, tid } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'detail',
        t: tid,
        pg: page,
      },
    });
    const videos: any[] = [];
    for (const vod of response.list) {
      videos.push({
        vod_id: vod.vod_id.toString(),
        vod_name: vod.vod_name.toString(),
        vod_pic: vod.vod_pic,
        vod_remarks: vod.vod_remarks,
      });
    }
    return {
      page: parseInt(response.page),
      pagecount: parseInt(response.pagecount),
      total: parseInt(response.total),
      list: videos,
    };
  }
  async detail(doc: { [key: string]: string }) {
    const { id } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'detail',
        ids: !Array.isArray(id) ? [id] : id,
      },
    });
    const videos: any[] = [];
    for (const vod of response.list) {
      videos.push({
        vod_id: vod.vod_id,
        vod_name: vod.vod_name,
        vod_pic: vod.vod_pic,
        type_name: vod.type_name,
        vod_year: vod.vod_year,
        vod_area: vod.vod_area,
        vod_remarks: vod.vod_remarks,
        vod_actor: vod.vod_actor,
        vod_director: vod.vod_director,
        vod_content: vod.vod_content.trim(),
        vod_play_from: vod.vod_play_from,
        vod_play_url: vod.vod_play_url,
      });
    }
    return {
      page: parseInt(response.page),
      pagecount: parseInt(response.pagecount),
      total: parseInt(response.total),
      list: videos,
    };
  }
  async search(doc: { [key: string]: string }) {
    const { wd } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'detail',
        wd: encodeURIComponent(wd),
      },
    });
    const videos: any[] = [];
    for (const vod of response.list) {
      videos.push({
        vod_id: vod.vod_id.toString(),
        vod_name: vod.vod_name.toString(),
        vod_pic: vod.vod_pic,
        vod_remarks: vod.vod_remarks,
      });
    }
    return {
      page: parseInt(response.page),
      pagecount: parseInt(response.pagecount),
      total: parseInt(response.total),
      list: videos,
    };
  }
  async play(doc: { [key: string]: string }) {
    const { input } = doc;
    let parse_url = this.playurl || '';
    if (/\.(m3u8|mp4)/.test(input)) {
      return {
        parse: 0,
        url: input,
      };
    } else {
      if (parse_url.startsWith('json:')) {
        const purl = parse_url.replace('json:', '') + input;
        const html = await request({
          url: purl,
          method: 'GET',
        });
        try {
          const queryResult = JSONPath({ path: '$.url', json: html });

          return {
            parse: 0,
            url: queryResult,
          };
        } catch (err) {
          return {
            parse: 1,
            url: input,
          };
        }
      } else {
        return {
          parse: 1,
          url: parse_url + input,
        };
      }
    }
  }
  runMain() {
    return '';
  }
}

export default T1Adapter;
