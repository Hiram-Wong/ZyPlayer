import { apiRequest as request } from '@/utils/request';

/** site */

export function addSite(doc) {
  return request.request({
    url: `/v1/film/site`,
    method: 'post',
    data: doc,
  });
}

export function delSite(doc) {
  return request.request({
    url: `/v1/film/site`,
    method: 'delete',
    data: doc,
  });
}

export function putSite(doc) {
  return request.request({
    url: `/v1/film/site`,
    method: 'put',
    data: doc,
  });
}

export function putSiteDefault(id) {
  return request.request({
    url: `/v1/film/site/default/${id}`,
    method: 'put',
  });
}

export function fetchSiteActive() {
  return request.request({
    url: '/v1/film/site/active',
    method: 'get',
  });
}

export function fetchSitePage(doc) {
  return request.request({
    url: `/v1/film/site/page`,
    method: 'get',
    params: doc,
  });
}

export function fetchSiteDetail(id) {
  return request.request({
    url: `/v1/film/site/${id}`,
    method: 'get',
  });
}

export function fetchSiteDetailByKey(key) {
  return request.request({
    url: `/v1/film/site/key/${key}`,
    method: 'get',
  });
}

/** cms */

export function fetchCmsInit(doc) {
  return request.request({
    url: '/v1/film/cms/init',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsHome(doc) {
  return request.request({
    url: '/v1/film/cms/home',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsHomeVod(doc) {
  return request.request({
    url: '/v1/film/cms/homeVod',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsCategory(doc) {
  return request.request({
    url: '/v1/film/cms/category',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsSearch(doc) {
  return request.request({
    url: '/v1/film/cms/search',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsDetail(doc) {
  return request.request({
    url: '/v1/film/cms/detail',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsPlay(doc) {
  return request.request({
    url: '/v1/film/cms/play',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsProxy(doc) {
  return request.request({
    url: '/v1/film/cms/proxy',
    method: 'get',
    params: doc,
  });
}

export function fetchCmsCheck(doc) {
  return request.request({
    url: '/v1/film/cms/check',
    method: 'get',
    params: doc,
  });
}

/** recommend */

export function fetchRecBarrage(doc) {
  return request.request({
    url: '/v1/film/rec/barrage',
    method: 'get',
    params: doc,
  });
}

export function sendRecBarrage(doc) {
  return request.request({
    url: '/v1/film/rec/barrage',
    method: 'post',
    data: doc,
  });
}

export function fetchRecHot(doc) {
  return request.request({
    url: '/v1/film/rec/hot',
    method: 'get',
    params: doc,
  });
}

export function fetchRecMatch(doc) {
  return request.request({
    url: '/v1/film/rec/match',
    method: 'get',
    params: doc,
  });
}

/** edit */

export function fetchEditDomPd(doc) {
  return request.request({
    url: `/v1/film/edit/dom/pd`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditDomPdfa(doc) {
  return request.request({
    url: `/v1/film/edit/dom/pdfa`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditDomPdfh(doc) {
  return request.request({
    url: `/v1/film/edit/dom/pdfh`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditDomPdfl(doc) {
  return request.request({
    url: `/v1/film/edit/dom/pdfl`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditSiftCategory(doc) {
  return request.request({
    url: `/v1/film/edit/sift/category`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditSiftFilter(doc) {
  return request.request({
    url: `/v1/film/edit/sift/filter`,
    method: 'POST',
    data: doc,
  });
}

export function fetchEditTemplates(type) {
  return request.request({
    url: `/v1/film/edit/template/${type}`,
    method: 'GET',
  });
}

export function fetchEditTemplateDetail(type, name) {
  return request.request({
    url: `/v1/film/edit/template/${type}/${name}`,
    method: 'GET',
  });
}

export function fetchEditDecrypt(type, doc) {
  return request.request({
    url: `/v1/film/edit/decrypt/${type}`,
    method: 'POST',
    data: doc,
  });
}
