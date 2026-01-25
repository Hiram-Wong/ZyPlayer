import { apiRequest as request } from '@/utils/request';

/** moment */

export function fetchMomentRelated() {
  return request.request({
    url: '/v1/moment/related',
    method: 'get',
  });
}

/** history */

export function fetchHistoryPage(doc) {
  return request.request({
    url: '/v1/moment/history/page',
    method: 'get',
    params: doc,
  });
}

export function addHistory(doc) {
  return request.request({
    url: '/v1/moment/history',
    method: 'post',
    data: doc,
  });
}

export function delHistory(doc) {
  return request.request({
    url: `/v1/moment/history`,
    method: 'delete',
    data: doc,
  });
}

export function putHistory(doc) {
  return request.request({
    url: `/v1/moment/history`,
    method: 'put',
    data: doc,
  });
}

export function findHistory(doc) {
  return request.request({
    url: `/v1/moment/history/find`,
    method: 'get',
    params: doc,
  });
}

/** star */

export function addStar(doc) {
  return request.request({
    url: `/v1/moment/star`,
    method: 'post',
    data: doc,
  });
}
export function delStar(doc) {
  return request.request({
    url: `/v1/moment/star`,
    method: 'delete',
    data: doc,
  });
}
export function putStar(doc) {
  return request.request({
    url: `/v1/moment/star`,
    method: 'put',
    data: doc,
  });
}
export function fetchStarPage(doc) {
  return request.request({
    url: '/v1/moment/star/page',
    method: 'get',
    params: doc,
  });
}

export function fetchStarDetail(id) {
  return request.request({
    url: `/v1/moment/star/${id}`,
    method: 'get',
  });
}

export function findStar(doc) {
  return request.request({
    url: `/v1/moment/star/find`,
    method: 'get',
    params: doc,
  });
}
