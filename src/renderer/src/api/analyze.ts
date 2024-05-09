import request from '@/utils/request';

// 获取analyze列表
export function fetchAnalyzeList() {
  return request({
    url: '/v1/analyze/list',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  });
}

// 获取analyze活跃列表
export function fetchAnalyzeActive() {
  return request({
    url: '/v1/analyze/active',
    method: 'get',
    params: {},
  });
}

// analyze分页
export function fetchAnalyzePage(kw: string) {
  return request({
    url: `/v1/analyze/page`,
    method: 'get',
    params: {
      kw,
    },
  });
}

// 解析标题
export function fetchAnalyzeTitle(url: string) {
  return request({
    url: '/v1/analyze/title',
    method: 'get',
    params: {
      url,
    },
  });
}

// analyze更新
export function updateAnalyzeItem(id, doc) {
  return request({
    url: `/v1/analyze/${id}`,
    method: 'put',
    data: doc,
  });
}

// analyze删除
export function delAnalyzeItem(id) {
  return request({
    url: `/v1/analyze/${id}`,
    method: 'delete',
  });
}

// analyze添加
export function addAnalyzeItem(doc) {
  return request({
    url: `/v1/analyze`,
    method: 'post',
    data: doc,
  });
}

// analyze默认
export function fetchAnalyzeDefault() {
  return request({
    url: `/v1/analyze/default`,
    method: 'get',
  });
}

// analyze播放
export function fetchAnalyzePlay() {
  return request({
    url: `/v1/analyze/play`,
    method: 'get',
  });
}
