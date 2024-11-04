import request from '@/utils/request';

export function fetchHistoryPage(doc: object) {
  return request({
    url: '/v1/history/page',
    method: 'get',
    params: doc,
  });
}

export function addHistory(doc: object) {
  return request({
    url: '/v1/history',
    method: 'post',
    data: doc,
  });
}

export function delHistory(doc: object) {
  return request({
    url: `/v1/history`,
    method: 'delete',
    data: doc,
  });
}

export function putHistory(doc: object) {
  return request({
    url: `/v1/history`,
    method: 'put',
    data: doc,
  });
}

export function findHistory(doc: object) {
  return request({
    url: `/v1/history/find`,
    method: 'post',
    data: doc,
  });
}
