import { Buffer } from 'node:buffer';

import { pd, pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import { batchFetch, fetch } from '@main/utils/hiker/request';
import { CacheService } from '@shared/modules/cache';
import { headersPascalCase, urlResolve } from '@shared/modules/headers';

/**
 * 检查对象中是否存在指定的属性，忽略大小写
 * @param obj - 要检查的对象
 * @param propertyName - 要检查的属性名
 * @returns 如果对象中存在指定的属性，则返回 true；否则返回 false。
 */
const hasPropertyIgnoreCase = (obj: Record<string, string>, propertyName: string) => {
  return Object.keys(obj).some((key) => key.toLowerCase() === propertyName.toLowerCase());
};

/**
 * 检查对象中是否存在指定的属性，并且该属性的值以指定的前缀开头，忽略大小写
 * @param obj - 要检查的对象
 * @param propertyName - 要检查的属性名
 * @param prefix - 要检查的属性值的前缀
 * @returns 如果对象中存在指定的属性，并且该属性的值以指定的前缀开头，则返回 true；否则返回 false。
 */
const valueStartsWith = (obj: Record<string, string>, propertyName: string, prefix: string) => {
  const key = Object.keys(obj).find((key) => key.toLowerCase() === propertyName.toLowerCase());
  return key !== undefined && obj[key].startsWith(prefix);
};

const req = (url: string, cobj: Record<string, any>): { content: string; headers?: Record<string, string> } => {
  const obj = Object.assign({}, cobj);

  if (obj.data) {
    obj.body = obj.data;
    const isForm =
      obj.postType === 'form' ||
      (hasPropertyIgnoreCase(obj.headers, 'Content-Type') &&
        valueStartsWith(obj.headers, 'Content-Type', 'application/x-www-form-urlencoded'));

    if (isForm) {
      obj.body = new URLSearchParams(obj.data).toString();
    }
    delete obj.data;
  }

  if (Object.hasOwn(obj, 'redirect')) obj.redirect = !!obj.redirect;
  if (obj.buffer === 2) obj.toHex = true;

  if (url === 'https://api.nn.ci/ocr/b64/text' && obj.headers) {
    obj.headers['Content-Type'] = 'text/plain';
  }
  obj.headers = headersPascalCase(obj.headers);

  const res: { content: string; headers?: Record<string, string> } = { content: '' };
  let resp: any = fetch(url, obj);
  if (obj.withHeaders) {
    resp = JSON.parse(resp!);
    res.content = resp.body;
    res.headers = Object.fromEntries(Object.entries(resp.headers || {}).map(([k, v]) => [k, v?.[0]]));
  } else {
    res.content = resp!;
  }

  if (obj.buffer === 2) {
    res.content = Buffer.from(resp!.body, 'hex').toString('base64');
  }

  return res;
};

const local = (() => {
  const localKey = 'drpy';
  return {
    get: (rulekey: string, key: string, value: any = '') => {
      const res = CacheService.get(`${localKey}@${rulekey}@${key}`);
      return res || value;
    },
    set: (rulekey: string, key: string, value: any) => {
      const res = CacheService.set(`${localKey}@${rulekey}@${key}`, value);
      return res;
    },
    delete: (rulekey: string, key: string) => {
      const res = CacheService.remove(`${localKey}@${rulekey}@${key}`);
      return res;
    },
  };
})();

const joinUrl = urlResolve;

export { batchFetch, joinUrl, local, pd, pdfa, pdfh, req };
