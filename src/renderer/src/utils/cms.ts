import { XMLParser } from 'fast-xml-parser';
import _ from 'lodash';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';
import JSON5 from 'json5';

import { doWork as t3Work, terminateWork as t3WorkTerminate } from './drpy';
import XBPQAdapter from './xbpq';
import CLASS_FILTER_CONFIG from '@/config/appFilter';
import request from '@/utils/request';
import { encodeBase64 } from '@/utils/tool';

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
    return api + '?' + params.toString();
  } else {
    const cleanParamsStr = paramsStr.startsWith('/') ? paramsStr.slice(1) : paramsStr;
    return api + (cleanParamsStr ? '/' + cleanParamsStr : '');
  }
};

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

const reptileXpathFormat = (item, pat) => {
  try {
    const doc = new DOMParser().parseFromString(item);
    const res: any = xpath.select(pat, doc);
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

const t3RuleInit = async (site) => {
  let data = {
    code: 500,
    msg: 'site parameter not have ext or ext is empty',
  };

  if (_.has(site, 'ext')) {
    try {
      await t3Work({ type: 'init', data: site.ext });
      data = {
        code: 200,
        msg: 'success',
      };
    } catch (err) {
      data.msg = err as string;
    }
  }

  return data;
};

const t3RuleProxy = async (url: string): Promise<any[]> => {
  if (!url || !url.startsWith('http')) {
    return [];
  }

  const formatUrl = new URL(url);
  const params = Object.fromEntries(formatUrl.searchParams.entries());

  const result: any = await t3Work({ type: 'proxy', data: params });
  return (result?.data ?? []) as any[];
};

const t3RuleTerminate = async () => {
  const res: any = await t3WorkTerminate();
  if (res.code === 200) return 'success';
  else return 'fail';
};

const catvodRuleInit = async (site) => {
  const url = buildUrl(site.api, `/init`);
  const res = await request({
    method: 'POST',
    url,
    data: site.ext ? JSON.parse(site.ext) : {},
  });
  return res.data;
};

let xbpqObject: any = null;
const xbpqInit = async (site) => {
  if (xbpqObject) xbpqObject = null;

  let ext = site.ext;
  try {
    if (typeof ext === 'string' && ext.startsWith('http')) {
      ext = await request({
        method: 'GET',
        url: ext,
      });
    }
    ext = JSON5.parse(site.ext);
  } catch (err) {}

  xbpqObject = new XBPQAdapter({
    name: site.name,
    api: site.api,
    ext: ext,
    lazy: ext?.lazy || '',
    click: ext?.click || '',
  });

  try {
    const rule = await xbpqObject.init();
    return rule;
  } catch (err) {
    return null;
  }
};

const ruleInit = async (site) => {
  let returnRes;
  if (site.type === 7) {
    let data = {
      code: 500,
      msg: 'site parameter not have ext or ext is empty',
    };

    if (_.has(site, 'ext')) {
      try {
        await t3Work({ type: 'init', data: site.ext });
        data = {
          code: 200,
          msg: 'success',
        };
      } catch (err) {
        data.msg = err as string;
      }
    }

    returnRes = data;
  } else if (site.type === 8) {
    const url = buildUrl(site.api, `/init`);
    const res = await request({
      method: 'POST',
      url,
      data: site.ext ? JSON5.parse(site.ext) : {},
    });

    returnRes = res.data;
  } else if (site.type === 9) {
    let ext = site.ext;
    try {
      ext = JSON5.parse(site.ext);
    } catch (err) {}

    let xbpqObject = new XBPQAdapter({
      name: site.name,
      api: site.api,
      ext: ext,
      lazy: ext?.lazy || '',
      click: ext?.click || '',
    });

    returnRes = xbpqObject;
  }

  return returnRes;
};
/**
 * 获取资源分类 和 所有资源的总数, 分页等信息
 * @param {*} site 资源配置
 * @returns
 */
const fetchClassify = async (site) => {
  try {
    let url, classData, page, pagecount, limit, total, filters;

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
    } else if (site.type === 7) {
      const content: any = await t3Work({ type: 'home' });
      const res = {
        page: 1,
        pagecount: 9999,
        limit: 20,
        total: 9999,
        filters: content.data.filters ? content.data.filters : {},
        classData: content.data.class,
      };
      return res;
    } else if (site.type === 9) {
      const reponse = xbpqObject.home();
      const content = JSON5.parse(reponse);
      return {
        page: 1,
        pagecount: 9999,
        limit: 20,
        total: 9999,
        filters: content.filters ? content.filters : {},
        classData: content.class,
      };
    }

    let response;
    if (site.type !== 8) {
      response = await request({
        url,
        method: 'GET',
      });
    } else {
      response = await request({
        url,
        method: 'POST',
      });
    }

    const json = site.type === 0 ? parser.parse(response) : response;

    const jsondata = json.rss || json;

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
      const resClass = await request({
        url: site.api,
        method: 'GET',
      });
      const jsonClass = resClass;
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
        const response = await request({
          url: removeTrailingSlash(site.api),
          method: 'GET',
        });
        limit = response.limit;
        total = response.total;
      }

      classData.forEach((classItem) => {
        if (classItem.type_extend) {
          const result: any = [];
          for (const key in classItem.type_extend) {
            const value = classItem.type_extend[key];
            if (!_.isEmpty(value) && !['star', 'state', 'version', 'director'].includes(key)) {
              const valueList = value.split(',').map((item) => item.trim());
              const options = valueList.map((value) => ({ n: value === '全部' ? '全部' : value, v: value }));
              const name = (_.find(CLASS_FILTER_CONFIG, { key }) || {}).desc;
              result.push({ key, name, value: [{ n: '全部', v: '' }, ...options] });
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
        const url = buildUrl(site.api, `&extend=${site.ext}&ac=videolist&t=${classData[0].type_id}&pg=1`);
        const response = await request({
          url,
          method: 'GET',
        });
        page = response.page;
        pagecount = response.pagecount;
        limit = parseInt(response.limit);
        total = response.total;
      }
      filters = jsondata?.filters === undefined ? [] : jsondata.filters;
    } else if (site.type === 8) {
      page = 1;
      pagecount = 9999;
      limit = 20;
      total = 9999;
      filters = {};

      classData = jsondata.class;
      // if (classData) {
      //   const category_url = buildUrl(site.api, `&extend=${site.ext}&ac=videolist&t=${classData[0].type_id}&pg=1`);
      //   const category_res = await axios.get(category_url);
      //   const category_json = category_res.data;
      //   page = category_json.page;
      //   pagecount = category_json.pagecount;
      //   limit = parseInt(category_json.limit);
      //   total = category_json.total;
      // }
      filters = jsondata?.filters === undefined ? [] : jsondata.filters;
      Object.keys(filters).forEach((key) => {
        filters[key].forEach((item) => {
          if (!item.name) {
            item.name = item.key;
          }
        });
      });
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
 * 检查资源
 * @param {*} site 资源配置
 * @returns boolean
 */
const checkValid = async (site) => {
  try {
    const data = await fetchClassify(site);
    return {
      status: !_.isEmpty(data.classData),
      resource: data.total,
    };
  } catch (err) {
    console.error(err);
    return {
      status: false,
      resource: 0,
    };
  }
};

/**
 * 获取资源列表
 * @param {*} site 资源配置
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
const fetchList = async (site, pg = 1, t, f = {}) => {
  try {
    let url, postData;
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
        const encodedStr = encodeBase64(JSON.stringify(f));
        url = buildUrl(url, `&ext=${encodedStr}`);
      }
    } else if (site.type === 7) {
      const res: any = await t3Work({
        type: 'category',
        data: { tid: t, pg, filter: _.size(f) ? true : false, extend: _.size(f) ? f : {} },
      });
      return res.data.list;
    } else if (site.type === 8) {
      url = buildUrl(site.api, `/category`);
      postData = {
        id: t,
        page: pg,
        filters: f,
      };
    } else if (site.type === 9) {
      const response = await xbpqObject.category(t, pg, _.size(f) ? true : false, _.size(f) ? f : {});
      const content = JSON5.parse(response);
      return content.list;
    } else {
      url = buildUrl(site.api, `?ac=videolist&t=${t}&pg=${pg}`);
      if (Object.keys(f).length !== 0 && site.type === 2) {
        url = buildUrl(url, `&f=${JSON.stringify(f)}`);
      }
    }

    let response;
    if (site.type !== 8) {
      response = await request({
        url,
        method: 'GET',
      });
    } else {
      response = await request({
        url,
        method: 'POST',
        data: postData,
      });
    }

    const json = site.type === 0 ? parser.parse(response) : response;

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
 * 获取资源热榜列表
 * @param {*} site 资源配置
 * @param {number} [pg=1] 翻页 page
 * @param {*} t 分类 type
 * @param {*} h 时间 time
 * @returns
 */
const convertHotList = (hotItems) => {
  return hotItems.map(({ id: vod_id, tid: type_id, type: type_name, note: vod_remark, name: vod_name }) => ({
    vod_id,
    type_id,
    type_name,
    vod_remark,
    vod_name,
  }));
};
const fetchHot = async (site, h) => {
  try {
    let url;
    if (site.type === 3) {
      url = buildUrl(site.api, `/index_video`);
    } else if (site.type === 4) {
    } else if (site.type === 5) {
    } else if (site.type === 6) {
    } else if (site.type === 7) {
      const res = await t3Work({ type: '' });
    } else if (site.type === 8) {
    } else {
      url = buildUrl(site.api, `?ac=hot&h=${h}`);
    }

    const response = await request({
      url,
      method: 'GET',
    });

    const json = site.type === 0 ? parser.parse(response) : response;
    const jsondata = json.rss || json;
    let videoList = jsondata.list || [];
    if (site.type === 0) {
      videoList = convertHotList(jsondata.list.video);
    } else if (site.type === 2) {
      videoList = response.list;
    } else if (site.type === 3) {
      videoList = response.list.flatMap((typeObj) => typeObj.vlist);
    }

    let hotList: any = [];
    if (site.type === 3 || site.type === 2) {
      hotList = videoList;
    } else {
      for (let i = 0; i < 10; i++) {
        const item = videoList[i];
        if (i in [0, 1, 2, 3]) {
          const pic = await fetchDetail(site, item.vod_id);
          item['vod_pic'] = pic[0].vod_pic;
        }
        hotList.push(item);
      }
    }
    return hotList;
  } catch (err) {
    throw err;
  }
};

/**
 * 搜索资源
 * @param {*} site 资源配置
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
const fetchSearch = async (site, wd, pg: number = 1) => {
  // xml坑: 单条结果是dict 多条结果list
  try {
    let url, postData;
    if (site.type === 3) url = buildUrl(site.api, `/search?text=${encodeURIComponent(wd)}`);
    else if (site.type === 5) url = `${reptileApiFormat(site.api, 'websearchurl')}${encodeURIComponent(wd)}`;
    else if (site.type === 6) url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}&extend=${site.ext}`);
    else if (site.type === 7) {
      const res: any = await t3Work({ type: 'search', data: { wd, quick: false, pg: pg } });
      return res.data?.list;
    } else if (site.type === 8) {
      url = buildUrl(site.api, `/search`);
      postData = {
        wd,
        pg: pg,
      };
    } else if (site.type === 9) {
      const response = await xbpqObject.search(encodeURIComponent(wd), false, pg);
      const content = JSON5.parse(response);
      return content.list;
    } else url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);

    let response;
    if (site.type !== 8) {
      response = await request({
        url,
        method: 'GET',
      });
    } else {
      response = await request({
        url,
        method: 'POST',
        data: postData,
      });
    }

    const json = site.type === 0 ? parser.parse(response) : response;

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
 * 搜索资源详情
 * @param {*} site 资源配置
 * @param {*} wd 搜索关键字
 * @returns
 */
const fetchSearchFirstDetail = async (site, wd) => {
  try {
    let url;
    if (site.type === 3) url = buildUrl(site.api, `/search?text=${encodeURIComponent(wd)}`);
    else url = buildUrl(site.api, `?wd=${encodeURIComponent(wd)}`);
    const response = await request({
      url,
      method: 'GET',
    });

    const json = site.type === 0 ? parser.parse(response) : response;

    const jsondata = json?.rss === undefined ? json : json.rss;
    if (!jsondata) return null;

    let videoList = jsondata.data || jsondata.list || [];
    if (site.type === 0) {
      videoList = jsondata.list.video;
      if (!videoList) return null;
      if (!_.isArray(videoList)) videoList = [videoList];
      videoList = convertSearchList(videoList);
    } else if (site.type === 4) {
      videoList = jsondata.data.list;
    }
    if (videoList.length === 0) return null;

    let detailRes = await fetchDetail(site, videoList[0].vod_id);
    if (_.isArray(detailRes)) detailRes = detailRes[0];
    return detailRes;
  } catch (err) {
    throw err;
  }
};

/**
 * 获取资源详情
 * @param {*} site 资源配置
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
const fetchDetail = async (site, id) => {
  try {
    let url, postData;
    if (site.type === 3) {
      url = buildUrl(site.api, `/video_detail?id=${id}`);
    } else if (site.type === 4) {
      url = buildUrl(site.api, `/detail?vod_id=${id}`);
    } else if (site.type === 5) {
      url = id.startsWith('http') ? id : `${reptileApiFormat(site.api, 'searchUrl')}${id}`;
    } else if (site.type === 6) {
      url = buildUrl(site.api, `?ac=detail&ids=${id}&extend=${site.ext}`);
    } else if (site.type === 7) {
      const res: any = await t3Work({ type: 'detail', data: `${id}` });
      return res.data.list;
    } else if (site.type === 8) {
      url = buildUrl(site.api, `/detail`);
      postData = {
        id,
      };
    } else if (site.type === 9) {
      const response = await xbpqObject.detail(id);
      const content = JSON5.parse(response);
      console.log(content);
      return content.list;
    } else {
      url = buildUrl(site.api, `?ac=detail&ids=${id}`);
    }

    let response;
    if (site.type !== 8) {
      response = await request({
        url,
        method: 'GET',
      });
    } else {
      response = await request({
        url,
        method: 'POST',
        data: postData,
      });
    }

    const json = site.type === 0 ? parser.parse(response) : response;

    if (site.type === 5) {
      const detaillistPat = reptileApiFormat(site.api, 'detaillist');
      const detaillistRes = reptileXpathFormat(json, detaillistPat);
      const detailxlPat = reptileApiFormat(site.api, 'detailxl');
      const detailxlRes = reptileXpathFormat(json, detailxlPat);
      const detailjsPat = reptileApiFormat(site.api, 'detailjs');
      // @ts-ignore
      const detailjsRes = reptileXpathFormat(json, detailjsPat);
      const detailjsurlPat = reptileApiFormat(site.api, 'detailjsurl');
      const detailjsurlRes = reptileXpathFormat(json, detailjsurlPat);

      const vod_from = detailxlRes.join('$$$');
      // @ts-ignore
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

    return videoList ? videoList : [];
  } catch (err) {
    throw err;
  }
};

const fetchPlayUrl = async (site, data) => {
  try {
    let returnRes;
    if (site.type === 2) {
      const parsusePrefix = site.api;

      const hostname = new URL(parsusePrefix).hostname;
      const protocol = new URL(parsusePrefix).protocol;
      const port = new URL(parsusePrefix).port;
      const { url } = data;
      let parsueUrl;
      if (port) parsueUrl = `${protocol}//${hostname}:${port}/web/302redirect?url=${encodeURIComponent(url)}`;
      else parsueUrl = `${protocol}//${hostname}/web/302redirect?url=${encodeURIComponent(url)}`;

      const response = await request({
        url: parsueUrl,
        method: 'GET',
      });
      returnRes = response;
    } else if (site.type === 6) {
      const { flag, play } = data;
      const url = buildUrl(site.api, `?extend=${site.ext}&flag=${flag}&play=${play}`);
      const response = await request({
        url,
        method: 'GET',
      });
      returnRes = response;
    } else if (site.type === 7) {
      const { flag, id, flags } = data;
      const response = await t3Work({ type: 'play', data: { flag, id, flags } });
      returnRes = response;
    } else if (site.type === 8) {
      const { flag, id } = data;
      const url = buildUrl(site.api, `/play`);
      const response = await request({
        url,
        method: 'POST',
        data: { flag, id },
      });
      returnRes = response;
    } else if (site.type === 9) {
      const { flag, id } = data;
      const response = await xbpqObject.play(flag, id);
      returnRes = response.data;
    }
    return returnRes;
  } catch (err) {}
};
/**
 * hipy[drpy t4]获取播放详情
 * @param {*} site 资源配置
 * @param {*} flag 播放源
 * @param {*} play 播放地址
 * @returns
 */
const fetchHipyPlayUrl = async (site, flag, play) => {
  try {
    const url = buildUrl(site.api, `?extend=${site.ext}&flag=${flag}&play=${play}`);
    const response = await request({
      url,
      method: 'GET',
    });
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * drpy[drpy t3]获取播放详情
 * @param {*} flag 资源配置
 * @param {*} id 播放源
 * @param {*} flags 播放地址
 * @returns
 */
const fetchT3PlayUrl = async (flag: string, id: string, flags: string[] = []) => {
  try {
    const res: any = await t3Work({ type: 'play', data: { flag, id, flags } });
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * catvod[nodejs]获取播放详情
 * @param {*} flag 资源配置
 * @param {*} id 播放源
 * @param {*} flags 播放地址
 * @returns
 */
const fetchCatvodPlayUrl = async (site, flag: string, id: string) => {
  try {
    const url = buildUrl(site.api, `/play`);
    const response = await request({
      url,
      method: 'POST',
      data: { flag, id },
    });
    return response;
  } catch (err) {
    throw err;
  }
};
/**
 * xbpq获取播放详情
 * @param {*} flag 资源配置
 * @param {*} id 播放源
 * @param {*} flags 播放地址
 * @returns
 */
const fetchXBPQPlayUrl = async (flag: string, id: string) => {
  try {
    const response = await xbpqObject.play(flag, id);
    const content = JSON5.parse(response);
    console.log(content);
    return content;
  } catch (err) {
    throw err;
  }
};

/**
 * drpy嗅探获取播放地址
 * @param {*} site 资源配置
 * @param {*} url 需要获取的地址
 * @returns 配置文件
 */
const fetchDrpyPlayUrl = async (site, url) => {
  try {
    const parsusePrefix = site.api;

    const hostname = new URL(parsusePrefix).hostname;
    const protocol = new URL(parsusePrefix).protocol;
    const port = new URL(parsusePrefix).port;

    let parsueUrl;
    if (port) parsueUrl = `${protocol}//${hostname}:${port}/web/302redirect?url=${encodeURIComponent(url)}`;
    else parsueUrl = `${protocol}//${hostname}/web/302redirect?url=${encodeURIComponent(url)}`;

    const response = await request({
      url: parsueUrl,
      method: 'GET',
    });
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * 提取ck/dp播放器m3u8
 * @param {*} url 播放地址
 * @returns
 */
const extractPlayerUrl = async (url) => {
  const hostname = new URL(url).hostname;
  try {
    const response = await request({
      url,
      method: 'GET',
    });
    let urlPlay;
    // 全局提取完整地址
    const urlGlobal = response.match(/(https?:\/\/[^\s]+\.m3u8)/);
    if (urlGlobal) {
      urlPlay = urlGlobal[0];
      return urlPlay;
    }
    // 局部提取地址 提取参数拼接域名
    const urlParm = response.match(/\/(.*?)(\.m3u8)/);
    if (urlParm) urlPlay = hostname + urlParm[0];
    return urlPlay;
  } catch (err) {
    throw err;
  }
};

/**
 * 搜索视频ID和类型
 * @param {string} name 视频名称
 * @param {string} year 视频年份
 * @returns {Promise<{id: string, type: string}>|null} 匹配的视频ID和类型，或null
 */
const fetchDoubanSearch = async (name: string, year: string) => {
  try {
    let data = {};
    const url = `https://m.douban.com/rexxar/api/v2/search/subjects?q=${encodeURIComponent(name.trim())}`;

    const response = await request({
      url,
      method: 'GET',
      headers: {
        'custom-referer': 'https://movie.douban.com',
      },
    });
    if (response?.subjects && response.subjects.items.length > 0) {
      for (const subject of response.subjects.items) {
        const item = subject.target;
        if (
          (item.title === name && item.year === year && subject.target_type === 'movie') ||
          subject.target_type === 'tv'
        ) {
          data = {
            vod_douban_id: item.id,
            vod_douban_type: subject.target_type,
            vod_score: item.rating.value,
            vod_name: item.title,
            vod_year: item.year,
          };
        }
      }
    }
    return data;
  } catch (err) {
    console.error(`[cms][fetchDoubanSearch][error]`, err);
    return {};
  }
};

/**
 * 搜索视频ID和类型
 * @param {string} id 豆瓣标识
 * @param {string} type movie | tv
 * @returns {Promise<{id: string, type: string}>|null} 匹配的视频ID和类型，或null
 */
const fetchDoubanDetail = async (id: string, type: string) => {
  try {
    let data = {};
    if (id && type) {
      const url = `https://m.douban.com/rexxar/api/v2/${type}/${id}`;

      const response = await request({
        url,
        method: 'GET',
        headers: {
          'custom-referer': 'https://movie.douban.com',
        },
      });

      if (response) {
        data = {
          type_name: response.genres.json(','),
          vod_douban_id: response.id,
          vod_douban_type: response.target_type,
          vod_lang: response.languages.json(','),
          vod_score: response.rating.value,
          vod_name: response.title,
          vod_year: response.year,
          vod_pic: response.pic?.normal || response.pic?.large,
          vod_blurb: response.intro,
          vod_content: response.intro,
          vod_director: response.directors.map((item) => item.name).join(','),
          vod_actor: response.actors.map((item) => item.name).join(','),
        };
      }
    }
    return data;
  } catch (err) {
    console.error(`[cms][fetchDoubanDetail][error]`, err);
    return {};
  }
};

/**
 * 获取豆瓣评分
 * @param {*} id 视频唯一标识
 * @param {*} type 类型 tv｜movie
 * @param {*} name 视频名称
 * @param {*} year 视频年份
 * @returns 豆瓣评分
 */
const fetchDoubanRate = async (id, type, name, year) => {
  try {
    let rate = 0.0;
    if (!id || !type) {
      const { vod_score: foundRate } = (await fetchDoubanSearch(name, year)) as any;
      rate = foundRate;
    } else {
      const { vod_score: foundRate } = (await fetchDoubanDetail(id, type)) as any;
      rate = foundRate;
    }

    return rate;
  } catch (err) {
    throw err;
  }
};

/**
 * 获取豆瓣相关视频推荐列表
 * @param {*} id 视频唯一标识
 * @param {*} type 类型 tv｜movie
 * @param {*} name 视频名称
 * @param {*} year 视频年份
 * @returns 豆瓣相关视频推荐列表
 */
const fetchDoubanRecommend = async (id, type, name, year) => {
  try {
    if (!id || !type) {
      const { vod_douban_id: foundId, vod_douban_type: foundType } = (await fetchDoubanSearch(name, year)) as any;
      id = foundId;
      type = foundType;
    }

    if (id && type) {
      const url = `https://m.douban.com/rexxar/api/v2/${type}/${id}/recommendations`;
      const response = await request({
        url,
        method: 'GET',
        headers: {
          'custom-referer': 'https://movie.douban.com',
        },
      });

      return (
        response.map((item) => ({
          vod_douban_id: item.id,
          vod_douban_type: item.id,
          vod_pic: item.pic.large || item.pic.normal,
          vod_name: item.title,
        })) || []
      );
    }

    return [];
  } catch (err) {
    console.error(`[cms][fetchDoubanRecommend][error]`, err);
    return [];
  }
};

export {
  ruleInit,
  t3RuleInit,
  t3RuleProxy,
  t3RuleTerminate,
  catvodRuleInit,
  xbpqInit,
  checkValid,
  fetchClassify,
  fetchList,
  fetchHot,
  fetchDetail,
  fetchSearch,
  fetchSearchFirstDetail,
  fetchPlayUrl,
  fetchT3PlayUrl,
  fetchCatvodPlayUrl,
  fetchXBPQPlayUrl,
  fetchDrpyPlayUrl,
  fetchHipyPlayUrl,
  extractPlayerUrl,
  fetchDoubanRate,
  fetchDoubanRecommend,
};
