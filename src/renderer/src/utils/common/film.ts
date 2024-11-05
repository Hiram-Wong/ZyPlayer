import _ from 'lodash';
import { JSONPath } from 'jsonpath-plus';
import PQueue from 'p-queue';
import { putHistory, findHistory, addHistory } from '@/api/history';
import { setT3Proxy } from '@/api/proxy';
import { fetchConfig } from '@/api/setting';

import { findStar, addStar, delStar, putStar } from '@/api/star';
import { fetchRecommPage, fetchCmsDetail, fetchCmsSearch, fetchCmsPlay } from '@/api/site';

import sniffer from '@/utils/sniffer';
import { checkMediaType } from '@/utils/tool';

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

// 官解地址
const VIP_LIST = [
  'iqiyi.com',
  'iq.com',
  'mgtv.com',
  'qq.com',
  'youku.com',
  'le.com',
  'sohu.com',
  'pptv.com',
  'bilibili.com',
  'tudou.com',
];

/**
 * 获取追番数据
 * @param relateId 关联ID
 * @param videoId 视频ID
 * @returns { status: boolean, data: any }
 */
const fetchBingeData = async (relateId: string, videoId: number): Promise<{ status: boolean; data: any }> => {
  try {
    const response = await findStar({ relateId, videoId });
    return {
      status: Boolean(response), // 直接转换为布尔值
      data: response || {}, // 如果response存在则使用response，否则使用空对象
    };
  } catch (err) {
    console.error(`[film_common][fetchBingeData]`, err); // 更详细的错误日志
    return {
      status: false,
      data: {},
    };
  }
};

/**
 * 追番数据操作
 * @param action 操作类型 add/del/update
 * @param id 追番ID
 * @param doc 操作数据
 * @returns { status: boolean, data: any }
 */
const putBingeData = async (action: string, id: any = null, doc: any = {}): Promise<{ status: boolean; data: any }> => {
  try {
    let res = {};
    if (action === 'add') {
      res = await addStar(doc);
    } else if (action === 'del') {
      res = await delStar({ ids: [id] });
    } else if (action === 'update') {
      res = await putStar({ ids: [id], doc });
    }
    return {
      status: true,
      data: res,
    };
  } catch (err) {
    console.error(`[film_common][putBingeData]`, err);
    return {
      status: false,
      data: {},
    };
  }
};

// History
const fetchHistoryData = async (relateId: string, videoId: number) => {
  console.log('[film_common][fetchHistoryData][start]历史获取流程开启');
  let data: any = {
    id: null,
    date: 1715018234,
    type: 'film',
    relateId: '',
    siteSource: '',
    playEnd: false,
    videoId: '',
    videoImage: '',
    videoName: '',
    videoIndex: '',
    watchTime: 0,
    duration: null,
    skipTimeInStart: 30,
    skipTimeInEnd: 30,
  };

  try {
    const response = await findHistory({ relateId, videoId });
    if (response) data = response;
    console.log(`[film_common][fetchHistoryData][return]`, data);
  } catch (err) {
    console.error(`[film_common][fetchHistoryData][error]`, err);
  } finally {
    console.log(`[film_common][fetchHistoryData][end]历史获取流程结束`);
    return data;
  }
};

const putHistoryData = async (id: any = null, doc: any = {}): Promise<void> => {
  // console.log('[film_common][putHistoryData][start]历史更新流程开启');
  let data: any = {
    id: null,
    date: 1715018234,
    type: 'film',
    relateId: '',
    siteSource: '',
    playEnd: false,
    videoId: '',
    videoImage: '',
    videoName: '',
    videoIndex: '',
    watchTime: 0,
    duration: null,
    skipTimeInStart: 30,
    skipTimeInEnd: 30,
  };

  try {
    if (id) {
      data = await putHistory({
        ids: [id],
        doc,
      });
    } else {
      data = await addHistory(doc);
    }
    // console.log(`[film_common][putHistoryData][return]`, data);
  } catch (err) {
    console.log(`[film_common][putHistoryData][error]`, err);
  } finally {
    // console.log(`[film_common][putHistoryData][end]历史更新流程结束`);
    return data;
  }
};

