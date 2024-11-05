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

export function fetchDelAdStream(doc) {
  return request({
    url: `/v1/lab/ad`,
    method: 'GET',
    params: doc,
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

export function fetchJsEditDebugInit(doc) {
  return request({
    url: `/v1/lab/js-edit/debug-init`,
    method: 'POST',
    data: doc,
  });
}
