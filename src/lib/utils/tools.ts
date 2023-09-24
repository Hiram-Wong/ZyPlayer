import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from "axios-retry";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import _ from "lodash";
import JSON5 from "json5";
import qs from "qs";

import { sites } from "@/lib/dexie";

const iconv = require("iconv-lite");
import dns from "dns";
import net from "net";
import CLASS_FILTER_CONFIG from '@/config/appFilter';

let controller = new AbortController();

// 创建一个 Axios 实例
const instance: AxiosInstance = axios.create();
// 扩展 AxiosRequestConfig 接口，添加 metadata 属性
interface MyAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    startTime: Date;
  };
}
// 请求拦截器，在请求发送前记录请求开始时间
instance.interceptors.request.use((config: MyAxiosRequestConfig) => {
  config.metadata = { startTime: new Date() };
  return config;
}, (error: any) => {
  return Promise.reject(error);
});
// 响应拦截器，在响应返回后计算耗时时间
instance.interceptors.response.use((response: AxiosResponse) => {
  const endTime = new Date();
  const duration = endTime - response.config.metadata.startTime;
  response.duration = duration;
  return response;
}, (error) => {
  return Promise.reject(error);
});

axiosRetry(axios, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 500;
  }
});

// 初始化对象xml转json https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/1.GettingStarted.md
const xmlOptions = {
  // XML 转 JSON 配置
  trimValues: true,
  textNodeName: "_t",
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  parseAttributeValue: true
};

const parser = new XMLParser(xmlOptions);

Object.fromEntries = function fromEntries(iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};

const buildUrl = (url, paramsStr) => {
  const u = new URL(url);
  const api = u.origin + u.pathname.replace(/\/$/, '');
  const params = new URLSearchParams(u.search);
  
  if (paramsStr.startsWith('?') || paramsStr.startsWith('&')) {
    const p = new URLSearchParams(paramsStr);
    p.forEach((value, key) => params.set(key, value));
    return api + "?" + params.toString();
  } else {
    const cleanParamsStr = paramsStr.startsWith('/') ? paramsStr.slice(1) : paramsStr;
    return api + (cleanParamsStr ? '/' + cleanParamsStr : '');
  }
};

