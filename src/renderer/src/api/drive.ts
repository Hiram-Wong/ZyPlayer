import request from '@/utils/request';

export function addDrive(doc: object) {
  return request({
    url: `/v1/drive`,
    method: 'post',
    data: doc,
  });
}

export function delDrive(doc: object) {
  return request({
    url: `/v1/drive`,
    method: 'delete',
    data: doc,
  });
}

export function putDrive(doc: object) {
  return request({
    url: `/v1/drive`,
    method: 'put',
    data: doc,
  });
}

export function putDriveDefault(id: string) {
  return request({
    url: `/v1/drive/default/${id}`,
    method: 'put',
  });
}

export function fetchDriveActive() {
  return request({
    url: '/v1/drive/active',
    method: 'get',
  });
}

export function fetchDrivePage(doc: object) {
  return request({
    url: `/v1/drive/page`,
    method: 'get',
    params: doc,
  });
}

export function putAlistInit(doc: object) {
  return request({
    url: `/v1/alist/init`,
    method: 'get',
    params: doc,
  });
}

export function fetchAlistDir(doc: object) {
  return request({
    url: `/v1/alist/dir`,
    method: 'get',
    params: doc,
  });
}

export function fetchAlistFile(doc: object) {
  return request({
    url: `/v1/alist/file`,
    method: 'get',
    params: doc,
  });
}
