import request from '@/utils/request';

export function addSite(doc: object) {
  return request({
    url: `/v1/site`,
    method: 'post',
    data: doc,
  });
}

export function delSite(doc: object) {
  return request({
    url: `/v1/site`,
    method: 'delete',
    data: doc,
  });
}

export function putSite(doc: object) {
  return request({
    url: `/v1/site`,
    method: 'put',
    data: doc,
  });
}

export function putSiteDefault(id: string) {
  return request({
    url: `/v1/site/default/${id}`,
    method: 'put',
  });
}

export function fetchSiteActive() {
  return request({
    url: '/v1/site/active',
    method: 'get',
  });
}

export function fetchSitePage(doc: object) {
  return request({
    url: `/v1/site/page`,
    method: 'get',
    params: doc,
  });
}

export function fetchSiteDetail(id: string) {
  return request({
    url: `/v1/site/${id}`,
    method: 'get',
  });
}

export function fetchHotPage(doc: object) {
  return request({
    url: '/v1/hot/page',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsInit(doc: object) {
  return request({
    url: '/v1/cms/init',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsHome(doc: object) {
  return request({
    url: '/v1/cms/home',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsHomeVod(doc: object) {
  return request({
    url: '/v1/cms/homeVod',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsCategory(doc: object) {
  return request({
    url: '/v1/cms/category',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsSearch(doc: object) {
  return request({
    url: '/v1/cms/search',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsDetail(doc: object) {
  return request({
    url: '/v1/cms/detail',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsPlay(doc: object) {
  return request({
    url: '/v1/cms/play',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsRunMain(doc: object) {
  return request({
    url: '/v1/cms/runMain',
    method: 'post',
    data: doc,
  });
}

export function fetchCmsProxy(doc: object) {
  return request({
    url: '/v1/cms/proxy',
    method: 'post',
    data: doc,
  });
}

export function fetchRecommPage(doc: object) {
  return request({
    url: '/v1/recommend/douban',
    method: 'get',
    params: doc,
  });
}
