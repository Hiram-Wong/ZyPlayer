import request from '@main/utils/request';
import { urljoin } from '@main/utils/hiker/base';
import logger from '@main/core/logger';

if (typeof Array.prototype.toReversed !== 'function') {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function () {
      const clonedList = this.slice();
      // 倒序新数组
      const reversedList = clonedList.reverse();
      return reversedList;
    },
    enumerable: false,
  });
}

/**
 * 智能对比去除广告。支持嵌套m3u8。只需要传入播放地址
 * @param m3u8_url m3u8播放地址
 * @param headers 自定义访问m3u8的请求头,可以不传
 * @returns {string}
 */
const fixAdM3u8AiV1 = async (m3u8_url: string, headers: object = {}) => {
  let ts = new Date().getTime();
  let option = headers;

  // 字符串比较
  function b(s1, s2) {
    let i = 0;
    while (i < s1.length) {
      if (s1[i] !== s2[i]) {
        break;
      }
      i++;
    }
    return i;
  }

  function reverseString(str) {
    return str.split('').reverse().join('');
  }

  // logger.info('播放的地址：' + m3u8_url);
  console.log({
    url: m3u8_url,
    method: 'get',
    ...option,
  });
  let m3u8 = await request({
    url: m3u8_url,
    method: 'get',
    ...option,
  });
  // logger.info('m3u8处理前:' + m3u8);
  m3u8 = m3u8
    .trim()
    .split('\n')
    .map((it) => (it.startsWith('#') ? it : urljoin(m3u8_url, it)))
    .join('\n');
  // logger.info('m3u8处理后:============:' + m3u8);
  // 获取嵌套m3u8地址
  m3u8 = m3u8.replace(/\n\n/gi, '\n'); //删除多余的换行符
  let last_url = m3u8.split('\n').slice(-1)[0];
  if (last_url.length < 5) {
    last_url = m3u8.split('\n').slice(-2)[0];
  }

  if (last_url.includes('.m3u8') && last_url !== m3u8_url) {
    m3u8_url = urljoin(m3u8_url, last_url);
    logger.info('嵌套的m3u8_url:' + m3u8_url);
    m3u8 = await request({
      url: m3u8_url,
      method: 'get',
      ...option,
    });
  }
  // logger.info('----处理有广告的地址----');
  let s = m3u8
    .trim()
    .split('\n')
    .filter((it) => it.trim())
    .join('\n');
  let ss = s.split('\n');
  //找出第一条播放地址
  //let firststr = ss.find(x => !x.startsWith('#'));
  let firststr = '';
  let maxl = 0; //最大相同字符
  let kk = 0;
  let kkk = 2;
  let secondstr = '';
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (kk == 0) firststr = s;
      if (kk == 1) maxl = b(firststr, s);
      if (kk > 1) {
        if (maxl > b(firststr, s)) {
          if (secondstr.length < 5) secondstr = s;
          kkk = kkk + 2;
        } else {
          maxl = b(firststr, s);
          kkk++;
        }
      }
      kk++;
      if (kk >= 20) break;
    }
  }
  if (kkk > 30) firststr = secondstr;
  let firststrlen = firststr!.length;
  // logger.info('字符串长度：' + firststrlen);
  let ml = Math.round(ss.length / 2).toString().length; //取数据的长度的位数
  // logger.info('数据条数的长度：' + ml);
  //找出最后一条播放地址
  let maxc = 0;
  let laststr = ss.toReversed().find((x) => {
    if (!x.startsWith('#')) {
      let k = b(reverseString(firststr), reverseString(x));
      maxl = b(firststr, x);
      maxc++;
      if (firststrlen - maxl <= ml + k || maxc > 10) {
        return true;
      }
    }
    return false;
  });
  logger.info('最后一条切片：' + laststr);
  // logger.info('最小相同字符长度：' + maxl);
  let ad_urls: string[] = [];
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (b(firststr, s) < maxl) {
        ad_urls.push(s); // 广告地址加入列表
        ss.splice(i - 1, 2);
        i = i - 2;
      } else {
        ss[i] = urljoin(m3u8_url, s);
      }
    } else {
      ss[i] = s.replace(/URI=\"(.*)\"/, 'URI="' + urljoin(m3u8_url, '$1') + '"');
    }
  }
  logger.info('处理的m3u8地址:' + m3u8_url);
  logger.info('----广告地址----');
  logger.info(ad_urls);
  m3u8 = ss.join('\n');
  // logger.info('处理完成');
  logger.info('处理耗时：' + (new Date().getTime() - ts).toString());
  return m3u8;
};