const removeTrailingSlash = (url) => {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

export const removeHTMLTagsAndSpaces = (str) => {
  // 去除HTML标签
  const strippedString = str.replace(/(<([^>]+)>)/gi, "");
  // 去除空格
  const trimmedString = strippedString.replace(/\s+/g, "");
  return trimmedString;
};

// 资源爬虫
const zy = {
  /**
   * 获取资源分类 和 所有资源的总数, 分页等信息
   * @param {*} key 资源网 key
   * @returns
   */
  async classify(key) {
    try {
      const site = await sites.find({ key: key });

      let url;
      if (site.type === 1 || site.type === 0) {
        url = buildUrl(site.api, `?ac=class`);
      } else if (site.type === 2) {
        url = buildUrl(site.api, `&t=1&ac=videolist`);
      } else if (site.type === 3) {
        url = buildUrl(site.api, `/nav`);
      } else if (site.type === 4) {
        url = buildUrl(site.api, `/types`);
      }

      const res = await axios.get(url, { timeout: 3000 });

      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;

      const jsondata = json.rss || json;
      let classData, page, pagecount, limit, total, filters;

      const cmsFilterData = [
        {
          key: "area",
          name: "地区",
          value: [
            {
              "n": "全部",
              "v": ""
            }
          ]
        },
        {
          key: "year",
          name:  "年份",
          value: [
            {
              "n": "全部",
              "v": ""
            }
          ]
        },
        {
          key: "sort",
          name: "排序",
          value: [
            {
              "n": "按更新时间",
              "v": "按更新时间"
            },
            {
              "n": "按上映年份",
              "v": "按上映年份"
            },{
              "n": "按片名",
              "v": "按片名"
            }
          ]
        }
      ];

      if (site.type === 0) {
        // 有些网站返回的分类名里会含有一串包含在{}内的字符串,移除掉
        classData = jsondata.class.ty.map((item) => ({
          type_id: item._id,
          type_name: item._t.replace(/\{.*\}/i, ''),
        }));
        classData.unshift({
          type_id: 0,
          type_name: '最新',
        })
        page = jsondata.list._page;
        pagecount = jsondata.list._pagecount;
        limit = parseInt(jsondata.list._pagesize);
        total = jsondata.list._recordcount;

        filters = {};
        for (let item of classData) {
          const key = item.type_id
          filters[key]  = cmsFilterData
        }
      } else if (site.type === 1) {
        classData = jsondata.class;
        classData.unshift({
          type_id: 0,
          type_name: '最新',
        })
        page = jsondata.page;
        pagecount = jsondata.pagecount;
        limit = parseInt(jsondata.limit);
        total = jsondata.total;

        filters = {};
        for (let item of classData) {
          const key = item.type_id
          filters[key]  = cmsFilterData
        }
      } else if (site.type === 2) {
        const resClass = await axios.get(site.api);
        const jsonClass = resClass.data;
        const jsondataClass =
          jsonClass?.rss === undefined ? jsonClass : jsonClass.rss;
        classData = jsondataClass.class;
        page = jsondata.page;
        pagecount = jsondata.pagecount;
        limit = parseInt(jsondata.limit);
        total = jsondata.total;
        filters = jsonClass?.filters === undefined ? [] : jsonClass.filters;
      } else if (site.type === 3 || site.type === 4) {
        if (site.type === 3) classData = jsondata.data || jsondata.list;
        else if (site.type === 4) classData = jsondata.data.list;
        page = 1;
        pagecount = 9999;
        limit = 20;
        total = 9999;
        filters = {};

        if (site.type === 4) {
          const { data } = await axios.get(removeTrailingSlash(site.api), { timeout: 3000 });
          limit = data.data.limit;
          total = data.data.total;
        }

        classData.forEach(classItem => {
          if (classItem.type_extend) {
            const result = [];
            for (const key in classItem.type_extend) {
              const value = classItem.type_extend[key];
              if (!_.isEmpty(value) && !['star','state','version','director'].includes(key)) {
                const valueList = value.split(',').map((item) => item.trim());
                const options = valueList.map((value) => ({ n: value === "全部" ? "全部" : value, v: value }));
                result.push({ key, name: _.find(CLASS_FILTER_CONFIG, { key }).desc, value: [{ n: "全部", v: "" }, ...options] });
              }
            }
            filters[classItem.type_id]= result
          }
        });
      }

      return {
        classData,
        page,
        pagecount,
        limit,
        total,
        filters
      };
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取资源列表
   * @param {*} key 资源网 key
   * @param {number} [pg=1] 翻页 page
   * @param {*} t 分类 type
   * @returns
   */
  convertVideoList(videoItems) {
    return videoItems.map(
      ({
        id: vod_id,
        tid: type_id,
        type: type_name,
        pic: vod_pic,
        note: vod_remark,
        name: vod_name,
        des: vod_content,
        year: vod_year,
        area: vod_area,
        director: vod_director,
        actor: vod_actor
      }) => ({
        vod_id,
        type_id,
        type_name,
        vod_pic,
        vod_remark,
        vod_name,
        vod_blurb: removeHTMLTagsAndSpaces(vod_content),
        vod_year: _.toString(vod_year),
        vod_area,
        vod_content,
        vod_director,
        vod_actor
      })
    );
  },
  async list(key, pg = 1, t, f = {}) {
    try {
      const site = await sites.find({ key: key });
      let url;
      if (site.type === 3) {
        url = buildUrl(site.api, `video?tid=${t}&pg=${pg}`);
        if (Object.keys(f).length !== 0) {
          url = buildUrl(url, `&${f}`);
        }
      } else if (site.type === 4) {
        url = buildUrl(site.api, `?tid=${t}&page=${pg}`);
        if (Object.keys(f).length !== 0) {
          url = buildUrl(url, `&${f}`);
        }
      } else {
        url = buildUrl(site.api, `?ac=videolist&t=${t}&pg=${pg}`);
        if (Object.keys(f).length !== 0 && site.type === 2) {
          url = buildUrl(url, `&f=${JSON.stringify(f)}`);
        }
      }

      const { data } = await axios.get(url);
      let json = data;
      if (site.type === 0) json = parser.parse(data);

      const jsondata = json.rss || json;
      let videoList = jsondata.list || jsondata.data || [];
      
      if (site.type === 0) {
        videoList = this.convertVideoList(jsondata.list.video);
      } else if (site.type === 3) {
        videoList = jsondata.data || jsondata.list
      } else if (site.type === 4) {
        videoList = jsondata.data.list
      }
      return videoList;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取资源热榜列表
   * @param {*} key 资源网 key
   * @param {number} [pg=1] 翻页 page
   * @param {*} t 分类 type
   * @param {*} h 时间 time
   * @returns
   */
  convertHotList(hotItems) {
    return hotItems.map(
      ({
        id: vod_id,
        tid: type_id,
        type: type_name,
        note: vod_remark,
        name: vod_name
      }) => ({
        vod_id,
        type_id,
        type_name,
        vod_remark,
        vod_name
      })
    );
  },
  async hot(key, h) {
    try {
      const site = await sites.find({ key: key });
      let url;
      if (site.type === 3) {
        url = buildUrl(site.api, `/index_video`);
      } else {
        url = buildUrl(site.api, `?ac=hot&h=${h}`);
      }

      const { data } = await axios.get(url);
      let json = data;
      if ( site.type === 0 ) json = parser.parse(data);
      const jsondata = json.rss || json;
      let videoList = jsondata.list || [];
      if ( site.type === 0 ) {
        videoList = this.convertHotList(jsondata.list.video)
      } else if ( site.type === 2 ) {
        videoList = data.list;
      } else if ( site.type === 3 ) {
        videoList = data.list.flatMap(typeObj => typeObj.vlist);
      }

      let hotList = [];
      if (site.type === 3 || site.type === 2) {
        hotList = videoList;
      } else {
        for (let i = 0; i < 10; i++) {
          const item = videoList[i];
          if (i in [0, 1, 2, 3]) {
            const pic = await this.detail(key, item.vod_id);
            item["vod_pic"] = pic[0].vod_pic;
          }
          hotList.push(item);
        }
      }
      return hotList;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 搜索资源
   * @param {*} key 资源网 key
   * @param {*} wd 搜索关键字
   * @returns
   */
  convertSearchList(searchItem) {
    const result = searchItem.map((item) => {
      const {
        id: vod_id,
        tid: type_id,
        type: type_name,
        note: vod_remark,
        name: vod_name,
        last: vod_time,
        dt: vod_play_from
      } = item;
      return {
        vod_id,
        type_id,
        type_name,
        vod_remark,
        vod_name,
        vod_time,
        vod_play_from
      };
    });

    return result;
  },
  async search(key, wd) {
    // xml坑: 单条结果是dict 多条结果list
    try {
      const site = await sites.find({ key: key });
      let url;
      if ( site.type === 3 ) url = buildUrl(site.api, `/search?text=${encodeURIComponent(wd)}`);
      else url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);
      const { data } = await axios.get(url, { timeout: 3000 });

      let json = data;
      if (site.type === 0) json = parser.parse(data);

      const jsondata = json?.rss ?? json;
      if (!jsondata) return null;

      let videoList = jsondata.data || jsondata.list || [];
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertSearchList(videoList);
      } else if (site.type === 4) {
        videoList = jsondata.data.list;
      }
      if (videoList.length === 0) return null;

      return videoList;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 搜索资源详情
   * @param {*} key 资源网 key
   * @param {*} wd 搜索关键字
   * @returns
   */
  async searchFirstDetail(key, wd) {
    try {
      const site = await sites.find({ key: key });
      let url;
      if ( site.type === 3 ) url = buildUrl(site.api, `/search?text=${encodeURIComponent(wd)}`);
      else url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);
      const { data } = await axios.get(url);

      let json = data;
      if (site.type === 0) json = parser.parse(data);

      const jsondata = json?.rss === undefined ? json : json.rss;
      if (!jsondata) return null;

      let videoList = jsondata.data || jsondata.list || [];
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!videoList) return null;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertSearchList(videoList);
      } else if (site.type === 4) {
        videoList = jsondata.data.list;
      }
      if (videoList.length === 0) return null;

      let detailRes = await this.detail(key, videoList[0].vod_id);
      if(_.isArray(detailRes)) detailRes = detailRes[0];
      return detailRes;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取资源详情
   * @param {*} key 资源网 key
   * @param {*} id 资源唯一标识符 id
   * @returns
   */
  convertDetailList(detailItems) {
    const vodPlayFrom = (dldd) => {
      if (_.isArray(dldd)) {
        return dldd.map((item) => item._flag).join("$$$");
      } else {
        return dldd._flag;
      }
    };
    const vodPlayUrl = (dldd) => {
      if (_.isArray(dldd)) {
        return dldd.map((item) => item._t).join("$$$");
      } else {
        return dldd._t;
      }
    };

    return detailItems.map(
      ({
        id: vod_id,
        tid: type_id,
        type: type_name,
        pic: vod_pic,
        note: vod_remark,
        name: vod_name,
        des: vod_content,
        year: vod_year,
        area: vod_area,
        director: vod_director,
        actor: vod_actor,
        dl: { dd: dldd }
      }) => ({
        vod_id,
        type_id,
        type_name,
        vod_pic,
        vod_remark,
        vod_name,
        vod_blurb: removeHTMLTagsAndSpaces(vod_content),
        vod_year,
        vod_area,
        vod_content,
        vod_director,
        vod_actor,
        vod_play_from: vodPlayFrom(dldd),
        vod_play_url: vodPlayUrl(dldd)
      })
    );
  },
  async detail(key, id) {
    try {
      const site = await sites.find({ key: key });
      let url;
      if (site.type === 3) {
        url = buildUrl(site.api, `/video_detail?id=${id}`);
      } else if (site.type === 4) {
        url = buildUrl(site.api, `/detail?vod_id=${id}`);
      } else{
        url = buildUrl(site.api, `?ac=detail&ids=${id}`);
      }
      const { data } = await axios.get(url);
      let json;
      if ( site.type === 0 ) json = parser.parse(data);
      else json = data;

      const jsondata = json?.rss ?? json;
      let videoList = jsondata.data || jsondata.list || [];
      // 坑: 单条结果是dict 多条结果list
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertDetailList(videoList);
      } else if (site.type === 3) {
        videoList = jsondata.data;
        if (!_.isArray(videoList)) videoList = [videoList];
      } else if (site.type === 4) {
        videoList = jsondata.data.list;
      }

      if (!videoList) return;

      const videoData = videoList.map((video) => {
        // 播放源
        const playFrom = video.vod_play_from;
        const playSource = playFrom.split("$").filter(Boolean);
        // 剧集
        const playUrl = video.vod_play_url;
        const playUrlDiffPlaySource = playUrl.split("$$$"); // 分离不同播放源
        const playEpisodes = playUrlDiffPlaySource.map((item) =>
          item
            .replace(/\$+/g, '$')
            .split('#')
            .map((e) => {
              if (!e.includes('$')) e = `正片$${e}`;
              return e;
            }),
        );
        const fullList = Object.fromEntries(
          playSource.map((key, index) => [key, playEpisodes[index]])
        );

        return {
          ...video,
          fullList: fullList
        };
      });

      return videoData;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 检查资源
   * @param {*} key 资源网 key
   * @returns boolean
   */
  async check(key) {
    try {
      const data = await this.classify(key);
      return {
        status: !_.isEmpty(data.classData),
        resource: data.total
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  /**
   * 检查直播源
   * @param {*} channel 直播频道 url
   * @returns boolean
   */
  // async checkChannel(url) {
  //   try {
  //     const res = await axios.get(url, {
  //       signal: controller.signal,
  //       timeout: 3000
  //     });
  //     const manifest = res.data;
  //     const parser = new M3u8Parser();
  //     parser.push(manifest);
  //     parser.end();
  //     const parsedManifest = parser.manifest;

  //     if (parsedManifest.segments.length > 0) return true;

  //     // 兼容性处理 抓包多次请求规则 #EXT-X-STREAM-INF 带文件路径的相对路径
  //     const responseURL = res.request.responseURL;
  //     const { uri } = parsedManifest.playlists[0];
  //     if (res.data.indexOf("encoder") > 0) {
  //       // request1: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240389_1/playlist.m3u8?CONTENTID=00000110240389_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
  //       // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8000000,CODECS="avc,mp21" encoder/0/playlist.m3u8?CONTENTID=00000110240127_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
  //       // request2: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240303_1/encoder/0/playlist.m3u8?CONTENTID=00000110240303_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
  //       const index = responseURL.lastIndexOf("/");
  //       const urlLastParam = responseURL.substring(0, index + 1);
  //       const newUrl = urlLastParam + uri;
  //       return this.checkChannel(newUrl);
  //     } else if (uri.startsWith("http") || uri.startsWith("//")) {
  //       // request1: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/index.m3u8?IASHttpSessionId=OTT8798520230127055253191816
  //       // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8468480 http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8798520230127055253191816&zte_bandwidth=1000&bandwidth=8468480&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
  //       // request2: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8867820230127053805215983&zte_bandwidth=1000&bandwidth=8467456&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
  //       const newUrl = uri;
  //       return this.checkChannel(newUrl);
  //     } else if (
  //       /^\/[^\/]/.test(uri) ||
  //       (/^[^\/]/.test(uri) && uri.startsWith("http"))
  //     ) {
  //       // request1: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//index.m3u8
  //       // #EXT-X-STREAM-INF:BANDWIDTH=15435519,AVERAGE-BANDWIDTH=15435519,RESOLUTION=3840x2160,CODECS="hvc1.1.6.L150.b0,mp4a.40.2",AUDIO="audio_mp4a.40.2_48000",CLOSED-CAPTIONS=NONE,FRAME-RATE=25 1/v15M/index.m3u8
  //       // request2: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//1/v15M/index.m3u8
  //       const index = responseURL.lastIndexOf("/");
  //       const urlLastParam = responseURL.substring(0, index + 1);
  //       const newUrl = urlLastParam + uri;
  //       return this.checkChannel(newUrl);
  //     }

  //     return false;
  //   } catch (err) {
  //     throw err;
  //   }
  // },
  
  async checkChannel(url) {
    try {
      const res = await instance.get(url);
      // console.log(res)
      const period = res.duration;
      // console.log(period)
      return period;
    } catch (err) {
      // console.log(err)
      return false;
    }
  },
  async stopCheckChannel() {
    controller.abort();

    controller = new AbortController();
  },
  /**
   * 提取ck/dp播放器m3u8
   * @param {*} parserFilmUrl film url
   * @returns boolean
   */
  async parserFilmUrl(url) {
    const hostname = new URL(url).hostname;
    try {
      const response = await axios.get(url);
      let urlPlay;
      // 全局提取完整地址
      const urlGlobal = response.data.match(/(https?:\/\/[^\s]+\.m3u8)/);
      if (urlGlobal) {
        urlPlay = urlGlobal[0];
        return urlPlay;
      }
      // 局部提取地址 提取参数拼接域名
      const urlParm = response.data.match(/\/(.*?)(\.m3u8)/);
      if (urlParm) urlPlay = hostname + urlParm[0];
      return urlPlay;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取电子节目单
   * @param {*} url epg阶段单api
   * @param {*} tvg_name 节目名称
   * @param {*} date 日期 2023-01-31
   * @returns 电子节目单列表
   */
  async iptvEpg(url, tvg_name, date) {
    try {
      const res = await axios.get(url, {
        params: {
          ch: tvg_name,
          date: date
        }
      });
      const epgData = res.data.epg_data;
      return epgData;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 判断 m3u8 文件是否为直播流
   * @param {*} url m3u8地址
   * @returns 是否是直播流
   */
  async isLiveM3U8(url) {
    try {
      const res = await axios.get(url);
      const m3u8Content = res.data;
      
      const isLiveStream = !(
        m3u8Content.indexOf('#EXT-X-ENDLIST') !== -1 ||
        (m3u8Content.indexOf('#EXT-X-PLAYLIST-TYPE') !== -1 &&
          m3u8Content.match(/#EXT-X-PLAYLIST-TYPE:(.*)/)[1].toUpperCase() === 'VOD') ||
        (m3u8Content.indexOf('#EXT-X-MEDIA-SEQUENCE') !== -1 &&
          parseInt(m3u8Content.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/)[1]) === 0)
      );
      
      return isLiveStream;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取豆瓣页面链接
   * @param {*} id 视频唯一标识
   * @param {*} name 视频名称
   * @param {*} year 视频年份
   * @returns 豆瓣页面链接，如果没有搜到该视频，返回搜索页面链接
   */
  async doubanLink(id, name, year) {
    const nameToSearch = encodeURI(name.trim());
    const doubanSearchLink =
      id && parseInt(id) !== 0
        ? `https://movie.douban.com/subject/${id}`
        : `https://www.douban.com/search?cat=1002&q=${nameToSearch}`;
    try {
      const res = await axios.get(doubanSearchLink);
      const $ = cheerio.load(res.data);
      let link = "";
      $("div.result").each(function () {
        const linkInDouban = $(this).find("div>div>h3>a").first();
        const nameInDouban = linkInDouban.text().replace(/\s/g, "");
        const subjectCast = $(this).find("span.subject-cast").text();
        if (
          nameToSearch === encodeURI(nameInDouban) &&
          subjectCast &&
          subjectCast.includes(year)
        ) {
          link = linkInDouban.attr("href");
          return;
        }
      });
      return link || doubanSearchLink;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取豆瓣评分
   * @param {*} id 视频唯一标识
   * @param {*} name 视频名称
   * @param {*} year 视频年份
   * @returns 豆瓣评分
   */
  async doubanRate(id, name, year) {
    try {
      const link = await this.doubanLink(id, name, year);
      if (link.includes("https://www.douban.com/search")) {
        return "暂无评分";
      } else {
        const response = await axios.get(link);
        const parsedHtml = cheerio.load(response.data);
        const rating = parsedHtml("body")
          .find("#interest_sectl")
          .first()
          .find("strong")
          .first()
          .text()
          .replace(/\s/g, "");
        return rating || "暂无评分";
        // const rating = parsedHtml('body').find('#interest_sectl').first().find('strong').first();
        // if (rating.text()) {
        //   return rating.text().replace(/\s/g, '');
        // } else {
        //   return '暂无评分';
        // }
      }
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取豆瓣相关视频推荐列表
   * @param {*} id 视频唯一标识
   * @param {*} name 视频名称
   * @param {*} year 视频年份
   * @returns 豆瓣相关视频推荐列表
   */
  async doubanRecommendations(id, name, year) {
    try {
      const link = await this.doubanLink(id, name, year);
      if (link.includes("https://www.douban.com/search")) {
        return [];
      } else {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const recommendations = $("div.recommendations-bd")
          .find("div>dl>dd>a")
          .map((index, element) => $(element).text())
          .get();
        return recommendations;
      }
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取豆瓣热点视频列表
   * @param {*} type 类型
   * @param {*} tag 标签
   * @param {*} limit 显示条数
   * @param {*} start 跳过
   * @returns 豆瓣热点视频推荐列表
   */
  async doubanHot(type, tag, limit = 20, start = 0) {
    const doubanHotLink = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURI(
      tag
    )}&page_limit=${limit}&page_start=${start}`;
    try {
      const {
        data: { subjects }
      } = await axios.get(doubanHotLink);
      return subjects.map((item) => ({
        vod_id: item.id,
        vod_name: item.title,
        vod_remarks: item.episodes_info,
        vod_pic: item.cover
      }));
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取夸克电影实时热门列表
   * @returns 夸克电影实时热门列表
   */
  async quarkHot() {
    const quarkHotLink = `https://com-cms.quark.cn/cms?partner_id=quark-covid&group=quark-covid&uc_param_str=dnfrpfbivessbtbmnilauputogpintnwmtsvcppcprsnnnchmicckpgi&uid=`;
    try {
      const res = await axios.get(quarkHotLink);
      const resData = res.data;
      if (resData.success) {
        return resData.data.allUserRes.hot_search_movie[0].items[0].list.map(
          (item) => ({
            vod_id: item.name,
            vod_name: item.name,
            vod_remarks: item.video_tag,
            vod_pic: item.cover_url
          })
        );
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取百度实时热门列表
   * @returns 百度实时热门列表
   */
  async baiduHot() {
    const quarkHotLink = `https://opendata.baidu.com/api.php?resource_id=51274&ks_from=aladdin&new_need_di=1&from_mid=1&sort_type=1&query=%E7%94%B5%E8%A7%86%E5%89%A7%E6%8E%92%E8%A1%8C%E6%A6%9C&tn=wisexmlnew&dsp=iphone&format=json&ie=utf-8&oe=utf-8&q_ext=%7B%22query_key%22%3A1%2C%22is_person_related%22%3A0%2C%22video_type_list%22%3A%5B%5D%7D&sort_key=1&stat0=%E7%94%B5%E8%A7%86%E5%89%A7&stat1=%E5%85%A8%E9%83%A8&stat2=%E5%85%A8%E9%83%A8&stat3=%E5%85%A8%E9%83%A8&rn=10&pn=0&trigger_srcid=51251&sid=38515_36559_38540_38591_38596_38582_36804_38434_38414_38640_26350_38623`;
    try {
      const res = await axios.get(quarkHotLink);
      const resData = res.data;
      if (resData.ResultCode === 0) {
        console.log(
          resData.Result[0].DisplayData.resultData.tplData.result.result
        );
        return resData.Result[0].DisplayData.resultData.tplData.result.result.map(
          (item) => ({
            vod_id: item.urlsign,
            vod_name: item.ename,
            vod_remarks: item.additional,
            vod_pic: item.img
          })
        );
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  },
  // 酷云通用的异步请求函数
  async  kyHotRequest(url) {
    try {
      const { data } = await axios.get(url);
      // 根据具体的接口返回状态判断是否成功
      if ( data.status) {
        return data.data;
      }
    } catch (err) {
      // 处理请求错误，返回默认值或者具体错误信息
      console.error('Error making API request:', err.message);
      return null; // 返回适当的默认值
    }
  },
  /**
   * 获取酷云[旧]热榜列表
   * @param {*} date 日期2023-05-03 必须补全0
   * @param {*} type 类型 1.电影  2.剧集  3.综艺
   * @param {*} plat 平台 1.腾讯视频  2.爱奇艺  3.优酷  4.芒果
   * @returns 酷云[旧]热榜推荐列表
   */
  async kuyunHot(date, type, plat) {
    const url = `https://eye.kuyun.com/api/netplat/ranking?date=${date}&type=${type}&plat=${plat}`;
    const data = await this.kyHotRequest(url);
    return data ? data.list.map((item) => ({
      vod_id: item.ca_id,
      vod_name: item.name,
      vod_hot: item.num
    })) : [];
  },
  /**
   * 获取酷云[新]热榜列表
   * @param {*} date 日期2023-05-03 必须补全0
   * @param {*} type 类型 1.全端播放  2.全端热度  3.实时收视  4.历史收视
   * @param {*} plat 平台 0.全端热度  1.爱奇艺  2.腾讯视频  3.优酷  4.芒果
   * @returns 酷云[新]热榜推荐列表
   */
  async kyLiveHot(date, type, plat) {
    const url = `https://www.ky.live/api/fullhot?vt=${type}&sd=${date}&plt=${plat}`;
    const data = await this.kyHotRequest(url);
    return data ? data.map((item) => ({
      vod_id: item.caid,
      vod_name: item.epg,
      vod_hot: item.hot
    })) : [];
  },
  /**
   * 获取云合热榜列表
   * @param {*} date 日期2023/07/28  sort为allHot 忽略该参数
   * @param {*} channelType 类型 tv:连续剧  art:综艺  movie.电影  tvshortVideo.微短剧  animation.动漫
   * @param {*} sort 排序 allHot:全舆情热度  spreadHot:话题传播度  searchHot:搜索热度  feedbackHot:反馈活跃度
   * @param {*} day  最近几天
   * @returns 云合热榜推荐列表
   */
  async enlightentHot(date, sort, channelType, day) {
    const url = `https://www.enlightent.cn/sxapi/top/getHeatTop.do`;
    try {
      const params = qs.stringify({
        sort,
        channelType,
        day,
        date,
      });
      const { data } = await axios.post(url, params)
      if (data && !_.isEmpty(data.content)) {
        return data.content.map((item) => ({
          vod_id: item.nameId,
          vod_name: item.name,
          vod_hot: item.allHot
        }));
      } else {
        return [];
      }
    } catch (err) {
      console.error('Error making API request:', err.message);
      throw err;
    }
  },
  /**
   * 获取解析url链接的标题
   * @param {*} url 需要解析的地址
   * @returns 解析标题
   */
  async getAnalysizeTitle(url) {
    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      let html = "";
      if (url.includes("sohu")) {
        html = iconv.decode(Buffer.from(res.data), "gb2312");
      } else {
        html = iconv.decode(Buffer.from(res.data), "utf-8");
      }
      const $ = cheerio.load(html);
      return $("title").text();
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取配置文件
   * @param {*} url 需要获取的地址
   * @returns 配置文件
   */
  async getConfig(url, header = {}) {
    try {
      let res;
      // if( header ) res = await axios.get(url, {headers: { ...header }});
      // else res = await axios.get(url);
      res = await axios.get(url);
      let response;

      try {
        response = JSON5.parse(res.data);
      } catch (err) {
        response = res.data;
      }

      return response || false;
    } catch (err) {
      throw err;
    }
  },

  /**
   * 获取配置文件
   * @param {*} url 需要获取的地址
   * @returns 配置文件
   */
  async getRealUrl(key, url) {
    try {
      const site = await sites.find({ key: key });
      const parsusePrefix = site.api;

      const hostname = new URL(parsusePrefix).hostname;
      const protocol = new URL(parsusePrefix).protocol;
      const port = new URL(parsusePrefix).port;

      let parsueUrl;
      if (port)
        parsueUrl = `${protocol}//${hostname}:${port}/web/302redirect?url=${encodeURIComponent(
          url
        )}`;
      else
        parsueUrl = `${protocol}//${hostname}/web/302redirect?url=${encodeURIComponent(
          url
        )}`;

      const res = await axios.get(parsueUrl);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 判断url是否为ipv6
   * @param {String} url  请求地址
   * @return {Boolean}
   */
  async checkUrlIpv6(url) {
    let hostname = new URL(url).hostname;
    // console.log(hostname)
    const ipv6Regex = /^\[([\da-fA-F:]+)\]$/; // 匹配 IPv6 地址
    const match = ipv6Regex.exec(hostname);
    if (match) {
      // console.log(match[1])
      hostname = match[1];
    }
    const ipType = net.isIP(hostname);
    if (ipType === 4) {
      // console.log(`1.ipv4:${hostname}`)
      return "IPv4";
    } else if (ipType === 6) {
      // console.log(`1.ipv6:${hostname}`)
      return "IPv6";
    } else {
      try {
        const addresses = await dns.promises.resolve(hostname);
        const ipType = net.isIP(addresses[0]);
        if (ipType === 4) {
          // console.log(`2.ipv4:${addresses[0]}`)
          return "IPv4";
        } else if (ipType === 6) {
          // console.log(`2.ipv6:${addresses[0]}`)
          return "IPv6";
        } else {
          return "Unknown";
        }
      } catch (err) {
        console.log(url, hostname);
        throw err;
      }
    }
  },
};

export default zy;
