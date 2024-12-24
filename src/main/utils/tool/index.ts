import { BrowserWindow, desktopCapturer } from 'electron';
import { getWin } from '@main/core/winManger';
import request from '@main/utils/request';
import { ipVersion } from 'is-ip';

const toggleWindowVisibility = () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length === 0) return;
  const anyVisible = windows.some((win) => win.isVisible());
  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      const playWin = getWin('play');
      if (anyVisible) {
        win.hide();
        if (playWin) {
          playWin.webContents.send('media-control', false);
          playWin.webContents.setAudioMuted(true);
        }
      } else {
        win.show();
        if (playWin) {
          playWin.webContents.send('media-control', true);
          playWin.webContents.setAudioMuted(false);
          playWin.focus();
        }
      }
    }
  });
};

const parseCustomUrl = (url: string) => {
  url = decodeURIComponent(url);
  const [redirectURL, ...headerParts] = url.split('@');

  const headers = headerParts.reduce((acc, part) => {
    let [key, value] = part.split('=');
    value = value.replaceAll('$*&', '=');
    acc[key] = value;
    return acc;
  }, {});

  return { redirectURL, headers };
};

const isLocalhostRef = (url: string) => `${url}`.includes('//localhost') || `${url}`.includes('//127.0.0.1');

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

export { isLocalhostRef, parseCustomUrl, toggleWindowVisibility, getIP, getConfig, singleton, findWinByName };
