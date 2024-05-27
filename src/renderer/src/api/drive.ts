import request from '@/utils/request';

// 获取iptv列表
export function fetchDriveList() {
  return request({
    url: '/v1/drive/list',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  });
}

// 获取site活跃列表
export function fetchDriveActive() {
  return request({
    url: '/v1/drive/active',
    method: 'get',
    params: {},
  });
}

// drive分页
export function fetchDrivePage(kw: string) {
  return request({
    url: `/v1/drive/page`,
    method: 'get',
    params: {
      kw,
    },
  });
}

// drive修改
export function updateDriveItem(id, doc) {
  return request({
    url: `/v1/drive/${id}`,
    method: 'put',
    data: doc,
  });
}

export function updateDriveStatus(type, id) {
  return request({
    url: `/v1/drive/status/${type}/${id}`,
    method: 'put',
  });
}

// drive删除
export function delDriveItem(id) {
  return request({
    url: `/v1/drive/${id}`,
    method: 'delete',
  });
}

// drive添加
export function addDriveItem(doc) {
  return request({
    url: `/v1/drive`,
    method: 'post',
    data: doc,
  });
}