/**
 * playHelper
 *
 * 1.源带 playurl
 * 2.drpy hipy t3 catvod [存在处理完后是官解]
 * 3.官解 爱优腾域名 及 线路flag [存在非http开头]
 * 4.资源类型判断 -> 直链 > 兜底嗅探
 *
 * 所有链接都必须获得mediaType, 播放器需根据mediaType识别, 重要
 *
 * @param snifferMode 嗅探数据 type url
 * @param url 播放链接
 * @param site 源信息
 * @param analyzeType 解析类型
 * @param flimSource 当前选中线路
 * @param adFlag 是否去广告
 * @returns
 */
const playHelper = async (
  url: string,
  site: { [key: string]: string | number },
  flimSource: string,
  analyzeType: number = -1,
  adFlag = false,
) => {
  console.log(`[film_common][playHelper][before_start]准备处理地址:${url}`);
  console.log(`[film_common][playHelper][start]播放处理流程开始`);

  let data = { url: '', originalUrl: url, mediaType: '', headers: {} };

  try {
    // 1. 解析
    if (analyzeType !== -1) {
      const analyzeRes = await fetchAnalyzeHelper(url, analyzeType);
      data = { ...data, url: analyzeRes.url, mediaType: analyzeRes.mediaType, headers: analyzeRes.headers };
      return;
    }

    // 2. 执行源规则
    const play = {
      headers: {},
      parse: 0,
      url,
      sniffer: {
        run_script: '',
        init_script: '',
        custom_regex: '',
        sniffer_exclude: '',
      },
    };
    const playRes = await fetchCmsPlay({ sourceId: site.id, input: url, flag: flimSource });
    if (playRes?.header) play.headers = playRes.header;
    if (playRes?.parse) play.parse = playRes.parse;
    if (playRes?.url) play.url = playRes.url;
    if (playRes?.parse_extra?.run_script) play.sniffer.run_script = playRes.parse_extra.run_script;
    if (playRes?.parse_extra?.init_script) play.sniffer.init_script = playRes.parse_extra.init_script;
    if (playRes?.parse_extra?.custom_regex) play.sniffer.custom_regex = playRes.parse_extra.custom_regex;
    if (playRes?.parse_extra?.sniffer_exclude) play.sniffer.sniffer_exclude = playRes.parse_extra.sniffer_exclude;

    // 直链直接获取数据类型
    if (play.url && play.parse === 0) {
      const mediaType = await checkMediaType(play.url);
      if (mediaType !== 'unknown' && mediaType !== 'error') {
        data = { ...data, url: play.url, mediaType, headers: play.headers };
        return data;
      }
    }

    //  3. 兜底办法:嗅探
    console.log(`[film_common][playHelper][reveal]尝试提取播放链接`);
    const snifferResult = await sniffer(
      play.url,
      play.sniffer.run_script,
      play.sniffer.init_script,
      play.sniffer.custom_regex,
      play.sniffer.sniffer_exclude,
    );
    data.headers = snifferResult.headers;
    data.url = snifferResult.url;
    data.mediaType = (await checkMediaType(snifferResult.url)) || 'm3u8';
  } catch (err) {
    console.error(`[film_common][playHelper][error]`, err);
  } finally {
    if (adFlag && data.url && !data.url.startsWith('http://127.0.0.1') && data.mediaType.includes('m3u8')) {
      console.log('[film_common][removeAd][start]开始移除广告流程');
      data.url = `http://127.0.0.1:9978/api/v1/lab/ad?url=${encodeURI(data.url)}&type=m3u8&headers=${JSON.stringify(data.headers || {})}`;
      console.log('[film_common][removeAd][end]结束移除广告流程');
    }
    console.log(`[film_common][playHelper][return]`, data);
    console.log(`[film_common][playHelper][end]播放处理流程结束`);
    return data;
  }
};

