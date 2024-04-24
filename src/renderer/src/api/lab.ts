import request from '@/utils/request';

export function fetchDebugSource(action) {
  return request({
    url: '/v1/lab/debugSource',
    method: 'get',
    params: {
      action
    }
  })
}

export function setDebugSource(text) {
  return request({
    url: '/v1/lab/debugSource',
    method: 'post',
    data: text
  })
}

export function delDebugSource() {
  return request({
    url: `/v1/lab/debugSource`,
    method: 'delete',
  })
}