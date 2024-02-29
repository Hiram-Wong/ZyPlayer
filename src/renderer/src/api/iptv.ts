import request from '@/utils/request';

// 获取iptv列表
export function fetchIPTVList() {
  return request({
    url: '/v1/iptv/list',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    }
  })
}

// 获取iptv活跃列表
export function fetchIptvActive() {
  return request({
    url: '/v1/iptv/active',
    method: 'get',
    params: {}
  })
}

// iptv分页
export function fetchIptvPage(kw: string) {
  return request({
    url: `/v1/iptv/page`,
    method: 'get',
    params: {
      kw
    }
  })
}

// 清空 channel
export function clearChannel() {
  return request({
    url: '/v1/channel/clear',
    method: 'delete',
    params: {}
  })
}

// 添加 channel
export function addChannel(doc) {
  return request({
    url: '/v1/channel',
    method: 'post',
    data: doc
  })
}

export function fetchChannelList(page, limit, key, group) {
  return request({
    url: '/v1/channel/page',
    method: 'get',
    params: {
      page, limit, key, group
    }
  })
}

export function delChannelItem(id) {
  return request({
    url: `/v1/channel/${id}`,
    method: 'delete',
  })
}

export function updateIptvItem(id, doc) {
  return request({
    url: `/v1/iptv/${id}`,
    method: 'put',
    data: doc
  })
}

export function delIptvItem(id) {
  return request({
    url: `/v1/iptv/${id}`,
    method: 'delete',
  })
}

// iptv添加
export function addIptvItem(doc) {
  return request({
    url: `/v1/iptv`,
    method: 'post',
    data: doc
  })
}