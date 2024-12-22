import ipaddr from 'ipaddr.js';
import request from '@/utils/request';
import { usePlayStore, useSettingStore } from '@/store';

const checkIpVersion = async (ip: string) => {
  let version = -1;
  try {
    const ipParse = ipaddr.parse(ip);
    if (ipParse.kind() === 'ipv4') {
      version = 4;
    } else if (ipParse.kind() === 'ipv6') {
      version = 6;
    }
  } finally {
    return version;
  }
};

const checkLiveM3U8 = async (url: string): Promise<boolean> => {
  try {
    const response = await request({
      url,
      method: 'GET',
    });

    const isLiveStream = !(
      response.indexOf('#EXT-X-ENDLIST') !== -1 ||
      (response.indexOf('#EXT-X-PLAYLIST-TYPE') !== -1 &&
        response.match(/#EXT-X-PLAYLIST-TYPE:(.*)/)[1].toUpperCase() === 'VOD') ||
      (response.indexOf('#EXT-X-MEDIA-SEQUENCE') !== -1 &&
        parseInt(response.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/)[1]) === 0)
    );

    return isLiveStream;
  } catch (err) {
    return false;
  }
};

const copyToClipboardApi = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
};

// 深拷贝辅助函数
const dictDeepClone = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

// 读取localStorage
const getLocalStorage = (key: string): any => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};

// 存储localStorage
const setLocalStorage = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// 读取pinia
const getPinia = (store: string, key: string): any => {
  switch (store) {
    case 'setting':
      const storeSetting = useSettingStore();
      return storeSetting[key] || null;
    case 'play':
      const storePlay = usePlayStore();
      return storePlay[key] || null;
    default:
      return null;
  }
};

const loadExternalResource = (url: string, type: 'css' | 'js' | 'font') => {
  // 检查资源是否已存在
  const isResourceLoaded = () => {
    const selector = type === 'js' ? `script[src="${url}"]` : `link[href="${url}"]`;
    return document.querySelectorAll(selector).length > 0;
  };

  // 如果资源已加载，则直接返回
  if (isResourceLoaded()) {
    console.log(`[tool][loadExternalResource]Resource already loaded:${url}`);
    return Promise.resolve(url); // 如果已加载，直接返回成功的Promise
  }

  return new Promise((resolve, reject) => {
    const createTag = () => {
      let tag;
      switch (type) {
        case 'css':
        case 'font':
          tag = document.createElement('link');
          tag.rel = type === 'css' ? 'stylesheet' : 'preload';
          tag.as = type === 'font' ? 'font' : '';
          break;
        case 'js':
          tag = document.createElement('script');
          break;
        default:
          reject(new Error(`Unsupported resource type: ${type}`));
          return null;
      }
      return tag;
    };

    const tag = createTag();
    if (!tag) return; // 如果类型不支持，前面已reject，这里直接返回

    // 设置资源URL
    if (type === 'js') {
      tag.src = url;
    } else {
      tag.href = url;
    }

    // 加载完成的回调
    const onLoadOrError = (success) => {
      const action = success ? 'loaded' : 'failed';
      console.log(`[tool][loadExternalResource]Resource ${action}:`, url);
      (success ? resolve : reject)(url);
    };

    // 事件监听
    tag.onload = () => onLoadOrError(true);
    tag.onerror = () => onLoadOrError(false);

    // 插入文档
    document.head.appendChild(tag);
  });
};

export {
  checkIpVersion,
  checkLiveM3U8,
  copyToClipboardApi,
  dictDeepClone,
  getLocalStorage,
  setLocalStorage,
  getPinia,
  loadExternalResource,
};
