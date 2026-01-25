import { loggerService } from '@logger';
import * as XBPQParse from '@main/utils/hiker/ruleParse';
import { MOBILE_UA, PC_UA } from '@main/utils/hiker/ua';
import { request } from '@main/utils/request';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import { hash } from '@shared/modules/crypto';
import { getHome, urlResolve } from '@shared/modules/headers';
import type {
  ICmsCategory,
  ICmsCategoryOptions,
  ICmsDetail,
  ICmsDetailOptions,
  ICmsHome,
  ICmsHomeVod,
  ICmsInit,
  ICmsPlay,
  ICmsPlayOptions,
  ICmsProxy,
  ICmsProxyOptions,
  ICmsRunMian,
  ICmsRunMianOptions,
  ICmsSearch,
  ICmsSearchOptions,
  IConstructorOptions,
} from '@shared/types/cms';
import JSON5 from 'json5';

import {
  removeChars,
  removeDuplicatesByValue,
  removeTagsExceptList,
  replaceTagsWithMapping,
  stringex,
} from './methods';
import { autoRule, extRule, searchmap } from './rule';

const logger = loggerService.withContext(SITE_LOGGER_MAP[SITE_TYPE.T3_XBPQ]);

stringex();

function stringtoJson(obj) {
  const text = obj.ext;
  const regex = /([^:,]+):([^,]+)/g;
  const result = {};
  let match;
  while (true) {
    match = regex.exec(text);
    if (match === null) break;
    result[match[1]] = match[2];
  }
  delete obj.text;
  return Object.assign(obj, result);
}

/**
 *处理HTML实体字符
 */
function htmlEntitiesToText(htmlString) {
  // 定义一个 HTML 实体到字符的映射表
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
  };

  // 使用正则表达式和映射表替换 HTML 实体
  return htmlString.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match) => {
    // 如果实体在映射表中，则替换它
    if (entities[match]) {
      return entities[match];
    } else {
      // 如果实体不在映射表中，尝试解码十进制或十六进制实体
      const code = match.startsWith('&#x')
        ? match.substring(3, match.length - 1)
        : match.substring(2, match.length - 1);
      if (match.startsWith('&#x')) {
        // 十六进制实体
        return String.fromCharCode(Number.parseInt(code, 16));
      } else if (match.startsWith('&#')) {
        // 十进制实体
        return String.fromCharCode(Number.parseInt(code, 10));
      }
      // 如果都不是，则返回原实体（虽然这可能不是一个有效的实体）
      return match;
    }
  });
}

/**
 *文本# $ 转换对象
 */
function parseStringToObject(inputString) {
  const obj = {};
  const keyValuePairs = inputString.split('#');
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split('$');
    if (key && value) {
      obj[key] = value.trim();
    }
  });

  return obj;
}

/**
 * 对象转querystring
 */
function objToQueryString(obj, shouldEncode?) {
  // 如果第二个参数是true，则进行编码
  const encode = typeof shouldEncode === 'boolean' ? shouldEncode : false;
  return Object.keys(obj)
    .map(function (key) {
      if (encode) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
      } else {
        return `${key}=${obj[key]}`;
      }
    })
    .join('&');
}

// @ts-expect-error declared but its value is never read
// eslint-disable-next-line ts/no-unused-vars
function findMostCommonStructure(urls) {
  const pathCount = {};
  // 提取每个URL的路径部分并统计
  urls.forEach((url) => {
    // 假设URL的结构是http://example.com/ + path
    const path = url.split('//')[1].split('/')[1]; // 取http://example.com/之后的部分
    if (!pathCount[path]) {
      pathCount[path] = 0;
    }
    pathCount[path] += 1;
  });
  // 找出出现次数最多的路径
  let maxCount = 0;
  let mostCommonPath = '';
  for (const path in pathCount) {
    if (pathCount[path] > maxCount) {
      maxCount = pathCount[path];
      mostCommonPath = path;
    }
  }
  return mostCommonPath;
}

function findIndicesOfElementsWithNumbers(arr) {
  // 使用正则表达式来检测字符串中是否包含数字
  const regex = /\d/;
  // 使用 map 方法来遍历数组，并返回包含数字的元素的索引
  const indices = arr
    .map((element, index) => {
      // 检查元素是否包含数字
      if (typeof element === 'string' && !regex.test(element)) {
        // 如果包含数字，返回索引
        return index;
      }
      // 如果不包含数字，不返回任何值
      return null;
    })
    .filter((index) => index !== null); // 过滤掉 null 值
  return indices;
}

function findMostCommonBaseStructure(urls) {
  const pathCount = {};
  // 提取每个URL的路径部分，不包括查询参数
  urls.forEach((url) => {
    // const path = String(new URL(url).getPath()); // 只取路径部分
    // let baseStructure = path.split('/').slice(1, -1).join('/'); // 去掉开头的'/'和末尾的文件名或ID
    let baseStructure = url.split('?')[0].split('/').slice(3, -1).join('/');
    if (baseStructure.includes('-')) {
      const temp = baseStructure.split('-');
      baseStructure = temp[findIndicesOfElementsWithNumbers(temp)[0]];
      // logger.info(baseStructure)
    }
    // logger.info(baseStructure)
    if (!pathCount[baseStructure]) {
      pathCount[baseStructure] = 0;
    }
    pathCount[baseStructure] += 1;
  });
  // 找出出现次数最多的基础结构
  let maxCount = 0;
  let mostCommonBaseStructure = '';
  for (const base in pathCount) {
    if (pathCount[base] > maxCount) {
      maxCount = pathCount[base];
      mostCommonBaseStructure = base;
    }
  }
  return mostCommonBaseStructure;
}

function convertMultipleUnicodeEscapedWords(str) {
  const unicodeEscapeWordRegex = /\\u[a-fA-F0-9]{4}(?:\\u[a-fA-F0-9]{4})*/g;
  return str.replace(unicodeEscapeWordRegex, (match) => {
    return match.replace(/\\u([a-fA-F0-9]{4})/g, (_seq, p1) => {
      return String.fromCharCode(Number.parseInt(p1, 16));
    });
  });
}

function collapseSpacesAndTrim(str) {
  str = str.replace(/\r\n|\r|\n/g, '');
  str = str.replace(/\s+/g, ' ');
  str = str.trim();
  str = str.replace(/&nbsp;/g, ' ');
  str = convertMultipleUnicodeEscapedWords(str);
  str = str.replace(/\s+/g, ' ');
  return str;
}

function optimizeHtmlContent(htmlString) {
  // 替换多个连续的<br>标签为一个
  htmlString = htmlString.replace(/(<br>\s*){2,}/g, '<br>');
  // 以下是其他可能的优化步骤（可选）
  // 移除开头和结尾的空白字符
  htmlString = htmlString.replace(/^\s+|\s+$/g, '');
  // 移除不必要的空白字符，如多个连续的空白字符
  htmlString = htmlString.replace(/\s{2,}/g, ' ');
  // 返回优化后的HTML内容
  return htmlString;
}

function removeSingleAngleBrackets(inputString) {
  // 正则表达式匹配单独的 < 或 > 符号，不包括标签内的
  return inputString.replace(/<([^>]+)>|<([^>])|([^<])>/g, function (match, p1, _p2, p3) {
    // 如果匹配到完整的标签，则保留
    if (p1) {
      return match;
    }
    if (/[。，]/.test(p3)) {
      return p3;
    }
    // 如果是单独的 < 或 > 符号，则移除
    return '';
  });
}

