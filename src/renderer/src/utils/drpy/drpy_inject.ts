import syncRequest from 'sync-request';
// import syncFetch from 'sync-fetch';
// import $ from 'jquery';
// import superagent from 'superagent';
import indexDbCahe from './cache';
import jsoup from './htmlParser';


interface RequestOptions {
  method?: string;
  timeout?: number;
  body?: string;
  data?: { [key: string]: string };
  headers?: { [key: string]: string };
  withHeaders?: boolean;
}

interface Response {
  content: string;
  body: string;
  headers: { [key: string]: string };
}

function baseRequest(_url: string, _object: RequestOptions, _js_type: number = 0): Response {
  let response: syncRequest.Response | null = null;

  const method = (_object.method || 'get').toLowerCase();
  const timeout = _object.timeout || 5000; // default timeout 5 seconds
  const body = _object.body || '';
  let data = _object.data || {};
  if (body && !data) {
    data = {};
    body.split('&').forEach((param) => {
      const [key, value] = param.split('=');
      data[key] = value;
    });
  }
  const headers = _object.headers || {};

  let r: syncRequest.Request;

  if (method === 'get') {
    r = syncRequest(method, _url, {
      headers,
      qs: data,
      timeout,
    });
  } else {
    const requestOptions: any = {
      headers,
      timeout,
    };
    if (method === 'post' || method === 'put' || method === 'delete' || method === 'head') {
      requestOptions.body = data;
    }
    r = syncRequest(method, _url, requestOptions);
  }

  const emptyResult: Response = { content: '', body: '', headers: {} };

  if (_js_type === 0) {
    const result: Response = {
      content: r.getBody('utf8'),
      body: r.getBody('utf8'),
      headers: r.headers,
    };

    if (_object.withHeaders) {
      return result;
    } else {
      return { content: result.content, body: result.body, headers: {} };
    }
  } else {
    return { content: r.getBody('utf8'), body: r.getBody('utf8'), headers: r.headers };
  }
}

const req = (_url, _object) => {
  console.log('req', _url, _object);
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
  console.log('local_get:', _id, key, value);
  return indexDbCahe.get(_id, key, value);
}

const local_set = (_id, key, value) => {
  return indexDbCahe.set(_id, key, value);
}

const local_delete = (_id, key) => {
  return indexDbCahe.delete(_id, key);
}

const local = {
  'get': local_get,
  'set': local_set,
  'delete': local_delete
}

export { pdfh, pdfa, pd, local , req, joinUrl }