import { apiRequest as request } from '@/utils/request';

export function setDefault(doc) {
  return request.request({
    url: '/v1/setting/default',
    method: 'post',
    data: doc,
  });
}

export function fetchSetup() {
  return request.request({
    url: '/v1/setting/setup',
    method: 'get',
  });
}

export function fetchSettingList() {
  return request.request({
    url: '/v1/setting/list',
    method: 'get',
  });
}

export function putSetting(doc) {
  return request.request({
    url: '/v1/setting',
    method: 'put',
    data: doc,
  });
}

export function sourceSetting(doc) {
  return request.request({
    url: '/v1/setting/source',
    method: 'put',
    data: doc,
  });
}

export function getSettingDetail(key) {
  return request.request({
    url: `/v1/setting/value/${key}`,
    method: 'get',
  });
}
