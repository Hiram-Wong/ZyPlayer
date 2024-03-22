import syncFetch from 'sync-fetch';
import cache from './cache';
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
    console.log(requestOptions)
    r = syncFetch(_url, requestOptions);
  }
  const emptyResult: Response = { content: '', body: '', headers: {} };

  if (_js_type === 0) {
    if (withHeaders) {
      return { body: r.text(), headers: r.headers } || emptyResult;
    } else {
      return r.text() || '';
    }
  } else if (_js_type === 1) {
    let content
    if (bufferType === 2) {
      content = Buffer.from(r.arrayBuffer(), 'binary').toString('base64');
    } else content = r.text();
    return { content, headers: r.headers } || emptyResult;
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

// const pdfl = (html: string, rule: string, list_text: string, urlKey: string) => {
//   const jsp = new jsoup();
//   return jsp.pdfa(html, parse);
// }

const local_get = (_id, key, value='') => {
  return cache.get(_id, key, value);
}

const local_set = (_id, key, value) => {
  return cache.set(_id, key, value);
}

const local_delete = (_id, key) => {
  return cache.delete(_id, key);
}

const local = {
  'get': local_get,
  'set': local_set,
  'delete': local_delete
}

export { pdfh, pdfa, pd, local , req, joinUrl }