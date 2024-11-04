/*!
 * @module drpyInject
 * @brief T3网络请求、缓存模块处理库
 * @version 3.1.8
 *
 * @original-author hjdhnx
 * @original-source {@link https://github.com/hjdhnx/hipy-server/blob/master/app/utils/quickjs_ctx.py | Source on GitHub}
 *
 * @modified-by HiramWong <admin@catni.cn>
 * @modification-date 2024-10-25T01:56:19+08:00
 * @modification-description Python转TypeScript, 适用于JavaScript项目
 *
 * **事件说明**:
 * - 网络请求库
 *   - sync-fetch可以在渲染进程-worker线程运行
 *   - sync-request可以在主进程-fork线程运行
 */

import { fetch } from '@main/utils/hiker/request';
import { storage0 } from '@main/utils/hiker/store';

/**
 * 检查对象中是否存在指定的属性，忽略大小写
 * @param obj - 要检查的对象
 * @param propertyName - 要检查的属性名
 * @returns 如果对象中存在指定的属性，则返回 true；否则返回 false。
 */
const hasPropertyIgnoreCase = (obj: { [key: string]: string }, propertyName: string) => {
  return Object.keys(obj).some((key) => key.toLowerCase() === propertyName.toLowerCase());
};

/**
 * 检查对象中是否存在指定的属性，并且该属性的值以指定的前缀开头，忽略大小写
 * @param obj - 要检查的对象
 * @param propertyName - 要检查的属性名
 * @param prefix - 要检查的属性值的前缀
 * @returns 如果对象中存在指定的属性，并且该属性的值以指定的前缀开头，则返回 true；否则返回 false。
 */
const valueStartsWith = (obj: { [key: string]: string }, propertyName: string, prefix: string) => {
  const key = Object.keys(obj).find((key) => key.toLowerCase() === propertyName.toLowerCase());
  return key !== undefined && obj[key].startsWith(prefix);
};

const req = (url: string, cobj: any) => {
  try {
    let res = {};
    let obj = Object.assign({}, cobj);
    if (obj.data) {
      obj.body = obj.data;
      if (
        (obj.postType && obj.postType == 'form') ||
        (hasPropertyIgnoreCase(obj.headers, 'Content-Type') &&
          valueStartsWith(obj.headers, 'Content-Type', 'application/x-www-form-urlencoded'))
      ) {
        let temp_obj = obj.data;
        obj.body = Object.keys(temp_obj)
          .map((key) => {
            return `${key}=${temp_obj[key]}`;
          })
          .join('&');
      }
      delete obj.data;
    }

    if (obj.hasOwnProperty('redirect')) obj.redirect = !!obj.redirect;
    if (obj.buffer === 2) {
      obj.toHex = true;
    }
    obj.headers = Object.assign(obj.headers);
    if (url === 'https://api.nn.ci/ocr/b64/text' && obj.headers) {
      obj.headers['Content-Type'] = 'text/plain';
    }
    let isFile = url.startsWith('file://');
    if (isFile && (url.includes('?type=') || url.includes('?params='))) {
      url = url.slice(0, url.lastIndexOf('?'));
    }
    for (let key in obj.headers) {
      if (typeof obj.headers[key] !== 'string') {
        obj.headers[key] = String(obj.headers[key]);
      }
    }
    let r: any = '';
    if (isFile) {
      // r = readFileToString(url.replace('file://', ''));
    } else {
      r = fetch(url, obj);
    }
    if (obj.withHeaders) {
      r = JSON.parse(r);
      res['content'] = r['body'];
      res['headers'] = {};
      for (const [k, v] of Object.entries(r?.['headers'] || {})) {
        res['headers'][k] = v?.[0];
      }
    } else {
      res['content'] = r;
    }
    if (obj.buffer === 2) {
      res['content'] = Buffer.from(r['body'], 'hex').toString('base64');
    }
    return res;
  } catch (err: any) {
    console.log('Error' + err.toString());
  }
};

const local = (() => {
  const localKey = 'drpy';
  return {
    get: (rulekey: string, key: string, value: any = '') => {
      const res = storage0.getItem(`${localKey}@${rulekey}@${key}`, '');
      return res || value;
    },
    set: (rulekey: string, key: string, value: any) => {
      const res = storage0.setItem(`${localKey}@${rulekey}@${key}`, value);
      return res;
    },
    delete: (rulekey: string, key: string) => {
      const res = storage0.clearItem(`${localKey}@${rulekey}@${key}`);
      return res;
    },
  };
})();

export { local, req };
