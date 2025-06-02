/**
 * 从字符串中提取域名
 * @param {string} str - 要处理的字符串，如：'http://www.example.com'
 * @returns {string} - 提取的域名，如：'www.example.com'
 */
const getHome = (str: string): string => {
  try {
    const url = new URL(str);
    return url.origin;
  } catch {
    return str;
  }
};

/**
 * 将对象中的键转换为小写字母，递归处理嵌套对象和数组
 * @param {object} obj - 要转换的对象
 * @returns {object} - 转换后的对象
 */
const keysToLowerCase = (obj: object): object => {
  if (Array.isArray(obj)) {
    return obj.map(keysToLowerCase);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.toLowerCase(),
        keysToLowerCase(value),
      ])
    );
  }
  return obj;
};

/**
 * 解析查询字符串，返回一个对象
 * @param {string} query - 查询字符串，如：'key1=value1&key2=value2'
 * @returns {object} - 解析后的对象，如：{ key1: 'value1', key2: 'value2' }
 */
const parseQueryString = (query: string): object => {
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
const buildUrl = (url: string, paramsStr: string): string => {
  const { origin, pathname, search } = new URL(url);
  const basePath = pathname.replace(/\/$/, '');
  const api = origin + basePath;

  // 合并 query 参数
  if (paramsStr.startsWith('?') || paramsStr.startsWith('&')) {
    const originalParams = new URLSearchParams(search);
    const newParams = new URLSearchParams(paramsStr);

    newParams.forEach((value, key) => originalParams.set(key, value));
    const query = originalParams.toString();
    return query ? `${api}?${query}` : api;
  }

  // 拼接路径段
  const extraPath = paramsStr.replace(/^\/+/, ''); // 去除开头所有 "/"
  return extraPath ? `${api}/${extraPath}` : api;
};

/**
 * 复制文本到剪贴板
 * @param {string} val - 要复制的文本
 * @returns {Promise<void>} - 返回一个Promise对象，表示复制操作完成
 */
const copy = async (val: string): Promise<void> => {
  await navigator.clipboard.writeText(val);
};

const $ = {
  toString(func: Function) {
    const strfun = func.toString();
    return strfun.replace(/^\(\)(\s+)?=>(\s+)?\{/, 'js:').replace(/\}$/, '');
  },
};

/**
 * 解析并拼接URL路径
 * @param {string} from - 基础URL路径
 * @param {string} to - 要拼接的相对路径
 * @returns {string} - 拼接后的完整URL路径
 */
const resolve = (from: string, to: string): string => {
  const base = new URL(from, 'resolve://');
  const resolved = new URL(to, base);

  return resolved.protocol === 'resolve:'
    ? `${resolved.pathname}${resolved.search}${resolved.hash}`
    : resolved.href;
};

/**
 *  url拼接
 * @param {string} fromPath 初始当前页面url
 * @param {string} nowPath 相对当前页面url
 * @returns {string} 拼接后的完整URL路径
 */
const urljoin = (fromPath: string, nowPath: string): string => {
  fromPath = fromPath || '';
  nowPath = nowPath || '';
  return resolve(fromPath, nowPath);
};

export { urljoin, getHome, keysToLowerCase, parseQueryString, buildUrl, copy, $ };
