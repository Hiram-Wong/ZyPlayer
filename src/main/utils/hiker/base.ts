/**
 * 从字符串中提取域名
 * @param {string} str - 要处理的字符串，如：'http://www.example.com'
 * @returns {string} - 提取的域名，如：'www.example.com'
 */
const getHome = (str: string) => {
  if (str.startsWith('http')) {
    const url = new URL(str);
    return url.origin;
  } else return str;
};

/**
 * 将对象中的键转换为小写字母
 * @param {object} obj - 要转换的对象
 * @returns {object} - 转换后的对象
 */
const keysToLowerCase = (obj: { [key: string]: string }) => {
  return Object.keys(obj).reduce((result, key) => {
    const newKey = key.toLowerCase();
    result[newKey] = obj[key];
    return result;
  }, {});
};

/**
 * 解析查询字符串，返回一个对象
 * @param {string} query - 查询字符串，如：'key1=value1&key2=value2'
 * @returns {object} - 解析后的对象，如：{ key1: 'value1', key2: 'value2' }
 */
const parseQueryString = (query: string) => {
  const params = {};
  query.split('&').forEach(function (part) {
    // 使用正则表达式匹配键和值，直到遇到第一个等号为止
    const regex = /^(.*?)=(.*)/;
    const match = part.match(regex);
    if (match) {
      const key = decodeURIComponent(match[1]);
      const value = decodeURIComponent(match[2]);
      params[key] = value;
    }
  });
  return params;
};

/**
 * 构建URL，支持添加参数
 * @param {string} url - 原始URL
 * @param {string} paramsStr - 要添加的参数字符串，可以是查询字符串或路径字符串
 * @returns {string} - 构建后的URL
 */
const buildUrl = (url: string, paramsStr: string) => {
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

/**
 * 复制文本到剪贴板
 * @param {string} val - 要复制的文本
 * @returns {Promise<void>} - 返回一个Promise对象，表示复制操作完成
 */
const copy = async (val: string) => {
  await navigator.clipboard.writeText(val);
};

const $ = {
  toString(func: Function) {
    const strfun = func.toString();
    return strfun.replace(/^\(\)(\s+)?=>(\s+)?\{/, 'js:').replace(/\}$/, '');
  },
};

const urljoin = (fromPath: string = '', nowPath: string = '') => {
  if (/^(?:[a-z]+:)?\/\//i.test(fromPath)) {
    return new URL(nowPath, fromPath).href;
  }
  if (/^(?:[a-z]+:)?\/\//i.test(nowPath)) {
    return nowPath;
  }
  return new URL(nowPath, new URL(fromPath, 'resolve://')).href;
};

export { urljoin, getHome, keysToLowerCase, parseQueryString, buildUrl, copy, $ };
