import JSON5 from 'json5';

import request from '../request';
import { batchFetch } from '../drpy/drpyInject';
import { removeTagsExceptList, replaceTagsWithMapping, stringex, removeChars } from './methods';
import XBPQParse from './core';

const getHome = (str: string) => {
  if (str.startsWith('http')) {
    const url = new URL(str);
    return url.origin;
  } else return str;
};

stringex();
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
  return htmlString.replace(/&(#x[\da-fA-F]+|#\d+|[a-z]+);/gi, (match) => {
    // 如果实体在映射表中，则替换它
    if (entities[match]) {
      return entities[match];
    } else {
      // 如果实体不在映射表中，尝试解码十进制或十六进制实体
      let code = match.startsWith('&#x') ? match.substring(3, match.length - 1) : match.substring(2, match.length - 1);
      if (match.startsWith('&#x')) {
        // 十六进制实体
        return String.fromCharCode(parseInt(code, 16));
      } else if (match.startsWith('&#')) {
        // 十进制实体
        return String.fromCharCode(parseInt(code, 10));
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
    let [key, value] = pair.split('$');
    if (key && value) {
      obj[key] = value.trim();
    }
  });

  return obj;
}

function objToQueryString(obj) {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    // .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

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
  for (let path in pathCount) {
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
    //const path = String(new URL(url).getPath()); // 只取路径部分
    //let baseStructure = path.split('/').slice(1, -1).join('/'); // 去掉开头的'/'和末尾的文件名或ID
    let baseStructure = url.split('?')[0].split('/').slice(3, -1).join('/');
    if (baseStructure.includes('-')) {
      let temp = baseStructure.split('-');
      baseStructure = temp[findIndicesOfElementsWithNumbers(temp)[0]];
      //console.log(baseStructure)
    }
    //console.log(baseStructure)
    if (!pathCount[baseStructure]) {
      pathCount[baseStructure] = 0;
    }
    pathCount[baseStructure] += 1;
  });
  // 找出出现次数最多的基础结构
  let maxCount = 0;
  let mostCommonBaseStructure = '';
  for (let base in pathCount) {
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
      return String.fromCharCode(parseInt(p1, 16));
    });
  });
}

function removeDuplicatesByValue(arr, valueToCheck) {
  // 使用 Set 对象来存储已经遇到的值
  const seenValues = new Set();
  const uniqueArr: any[] = [];
  // 遍历原始数组
  for (let obj of arr) {
    // 如果对象包含要检查的值，并且这个值之前没有出现过，则添加到结果数组中
    if (obj[valueToCheck] && !seenValues.has(obj[valueToCheck])) {
      seenValues.add(obj[valueToCheck]);
      uniqueArr.push(obj);
    }
  }
  return uniqueArr;
}

