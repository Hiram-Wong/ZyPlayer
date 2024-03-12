import jsoup from './htmlParser';
import superagent from 'superagent';
import indexDbCahe from './cache';

interface RequestOptions {
  method?: string;
  timeout?: number;
  body?: string;
  data?: { [key: string]: string };
  headers?: { [key: string]: string };
  withHeaders?: boolean;
}


const baseRequest = (url: string, options: RequestOptions, jsType: number = 0): Promise<string | any> => {
  const { method = 'get', timeout = 5000, body = '', data = {}, headers = {}, withHeaders = false } = options;
    
  let request: superagent.SuperAgentRequest;
  switch (method.toLowerCase()) {
    case 'get':
      request = superagent.get(url).query(data);
      break;
    case 'post':
      request = superagent.post(url).send(data);
      break;
    case 'put':
      request = superagent.put(url).send(data);
      break;
    case 'delete':
      request = superagent.delete(url).send(data);
      break;
    case 'head':
      request = superagent.head(url).send(data);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }

  request.timeout(timeout);

  Object.entries(headers).forEach(([key, value]) => {
    request.set(key, value);
  });

  return request.then((response: superagent.Response) => {
    const { text, headers } = response;
    if (withHeaders && jsType === 0) {
      return { body: text, headers };
    } else if (!withHeaders && jsType === 0) {
      return text;
    } else if (jsType === 1) {
      return { content: text, headers };
    } else {
      return { content: '', body: '', headers: {} };
    }
  }).catch((error: superagent.ResponseError) => {
    throw new Error(error.message);
  });
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