/**
 * 智能对比去除广告。支持嵌套m3u8。只需要传入播放地址
 * @param m3u8_url m3u8播放地址
 * @param headers 自定义访问m3u8的请求头,可以不传
 * @returns {string}
 */
const fixAdM3u8AiV2 = async (m3u8_url: string, headers: object = {}) => {
  let ts = new Date().getTime();
  let option = headers;

  // 字符串比较
  function b(s1, s2) {
    let i = 0;
    while (i < s1.length) {
      if (s1[i] !== s2[i]) {
        break;
      }
      i++;
    }
    return i;
  }

  function reverseString(str) {
    return str.split('').reverse().join('');
  }

  let m3u8 = await request({ url: m3u8_url, method: 'get', ...option });
  m3u8 = m3u8
    .trim()
    .split('\n')
    .map((it) => (it.startsWith('#') ? it : urljoin(m3u8_url, it)))
    .join('\n');
  m3u8 = m3u8.replace(/\n\n/gi, '\n');
  let last_url = m3u8.split('\n').slice(-1)[0];
  if (last_url.length < 5) {
    last_url = m3u8.split('\n').slice(-2)[0];
  }
  if (last_url.includes('.m3u8') && last_url !== m3u8_url) {
    m3u8_url = urljoin(m3u8_url, last_url);
    logger.info('嵌套的m3u8_url:' + m3u8_url);
    m3u8 = await request({ url: m3u8_url, method: 'get', ...option });
  }
  let s = m3u8
    .trim()
    .split('\n')
    .filter((it) => it.trim())
    .join('\n');
  let ss = s.split('\n');
  let firststr = '';
  let maxl = 0;
  let kk = 0;
  let kkk1 = 1;
  let kkk2 = 0;
  let secondstr = '';
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (kk == 0) firststr = s;
      if (kk > 0) {
        if (maxl > b(firststr, s) + 1) {
          if (secondstr.length < 5) secondstr = s;
          kkk2++;
        } else {
          maxl = b(firststr, s);
          kkk1++;
        }
      }
      kk++;
      if (kk >= 30) break;
    }
  }
  if (kkk2 > kkk1) firststr = secondstr;
  let firststrlen = firststr.length;
  let ml = Math.round(ss.length / 2).toString().length;
  let maxc = 0;
  let laststr = ss.toReversed().find((x) => {
    if (!x.startsWith('#')) {
      let k = b(reverseString(firststr), reverseString(x));
      maxl = b(firststr, x);
      maxc++;
      if (firststrlen - maxl <= ml + k || maxc > 10) {
        return true;
      }
    }
    return false;
  });
  logger.info('最后一条切片：' + laststr);
  let ad_urls: string[] = [];
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (b(firststr, s) < maxl) {
        ad_urls.push(s);
        ss.splice(i - 1, 2);
        i = i - 2;
      } else {
        ss[i] = urljoin(m3u8_url, s);
      }
    } else {
      if (s.indexOf('URI')>0){
        let s1=s.match(/URI=\"(.*)\"/)[1]
        ss[i] = s.replace(/URI=\"(.*)\"/, 'URI="' + urljoin(m3u8_url, s1) + '"')
      }
    }
  }
  logger.info('处理的m3u8地址:' + m3u8_url);
  logger.info('----广告地址----');
  logger.info(ad_urls);
  m3u8 = ss.join('\n');
  logger.info('处理耗时:' + (new Date().getTime() - ts).toString());
  return m3u8;
};

/**
 * 智能对比去除广告。支持嵌套m3u8。只需要传入播放地址
 * @param m3u8_url m3u8播放地址
 * @param headers 自定义访问m3u8的请求头,可以不传
 * @returns {string}
 */
