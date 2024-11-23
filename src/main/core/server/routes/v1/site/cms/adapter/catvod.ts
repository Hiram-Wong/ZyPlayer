import request from '@main/utils/request';
import { buildUrl } from '@main/utils/hiker/base';

class CatvodAdapter {
  api: string = '';
  ext: object = {};
  categoryfilter: any[] = [];

  constructor(source) {
    this.api = source.api;
    this.categoryfilter = source.categories.split(/[,，]/).map((category) => category.trim());
  }

  async init() {
    await request({
      url: buildUrl(this.api, '/init'),
      method: 'POST',
      data: {},
    });
  }
  async home() {
    const response = await request({
      url: buildUrl(this.api, '/home'),
      method: 'POST',
      data: {},
    });
    let classes: any[] = [];
    let filters: object = {};
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

    // 筛选
    if (typeof response?.filters === 'object' && Object.keys(response?.filters).length > 0) {
      filters = response.filters;
    }

    return {
      class: classes,
      filters: filters,
    };
  }
  async homeVod() {
    return {
      page: 1,
      pagecount: 1,
      total: 0,
      list: [],
    };
  }
  async category(doc: { [key: string]: string }) {
    const { page, tid, f = '{}' } = doc;
    const response = await request({
      url: buildUrl(this.api, `/category`),
      method: 'POST',
      data: {
        id: tid,
        page: page,
        filters: JSON.parse(f),
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
      url: buildUrl(this.api, `/detail`),
      method: 'POST',
      data: {
        id: Array.isArray(id) ? id[0] : id,
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
        vod_content: vod.vod_content?.trim(),
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
    const { wd, pg } = doc;
    const response = await request({
      url: buildUrl(this.api, `/search`),
      method: 'POST',
      data: {
        pg: pg,
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
    const { flag, input } = doc;
    const response = await request({
      url: buildUrl(this.api, `/play`),
      method: 'POST',
      data: {
        flag: flag,
        id: input,
      },
    });
    let res = response;
    if (response?.url && response.url.startsWith('js2p')) {
      const match = response.url.match(/\/proxy\/([^\/]+)\/([^\/]+)\/([^\/]+)\//);
      if (match) {
        const what = match[1];
        const ids = match[2];
        const end = match[3];
        res.url = ids;
      }
    }
    return res;
  }
  runMain() {
    return '';
  }
}

export default CatvodAdapter;
