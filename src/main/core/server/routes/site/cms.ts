import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import _ from 'lodash';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8.js';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

import { site as db_site } from '../../../db/service';
import CLASS_FILTER_CONFIG from './config/app_filter';

// 初始化对象xml转json https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/1.GettingStarted.md
const xmlOptions = {
  // XML 转 JSON 配置
  trimValues: true,
  textNodeName: '_t',
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  parseAttributeValue: true,
};
const parser = new XMLParser(xmlOptions);

//
Object.fromEntries = function fromEntries(iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};

// 构建url
const buildUrl = (url, paramsStr) => {
  const u = new URL(url);
  const api = u.origin + u.pathname.replace(/\/$/, '');
  const params = new URLSearchParams(u.search);

  if (paramsStr.startsWith('?') || paramsStr.startsWith('&')) {
    const p = new URLSearchParams(paramsStr);
    p.forEach((value, key) => params.set(key, value));
    return api + '?' + params.toString();
  } else {
    const cleanParamsStr = paramsStr.startsWith('/') ? paramsStr.slice(1) : paramsStr;
    return api + (cleanParamsStr ? '/' + cleanParamsStr : '');
  }
};

// 解析xml
const reptileApiFormat = (item, key) => {
  try {
    const itemJson = JSON.parse(item);
    const marryRes = itemJson[key];
    if (marryRes) {
      const formatRes = marryRes.replace(/&&&/g, "'");
      return formatRes;
    }
  } catch (error) {
    console.error('Error occurred while parsing JSON:', error);
    return '';
  }
};