/**
 * 翻转顺序
 * @param action positive:正序 negative:倒序
 * @param data 数据
 */
const reverseOrderHelper = (action: 'positive' | 'negative', data: Record<string, any[]>): Record<string, any[]> => {
  const newData = JSON.parse(JSON.stringify(data));

  if (action === 'positive') {
    console.log('[film_common][reverseOrderHelper]正序');
  } else {
    console.log('[film_common][reverseOrderHelper]倒序');
    Object.keys(newData).forEach((key) => newData[key].reverse());
  }
  return newData;
};

/**
 * 获取豆瓣推荐
 * @param info 影视信息
 */
const fetchDoubanRecommHelper = async (info: any): Promise<any[]> => {
  console.log('[film_common][fetchDoubanRecommendHelper][start]获取豆瓣推荐流程开启');
  let data: any = [];

  try {
    let { vod_name: name, vod_year: year, vod_douban_id: doubanId, vod_douban_type: doubanType } = info;
    if (!year) year = new Date().getFullYear();
    const recommendNames = await fetchRecommPage({ id: doubanId, type: doubanType, name, year });
    data = recommendNames || [];

    console.log(`[film_common][fetchDoubanRecommendHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchDoubanRecommendHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchDoubanRecommendHelper][end]获取豆瓣推荐流程结束`);
    return data;
  }
};

const fetchRecommSearchHelper = async (site: { [key: string]: string | number }, kw: string) => {
  console.log('[film_common][fetchRecommSearchHelper][start]推荐搜索流程开启');
  let data = {};
  try {
    if (site.search !== 0) {
      const searchRes = await fetchCmsSearch({ sourceId: site.id, kw });
      if (searchRes && Array.isArray(searchRes.list) && searchRes.list.length > 0) {
        for (const item of searchRes.list) {
          if (item.vod_id && item.vod_name) {
            let data = item;

            if (!data.hasOwnProperty('vod_play_from') || !data.hasOwnProperty('vod_play_url')) {
              const detailRes = await fetchCmsDetail({ sourceId: site.id, id: item.vod_id });
              if (detailRes.list.length > 0) {
                data = detailRes.list[0];
                break;
              }
            } else {
              continue;
            }
          }
        }
      }
    }
    console.log(`[film_common][fetchRecommSearchHelper][return]`, data);
  } catch (err) {
    console.error(`[film_common][fetchRecommSearchHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchRecommSearchHelper][end]推荐搜索流程结束`);
  }

  return data;
};

// 格式化剧集名称
const formatName = (item: string): string => {
  const [first] = item.split('$');
  return first.includes('http') ? '正片' : first;
};

// 格式化剧集集数
const formatIndex = (item: string): { index: string; url: string } => {
  const [index, url] = item.split('$');
  return { index, url };
};

