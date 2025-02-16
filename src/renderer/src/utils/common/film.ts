import { JSONPath } from 'jsonpath-plus';
import { putHistory, findHistory, addHistory } from '@/api/history';
import { setT3Proxy } from '@/api/proxy';
import { fetchConfig } from '@/api/setting';
import { findStar, addStar, delStar, putStar } from '@/api/star';
import { fetchRecommPage, fetchCmsDetail, fetchCmsSearch, fetchCmsPlay, fetchCmsProxy } from '@/api/site';
import { hash } from '@/utils/crypto';
import sniffer from '@/utils/sniffer';
import { mediaUtils } from '@/components/player';

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
  console.log('[film_common][fetchBingeData][start]收藏获取流程开启');
  let data = {
    status: false,
    data: {},
  };
  try {
    const response = await findStar({ relateId, videoId });
    data = {
      status: !!response,
      data: response || {},
    };
    console.log(`[film_common][fetchBingeData][return]`, data);
  } catch (err) {
    console.error(`[film_common][fetchBingeData][error]`, err);
  } finally {
    console.log(`[film_common][fetchBingeData][end]收藏获取流程结束`);
    return data;
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
  console.log('[film_common][putBingeData][start]收藏更新流程开启');
  let data = {
    status: false,
    data: {},
  };
  try {
    let res = {};
    if (action === 'add') {
      res = await addStar(doc);
    } else if (action === 'del') {
      res = await delStar({ ids: [id] });
    } else if (action === 'update') {
      res = await putStar({ ids: [id], doc });
    }
    data = {
      status: true,
      data: res,
    };
    console.log(`[film_common][putBingeData][return]`, data);
  } catch (err) {
    console.error(`[film_common][putBingeData][error]`, err);
  } finally {
    console.log(`[film_common][putBingeData][end]收藏更新流程结束`);
    return data;
  }
};

/**
 * 获取历史数据
 * @param relateId 关联ID
 * @param videoId 视频ID
 * @returns { status: boolean, data: any }
 */
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

/**
 * 更新历史数据
 * @param id 历史ID
 * @param doc 更新数据
 * @returns { status: boolean, data: any }
 */