function extractUrlParts(url) {
  const regex = /^(?:([a-z]+):\/\/)?(?:(\w+:\w+)@)?([\w.-]+)(?::(\d+))?(\/[^?#]*)?/i;
  const match = url.match(regex);

  if (match) {
    return {
      protocol: match[1] || 'http', // 默认协议为http
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5] || '/',
    };
  }
  return null;
}

// @ts-expect-error declared but its value is never read
// eslint-disable-next-line ts/no-unused-vars
function findLongindex(arrays) {
  let maxLength = 0;
  let index = 0;
  // const longestSubset = [];
  arrays.forEach((subArray, i) => {
    if (subArray.length > maxLength) {
      maxLength = subArray.length;
      index = i;
    }
  });
  return index;
}

// @ts-expect-error declared but its value is never read
// eslint-disable-next-line ts/no-unused-vars
function isNestedArray(arr) {
  return arr.some((item) => Array.isArray(item));
}

function mergeStringsToJSON(str1, str2, type) {
  // 将 str1 按照 "&" 分割成数组
  const sstr2 = str2;
  const arr1 = str1.split('&');
  if (arr1[0] !== '全部' && str2 === '*' && type !== 'by') {
    arr1.unshift('全部$');
  }
  if (str2 === '*') {
    str2 = undefined;
  }
  // 如果 str2 为空，初始化 arr2 为 arr1 的副本，每个元素的 "$" 后的部分为空字符串
  const arr2 = str2 ? str2.split('&') : arr1.map((item) => (item.includes('$') ? item.split('$')[1] : item));
  // 检查 arr1 和 arr2 的长度是否相等
  if (str2 && arr1.length !== arr2.length) {
    return;
  }
  if (arr1[0] !== '全部' && arr2[0] !== '' && sstr2 !== '*' && type !== 'by') {
    arr1.unshift('全部');
    arr2.unshift('');
  }
  // 初始化结果数组
  const result: any[] = [];
  // 遍历 arr1 和 arr2
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i].split('$')[0]; // 获取 "$" 前的值
    const item2 = arr2[i] || ''; // 获取 "$" 后的值或默认为空字符串
    // 将处理后的 arr1 和 arr2 的元素添加到结果数组
    result.push({
      n: item1,
      v: item2,
    });
  }
  return result;
}

function getFilter(i, rule, name) {
  const aliasMap = new Map([
    ['电影', new Set(['电影', '電影'])],
    ['连续剧', new Set(['连续剧', '連續劇', /[剧劇]集/, /[电電][视視][剧劇]/])],
    ['综艺', new Set(['综艺', '綜藝', /综艺/])],
    ['动漫', new Set(['动漫', '動漫'])],
    ['纪录片', new Set(['纪录片'])],
  ]);

  function getOriginalByAlias(key) {
    for (const [k, v] of aliasMap) {
      for (const it of v) {
        if (it instanceof RegExp) {
          // 正则表达;
          if (it.test(key)) {
            return k;
          }
        } else {
          // 字符串;
          if (it === key) {
            return k;
          }
        }
      }
    }
    return key; // 原始值
  }
  name = getOriginalByAlias(name);

  const items = new Map();
  const tempArray: any[] = [];
  const mapp = new Map([
    ['类型', 'cateId'],
    ['剧情', 'class'],
    ['地区', 'area'],
    ['年份', 'year'],
    ['语言', 'lang'],
    ['字母', 'letter'],
    ['排序', 'by'],
  ]);
  mapp.forEach((v, k, _m) => {
    let item = rule.getRuleValue([k]);
    const value = rule.getRuleValue([`${k}值`]);

    if (item && item !== '*') {
      if (item.includes('||')) {
        item = item.split('||');
        // eslint-disable-next-line array-callback-return
        item.map((n, ni) => {
          if (n.includes('--')) {
            const parts = n.split('--');
            // parts[1] = "全部$&" + parts[1];
            items.set(parts[0], {
              v: parts[1],
              index: ni,
            });
          }
        });
        if (items.size > 0) {
          item = items.get(name);
          if (typeof item == 'object') {
            item = item.v;
          }
        } else {
          item = item[i];
        }
      }
      if (item === '空') {
        return;
      }
      if (item && item.includes('#')) {
        item = item.split('#').map((it) => {
          if (it.includes('$')) {
            const parts = it.split('$');
            return {
              n: parts[0],
              v: parts[1],
            };
          } else {
            return {
              n: it,
              v: it,
            };
          }
        });
        if (item[0].n !== '全部' && v !== 'by') {
          item.unshift({
            n: '全部',
            v: '',
          });
        }
      }
      if (item && /^\d+-\d+$/.test(item)) {
        const [s, e] = item.split('-').map(Number);
        item = Array.from(
          {
            length: e - s + 1,
          },
          (_, i) => e - i,
        ).join('&');
      }

      if (item && item.includes('&')) {
        item = mergeStringsToJSON(item, value, v);
      }
      if (!item) {
        return;
      }
      tempArray.push({
        key: v,
        name: k,
        value: item,
      });
    }
  });
  return tempArray;
}

class T3XbpqAdapter {
  private rule: Record<string, any> = {};
  private source = {} as IConstructorOptions;
  private XBPQRule: Record<string, any> = {};
  private target = '';
  private categories: string[] = [];

  constructor(source: IConstructorOptions) {
    this.source = source;
    this.categories = source.categories;

    this.XBPQRule = source.ext! as unknown as Record<string, any>;
    if (typeof this.XBPQRule?.ext !== 'object') {
      this.XBPQRule = stringtoJson(this.XBPQRule);
    }
    // if (source.click) {
    //   this.XBPQRule.click = source.click;
    // }
    // if (source.lazy) {
    //   this.XBPQRule.lazy = source.lazy;
    // }

    this.rule = {
      name: source.name,
      host: source.api,
      play_parse: true,
      一级: 'true',
      推荐: 'true',
      类型: '影视',
      switchs: '',
      snifferw: '',
      exsnifferw: '',
      // 模板: "自动"
    };
  }

  async init(): Promise<ICmsInit> {
    let res = this.source.ext;
    if (this.source.ext!.startsWith('http')) {
      const { data } = await request.request({
        url: this.source.ext!,
        method: 'GET',
        responseType: 'text',
        headers: {
          'User-Agent': 'okhttp/4.12.0',
        },
      });
      res = data;
    }
    try {
      res = JSON5.parse(res!);
      this.XBPQRule = Object.assign(this.XBPQRule, res);
    } catch {}

    this.rule.headers = {};
    const 主页url = this.getRuleValue(['主页url'], '');
    const 分类url = getHome(this.getRuleValue(['分类url']));

    let url = 主页url;
    if (主页url === '') {
      url = 分类url;
    }

    this.rule.host = getHome(url);
    this.rule.URL = extractUrlParts(this.rule.host);
    let turl = this.getRuleValue(['分类url']);
    turl = this.splitTextWithSingleBracket(turl).filter((e) => e)[0];
    if (turl.includes(';;')) {
      const temp = turl.split(';;');
      turl = temp[0];
      this.rule.switchs = temp[1];
      this.setSwitchs(this.rule.switchs);
    }
    if (this.getRuleValue(['hikerListCol'])) {
      this.rule.hikerListCol = this.getRuleValue(['hikerListCol']);
    }
    if (this.getRuleValue(['hikerClassListCol'])) {
      this.rule.hikerClassListCol = this.getRuleValue(['hikerClassListCol']);
    }

    let 首页 = this.getRuleValue(['首页']);
    let 分类 = this.getRuleValue(['分类']);

    if (分类.startsWith('http')) {
      logger.info(`获取远程分类url: ${分类}`);
      const tmp = await this.req(分类);
      try {
        const json = JSON.parse(tmp);
        if (Object.hasOwn(json, 'class')) {
          分类 = json.class
            .map((x) => {
              return `${x.type_name}$${x.type_id}`;
            })
            .join('#');
          this.XBPQRule['分类'] = 分类;
          logger.info(分类);
        }
      } catch {}
    }

    const nowYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = 0; i < 15; i++) {
      years[i] = `${nowYear - i}$${nowYear - i}`;
    }
    autoRule['年份'] = years.join('#');

    const 主分类: Array<{ type_name: string; type_id: string }> = [];
    if (分类.includes('$')) {
      for (const c of 分类.split('#')) {
        const d = c.split('$');
        主分类.push({
          type_name: d[0],
          type_id: d[1],
        });
      }
    } else if (分类.includes('&') && this.getRuleValue(['分类值'])) {
      const typenames = 分类.split('&');
      const typeids = this.getRuleValue(['分类值']).split('&');
      for (const i in typeids) {
        主分类.push({
          type_name: typenames[i],
          type_id: typeids[i],
        });
      }
    }

