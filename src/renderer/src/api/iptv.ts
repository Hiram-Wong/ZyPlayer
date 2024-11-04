import request from '@/utils/request';

export function addIptv(doc: object) {
  return request({
    url: `/v1/iptv`,
    method: 'post',
    data: doc,
  });
}

export function delIptv(doc: object) {
  return request({
    url: `/v1/iptv`,
    method: 'delete',
    data: doc,
  });
}

export function putIptv(doc: object) {
  return request({
    url: `/v1/iptv`,
    method: 'put',
    data: doc,
  });
}

export function putIptvDefault(id: string) {
  return request({
    url: `/v1/iptv/default/${id}`,
    method: 'put',
  });
}

export function fetchIptvActive() {
  return request({
    url: '/v1/iptv/active',
    method: 'get',
  });
}

export function fetchIptvPage(doc: object) {
  return request({
    url: `/v1/iptv/page`,
    method: 'get',
    params: doc,
  });
}

export function addChannel(doc: object) {
  return request({
    url: '/v1/channel',
    method: 'post',
    data: doc,
  });
}

export function delChannel(doc: object) {
  return request({
    url: `/v1/channel`,
    method: 'delete',
    data: doc,
  });
}

export function fetchChannelPage(doc: object) {
  return request({
    url: '/v1/channel/page',
    method: 'get',
    params: doc,
  });
}

export function fetchChannelEpg(doc: object) {
  return request({
    url: `/v1/channel/epg`,
    method: 'get',
    params: doc,
  });
}
