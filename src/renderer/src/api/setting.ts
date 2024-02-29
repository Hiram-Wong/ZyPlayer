import request from '@/utils/request';

// 设置默认
export function setDefault(type, id) {
  return request({
    url: '/v1/setting/default',
    method: 'post',
    data: {
      type,
      id
    }
  })
}

// 获取设置列表
export function fetchSettingList() {
  return request({
    url: '/v1/setting/list',
    method: 'get',
  })
}

export function updateSetting(docs) {
  return request({
    url: '/v1/setting',
    method: 'put',
    data: docs
  })
}

export function fetchAgreement() {
  return request({
    url: '/v1/setting/agreement',
    method: 'get'
  })
}

export function clearDb(type) {
  return request({
    url: '/v1/db/clear',
    method: 'delete',
    data: type
  })
}

export function exportDb(type) {
  return request({
    url: '/v1/db/export',
    method: 'post',
    data: type
  })
}

export function initDb(docs) {
  return request({
    url: '/v1/db/init',
    method: 'post',
    data: docs
  })
}

export function setup() {
  return request({
    url: '/v1/setting/setup',
    method: 'get',
  })
}

export function fetchSettingDetail(key) {
  return request({
    url: '/v1/setting/detail',
    method: 'get',
    params: {
      key
    }
  })
}