    const 分类数组 = this.getRuleValue(['分类数组']);

    if (主分类.length === 0 && 分类数组) {
      const autoContent = this.AutoContent();
      logger.info('获取分类中...');
      const mainurl = autoContent.isEmpty(['主页url']) ? this.getRuleValue(['主页url']) : this.rule.host;
      logger.info('主页url:', mainurl);
      let html = await this.req(mainurl);
      html = autoContent.splitStr(html, ['分类二次截取'], {
        twice: true,
      }) as string;
      const class数组 = XBPQParse.getSplitArray(html, 分类数组);
      const list: any[] = [];
      if (class数组.length) {
        class数组.forEach((item) => {
          const 分类标题 = XBPQParse.getHasRuleSplitStr(item, this.getRuleValue(['分类标题'], '>&&</a'));
          // logger.info(分类标题)
          const 分类id = XBPQParse.getHasRuleSplitStr(item, this.getRuleValue(['分类ID']));
          // logger.info(分类id)
          if (分类id) {
            list.push(`${分类标题}$${分类id}`);
          }
        });
        this.XBPQRule['分类'] = list.join('#');
        logger.info(this.XBPQRule['分类']);
      }
    }

    const clurl = this.getRuleValue(['分类url']);

    if (clurl.includes('{class}') && !this.getRuleValue(['剧情'])) {
      this.XBPQRule['剧情'] = autoRule['剧情'];
    }
    if (clurl.includes('{year}') && !this.getRuleValue(['年份'])) {
      this.XBPQRule['年份'] = autoRule['年份'];
    }
    if (clurl.includes('{area}') && !this.getRuleValue(['地区'])) {
      this.XBPQRule['地区'] = autoRule['地区'];
    }
    if (clurl.includes('{by}') && !this.getRuleValue(['排序'])) {
      this.XBPQRule['排序'] = autoRule['排序'];
    }
    if (首页) {
      if (首页.includes('$')) {
        const temp = 首页.split('$');
        首页 = temp[0];
      }

      let tid;
      const cid = 主分类.findIndex((x) => 首页 === x.type_name);
      if (cid !== -1) {
        tid = 主分类[cid].type_id;
        this.rule['主页surl'] = turl.replace('{cateId}', tid).replace('{catePg}', '1');
      }
    }

    let filters = {};

    if (this.getRuleValue(['筛选']) === '1' || this.getRuleValue(['筛选']) === '') {
      主分类.forEach((it, i) => {
        const tid = it.type_id;
        filters[tid] = getFilter(i, this, it.type_name);
      });

      filters = Object.fromEntries(Object.entries(filters).filter(([_key, value]) => (value as any[]).length > 0));
      this.XBPQRule['筛选'] = filters;
    }

    let ua = this.getRuleValue(['请求头', 'ua', 'UserAgent'], '电脑');
    // logger.info(ua)
    if (ua === '手机') {
      ua =
        'Mozilla/5.0 (Linux; Android 11; Ghxi Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/76.0.3809.89 Mobile Safari/537.36';
    } else if (ua === '电脑') {
      ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36';
    } else if (ua.includes('$')) {
      ua = ua.split('$')[1];
      if (ua === 'PC_UA') {
        ua = PC_UA;
      }
      if (ua === 'MOBILE_UA') {
        ua = MOBILE_UA;
      }
    }

    const playheads = this.getRuleValue(['播放请求头']);
    if (playheads) {
      this.rule.playheads = parseStringToObject(playheads);
    }
    const lazy = this.getRuleValue(['lazy']);
    if (lazy) {
      this.rule.lazy = lazy;
    }

