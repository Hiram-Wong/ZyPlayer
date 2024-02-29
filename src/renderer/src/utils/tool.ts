import axios from 'axios';
import JSON5 from "json5";
import ip from 'ip';

const getConfig = async (url, header = {}) => {
  try {
    let res;
    if( header ) res = await axios.get(url, {headers: { ...header }});
    else res = await axios.get(url);
    let response;

    try {
      response = JSON5.parse(res.data);
    } catch (err) {
      response = res.data;
    }

    return response || false;
  } catch (err) {
    throw err;
  }
}

const getMeadiaType = async(url: string): Promise<string> => {
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
}

const checkUrlIpv6 = async(url: string) => {
  let hostname = new URL(url).hostname;
  if (ip.isV4Format(hostname)) {
    return "IPv4";
  } else if (ip.isV6Format(hostname)) {
    return "IPv6";
  } else {
    return "Unknown";
  }
}

const checkLiveM3U8 = async(url: string): Promise<boolean> =>{
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
    throw err;
  }
}

export { getConfig, getMeadiaType, checkUrlIpv6, checkLiveM3U8 }