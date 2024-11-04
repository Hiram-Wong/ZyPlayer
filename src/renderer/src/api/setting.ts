import request from '@/utils/request';

export function setDefault(type: string, id: string) {
  return request({
    url: '/v1/setting/default',
    method: 'post',
    data: {
      type,
      id,
    },
  });
}

export function fetchSetup() {
  return request({
    url: '/v1/setting/setup',
    method: 'get',
  });
}

export function fetchSettingList() {
  return request({
    url: '/v1/setting/list',
    method: 'get',
  });
}

export function putSetting(doc) {
  return request({
    url: '/v1/setting',
    method: 'put',
    data: doc,
  });
}

export function sourceSetting(doc) {
  return request({
    url: '/v1/setting/source',
    method: 'put',
    data: doc,
  });
}

export function fetchSettingDetail(key: string) {
  return request({
    url: '/v1/setting/detail',
    method: 'get',
    params: {
      key,
    },
  });
}

export function clearDb(doc: string[]) {
  return request({
    url: '/v1/db/clear',
    method: 'delete',
    data: doc,
  });
}

export function exportDb(doc: string[]) {
  return request({
    url: '/v1/db/export',
    method: 'post',
    data: doc,
  });
}

export function initDb(docs: object) {
  return request({
    url: '/v1/db/init',
    method: 'post',
    data: docs,
  });
}

export function webdevRemote2Local() {
  return request({
    url: '/v1/db/webdev/remote2local',
    method: 'get',
  });
}

export function webdevLocal2Remote() {
  return request({
    url: '/v1/db/webdev/local2remote',
    method: 'get',
  });
}

export function fetchIp() {
  return request({
    url: '/v1/system/ip',
    method: 'get',
  });
}

export function fetchConfig(doc) {
  return request({
    url: '/v1/system/config',
    method: 'post',
    data: doc,
  });
}

export function fetchHtml(doc) {
  return request({
    url: '/v1/system/html',
    method: 'post',
    data: doc,
  });
}
