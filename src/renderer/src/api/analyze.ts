import request from '@/utils/request';

export function addAnalyze(doc: object) {
  return request({
    url: `/v1/analyze`,
    method: 'post',
    data: doc,
  });
}

export function delAnalyze(doc: object) {
  return request({
    url: `/v1/analyze`,
    method: 'delete',
    data: doc,
  });
}

export function putAnalyze(doc: object) {
  return request({
    url: `/v1/analyze`,
    method: 'put',
    data: doc,
  });
}

export function putAnalyzeDefault(id: string) {
  return request({
    url: `/v1/analyze/default/${id}`,
    method: 'put',
  });
}

export function fetchAnalyzeActive() {
  return request({
    url: '/v1/analyze/active',
    method: 'get',
  });
}

export function fetchAnalyzePage(doc: object) {
  return request({
    url: `/v1/analyze/page`,
    method: 'get',
    params: doc,
  });
}

export function fetchAnalyzeTitle(url: string) {
  return request({
    url: '/v1/analyze/title',
    method: 'get',
    params: {
      url,
    },
  });
}
