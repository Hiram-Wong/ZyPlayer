import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import Md5 from 'crypto-js/md5';
import * as he from 'he';
import iconv from 'iconv-lite';
import ip from 'ip';
import JSON5 from 'json5';
import pako from 'pako';

import request, { requestComplete } from '@/utils/request';
import { usePlayStore, useSettingStore } from '@/store';

/**
 * 将obj所有key变小写
 * @param obj
 */
function keysToLowerCase(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const newKey = key.toLowerCase();
    result[newKey] = obj[key]; // 如果值也是对象，可以递归调用本函数
    return result;
  }, {});
}

const getConfig = async (url: string, method = 'GET', headers = {}, body = {}) => {
  try {
    const customHeaders = {
      Cookie: 'custom-cookie',
      Origin: 'custom-origin',
      Host: 'custom-host',
      Connection: 'custom-connection',
      'User-Agent': 'custom-ua',
      Referer: 'custom-referer',
      Redirect: 'custom-redirect',
    };
    headers = keysToLowerCase(headers);

    for (const [originalHeader, customHeader] of Object.entries(customHeaders)) {
      let originalHeaderKey = originalHeader.toLowerCase();
      if (headers.hasOwnProperty(originalHeaderKey)) {
        headers[customHeader] = headers[originalHeaderKey];
        delete headers[originalHeaderKey];
      }
    }

    const response = await request({
      url,
      method,
      data: method !== 'GET' ? body : undefined,
      headers: headers || undefined,
    });

    let res;
    try {
      res = JSON5.parse(response);
    } catch (parseError) {
      res = response;
    }

    return res || '';
  } catch (err) {
    throw err;
  }
};

const getHtml = async (url: string, method = 'GET', encode = 'UTF-8', headers = {}, body = {}) => {
  try {
    const customHeaders = {
      Cookie: 'custom-cookie',
      Origin: 'custom-origin',
      Host: 'custom-host',
      Connection: 'custom-connection',
      'User-Agent': 'custom-ua',
      Referer: 'custom-referer',
      Redirect: 'custom-redirect',
    };
    headers = keysToLowerCase(headers);

    for (const [originalHeader, customHeader] of Object.entries(customHeaders)) {
      let originalHeaderKey = originalHeader.toLowerCase();
      if (headers.hasOwnProperty(originalHeaderKey)) {
        headers[customHeader] = headers[originalHeaderKey];
        delete headers[originalHeaderKey];
      }
    }

    const response = await request({
      url,
      method,
      responseType: 'arraybuffer',
      data: method !== 'GET' ? body : undefined,
      headers: headers || undefined,
    });

    const res = iconv.decode(Buffer.from(response), encode); // 假设后端编码为GBK
    return res || '';
  } catch (err) {
    throw err;
  }
};

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

const checkUrlIpv6 = async (url: string) => {
  let hostname = new URL(url).hostname;
  if (ip.isV4Format(hostname)) {
    return 'IPv4';
  } else if (ip.isV6Format(hostname)) {
    return 'IPv6';
  } else {
    return 'Unknown';
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

const encodeBase64 = (str: string) => {
  return Base64.stringify(Utf8.parse(str));
};

const decodeBase64 = (str: string) => {
  return Base64.parse(str).toString(Utf8);
};

const encodeBtoa = (str: string) => {
  return btoa(str);
};

const decodeAtob = (str: string) => {
  return btoa(str);
};

const encodeGzip = (str: string) => {
  return pako.gzip(str, {});
};
const decodeGzip = (str: string | Uint8Array) => {
  return pako.inflate(str);
};

const encodeUnicode = (str: string) => {
  const encodeUnicode = (str: string) => {
    const res: any = [];
    for (var i = 0; i < str.length; i++) {
      res[i] = ('00' + str.charCodeAt(i).toString(16)).slice(-4);
    }
    return '\\u' + res.join('\\u');
  };
  return encodeUnicode(str);
};

const decodeUnicode = (str: string) => {
  function decodeUnicode(str) {
    str = str.replace(/\\/g, '%');
    return unescape(str);
  }
  return decodeUnicode(str);
};

const encodeUrl = (str: string) => {
  return encodeURIComponent(str);
};

const decodeUrl = (str: string) => {
  return decodeURIComponent(str);
};

const encodeMd5 = (str: string) => {
  return Md5(str).toString();
};

const encodeHtml = (str: string) => {
  return he.encode(str, { encodeEverything: true });
};

const decodeHtml = (str: string) => {
  return he.decode(str);
};

const getPublicIp = async () => {
  const urls = ['https://ipv6.icanhazip.com', 'https://ipv4.icanhazip.com'];

  for (const url of urls) {
    try {
      const response = await request({ url, method: 'GET' });
      if (response) return response.trim();
    } catch (err) {
      console.info(`[tool][getPublicIp] Error fetching from ${url}:`, err);
    }
  }

  return null;
};

export {
  getConfig,
  getHtml,
  getPublicIp,
  supportedFormats,
  getMeadiaType,
  checkMediaType,
  checkUrlIpv6,
  checkLiveM3U8,
  copyToClipboardApi,
  dictDeepClone,
  getLocalStorage,
  setLocalStorage,
  getPinia,
  loadExternalResource,
  encodeBase64,
  decodeBase64,
  encodeUnicode,
  decodeUnicode,
  encodeUrl,
  decodeUrl,
  encodeMd5,
  encodeGzip,
  decodeGzip,
  encodeBtoa,
  decodeAtob,
  encodeHtml,
  decodeHtml,
};