    const click = this.getRuleValue(['click']);
    if (click) {
      this.rule.js = click;
    }
    const snifferw = this.getRuleValue(['嗅探词']);
    if (snifferw) {
      this.rule.snifferw = snifferw.replace(/#/g, '|');
    }
    const exsnifferw = this.getRuleValue(['过滤词']);
    if (exsnifferw) {
      this.rule.exsnifferw = exsnifferw.replace(/#/g, '|');
    }

    this.rule.headers['User-Agent'] = ua;
    if (this.getRuleValue(['Cookie'])) {
      this.rule.headers.Cookie = this.getRuleValue(['Cookie']);
    }
    if (this.getRuleValue(['Referer'])) {
      this.rule.headers.Referer = this.getRuleValue(['Referer']);
    }
    if (this.getRuleValue(['头部集合', 'User'])) {
      const heads = this.getRuleValue(['头部集合', 'User']).split('#');
      for (const head of heads) {
        const [k, v] = head.split('$');
        this.rule.headers[k] = v;
      }
    }
    if (this.getRuleValue(['解析'])) {
      const jx = parseStringToObject(this.getRuleValue(['解析']));
      this.rule['解析'] = jx;
    }
    if (this.getRuleValue(['直接播放']) === '1') {
      this.rule['二级'] = '*';
      if (!this.rule.playheads) {
        this.rule.playheads = this.rule.headers;
      }
      if (!this.rule.playheads.Referer) {
        this.rule.playheads.Referer = this.rule.host;
      }
    }
  }

  async home(): Promise<ICmsHome> {
    const classData = this.getRuleValue(['分类']);
    const rawClassList: Array<{ type_id: string; type_name: string }> = [];

    if (classData.includes('$')) {
      for (let c of classData.split('#')) {
        c = c.split('$') as any;
        rawClassList.push({
          type_id: c[1],
          type_name: c[0],
        });
      }
    } else if (classData.includes('&') && this.getRuleValue(['分类值'])) {
      const typenames = classData.split('&');
      const typeids = this.getRuleValue(['分类值']).split('&');
      for (const i in typeids) {
        rawClassList.push({
          type_id: typeids[i],
          type_name: typenames[i],
        });
      }
    }

    const classes = rawClassList
      .map((item) => ({
        type_id: String(item.type_id ?? '').trim(),
        type_name: item.type_name?.toString().trim() ?? '',
      }))
      .filter(
        (item, index, self) =>
          item.type_id &&
          item.type_name &&
          !this.categories?.includes(item.type_name) &&
          self.findIndex((other) => other.type_id === item.type_id) === index,
      );
    const classIds = classes.map((item) => item.type_id);
    // logger.info(this.getRuleValue(["筛选"]))

    const rawFilters = this.getRuleValue(['筛选'], {});
    const rawFiltersObj = rawFilters && Object.keys(rawFilters).length ? rawFilters : {};
    const filters = Object.keys(rawFiltersObj).reduce((acc, key) => {
      if (String(key) && classIds.includes(String(key))) {
        acc[String(key)] = rawFiltersObj[key];
      }
      return acc;
    }, {});

    this.rule.class = { class: classes, filters };
    logger.info(this.rule);
    return { class: classes, filters };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    const 主页url = this.getRuleValue(['主页url'], '');
    const 分类url = getHome(this.getRuleValue(['分类url']));
    const 主页surl = this.rule['主页surl'] || '';
    let url = 主页url;
    if (主页url === '') {
      url = 分类url;
    }
    if (主页surl !== '') {
      url = 主页surl;
    }
    // logger.info("home", url);

    const list = (await this.一级(url, '首页')) ?? [];
    // try {
    //   list = (await this.一级(url, '首页')).list;
    //   if (list.length > 100) {
    //     list = list.slice(0, 99);
    //   }
    // } catch (err) {
    //   logger.info(`一级加载出错:${err}`);
    // }

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { tid, page: pg = 1, extend = {} } = doc || {};

    let host = getHome(this.getRuleValue(['分类url']));
    if (!host.startsWith('http')) {
      host = getHome(this.getRuleValue(['主页url']));
    }
    // logger.info("host:" + host);

    const urlMap = new Map([
      [
        '{class}',
        {
          v: ['/class/{class}'],
        },
      ],
      [
        '{area}',
        {
          v: ['/area/{area}'],
        },
      ],
      [
        '{year}',
        {
          v: ['/year/{year}'],
        },
      ],
      [
        '{area}',
        {
          v: ['/area/{area}'],
        },
      ],
      [
        '{lang}',
        {
          v: ['/lang/{lang}'],
        },
      ],
      [
        '{letter}',
        {
          v: ['/letter/{letter}'],
        },
      ],
      [
        '{by}',
        {
          v: ['/by/{by}'],
        },
      ],
    ]);
    // !! url含有[]会有问题，未解决
    let url = this.getRuleValue(['分类url']);
    const firstPage = this.getRuleValue(['起始页', '分类起始页码', 'qishiye', 'firstpage'], '1');
    // if ((url.includes('[') && (url.includes('];') || /\]$/.test(url))) || url.includes('|')) {
    if ((url.includes('[') && (url.includes('];') || url.endsWith(']'))) || url.includes('|')) {
      url =
        String(pg) === firstPage
          ? url.replace(/[^\n\r[|\u2028\u2029]*[[|].*(http[^\]]*).*/g, '$1').replace('firstPage=', '')
          : url.replace(/\|\|/g, '\\|').replace(/(.*)[[|].*/g, '$1');
    }
    // logger.info("f:"+url)
    const temp_url = this.splitTextWithSingleBracket(url);
    // logger.info("f:"+temp_url)
    const sresult_url = host + url.replace(host, '');

    if (temp_url.filter((e) => e).length > 1) {
      if (pg === 1) {
        url = host + temp_url[1].replace(host, '');
      } else {
        url = host + temp_url[0].replace(host, '');
      }
    } else {
      url = sresult_url;
    }

    for (const [key, value] of urlMap) {
      // 在这里进行判断
      if (url.includes(key)) {
        // logger.info(`${key}`);
        const k = key.replace(/[{}]/g, '');
        if (Object.hasOwn(extend, k) && extend[k] !== '') {
          /* empty */
        } else {
          for (const vv of Array.from(value.v)) {
            if (url.includes(vv)) {
              url = url.replace(vv, '');
              break;
            }
          }
        }
      }
      // 可以根据需要添加更多的判断
    }
    // logger.info("f:"+url)
    url = url
      .replace('{cateId}', extend.cateId || tid || '')
      .replace('{class}', extend.class || '')
      .replace('{area}', extend.area || '')
      .replace('{year}', extend.year || '')
      .replace('{by}', extend.by || '')
      .replace('{lang}', extend.lang || '')
      .replace('{catePg}', String(pg))
      .replace('{letter}', extend.letter || '');

    if (url.includes(';;')) {
      const temp = url.split(';;');
      url = temp[0];
    }

    const list = (await this.一级(url, extend.cateId || tid)) ?? [];
    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 999 : 0;
    const total = videos.length ? 999 : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const idsArray = ids.split(',');
    let vod_url = ids || '';
    // logger.info('vod_url', vod_url);
    function urljoin(fromPath, nowPath) {
      fromPath = fromPath || '';
      nowPath = nowPath || '';
      return urlResolve(fromPath, nowPath);
    }
    let vod_name;
    let vod_pic;
    const orId = vod_url;
    let fyclass = '';
    logger.info(`orId:${orId}`);
    if (vod_url.includes('$')) {
      const tmp = vod_url.split('$');
      fyclass = tmp[0];
      vod_url = tmp[1];
    }

    const detailUrl = vod_url.split('@@')[0];

    logger.info(`detailUrl:${detailUrl}`);

    if (vod_url.includes('@@')) {
      const tmp = vod_url.split('@@');
      vod_name = tmp[1];
      vod_pic = tmp[2];
    }

    logger.info(`vod_name: ${vod_name}`);
    logger.info(`vod_pic: ${vod_pic}`);

    let url;
    if (!detailUrl.startsWith('http') && !detailUrl.includes('/')) {
      url = this.rule.detailUrl.replaceAll('fyid', detailUrl).replaceAll('fyclass', fyclass);
    } else if (detailUrl.includes('/')) {
      url = urljoin(this.rule.homeUrl, detailUrl);
    } else {
      url = detailUrl;
    }
    // logger.info(url)
    vod_url = url;

    if (this.rule['二级'] === '*') {
      return {
        list: [
          {
            vod_id: vod_url,
            vod_name,
            vod_pic,
            vod_remarks: '',
            vod_blurb: '',
            vod_play_url: `播放视频$${vod_url}`,
            vod_play_from: '嗅探',
          },
        ],
      };
    }

    logger.info(`vod_url:${vod_url}`);

    const html = await this.req(vod_url);
    const host = getHome(vod_url);
    const autoContent = this.AutoContent();

    const lienHtml = autoContent.splitStr(html, ['线路二次截取'], {
      twice: true,
    });

    const fromle = autoContent.splitArray(lienHtml, ['线路数组'], {
      key: '线路数组',
    }) as string[];

    logger.info('fromle', fromle);

    let from: string[] = [];

    // eslint-disable-next-line array-callback-return
    fromle.map((v) => {
      const t = this.getRuleValue(['线路标题']);
      let line_title = autoContent.splitStr(v, ['线路标题'], '">&&<', {
        type: '文本',
        key: '线路标题',
      });

      // if (t && !/(\+|&&)/.test(t)) {
      if (t && !/\+|&&/.test(t)) {
        line_title = t;
      }

      // logger.info(line_title)
      if (line_title != null) {
        from.push(line_title);
      }
    });
    if (from.length === 0) {
      const tfrom = fromle.map((v) => {
        return removeTagsExceptList(v).replace(/[<>]/g, '').trim();
      });
      from = tfrom;
    }
    from = from.filter((e) => e && e !== '');

    // logger.info('from', from);

    let 简介 =
      autoContent.splitStr(html, ['简介'], {
        type: '文本',
        key: '简介',
      }) || '';
    简介 = 简介.replace(/\\\\r\\\\n/g, '<br>').replace(/\\n/g, '<br>');
    // logger.info(简介)

    简介 = removeSingleAngleBrackets(简介);
    简介 = convertMultipleUnicodeEscapedWords(简介);
    简介 = replaceTagsWithMapping(简介, {
      br: ['span', 'p'],
    });
    简介 = removeTagsExceptList(简介, ['br']);
    简介 = optimizeHtmlContent(简介);

    const descs = {
      状态:
        autoContent.splitStr(html, ['影片状态'], autoRule['影片状态'], {
          key: '影片状态',
        }) || '',
      类型:
        autoContent.splitStr(html, ['影片类型'], autoRule['影片类型'], {
          key: '影片类型',
        }) || '',
      主演:
        autoContent.splitStr(html, ['主演'], autoRule['主演'][0], {
          type: '文本',
          key: '主演',
        }) || '',
      导演:
        autoContent.splitStr(html, ['导演'], autoRule['导演'][0], {
          type: '文本',
          key: '导演',
        }) || '',
      年代:
        autoContent.splitStr(html, ['影片年代'], autoRule['影片年代'], {
          key: '影片年代',
        }) || '',
      地区:
        autoContent.splitStr(html, ['影片地区'], autoRule['影片地区'], {
          key: '影片地区',
        }) || '',
    };
    // logger.info(descs)

    for (const key in descs) {
      if (descs[key] !== '') {
        let item = removeTagsExceptList(descs[key]);
        item = collapseSpacesAndTrim(item);
        item = item.replace(/简介[:：].*/, '');
        if (key !== '状态') {
          item = item.replace(/更新[:：].*/, '');
        }
        if (key !== '导演') {
          item = item.replace(/导演[:：].*/, '');
        }
        if (key !== '主演') {
          item = item.replace(/主演[:：].*/, '');
        }
        if (key !== '类型') {
          item = item.replace(/类型[:：].*/, '');
        }
        descs[key] = item;
      }
    }

    logger.info('descs', descs);

    // logger.info(vod_pic)

    const list: any[] = [];
    const resitem: { [key: string]: any } = {
      vod_id: vod_url,
      vod_name,
      vod_year: descs.年代,
      vod_pic,
      vod_remarks: descs.状态,
      vod_area: descs.地区,
      vod_content: 简介,
      vod_actor: descs.主演,
      vod_director: descs.导演,
    };

    // const play = [];

    if (!autoContent.isEmpty('跳转数组')) {
      this.XBPQRule['多线数组'] = this.getRuleValue(['跳转数组']);
      this.XBPQRule['链接数组'] = this.getRuleValue(['链接数组']);
    }

    const 多线 = autoContent.splitStr(lienHtml, ['多线二次截取'], {
      twice: true,
    });

    const 多线数组 = (XBPQParse.getSplitArray(多线, this.getRuleValue(['多线数组'])) || []).map((v) => {
      const { ihost: ithost, getUrl } = this.prefixORsuffix(html, '多线', host);
      let url = XBPQParse.getSplitStr(v, this.getRuleValue(['多线链接'], 'href="&&"'), ithost);
      url = getUrl(url);
      return url;
    });
    if (多线数组.length) {
      logger.info('多线数组', 多线数组);
    }

    let bfs = [];
    let htmls: string[] = [];
    const plays: string[] = [];
    if (多线数组.length) {
      const start_time = new Date().getTime();
      logger.info('多线程开始');
      const heads = this.rule.headers;
      bfs = 多线数组.map((url) => ({
        options: heads,
        url,
      }));
      // htmls = (await batchRequest(bfs)).data;
      htmls = (await Promise.allSettled(
        bfs.map(async (u) => {
          try {
            const { data } = await request.request(u);
            return data;
          } catch {
            return '';
          }
        }),
      )) as any[];
      const end_time = new Date().getTime() - start_time;
      logger.info(`多线程结束,耗时: ${end_time}`);
    }
    // logger.info(htmls.length)

    const surls = new Set();

    function getplaylist(html, playHtmlArr, i, rule) {
      // logger.info(Object.keys(rule))

      const { ihost: phost, getUrl: pgetUrl } = rule.prefixORsuffix(html, '播放', host);
      const playlist: any[] = [];
      // let tplaylist = XBPQParse.getSplitArray(playHtmlArr[i], rule.getRuleValue(["播放列表"], autoRule["播放列表"]));
      // logger.info(playHtmlArr[i])
      const tplaylist = autoContent.splitArray(playHtmlArr[i], ['播放列表'], autoRule['播放列表']);
      // logger.info("播放列表", tplaylist)
      // logger.info(tplaylist.length)

      for (const v of tplaylist) {
        // logger.info(v)

        let title = autoContent.splitStr(v, ['播放标题'], 'title="&&"', {
          type: '文本',
          key: '播放标题',
        });
        // logger.info(title)
        if (title == null) {
          title = v.replace(/.*>/g, '');
          title = removeChars(title, '\n').trim();
        }
        // logger.info(title)

        let url = autoContent.splitStr(v, ['播放链接'], autoRule['播放链接'], {
          host: phost,
          type: '链接',
          key: '播放链接',
        });

        url = pgetUrl(url);
        // logger.info(url);
        if (url === '' || url?.includes('javascript')) {
          continue;
        }
        const it = `${title}$${url}`;
        // logger.info(it)
        if (!surls.has(url)) {
          surls.add(url);
        } else {
          continue;
        }
        playlist.push(it);
      }
      return playlist;
    }

    if (htmls.length === 0) {
      htmls = [html];
    } else {
      htmls = [html].concat(htmls);
    }
    // logger.info(htmls.length)

    htmls.forEach((ithml) => {
      /* let playHtml = ithml;
      if (this.getRuleValue(["播放二次截取"])) {
        playHtml = XBPQParse.getHasRuleSplitStr(ithml, this.getRuleValue(["播放二次截取"]));
      }
      logger.info("playHtml", playHtml)
      if (playHtml == null) {
        playHtml = ithml;
      } */

      const playHtml = autoContent.splitStr(ithml, ['播放二次截取'], {
        twice: true,
      });

      /* let playHtmlArr = XBPQParse.getSplitArray(playHtml, this.getRuleValue(["播放数组"])); */
      const playHtmlArr: any = autoContent.splitArray(playHtml, ['播放数组'], {
        key: '播放数组',
      });

      logger.info('playHtmlArr', playHtmlArr.length);
      // logger.info(playHtmlArr)

      /* if (playHtmlArr.length == 0) {
        playHtmlArr = this.loopTest(lienHtml, "数组", "播放数组")
      } */

      for (const i in playHtmlArr) {
        const playlist = getplaylist(ithml, playHtmlArr, i, this);
        if (this.rule['倒序'] === '1') {
          playlist.reverse();
        }
        plays.push(playlist.join('#'));
      }
    });
    // logger.info(plays);

    const lists = plays.filter((e) => e && e !== '');
    // logger.info(lists)

    logger.info(lists.map((x) => x.split('#').length));

    // const originalFrom = from;
    from = from.slice(0, lists.length);

    // if (!from.length && autoContent.isEmpty(["线路标题"])) {
    //   from = [this.getRuleValue(["线路标题"])];
    // }

    // if (!from.length || !lists.length) {
    //   logger.info("AI匹配");
    //   let ailist = AiMatching.match(vod_url, html);
    //   from = [];
    //   lists = [];
    //   let xi = 0;
    //   for (let it of ailist) {
    //     let oform = originalFrom.at(xi);
    //     from.push(oform || ("线路" + (xi + 1)));
    //     lists.push(it.map(v => v.text + "$" + v.url).join("#"));
    //     xi++;
    //   }
    // }

    resitem.vod_play_from = from.join('$$$');
    resitem.vod_play_url = lists.join('$$$');
    list.push(resitem);

    logger.info(list);

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v, i) => ({
        vod_id: String((v.vod_id || idsArray[i]) ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_year: String(v.vod_year ?? ''),
        vod_lang: v.vod_lang ?? '',
        vod_area: v.vod_area ?? '',
        vod_score: String((v.vod_score || v.vod_douban_score) ?? '0.0'),
        vod_state: v.vod_state ?? '', // '正片' | '预告' | '花絮'
        vod_class: v.vod_class ?? '', // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
        vod_actor: v.vod_actor ?? '',
        vod_director: v.vod_director ?? '',
        vod_content: (v.vod_content ?? '')?.trim(),
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_play_from: v.vod_play_from ?? '',
        vod_play_url: v.vod_play_url ?? '',
        type_name: v.type_name ?? '',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page = 1 } = doc;
    let url = this.getRuleValue(['搜索url'], '/index.php/ajax/suggest?mid=1&wd={wd}&limit=500');
    url = url.replace('{wd}', wd).replace('{pg}', String(page)).replace('{catePg}', String(page));
    const host = this.rule.host;
    let surl = url;
    if (!surl.startsWith('http')) {
      surl = host + surl;
    }
    logger.info(`${this.rule.name} 'search:'${surl}`);
    let html: string = await this.req(surl);
    const autoContent = this.AutoContent();
    const ctype = '搜索';
    // if (this.getRuleValue(["搜索二次截取"])) {
    //   html = XBPQParse.getSplitStr(html, this.getRuleValue(["搜索二次截取"]));
    // }

    html = autoContent.splitStr(html, ['搜索二次截取'], {
      twice: true,
    })!;
    // logger.info(html)

    const htmlList = autoContent.splitArray(html, ['搜索数组', '数组'], {
      key: '数组',
      ctype,
    });

    // logger.info(htmlList)

    // let htmlList = XBPQParse.getSplitArray(html, this.getRuleValue(["搜索数组", "数组"], "<a &&</a>"));

    let list: any[] = [];
    for (const item of htmlList) {
      // let name = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索标题", "标题"], 'title="&&"'));
      const name = autoContent.splitStr(item, ['搜索标题', '标题'], 'title="&&"', {
        type: '文本',
        key: '标题',
        ctype,
      });

      let remarks = autoContent.splitStr(item, ['搜索副标题', '副标题'], {
        type: '文本',
        key: '标题',
        ctype,
      });

      if (remarks) {
        remarks = remarks.replace(/[<>]/g, '');
      }

      if (name == null) {
        continue;
      }

      // let vod_pic = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索图片", "图片"], item.includes("original") ? 'original="&&"' : '<img src="&&"'), host);

      const vod_pic = autoContent.splitStr(item, ['搜索图片', '图片'], {
        type: '图片',
        key: '图片',
        host,
        ctype,
      });

      // vod_pic = this.normalizeUrl(vod_pic);

      const { ihost, getUrl } = this.prefixORsuffix(item, '搜索', host);

      let vod_id = autoContent.splitStr(item, ['搜索链接', '链接'], 'href="&&"', {
        host: ihost,
        ctype,
      });

      // let vod_id = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索链接", "链接"], 'href="&&"'), ihost);
      if (vod_id) {
        vod_id = getUrl(vod_id);
      }

      if (vod_id?.startsWith('/')) {
        vod_id = host + vod_id;
      }

      list.push({
        vod_id,
        vod_ids: `搜索` + `$${vod_id}@@${name}@@${vod_pic}`,
        vod_name: name,
        vod_pic,
        vod_remarks: remarks,
      });
    }
    list = removeDuplicatesByValue(list, 'vod_id').filter((x) => x.vod_name !== '首页' && !x.vod_id.includes(';'));

    if (list.length) {
      list = list.map((x) => {
        x.vod_id = x.vod_ids;
        return x;
      });
    }

    // if (list.length) {
    //   logger.info('searchlist:', list.slice(0, 3));
    // }

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = page;
    const pagecount = videos.length ? 999 : 0;
    const total = videos.length ? 999 : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { flag, play } = doc;
    let input = play;

    // @ts-expect-error declared but its value is never read
    let parse_extra = '';

    // @ts-expect-error declared but its value is never read
    let jx: number = 0;
    const headers = this.rule.playheads;
    let parse = this.rule.playParse;
    const jxs = this.rule['解析'];
    const p_exrta: Record<string, any> = {};
    if (this.rule.snifferw) {
      p_exrta.custom_regex = this.rule.snifferw;
    }
    if (this.rule.exsnifferw) {
      p_exrta.sniffer_exclude = this.rule.exsnifferw;
    }

    // eslint-disable-next-line ts/no-unused-vars
    parse_extra = objToQueryString(p_exrta);
    // logger.info("parse_extra", parse_extra)

    // const lazy = this.rule.lazy;
    // if (input && lazy) {
    //   let mark = this.rule.name + "drpy";
    //   let DrpyManage = GM.defineModule("DrpyManage");
    //   let rule = Object.assign({}, this.rule);
    //   let drpy = DrpyManage.getBySource({
    //     key: mark,
    //     ext: rule
    //   });
    //   //logger.info(drpy.getRule())
    //   //logger.info(Object.keys(drpy))
    //   return drpy.play(flag, input);
    // }

    const autoContent = this.AutoContent();

    if (jxs && input) {
      if (!input.startsWith('http')) {
        if (Object.hasOwn(jxs, flag)) {
          input = jxs[flag] + input;
        } else if (Object.hasOwn(jxs, '默认')) {
          input = jxs['默认'] + input;
        }
        // eslint-disable-next-line ts/no-unused-vars
        jx = 1;
      }
    }

    const jumplay = this.getRuleValue(['跳转播放链接']);

    if (input && jumplay) {
      const h = await this.req(
        input,
        Object.assign({}, this.rule.headers, {
          Referer: getHome(input),
        }),
      );
      let temp = autoContent.splitStr(h, ['跳转播放链接'], {
        type: '链接',
      });

      // logger.info(temp)

      if (temp && temp.startsWith('http')) {
        if (temp.includes('punish?x5sec')) {
          temp = input;
        }
        input = temp;
        input = this.normalizeUrl(temp);
        if (new RegExp(this.rule.snifferw).test(input)) {
          parse = 0;
        }
      }
    }

    const playobj = {
      // jx:jx,
      parse: parse !== undefined ? parse : 1,
      url: input,
      headers,
      script: Object.keys(p_exrta).length
        ? {
            ...(p_exrta.js ? { runScript: this.rule.js } : {}),
            ...(p_exrta.custom_regex ? { customRegex: p_exrta.custom_regex } : {}),
            ...(p_exrta.sniffer_exclude ? { snifferExclude: p_exrta.sniffer_exclude } : {}),
          }
        : {},
    };
    // logger.info(playobj);

    return playobj;
  }

  async proxy(_doc: ICmsProxyOptions): Promise<ICmsProxy> {
    return [];
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }

  async req(url: string, headers = {}) {
    if (url.includes('时间戳')) {
      url = url.replace(/时间戳/g, String(new Date().getTime()));
    }
    if (url.includes('md5(')) {
      const regex = /md5\((.*?)\)/g;
      url = url.replace(regex, function (_match, p1) {
        // p1 是括号中的内容，即需要加密的字符串
        // 计算MD5
        const md5Value = hash['md5-32']({ src: p1 });
        // 返回替换后的字符串
        return md5Value;
      });
    }
    if (!url.startsWith('http')) {
      url = this.rule.host + url;
    }
    let res = '';
    const type = url.includes(';post') ? 'post' : 'get';
    if (type === 'post') {
      const postcs = url.split(';')[2];
      url = url.split(';')[0];
      const { data } = await request.request({
        url,
        method: 'POST',
        headers: this.rule.headers,
        data: postcs,
      });
      res = data;

      // res = post(url, {
      //   headers: this.rule.headers,
      //   method: 'POST',
      //   body: postcs,
      // });
    } else {
      url = url.split(';')[0];
      const { data } = await request.request({
        url,
        method: 'GET',
        headers: headers || this.rule.headers,
      });
      res = data;

      // res = request(url, {
      //   headers: headers || this.rule.headers
      // });
    }
    if (res.includes('robot')) {
      logger.info('疑似触发机器人验证,打印日志');
      logger.info('网页源码:', res as any);
    }
    return res;
  }

  async 一级(url: string, ctype: string) {
    logger.info(`url:${url}`);
    // let html;
    const html = await this.req(url);
    // logger.info(html)
    const 搜索url = this.getRuleValue(['搜索url']);
    if (ctype === '首页' && !搜索url) {
      this.target = 'ext';
      const s = this.loopTest(html, '文本', '搜索');
      // logger.info(s)
      if (s) {
        if (searchmap.has(s)) {
          logger.info(`搜索url设置: ${searchmap.get(s)}`);
          this.XBPQRule['搜索url'] = searchmap.get(s);
        }
      }
    }

    const host = getHome(url);
    // const switchs = this.rule.switchs;

    const autoContent = this.AutoContent();
    let ehtml: string = html;
    // logger.info(ehtml)
    if (autoContent.isEmpty(['二次截取', '数组二次截取'])) {
      ehtml = autoContent.splitStr(html, ['二次截取', '数组二次截取'], {
        twice: true,
        ctype,
      });
    }
    const { ihost, getUrl } = this.prefixORsuffix(html, '', host);
    logger.info('ihost', ihost);

    let list: any[] = [];
    // logger.info(this.getRuleValue(["数组"]))
    // let htmlList = XBPQParse.getSplitArray(html, this.getRuleValue(["数组"]));
    const htmlList = autoContent.splitArray(ehtml, ['数组'], {
      key: '数组',
      ctype,
    });

    // logger.info(htmlList)

    // logger.info(htmlList.length)
    // if (htmlList.length == 0) {
    //   htmlList = this.loopTest(html, "数组", "数组");
    // }
    let hasPic = 0;

    for (const item of htmlList) {
      // logger.info(item)
      if (ctype !== '首页') {
        // logger.info(item)
      }
      const vod_name = autoContent.splitStr(item, ['标题'], {
        type: '文本',
        key: '标题',
        ctype,
      });
      // logger.info(vod_name)

      if (vod_name == null || vod_name === '') {
        continue;
      }
      const vod_remarks = autoContent.splitStr(item, ['副标题'], {
        type: '文本',
        key: '副标题',
      });
      // logger.info("副标题", vod_remarks)

      let vod_id = autoContent.splitStr(item, ['链接'], 'href="&&"', {
        host: ihost,
        type: '链接',
        key: '链接',
        ctype,
      });
      // logger.info("vod_id:", vod_id)
      if (vod_id) {
        vod_id = getUrl(vod_id);
      }

      if (vod_id && this.judgeUrl(vod_id, vod_name, host, '一级')) {
        continue;
      }

      let vod_pic = autoContent.splitStr(item, ['图片'], {
        type: '图片',
        key: '图片',
        host,
        ctype,
      });

      if (this.getRuleValue(['图片']) === '' && vod_pic === '') {
        // continue;
      }
      if (vod_pic) {
        vod_pic = `${vod_pic}@Referer=`;
        hasPic++;
      }
      list.push({
        vod_ids: `${ctype}$${vod_id}@@${vod_name}@@${vod_pic}`,
        vod_id,
        vod_name,
        vod_pic,
        vod_remarks,
      });
    }
    if (hasPic > 4) {
      list = list.filter((v) => v.vod_pic);
    }
    list = removeDuplicatesByValue(list, 'vod_id');
    let tlist = list;

    if (list.length && list.every((it: any) => it.vod_id.includes('http'))) {
      const topurls = list.map((x: any) => x.vod_id);
      // logger.info(topurls)
      // logger.info(topurls.length);
      // 获取相同部分
      const urlpath = findMostCommonBaseStructure(topurls);
      // logger.info("相同部分")
      // logger.info(urlpath);
      tlist = list.filter((it: any) => it.vod_id.includes(urlpath));
      if (tlist.length > 10) {
        list = tlist;
      }
    }
    // logger.info(list)

    if (list.length === 0) {
      list.push({
        vod_id: '没有数据',
        vod_name: '无数据,防止无限请求',
        vod_pic: 'https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/404.jpg',
        vod_remarks: '不要点，会崩的',
      });
    }

    // if (list.length) {
    //   logger.info('list:', list.slice(0, 3));
    // }

    if (list.length && list[0].vod_id !== '没有数据') {
      list = list.map((x) => {
        x.vod_id = x.vod_ids;
        return x;
      });
    }

    return list;
  }

  getRuleValue(keys: string[], def: any = ''): any {
    let v = '';
    for (const key of keys) {
      v = this.XBPQRule[key];
      if (v) break;
    }
    return v || def || '';
  }

  normalizeUrl(url) {
    url = url.replace(/\\\//g, '/').replace('&#038;', '&');
    // 正则表达式匹配协议和主机名，以及第一个斜杠
    const regex = /^((?:[a-z]+:\/\/)?[^\s/]+\.[^\s/]+)(\S*)/i;
    // 捕获协议和主机名
    if (url.startsWith('//')) {
      if (this.rule.URL != null) {
        url = `${this.rule.URL.protocol}:${url}`;
      } else {
        url = `https:${url}`;
      }
    }
    if (url.startsWith('/')) {
      url = this.rule.host + url;
    }
    const match = url.match(regex);
    if (match) {
      // 协议和主机名
      const protocolHost = match[1];
      // 路径，如果有的话
      const path = match[2] || '';
      // 去除路径中的多余斜杠，然后重新组合URL
      return protocolHost + path.replace(/\/+/g, '/');
    }
    return url; // 如果没有匹配，返回原始URL
  }

  judgeUrl(url, name, host, type) {
    let result = false;
    if (type === '一级') {
      if (!url) {
        return true;
      }
      if (/^会员中心$/.test(name)) {
        return true;
      }
      if (
        /vod\/type\/id\/\d+\.html|\/label\/(?:hot|down|live|web|top)\.html|user\/login/.test(url) ||
        /^#$/.test(url)
      ) {
        logger.info(`命中: ${url}`);
        result = true;
      }
      if (/index.php\/vod\/show\//.test(url) && /\/id\/\d+\.html/.test(url)) {
        return true;
      }

      if (/detail\/id\/\d+\.html|voddetail/i.test(url)) {
        return false;
      }
      if (/javascript:|\/vod\/?type\/|\/vod\/?show\//.test(url)) {
        result = true;
      }
      if (url != null && url.replace(/\/$/, '') === host) {
        result = true;
      }
    }

    return result;
  }

  byType(value, ctype) {
    if (value.every((x) => x.includes('--'))) {
      const tys = value.map((x) => x.split('--')[0]);
      const filterType = tys.includes(ctype) ? ctype : '默认';
      const filteredValue = value.filter((x) => {
        const type = x.split('--')[0];
        return type === filterType;
      });
      return filteredValue;
    }
  }

  AutoContent() {
    // eslint-disable-next-line ts/no-this-alias
    const self = this; // 保存对当前实例的引用
    return {
      isEmpty(keys, def: string | undefined = undefined) {
        // 调用继承的 getRuleValue 方法
        const value = self.getRuleValue(keys, def);
        // 如果 value 是 undefined、null、空字符串或者空数组，则返回 false
        return !(value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0));
      },
      splitStr: (html, keys, def: string | undefined | object = undefined, params: any = {}) => {
        let result: string | null = null;
        params = params || {};
        if (typeof def == 'object') {
          params = def;
          def = params.def || '';
        }
        const { host, type, key } = params;
        const twice = params.twice || false;
        const skey = params.skey || type;
        const ctype = params.ctype || null;
        // const ext = params.ext || false;
        let temp;
        let value = this.getRuleValue(keys, def);
        const descs = ['影片年代', '影片地区', '影片状态', '影片类型', '主演', '导演'];
        if (keys.some((key) => descs.includes(key)) && !value.includes('&&')) {
          return value;
        }

        if (value.includes('||')) {
          value = value.split('||').filter((e) => e && e !== '');
        }
        if (!Array.isArray(value)) {
          value = [value];
        }
        if (value.every((x) => x.includes('--'))) {
          // let tys = value.map(x => x.split("--")[0]);
          // if (ctype == "首页") {
          //   value = value.filter(x => x.split("--")[0] == "首页");
          // } else if (tys.includes(ctype)) {
          //   value = value.filter(x => x.split("--")[0] == ctype);
          // } else {
          //   value = value.filter(x => x.split("--")[0] == "默认");
          // }
          // logger.info(value)
          value = self.byType(value, ctype);
        }
        // logger.info(value)
        for (let v of value) {
          // @ts-expect-error declared but its value is never read
          let n;
          if (v.includes('--')) {
            // logger.info("v", v)
            temp = v.split('--');

            // eslint-disable-next-line ts/no-unused-vars
            n = temp[0];
            v = temp[1];
          }
          if (v === '空') {
            temp = html;
            break;
          }
          // logger.info(key)
          // logger.info(v)

          if (type === '链接') {
            // logger.info("v:", v);
          }

          if (v && !v.includes('&&')) {
            temp = XBPQParse.getJsonStr(html, v);
          } else if (v.includes('含序号:')) {
            let prefix = '';
            if (v.includes('+')) {
              const tmp = v.split('+');
              prefix = tmp[0];
              v = tmp[1];
            } else {
              let arrtext = XBPQParse.getSplitArray(html, v)[0];
              logger.info(v);
              logger.info(arrtext);
              if (prefix) {
                arrtext = prefix + arrtext;
              }
              if (arrtext) {
                temp = arrtext;
              }
            }
          } else {
            temp = XBPQParse.getHasRuleSplitStr(html, v, undefined, twice);
            // logger.info("第一次:", temp)
            if (!temp) {
              temp = XBPQParse.getHasRuleSplitStr(html.replace(/\\"/g, '"'), v, undefined, twice);
              // logger.info("第二次:", temp)
            }
          }
          if (type === '链接') {
            // logger.info("链接:", temp);
          }

          // logger.info(temp)

          if (temp && temp.startsWith('/') && type === '链接') {
            temp = (host || '') + temp;
          }

          if (temp && temp.length) {
            break;
          }
        }

        if (temp != null && temp !== '') {
          result = temp;
        } else {
          if (Object.hasOwn(autoRule, key)) {
            result = this.loopTest(html, type, key, host);
          }
        }
        if (result == null && twice) {
          result = html;
        }
        if (result) {
          if (!twice) {
            // 移除所有标签，只保留文本
            if (skey === '文本') {
              result = removeTagsExceptList(result).replace(/[><]/g, '').trim();
              result = htmlEntitiesToText(result);
            }
          }
          if (skey === '图片') {
            result = result!.replace(/\\$/, '');
            result = this.normalizeUrl(result);
          }
          if (skey === '链接') {
            // logger.info("链接:",result);
            if (/&#x/.test(result!)) {
              result = htmlEntitiesToText(result);
            }
            if (result?.startsWith('http')) {
              const uhost = getHome(result);
              if (result.replace(/\/$/, '') === uhost || result.replace(/\/$/, '') === host) {
                return '';
              }
              result = this.normalizeUrl(result);
            }
          }
          if (key === '线路标题') {
            // logger.info(result)
            result = result!.replace(/\s/g, '').replace(/div|id|class|["=]/g, '');
          }
          if (key === '播放标题') {
            result = result!.replace(/&nbsp;/g, '').replace(/\\r/, '');
            result = removeChars(result, '\n').trim();
            // logger.info(result)
          }
        }
        return result;
      },
      splitArray: (html, keys, def, params: any = {}) => {
        params = params || {};
        if (typeof def == 'object') {
          params = def;
          def = params.def || '';
        }

        const { key } = params;

        // const ext = params.ext || false;
        const ctype = params.ctype || null;
        let results: string[] | string = [];
        let value: any = this.getRuleValue(keys, def);
        if (value.includes('||')) {
          value = value.split('||').filter((e) => e && e !== '');
        }
        let list: any[] = [];
        if (!Array.isArray(value)) {
          value = [value];
        }
        logger.info(value);
        if (value.every((x) => x.includes('--'))) {
          // let tys = value.map(x => x.split("--")[0]);
          // if (ctype == "首页") {
          //   value = value.filter(x => x.split("--")[0] == "首页");
          // } else if (tys.includes(ctype)) {
          //   value = value.filter(x => x.split("--")[0] == ctype);
          // } else {
          //   value = value.filter(x => x.split("--")[0] == "默认");
          // }
          // logger.info(value)
          value = self.byType(value, ctype);
          logger.info(value);
        }
        for (let v of value) {
          // @ts-expect-error declared but its value is never read
          let n;
          let temp;
          if (v.includes('--')) {
            // logger.info("v", v)
            temp = v.split('--');

            // eslint-disable-next-line ts/no-unused-vars
            n = temp[0];
            v = temp[1];
          }
          if (v === '空') {
            temp = html;
            break;
          }
          // logger.info("html:", html);
          // logger.info("v:"+v);
          if (!v.includes('&&')) {
            list = XBPQParse.getJsonArray(html, v);
            // logger.info($.type( list))
          } else {
            list = XBPQParse.getSplitArray(html, v);
          }

          if (v === 'list') {
            // logger.info(list)
          }

          if (key === '线路数组') {
            // logger.info("线路数组:", list)
            const autoc = this.AutoContent();
            const t = this.getRuleValue(['线路标题']);
            if (autoc.isEmpty(['线路标题']) && /&&/.test(t)) {
              list = list
                .map((tx) => {
                  const tt = autoc.splitStr(tx, ['线路标题']);
                  return tt;
                })
                .filter((e) => e);
            }
          }
          if (list.length) {
            break;
          }
        }
        if (key === '线路数组') {
          // logger.info("list", list)
        }
        // logger.info("list", list)
        if (list.length > 0) {
          results = list;
        } else {
          results = this.loopTest(html, '数组', key) as string;
        }
        return results;
      },
    };
  }

  loopTest(html, type, key, host = '') {
    let contents = autoRule[key];
    if (this.target === 'ext') {
      contents = extRule[key];
      this.target = '';
    }
    let result = '';
    const results = [];
    if (type === '数组') {
      if (Array.isArray(contents)) {
        for (const content of contents) {
          // logger.info(content)
          result = XBPQParse.getSplitArray(html, content);
          // logger.info(result.length)
          if (result!.length > 0) {
            logger.info(`目标[${key}]:${content}`);
            return result;
          }
        }
      }
    }
    if (type === '文本') {
      let strict = false;
      if (['播放标题'].includes(key)) {
        strict = true;
      }
      if (Array.isArray(contents)) {
        for (const content of contents) {
          if (key === '副标题') {
            // logger.info(html)
            // logger.info(content)
          }
          result = XBPQParse.getHasRuleSplitStr(html, content, '', strict)!;
          if (key === '副标题') {
            // logger.info(result)
          }
          if (result != null) {
            result = collapseSpacesAndTrim(result);
            // logger.info(`目标[${key}]:${content}`)
            break;
          }
        }
      }
    }
    if (type === '图片') {
      const es = /logo.gif/;
      if (Array.isArray(contents)) {
        for (const content of contents) {
          // logger.info(content)
          result = XBPQParse.getHasRuleSplitStr(html, content)!;
          if (result != null && !es.test(result)) {
            result = collapseSpacesAndTrim(result);
            // logger.info(result)
            if (host) {
              if (result!.startsWith('/')) {
                result = host + result;
              }
            }
            // logger.info(content)
            break;
          }
        }
      }
    }
    if (type === '链接') {
      const es = /javascript:;/;
      if (Array.isArray(contents)) {
        for (const content of contents) {
          // logger.info(content)
          result = XBPQParse.getHasRuleSplitStr(html, content)!;
          if (result != null && !es.test(result)) {
            result = collapseSpacesAndTrim(result);
            // logger.info(result);
            if (host) {
              if (result!.startsWith('/')) {
                result = host + result;
              }
            }
            // logger.info(content)
            break;
          }
        }
      }
    }
    // logger.info(results.length)
    if (results.length > 0) {
      /* (let index = findLongindex(results);
      logger.info("index")
      logger.info(index) */
      // logger.info(result)
    }
    return result;
  }

  prefixORsuffix(html, input, h) {
    let ithost;
    const prefix = XBPQParse.getHasRuleSplitStr(html, this.getRuleValue([`${input}链接前缀`]));
    const suffix = XBPQParse.getHasRuleSplitStr(html, this.getRuleValue([`${input}链接后缀`]));

    if (!prefix && !suffix) {
      ithost = h;
    }
    return {
      getUrl(url) {
        if (url.includes(prefix)) {
          url = url.replace(prefix, '');
        }
        url = (prefix || '') + url + (suffix || '');
        return url;
      },
      ihost: ithost,
    };
  }

  splitTextWithSingleBracket(text) {
    // 正则表达式匹配 [xxx] 的内容和除此之外的文本
    // const regex = /^(.*?)\[(.*?)\]$/;
    const regex = /^([^[]*)\[(.*?)\]$/;
    const match = text.match(regex);
    if (match) {
      // 返回普通文本部分和括号内容
      return [match[1] + match[3], match[2]];
    } else {
      // 如果没有匹配到括号，返回原始文本和null
      return [text, ''];
    }
  }

  setSwitchs(switchs) {
    function checkDigit(str, key) {
      const pattern = new RegExp(`${key}(\\d+)`);
      const match = str.match(pattern);
      return match ? Number.parseInt(match[1], 10) : null; // 返回数字或null
    }
    const swMap = new Map([
      // z-直接播放（开）
      [
        'z',
        (_str) => {
          this.rule['二级'] = '*';
        },
      ],
      // d-倒序（开），默认自动 d0-倒序（关）
      [
        'd',
        (str) => {
          const digit = checkDigit(str, 'd');
          this.rule['倒序'] = digit;
        },
      ],
      // v-直链标记（开），把播放链接当成Video直接播放，不再嗅探或解析
      [
        'v',
        (_str) => {
          this.rule.playParse = 0;
        },
      ],
    ]);

    function processString(str) {
      for (const [key, handler] of swMap) {
        if (str.includes(key)) {
          handler(str);
        }
      }
    }
    processString(switchs);
  }
}

export default T3XbpqAdapter;
