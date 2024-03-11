import jsoup from './htmlParser';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import urlJoin from 'url-join';
import localCahe from './cache';

interface BaseRequestObject {
  method?: string;
  timeout?: number;
  body?: string;
  data?: Record<string, any>;
  headers?: Record<string, string>;
  withHeaders?: boolean;
}

interface BaseRequestResult {
  content: string;
  body: string;
  headers: Record<string, string>;
}

const baseRequest = (url: string, requestObject: BaseRequestObject, jsType: number = 0): string | BaseRequestResult => {
  let object: BaseRequestObject = requestObject;
  if (!(object instanceof Object) && jsType === 0) {
    object = JSON.parse(object);
  } else if (jsType === 1) {
    object = { ...object };
  }

  const method: string = (object.method || 'get').toLowerCase();
  const timeout: number = object.timeout || 5;
  const body: string = object.body || '';
  let data: Record<string, any> = object.data || {};
  if (body && !data) {
    data = {};
    for (const p of body.split('&')) {
      const [k, v] = p.split('=');
      data[k] = v;
    }
  }
  let headers: Record<string, string> = object.headers || {};

  // 修复pythonmonkey没有自动把 JSObjectProxy 转为 TypeScript 的对象导致的后续错误
  data = { ...data };
  headers = { ...headers };

  const withHeaders: boolean = Boolean(object.withHeaders || false);

  const config: AxiosRequestConfig = {
    method,
    url,
    params: method === 'get' ? data : undefined,
    data: method !== 'get' ? data : undefined,
    headers,
    timeout,
    validateStatus: () => true, // 避免抛出错误状态的异常
    responseType: 'text', // 以文本形式接收响应
  };

  return new Promise<string | BaseRequestResult>((resolve) => {
    axios(config)
      .then((response: AxiosResponse) => {
        const emptyResult: BaseRequestResult = { content: '', body: '', headers: {} };
        if (withHeaders && jsType === 0) {
          const result: BaseRequestResult = {
            body: response.data,
            headers: response.headers,
          };
          resolve(JSON.stringify(result));
        } else if (!withHeaders && jsType === 0) {
          resolve(response.data);
        } else if (jsType === 1) {
          const result: BaseRequestResult = {
            content: response.data,
            headers: response.headers,
          };
          resolve(result);
        } else {
          resolve(emptyResult);
        }
      })
      .catch(() => {
        const emptyResult: BaseRequestResult = { content: '', body: '', headers: {} };
        resolve(emptyResult);
      });
  });
}

const fetch = (_url, _object) => {
  return baseRequest(_url, _object, 0);
}

const req = (_url, _object) => {
  return baseRequest(_url, _object, 1);
}

const redirect = (_url: string) => {
  if(_url.startsWith('http')) return `redirect://${_url}`
  else return `${_url}`
}

const toast = (_url: string) => {
  return `toast://${_url}`
}

const image = (_text: string) => {
  return `image://${_text}`
}

const initContext = (ctx, url, prefixCode, env, getParams, getCryptoJS) => {
  ctx.callableMap.set('getParams', getParams);
  ctx.callableMap.set('log', console.log);
  ctx.callableMap.set('print', console.log);
  ctx.callableMap.set('fetch', fetch);
  ctx.callableMap.set('urljoin', urlJoin);
  ctx.eval(`const console = { log };`);
  ctx.callableMap.set('getCryptoJS', getCryptoJS);

  const jsp = new jsoup(url);
  ctx.callableMap.set('pdfh', jsp.pdfh);
  ctx.callableMap.set('pdfa', jsp.pdfa);
  ctx.callableMap.set('pd', jsp.pd);
  ctx.eval("var jsp = { pdfh, pdfa, pd };");

  ctx.callableMap.set('local_set', localStorage.setItem);
  ctx.callableMap.set('local_get', localStorage.getItem);
  ctx.callableMap.set('local_delete', localStorage.removeItem);
  ctx.eval("const local = { get: local_get, set: local_set, delete: local_delete };");
  ctx.callableMap.set('重定向', redirect);
  ctx.callableMap.set('toast', toast);
  ctx.callableMap.set('image', image);

  const setValues: Record<string, any> = {
    vipUrl: url,
    realUrl: '',
    input: url,
    fetch_params: { headers: { Referer: url }, timeout: 10, encoding: 'utf-8' },
    env: env,
    params: getParams(),
  };

  for (const [key, value] of Object.entries(setValues)) {
    if (typeof value === 'object' && value !== null) {
      ctx.eval(`var ${key} = ${JSON.stringify(value)}`);
    } else {
      ctx.values[key] = value;
    }
  }

  ctx.eval(prefixCode);
  return ctx;
}

const initGlobalThis = (ctx) => {
  let globalThis = ctx.eval("globalThis;")
  const _url = 'https://www.baidu.com'
  globalThis.fetch_params = {'headers': {'Referer': _url}, 'timeout': 10, 'encoding': 'utf-8'}
  globalThis.log = print;
  globalThis.print = print;
  globalThis.req = req;

  const pdfh = (html, parse: string, base_url: string = '') => {
    const jsp = new jsoup(base_url);
    return jsp.pdfh(html, parse, base_url);
  }

  const pd = (html, parse: string, base_url: string = '') => {
    const jsp = new jsoup(base_url);
    return jsp.pd(html, parse);
  }

  const pdfa = (html, parse: string) => {
    const jsp = new jsoup();
    return jsp.pdfa(html, parse);
  }

  const local_get = (_id, key, value='') => {
    console.log('local_get:', _id, key, value)
    return localStorage.getItem(key);
  }

  const local_set = (_id, key, value) => {
    return localStorage.setItem(key, value);
  }

  const local_delete = (_id, key) => {
    return localStorage.removeItem(key);
  }

  globalThis.pdfh = pdfh;
  globalThis.pdfa = pdfa;
  globalThis.pd = pd;
  globalThis.joinUrl = urlJoin;
  globalThis.local = {
    'get': local_get, 'set': local_set, 'delete': local_delete
  };
  return globalThis;
}


const pdfh = (html, parse: string, base_url: string = '') => {
  const jsp = new jsoup(base_url);
  return jsp.pdfh(html, parse, base_url);
}

const pd = (html, parse: string, base_url: string = '') => {
  const jsp = new jsoup(base_url);
  return jsp.pd(html, parse);
}

const pdfa = (html, parse: string) => {
  const jsp = new jsoup();
  return jsp.pdfa(html, parse);
}

const local_get = (_id, key, value='') => {
  console.log('local_get:', _id, key, value);
  return localCahe.get(_id, key, value);
  // return localStorage.getItem(`${_id}$${key}`);
}

const local_set = (_id, key, value) => {
  return localCahe.set(_id, key, value);
  // return localStorage.setItem(`${_id}$${key}`, value);
}

const local_delete = (_id, key) => {
  return localCahe.delete(_id, key);
  // return localStorage.removeItem(`${_id}$${key}`);
}

const local = {
  'get': local_get,
  'set': local_set,
  'delete': local_delete
}

export { pdfh, pdfa, pd, local , req }