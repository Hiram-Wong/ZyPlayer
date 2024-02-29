import request from '@/utils/request';

// 获取site列表
export function fetchSiteList() {
  return request({
    url: '/v1/site/list',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    }
  })
}

// 获取site活跃列表
export function fetchSiteActive() {
  return request({
    url: '/v1/site/active',
    method: 'get',
    params: {}
  })
}

// 获取分类列表
export function fetchFilmClass(id: string) {
  return request({
    url: '/v1/film/class',
    method: 'get',
    params: {
      id
    }
  })
}

// 获取影视列表
export function fetchFilmList(id: string, pg: number, t: string, f: any) {
  return request({
    url: '/v1/film/list',
    method: 'get',
    params: {
      id,
      pg,
      t,
      f
    }
  })
}
// film搜索
export function searchFilmList(id: string, kw: string) {
  return request({
    url: '/v1/film/search',
    method: 'get',
    params: {
      id,
      kw
    }
  })
}

// film详情
export function fetchFilmDetail(id: string, video_id: string) {
  return request({
    url: '/v1/film/detail',
    method: 'get',
    params: {
      id,
      video_id
    }
  })
}

// site详情
export function fetchSiteDetail(id: string) {
  return request({
    url: `/v1/site/${id}`,
    method: 'get'
  })
}

// site分页
export function fetchSitePage(kw: string) {
  return request({
    url: `/v1/site/page`,
    method: 'get',
    params: {
      kw
    }
  })
}

export function updateSiteItem(id, doc) {
  return request({
    url: `/v1/site/${id}`,
    method: 'put',
    data: doc
  })
}

export function delSiteItem(id) {
  return request({
    url: `/v1/site/${id}`,
    method: 'delete',
  })
}


export function checkFilm(id) {
  return request({
    url: `/v1/film/check`,
    method: 'get',
    params: {
      id
    }
  })
}

// site添加
export function addSiteItem(doc) {
  return request({
    url: `/v1/site`,
    method: 'post',
    data: doc
  })
}