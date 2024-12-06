import request from '@/utils/request';

export function info(doc: object) {
  return request({
    url: `/v1/plugin/info`,
    method: 'post',
    data: doc,
  });
}

export function start(doc: object) {
  return request({
    url: `/v1/plugin/start`,
    method: 'post',
    data: doc,
  });
}

export function stop(doc: object) {
  return request({
    url: `/v1/plugin/stop`,
    method: 'post',
    data: doc,
  });
}

export function install(doc: object) {
  return request({
    url: `/v1/plugin/install`,
    method: 'post',
    data: doc,
  });
}

export function uninstall(doc: object) {
  return request({
    url: `/v1/plugin/uninstall`,
    method: 'post',
    data: doc,
  });
}

export function list() {
  return request({
    url: `/v1/plugin/list`,
    method: 'get',
  });
}