// 解析xpath
const reptileXpathFormat = (item, pat) => {
  try {
    const doc = new DOMParser().parseFromString(item);
    const res = xpath.select(pat, doc);
    if (res && res.length > 0) {
      return res.map((item) => item.textContent);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error occurred while parsing or selecting XPath:', error);
    return [];
  }
};

// 去除url最后的/
const removeTrailingSlash = (url) => {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

const removeHTMLTagsAndSpaces = (str) => {
  // 去除HTML标签
  const strippedString = str.replace(/(<([^>]+)>)/gi, '');
  // 去除空格
  const trimmedString = strippedString.replace(/\s+/g, '');
  return trimmedString;
};

/**
 * 获取资源分类 和 所有资源的总数, 分页等信息
 * @param {*} id 资源网 id
 * @returns
 */
const classify = async (id) => {
  try {
    const site = db_site.find({ id });

    let url;
    if (site.type === 1 || site.type === 0) {
      url = buildUrl(site.api, `?ac=class`);
    } else if (site.type === 2) {
      url = buildUrl(site.api, `&t=1&ac=videolist`);
    } else if (site.type === 3) {
      url = buildUrl(site.api, `/nav`);
    } else if (site.type === 4) {
      url = buildUrl(site.api, `/types`);
    } else if (site.type === 5) {
      // url = buildUrl(site.api, `&t=1&ac=videolist`);
    } else if (site.type === 6) {
      url = buildUrl(site.api, `&extend=${site.ext}&filter=true`);
    }

    const response = await fetch(url);

    let json;
    if (site.type === 0) json = parser.parse(await response.text());
    else json = await response.json();

    const jsondata = json.rss || json;
    let classData, page, pagecount, limit, total, filters;

    const cmsFilterData = [
      {
        key: 'area',
        name: '地区',
        value: [
          {
            n: '全部',
            v: '',
          },
        ],
      },
      {
        key: 'year',
        name: '年份',
        value: [
          {
            n: '全部',
            v: '',
          },
        ],
      },
      {
        key: 'sort',
        name: '排序',
        value: [
          {
            n: '按更新时间',
            v: '按更新时间',
          },
          {
            n: '按上映年份',
            v: '按上映年份',
          },
          {
            n: '按片名',
            v: '按片名',
          },
        ],
      },
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
      });
      page = jsondata.list._page;
      pagecount = jsondata.list._pagecount;
      limit = parseInt(jsondata.list._pagesize);
      total = jsondata.list._recordcount;

      filters = {};
      for (let item of classData) {
        const key = item.type_id;
        filters[key] = cmsFilterData;
      }
    } else if (site.type === 1) {
      classData = jsondata.class;
      classData.unshift({
        type_id: 0,
        type_name: '最新',
      });
      page = jsondata.page;
      pagecount = jsondata.pagecount;
      limit = parseInt(jsondata.limit);
      total = jsondata.total;

      filters = {};
      for (let item of classData) {
        const key = item.type_id;
        filters[key] = cmsFilterData;
      }
    } else if (site.type === 2) {
      const classResponse = await fetch(site.api);
      const textResponse = classResponse.text();

      const jsonClass = textResponse;
      const jsondataClass = jsonClass?.rss === undefined ? jsonClass : jsonClass.rss;
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
        const type_4_response = await fetch(removeTrailingSlash(site.api));
        const text_4_response = type_4_response.json();
        limit = text_4_response['data']['limit'];
        total = text_4_response['data']['total'];
      }

      classData.forEach((classItem) => {
        if (classItem.type_extend) {
          const result = [];
          for (const key in classItem.type_extend) {
            const value = classItem.type_extend[key];
            if (!_.isEmpty(value) && !['star', 'state', 'version', 'director'].includes(key)) {
              const valueList = value.split(',').map((item) => item.trim());
              const options = valueList.map((value) => ({ n: value === '全部' ? '全部' : value, v: value }));
              result.push({
                key,
                name: _.find(CLASS_FILTER_CONFIG, { key }).desc,
                value: [{ n: '全部', v: '' }, ...options],
              });
            }
          }
          filters[classItem.type_id] = result;
        }
      });
    } else if (site.type === 6) {
      page = 1;
      pagecount = 9999;
      limit = 20;
      total = 9999;
      filters = {};

      classData = jsondata.class;
      if (classData) {
        const category_url = buildUrl(site.api, `&extend=${site.ext}&ac=videolist&t=${classData[0].type_id}&pg=1`);
        const category_response = await fetch(category_url);
        const category_json = category_response.json();
        page = category_json['page'];
        pagecount = category_json['pagecount'];
        limit = parseInt(category_json['limit']);
        total = category_json['total'];
      }
      filters = jsondata?.filters === undefined ? [] : jsondata.filters;
    }

    return {
      classData,
      page,
      pagecount,
      limit,
      total,
      filters,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * 获取资源列表
 * @param {*} id 资源网 id
 * @param {number} [pg=1] 翻页 page
 * @param {*} t 分类 type
 * @returns
 */
const convertVideoList = (videoItems) => {
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
      actor: vod_actor,
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
      vod_actor,
    }),
  );
};
const list = async (id, pg = 1, t, f = {}) => {
  try {
    const site = db_site.find({ id });
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
    } else if (site.type === 6) {
      url = buildUrl(site.api, `?ac=videolist&t=${t}&pg=${pg}&extend=${site.ext}`);
      if (Object.keys(f).length !== 0) {
        const words = Utf8.parse(JSON.stringify(f));
        const base64 = Base64.stringify(words);
        url = buildUrl(url, `&ext=${base64}`);
      }
    } else {
      url = buildUrl(site.api, `?ac=videolist&t=${t}&pg=${pg}`);
      if (Object.keys(f).length !== 0 && site.type === 2) {
        url = buildUrl(url, `&f=${JSON.stringify(f)}`);
      }
    }

    const response = await fetch(url);

    let json;
    if (site.type === 0) json = parser.parse(await response.text());
    else json = await response.json();

    const jsondata = json.rss || json;
    let videoList = jsondata.list || jsondata.data || [];

    if (site.type === 0) {
      videoList = convertVideoList(jsondata.list.video);
    } else if (site.type === 3) {
      videoList = jsondata.data || jsondata.list;
    } else if (site.type === 4) {
      videoList = jsondata.data.list;
    }
    return videoList;
  } catch (err) {
    throw err;
  }
};