const fixAdM3u8AiLatest = async (m3u8_url: string, headers: object = {}) => {
  const startTime = Date.now();
  const options = { method: 'get', ...headers };

  logger.info(`处理地址: ${m3u8_url}`);

  // 获取字符串公共前缀长度
  const compareSameLen = (s1: string, s2: string): number => {
    let length = 0;
    while (length < s1.length && s1[length] === s2[length]) {
      length++;
    }
    return length;
  };

  // 反转字符串
  const reverseString = (str: string): string => str.split('').reverse().join('');

  // 拉取 m3u8 内容
  const fetchM3u8 = async (url: string): Promise<string> => {
    const response = await request({ url, ...options });
    return response.trim();
  };

  // 补全 URL 地址
  const resolveUrls = (lines: string[], baseUrl: string): string[] =>
    lines.map((line) => !line.startsWith('#') && !/^(http:\/\/|https:\/\/)/.test(line) ? urljoin(baseUrl, line) : line);

  // 压缩多余的空行
  const compressEmptyLines = (lines: string[]): string[] => {
    const result: string[] = [];
    let lastLineWasEmpty = false;
  
    for (const line of lines) {
      const isEmpty = !!(typeof line === 'string' ? line.trim() : '');
      if (isEmpty || lastLineWasEmpty) result.push(line);
      lastLineWasEmpty = isEmpty;
    }
  
    return result;
  };

  // 解析 m3u8 内容为数组
  const parseM3u82Array = async (url: string): Promise<string[]> => {
    let content = await fetchM3u8(url);
    let lines = resolveUrls(content.split('\n'), m3u8_url);
    lines = compressEmptyLines(lines);
    return lines;
  }

  let lines = await parseM3u82Array(m3u8_url);

  // 处理嵌套 m3u8
  let last_url = lines.slice(-1)[0];
  if (last_url.length < 5) last_url = lines.slice(-2)[0];
  if (last_url.includes('.m3u8') && last_url !== m3u8_url) {
    m3u8_url = last_url;
    if (!/^(http:\/\/|https:\/\/)/.test(last_url)) m3u8_url = urljoin(m3u8_url, last_url);
    logger.info(`嵌套地址: ${m3u8_url}`);
    lines = await parseM3u82Array(m3u8_url);
  }

  // 疑似广告段处理
  const findAdSegments = (segments: string[], m3u8_url: string) => {
    const cleanSegments = [...segments];
    let firstStr = "";
    let secondStr = "";
    let maxSimilarity = 0;
    let primaryCount = 1;
    let secondaryCount = 0;
  
    // 第一轮遍历：确定 `firstStr`
    for (let i = 0; i < cleanSegments.length; i++) {
      const segment = cleanSegments[i];
      if (!segment.startsWith("#")) {
        if (!firstStr) firstStr = segment;
        else {
          const similarity = compareSameLen(firstStr, segment);
          if (maxSimilarity > similarity + 1) {
            if (secondStr.length < 5) secondStr = segment;
            secondaryCount++;
          } else {
            maxSimilarity = similarity;
            primaryCount++;
          }
        }
        if (secondaryCount + primaryCount >= 30) break;
      }
    }
    if (secondaryCount > primaryCount) firstStr = secondStr;
  
    const firstStrLen = firstStr.length;
    const maxIterations = Math.min(cleanSegments.length, 10);
    const halfLength = Math.round(cleanSegments.length / 2).toString().length;
  
    // 第二轮遍历：找到 `lastStr`
    let maxc = 0;
    const lastStr = cleanSegments
      .slice()
      .reverse()
      .find((x) => {
        if (!x.startsWith("#")) {
          const reversedFirststr = reverseString(firstStr);
          const reversedX = reverseString(x);
          const similarity = compareSameLen(reversedFirststr, reversedX);
          maxSimilarity = compareSameLen(firstStr, x);
          maxc++;
          return (
            firstStrLen - maxSimilarity <= halfLength + similarity || maxc > 10
          );
        }
        return false;
      });
  
    logger.info("最后切片: " + lastStr);
  
    const adSegments: string[] = [];
  
    // 第三轮遍历：处理 `ss`
    for (let i = 0; i < cleanSegments.length; i++) {
      const segment = cleanSegments[i];
      if (!segment.startsWith("#")) {
        if (compareSameLen(firstStr, segment) < maxSimilarity) {
          adSegments.push(segment);
          cleanSegments.splice(i - 1, 2); // 删除两个元素
          i -= 2; // 更新索引
        } else {
          cleanSegments[i] = urljoin(m3u8_url, segment);
        }
      } else if (segment.includes("URI")) {
        const match = segment.match(/URI=\"(.*)\"/);
        if (match) {
          const updatedUri = urljoin(m3u8_url, match[1]);
          cleanSegments[i] = segment.replace(/URI=\"(.*)\"/, `URI="${updatedUri}"`);
        }
      }
    }
  
    return { adSegments, cleanSegments };
  }
  
  const { cleanSegments, adSegments } = findAdSegments(lines, m3u8_url);

  logger.info('广告分片', adSegments);
  logger.info(`处理耗时: ${Date.now() - startTime} ms`);
  return cleanSegments.join('\n');
};

const fixAdM3u8Ai = {
  v1: fixAdM3u8AiV1,
  v2: fixAdM3u8AiV2,
  latest: fixAdM3u8AiLatest,
};

export default fixAdM3u8Ai;
