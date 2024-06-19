import request from '@/utils/request';
import { getPinia } from '@/utils/tool';

export function fetchDebugSource(action) {
  return request({
    url: '/v1/lab/debugSource',
    method: 'get',
    params: {
      action,
    },
  });
}

export function setDebugSource(text) {
  return request({
    url: '/v1/lab/debugSource',
    method: 'post',
    data: text,
  });
}

export function delDebugSource() {
  return request({
    url: `/v1/lab/debugSource`,
    method: 'delete',
  });
}

export function fetchStream(url) {
  return request({
    url: `/v1/lab/removeAd/${url}`,
    method: 'GET',
  });
}

export function setStream(url, type, headers: object | null = null) {
  return request({
    url: `/v1/lab/removeAd`,
    params: {
      url,
      type,
      headers,
    },
    method: 'GET',
  });
}

export function fetchAiAnswer(docs) {
  return request({
    url: '/v1/lab/ai',
    method: 'post',
    data: docs,
    timeout: getPinia('setting', 'timeout') * 2,
  });
}
