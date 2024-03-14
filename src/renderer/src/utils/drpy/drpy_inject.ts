import syncRequest from 'sync-request';
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

const fetch = (_url, _object) => {
  return baseRequest(_url, _object, 0);
}

const req = (_url, _object) => {
  console.log('req', _url, _object);
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

const pdfl = (html: string, rule: string, list_text: string, urlKey: string) => {
  const jsp = new jsoup();
  return jsp.pdfa(html, parse);
}

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