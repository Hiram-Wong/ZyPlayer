import axios from 'axios';
import JSON5 from 'json5';
import ip from 'ip';

axios.defaults.withCredentials = true; //让ajax携带cookie

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

    const response = await axios({
      method,
      url,
      data: method !== 'GET' ? body : undefined,
      headers: headers || undefined,
    });

    let responseData;
    try {
      responseData = JSON5.parse(response.data);
    } catch (parseError) {
      responseData = response.data;
    }

    return responseData || false;
  } catch (err) {
    throw err;
  }
};

// 判断媒体类型
const checkMediaType = async (url: string): Promise<string | null> => {
  const supportedFormats: string[] = ['mp4', 'mkv', 'flv', 'm3u8', 'avi', 'magnet'];

  if (url.startsWith('http') || url.startsWith('magnet')) {
    const fileType = supportedFormats.find((format) => url.includes(format));
    if (fileType) {
      return fileType;
    } else {
      const getMediaType = await getMeadiaType(url);
      return getMediaType;
    }
  } else {
    return null; // 如果 URL 不以 http 开头，返回 null
  }
};

const getMeadiaType = async (url: string): Promise<string> => {
  let mediaType: string = 'unknown';
  try {
    const res = await axios.head(url);
    if (res.status === 200) {
      const contentType = res.headers['content-type'];
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
    const res = await axios.get(url);
    const m3u8Content = res.data;

    const isLiveStream = !(
      m3u8Content.indexOf('#EXT-X-ENDLIST') !== -1 ||
      (m3u8Content.indexOf('#EXT-X-PLAYLIST-TYPE') !== -1 &&
        m3u8Content.match(/#EXT-X-PLAYLIST-TYPE:(.*)/)[1].toUpperCase() === 'VOD') ||
      (m3u8Content.indexOf('#EXT-X-MEDIA-SEQUENCE') !== -1 &&
        parseInt(m3u8Content.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/)[1]) === 0)
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

export { getConfig, getMeadiaType, checkMediaType, checkUrlIpv6, checkLiveM3U8, copyToClipboardApi, dictDeepClone };
