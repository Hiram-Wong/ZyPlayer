import { request } from '@main/utils/request';
import type { IAnalyzeType } from '@shared/config/parse';
import { ANALYZE_TYPE } from '@shared/config/parse';
import { isObject, isObjectEmpty, isStrEmpty, isString } from '@shared/modules/validate';
import { JSONPath } from 'jsonpath-plus';

import { snifferMediaToStandard } from '../../system/utils/sniffer';

interface IParseResult {
  url: string;
  headers: Record<string, any>;
}

const jsonToStandard = async (url: string, headers: Record<string, any>): Promise<IParseResult> => {
  const { data: resp } = await request.request({
    url,
    method: 'GET',
    ...(isObject(headers) && !isObjectEmpty(headers) ? { headers } : {}),
  });
  const parsedUrl = JSONPath({ path: '$.url', json: resp })?.[0];
  const parsedHeaders =
    JSONPath({ path: '$.headers', json: resp })?.[0] || JSONPath({ path: '$.header', json: resp })?.[0] || {};

  return {
    url: parsedUrl,
    headers: parsedHeaders,
  };
};

const webToStandard = async (url: string, headers: Record<string, any>, script?: string): Promise<IParseResult> => {
  const resp = await snifferMediaToStandard(url, {
    headers,
    ...(isString(script) && !isStrEmpty(script) ? { runScript: script } : {}),
  });

  return {
    url: resp.url,
    headers: resp.headers || {},
  };
};

export const convertToStandard = async (
  url: string,
  type: IAnalyzeType,
  headers: Record<string, any> = {},
  script: string = '',
): Promise<IParseResult> => {
  let res = { url: '', headers: {} };

  switch (type) {
    case ANALYZE_TYPE.JSON: {
      res = await jsonToStandard(url, headers);
      break;
    }
    case ANALYZE_TYPE.WEB: {
      res = await webToStandard(url, headers, script);
      break;
    }
  }

  return res;
};
