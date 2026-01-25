import { proxyApi } from '@/utils/env';
import { apiRequest as request } from '@/utils/request';

export function setProxy(doc) {
  return request.request({
    url: proxyApi,
    method: 'post',
    data: doc,
  });
}

export function getProxy(doc) {
  return request.request({
    url: proxyApi,
    method: 'get',
    params: doc,
  });
}
