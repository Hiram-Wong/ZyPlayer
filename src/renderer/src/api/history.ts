import request from '@/utils/request';

// 获取analyze历史列表
export function fetchHistoryList(page, limit, action) {
  return request({
    url: '/v1/history/page',
    method: 'get',
    params: {
      page,
      limit,
      action,
    },
  });
}

// 清空analyze历史列表
export function clearHistoryAnalyzeList() {
  return request({
    url: '/v1/history/clear',
    method: 'delete',
    params: {
      action: 'analyze',
    },
  });
}

export function clearHistorySearchList() {
  return request({
    url: '/v1/history/clear',
    method: 'delete',
    params: {
      action: 'search',
    },
  });
}

export function clearHistoryFilmList() {
  return request({
    url: '/v1/history/clear',
    method: 'delete',
    params: {
      action: 'film',
    },
  });
}

// 获取search历史列表
export function fetchHistorySearchList() {
  return request({
    url: '/v1/history/list',
    method: 'get',
    params: {
      action: 'search',
    },
  });
}

// 获取film历史列表
export function fetchHistoryFilmList() {
  return request({
    url: '/v1/history/list',
    method: 'get',
    params: {
      action: 'film',
    },
  });
}

export function updateHistory(id, doc) {
  return request({
    url: `/v1/history/${id}`,
    method: 'put',
    data: doc,
  });
}

export function addHistory(doc) {
  return request({
    url: '/v1/history',
    method: 'post',
    data: doc,
  });
}

export function detailHistory(doc) {
  return request({
    url: `/v1/history/detail`,
    method: 'post',
    data: doc,
  });
}

// 删除单个历史记录
export function delHistory(id) {
  return request({
    url: `/v1/history/${id}`,
    method: 'delete',
    params: {},
  });
}
