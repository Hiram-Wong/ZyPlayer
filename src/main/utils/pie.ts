import { app, BrowserWindow } from 'electron';
import { nanoid } from 'nanoid';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';
import logger from '../core/logger';

interface PieResponse {
  code: number;
  message: 'success' | 'fail';
  data: any;
}

pie.initialize(app);
let snifferWindow: BrowserWindow;

const urlRegex: RegExp = new RegExp(
  'http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3|tos)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*',
);
const pageStore: object = {};

const handleResponse = (code: number, message: 'success' | 'fail', data: object | Error): PieResponse => {
  let dataString: any;
  if (typeof data === 'object') {
    dataString = JSON.stringify(data);
  } else {
    dataString = data;
  }
  logger.info(`[sniffer] code: ${code} - message: ${message} - data: ${dataString}`);
  return { code, message, data };
};

// 排除url
const isExcludedUrl = (reqUrl: string): boolean => {
  return /\.(css|html)$/.test(reqUrl) || /(url=http|v=http)/i.test(reqUrl);
};

// 视频url
const isVideoUrl = (reqUrl) => {
  return reqUrl.match(urlRegex) && !isExcludedUrl(reqUrl);
};

const puppeteerInElectron = async (
  url: string,
  script: string = '',
  customRegex: string,
  ua: string | null = null,
): Promise<PieResponse> => {
  logger.info(`[sniffer] sniffer url: ${url}`);
  logger.info(`[sniffer] sniffer ua: ${ua}`);

  const pageId = nanoid(); // 生成page页面id

  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    snifferWindow = new BrowserWindow({ show: false }); // 创建无界面窗口
    snifferWindow.webContents.setAudioMuted(true); // 设置窗口静音

    const page = await pie.getPage(browser, snifferWindow); // 获取页面
    const pageRecord = { page, browser, timestamp: Date.now() / 1000, timeoutId: null };
    pageStore[pageId] = pageRecord; // 存储页面

    if (ua) await page.setUserAgent(ua); // 设置ua
    await page.setRequestInterception(true); // 开启请求拦截

    return new Promise(async (resolve, reject) => {
      const cleanup = async (pageId: string) => {
        if (pageId) {
          if (pageStore[pageId]) {
            if (pageStore[pageId]?.timeoutId) clearTimeout(pageStore[pageId].timeoutId);
            if (pageStore[pageId]?.page) await pageStore[pageId].page.close().catch((err) => logger.error(err));
            if (pageStore[pageId]?.browser) await pageStore[pageId].browser.disconnect();
            delete pageStore[pageId];
          }
        }
      };

      page.on('request', async (req) => {
        if (req.isInterceptResolutionHandled()) return; // 已处理过的请求不再处理

        const reqUrl = req.url(); // 请求url
        const reqHeaders = req.headers(); // 请求头
        const { referer, 'user-agent': userAgent } = reqHeaders;
        const headers = {};
        if (referer) headers['referer'] = referer;
        if (userAgent) headers['user-agent'] = userAgent;

        if (customRegex && reqUrl.match(new RegExp(customRegex, 'gi'))) {
          logger.info(`[pie]正则匹配:${reqUrl}`);
          await cleanup(pageId);
          req.abort().catch((e) => logger.error(e));
          resolve(handleResponse(200, 'success', { url: reqUrl, header: headers }));
        }

        if (isVideoUrl(reqUrl)) {
          logger.info(`[pie]后缀名匹配:${reqUrl}`);
          await cleanup(pageId);
          req.abort().catch((e) => logger.error(e));
          resolve(handleResponse(200, 'success', { url: reqUrl, header: headers }));
        }

        if (req.method().toLowerCase() === 'head') {
          req.abort().catch((err) => logger.error(err));
        }

        if (['font'].includes(req.resourceType())) {
          req.abort().catch((err) => logger.error(err));
        }

        req.continue().catch((err) => logger.error(err));
      });

      // 设置超时
      if (!pageStore[pageId].timerId) {
        logger.info('--------!timerId---------');
        pageStore[pageId].timerId = setTimeout(async () => {
          await cleanup(pageId);
          reject(handleResponse(500, 'fail', new Error('fail', { cause: 'sniffer timeout' })));
        }, 15000);
      } else {
        logger.info('--------has timerId------');
      }

      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch((err) => logger.error(err));

      if (script.trim()) {
        try {
          logger.info(`[sniffer] sniffer script: ${script}`);
          const js_code = `
            (function() {
              var scriptTimer;
              var scriptCounter = 0;
              scriptTimer = setInterval(function() {
                if (location.href !== 'about:blank') {
                  scriptCounter += 1;
                  console.log('---第' + scriptCounter + '次执行script[' + location.href + ']---');
                  ${script}
                  clearInterval(scriptTimer);
                  scriptCounter = 0;
                  console.log('---执行script成功---');
                }
              }, 200);
            })();
          `;
          await page.evaluateOnNewDocument((script = js_code));
          await page.evaluate(js_code);
        } catch (err) {
          logger.info(`[pie][error]run script: ${err}`);
        }
      }
    });
  } catch (err) {
    return handleResponse(500, 'fail', err as Error);
  }
};

export default puppeteerInElectron;
