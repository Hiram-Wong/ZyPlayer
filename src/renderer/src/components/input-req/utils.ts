import type { IReqContentType, IReqOptions, IReqResponse } from '@shared/config/req';
import { REQ_CONTENT_TYPE, REQ_METHOD } from '@shared/config/req';
import { headerKeysPascalCase } from '@shared/modules/headers';
import { isHttp, isJsonStr, isObject, isObjectEmpty } from '@shared/modules/validate';
import JSON5 from 'json5';

export type IReqConfig = Omit<IReqOptions, 'timeout' | 'params'> & { contentType: IReqContentType };

import { systemInitiateReq } from '@/api/system';

export const parseReqOptions = (
  options: Partial<IReqConfig>,
): { headers: Record<string, any>; data?: Record<string, any> | string } => {
  const {
    method = REQ_METHOD.GET,
    headers: headersRaw = '{}',
    data: dataRaw = '{}',
    contentType = REQ_CONTENT_TYPE.JSON,
  } = options;
  const headers = isObject(headersRaw) ? headersRaw : isJsonStr(headersRaw) ? JSON5.parse(headersRaw) : {};
  const headerKeys = headerKeysPascalCase(headers);
  const body: Record<string, any> = isObject(dataRaw) ? dataRaw : isJsonStr(dataRaw) ? JSON5.parse(dataRaw) : {};

  const upperMethod = method.toUpperCase();
  let data: Record<string, any> | string = {};

  const supportNoBody = upperMethod === REQ_METHOD.GET || upperMethod === REQ_METHOD.HEAD;
  const hasBody = body && isObject(body) && !isObjectEmpty(body);

  if (!supportNoBody && hasBody) {
    data = body;

    if (!headerKeys.includes('Content-Type')) {
      headers['Content-Type'] = contentType;
    }

    if (headers['Content-Type'].includes(REQ_CONTENT_TYPE.FORM_URLENCODED)) {
      data = new URLSearchParams(body).toString();
    }
  }

  if (!headerKeys.includes('Accept')) {
    headers.Accept = '*/*';
  }

  return { headers, ...(isObjectEmpty(data) ? {} : { data }) };
};

export const handleReq = async (options: Partial<IReqConfig>): Promise<IReqResponse> => {
  const { url, method, encode, headers: headersRaw, data: dataRaw, contentType } = options;
  if (!isHttp(url)) return { code: 400, headers: {}, data: '' };

  const { headers, data } = parseReqOptions({ method, headers: headersRaw, data: dataRaw, contentType });
  const resp = await systemInitiateReq({ url, method, encode, headers, data });
  return resp;
};
