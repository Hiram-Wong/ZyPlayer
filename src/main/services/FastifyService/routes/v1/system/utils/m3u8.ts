import { loggerService } from '@logger';
import { request } from '@main/utils/request';
import { LOG_MODULE } from '@shared/config/logger';
import { urlResolve } from '@shared/modules/headers';

const logger = loggerService.withContext(LOG_MODULE.SYSTEM_HELPER);

export const fixAdM3u8Ai = async (m3u8Url: string, headers: Record<string, string> = {}) => {
  const startTime = Date.now();

  const commonPrefixLength = (a: string, b: string): number => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  };

  const reverseString = (str: string): string => str.split('').reverse().join('');

  // 拉取并格式化 M3U8
  const fetchM3u8 = async (url: string) => {
    const { data: content } = await request.request({
      url,
      method: 'GET',
      ...headers,
    });
    return content
      .trim()
      .split('\n')
      .map((line: string) => (line.startsWith('#') ? line : urlResolve(url, line)))
      .join('\n')
      .replace(/\n\n/g, '\n');
  };

  let m3u8Content = await fetchM3u8(m3u8Url);

  // 处理嵌套 m3u8
  let lastUrl = m3u8Content.split('\n').filter(Boolean).slice(-1)[0] || '';
  if (lastUrl.length < 5) {
    lastUrl = m3u8Content.split('\n').filter(Boolean).slice(-2)[0] || '';
  }
  if (lastUrl.includes('.m3u8') && lastUrl !== m3u8Url) {
    m3u8Url = urlResolve(m3u8Url, lastUrl);
    logger.info(`嵌套的 m3u8_url: ${m3u8Url}`);
    m3u8Content = await fetchM3u8(m3u8Url);
  }

  const lines = m3u8Content.trim().split('\n').filter(Boolean);

  // ffzy 平台的广告检测和移除
  // if (m3u8Url.includes('ffzy')) {
  //   let n = 0;
  //   let m = 0;
  //   let t = 0;
  //   let k1 = 0;
  //   let s2 = '';

  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];

  //     if (line.startsWith('#EXTINF')) {
  //       const duration = line.slice(8);
  //       n++;
  //       if (n === 1) k1 = i;
  //       if (!s2.includes(duration)) {
  //         s2 += duration;
  //         m++;
  //       }
  //       t += Number.parseFloat(duration);
  //       i++; // 跳过 ts 地址
  //     }

  //     if (line.startsWith('#EXT-X-DISCONTINUITY')) {
  //       if (n === 5) {
  //         logger.info(`广告位置: ${k1}`);
  //         logger.info(`数据条数: ${n}`);
  //         logger.info(`数据种类: ${m}`);
  //         logger.info(`广告时间: ${t.toFixed(5)}`);
  //         lines.splice(k1, 2 * n + 1);
  //         i = i - 2 * n + 1;
  //       }

  //       // reset
  //       n = m = t = 0;
  //       s2 = '';
  //     }
  //   }
  // }

  // 寻找首片段和尾片段
  let firstSegment = '';
  let maxPrefixLen = 0;
  // let firstCandidate = '';
  let secondCandidate = '';
  let count1 = 1;
  let count2 = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('#')) {
      if (!firstSegment) {
        firstSegment = line;
      } else {
        const prefixLen = commonPrefixLength(firstSegment, line);
        if (maxPrefixLen > prefixLen + 1) {
          if (secondCandidate.length < 5) secondCandidate = line;
          count2++;
        } else {
          maxPrefixLen = prefixLen;
          count1++;
        }
      }
      if (count1 + count2 >= 30) break;
    }
  }

  if (count2 > count1) firstSegment = secondCandidate;
  const firstLen = firstSegment.length;
  const middleLen = Math.round(lines.length / 2).toString().length;

  const lastSegment = lines
    .slice()
    .reverse()
    .find((line: string) => {
      if (!line.startsWith('#')) {
        const revMatch = commonPrefixLength(reverseString(firstSegment), reverseString(line));
        maxPrefixLen = commonPrefixLength(firstSegment, line);
        return firstLen - maxPrefixLen <= middleLen + revMatch || maxPrefixLen > 10;
      }
      return false;
    });
  logger.info(`最后一条切片：${lastSegment}`);

  // 移除广告 URL
  const adUrls: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('#')) {
      if (commonPrefixLength(firstSegment, line) < maxPrefixLen) {
        adUrls.push(line);
        lines.splice(i - 1, 2);
        i -= 2;
      } else {
        lines[i] = urlResolve(m3u8Url, line);
      }
    } else {
      lines[i] = line.replace(/URI="(.*)"/, (_, u) => `URI="${urlResolve(m3u8Url, u)}"`);
    }
  }

  logger.info(`处理的 m3u8 地址: ${m3u8Url}`);
  logger.info('----广告地址----');
  logger.info(`发现广告地址:\n${adUrls.join('\n')}`);

  const result = lines.join('\n');
  logger.info(`处理耗时: ${Date.now() - startTime}ms`);
  logger.silly(`最终分片:\n${result}`);

  return result;
};
