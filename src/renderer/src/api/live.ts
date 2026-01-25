import { apiRequest as request } from '@/utils/request';

/** iptv */

export function addIptv(doc) {
  return request.request({
    url: '/v1/live/iptv',
    method: 'post',
    data: doc,
  });
}

export function delIptv(doc) {
  return request.request({
    url: '/v1/live/iptv',
    method: 'delete',
    data: doc,
  });
}

export function putIptv(doc) {
  return request.request({
    url: '/v1/live/iptv',
    method: 'put',
    data: doc,
  });
}

export function putIptvDefault(id) {
  return request.request({
    url: `/v1/live/iptv/default/${id}`,
    method: 'put',
  });
}

export function fetchIptvActive() {
  return request.request({
    url: '/v1/live/iptv/active',
    method: 'get',
  });
}

export function fetchIptvPage(doc) {
  return request.request({
    url: '/v1/live/iptv/page',
    method: 'get',
    params: doc,
  });
}

export function fetchIptvCheck(id) {
  return request.request({
    url: `/v1/live/iptv/check/${id}`,
    method: 'get',
  });
}

/** channel */

export function addChannel(doc) {
  return request.request({
    url: '/v1/live/channel',
    method: 'post',
    data: doc,
  });
}

export function delChannel(doc) {
  return request.request({
    url: '/v1/live/channel',
    method: 'delete',
    data: doc,
  });
}

export function fetchChannelPage(doc) {
  return request.request({
    url: '/v1/live/channel/page',
    method: 'get',
    params: doc,
  });
}

export function fetchChannelDetail(id) {
  return request.request({
    url: `/v1/live/channel/${id}`,
    method: 'get',
  });
}

export function fetchChannelEpg(doc) {
  return request.request({
    url: '/v1/live/channel/epg',
    method: 'get',
    params: doc,
  });
}
