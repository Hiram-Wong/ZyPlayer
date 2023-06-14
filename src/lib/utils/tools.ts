import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { Parser as M3u8Parser } from "m3u8-parser";
import _ from "lodash";
import JSON5 from "json5";

import { sites } from "@/lib/dexie";

import iconv from "iconv-lite";
import prettier from "prettier";
import ipRegex from 'ip-regex';
import { fetch, Body, getClient, ResponseType } from '@tauri-apps/api/http';
import { invoke } from "@tauri-apps/api/tauri";

// const iconv = require("iconv-lite");
// const prettier = require("prettier");

let controller = new AbortController();

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

const buildUrl = (url, params_str) => {
  const u = new URL(url);
  const p = new URLSearchParams(params_str);
  const api = u.origin + u.pathname;
  let params = Object.fromEntries(u.searchParams.entries());
  let params_obj = Object.fromEntries(p.entries());
  Object.assign(params, params_obj);
  let plist = [];
  for (let key in params) {
    plist.push(`${key}=${params[key]}`);
  }
  return api + "?" + plist.join("&");
};

export const removeHTMLTagsAndSpaces = (str) => {
  // 去除HTML标签
  const strippedString = str.replace(/(<([^>]+)>)/gi, "");
  // 去除空格
  const trimmedString = strippedString.replace(/\s+/g, "");
  return trimmedString;
};

