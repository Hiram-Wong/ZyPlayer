import request from '@main/utils/request';
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

const resolve = (from, to) => {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.href;
};

/**
 *  url拼接
 * @param fromPath 初始当前页面url
 * @param nowPath 相对当前页面url
 * @returns {*}
 */
const urljoin = (fromPath, nowPath) => {
  fromPath = fromPath || '';
  nowPath = nowPath || '';
  return resolve(fromPath, nowPath);
};

/**
 *  智能对比去除广告。支持嵌套m3u8。只需要传入播放地址
 * @param m3u8_url m3u8播放地址
 * @param headers 自定义访问m3u8的请求头,可以不传
 * @returns {string}
 */
const fixAdM3u8Ai = async (m3u8_url: string, headers: object = {}) => {
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

export { fixAdM3u8Ai };
