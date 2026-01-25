import { isFunction } from 'es-toolkit';

// 存储请求与取消令牌的键值对列表
let pendingMap = new Map<string, AbortController>();

/**
 * 获取请求Url
 * @param config
 */
export const getPendingUrl = (config: Record<string, string>) => [config.method, config.url].join('&');

/**
 * @description 请求管理器
 */
export class SseCanceler {
  /**
   * 添加请求到列表中
   * @param config
   */
  addPending(config: Record<string, any>) {
    this.removePending(config);
    const url = getPendingUrl(config);
    config.signal = config.signal || new AbortController();
    if (!pendingMap.has(url)) {
      // 如果当前没有相同请求就添加
      pendingMap.set(url, config.signal);
    }
  }

  /**
   * 移除现有的所有请求
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      if (cancel && isFunction(cancel)) cancel.abort();
    });
    pendingMap.clear();
  }

  /**
   * 移除指定请求
   * @param config
   */
  removePending(config: Record<string, any>) {
    const url = getPendingUrl(config);

    if (pendingMap.has(url)) {
      // If there is a current request identifier in pending,
      // the current request needs to be cancelled and removed
      const cancel = pendingMap.get(url);
      if (cancel) cancel.abort();
      pendingMap.delete(url);
    }
  }

  /**
   * 重置
   */
  reset() {
    pendingMap = new Map<string, AbortController>();
  }
}
