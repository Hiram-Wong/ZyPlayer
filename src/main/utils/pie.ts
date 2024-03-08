import { app, BrowserWindow } from 'electron';
import puppeteer from "puppeteer-core";
import pie from "puppeteer-in-electron";
import logger from '../core/logger';

interface PieResponse {
  code: number;
  message: 'sucess' | 'fail';
  data: object | Error;
}

pie.initialize(app);

let timerId: NodeJS.Timeout | null = null;
let snifferWindow: BrowserWindow;
const urlRegex: RegExp = new RegExp('http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*');

const handleResponse = (code: number, message: 'sucess' | 'fail', data: object | Error): PieResponse => {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  let dataString;
  if (typeof data === 'object') {
    dataString = JSON.stringify(data);
  } else {
    dataString = data;
  }
  logger.info(`[sniffer] code: ${code} - message: ${message} - data: ${dataString}`);
  return({ code: code, message: message, data });
};

// 排除url
const isExcludedUrl = (reqUrl) => {
  return (
    reqUrl.indexOf('url=http') >= 0 ||
    reqUrl.indexOf('v=http') >= 0 ||
    reqUrl.indexOf('.css') >= 0 ||
    reqUrl.indexOf('.html') >= 0
  );
}

// 视频url
const isVideoUrl = (reqUrl) => {
  return reqUrl.match(urlRegex) && !isExcludedUrl(reqUrl);
}


const puppeteerInElectron = async (url: string, ua: string | null = null): Promise<PieResponse> => {
  logger.info(`[sniffer] sniffer url: ${url}`);

  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    snifferWindow = new BrowserWindow({ show: false }); // 创建无界面窗口
    snifferWindow.webContents.setAudioMuted(true); // 设置窗口静音
    const page = await pie.getPage(browser, snifferWindow); // 获取页面

    if (ua) await page.setUserAgent(ua); // 设置ua

    await page.setRequestInterception(true); // 开启请求拦截

    return new Promise((resolve, reject) => {
      page.on('request', async(req) => {
        const reqUrl = req.url(); // 请求url

        if (isVideoUrl(reqUrl)) {
          const reqHeaders = req.headers();
          const { referer, 'user-agent': userAgent } = reqHeaders;
          const headers = {};
          if (referer) headers['referer'] = referer;
          if (userAgent) headers['user-agent'] = userAgent;

          await page.close();
          await browser.disconnect();
          req.abort().catch((e) => console.error(e));
          resolve(handleResponse(200, 'sucess', { url: reqUrl, header: headers }));
        }

        if (req.isInterceptResolutionHandled()) return; // 已处理过的请求不再处理
        if (req.resourceType() === 'image') {
          req.abort().catch((err) => console.error(err));
        } else {
          req.continue().catch((err) => console.error(err));
        }
      });

      // 设置超时
      if (!timerId) {
        timerId = setTimeout(async () => {
          await page.close();
          await browser.disconnect();
          timerId = null;
          reject(new Error('嗅探失败', { cause: '请求超时' }));
        }, 15000);
      }

      page.goto(url).catch(e => reject(e));
    });
  } catch (e) {
    return handleResponse(500, 'fail', e as Error);
  }
};

export default puppeteerInElectron;