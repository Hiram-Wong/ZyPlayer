import { apiRequest as request, sseRequest } from '@/utils/request';

/** chat */

export function fetchAiChat(doc) {
  return request.request({
    url: '/v1/aigc/chat/normal',
    method: 'post',
    data: doc,
  });
}

export function fetchAiStream(doc, callback) {
  return sseRequest.request({
    url: '/v1/aigc/chat/completion',
    method: 'post',
    data: doc,
    ...callback,
  });
}

/** memory - session */

export function createMemorySession() {
  return request.request({
    url: '/v1/aigc/memory/session',
    method: 'post',
  });
}

export function delMemorySession(doc) {
  return request.request({
    url: '/v1/aigc/memory/session',
    method: 'delete',
    data: doc,
  });
}
export function getMemorySessionIds() {
  return request.request({
    url: '/v1/aigc/memory/session/id',
    method: 'get',
  });
}

/** memory - message */

export function fetchMemoryMessage(id) {
  return request.request({
    url: `/v1/aigc/memory/message/${id}`,
    method: 'get',
  });
}

export function addMemoryMessage(doc) {
  return request.request({
    url: '/v1/aigc/memory/message',
    method: 'post',
    data: doc,
  });
}

export function putMemoryMessage(doc) {
  return request.request({
    url: '/v1/aigc/memory/message',
    method: 'put',
    data: doc,
  });
}

export function delMemoryMessage(doc) {
  return request.request({
    url: '/v1/aigc/memory/message',
    method: 'delete',
    data: doc,
  });
}
