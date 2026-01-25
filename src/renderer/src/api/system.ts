import { apiRequest as request, sseRequest } from '@/utils/request';

/** other */

export function getHealth() {
  return request.request({
    url: '/v1/system/health',
    method: 'get',
  });
}

export function getIp() {
  return request.request({
    url: '/v1/system/ip',
    method: 'get',
  });
}

export function systemInitiateReq(doc) {
  return request.request({
    url: '/v1/system/req',
    method: 'post',
    data: doc,
  });
}

export function m3u8Adremove(doc) {
  return request.request({
    url: '/v1/system/m3u8/adremove',
    method: 'get',
    params: doc,
  });
}

export function fetchLoggerStream(doc, callback) {
  return sseRequest.request({
    url: '/v1/system/log',
    method: 'get',
    params: doc,
    ...callback,
  });
}

/** ffmpeg */

export function generateFfmpegInfo(doc) {
  return request.request({
    url: '/v1/system/ffmpeg/info',
    method: 'post',
    data: doc,
  });
}

export function generateFfmpegScreenshot(doc) {
  return request.request({
    url: '/v1/system/ffmpeg/screenshot',
    method: 'post',
    data: doc,
  });
}

/** cdp */

export function cdpSnifferMedia(doc) {
  return request.request({
    url: '/v1/system/cdp/sniffer/media',
    method: 'post',
    data: doc,
  });
}

/** binary */

export function getBinaryList() {
  return request.request({
    url: '/v1/system/binary/list',
    method: 'get',
  });
}

export function binaryInstall(doc) {
  return request.request({
    url: '/v1/system/binary/install',
    method: 'post',
    data: doc,
  });
}
