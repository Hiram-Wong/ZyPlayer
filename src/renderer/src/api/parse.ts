import { apiRequest as request } from '@/utils/request';

/** analyze */

export function addAnalyze(doc) {
  return request.request({
    url: `/v1/parse/analyze`,
    method: 'post',
    data: doc,
  });
}

export function delAnalyze(doc) {
  return request.request({
    url: `/v1/parse/analyze`,
    method: 'delete',
    data: doc,
  });
}

export function putAnalyze(doc) {
  return request.request({
    url: `/v1/parse/analyze`,
    method: 'put',
    data: doc,
  });
}

export function fetchAnalyzeDetail(id) {
  return request.request({
    url: `/v1/parse/analyze/${id}`,
    method: 'get',
  });
}

export function fetchAnalyzeDetailByKey(key) {
  return request.request({
    url: `/v1/parse/analyze/key/${key}`,
    method: 'get',
  });
}

export function putAnalyzeDefault(id) {
  return request.request({
    url: `/v1/parse/analyze/default/${id}`,
    method: 'put',
  });
}

export function fetchAnalyzeActive() {
  return request.request({
    url: '/v1/parse/analyze/active',
    method: 'get',
  });
}

export function fetchAnalyzePage(doc) {
  return request.request({
    url: `/v1/parse/analyze/page`,
    method: 'get',
    params: doc,
  });
}

export function fetchAnalyzeCheck(id) {
  return request.request({
    url: `/v1/parse/analyze/check/${id}`,
    method: 'get',
  });
}

/** parse */

export function fetchParse(doc) {
  return request.request({
    url: `/v1/parse/media-direct`,
    method: 'get',
    params: doc,
  });
}
