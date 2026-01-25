import { pathExist, readFile } from '@main/utils/file';
import { request } from '@main/utils/request';
import type { IIptvType } from '@shared/config/live';
import { IPTV_TYPE } from '@shared/config/live';
import { isHttp, isNil, isStrEmpty } from '@shared/modules/validate';

interface IChannelItem {
  name: string;
  api: string;
  logo?: string;
  group?: string;
  playback?: string;
}

type ICatchupMode = 'append' | 'shift' | 'default' | '';

interface ICatchupConfig {
  mode: ICatchupMode;
  source: string;
}

/**
  1. 默认回看参数
  检测播放连接中是否存在【PLTV】或【TVOD】两个字符，若存在则会自动拼接下面的回看参数
  ?playseek=${(b)yyyyMMddHHmmss}-${(e)yyyyMMddHHmmss}
  2. 针对整个M3U文件设置回看参数
  #EXTM3U catchup="append" catchup-source="?playbackbegin=${(b)yyyyMMddHHmmss}&playbackend=${(e)yyyyMMddHHmmss}"
  3. 如何对单个频道设置回看参数
  #EXTINF:-1 catchup="append" catchup-source="?playseek=${(b)yyyyMMddHHmmss}-${(e)yyyyMMddHHmmss}",CCTV1
 */

/**
 * Parsing IPTV M3U Text as an Array of Channel Objects
 *
 * @param text - IPTV M3U content (string)
 * @returns The parsed channel array
 *
 * @example
 * ```ts
 * const txt = `
 * #EXTM3U x-tvg-url="https://live.fanmingming.cn/e.xml"
 * #EXTINF:-1 tvg-name="CCTV1" tvg-logo="https://live.fanmingming.cn/tv/CCTV1.png" group-title="CCTV",CCTV-1
 * http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236222/index.m3u8
 * #EXTINF:-1 tvg-name="CCTV2" tvg-logo="https://live.fanmingming.cn/tv/CCTV2.png" group-title="CCTV",CCTV-2
 * http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236393/index.m3u8
 * `
 *
 * const result = parseIptvM3u(txt)
 * // result:
 * // [
 * //   { name: 'CCTV1', url: 'http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236222/index.m3u8', group: 'CCTV' },
 * //   { name: 'CCTV2', url: 'http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236393/index.m3u8', group: 'CCTV' }
 * // ]
 * ```
 */
const m3uToStandard = (text: string): IChannelItem[] => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,\s*(.+)/;
  const CATCHUP = /.*catchup="(.+?)"/i;
  const CATCHUP_SOURCE = /.*catchup-source="(.+?)"/i;

  const docs: IChannelItem[] = [];
  let current: Partial<IChannelItem> = {};
  let currentCatchup: Partial<ICatchupConfig> = {};
  let globalCatchup: Partial<ICatchupConfig> = {};

  const resolveCatchup = (url: string): string => {
    if (url.includes('PLTV') || url.includes('TVOD')) {
      return `append-?playseek=\${(b)yyyyMMddHHmmss}-\${(e)yyyyMMddHHmmss}`;
    }
    if (currentCatchup.mode) {
      return `${currentCatchup.mode}-${currentCatchup.source}`;
    }
    if (globalCatchup.mode) {
      return `${globalCatchup.mode}-${globalCatchup.source}`;
    }
    return '';
  };

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:-1')) {
      current = {
        name: line.match(NAME)?.[1]?.trim() ?? '',
        logo: line.match(LOGO)?.[1]?.trim(),
        group: line.match(GROUP)?.[1]?.trim(),
      };

      currentCatchup = {
        mode: (line.match(CATCHUP)?.[1]?.trim() as ICatchupMode) ?? '',
        source: line.match(CATCHUP_SOURCE)?.[1]?.trim() ?? '',
      };
    } else if (isHttp(line)) {
      current.api = line;
      current.playback = resolveCatchup(line);

      docs.push(current as IChannelItem);

      // reset
      current = {};
      currentCatchup = {};
    } else if (line.startsWith('#EXTM3U')) {
      globalCatchup = {
        mode: (line.match(CATCHUP)?.[1]?.trim() as ICatchupMode) ?? '',
        source: line.match(CATCHUP_SOURCE)?.[1]?.trim() ?? '',
      };
    }
  }

  return docs;
};

/**
 * Parsing IPTV TXT Text as an Array of Channel Objects
 *
 * @param text - IPTV txt content (string)
 * @returns The parsed channel array
 *
 * @example
 * ```ts
 * const txt = `
 * CCTV,#genre#
 * CCTV1,http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236222/index.m3u8
 * CCTV2,http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236393/index.m3u8
 * `
 *
 * const result = parseIptvTxt(txt)
 * // result:
 * // [
 * //   { name: 'CCTV1', url: 'http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236222/index.m3u8', group: 'CCTV' },
 * //   { name: 'CCTV2', url: 'http://hwltc.tv.cdn.zj.chinamobile.com/PLTV/88888888/224/3221236393/index.m3u8', group: 'CCTV' }
 * // ]
 * ```
 */
const txtToStandard = (text: string): IChannelItem[] => {
  if (isStrEmpty(text)) return [];

  const docs: IChannelItem[] = [];
  let currentGroup = '';

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || !line.includes(',')) continue;

    const [first = '', second = ''] = line.split(',', 2).map((s) => s.trim());
    if (!first || !second) continue;

    if (second === '#genre#') {
      currentGroup = first;
    } else if (isHttp(second)) {
      docs.push({ name: first, api: second, group: currentGroup });
    }
  }

  return docs;
};

/**
 * Parsing IPTV Channel
 * @param path -  remote url / local path / text
 * @param type - 1: remote 2: local 3: manual
 * @returns Parsed channel
 */
export const convertToStandard = async (path: string, type: IIptvType): Promise<IChannelItem[]> => {
  let content: string | null = null;

  switch (type) {
    case IPTV_TYPE.REMOTE: {
      try {
        const { data: resp } = await request.request({ url: path, method: 'GET', responseType: 'text' });
        content = resp;
      } catch {
        content = null;
      }
      break;
    }
    case IPTV_TYPE.LOCAL: {
      if (await pathExist(path)) content = await readFile(path);
      break;
    }
    case IPTV_TYPE.MANUAL: {
      content = path;
      break;
    }
  }
  if (isNil(content) || isStrEmpty(content)) return [];

  const list = content.includes('#EXTM3U') ? m3uToStandard(content) : txtToStandard(content);

  return list;
};
