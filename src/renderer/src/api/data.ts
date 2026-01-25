import { apiRequest as request } from '@/utils/request';

export function dataDbClear(doc) {
  return request.request({
    url: '/v1/data/db/clear',
    method: 'delete',
    data: doc,
  });
}

export function dataDbExport(doc) {
  return request.request({
    url: '/v1/data/db/export',
    method: 'post',
    data: doc,
  });
}

export function dataDbImport(doc) {
  return request.request({
    url: '/v1/data/db/import',
    method: 'post',
    data: doc,
  });
}

export function dataCloudBackup() {
  return request.request({
    url: '/v1/data/cloud/backup',
    method: 'get',
  });
}

export function dataCloudResume() {
  return request.request({
    url: '/v1/data/cloud/resume',
    method: 'get',
  });
}
