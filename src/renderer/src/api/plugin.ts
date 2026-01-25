import { apiRequest as request } from '@/utils/request';

export function fetchPluginPage(doc) {
  return request.request({
    url: `/v1/plugin/page`,
    method: 'get',
    params: doc,
  });
}

export function startPlugin(doc) {
  return request.request({
    url: `/v1/plugin/start`,
    method: 'put',
    data: doc,
  });
}

export function stopPlugin(doc) {
  return request.request({
    url: `/v1/plugin/stop`,
    method: 'put',
    data: doc,
  });
}

export function installPlugin(doc) {
  return request.request({
    url: `/v1/plugin/install`,
    method: 'post',
    data: doc,
  });
}

export function uninstallPlugin(doc) {
  return request.request({
    url: `/v1/plugin/uninstall`,
    method: 'delete',
    data: doc,
  });
}

export function fetchPluginDetail(id) {
  return request.request({
    url: `/v1/plugin/${id}`,
    method: 'get',
  });
}
