import JSON5 from 'json5';
import ip from 'ip';

import request, { requestComplete } from '@/utils/request';
import { usePlayStore, useSettingStore } from '@/store';

const getConfig = async (url: string, method = 'GET', headers = {}, body = {}) => {
  try {
    const customHeaders = {
      Cookie: 'custom-cookie',
      'User-Agent': 'custom-ua',
      Referer: 'custom-referer',
    };

    for (const [originalHeader, customHeader] of Object.entries(customHeaders)) {
      if (headers.hasOwnProperty(originalHeader)) {
        headers[customHeader] = headers[originalHeader];
        delete headers[originalHeader];
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

    return res || false;
  } catch (err) {
    throw err;
  }
};

// 判断媒体类型
const checkMediaType = async (url: string): Promise<string> => {
  const supportedFormats: string[] = ['mp4', 'mkv', 'flv', 'm3u8', 'avi', 'magnet'];

  if (url.startsWith('http') || url.startsWith('magnet')) {
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
        'application/vnd.apple.mpegurl': 'm3u8',
        'application/x-mpegURL': 'm3u8',
        'application/octet-stream': 'm3u8',
        'video/avi': 'avi',
        'video/x-msvideo': 'avi',
        'video/x-matroska': 'mkv',
        'video/quicktime': 'mov',
        'video/x-ms-wmv': 'wmv',
        'video/3gpp': '3gp',
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

export {
  getConfig,
  getMeadiaType,
  checkMediaType,
  checkUrlIpv6,
  checkLiveM3U8,
  copyToClipboardApi,
  dictDeepClone,
  getLocalStorage,
  setLocalStorage,
  getPinia,
};