// 格式化style
const formatContent = (text: string | undefined | null, keyword: string): string => {
  if (!text) return '';
  let res = text;
  // 创建一个正则表达式来匹配关键字后面的内容
  const regex = new RegExp(`${keyword}[：:]\\s*([^\\n]+)`, 'i');
  // 执行匹配
  const match = text.match(regex);

  // 如果匹配成功，清理并返回结果
  if (match && match[1]) {
    // 去除可能的多余空格和换行符，并分割成数组
    const names = match[1]
      .split(/,\s*/)
      .map((name) => name.trim())
      .filter((name) => name);
    res = names.join(' ');
  } else {
    // 如果没有匹配到关键字，返回空字符串
    res = '';
  }
  return res.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 获取播放源及剧集
const formatSeason = (videoList: Record<string, any>) => {
  console.log('[film_common][formatSeason][start]剧集格式化流程开启');
  let data: { [key: string]: any[] } = {
    error: ['formatError$seeMoreErrorMessageForF12'],
  };
  try {
    if (!videoList['vod_play_from'] || !videoList['vod_play_url']) return;
    // 分离播放源
    const playFrom = videoList['vod_play_from'];
    const playSources = playFrom.split('$').filter(Boolean);

    // 处理剧集信息，同时修复缺失'$'的条目
    const playUrl = videoList['vod_play_url'];
    const episodesBySource = playUrl
      .split('$$$') // 分离不同播放源的剧集信息
      .map((sourceEpisodes) =>
        sourceEpisodes
          // 修复剧集格式，确保每个条目都包含'$'
          .replace(/\$+/g, '$') // 确保'$'不重复
          .split('#')
          .map((episode) => (episode.includes('$') ? episode : `正片$${episode}`)),
      );

    // 构建完整列表
    const fullList = playSources.reduce((acc, source, index) => {
      acc[source] = episodesBySource[index];
      return acc;
    }, {});

    data = fullList;
    console.log(`[film_common][formatSeason][return]`, data);
  } catch (err) {
    console.log(`[film_common][formatSeason][error]`, err);
  } finally {
    console.log(`[film_common][formatSeason][end]剧集格式化流程结束`);
    return data;
  }
};

// 格式化倒序集数
const formatReverseOrder = (action: 'positive' | 'negative', current: number, total: number) => {
  // 当前 0 总 37 正序 1 倒序 37
  // 当前 1 总 37 正序 2 倒序 36
  if (action === 'positive') return current + 1;
  else if (action === 'negative') return total - current;
  return 1;
};

const fetchBarrageData = async (realUrl: string, options, active): Promise<any> => {
  console.log('[film_common][fetchBarrageData][start]获取弹幕流程开启');
  let data: any = [];
  try {
    const { url, key, support, start, mode, color, content } = options;

    if (!(url && key && support && start && mode && color && content)) return;
    if (!_.some(support, (source) => source === active.flimSource)) return;

    const sourceUrl = formatIndex(active.filmIndex).url;
    if (sourceUrl.startsWith('http')) {
      const { hostname } = new URL(sourceUrl);
      if (VIP_LIST.some((item) => hostname.includes(item))) realUrl = sourceUrl;
    }

    const configRes = await fetchConfig({ url: `${url}${realUrl}`, method: 'GET' });
    if (!configRes[key] || configRes[key].length === 0) return;

    data = configRes.danmuku;
  } catch (err) {
    console.log(`[film_common][fetchBarrageData][error]`, err);
  } finally {
    console.log(`[film_common][fetchBarrageData][end]获取弹幕流程结束`);
    return data;
  }
};

const fetchAnalyzeHelper = async (url: string, type: number) => {
  console.log('[film_common][fetchAnalyzeHelper][start]获取解析流程开启');
  let data = { url: '', originalUrl: url, mediaType: '', headers: {} };

  try {
    const play = { playUrl: '', headers: {} };

    if (type == 1) {
      const resOfficial = await fetchConfig({ url, method: 'GET' });
      if (JSONPath({ path: '$.url', json: resOfficial }).length > 0) {
        play.playUrl = JSONPath({ path: '$.url', json: resOfficial })[0];
        play.headers = resOfficial.headers;
      }
    } else if (type == 0) {
      const resOfficial = await sniffer(url);
      if (resOfficial.url) {
        play.playUrl = resOfficial.url;
        play.headers = resOfficial.headers;
      }
    }

    if (play.playUrl) {
      const mediaType = await checkMediaType(play.playUrl);
      if (mediaType !== 'unknown' && mediaType !== 'error') {
        data = { url: play.playUrl, originalUrl: url, mediaType, headers: play.headers };
      }
    }
  } catch (err: any) {
    console.log(`[film_common][fetchAnalyzeHelper][error]${err.message}`);
  } finally {
    console.log(`[film_common][fetchAnalyzeHelper][end]获取解析流程结束`);
    return data;
  }
};

export {
  VIP_LIST,
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
  fetchBarrageData,
  playHelper,
  reverseOrderHelper,
  fetchDoubanRecommHelper,
  fetchRecommSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
  fetchAnalyzeHelper,
};
