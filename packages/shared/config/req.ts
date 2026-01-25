export const REQ_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;
export type IReqMethod = (typeof REQ_METHOD)[keyof typeof REQ_METHOD];
export const reqMethods = Object.values(REQ_METHOD);

export const REQ_CONTENT_TYPE = {
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  FORM_DATA: 'multipart/form-data',
  JSON: 'application/json',
  XML: 'application/xml',
  TEXT: 'text/plain',
} as const;
export type IReqContentType = (typeof REQ_CONTENT_TYPE)[keyof typeof REQ_CONTENT_TYPE];
export const reqContentTypes = Object.values(REQ_CONTENT_TYPE);

export const REQ_ENCODE = {
  GB18030: 'GB18030',
  GB2312: 'GB2312',
  GBK: 'GBK',
  UTF8: 'UTF-8',
} as const;
export type IReqEncode = (typeof REQ_ENCODE)[keyof typeof REQ_ENCODE];
export const reqEncodes = Object.values(REQ_ENCODE);

export interface IReqOptions {
  url: string;
  method: IReqMethod;
  encode: IReqEncode;
  headers: Record<string, any> | string;
  params: Record<string, any> | string;
  data: Record<string, any> | string;
  timeout: number;
}

export interface IReqResponse {
  code: number;
  headers: Record<string, any>;
  data: any;
}
