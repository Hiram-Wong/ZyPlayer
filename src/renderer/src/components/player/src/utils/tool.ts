import { requestComplete } from '@/utils/request';

const publicBarrageSend = (url: string, options: any) => {
  const removeEmptyParams = (url: string) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search.slice(1));
    params.forEach((value, key) => {
      if (!value) params.delete(key);
    });
    urlObj.search = params.toString();
    return urlObj.toString();
  };

  const data = {
    player: options.player,
    text: options.text,
    time: options.time,
    color: options.color,
    type: options.type,
  };

  requestComplete({ url: removeEmptyParams(url), method: 'POST', data });
};

class publicStorage {
  name: string;
  settings: {};
  constructor(name: string) {
    this.name = name;
    this.settings = {};
  }

  get(key: string) {
    try {
      const storage = JSON.parse(localStorage.getItem(this.name) || '{}');
      return key ? storage[key] : storage;
    } catch (error) {
      return key ? this.settings[key] : this.settings;
    }
  }

  set(key: string, value: any) {
    try {
      const storage = Object.assign({}, this.get(''), {
        [key]: value,
      });
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      this.settings[key] = value;
    }
  }

  del(key: string) {
    try {
      const storage = this.get('');
      delete storage[key];
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      delete this.settings[key];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.name);
    } catch (error) {
      this.settings = {};
    }
  }
}

const playerStorage = new publicStorage('player_settings');

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

const mediaUtils = (() => {
  const formatUrlHeaders = (url: string, headers: { [key: string]: string } = {}) => {
    if (headers && Object.keys(headers).length > 0) {
      for (const key in headers) {
        let valye = headers[key];
        if (valye.includes('=')) valye = valye.replaceAll('=', '$*&');
        url += `@${key}=${valye}`;
      }
    }
    return url;
  };

  const formatRemoveUnSafeHeaders = (headers: { [key: string]: string }) => {
    const unsafeHeads = ['host', 'referer', 'origin', 'user-agent', 'content-length', 'set-cookie', 'cookie'];

    for (const header in headers) {
      if (unsafeHeads.includes(header.toLowerCase())) delete headers[header];
    }

    return headers;
  };

  // 支持的媒体格式映射
  const supportedFormats: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/x-flv': 'flv',
    'video/ogg': 'ogx',
    'application/vnd.apple.mpegurl': 'm3u8',
    'application/x-mpegURL': 'm3u8',
    'application/octet-stream': 'm3u8',
    'application/dash+xml': 'mpd',
    'video/avi': 'avi',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'video/quicktime': 'mov',
    'video/x-ms-wmv': 'wmv',
    'video/3gpp': '3gp',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/aac': 'aac',
    'audio/ogg': 'oga',
  };

  // 视频类型与播放器映射
  const videoTypeMap: Record<string, string> = {
    mp4: 'customMp4',
    flv: 'customFlv',
    m3u8: 'customHls',
    mpd: 'customDash',
    magnet: 'customWebTorrent',
    mp3: 'customMpegts',
    mkv: 'customMp4',
    m4a: 'customMpegts',
    wav: 'customMpegts',
    flac: 'customMpegts',
    aac: 'customMpegts',
    ogg: 'customMpegts',
    wma: 'customMpegts',
  };

  // 根据URL直接匹配文件格式
  const supportedFormatsLookup = (url: string): string | undefined => {
    if (url.startsWith('magnet:')) return 'magnet';
    else if (/^(https?:\/\/)/.test(url)) {
      try {
        const { pathname } = new URL(url);
        const parts = pathname.split('.');
        const suffix = parts.length > 1 ? parts.slice(-1)[0] : '';
        return Object.values(supportedFormats).find((format) => suffix.includes(format));
      } catch (err) {
        return undefined;
      }
    }
    return undefined;
  };

  // 映射 Content-Type 到具体格式
  const mapContentTypeToFormat = (contentType: string): string | undefined => {
    const entry = Object.entries(supportedFormats).find(([type]) =>
      contentType.includes(type)
    );
    return entry ? entry[1] : undefined;
  };

  // 使用 fetch 获取媒体类型
  const getMediaType = async (url: string, headers: { [key: string]: any }): Promise<string | undefined> => {
    try {
      url = formatUrlHeaders(url, headers);
      const response = await requestComplete({ url, method: 'HEAD', timeout: 5000 });
      if (response.status === 200) {
        const contentType = response.headers['content-type'] || '';
        return mapContentTypeToFormat(contentType);
      }
      return undefined;
    } catch (err: any) {
      console.log(`[mediaUtils][getMediaType][error]: ${err.message}`);
      return undefined;
    }
  };

  // 检查媒体类型
  const checkMediaType = async (url: string, headers: { [key: string]: any }): Promise<string | undefined> => {
    if (!url || !(/^(https?:\/\/)/.test(url) || url.startsWith('magnet:'))) return undefined;

    const fileType = supportedFormatsLookup(url);
    return fileType || (await getMediaType(url, headers));
  };

  // 映射视频类型到播放器类型
  const mediaType2PlayerType = (videoType: string): string => {
    return videoTypeMap[videoType] || 'customHls'; // 默认播放器类型为 customHls
  };

  // 导出函数
  return {
    checkMediaType,
    mediaType2PlayerType,
    formatRemoveUnSafeHeaders,
    formatUrlHeaders,
  };
})();

export { publicBarrageSend, playerStorage, singleton, mediaUtils };
