import _ from 'lodash';
import jsonpath from 'jsonpath';
import PQueue from 'p-queue';

import { encodeBase64 } from '@/utils/tool';

import { fetchAnalyzePlay } from '@/api/analyze';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { setStream } from '@/api/lab';
import { setT3Proxy } from '@/api/proxy';
import { detailStar, addStar, delStar, updateStar } from '@/api/star';

import {
  fetchDrpyPlayUrl,
  fetchHipyPlayUrl,
  fetchT3PlayUrl,
  fetchXBPQPlayUrl,
  t3RuleProxy,
  t3RuleInit,
  catvodRuleInit,
  xbpqInit,
  fetchDetail,
  fetchSearch,
  fetchCatvodPlayUrl,
  fetchDoubanRecommend,
} from '@/utils/cms';
import sniffer from '@/utils/sniffer';
import { checkMediaType, dictDeepClone, getConfig } from '@/utils/tool';

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

// Binge
const fetchBingeData = async (relateId: string, videoId: number): Promise<{ status: boolean; data: any }> => {
  try {
    const response = await detailStar({ relateId, videoId });
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

const putBingeData = async (action: string, id: any = null, doc: any = {}): Promise<{ status: boolean; data: any }> => {
  try {
    let res = {};
    if (action === 'add') {
      res = await addStar(doc);
    } else if (action === 'del') {
      res = await delStar(id);
    } else if (action === 'update') {
      res = await updateStar(id, doc);
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
    const response = await detailHistory({ relateId, videoId });
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
      data = await updateHistory(id, doc);
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

// Analyze
const fetchAnalyzeData = async (): Promise<{ default: any; flag: any[]; active: any[] }> => {
  console.log('[film_common][fetchAnalyzeData][start]开始获取解析数据流程');
  let data: { default: any; flag: any[]; active: any[] } = { default: {}, flag: [], active: [] };

  try {
    const response = await fetchAnalyzePlay();
    data = {
      default: response.default || {},
      flag: response.flag || [],
      active: response.active || [],
    };
    console.log(`[film_common][fetchAnalyzeData][return]`, data);
  } catch (err) {
    console.error(`[film_common][fetchAnalyzeData][error]`, err);
  } finally {
    console.log('[film_common][fetchAnalyzeData][end]获取解析数据流程结束');
    return data;
  }
};

// Ad
const removeAd = async (url: string, type: string, headers: object | null = null) => {
  console.log('[film_common][removeAd][start]开始移除广告流程');
  let data = {
    url,
    msg: 'fail',
    code: 500,
  };
  try {
    if (type === 'm3u8') {
      data = await setStream(url, '.m3u8', headers ? headers : null);
    }
    console.log(`[film_common][removeAd][return]`, data);
  } catch (err) {
    console.error(`[film_common][removeAd][error]`, err);
  } finally {
    console.log('[film_common][removeAd][end]移除广告流程结束');
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
 * @param analyze 解析 url type flag
 * @param flimSource 当前选中线路
 * @param adFlag 是否去广告
 * @returns
 */
const playHelper = async (snifferMode, url: string, site, analyze, flimSource, adFlag = false) => {
  console.log(`[film_common][playHelper][before_start]准备处理地址:${url}`);
  console.log(`[film_common][playHelper][start]播放处理流程开始`);

  let data: { url: string; mediaType: string; isOfficial: boolean; headers: object | null } = {
    url: '',
    mediaType: '',
    isOfficial: false,
    headers: null,
  };

  try {
    let playerUrl = url;
    let script: string = '';
    let extra: string = '';
    let isOfficial: boolean = false;
    let headers: object | null = null;
    let parse = true;
    let playData: any = { playUrl: url, script: '', extra: '', parse: parse };

    // 解析播放
    const jxPlay = async (url: string, analyze: any, snifferMode: any): Promise<any> => {
      let playerUrl = url;
      const urlObj = url && url.startsWith('http') ? new URL(url) : null;
      const hostname = urlObj?.hostname;

      // 官方解析条件
      const isOfficial =
        (hostname && VIP_LIST.some((host) => hostname.includes(host))) ||
        analyze.flag.some((flag) => flimSource.includes(flag));

      if (analyze?.url) {
        // 官方解析地址
        const officialSnifferUrl = isOfficial && analyze.url ? `${analyze.url}${url}` : '';

        // 预处理嗅探URL
        const preSnifferUrl = officialSnifferUrl;

        if (preSnifferUrl) {
          switch (analyze.type) {
            case 1: // JSON类型
              playerUrl = await fetchJxJsonPlayUrlHelper(analyze.url, url);
              break;
            case 0: // Web类型
              const snifferApi =
                snifferMode.type === 'custom' && /^http/.test(snifferMode.url)
                  ? new URL(snifferMode.url).origin + new URL(snifferMode.url).pathname
                  : '';
              playerUrl = await fetchJxWebPlayUrlHelper(snifferMode.type, `${snifferApi}?url=${preSnifferUrl}`);
              break;
            default: // 不支持的解析类型处理
              console.warn(`[film_common][playHelper][warn]不支持的解析类型: ${analyze.type}`);
          }
        }
      }

      return {
        url: playerUrl || url,
        isOfficial: isOfficial,
      };
    };

    if (site.playUrl) {
      playerUrl = await fetchJxJsonPlayUrlHelper(site.playUrl, url);
    } else {
      switch (site.type) {
        case 2:
          // drpy免嗅
          playerUrl = await fetchDrpyPlayUrlHelper(site, url);
          break;
        case 6:
          // hipy获取服务端播放链接
          playData = await fetchHipyPlayUrlHelper(site, flimSource, url);
          playerUrl = playData.playUrl;
          script = playData.script;
          extra = playData.extra;
          parse = playData.parse;
          break;
        case 7:
          // t3获取服务端播放链接
          await t3RuleInit(site);
          playData = await fetchT3PlayUrlHelper(flimSource, url, []);
          playerUrl = playData.playUrl;
          script = playData.script;
          extra = playData.extra;
          parse = playData.parse;
          break;
        case 8:
          // catvox获取服务端播放链接
          await catvodRuleInit(site);
          playData = await fetchCatvodPlayUrlHelper(site, flimSource, url);
          playerUrl = playData.playUrl;
          extra = playData.extra;
          parse = playData.parse;
          break;
        case 9:
          // xbpq获取服务端播放链接
          await xbpqInit(site);
          playData = await fetchXBPQPlayUrlHelper(flimSource, url);
          playerUrl = playData.playUrl;
          extra = playData.extra;
          break;
      }
      if (!playerUrl) playerUrl = url; // 可能出现处理后是空链接
      if (analyze) {
        const resJX = await jxPlay(playerUrl, analyze, snifferMode);
        playerUrl = resJX.url;
        isOfficial = resJX.isOfficial;
      }
    }

    if (playerUrl) {
      const mediaType = await checkMediaType(playerUrl);
      if (mediaType !== 'unknown' && mediaType !== 'error') {
        data = { url: playerUrl, mediaType, isOfficial, headers };
        return;
      }
    }

    // 兜底办法:嗅探
    console.log(`[film_common][playHelper][reveal]尝试提取播放链接`);

    // 自定义嗅探器并且链接正确才有嗅探器api接口前缀
    const snifferApi =
      snifferMode.type === 'custom' && /^http/.test(snifferMode.url)
        ? new URL(snifferMode.url).origin + new URL(snifferMode.url).pathname
        : '';

    let snifferPlayUrl = `${snifferApi}?url=${playerUrl}`;
    if (script) snifferPlayUrl += `&script=${script}`
    if (extra) snifferPlayUrl += `&${extra}`
    // console.log(`snifferPlayUrl: ${snifferPlayUrl}`);
    let snifferResult = await sniffer(snifferMode.type, snifferPlayUrl);
    data.url = snifferResult.data;
    data.headers = snifferResult.headers;
    data.mediaType = (await checkMediaType(data.url)) || 'm3u8';
    data.isOfficial = isOfficial;

    console.log(`[film_common][playHelper][return]`, data);
  } catch (err) {
    console.error(`[film_common][playHelper][error]`, err);
  } finally {
    console.log(`[film_common][playHelper][end]播放处理流程结束`);
    if (adFlag && data.url && !data.url.startsWith('http://127.0.0.1') && data.mediaType.includes('m3u8')) {
      // const response = await removeAd(data.url, data.mediaType!, data.headers);
      // if (response.code === 200) data.url = response?.url;
      data.url = `http://127.0.0.1:9978/api/v1/lab/removeAd?url=${data.url}`;
      if (data.headers && Object.keys(data.headers).length > 0) {
        data.url += '&headers=' + JSON.stringify(data.headers);
      }
      data.url += '&type=.m3u8';
      console.log(`本地代理去广告链接: ${data.url}`);
    }
    return data;
  }
};

// EeverseOrder
const reverseOrderHelper = (action: 'positive' | 'negative', data: Record<string, any[]>): Record<string, any[]> => {
  const newData = dictDeepClone(data);

  if (action === 'positive') {
    console.log('[film_common][reverseOrderHelper]正序');
  } else {
    console.log('[film_common][reverseOrderHelper]倒序');
    Object.keys(newData).forEach((key) => newData[key].reverse());
  }
  console.log(newData);
  return newData;
};

// DouBan Recommend
const fetchDoubanRecommendHelper = async (info: any): Promise<any[]> => {
  console.log('[film_common][fetchDoubanRecommendHelper][start]获取豆瓣推荐流程开启');
  let data: any = [];

  try {
    let { vod_name: name, vod_year: year, vod_douban_id: doubanId, vod_douban_type: doubanType } = info;
    if (!year) year = new Date().getFullYear();
    const recommendNames = await fetchDoubanRecommend(doubanId, doubanType, name, year);
    data = recommendNames || [];

    console.log(`[film_common][fetchDoubanRecommendHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchDoubanRecommendHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchDoubanRecommendHelper][end]获取豆瓣推荐流程结束`);
    return data;
  }
};

const fetchRecommendSearchHelper = async (site: any, kw: any): Promise<any[]> => {
  console.log('[film_common][fetchDoubanRecommendHelper][start]推荐搜索流程开启');
  let data: any = {};

  try {
    if (site.search !== 0) {
      const response = await fetchSearch(site, kw);
      if (response.length > 0) {
        const item = response[0];
        if (!('vod_play_from' in item && 'vod_play_url' in item)) {
          [data] = await fetchDetail(site, item.vod_id);
        }
      }
    }
    console.log(`[film_common][fetchRecommendSearchHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchRecommendSearchHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchRecommendSearchHelper][end]推荐搜索流程结束`);
    return data;
  }
};

// Helper functions
const fetchHipyPlayUrlHelper = async (
  site: { [key: string]: any },
  flag: string,
  url: string,
): Promise<{ playUrl: string; script: string; extra: string; parse: boolean }> => {
  console.log('[film_common][fetchHipyPlayUrlHelper][start]获取服务端播放链接开启');
  let data: { playUrl: string; script: string; extra: string; parse: boolean } = {
    playUrl: '',
    script: '',
    extra: '',
    parse: false,
  };

  try {
    const playRes = await fetchHipyPlayUrl(site, flag, url);
    const extra =  playRes?.parse_extra ? `parse_extra='${playRes.parse_extra}&sniffer_exclude = ''` : `''`;
    data = {
      playUrl: playRes.url,
      script: playRes.js ? encodeURIComponent(encodeBase64(playRes.js)) : '',
      extra: extra || '',
      parse: Boolean(playRes.parse),
    };
    console.log(`[film_common][fetchHipyPlayUrlHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchHipyPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchHipyPlayUrlHelper][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchT3PlayUrlHelper = async (
  flag: string,
  id: string,
  flags: string[] = [],
): Promise<{ playUrl: string; script: string; extra: string; parse: boolean }> => {
  console.log('[film_common][fetchT3PlayUrlHelper][start]获取服务端播放链接开启');
  let data: { playUrl: string; script: string; extra: string; parse: boolean } = {
    playUrl: '',
    script: '',
    extra: '',
    parse: false,
  };
  try {
    const playRes = await fetchT3PlayUrl(flag, id, flags);
    if (playRes?.parse === 0 && playRes?.url.indexOf('http://127.0.0.1:9978/proxy') > -1) {
      const proxyRes: any = await t3RuleProxy(playRes.url);
      await setT3Proxy(proxyRes);
    }

    const extra =  playRes?.parse_extra ? `parse_extra='${playRes.parse_extra}&sniffer_exclude = ''` : `''`;

    data = {
      playUrl: playRes.url,
      script: playRes.js ? encodeURIComponent(encodeBase64(playRes.js)) : '',
      extra: extra || '',
      parse: Boolean(playRes.parse),
    };
    console.log(`[film_common][fetchT3PlayUrlHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchT3PlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchT3PlayUrlHelper][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchCatvodPlayUrlHelper = async (site: { [key: string]: any }, flag: string, id: string): Promise<string> => {
  console.log('[film_common][fetchCatvodPlayUrlHelper][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchCatvodPlayUrl(site, flag, id);
    data = res.url;
    console.log(`[film_common][fetchCatvodPlayUrlHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchCatvodPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchCatvodPlayUrlHelper][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchXBPQPlayUrlHelper = async (
  flag: string,
  id: string,
): Promise<{ playUrl: string; extra: string; parse: boolean }> => {
  console.log('[film_common][fetchXBPQPlayUrlHelper][start]获取服务端播放链接开启');
  let data: { playUrl: string; extra: string; parse: boolean } = {
    playUrl: '',
    extra: '',
    parse: false,
  };
  try {
    const playRes = await fetchXBPQPlayUrl(flag, id);

    data = {
      playUrl: playRes.url,
      extra: playRes?.parse_extra || '',
      parse: Boolean(playRes.parse),
    };
    console.log(`[film_common][fetchXBPQPlayUrlHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchXBPQPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchXBPQPlayUrlHelper][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchDrpyPlayUrlHelper = async (site: { [key: string]: any }, url: string): Promise<string> => {
  console.log('[film_common][fetchDrpyPlayUrlHelper][start]免嗅流程开启');
  let data: string = '';
  try {
    const res = await fetchDrpyPlayUrl(site, url);
    if (res.redirect) {
      data = res.url;
      console.log(`[film_common][fetchDrpyPlayUrlHelper][return]`, data);
    }
  } catch (err) {
    console.log(`[film_common][fetchDrpyPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchDrpyPlayUrlHelper][end]免嗅流程结束`);
    return data;
  }
};

const fetchJxJsonPlayUrlHelper = async (playUrl: string, url: string): Promise<string> => {
  console.log('[film_common][fetchJxJsonPlayUrlHelper][start]json解析流程开启');
  let data: string = '';
  try {
    const res = await getConfig(`${playUrl}${url}`);
    // 存在 url data.url 两种结构
    if (jsonpath.value(res, '$.url')) {
      data = jsonpath.value(res, '$.url');
      console.log(`[film_common][fetchJxJsonPlayUrlHelper][return]`, data);
    }
  } catch (err) {
    console.log(`[film_common][fetchJxJsonPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchJxJsonPlayUrlHelper][end]json解析流程结束`);
    return data;
  }
};

const fetchJxWebPlayUrlHelper = async (type: string, url: string): Promise<string> => {
  console.log('[detail][fetchJxWebPlayUrlHelper][start]官解流程开启');
  let data: string = '';
  try {
    const res = await sniffer(type, url);
    data = res.data;
    console.log(`[film_common][fetchJxWebPlayUrlHelper][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchJxWebPlayUrlHelper][error]`, err);
  } finally {
    console.log(`[film_common][fetchJxWebPlayUrlHelper][end]官解流程结束`);
    return data;
  }
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
const formatContent = (item: string | undefined | null): string => {
  if (!item) return '';
  return item!.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 获取播放源及剧集
const formatSeason = (videoList: Record<string, any>): Record<string, any> => {
  console.log('[film_common][formatSeason][start]剧集格式化流程开启');
  let data: any = {
    报错: ['格式化报错$f12查看更多报错信息'],
  };
  try {
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
    const fullList: Record<string, string[]> = playSources.reduce((acc, source, index) => {
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

    const configRes = await getConfig(`${url}${realUrl}`);
    if (!configRes[key] || configRes[key].length === 0) return;

    data = configRes.danmuku;
  } catch (err) {
    console.log(`[film_common][fetchBarrageData][error]`, err);
  } finally {
    console.log(`[film_common][fetchBarrageData][end]获取弹幕流程结束`);
    return data;
  }
};

export {
  VIP_LIST,
  fetchJxJsonPlayUrlHelper,
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
  fetchAnalyzeData,
  fetchBarrageData,
  playHelper,
  reverseOrderHelper,
  fetchDoubanRecommendHelper,
  fetchRecommendSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
};