const putHistoryData = async (id: any = null, doc: any = {}): Promise<void> => {
  console.log('[film_common][putHistoryData][start]历史更新流程开启');
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
    console.log(`[film_common][putHistoryData][return]`, data);
  } catch (err) {
    console.log(`[film_common][putHistoryData][error]`, err);
  } finally {
    console.log(`[film_common][putHistoryData][end]历史更新流程结束`);
    return data?.[0];
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

  let data: { [key: string]: any } = { url: '', originalUrl: url, mediaType: '', headers: {}, quality: [] };

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
      quality: [],
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

    if (play.url && Array.isArray(play.url)) {
      play.quality = play.url.reduce((acc, currentValue, index) => {
        // 检查索引的奇偶性
        if (index % 2 === 0) {
          // 奇数索引，当前值是 name
          acc.push({ name: currentValue, url: play.url[index + 1] });
        }
        return acc;
      }, []);
      // @ts-ignore
      play.url = play.quality[0].url;
    }

    // 直链直接获取数据类型
    if (play.url && play.parse === 0) {
      // 设置代理
      if (playRes.url.indexOf('http://127.0.0.1:9978/proxy') > -1) {
        const formatProxyUrl = new URL(playRes.url);
        const proxyParams = Object.fromEntries(formatProxyUrl.searchParams.entries());
        const proxyData = await fetchCmsProxy({ sourceId: site.id, ...proxyParams });
        await setT3Proxy({ text: proxyData, url: proxyParams.url });
      }

      const mediaType = await mediaUtils.checkMediaType(play.url, play.headers);
      if (mediaType !== 'unknown' && mediaType !== 'error') {
        data = { ...data, url: play.url, mediaType, headers: play.headers, quality: play.quality };
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
      play.headers,
    );
    data.headers = snifferResult.headers;
    data.url = snifferResult.url;
    data.mediaType = (await mediaUtils.checkMediaType(snifferResult.url, snifferResult.headers)) || 'm3u8';
    data.quality = play.quality || [];
  } catch (err) {
    console.error(`[film_common][playHelper][error]`, err);
  } finally {
    if (adFlag && data.url && !data.url.startsWith('http://127.0.0.1') && data.mediaType.includes('m3u8')) {
      console.log('[film_common][removeAd][start]开始移除广告流程');
      // data.url = `http://127.0.0.1:9978/api/v1/lab/ad?url=${encodeURI(data.url)}&headers=${JSON.stringify(data.headers || {})}`;
      const url = encodeURI(data.url);
      const headers = JSON.stringify(data.headers || {});
      data.url = `http://127.0.0.1:9978/api/v1/lab/ad?url=${url}&headers=${headers}`;
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

/**
 * 格式化剧集名称
 * @param item 剧集名称
 * @returns 剧集名称
 */
const formatName = (item: string): string => {
  const [first] = item.split('$');
  return first.includes('http') ? '正片' : first;
};

/**
 * 格式化剧集集数
 * @param item 剧集集数
 * @returns 剧集集数
 */
const formatIndex = (item: string): { index: string; url: string } => {
  const [index, url] = item.split('$');
  return { index, url };
};

/**
 * 格式化style
 * @param text 文本
 * @param keyword 关键字
 * @returns 文本
 */
const formatContent = (text: string | undefined | null): string => {
  if (!text) return '';
  text = text.trim();

  const retainTextMap = [
    '年份', '年代', '上映',
    '地区', '类型', '语言', '更新', '更新至', '评分',
    '导演', '编剧', '主演', '演员',
    '简介', '背景', '详情',
    '片长', '状态', '播放', '集数', '标签', '更新至',
  ];
  const retainCharMap = ['：', ':', ' '];

  // 遍历关键词，处理匹配的文本
  for (const keyword of retainTextMap) {
    if (text.startsWith(keyword)) {
      const remainingText = text.slice(keyword.length).trim();
      for (const char of retainCharMap) {
        if (remainingText.startsWith(char)) {
          text = remainingText.slice(char.length).trim();
          break;
        }
      }
      break;
    }
  }

  if (text.startsWith('/') || text.endsWith('/')) {
    text = text.split('/').filter(Boolean).join(' | ');
  }

  return text;
};

/**
 * 格式化剧集
 * @param videoList 剧集信息
 * @returns 剧集信息
 */
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

/**
 * 格式化倒序集数
 * @param action 操作类型 positive:正序 negative:倒序
 * @param current 当前集数
 * @param total 总集数
 * @returns 集数
 */
const formatReverseOrder = (action: 'positive' | 'negative', current: number, total: number) => {
  // 当前 0 总 37 正序 1 倒序 37
  // 当前 1 总 37 正序 2 倒序 36
  if (action === 'positive') return current + 1;
  else if (action === 'negative') return total - current;
  return 1;
};

/**
 * 获取弹幕
 * @param realUrl 播放链接
 * @param options 弹幕配置
 * @param active 当前选中线路
 * @returns 弹幕
 */
const fetchBarrageData = async (
  realUrl: string,
  options: { url: string, id: string | number, key: string, support: string[], start: number, mode: number, color: number, content: number },
  active: { flimSource: string, filmIndex: string },
): Promise<{ barrage: string[], id: string | number | null }> => {
  console.log('[film_common][fetchBarrageData][start]获取弹幕流程开启');
  let data: any = { barrage: [], id: null };

  try {
    if (!realUrl || !/^(https?:\/\/)/.test(realUrl)) return data;
    // 去除参数
    const { origin, pathname, hostname } = new URL(realUrl);
    realUrl = `${origin}${pathname}`;

    const { flimSource } = active;
    const { url, id, key, support, start, mode, color, content } = options;

    // 分组条件
    const isValidUrl = typeof url === 'string' && /^(https?:\/\/)/.test(url);
    const isValidId = id && ['string', 'number'].includes(typeof id);
    const isValidKey = typeof key === 'string' && key.length > 0;
    const isValidSupport = (Array.isArray(support) && support.length > 0 && support.includes(flimSource)) || VIP_LIST.some((domain) => hostname.includes(domain));
    const isValidNumbers = [start, mode, color, content].every(value => typeof value === 'number');
    // 综合判断
    if (isValidUrl && isValidId && isValidKey && isValidSupport && isValidNumbers) {
      const res = await fetchConfig({ url: `${url}${realUrl}`, method: 'GET' });
      let formatId = res.data?.[id] || null;
      if (formatId && /^(https?:\/\/)/.test(formatId)) formatId = hash['md5-16'](formatId);
      const barrageRes = res.data?.[key] || [];
      if (Array.isArray(barrageRes) && barrageRes.length !== 0) {
        const formatBarrage: any[] = barrageRes.map((item) => ({
          text: item[content],
          time: parseInt(item[start]),
          color: item[color],
          mode: item[mode],
        }));
        data = { barrage: formatBarrage, id: formatId };
      }
    }
    console.log(`[film_common][fetchBarrageData][return]`, data);
  } catch (err) {
    console.log(`[film_common][fetchBarrageData][error]`, err);
  } finally {
    console.log(`[film_common][fetchBarrageData][end]获取弹幕流程结束`);
    return data;
  }
};

/**
 * 获取解析
 * @param url 播放链接
 * @param type 解析类型
 * @returns 解析
 */
const fetchAnalyzeHelper = async (url: string, type: number) => {
  console.log('[film_common][fetchAnalyzeHelper][start]获取解析流程开启');
  let data: { [key: string]: any } = { url: '', originalUrl: url, mediaType: undefined, headers: {} };

  try {
    const play = { playUrl: '', headers: {} };

    if (type == 1) {
      const resOfficial = await fetchConfig({ url, method: 'GET' });
      const paeseOfficial = JSONPath({ path: '$.url', json: resOfficial.data });
      if (paeseOfficial.length > 0) {
        play.playUrl = paeseOfficial[0];
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
      const mediaType = await mediaUtils.checkMediaType(play.playUrl, play.headers);
      if (mediaType !== 'unknown' && mediaType !== 'error') {
        data = { url: play.playUrl, originalUrl: url, mediaType, headers: play.headers };
      }
    }
  } catch (err) {
    console.error(`[film_common][fetchAnalyzeHelper][error]`, err);
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
