import type { ISnifferOptions } from '@main/services/CdpElectron';
import { CdpElectron } from '@main/services/CdpElectron';
import { dbService } from '@main/services/DbService';
import { request } from '@main/utils/request';
import { getTimeout } from '@main/utils/tool';
import { SNIFFER_TYPE } from '@shared/config/setting';
import { base64 } from '@shared/modules/crypto';
import { headersPascalCase } from '@shared/modules/headers';
import { isObject, isObjectEmpty, isStrEmpty, isString } from '@shared/modules/validate';

export interface ISnifferMediaResult {
  url: string;
  headers?: Record<string, any>;
}

const cdpSnifferMediaToStandard = async (url: string, options: ISnifferOptions = {}): Promise<ISnifferMediaResult> => {
  const cdp = new CdpElectron();
  const resp = await cdp.snifferMedia(url, options);
  return { url: resp.url, headers: headersPascalCase(resp?.headers || {}) };
};

const customSnifferMediaToStandard = async (
  snifferUrl: string,
  url: string,
  options: ISnifferOptions = {},
): Promise<ISnifferMediaResult> => {
  const { data: resp } = await request.request({
    url: snifferUrl,
    method: 'GET',
    params: {
      url,
      timeout: getTimeout(options.timeout),
      ...(isObject(options.headers) && !isObjectEmpty(options.headers)
        ? { headers: options.headers.map(([key, value]) => `${key}:${value}`).join('\n') }
        : {}),
      ...(isString(options.runScript) && !isStrEmpty(options.runScript)
        ? { script: base64.encode({ src: options.runScript }) }
        : {}),
      ...(isString(options.initScript) && !isStrEmpty(options.initScript)
        ? { init_script: base64.encode({ src: options.initScript }) }
        : {}),
      ...(isString(options.customRegex) && !isStrEmpty(options.customRegex)
        ? { custom_regex: options.customRegex }
        : {}),
      ...(isString(options.snifferExclude) && !isStrEmpty(options.snifferExclude)
        ? { sniffer_exclude: options.snifferExclude }
        : {}),
    },
  });
  return { url: resp?.data?.url || '', headers: headersPascalCase(resp?.data?.headers || {}) };
};

export const snifferMediaToStandard = async (
  url: string,
  options: ISnifferOptions = {},
): Promise<ISnifferMediaResult> => {
  let res: ISnifferMediaResult = { url: '', headers: {} };

  const ext = await dbService.setting.getValue('sniffer');

  switch (ext.type) {
    case SNIFFER_TYPE.CDP: {
      res = await cdpSnifferMediaToStandard(url, options);
      break;
    }
    case SNIFFER_TYPE.CUSTOM: {
      res = await customSnifferMediaToStandard(ext.url, url, options);
      break;
    }
  }

  return res;
};
