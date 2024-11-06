import ipaddr from 'ipaddr.js';
import request, { requestComplete } from '@/utils/request';
import { usePlayStore, useSettingStore } from '@/store';

const supportedFormats: string[] = [
  'mp4',
  'mkv',
  'flv',
  'm3u8',
  'avi',
  'magnet',
  'mpd',
  'mpd',
  'mp3',
  'm4a',
  'wav',
  'flac',
  'aac',
  'ogg',
  'wma',
];

// 判断媒体类型
const checkMediaType = async (url: string): Promise<string> => {
  if (url && (url.startsWith('http') || url.startsWith('magnet'))) {
    const fileType: any = supportedFormats.find((format) => url.includes(format));
    if (fileType) {
      return fileType;
    } else {
      const getMediaType: any = await getMeadiaType(url);
      return getMediaType;
    }
  } else {
    return ''; // 如果 URL 不以 http 开头，返回 null
  }
};

const getMeadiaType = async (url: string): Promise<string> => {
  let mediaType: string = 'unknown';
  try {
    const response = await requestComplete({
      url,
      method: 'HEAD',
    });
    if (response.status === 200) {
      const contentType = response.headers['content-type'];
      const supportedFormats: Record<string, string> = {
        'video/mp4': 'mp4',
        'video/x-flv': 'flv',
        'video/ogg': 'ogx',
        'application/vnd.apple.mpegurl': 'm3u8',
        'application/x-mpegURL': 'm3u8',
        'application/octet-stream': 'm3u8',
        'video/avi': 'avi',
        'video/x-msvideo': 'avi',
        'video/x-matroska': 'mkv',
        'video/quicktime': 'mov',
        'video/x-ms-wmv': 'wmv',
        'video/3gpp': '3gp',
        'audio/mpeg': 'mp3',
        'audio/wav': 'mav',
        'audio/aac': 'aac',
        'audio/ogg': 'oga',
      };

      for (const format in supportedFormats) {
        if (contentType.includes(format)) {
          mediaType = supportedFormats[format];
        }
      }
    } else {
      mediaType = 'error';
    }
  } catch (err) {
    mediaType = 'error';
    throw err;
  } finally {
    console.log(`媒体播放类型：${mediaType}`);
    return mediaType;
  }
};

const checkIpVersion = async (url: string) => {
  let version = -1;
  try {
    const hostname = new URL(url).hostname;
    const ip = ipaddr.parse(hostname);
    if (ip.kind() === 'ipv4') {
      version = 4;
    } else if (ip.kind() === 'ipv6') {
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

const singleton = <T extends new (...args: any[]) => any>(className: T): T => {
  let instance: InstanceType<T> | null = null;
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance as InstanceType<T>;
    },
  });
  proxy.prototype.construct = proxy;
  return proxy;
};
const mapVideoTypeToPlayerType = (videoType: string): string | undefined => {
  const audioTypes = ['mp3', 'm4a', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  if (audioTypes.includes(videoType)) return 'customMpegts';

  switch (videoType) {
    case 'mp4':
      return 'customMp4';
    case 'flv':
      return 'customFlv';
    case 'm3u8':
      return 'customHls';
    case 'mpd':
      return 'customDash';
    case 'magnet':
      return 'customWebTorrent';
    default:
      return 'customHls';
  }
};

export {
  mapVideoTypeToPlayerType,
  singleton,
  supportedFormats,
  getMeadiaType,
  checkMediaType,
  checkIpVersion,
  checkLiveM3U8,
  copyToClipboardApi,
  dictDeepClone,
  getLocalStorage,
  setLocalStorage,
  getPinia,
  loadExternalResource,
};
