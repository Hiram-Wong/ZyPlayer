import request from '@/utils/request';

// 获取star列表
export function fetchStarList(page, limit) {
  return request({
    url: '/v1/star/page',
    method: 'get',
    params: {
      page,
      limit
    }
  })
}

export function clearStarList() {
  return request({
    url: '/v1/star/clear',
    method: 'delete'
  })
}

export function delStar(id) {
  return request({
    url: `/v1/star/${id}`,
    method: 'delete',
    params: {
    }
  })
}

export function updateStar(id, doc) {
  return request({
    url: `/v1/star/${id}`,
    method: 'put',
    data: doc
  })
}

export function detailStar(doc) {
  return request({
    url: `/v1/star/detail`,
    method: 'post',
    data: doc
  })
}

export function addStar(doc) {
  return request({
    url: `/v1/star`,
    method: 'post',
    data: doc
  })
}
