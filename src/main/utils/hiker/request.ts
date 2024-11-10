import syncRequest, { FormData } from 'sync-request';
import { Buffer } from 'buffer';
import mime from 'mime-types';
import fs from 'fs-extra';
import { MOBILE_UA, PC_UA } from './ua';
import { getHome, keysToLowerCase, parseQueryString } from './base';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

interface RequestOptions {
  method?: HttpMethod;
  timeout?: number;
  body?: { [key: string]: string } | string;
  headers?: { [key: string]: string };
  redirect?: 0 | 1 | boolean;
  toHex?: boolean;
  onlyHeaders?: boolean;
  withHeaders?: boolean;
  withStatusCode?: boolean;
}

const fetch = (url: string, options: RequestOptions = {}) => {
  try {
    const method: HttpMethod = (options.method || 'GET').toUpperCase() as HttpMethod;
    url = new URL(url).href;

    const toTitleCase = (str) => {
      return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
    };

    const headers = options?.headers || {};
    const headersInTitleCase = Object.keys(headers).reduce((obj, key) => {
      obj[toTitleCase(key)] = headers[key];
      return obj;
    }, {});

    const config = {
      headers: headersInTitleCase,
      timeout: options?.timeout || 5000,
      followRedirects: options?.redirect === false ? false : true,
    };

    if (!config.headers['User-Agent']) {
      config.headers['User-Agent'] = MOBILE_UA;
    }

    if (!config.headers['Referer']) {
      config.headers['Referer'] = getHome(url);
    }

    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(config.headers['Referer'])) {
      config.headers['Referer'] = new URL(config.headers['Referer']).href;
    }

    const contentType = config.headers?.['Content-Type'] || '';
    let charset: string = 'utf-8';

    if (contentType.includes('charset=')) {
      const matchRes = contentType.match(/charset=[\w-]+/);
      if (matchRes && matchRes.length > 0) {
        const charsetMatch = matchRes[0].match(/charset=([\w-]+)/);
        if (charsetMatch && charsetMatch.length > 1) {
          charset = charsetMatch[1];
        }
      }
    }
    if (method !== 'GET') {
      // 软件会自动将body请求体a=xx&b=1转成{a:xx,b:1}
      if (options?.body && typeof options?.body === 'string') {
        options.body = parseQueryString(options.body);
      }
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const fd = new FormData();
        Object.entries(options.body as { [key: string]: string }).forEach(([key, value]) => {
          fd.append(key, value);
        });
        config['form'] = fd;
      } else if (contentType.includes('multipart/form-data')) {
        const fd = new FormData();
        fd.append('file', fs.readFileSync(options.body as string), options.body as string);
        config['form'] = fd;
      } else {
        config['json'] = options.body;
      }
    }
    // 软件会自动加Content-Type添加application/json
    // if (!config.headers['content-type']) config['headers']['Content-Type'] = 'application/json';
    delete config.headers['Content-Type'];

    console.warn(`[request] url: ${url} | method: ${method} | options: ${JSON.stringify(config)}`);

    let res = syncRequest(method, url, config);
    // @ts-ignore 重写getBody函数, 否则300+请求码报错
    res.getBody = function (encoding: BufferEncoding | undefined) {
      return encoding ? this.body.toString(encoding) : this.body;
    };

    if (options?.onlyHeaders) {
      return res.headers;
    }
    if (options?.withHeaders) {
      return { headers: res.headers, body: res.getBody(charset) };
    }
    if (options?.withStatusCode) {
      return { headers: res.headers, body: res.getBody(charset), statusCode: res.statusCode };
    }
    if (options?.toHex) {
      return { headers: res.headers, body: Buffer.from(res.getBody()).toString('hex'), statusCode: res.statusCode };
    }
    return res.getBody(charset);
  } catch (err: any) {
    console.log(err);
    return null;
  }
};

const request = fetch;

const fetchCookie = (url: string, options: RequestOptions = {}) => {
  if (options?.withHeaders) delete options.withHeaders;
  if (options?.withStatusCode) delete options.withStatusCode;
  if (options?.toHex) delete options.toHex;
  options = Object.assign(options, { onlyHeaders: true });
  const header = fetch(url, options) as { [key: string]: string };
  const setCk = Object.keys(header).find((it) => it.toLowerCase() === 'set-cookie');
  const cookie = setCk ? header[setCk] : '';
  return cookie;
};

const post = (url: string, options: RequestOptions = {}) => {
  options = Object.assign(options, { method: 'POST' });
  return fetch(url, options);
};

const fetchPC = (url: string, options: RequestOptions = {}) => {
  options.headers = options?.headers || {};
  const headers = keysToLowerCase(options.headers);
  if (!headers['user-agent']) {
    options.headers['User-Agent'] = PC_UA;
  }
  return fetch(url, options);
};

const postPC = (url: string, options: RequestOptions = {}) => {
  options.headers = options?.headers || {};
  const headers = keysToLowerCase(options.headers);
  if (!headers['user-agent']) {
    options.headers['User-Agent'] = PC_UA;
  }
  return post(url, options);
};

const convertBase64Image = (url: string, options: RequestOptions = {}) => {
  try {
    if (options?.withHeaders) delete options.withHeaders;
    if (options?.withStatusCode) delete options.withStatusCode;
    if (options?.toHex) delete options.toHex;
    if (options?.onlyHeaders) delete options.onlyHeaders;
    options = Object.assign(options, { toHex: true });
    const res = fetch(url, options) as { body: string };
    const hexStr = res.body;
    const base64String = Buffer.from(hexStr, 'hex').toString('base64');
    return `data:${mime.lookup(url)};base64,${base64String}`;
  } catch (err) {
    console.log(err);
    return '';
  }
};

const batchFetch = (requests: any[], threads: number = 16) => {
  const results: any[] = [];
  const processBatch = (batchSize: number, index: number = 0) => {
    // 如果当前索引小于请求数组的长度，说明还有请求需要处理
    if (index < requests.length) {
      // 处理当前批次的请求
      const batch = requests.slice(index, index + batchSize);
      for (const request of batch) {
        try {
          const response = fetch(request.url, request.options);
          results.push(response);
        } catch (err: any) {
          results.push(`Request to ${request.url} failed: ${err.message}`);
        }
      }
      // 递归处理下一批请求
      processBatch(batchSize, index + batchSize);
    }
  };

  // 根据请求总数决定批次大小，超过16个请求则分批处理
  const batchSize = requests.length > threads ? threads : requests.length;
  processBatch(batchSize);
  return results;
};

const bf = batchFetch;

export { fetch, request, fetchCookie, post, fetchPC, postPC, convertBase64Image, batchFetch, bf };
