import { XMLParser } from 'fast-xml-parser';
import request from '@main/utils/request';
import { JSONPath } from 'jsonpath-plus';

// XML转JSON配置 https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/1.GettingStarted.md
const xmlOptions = {
  trimValues: true,
  textNodeName: '$text',
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: true,
};
const parser = new XMLParser(xmlOptions);

class T0Adapter {
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
    let response;
    try {
      response = await request({
        url: this.api,
        method: 'GET',
        params: {
          ac: 'class',
        },
      });
    } catch {
      response = await request({
        url: this.api,
        method: 'GET',
      });
    };
    const xml2json = parser.parse(response);
    const data = xml2json?.rss?.class;
    const classList = Array.isArray(data?.ty) ? data.ty : [data?.ty];
    let classes: any[] = [];

    // 分类
    if (Array.isArray(classList) && classList.length > 0) {
      const seenTypeIds = new Set();
      for (const cls of classList) {
        const n = cls.$text.toString().trim();
        if (!seenTypeIds.has(cls.id)) {
          seenTypeIds.add(cls.id.toString());
          classes.push({
            type_id: cls.id.toString(),
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
    let response;
    try {
      response = await request({
        url: this.api,
        method: 'GET',
        params: {
          ac: 'class',
        },
      });
    } catch {
      response = await request({
        url: this.api,
        method: 'GET',
      });
    };

    const xml2json = parser.parse(response);
    const data = xml2json?.rss?.list;
    const videoList = Array.isArray(data?.video) ? data.video : [data?.video];
    if (Array.isArray(videoList) && videoList.length > 0 && !videoList[0].vod_pic) {
      const ids = response.list.map((item) => item.vod_id);
      response = await this.detail({ id: ids });
    }
    const videos: any[] = [];
    for (const vod of videoList) {
      videos.push({
        vod_id: vod.id.toString(),
        vod_name: vod.name.toString(),
        vod_pic: vod.pic,
        vod_remarks: vod.note,
      });
    }
    return {
      page: parseInt(data.page),
      pagecount: parseInt(data.pagecount),
      total: parseInt(data.recordcount),
      list: videos,
    };
  }
  async category(doc: { [key: string]: string }) {
    const { page, tid } = doc;
    const response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'videolist',
        t: tid,
        pg: page,
      },
    });

    const xml2json = parser.parse(response);
    const data = xml2json?.rss?.list;
    const videoList = Array.isArray(data?.video) ? data.video : [data?.video];
    const videos: any[] = [];
    for (const vod of videoList) {
      videos.push({
        vod_id: vod.id.toString(),
        vod_name: vod.name.toString(),
        vod_pic: vod.pic,
        vod_remarks: vod.note,
      });
    }
    return {
      page: parseInt(data.page),
      pagecount: parseInt(data.pagecount),
      total: parseInt(data.recordcount),
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
        ids: Array.isArray(id) ? id.join(',') : id,
      },
    });

    const vodPlayFrom = (dldd) => {
      if (Array.isArray(dldd)) {
        return dldd.map((item) => item.flag).join('$$$');
      } else {
        return dldd.flag;
      }
    };
    const vodPlayUrl = (dldd) => {
      if (Array.isArray(dldd)) {
        return dldd.map((item) => item.$text).join('$$$');
      } else {
        return dldd.$text;
      }
    };

    const xml2json = parser.parse(response);
    const data = xml2json?.rss?.list;
    const videoList = Array.isArray(data?.video) ? data.video : [data?.video];
    const videos: any[] = [];
    for (const vod of videoList) {
      const dldd = vod.dl.dd;
      videos.push({
        vod_id: vod.id,
        vod_name: vod.name,
        vod_pic: vod.pic,
        type_name: vod.type,
        vod_year: vod.year,
        vod_area: vod.area,
        vod_remarks: vod.note,
        vod_actor: vod.actor,
        vod_director: vod.director,
        vod_content: vod.des?.trim(),
        vod_play_from: vodPlayFrom(dldd),
        vod_play_url: vodPlayUrl(dldd),
      });
    }
    return {
      page: parseInt(data.page),
      pagecount: parseInt(data.pagecount),
      total: parseInt(data.recordcount),
      list: videos,
    };
  }
  async search(doc: { [key: string]: string }) {
    const { wd } = doc;
    let response;
    response = await request({
      url: this.api,
      method: 'GET',
      params: {
        ac: 'list',
        wd: encodeURIComponent(wd),
      },
    });

    const xml2json = parser.parse(response);
    const data = xml2json?.rss?.list;
    const videoList = Array.isArray(data?.video) ? data.video : [data?.video];
    if (Array.isArray(videoList) && videoList.length > 0 && !videoList[0].vod_pic) {
      const ids = response.list.map((item) => item.vod_id);
      response = await this.detail({ id: ids });
    }
    const videos: any[] = [];
    for (const vod of videoList) {
      videos.push({
        vod_id: vod.id.toString(),
        vod_name: vod.name.toString(),
        vod_pic: vod.pic,
        vod_remarks: vod.note,
      });
    }
    return {
      page: parseInt(data.page),
      pagecount: parseInt(data.pagecount),
      total: parseInt(data.recordcount),
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
        } catch (e) {
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

export default T0Adapter;
