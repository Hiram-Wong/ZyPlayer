import request from '@/utils/request';

export function setT3Proxy(doc) {
  return request({
    url: 'http://127.0.0.1:9978/proxy',
    method: 'post',
    data: doc,
  });
}
