import request from '@/utils/request';
export function addStar(doc: object) {
  return request({
    url: `/v1/star`,
    method: 'post',
    data: doc,
  });
}
export function delStar(doc: object) {
  return request({
    url: `/v1/star`,
    method: 'delete',
    data: doc,
  });
}
export function putStar(doc: object) {
  return request({
    url: `/v1/star`,
    method: 'put',
    data: doc,
  });
}
export function fetchStarPage(doc: object) {
  return request({
    url: '/v1/star/page',
    method: 'get',
    params: doc,
  });
}

export function fetchStarDetail(id: string) {
  return request({
    url: `/v1/star/${id}`,
    method: 'get',
  });
}

export function findStar(doc: object) {
  return request({
    url: `/v1/star/find`,
    method: 'post',
    data: doc,
  });
}
