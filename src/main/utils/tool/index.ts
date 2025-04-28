import { desktopCapturer } from 'electron';
import { getWin, getAllWin } from '@main/core/winManger';
import request from '@main/utils/request';
import { ipVersion } from 'is-ip';

const toggleWinVisable = (status: boolean | undefined = undefined) => {
  const wins = getAllWin().filter((win) => !win.isDestroyed());
  if (wins.length === 0) return;
  const isVisable = typeof status === 'boolean' ? !status : wins.some((win) => win.isVisible());
  wins.forEach((win) => {
    if (isVisable) win.hide();
    else win.show();

    win.webContents.send('media-control', !isVisable);
    win.webContents.setAudioMuted(isVisable);
  });

  const playWin = getWin('play');
  if (playWin && !playWin.isDestroyed() && !isVisable) playWin.focus();
};

const parseCustomUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url.trim());

    const [redirectURL, ...headerParts] = decodedUrl.split('@');

    if (headerParts.length === 0) {
      return { redirectURL, headers: {} };
    }

    const headers = headerParts.reduce<Record<string, string>>((acc, part) => {
      const [rawKey, rawValue] = part.split('=');

      if (rawKey && rawValue) {
        const key = rawKey
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');

        const value = rawValue.replaceAll('$*&', '=');
        acc[key] = value;
      }

      return acc;
    }, {});

    return { redirectURL, headers };
  } catch {
    return { redirectURL: url, headers: {} };
  }
};

const isLocalhostRef = (url: string): boolean => `${url}`.includes('//localhost') || `${url}`.includes('//127.0.0.1');

const isUrlScheme = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const BROWER = ['http:', 'https:', 'file:', 'data:', 'blob:', 'about:', 'javascript:', 'mailto:', 'tel:', 'sms:', 'ftp:'];
    const CHROME = ['chrome:', 'chrome-extension:', 'chrome-untrusted:', 'chrome-search:', 'chrome-devtools:', 'devtools:'];
    const SPECIAL  = ['magnet:', 'webtorrent:'];
    const SAFE = [...BROWER, ...CHROME, ...SPECIAL];
    return !SAFE.includes(parsed.protocol);
  } catch (err) {
    return true;
  }
};

const getIP = async () => {
  const urls = ['https://ipv6.icanhazip.com', 'https://ipv4.icanhazip.com'];
  const res: any = {
    ip: '',
    version: undefined,
  };

  for (const url of urls) {
    try {
      const response = await request({ url, method: 'GET' });
      if (response.trim()) res.ip = response.trim();
      res.version = ipVersion(res.ip);
    } catch {}
  }

  return res;
};

const getConfig = async (options) => {
  const response = await request({ ...options });
  return response;
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

const findWinByName = async (name: string) => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
  const source = sources.find((item) => item.name.toLowerCase().includes(name));
  return source;
};

export { isLocalhostRef, isUrlScheme, parseCustomUrl, toggleWinVisable, getIP, getConfig, singleton, findWinByName };
