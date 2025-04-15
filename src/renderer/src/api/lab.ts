import request, { requestSse } from '@/utils/request';
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

export function fetchDelAdStream(doc) {
  return request({
    url: `/v1/lab/ad`,
    method: 'GET',
    params: doc,
  });
}

export function fetchAiChat(doc) {
  return request({
    url: '/v1/lab/ai/chat',
    method: 'post',
    data: { ...doc.data, stream: false },
    timeout: getPinia('setting', 'timeout') * 2,
  });
}

export function fetchAiStream(doc) {
  return requestSse({
    url: '/v1/lab/ai/chat',
    method: 'post',
    data: { ...doc.data, stream: true },
    timeout: getPinia('setting', 'timeout') * 2,
    headers: {
      'Content-Type': 'application/json',
    },
    options: doc.options,
  });
}

export function fetchAiCache() {
  return request({
    url: '/v1/lab/ai/cache',
    method: 'get',
  });
}

export function createAiCache() {
  return request({
    url: '/v1/lab/ai/cache/create',
    method: 'post',
  });
}

export function addAiCache(doc) {
  return request({
    url: '/v1/lab/ai/cache',
    method: 'post',
    data: doc
  });
}

export function putAiCache(doc) {
  return request({
    url: '/v1/lab/ai/cache',
    method: 'put',
    data: doc
  });
}

export function delAiCache(doc) {
  return request({
    url: '/v1/lab/ai/cache',
    method: 'delete',
    data: doc
  });
}

export function fetchStaticFilterFilter(doc) {
  return request({
    url: `/v1/lab/static-filter/filter`,
    method: 'POST',
    data: doc,
  });
}

export function fetchStaticFilterCategory(doc) {
  return request({
    url: `/v1/lab/static-filter/category`,
    method: 'POST',
    data: doc,
  });
}

export function fetchJsEditPdfa(doc) {
  return request({
    url: `/v1/lab/js-edit/pdfa`,
    method: 'POST',
    data: doc,
  });
}

export function fetchJsEditPdfh(doc) {
  return request({
    url: `/v1/lab/js-edit/pdfh`,
    method: 'POST',
    data: doc,
  });
}
export function fetchJsEditMuban() {
  return request({
    url: `/v1/lab/js-edit/muban`,
    method: 'POST',
  });
}

export function fetchJsEditDebug() {
  return request({
    url: `/v1/lab/js-edit/debug`,
    method: 'GET',
  });
}