/**
 * 搜索资源
 * @param {*} id 资源网 id
 * @param {*} wd 搜索关键字
 * @returns
 */
const convertSearchList = (searchItem) => {
  const result = searchItem.map((item) => {
    const {
      id: vod_id,
      tid: type_id,
      type: type_name,
      note: vod_remark,
      name: vod_name,
      last: vod_time,
      dt: vod_play_from,
    } = item;
    return {
      vod_id,
      type_id,
      type_name,
      vod_remark,
      vod_name,
      vod_time,
      vod_play_from,
    };
  });

  return result;
};
const search = async (id, wd) => {
  // xml坑: 单条结果是dict 多条结果list
  try {
    const site = db_site.find({ id });

    let url;
    if (site.type === 3) url = buildUrl(site.api, `/search?text=${encodeURIComponent(wd)}`);
    else if (site.type === 5) url = `${reptileApiFormat(site.api, 'websearchurl')}${encodeURIComponent(wd)}`;
    else if (site.type === 6) url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}&extend=${site.ext}`);
    else url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);

    const response = await fetch(url);

    let json;
    if (site.type === 0) json = parser.parse(await response.text());
    else json = await response.json();

    if (site.type === 5) {
      const searchnamePat = reptileApiFormat(site.api, 'searchname');
      const searchnameRes = reptileXpathFormat(json, searchnamePat);
      const searchidPat = reptileApiFormat(site.api, 'searchid');
      const searchidRes = reptileXpathFormat(json, searchidPat);
      const searchpicPat = reptileApiFormat(site.api, 'searchpic');
      const searchpicRes = reptileXpathFormat(json, searchpicPat);
      const searchstarrPat = reptileApiFormat(site.api, 'searchstarr');
      const searchstarrRes = reptileXpathFormat(json, searchstarrPat);

      let zippedData = _.zip(searchnameRes, searchidRes, searchpicRes, searchstarrRes);
      let list = zippedData.map((item) => {
        return {
          vod_name: item[0],
          vod_id: item[1],
          vod_pic: item[2],
          vod_remarks: item[3],
        };
      });
      return list;
    }

    const jsondata = json?.rss ?? json;
    if (!jsondata) return null;

    let videoList = jsondata.data || jsondata.list || [];
    if (site.type === 0) {
      videoList = jsondata.list.video;
      if (!_.isArray(videoList)) videoList = [videoList];
      videoList = convertSearchList(videoList);
    } else if (site.type === 4) {
      videoList = jsondata.data.list;
    }
    if (videoList.length === 0) return null;

    return videoList;
  } catch (err) {
    throw err;
  }
};

/**
 * 获取资源详情
 * @param {*} key 资源网 key
 * @param {*} id 资源唯一标识符 id
 * @returns
 */
const convertDetailList = (detailItems) => {
  const vodPlayFrom = (dldd) => {
    if (_.isArray(dldd)) {
      return dldd.map((item) => item._flag).join('$$$');
    } else {
      return dldd._flag;
    }
  };
  const vodPlayUrl = (dldd) => {
    if (_.isArray(dldd)) {
      return dldd.map((item) => item._t).join('$$$');
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
      dl: { dd: dldd },
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
      vod_play_url: vodPlayUrl(dldd),
    }),
  );
};
const detail = async (key, id) => {
  try {
    const site = db_site.find({ id: key });
    let url;
    if (site.type === 3) {
      url = buildUrl(site.api, `/video_detail?id=${id}`);
    } else if (site.type === 4) {
      url = buildUrl(site.api, `/detail?vod_id=${id}`);
    } else if (site.type === 5) {
      url = id.startsWith('http') ? id : `${reptileApiFormat(site.api, 'searchUrl')}${id}`;
    } else if (site.type === 6) {
      url = buildUrl(site.api, `?ac=detail&ids=${id}&extend=${site.ext}`);
    } else {
      url = buildUrl(site.api, `?ac=detail&ids=${id}`);
    }

    const response = await fetch(url);
    let json;
    if (site.type === 0) json = parser.parse(await response.text());
    else json = await response.json();

    if (site.type === 5) {
      const detaillistPat = reptileApiFormat(site.api, 'detaillist');
      const detaillistRes = reptileXpathFormat(json, detaillistPat);
      const detailxlPat = reptileApiFormat(site.api, 'detailxl');
      const detailxlRes = reptileXpathFormat(json, detailxlPat);
      const detailjsPat = reptileApiFormat(site.api, 'detailjs');
      const detailjsRes = reptileXpathFormat(json, detailjsPat);
      const detailjsurlPat = reptileApiFormat(site.api, 'detailjsurl');
      const detailjsurlRes = reptileXpathFormat(json, detailjsurlPat);

      const vod_from = detailxlRes.join('$$$');
      let zippedData = _.zip(detaillistRes, detailjsurlRes);
      console.log(detaillistRes, detailjsurlRes);
      console.log(vod_from);
      let list = {
        vod_from,
        vod_url: [],
      };
      return list;
    }

    const jsondata = json?.rss ?? json;
    let videoList = jsondata.data || jsondata.list || [];
    // 坑: 单条结果是dict 多条结果list
    if (site.type === 0) {
      videoList = jsondata.list.video;
      if (!_.isArray(videoList)) videoList = [videoList];
      videoList = convertDetailList(videoList);
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
      const playSource = playFrom.split('$').filter(Boolean);
      // 剧集
      const playUrl = video.vod_play_url;
      const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
      const playEpisodes = playUrlDiffPlaySource.map((item) =>
        item
          .replace(/\$+/g, '$')
          .split('#')
          .map((e) => {
            if (!e.includes('$')) e = `正片$${e}`;
            return e;
          }),
      );
      const fullList = Object.fromEntries(playSource.map((key, index) => [key, playEpisodes[index]]));

      return {
        ...video,
        fullList: fullList,
      };
    });

    return videoData;
  } catch (err) {
    throw err;
  }
};

/**
 * hipy[drpy t4]获取播放详情
 * @param {*} id 资源网 id
 * @param {*} flag
 * @param {*} play
 * @returns
 */
const get_hipy_play_url = async (id, flag, play) => {
  try {
    const site = db_site.find({ id });
    const url = buildUrl(site.api, `?extend=${site.ext}&flag=${flag}&play=${play}`);
    const response = await fetch(url);
    const data = await response.json();
    let playUrl = data;
    if (_.has(data, 'url')) playUrl = data['url'];
    return playUrl;
  } catch (err) {
    throw err;
  }
};

/**
 * drpy获取播放详情
 * @param {*} id 资源网 id
 * @param {*} flag
 * @param {*} play
 * @returns
 */
const get_drpy_play_url = async (id, url) => {
  try {
    const site = db_site.find({ id });
    const parsusePrefix = site.api;

    const hostname = new URL(parsusePrefix).hostname;
    const protocol = new URL(parsusePrefix).protocol;
    const port = new URL(parsusePrefix).port;

    let parsueUrl;
    if (port) parsueUrl = `${protocol}//${hostname}:${port}/web/302redirect?url=${encodeURIComponent(url)}`;
    else parsueUrl = `${protocol}//${hostname}/web/302redirect?url=${encodeURIComponent(url)}`;

    const response = await fetch(url);
    const text = response.json();
    return text;
  } catch (err) {
    throw err;
  }
};

/**
 * 检查资源
 * @param {*} key 资源网 key
 * @returns boolean
 */
const check = async (key) => {
  try {
    const data = await classify(key);
    return {
      status: !_.isEmpty(data.classData),
      resource: data.total,
    };
  } catch (err) {
    console.log(err);
    return false;
  }
};

export { classify, detail, get_hipy_play_url, get_drpy_play_url, check, search, list };
