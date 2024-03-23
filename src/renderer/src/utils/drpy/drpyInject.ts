import syncFetch from 'sync-fetch';
import jsoup from './htmlParser';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

interface RequestOptions {
  method?: HttpMethod;
  timeout?: number;
  body?: string;
  data?: { [key: string]: string };
  headers?: { [key: string]: string };
  withHeaders?: boolean;
  buffer?: number;
}

interface Response {
  content?: string;
  body?: string;
  headers?: { [key: string]: string };
}

const baseRequest = (_url: string, _object: RequestOptions, _js_type: number = 0): Response => {
  const method: HttpMethod = (_object.method || 'GET').toUpperCase() as HttpMethod;
  // const timeout: number = _object.timeout || 5000;
  const withHeaders: boolean = _object.withHeaders || false;
  const body: string = _object.body || '';
  const bufferType: number = _object.buffer || 0;
  let data: { [key: string]: string } = _object.data || {};

  if (body && !data) {
    data = {};
    body.split('&').forEach((param) => {
      const [key, value] = param.split('=');
      data[key] = value;
    });
  }

  const headers = _object.headers || {};

  const customHeaders = {
    'Cookie': 'custom-cookie',
    'User-Agent': 'custom-ua',
    'Referer': 'custom-referer',
  };
  
  for (const [originalHeader, customHeader] of Object.entries(customHeaders)) {
    if (headers.hasOwnProperty(originalHeader)) {
      headers[customHeader] = headers[originalHeader];
      delete headers[originalHeader];
    }
  }

  let r: any;

  if (method === 'GET') {
    r = syncFetch(_url, {
      headers,
      parms: data,
      credentials: 'include'
    });
  } else {
    headers["Content-Type"] = "application/json"
    const requestOptions: any = {
      method,
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    };
    r = syncFetch(_url, requestOptions);
  }
  const emptyResult: Response = { content: '', body: '', headers: {} };

  const formatHeaders: { [key: string]: string } = {};

  // 遍历 Headers 对象
  for (const [key, value] of r.headers.entries()) {
    if (key.toLowerCase() === 'custom-set-cookie') {
      formatHeaders['set-cookie'] = value;
    } else {
      formatHeaders[key] = value;
    }
  }

  if (_js_type === 0) {
    if (withHeaders) {
      return { body: r.text(), headers: formatHeaders } || emptyResult;
    } else {
      return r.text() || '';
    }
  } else if (_js_type === 1) {
    let content;
    if (bufferType === 2) {
      // content = Buffer.from(r.arrayBuffer(), 'binary').toString('base64');
      const uint8Array = new Uint8Array(r.arrayBuffer()); // 将 ArrayBuffer 转换为一个 Uint8Array
      const buffer = Buffer.from(uint8Array); // 使用 Buffer.from 将 Uint8Array 转换为 Buffer
      const base64String = buffer.toString('base64'); // 将 Buffer 转换为 Base64 字符串
      content = base64String;
      console.log(base64String);
    } else content = r.text();
    return { content, headers: formatHeaders } || emptyResult;
  } else {
    return emptyResult;
  }
}

const req = (_url, _object) => {
  return baseRequest(_url, _object, 1);
}

const joinUrl = (base: string, url: string) => {
  base = base || '';
  url = url || '';
  base = base.trim().replace(/\/+$/, '');
  url = url.trim().replace(/\/+$/, '');
  console.log('joinUrl:', base, url)

  let u;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    u = new URL(url);
  } else if (url.startsWith('://')) {
    u = new URL(base + url);
  } else if (url.startsWith('//')) {
    u = new URL(base.startsWith('http:') ? 'http:' + url : 'https:' + url);
  } else {
    u = new URL(base + '/' + url);
  }

  if (!u.pathname && new URL(base).pathname) {
    u.pathname = new URL(base).pathname;
  }

  if (!u.search && new URL(base).search) {
    u.search = new URL(base).search;
  }

  return u.toString();
}

const pdfh = (html: string, parse: string, base_url: string = '') => {
  const jsp = new jsoup(base_url);
  return jsp.pdfh(html, parse, base_url);
}

const pd = (html: string, parse: string, base_url: string = '') => {
  const jsp = new jsoup(base_url);
  return jsp.pd(html, parse);
}

const pdfa = (html: string, parse: string) => {
  const jsp = new jsoup();
  return jsp.pdfa(html, parse);
}

const pdfl = (html: string, parse: string, list_text: string, list_url: string, url_key: string) => {
  const jsp = new jsoup();
  return jsp.pdfl(html, parse, list_text, list_url, url_key);
}

const CACHE_URL = String(import.meta.env.DEV ? '/api' : import.meta.env.VITE_APP_API_URL) + '/v1/cache';

const local_get = (_id: string, key: string, value: string = '') => {
  const url = `${CACHE_URL}/${_id}${key}`;
  const res: any = req(url, {});
  return JSON.parse(res.content).data || value;
}

const local_set = (_id, key, value) => {
  const headers = {
    method: 'POST',
    data: {
      key: `${_id}${key}`,
      value
    }
  };
  const res: any = req(CACHE_URL, headers);
  return JSON.parse(res.content).data;
}

const local_delete = (_id, key) => {
  const url = `${CACHE_URL}/${_id}${key}`;
  const headers = {
    method: 'DELETE'
  };
  const res: any = req(url, headers);
  return JSON.parse(res.content).data;
}

const local = {
  'get': local_get,
  'set': local_set,
  'delete': local_delete
}

export { pdfh, pdfa, pdfl, pd, local , req, joinUrl }