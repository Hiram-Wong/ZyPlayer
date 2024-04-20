import request from '@/utils/request';

export function fetchDebugSource() {
  return request({
    url: '/v1/lab/debugSource',
    method: 'get'
  })
}

export function setDebugSource(text: string) {
  return request({
    url: '/v1/lab/debugSource',
    method: 'post',
    data: {
      text
    }
  })
}

export function delDebugSource() {
  return request({
    url: `/v1/lab/debugSource`,
    method: 'delete',
  })
}