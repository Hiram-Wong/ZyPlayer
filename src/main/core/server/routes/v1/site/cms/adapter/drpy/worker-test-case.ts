/*!
 * @module worker
 * @brief web-worker 专属线程处理
 * @version  3.3.8
 * @author HiramWong <admin@catni.cn>
 * @date 2024-10-25T17:46:29+08:00
 */

import { fetch, fetchPC, postPC, fetchCookie, convertBase64Image, batchFetch } from '@main/utils/hiker/request';
import syncFetch from 'sync-fetch';
import syncRequest from 'sync-request';

process.on('message', (message: { [key: string]: any }) => {
  const r1 = fetch('http://localhost:5173/api/v1/system/status', { onlyHeaders: true });
  console.log('fetch-onlyHeaders', r1);
  const r2 = fetch('http://localhost:5173/api/v1/system/status', { withHeaders: true });
  console.log('fetch-withHeaders', JSON.parse(r2));
  const r3 = fetch('https://www.sourcepower.top/api/v1/user/login', {
    withStatusCode: true,
    timeout: 50000,
    method: 'POST',
    body: { email: 'hiram@catni.cn', password: 'xxxxxx' },
  });
  console.log('fetch-withStatusCode+post', JSON.parse(r3));
  const r4 = fetch('http://localhost:5173/api/v1/system/status', { toHex: true });
  console.log('fetch-toHex', JSON.parse(r4));
  const r5 = fetchPC('http://localhost:5173/api/v1/system/status');
  console.log('fetchPC', JSON.parse(r5));
  const r6 = postPC('https://www.sourcepower.top/api/v1/user/login', {
    withStatusCode: true,
    body: { email: 'hiram@catni.cn', password: 'xxxxxx' },
  });
  console.log('postPC', JSON.parse(r6));
  const r7 = fetchCookie('https://x.mbd.pub/api/new_count');
  console.log('fetchCookie', JSON.parse(r7));
  const r8 = convertBase64Image('https://static-o.oss-cn-shenzhen.aliyuncs.com/sukoutu/icon/sukoutuVip.png');
  console.log('convertBase64Image', r8);
  const r9 = batchFetch([
    { url: 'http://localhost:5173/api/v1/system/status' },
    { url: 'http://localhost:5173/api/v1/system/status' },
  ]);
  console.log('batchFetch', r9);

  // const test = syncFetch('https://www.sourcepower.top/api/v1/user/login', {
  //   method: 'POST',
  //   headers: {
  //     'content-type': 'application/json',
  //   },
  //   body: JSON.stringify({ email: 'hiram@catni.cn', password: '994200' }),
  // });
  // console.log(test.json());

  // let url = 'https://www.sourcepower.top/api/v1/system/info?' + Math.random();
  // let t1 = new Date().getTime();
  // syncFetch(url, {});
  // let t2 = new Date().getTime();
  // syncRequest('GET', url);
  // let t3 = new Date().getTime();
  // console.warn('syncRequest time-consuming:' + (t2 - t1) + 'ms');
  // console.warn('syncFetch time-consuming:' + (t3 - t2) + 'ms');
});