const isIp = (ipAddress: string) => {
  if (ipRegex({ exact: true }).test(ipAddress)) {
    if (ipRegex.v6({ exact: true }).test(ipAddress)) {
      return 6;
    } else if (ipRegex.v4({ exact: true }).test(ipAddress)) {
      return 4;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

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
      }

      // const res = await axios.get(url, { timeout: 3000 });
      const res = await fetch(url, { timeout: 3000 });

      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;

      const jsondata = json?.rss === undefined ? json : json.rss;
      let classData;
      let page;
      let pagecount;
      let limit;
      let total;
      let filters;

      if (site.type === 0) {
        const arr = [];
        // 有些网站返回的分类名里会含有一串包含在{}内的字符串,移除掉
        const regex = /\{.*\}/i;
        for (const item of jsondata.class.ty) {
          const items = {
            type_id: item._id,
            type_name: item._t.replace(regex, "")
          };
          arr.push(items);
        }
        classData = arr;
        page = jsondata.list._page;
        pagecount = jsondata.list._pagecount;
        limit = parseInt(jsondata.list._pagesize);
        total = jsondata.list._recordcount;
        filters = [];
      } else if (site.type === 1) {
        classData = jsondata.class;
        page = jsondata.page;
        pagecount = jsondata.pagecount;
        limit = parseInt(jsondata.limit);
        total = jsondata.total;
        filters = [];
      } else if (site.type === 2) {
        // const resClass = await axios.get(site.api);
        const resClass = await fetch(site.api);
        const jsonClass = resClass.data;
        const jsondataClass =
          jsonClass?.rss === undefined ? jsonClass : jsonClass.rss;
        classData = jsondataClass.class;
        page = jsondata.page;
        pagecount = jsondata.pagecount;
        limit = parseInt(jsondata.limit);
        total = jsondata.total;
        filters = jsonClass?.filters === undefined ? [] : jsonClass.filters[1];
      }

      if (!classData || !jsondata?.list) return null;

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
        vod_year,
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
      url = buildUrl(site.api, `?ac=videolist&t=${t}&pg=${pg}`);
      if (Object.keys(f).length !== 0)
        url = buildUrl(
          site.api,
          `?ac=videolist&t=${t}&pg=${pg}&f=${JSON.stringify(f)}`
        );
      // const res = await axios.get(url);
      const res = await fetch(url);
      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;
      const jsondata = json.rss || json;
      console.log(jsondata);
      let videoList = jsondata.list || [];
      if (site.type === 0) {
        videoList = this.convertVideoList(jsondata.list.video);
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
  // https://y.ioszxc123.me/api/v1/Vod/hot?limit=10&order=1&os=2&page=1&type=2
  async hot(key, h) {
    try {
      const site = await sites.find({ key: key });
      // const url = buildUrl(site.api,`?ac=hot&h=${h}`);
      const url = buildUrl(site.api, `?ac=hot`);
      // const res = await axios.get(url);
      const res = await fetch(url);
      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;
      const jsondata = json.rss || json;
      let videoList = jsondata.list || [];
      if (site.type === 0) {
        console.log(jsondata.list);
        videoList = this.convertHotList(jsondata.list.video);
      }
      const data = [];
      for (let i = 0; i < 10; i++) {
        const item = videoList[i];
        if (i in [0, 1, 2, 3]) {
          const pic = await this.detail(key, item.vod_id);
          item["vod_pic"] = pic.vod_pic;
        }
        data.push(item);
      }
      return data;
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
      const url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);
      // const res = await axios.get(url, { timeout: 3000 });
      const res = await fetch(url, { timeout: 3000 });

      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;

      const jsondata = json?.rss ?? json;
      if (!jsondata) return null;

      let videoList = jsondata.list;
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertSearchList(videoList);
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
      const url = buildUrl(site.api, `?ac=search&wd=${encodeURI(wd)}`);
      // const res = await axios.get(url);
      const res = await fetch(url);

      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;

      const jsondata = json?.rss === undefined ? json : json.rss;
      if (!jsondata) return null;

      let videoList = jsondata.list;
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!videoList) return null;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertSearchList(videoList);
      }
      if (videoList.length === 0) return null;

      const detailRes = await this.detail(key, videoList[0].vod_id);
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
      const url = buildUrl(site.api, `?ac=videolist&ids=${id}`);
      // const res = await axios.get(url);
      const res = await fetch(url);
      let json;
      if (site.type === 0) json = parser.parse(res.data);
      else json = res.data;
      const jsondata = json?.rss ?? json;
      let videoList = jsondata?.list;

      // xml坑: 单条结果是dict 多条结果list
      if (site.type === 0) {
        videoList = jsondata.list.video;
        if (!_.isArray(videoList)) videoList = [videoList];
        videoList = this.convertDetailList(videoList);
      }
      if (!videoList) return;

      const videoData = videoList.map((video) => {
        // 播放源
        const playFrom = video.vod_play_from;
        const playSource = playFrom.split("$").filter(Boolean);
        // 剧集
        const playUrl = video.vod_play_url;
        const playUrlDiffPlaySource = playUrl.split("$$$"); // 分离不同播放源
        const playEpisodes = playUrlDiffPlaySource.map((item) => {
          return item
            .replace(/\$+/g, "$")
            .split("#")
            .filter((e) => {
              const isHttp = e.startsWith("http");
              const hasHttp = e.split("$")[1]?.startsWith("http");
              return Boolean(e && (isHttp || hasHttp));
            });
        });
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
      if (data.classData) return true;
      else return false;
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
  async checkChannel(url) {
    try {
      const res = await axios.get(url, {
        signal: controller.signal,
        timeout: 3000
      });
      const manifest = res.data;
      const parser = new M3u8Parser();
      parser.push(manifest);
      parser.end();
      const parsedManifest = parser.manifest;

      if (parsedManifest.segments.length > 0) return true;

      // 兼容性处理 抓包多次请求规则 #EXT-X-STREAM-INF 带文件路径的相对路径
      const responseURL = res.request.responseURL;
      const { uri } = parsedManifest.playlists[0];
      if (res.data.indexOf("encoder") > 0) {
        // request1: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240389_1/playlist.m3u8?CONTENTID=00000110240389_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
        // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8000000,CODECS="avc,mp21" encoder/0/playlist.m3u8?CONTENTID=00000110240127_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
        // request2: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240303_1/encoder/0/playlist.m3u8?CONTENTID=00000110240303_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
        const index = responseURL.lastIndexOf("/");
        const urlLastParam = responseURL.substring(0, index + 1);
        const newUrl = urlLastParam + uri;
        return this.checkChannel(newUrl);
      } else if (uri.startsWith("http") || uri.startsWith("//")) {
        // request1: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/index.m3u8?IASHttpSessionId=OTT8798520230127055253191816
        // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8468480 http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8798520230127055253191816&zte_bandwidth=1000&bandwidth=8468480&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
        // request2: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8867820230127053805215983&zte_bandwidth=1000&bandwidth=8467456&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
        const newUrl = uri;
        return this.checkChannel(newUrl);
      } else if (
        /^\/[^\/]/.test(uri) ||
        (/^[^\/]/.test(uri) && uri.startsWith("http"))
      ) {
        // request1: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//index.m3u8
        // #EXT-X-STREAM-INF:BANDWIDTH=15435519,AVERAGE-BANDWIDTH=15435519,RESOLUTION=3840x2160,CODECS="hvc1.1.6.L150.b0,mp4a.40.2",AUDIO="audio_mp4a.40.2_48000",CLOSED-CAPTIONS=NONE,FRAME-RATE=25 1/v15M/index.m3u8
        // request2: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//1/v15M/index.m3u8
        const index = responseURL.lastIndexOf("/");
        const urlLastParam = responseURL.substring(0, index + 1);
        const newUrl = urlLastParam + uri;
        return this.checkChannel(newUrl);
      }

      return false;
    } catch (err) {
      throw err;
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
      const res = await fetch(url);
      // const response = await axios.get(url);
      let urlPlay;
      // 全局提取完整地址
      const urlGlobal = res.data.match(/(https?:\/\/[^\s]+\.m3u8)/);
      if (urlGlobal) {
        urlPlay = urlGlobal[0];
        return urlPlay;
      }
      // 局部提取地址 提取参数拼接域名
      const urlParm = res.data.match(/\/(.*?)(\.m3u8)/);
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
      const res = await fetch(url);
      // const res = await axios.get(url);
      const m3u8Content = res.data;

      // 从m3u8文件中解析媒体段(MEDIA-SEQUENCE)的值
      const mediaSequenceMatch = m3u8Content.match(
        /#EXT-X-MEDIA-SEQUENCE:(\d+)/
      );
      const mediaSequence = mediaSequenceMatch
        ? parseInt(mediaSequenceMatch[1])
        : null;

      // 判断是直播还是点播
      const isLiveStream = mediaSequence === null || mediaSequence === 0;
      return !isLiveStream;
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
      const res = await fetch(doubanSearchLink);
      // const res = await axios.get(doubanSearchLink);
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
        const res = await fetch(link);
        // const response = await axios.get(link);
        const parsedHtml = cheerio.load(res.data);
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
      const url = await this.doubanLink(id, name, year);
      if (url.includes("https://www.douban.com/search")) {
        return [];
      } else {
        const res = await fetch(url);
        // const response = await axios.get(link);
        const $ = cheerio.load(res.data);
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
    const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURI(
      tag
    )}&page_limit=${limit}&page_start=${start}`;
    try {
      const {
        data: { subjects }
      } = await fetch(url);
      // await axios.get(doubanHotLink);
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
    const url = `https://com-cms.quark.cn/cms?partner_id=quark-covid&group=quark-covid&uc_param_str=dnfrpfbivessbtbmnilauputogpintnwmtsvcppcprsnnnchmicckpgi&uid=`;
    try {
      // const res = await axios.get(quarkHotLink);
      const res = await fetch(url);
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
    const url = `https://opendata.baidu.com/api.php?resource_id=51274&ks_from=aladdin&new_need_di=1&from_mid=1&sort_type=1&query=%E7%94%B5%E8%A7%86%E5%89%A7%E6%8E%92%E8%A1%8C%E6%A6%9C&tn=wisexmlnew&dsp=iphone&format=json&ie=utf-8&oe=utf-8&q_ext=%7B%22query_key%22%3A1%2C%22is_person_related%22%3A0%2C%22video_type_list%22%3A%5B%5D%7D&sort_key=1&stat0=%E7%94%B5%E8%A7%86%E5%89%A7&stat1=%E5%85%A8%E9%83%A8&stat2=%E5%85%A8%E9%83%A8&stat3=%E5%85%A8%E9%83%A8&rn=10&pn=0&trigger_srcid=51251&sid=38515_36559_38540_38591_38596_38582_36804_38434_38414_38640_26350_38623`;
    try {
      // const res = await axios.get(quarkHotLink);
      const res = await fetch(url);
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
  /**
   * 获取酷云热点视频列表
   * @param {*} date 日期2023-5-3
   * @param {*} type 类型 1.电影  2.剧集  3.综艺
   * @param {*} plat 平台 1.腾讯视频  2.爱奇艺  3.优酷  4.芒果
   * @returns 酷云热点视频推荐列表
   */
  async kuyunHot(date: Date, type: number, plat: number) {
    const kuyunHotLink = `https://eye.kuyun.com/api/netplat/ranking?date=${date}&type=${type}&plat=${plat}`;
    try {
      const res = await fetch(kuyunHotLink);
      const resData = res.data;
      if (resData.status) {
        return resData.data.list.map((item) => ({
          vod_id: item.ca_id,
          vod_name: item.name,
          vod_hot: item.num
        }));
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  },
  /**
   * 获取解析url链接的标题
   * @param {*} url 需要解析的地址
   * @returns 解析标题
   */
  async getAnalysizeTitle(url: string) {
    try {
      const client = await getClient();
      const res = await client.get(url, {
        responseType: ResponseType.Binary
      });
      // const res = await axios.get(url, { responseType: "arraybuffer" });
      let html = "";
      const buffer = new Uint8Array(res.data);
      if (url.includes("sohu")) {
        html = iconv.decode(buffer, "gb2312");
      } else {
        html = iconv.decode(buffer, "utf-8");
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
      console.log(url, encodeURI(url), header);
      // if( header ) res = await axios.get(url, {headers: { ...header }});
      // else res = await axios.get(url);
      res = await fetch(url);
      // res = await axios.get(url);
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

      // const res = await axios.get(parsueUrl);
      const res = await fetch(parsueUrl);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 判断网络环境是否为 ipv6
   * @return {Boolean}
   */
  async checkSupportIpv6() {
    try {
      const res = await fetch("https://6.ipw.cn");
      // const res = await axios.get("https://6.ipw.cn");
      const ip = res.data;
      const isIpv6 = /([0-9a-z]*:{1,4}){1,7}[0-9a-z]{1,4}/i.test(ip);
      return isIpv6;
    } catch (err) {
      throw err;
    }
  },
  /**
   * 判断url是否为ipv6
   * @param {String} url  请求地址
   * @return {String} ["IPV6","IPV4","Unknown"]
   */
  async checkUrlIpv6(url: string | URL) {
    try {
      let hostname = url instanceof URL ? url.hostname : new URL(url).hostname;
      const ipv6Regex = /^\[([\da-fA-F:]+)\]$/; // 匹配 IPv6 地址
      const match = ipv6Regex.exec(hostname);
      if (match) hostname = match[1];
      
      let ipType = isIp(hostname);
      if (!ipType) {
        const address:string = await invoke("resolve_ip_address", { address: hostname });
        ipType = isIp(address);
      }
      
      return ipType === 4 ? "IPv4" : ipType === 6 ? "IPv6" : "Unknown";
    } catch (err) {
      throw err;
    }
  },
  /**
   * 格式化 html
   * @param {String} url  请求地址
   * @return
   */
  async formatHTML(url) {
    try {
      const res = await fetch(url);
      // const res = await axios.get(url);
      const html = res.data;
      const $ = cheerio.load(html);

      // 对HTML进行格式化
      const formattedHTML = prettier.format($.html(), { parser: "html" });

      // 返回格式化后的HTML
      return formattedHTML;
    } catch (err) {
      console.error("Error:", err);
    }
  }
};

export default zy;
