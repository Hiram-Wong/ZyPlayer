import request from '@main/utils/request';
import { base64Encode } from '@main/utils/hiker/crypto';

class HipyT4Adapter {
  api: string = '';
  ext: any;
  categoryfilter: any[] = [];
  constructor(source) {
    this.api = source.api;
    this.ext = source.ext;
    this.categoryfilter = source.categories ? source.categories.split(/[,，]/).map((category) => category.trim()) : [];
  }

  async init() {}
  async home() {
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        extend: this.ext,
        filter: true,
      },
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
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        extend: this.ext,
        filter: true,
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
      page: parseInt(response.page) || 1,
      pagecount: parseInt(response.pagecount) || 1,
      total: parseInt(response.total) || videos.length,
      list: videos,
    };
  }
  async category(doc: { [key: string]: string }) {
    const { page, tid, f = '{}' } = doc;

    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'videolist',
        t: tid,
        pg: page,
        extend: this.ext,
        ext: base64Encode(f),
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
        ids: id,
        extend: this.ext,
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
      page: 1,
      pagecount: 1,
      total: 1,
      list: videos,
    };
  }
  async search(doc: { [key: string]: string }) {
    const { wd } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        extend: this.ext,
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
    const { flag, input: play } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        extend: this.ext,
        flag: flag,
        play: play,
      },
    });
    return { ...response };
  }
  runMain() {
    return '';
  }
}

export default HipyT4Adapter;