function collapseSpacesAndTrim(str) {
  str = str.replace(/\r\n|\r|\n/g, '');
  str = str.replace(/\s+/g, ' ');
  str = str.trim();
  str = str.replace(/&nbsp;/g, ' ');
  str = convertMultipleUnicodeEscapedWords(str);
  str = str.replace(/\s{1,}/g, ' ');
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

function findLongindex(arrays) {
  let maxLength = 0;
  let index = 0;
  // let longestSubset = [];
  arrays.forEach((subArray, i) => {
    if (subArray.length > maxLength) {
      maxLength = subArray.length;
      index = i;
    }
  });
  return index;
}

function isNestedArray(arr) {
  return arr.some((item) => Array.isArray(item));
}

function mergeStringsToJSON(str1, str2, type) {
  // 将 str1 按照 "&" 分割成数组
  let sstr2 = str2;
  let arr1 = str1.split('&');
  if (arr1[0] != '全部' && str2 == '*' && type != 'by') {
    arr1.unshift('全部$');
  }
  if (str2 == '*') {
    str2 = undefined;
  }
  // 如果 str2 为空，初始化 arr2 为 arr1 的副本，每个元素的 "$" 后的部分为空字符串
  let arr2 = str2 ? str2.split('&') : arr1.map((item) => (item.includes('$') ? item.split('$')[1] : item));
  // 检查 arr1 和 arr2 的长度是否相等
  if (str2 && arr1.length !== arr2.length) {
    return;
  }
  if (arr1[0] != '全部' && arr2[0] != '' && sstr2 != '*' && type != 'by') {
    arr1.unshift('全部');
    arr2.unshift('');
  }
  // 初始化结果数组
  let result: any[] = [];
  // 遍历 arr1 和 arr2
  for (let i = 0; i < arr1.length; i++) {
    let item1 = arr1[i].split('$')[0]; // 获取 "$" 前的值
    let item2 = arr2[i] || ''; // 获取 "$" 后的值或默认为空字符串
    // 将处理后的 arr1 和 arr2 的元素添加到结果数组
    result.push({ n: item1, v: item2 });
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
    for (let [k, v] of aliasMap) {
      for (let it of v) {
        if (it instanceof RegExp) {
          //正则表达;
          if (it.test(key)) {
            return k;
          }
        } else {
          //字符串;
          if (it == key) {
            return k;
          }
        }
      }
    }
    return key; // 原始值
  }
  name = getOriginalByAlias(name);
  //console.log(name)

  let items = new Map();
  let tempArray: any[] = [];
  let mapp = new Map([
    ['类型', 'cateId'],
    ['剧情', 'class'],
    ['地区', 'area'],
    ['年份', 'year'],
    ['语言', 'lang'],
    ['字母', 'letter'],
    ['排序', 'by'],
  ]);
  mapp.forEach((v, k, _m) => {
    //console.log(k)
    let item = rule.getRuleValue([k]);
    let value = rule.getRuleValue([k + '值']);
    //console.log(item)
    if (item && item != '*') {
      if (item.includes('||')) {
        item = item.split('||');
        //console.log(item)
        item.map((n, ni) => {
          if (n.includes('--')) {
            let parts = n.split('--');
            //parts[1] = "全部$&" + parts[1];
            items.set(parts[0], { v: parts[1], index: ni });
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
      if (item == '空') {
        return;
      }
      if (item && item.includes('#')) {
        item = item.split('#').map((it) => {
          if (it.includes('$')) {
            let parts = it.split('$');
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
        if (item[0].n != '全部' && v != 'by') {
          item.unshift({
            n: '全部',
            v: '',
          });
        }
      }
      if (item && /^\d+-\d+$/.test(item)) {
        let [s, e] = item.split('-').map(Number);
        item = Array.from({ length: e - s + 1 }, (_, i) => e - i).join('&');
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

let autoRule = {
  数组: [
    'hl-list-item&&</li>',
    'myui-vodlist__box&&</div',
    'class="stui-vodlist__box"&&</a',
    '<a&&</a>[包含:module-item-cover#vodlist_thumb]',
    'oneVideo">&&<div class="col',
    '"video-img-box&&</p',
    '<article&&</article>',
    '<li class="clearfix">&&</li>',
    '<a&&</a>',
  ],
  图片: ['data-src="&&"', 'original="&&"', '<img*src="&&"'],
  标题: ['alt="&&"', 'title="&&"', 'name">&&<'],
  链接: ['href="&&"', "href='&&'"],
  副标题: [
    '"v_note">&&</div',
    'class="pic-text*text-right">&&<',
    '"v-ins"><p>&&</p>',
    'module-item-note">&&<',
    'class="*remarks"&&<',
    'v-item-bottom">&&</span>',
    'class="pic_text*">&&<',
    '<span class="qb">&&</span>',
    '<span*>&&</span>',
    '<span>&&</span>',
  ],
  线路标题: [
    '换线路&&</ul>',
    '选择播放源&&</ul>',
    '节点列表&&</ul>',
    '<ul*tab-title"&&</ul>',
    '<ul class="nav nav-btn&&</ul>[不包含:首页#电影]',
    '"playname"&&</ul>',
    'from*list"&&</ul>',
    '<dt&&</dt>',
    'play_source_tab&&</div>',
    'data-dropdown-value="&&">',
    'alt="&&"',
  ],
  线路数组: [
    'module-tab-item&&</small>',
    'module-tab-item&&</div>',
    'module-tab-item &&</a>',
    'tabindex=*"tab">&&<',
    '"tab"*>&&<[不包含:同]',
    '"hl-text-site">&&<[不包含:评分#微信#扫一扫]',
    'playfrom*>&&</div>',
    'channelname*>&&</a>',
    'tabs-play*>&&</span>',
    'swiper-slide*>&&</a>[不包含:首页#电影]',
    '="pull-left"*>&&<',
    'pay-url*>&&</a>',
    'myui-panel__head&&</h3>[包含:fa-sort][替换:排序>>]',
    '<a&&</a>[包含:class="wo"]',
    'href="javascript:void(0);"&&</a>',
    '<h3*>&&</h3>[不包含:正片#猜#热#熱#更#介#榜#情#链#表#荐#排#评#留言#讨论#记#同#最新#演#正在#href=#收藏#明星#分享#相关#]',
    '<h4*>&&</h4>[不包含:正片#猜#热#熱#更#介#榜#情#链#表#荐#排#评#留言#讨论#记#同#最新#演#正在#href=#收藏#明星#分享#相关#]',
    '<h2*>&&</h2>[不包含:正片#猜#热#熱#更#介#榜#情#链#表#排#评#留言#讨论#记#同#最新#演#正在#href=#收藏#明星#分享#相关]',
  ],
  播放数组: [
    'hl-sort-list&&</ul>',
    'sort-list clearfix&&</ul>',
    'id="hl-plays-list&&</ul>',
    'id="con_playlist&&</ul>',
    '<ul class="stui-play*list&&</ul>',
    '<ul class="myui-play*list&&</ul>',
    '<ul class="stui-content*playlist&&</ul>',
    '<ul class="content*playlist clearfix"&&</ul>',
    '<div class="stui-content*playlist&&</div>',
    '<ul class="myui-content*list&&</ul>',
    '<ul id="playsx"&&</ul>',
    '<div class="module-play-list&&</div>',
    '<ul class="play_list"&&</ul>',
    '<ul class="large_list&&</ul>',
    '"tab_con"&&</ul>',
    '<ul class="playlist&&</ul>',
  ],
  播放列表: '<a&&</a>[不包含:src=#original=#background#tab-item#节点#线路#福利#推荐#追剧#游客#留言#求片#影视#下载]',
  播放标题: [
    'span>&&<',
    'title="&&"',
    '>&&</a>[包含:集#清#版#HD#BD#0P#原画#蓝光#字#正片#0p#TC#TS#DVD#CD#期#季#语#话#1#2#3#4#5#6#7#8#9#]',
  ],
  播放链接:
    'href="&&"[不包含:href="/"#search#show#view#detail#juqing#type#script#Script#read#list#/hot/#index.html#/news/#email#/appxz/#/tags/#.xml#.js#url=http#.app]',
  简介: ['name="description"*content="&&"', '剧情&&</p>[不包含:首页]'],
  影片状态: '状态：&&</div>',
  影片类型: '类型：&&</div>',
  影片地区: '地区：&&</div>',
  主演: '主演：&&</div>',
  导演: '导演：&&</div>',
  剧情: '电影--喜剧&爱情&动作&科幻&剧情&战争&警匪&犯罪&动画&奇幻&武侠&冒险&枪战&恐怖&悬疑&青春&古装&历史&运动&儿童||连续剧--古装&神话&战争&偶像&爱情&喜剧&家庭&犯罪&悬疑&恐怖&武侠&动作&奇幻&剧情&历史||综艺--脱口秀&真人秀&情感&旅游&音乐&舞蹈&美食&纪实&生活||动漫--科幻&热血&搞笑&冒险&校园&动作&运动||纪录片--纪录&历史&传记&音乐&歌舞&短片&科幻',
  地区: '电影--大陆&香港&台湾&美国&法国&英国&日本&韩国&德国&泰国&印度&俄罗斯&意大利&西班牙&加拿大||连续剧--大陆&香港&台湾&美国&法国&英国&日本&韩国&德国&泰国&印度&俄罗斯&意大利&西班牙&加拿大||综艺--大陆&香港&台湾&日本&韩国&美国&英国||动漫--大陆&日本&韩国&美国&英国&法国||纪录片--大陆&香港&台湾&美国&法国&英国&日本&韩国&德国&泰国&印度&俄罗斯&意大利&西班牙&加拿大',
  排序: '时间$time#人气$hits#评分$score',
  年份: '',
};

let extRule = {
  搜索: ['<form name="search"*action="&&"', '<form id="search"*action="&&"'],
};

let searchmap = new Map([
  ['/ss/-------------/', '/ss/{wd}----------{pg}---/'],
  ['/vsearch/-------------.html', '/vsearch/{wd}----------{pg}---.html'],
  ['/vodsearch/-------------.html', '/vodsearch/{wd}----------{pg}---.html'],
  ['/index.php/vod/search.html', '/index.php/vod/search/page/{pg}/wd/{wd}.html'],
]);

class XBPQAdapter {
  rule: any = {};
  source = '';
  XBPQRule = {};
  target = '';
  cacheClass = {};

  constructor(source) {
    this.source = source;
    this.XBPQRule = source.ext;

    if (source.click) {
      this.XBPQRule['click'] = source.click;
    }
    if (source.lazy) {
      this.XBPQRule['lazy'] = source.lazy;
    }

    this.rule = {
      name: source.name,
      host: source.api,
      play_parse: true,
      一级: 'true',
      推荐: 'true',
      类型: '影视',
      switchs: '',
      snifferw: '',
      exsnifferw: ''
      // 模板: "自动"
    };
  }

  getRuleValue(keys: string[], def: string | undefined = undefined) {
    let v = '';
    for (let key of keys) {
      v = this.XBPQRule[key];
      if (v) break;
    }
    return v || def || '';
  }
  normalizeUrl(url) {
    url = url.replace(/\\\//g, '/').replace('&#038;', '&');
    // 正则表达式匹配协议和主机名，以及第一个斜杠
    const regex = /^((?:[a-zA-Z]+:\/\/)?(?:[^\s/]+\.[^\s/]+))(\/?[^\s]*)?/;
    // 捕获协议和主机名
    if (url.startsWith('//')) {
      if (this.rule.URL != null) {
        url = this.rule.URL.protocol + ':' + url;
      } else {
        url = 'https:' + url;
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
    if (type == '一级') {
      if (!url) {
        return true;
      }
      if (/^(会员中心)$/.test(name)) {
        return true;
      }
      //console.log(url)
      if (/vod\/type\/id\/\d+\.html|\/label\/(hot|down|live|web|top).html|user\/login/.test(url) || /^#$/.test(url)) {
        console.log('命中:', url);
        result = true;
      }
      if (/index.php\/vod\/show\//.test(url) && /\/id\/\d+\.html/.test(url)) {
        return true;
      }

      if (/detail\/id\/\d+\.html|voddetail/gi.test(url)) {
        return false;
      }
      if (/javascript:|\/vod\/?type\/|\/vod\/?show\//.test(url)) {
        result = true;
      }
      if (url != null && url.replace(/\/$/, '') == host) {
        result = true;
      }
    }
    //console.log("result",url)
    return result;
  }
  AutoContent() {
    const self = this; // 保存对当前实例的引用
    return {
      isEmpty: function (keys, def: string | undefined = undefined) {
        // 调用继承的 getRuleValue 方法
        var value = self.getRuleValue(keys, def);
        // 如果 value 是 undefined、null、空字符串或者空数组，则返回 false
        return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
          ? false
          : true;
      },
      splitStr: (html, keys, def: string | undefined | object = undefined, params: any = {}) => {
        let result: null | string = null;
        params = params ? params : {};
        if (typeof def == 'object') {
          params = def;
          def = params.def || '';
        }

        let { host, type, key } = params;
        let twice = params.twice || false;
        let skey = params.skey || type;
        let ctype = params.ctype || null;
        // let ext = params.ext || false;
        let temp;
        let value: string[] | string = this.getRuleValue(keys, def as string);

        if (value.includes('||')) {
          value = value.split('||').filter((e) => e && e != '');
        }
        if (!Array.isArray(value)) {
          value = [value];
        }
        if (value.every((x) => x.includes('--'))) {
          let tys = value.map((x) => x.split('--')[0]);
          if (ctype == '首页') {
            value = value.filter((x) => x.split('--')[0] == '首页');
          } else if (tys.includes(ctype)) {
            value = value.filter((x) => x.split('--')[0] == ctype);
          } else {
            value = value.filter((x) => x.split('--')[0] == '默认');
          }
          //console.log(value)
        }

        for (let v of value) {
          let n;

          if (v.includes('--')) {
            //console.log("v", v)
            temp = v.split('--');
            n = temp[0];
            v = temp[1];
          }
          if (v == '空') {
            temp = html;
            break;
          }

          temp = XBPQParse.getHasRuleSplitStr(html, v, undefined, twice);
          // console.log("第一次:", temp)
          if (!temp) {
            temp = XBPQParse.getHasRuleSplitStr(html.replace(/\\\"/g, '"'), v, undefined, twice);
            // console.log("第二次:", temp)
          }

          // console.log(temp)


          if (temp && temp.startsWith('/') && type == '链接') {
            temp = (host ? host : '') + temp;
          }

          if (temp && temp.length) {
            break;
          }
        }

        if (temp != null && temp != '') {
          result = temp;
        } else {
          if (autoRule.hasOwnProperty(key)) {
            result = this.loopTest(html, type, key, host);
          }
        }
        if (result == null && twice) {
          result = html;
        }

        if (result) {
          if (!twice) {
            // 移除所有标签，只保留文本
            if (skey == '文本') {
              result = removeTagsExceptList(result).replace(/[><]/g, '').trim();
              result = htmlEntitiesToText(result);
            }
          }
          if (skey == '图片') {
            result = this.normalizeUrl(result);
          }
          if (skey == '链接') {
            if (/&#x/.test(result!)) {
              result = htmlEntitiesToText(result);
            }
            if (result!?.startsWith('http')) {
              let uhost = getHome(result);
              if (result.replace(/\/$/, '') == uhost || result.replace(/\/$/, '') == host) {
                return '';
              }
              result = this.normalizeUrl(result);
            }
          }
          if (key == '线路标题') {
            //console.log(result)
            result = result!.replace(/[\s\t]/g, '').replace(/div|id|class|["=]/g, '');
          }
          if (key == '播放标题') {
            result = result!.replace(/&nbsp;/g, '').replace(/\\r/, '');
            result = removeChars(result, '\n');
            //console.log(result)
          }
        }
        return result;
      },
      splitArray: (html, keys, def, params: any = {}) => {
        params = params ? params : {};
        if (typeof def == 'object') {
          params = def;
          def = params.def || '';
        }
        let { key } = params;
        // let ext = params.ext || false;
        let results: string[] = [];
        let value: string[] | string = this.getRuleValue(keys, def);
        if (value.includes('||')) {
          value = value.split('||').filter((e) => e && e != '');
        }
        let list: any[] = [];
        if (!Array.isArray(value)) {
          value = [value];
        }
        for (let v of value) {
          if (v.includes('--')) {
            v = v.replace(/.*?--/, '');
          }
          // console.log('html:', html);
          // console.log('v:', v);
          list = XBPQParse.getSplitArray(html, v);
          // console.log('list:', list);
          // console.log('key:', key);

          if (key == '线路数组') {
            let autoc = this.AutoContent();
            // console.log('empty:', autoc.isEmpty(['线路标题']));
            if (autoc.isEmpty(['线路标题'])) {
              list = list
                .map((tx) => {
                  let tt = autoc.splitStr(tx, ['线路标题']);
                  return tt;
                })
                .filter((e) => e);
              // console.log('list:', list);
            }
          }
          if (list.length) break;
        }
        // console.log("list", list)
        if (list.length > 0) {
          results = list;
        } else {
          results = this.loopTest(html, '数组', key) as any;
        }
        // console.log('results', results)
        return results;
      },
    };
  }
  loopTest(html, type, key, host = '') {
    let contents = autoRule[key];
    if (this.target == 'ext') {
      contents = extRule[key];
      console.log(contents);
      this.target = '';
    }
    let result: string | null = '';
    let results = [];
    if (type == '数组') {
      if (Array.isArray(contents)) {
        for (let content of contents) {
          //console.log(content)
          result = XBPQParse.getSplitArray(html, content);
          //console.log(result.length)
          if (result!.length > 0) {
            console.log(`目标[${key}]:${content}`);
            return result;
          }
        }
      }
    }
    if (type == '文本') {
      let strict = false;
      if (['播放标题'].includes(key)) {
        strict = true;
      }
      if (Array.isArray(contents)) {
        for (let content of contents) {
          if (key == '副标题') {
            // console.log(html)
            // console.log(content)
          }
          result = XBPQParse.getHasRuleSplitStr(html, content, '', strict);
          if (key == '副标题') {
            // console.log(result)
          }
          if (result != null) {
            result = collapseSpacesAndTrim(result);
            //console.log(`目标[${key}]:${content}`)
            break;
          }
        }
      }
    }
    if (type == '图片') {
      let es = /logo.gif/;
      if (Array.isArray(contents)) {
        for (let content of contents) {
          //console.log(content)
          result = XBPQParse.getHasRuleSplitStr(html, content);
          if (result != null && !es.test(result)) {
            result = collapseSpacesAndTrim(result);
            //console.log(result)
            if (host) {
              if (result!.startsWith('/')) {
                result = host + result;
              }
            }
            //console.log(content)
            break;
          }
        }
      }
    }
    if (type == '链接') {
      let es = /javascript:;/;
      if (Array.isArray(contents)) {
        for (let content of contents) {
          //console.log(content)
          result = XBPQParse.getHasRuleSplitStr(html, content);
          if (result != null && !es.test(result)) {
            result = collapseSpacesAndTrim(result);
            console.log('test:', result);
            if (host) {
              if (result!.startsWith('/')) {
                result = host + result;
              }
            }
            //console.log(content)
            break;
          }
        }
      }
    }
    //console.log(results.length)
    if (results.length > 0) {
      /*(let index = findLongindex(results);
      console.log("index")
      console.log(index)*/
      //console.log(result)
    }
    return result;
  }
  prefixORsuffix(html, input, h) {
    let ithost;
    let prefix = XBPQParse.getHasRuleSplitStr(html, this.getRuleValue([input + '链接前缀']));
    let suffix = XBPQParse.getHasRuleSplitStr(html, this.getRuleValue([input + '链接后缀']));
    // console.log("前缀", prefix);
    // console.log("后缀", suffix);
    if (!prefix && !suffix) {
      ithost = h;
    }
    return {
      getUrl: function (url) {
        if (url.includes(prefix)) {
          url = url.replace(prefix, '');
        }
        url = (prefix ? prefix : '') + url + (suffix ? suffix : '');
        return url;
      },
      ihost: ithost,
    };
  }
  splitTextWithSingleBracket(text) {
    // 正则表达式匹配 [xxx] 的内容和除此之外的文本
    const regex = /^(.*?)\[(.*?)\]$/;
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
      return match ? parseInt(match[1], 10) : null; // 返回数字或null
    }
    let swMap = new Map([
      //z-直接播放（开）
      [
        'z',
        (_str) => {
          this.rule['二级'] = '*';
        },
      ],
      //d-倒序（开），默认自动 d0-倒序（关）
      [
        'd',
        (_str) => {
          // const digit = checkDigit(str, 'd');
          this.rule['倒序'] = '0';
        },
      ],
      //v-直链标记（开），把播放链接当成Video直接播放，不再嗅探或解析
      [
        'v',
        (_str) => {
          this.rule['playParse'] = 0;
        },
      ],
    ]);

    function processString(str) {
      for (let [key, handler] of swMap) {
        if (str.includes(key)) {
          handler(str);
        }
      }
    }
    processString(switchs);
  }
  async init() {
    this.rule.headers = {};
    let 主页url = this.getRuleValue(['主页url'], '');
    let 分类url = getHome(this.getRuleValue(['分类url']));

    let url = 主页url;
    if (主页url == '') {
      url = 分类url;
    }

    this.rule.host = getHome(url);
    this.rule.URL = extractUrlParts(this.rule.host);
    let turl = this.getRuleValue(['分类url']);
    turl = this.splitTextWithSingleBracket(turl).filter((e) => e)[0];
    if (turl.includes(';;')) {
      let temp = turl.split(';;');
      turl = temp[0];
      this.rule.switchs = temp[1];
      this.setSwitchs(this.rule.switchs);
    }

    let 首页 = this.getRuleValue(['首页']);
    let 分类 = this.getRuleValue(['分类']);

    let nowYear = new Date().getFullYear();
    let years: string[] = [];
    for (let i = 0; i < 15; i++) {
      years[i] = nowYear - i + '$' + (nowYear - i);
    }
    autoRule['年份'] = years.join('#');

    let 主分类: any[] = [];
    if (分类.includes('$')) {
      for (let c of 分类.split('#')) {
        const d = c.split('$');
        主分类.push({
          type_name: d[0],
          type_id: d[1],
        });
      }
    } else if (分类.includes('&') && this.getRuleValue(['分类值'])) {
      let typenames = 分类.split('&');
      let typeids = this.getRuleValue(['分类值']).split('&');
      for (let i in typeids) {
        主分类.push({
          type_name: typenames[i],
          type_id: typeids[i],
        });
      }
    }

    let 分类数组 = this.getRuleValue(['分类数组']);

    if (主分类.length == 0 && 分类数组) {
      console.log('获取分类中...');
      let html = await this.req(this.rule.host);
      let class数组 = XBPQParse.getSplitArray(html, 分类数组);
      let list: any[] = [];
      if (class数组.length) {
        class数组.forEach((item) => {
          let 分类标题 = XBPQParse.getHasRuleSplitStr(item, this.getRuleValue(['分类标题'], '>&&</a'));
          //console.log(分类标题)
          let 分类id = XBPQParse.getHasRuleSplitStr(item, this.getRuleValue(['分类ID']));
          //console.log(分类id)
          if (分类id) {
            list.push(分类标题 + '$' + 分类id);
          }
        });
        this.XBPQRule['分类'] = list.join('#');
        console.log(this.XBPQRule['分类']);
      }
    }

    let clurl = this.getRuleValue(['分类url']);
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
        let temp = 首页.split('$');
        首页 = temp[0];
      }

      let tid;
      let cid = 主分类.findIndex((x) => 首页 == x.type_name);
      if (cid != -1) {
        tid = 主分类[cid].type_id;
        this.rule['主页surl'] = turl.replace('{cateId}', tid).replace('{catePg}', '1');
      }
    }

    let filters = {};

    if (this.getRuleValue(['筛选']) == '1' || this.getRuleValue(['筛选']) == '') {
      主分类.forEach((it, i) => {
        let tid = it.type_id;
        filters[tid] = getFilter(i, this, it.type_name);
      });
      filters = Object.fromEntries(Object.entries(filters).filter(([_key, value]: any) => value.length > 0));
      this.XBPQRule['筛选'] = filters;
    }

    let ua = this.getRuleValue(['请求头', 'ua', 'UserAgent'], '电脑');
    if (ua === '手机') {
      ua =
        'Mozilla/5.0 (Linux; Android 11; Ghxi Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/76.0.3809.89 Mobile Safari/537.36';
    } else if (ua === '电脑') {
      ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36';
    } else if (ua.includes('$')) {
      ua = ua.split('$')[1];
    }

    let playheads = this.getRuleValue(['播放请求头']);
    if (playheads) {
      this.rule.playheads = parseStringToObject(playheads);
    }
    let lazy = this.getRuleValue(['lazy']);
    if (lazy) {
      this.rule.lazy = lazy;
    }

    let click = this.getRuleValue(['click']);
    if (click) {
      this.rule.js = click;
    }
    let snifferw = this.getRuleValue(['嗅探词']);
    if (snifferw) {
      this.rule.snifferw = snifferw.replace(/#/g, '|');
    }
    let exsnifferw = this.getRuleValue(['过滤词']);
    if (exsnifferw) {
      this.rule.exsnifferw = exsnifferw.replace(/#/g, '|');
    }

    this.rule.headers['User-Agent'] = ua;
    if (this.getRuleValue(['Cookie'])) {
      this.rule.headers['Cookie'] = this.getRuleValue(['Cookie']);
    }
    if (this.getRuleValue(['Referer'])) {
      this.rule.headers['Referer'] = this.getRuleValue(['Referer']);
    }
    if (this.getRuleValue(['头部集合', 'User'])) {
      let heads = this.getRuleValue(['头部集合', 'User']).split('#');
      for (let head of heads) {
        let [k, v] = head.split('$');
        this.rule.headers[k] = v;
      }
    }
    if (this.getRuleValue(['解析'])) {
      let jx = parseStringToObject(this.getRuleValue(['解析']));
      this.rule['解析'] = jx;
    }
    if (this.getRuleValue(['直接播放']) == '1') {
      this.rule['二级'] = '*';
      if (!this.rule.playheads) {
        this.rule.playheads = this.rule.headers;
      }
      if (!this.rule.playheads['Referer']) {
        this.rule.playheads['Referer'] = this.rule.host;
      }
    }

    return this.rule
  }
  getClassData() {
    if (this.cacheClass && Object.keys(this.cacheClass).length !== 0) return this.cacheClass;

    let home: any = {
      filters: {},
      class: [],
    };
    let classData = this.getRuleValue(['分类']);
    if (classData.includes('$')) {
      for (let c of classData.split('#')) {
        const d = c.split('$');
        home.class.push({
          type_name: d[0],
          type_id: d[1],
        });
      }
    } else if (classData.includes('&') && this.getRuleValue(['分类值'])) {
      let typenames = classData.split('&');
      let typeids = this.getRuleValue(['分类值']).split('&');
      for (let i in typeids) {
        home.class.push({
          type_name: typenames[i],
          type_id: typeids[i],
        });
      }
    }
    //console.log(this.getRuleValue(["筛选"]))

    home.filters = this.getRuleValue(['筛选'], {} as string);

    this.cacheClass = home;
    this.rule['class'] = home;
    console.log(this.rule);
    return home;
  }
  async homeVod() {
    let 主页url = this.getRuleValue(['主页url'], '');
    let 分类url = getHome(this.getRuleValue(['分类url']));
    let 主页surl = this.rule['主页surl'] || '';
    let url = 主页url;
    if (主页url == '') {
      url = 分类url;
    }
    if (主页surl != '') {
      url = 主页surl;
    }
    //console.log("home", url);
    let list = JSON.parse(await this.一级(url, '首页')).list;
    if (list.length > 100) {
      list = list.slice(0, 99);
    }
    return JSON.stringify({
      list,
    });
  }
  home() {
    return JSON5.stringify(this.getClassData());
  }
  async 一级(url, ctype) {
    console.log('url:' + url);
    //let html;
    let html = await this.req(url);
    // console.log(html)
    let 搜索url = this.getRuleValue(['搜索url']);
    if (ctype == '首页' && !搜索url) {
      this.target = 'ext';
      let s = this.loopTest(html, '文本', '搜索');
      //console.log(s)
      if (s) {
        if (searchmap.has(s)) {
          console.log('搜索url设置:', searchmap.get(s));
          this.XBPQRule['搜索url'] = searchmap.get(s);
        }
      }
    }

    let host = getHome(url);
    // console.log("host", host)
    // let switchs = this.rule.switchs;

    const autoContent = this.AutoContent();
    // console.log("autoContent", autoContent)
    // console.log("autoContent", autoContent.isEmpty(['二次截取', '数组二次截取']))


    let ehtml: any = html;
    if (autoContent.isEmpty(['二次截取', '数组二次截取'])) {
      ehtml = autoContent.splitStr(html, ['二次截取', '数组二次截取'], { twice: true, ctype: ctype });
      // console.log("ehtml", ehtml)
    }
    let { ihost, getUrl } = this.prefixORsuffix(html, '', host);
    // console.log("ihost", ihost)

    let list: any[] = [];
    //console.log(this.getRuleValue(["数组"]))
    //let htmlList = XBPQParse.getSplitArray(html, this.getRuleValue(["数组"]));
    let htmlList = autoContent.splitArray(ehtml, ['数组'], { key: '数组' });
    // console.log(htmlList)

    //console.log(htmlList.length)
    // if (htmlList.length == 0) {
    //   htmlList = this.loopTest(html, "数组", "数组");
    // }
    let hasPic = 0;

    for (let item of htmlList) {
      //console.log(item)
      let vod_name = autoContent.splitStr(item, ['标题'], {
        type: '文本',
        key: '标题',
      });
      //console.log(vod_name)

      if (vod_name == null || vod_name == '') {
        continue;
      }
      let vod_remarks = autoContent.splitStr(item, ['副标题'], {
        type: '文本',
        key: '副标题',
      });
      //console.log("副标题", vod_remarks)

      let vod_id = autoContent.splitStr(item, ['链接'], 'href="&&"', {
        host: ihost,
        type: '链接',
        key: '链接',
      });
      //console.log("vod_id:", vod_id)
      if (vod_id) {
        vod_id = getUrl(vod_id);
      }

      if (this.judgeUrl(vod_id, vod_name, host, '一级')) {
        continue;
      }

      let vod_pic = autoContent.splitStr(item, ['图片'], {
        type: '图片',
        key: '图片',
        host: host,
      });

      if (this.getRuleValue(['图片']) == '' && vod_pic == '') {
        //continue;
      }
      if (vod_pic) {
        vod_pic = vod_pic + '@Referer=';
        hasPic++;
      }
      list.push({
        vod_id,
        vod_name: vod_name,
        vod_pic,
        vod_remarks: vod_remarks,
      });
    }
    if (hasPic > 4) {
      list = list.filter((v) => v.vod_pic);
    }
    list = removeDuplicatesByValue(list, 'vod_id');
    let tlist = list;

    if (list.length && list.every((it: any) => it.vod_id.includes('http'))) {
      let topurls = list.map((x: any) => x.vod_id);
      //console.log(topurls)
      //console.log(topurls.length);
      //获取相同部分
      let urlpath = findMostCommonBaseStructure(topurls);
      //console.log("相同部分")
      //console.log(urlpath);
      tlist = list.filter((it: any) => it.vod_id.includes(urlpath));
      if (tlist.length > 10) {
        list = tlist;
      }
    }
    // console.log(list)

    if (list.length == 0) {
      list.push({
        vod_id: '没有数据',
        vod_name: '无数据,防止无限请求',
        vod_pic: 'https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/404.jpg',
        vod_remarks: '不要点，会崩的',
      });
    }

    if (list.length) {
      console.log('list:', list.slice(0, 3));
    }

    return JSON.stringify({
      list,
    });
  }
  async category(tid, pg, _filter, extend) {
    let host = getHome(this.getRuleValue(['分类url']));
    if (!host.startsWith('http')) {
      host = getHome(this.getRuleValue(['主页url']));
    }
    //console.log("host:" + host);

    let urlMap = new Map([
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
        '{by}',
        {
          v: ['/by/{by}'],
        },
      ],
    ]);
    //！！url含有[]会有问题，未解决
    let url = this.getRuleValue(['分类url']);
    let firstPage = this.getRuleValue(['起始页', '分类起始页码', 'qishiye', 'firstpage'], '1');
    if ((url.includes('[') && (url.includes('];') || /\]$/.test(url))) || url.includes('|')) {
      url =
        pg == firstPage
          ? url.replace(/.*[\[|\|].*(http[^\]]*)\]?.*/g, '$1').replace('firstPage=', '')
          : url.replace(/\|\|/g, '\\|').replace(/(.*)[\[|\|].*/g, '$1');
    }
    //console.log("f:"+url)
    let temp_url = this.splitTextWithSingleBracket(url);
    //console.log("f:"+temp_url)
    let sresult_url = host + url.replace(host, '');

    if (temp_url.filter((e) => e).length > 1) {
      if (pg == 1) {
        url = host + temp_url[1].replace(host, '');
      } else {
        url = host + temp_url[0].replace(host, '');
      }
    } else {
      url = sresult_url;
    }

    for (let [key, value] of urlMap) {
      // 在这里进行判断
      if (url.includes(key)) {
        //console.console.log(`${key}`);
        let k = key.replace(/[{}]/g, '');
        if (extend.hasOwnProperty(k) && extend[k] != '') {
        } else {
          for (let vv of Array.from(value.v)) {
            if (url.includes(vv)) {
              url = url.replace(vv, '');
              break;
            }
          }
        }
      }
      // 可以根据需要添加更多的判断
    }
    //console.log("f:"+url)
    url = url
      .replace('{cateId}', extend.cateId || tid || '')
      .replace('{class}', extend.class || '')
      .replace('{area}', extend.area || '')
      .replace('{year}', extend.year || '')
      .replace('{by}', extend.by || '')
      .replace('{lang}', extend.lang || '')
      .replace('{catePg}', pg);

    if (url.includes(';;')) {
      let temp = url.split(';;');
      url = temp[0];
    }
    // console.log(url, extend.cateId || tid)
    return await this.一级(url, extend.cateId || tid);
  }
  async detail(vod_url) {
    console.log('vod_url', vod_url);
    if (this.rule['二级'] === '*') {
      return JSON.stringify({
        list: [
          {
            vod_play_url: '播放视频$' + vod_url,
            vod_play_from: '嗅探',
          },
        ],
      });
    }
    let html = await this.req(vod_url);
    let host = getHome(vod_url);
    let autoContent = this.AutoContent();

    let lienHtml = autoContent.splitStr(html, ['线路二次截取'], {
      twice: true,
    });

    let fromle = autoContent.splitArray(lienHtml, ['线路数组'], {
      key: '线路数组',
    });

    // console.log('fromle', fromle);

    let from: string[] = [];

    fromle.map((v) => {
      let line_title = autoContent.splitStr(v, ['线路标题'], '">&&<', {
        type: '文本',
        key: '线路标题',
      });

      //console.log(line_title)
      if (line_title != null) {
        from.push(line_title);
      }
    });
    if (from.length == 0) {
      let tfrom = fromle.map((v) => {
        return removeTagsExceptList(v).replace(/[<>]/g, '').trim();
      });
      from = tfrom;
    }
    from = from.filter((e) => e && e != '');

    // console.log('from', from);

    let 简介 =
      autoContent.splitStr(html, ['简介'], {
        type: '文本',
        key: '简介',
      }) || '';
    简介 = 简介.replace(/\\\\r\\\\n/g, '<br>').replace(/\\n/g, '<br>');
    //console.log(简介)

    简介 = removeSingleAngleBrackets(简介);
    简介 = convertMultipleUnicodeEscapedWords(简介);
    简介 = replaceTagsWithMapping(简介, {
      br: ['span', 'p'],
    });
    简介 = removeTagsExceptList(简介, ['br']);
    简介 = optimizeHtmlContent(简介);

    let descs = {
      状态:
        autoContent.splitStr(html, ['影片状态'], autoRule['影片状态'], {
          key: '影片状态',
        }) || '',
      类型:
        autoContent.splitStr(html, ['影片类型'], autoRule['影片类型'], {
          key: '影片类型',
        }) || '',
      主演:
        autoContent.splitStr(html, ['主演'], autoRule['主演'], {
          key: '主演',
        }) || '',
      导演:
        autoContent.splitStr(html, ['导演'], autoRule['导演'], {
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
    //console.log(descs)

    for (let key in descs) {
      if (descs[key] != '') {
        let item = removeTagsExceptList(descs[key]);
        item = collapseSpacesAndTrim(item);
        item = item.replace(/简介[:：].*/, '');
        if (key != '状态') {
          item = item.replace(/更新[:：].*/, '');
        }
        if (key != '导演') {
          item = item.replace(/导演[:：].*/, '');
        }
        if (key != '主演') {
          item = item.replace(/主演[:：].*/, '');
        }
        if (key != '类型') {
          item = item.replace(/类型[:：].*/, '');
        }
        descs[key] = item;
      }
    }

    console.log('descs', descs);

    let vod_pic = XBPQParse.getSplitStr(html, 'class="list-nav"*img src="*&&">');

    //console.log(vod_pic)

    let list: any[] = [];
    let resitem = {
      vod_id: vod_url,
      //vod_name: "",
      vod_year: descs.年代,
      vod_pic: vod_pic,
      vod_remarks: descs.状态,
      vod_area: descs.地区,
      vod_content: 简介,
      vod_actor: descs.主演,
      vod_director: descs.导演,
      vod_play_url: '',
      vod_play_from: '',
    };

    // let play = [];

    let 多线 = autoContent.splitStr(lienHtml, ['多线二次截取'], {
      twice: true,
    });

    let 多线数组 = (XBPQParse.getSplitArray(多线, this.getRuleValue(['多线数组'])) || []).map((v) => {
      let { ihost: ithost, getUrl } = this.prefixORsuffix(html, '多线', host);
      let url = XBPQParse.getSplitStr(v, this.getRuleValue(['多线链接'], 'href="&&"'), ithost);
      url = getUrl(url);
      return url;
    });
    if (多线数组.length) {
      console.log('多线数组', 多线数组);
    }

    let bfs = [];
    let htmls: string[] = [];
    let plays: string[] = [];
    if (多线数组.length) {
      let start_time = new Date().getTime();
      console.log('多线程开始');
      let heads = this.rule.headers;
      bfs = 多线数组.map((url) => ({
        options: heads,
        url: url,
      }));
      // htmls = bf(bfs);
      htmls = batchFetch(bfs);
      let end_time = new Date().getTime() - start_time;
      console.log('多线程结束,耗时:', end_time);
    }
    //console.log(htmls.length)

    let surls = new Set();

    function getplaylist(html, playHtmlArr, i, rule) {
      let { ihost: phost, getUrl: pgetUrl } = rule.prefixORsuffix(html, '播放', host);
      // console.log(phost, pgetUrl);
      let playlist: string[] = [];
      //let tplaylist = XBPQParse.getSplitArray(playHtmlArr[i], rule.getRuleValue(["播放列表"], autoRule["播放列表"]));
      // console.log(playHtmlArr[i]);
      // console.log(autoRule['播放列表']);
      let tplaylist = autoContent.splitArray(playHtmlArr[i], ['播放列表'], autoRule['播放列表']);
      // console.log('播放列表', tplaylist);
      //console.log(tplaylist.length)

      for (let v of tplaylist) {
        //console.log(v)

        let title = autoContent.splitStr(v, ['播放标题'], 'title="&&"', {
          type: '文本',
          key: '播放标题',
        });
        // console.log(title);
        if (title == null) {
          title = v.replace(/.*\>/g, '');
          title = removeChars(title, '\n');
        }
        // console.log(title);

        let url = autoContent.splitStr(v, ['播放链接'], autoRule['播放链接'], {
          host: phost,
          type: '链接',
          key: '播放链接',
        });
        // console.log(url);

        url = pgetUrl(url);
        // console.log(url);
        if (url == '' || url?.includes('javascript')) {
          continue;
        }
        let it = title + '$' + url;
        // console.log(it);
        if (!surls.has(url)) {
          surls.add(url);
        } else {
          continue;
        }
        playlist.push(it);
      }
      return playlist;
    }

    if (htmls.length == 0) {
      htmls = [html];
    } else {
      htmls = [html].concat(htmls);
    }
    //console.log(htmls.length)

    htmls.forEach((ithml) => {
      /*let playHtml = ithml;
      if (this.getRuleValue(["播放二次截取"])) {
        playHtml = XBPQParse.getHasRuleSplitStr(ithml, this.getRuleValue(["播放二次截取"]));
      }
      console.log("playHtml", playHtml)
      if (playHtml == null) {
        playHtml = ithml;
      }*/
      let playHtml = autoContent.splitStr(ithml, ['播放二次截取'], {
        twice: true,
      });

      /*let playHtmlArr = XBPQParse.getSplitArray(playHtml, this.getRuleValue(["播放数组"]));*/
      let playHtmlArr = autoContent.splitArray(playHtml, ['播放数组'], { key: '播放数组' });

      // console.log('playHtmlArr', playHtmlArr.length);
      // console.log(playHtmlArr);

      /*if (playHtmlArr.length == 0) {
        playHtmlArr = this.loopTest(lienHtml, "数组", "播放数组")
      }*/

      for (let i in playHtmlArr) {
        let playlist = getplaylist(ithml, playHtmlArr, i, this);
        // console.log(playlist);

        if (this.rule['倒序'] == '0') {
          playlist.reverse();
        }
        plays.push(playlist.join('#'));
      }
    });
    // console.log(plays);

    let lists = plays.filter((e) => e && e != '');
    // console.log(lists.map((x) => x.split('#').length));

    from = from.slice(0, lists.length);

    // console.log(from);
    // console.log(lists);

    resitem.vod_play_from = from.join('$$$');
    resitem.vod_play_url = lists.join('$$$');
    // console.log('resitem', resitem);
    list.push(resitem);

    //console.log(list)
    return JSON.stringify({
      list,
    });
  }
  async play(flag, input) {
    let parse_extra = '';
    let jx: number = 0;
    let headers = this.rule.playheads;
    let parse = this.rule.playParse;
    let jxs = this.rule['解析'];
    let p_exrta = {};
    if (this.rule.snifferw) {
      p_exrta['custom_regex'] = this.rule.snifferw;
    }
    if (this.rule.exsnifferw) {
      p_exrta['sniffer_exclude'] = this.rule.exsnifferw;
    }
    parse_extra = objToQueryString(p_exrta);
    //console.log("parse_extra", parse_extra)

    const autoContent = this.AutoContent();

    if (jxs && input) {
      //console.log(jxs)
      // console.log(input);
      if (!input.startsWith('http')) {
        if (jxs.hasOwnProperty(flag)) {
          input = jxs[flag] + input;
        } else if (jxs.hasOwnProperty('默认')) {
          input = jxs['默认'] + input;
        }
        jx = 1;
      }
    }

    let jumplay = this.getRuleValue(['跳转播放链接']);

    if (input && jumplay) {
      let h = await this.req(input);
      let temp = autoContent.splitStr(h, ['跳转播放链接'], {
        type: '链接',
      });
      if (temp) {
        if (temp.includes('punish?x5sec')) {
          temp = input;
        }
        input = temp;
        input = this.normalizeUrl(temp);
        if (/\.(m3u8|mp4)$/.test(input)) {
          parse = 0;
        }
      }
    }

    let playobj = {
      //jx:jx,
      parse: parse != undefined ? parse : 1,
      url: input,
      js: this.rule.js,
      header: headers,
      parse_extra: parse_extra,
    };
    // console.log(playobj);

    return JSON.stringify(playobj);
  }
  async req(url) {
    // console.log('req url: ' + url);
    if (!url.startsWith('http')) {
      url = this.rule.host + url;
    }
    let res = '';
    let type = url.indexOf(';post') > -1 ? 'post' : 'get';
    // console.log('req method: ' + type)
    if (type == 'post') {
      let postcs = url.split(';')[2];
      url = url.split(';')[0];
      res = await request({
        url,
        method: 'post',
        headers: this.rule.headers,
        data: postcs,
      });
      // res = post(url, {
      //   headers: this.rule.headers,
      //   method: 'POST',
      //   body: postcs,
      // });
    } else {
      url = url.split(';')[0];
      res = await request({
        url,
        method: 'get',
        headers: this.rule.headers,
      });

      // res = request(url, {
      //   headers: this.rule.headers,
      // });
    }
    // if (res.includes('robot')) {
    //   // console.log("疑似触发机器人验证,打印日志");
    //   // console.log("网页源码:", res);
    // }
    return res;
  }
  async search(wd, _quick, pg) {
    let url = this.getRuleValue(['搜索url'], '/index.php/ajax/suggest?mid=1&wd={wd}&limit=500');
    url = url.replace('{wd}', wd).replace('{pg}', pg);
    let host = this.rule.host;
    let surl = url;
    if (!surl.startsWith('http')) {
      surl = host + surl;
    }
    console.log(this.rule.name, 'search:', surl);
    let html: any = await this.req(surl);
    const autoContent = this.AutoContent();

    // if (this.getRuleValue(["搜索二次截取"])) {
    //   html = XBPQParse.getSplitStr(html, this.getRuleValue(["搜索二次截取"]));
    // }

    html = autoContent.splitStr(html, ['搜索二次截取'], {
      twice: true,
    });
    //console.log(html)

    let htmlList = autoContent.splitArray(html, ['搜索数组', '数组'], {
      key: '数组',
    });

    //console.log(htmlList)

    //let htmlList = XBPQParse.getSplitArray(html, this.getRuleValue(["搜索数组", "数组"], "<a &&</a>"));

    let list: any[] = [];
    for (let item of htmlList) {
      //let name = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索标题", "标题"], 'title="&&"'));
      let name = autoContent.splitStr(item, ['搜索标题', '标题'], 'title="&&"', {
        type: '文本',
        key: '标题',
      });

      if (name == null) {
        continue;
      }

      //let vod_pic = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索图片", "图片"], item.includes("original") ? 'original="&&"' : '<img src="&&"'), host);

      let vod_pic = autoContent.splitStr(item, ['搜索图片', '图片'], {
        type: '图片',
        key: '图片',
        host: host,
      });

      //vod_pic = this.normalizeUrl(vod_pic);

      let { ihost, getUrl } = this.prefixORsuffix(item, '搜索', host);

      let vod_id = autoContent.splitStr(item, ['搜索链接', '链接'], 'href="&&"', {
        host: ihost,
      });

      //let vod_id = XBPQParse.getSplitStr(item, this.getRuleValue(["搜索链接", "链接"], 'href="&&"'), ihost);
      if (vod_id) {
        vod_id = getUrl(vod_id);
      }

      if (vod_id!.startsWith('/')) {
        vod_id = host + vod_id;
      }

      list.push({
        vod_id,
        vod_name: name,
        vod_pic,
        vod_remarks: XBPQParse.getSplitStr(item, this.getRuleValue(['搜索副标题', '副标题'])).replace(/[<>]/g, ''),
      });
    }
    list = removeDuplicatesByValue(list, 'vod_id').filter((x) => x.vod_name != '首页' && !x.vod_id.includes(';'));

    if (list.length) {
      console.log('searchlist:', list.slice(0, 3));
    }

    return JSON.stringify({
      list,
    });
  }
  getRule(key) {
    return key ? this.rule[key] : this.rule;
  }
  runMain() {
    return '';
  }
}

export default XBPQAdapter;
