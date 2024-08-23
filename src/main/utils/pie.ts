import { app, BrowserWindow } from 'electron';
import { register as localshortcutRegister, unregisterAll as localshortcutUnregisterAll } from 'electron-localshortcut';
import { nanoid } from 'nanoid';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';

import { setting } from '../core/db/service';
import logger from '../core/logger';

interface PieResponse {
  code: number;
  message: 'success' | 'fail';
  data: any;
}

pie.initialize(app);
let snifferWindow: BrowserWindow;

const urlRegex: RegExp = new RegExp(
  'http((?!http).){12,}?\\.(m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3|tos)\\?.*|http((?!http).){12,}\\.(m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*|http((?!http).)*?obj/tos*',
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
  run_script: string = '',
  init_script: string = '',
  parse_extra: any = { custom_regex: '', sniffer_exclude: ''},
  ua: string | null = null,
): Promise<PieResponse> => {
  logger.info(`[sniffer] sniffer url: ${url}`);
  logger.info(`[sniffer] sniffer ua: ${ua}`);
  logger.info(`[sniffer] sniffer init_script: ${init_script}`);
  // logger.info(`[sniffer] sniffer run_script: ${run_script}`);

  const pageId = nanoid(); // 生成page页面id

  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    const debugStatus = setting.find({ key: 'debug' })?.value || false;
    snifferWindow = new BrowserWindow({ show: debugStatus }); // 创建无界面窗口
    localshortcutRegister(snifferWindow!, ['CommandOrControl+Shift+I', 'F12'], () => {
      if (snifferWindow!.webContents.isDevToolsOpened()) {
        snifferWindow!.webContents.closeDevTools();
      } else {
        snifferWindow!.webContents.openDevTools();
      }
    });
    snifferWindow.webContents.setAudioMuted(true); // 设置窗口静音
    snifferWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    }); // 禁止新窗口打开

    const page = await pie.getPage(browser, snifferWindow); // 获取页面
    const pageRecord = { page, browser, timestamp: Date.now() / 1000, timerId: null };
    pageStore[pageId] = pageRecord; // 存储页面

    if (ua) await page.setUserAgent(ua); // 设置ua
    if (init_script && init_script.trim()) {
      try {
        await page.evaluateOnNewDocument(init_script);
      } catch (e: any) {
        logger.info(`[pie]执行初始化页面脚本发生错误:${e.message}`);
      }
    }
    await page.setRequestInterception(true); // 开启请求拦截

    return new Promise(async (resolve, reject) => {
      const cleanup = async (pageId: string) => {
        if (pageId) {
          if (pageStore[pageId]) {
            if (pageStore[pageId]?.timerId) await clearTimeout(pageStore[pageId].timerId);
            if (pageStore[pageId]?.page)
              await pageStore[pageId].page.close().catch((err) => logger.error(`[pie][close]${err}`));
            if (pageStore[pageId]?.browser) await pageStore[pageId].browser.disconnect();
            delete pageStore[pageId];
          }
        }
      };

      page.on('request', async (req) => {
        if (req.isInterceptResolutionHandled())
          return req.abort().catch((err) => logger.error(`[pie][isInterceptResolutionHandled]${err}`)); // 已处理过的请求不再处理

        const reqUrl = req.url(); // 请求url
        // logger.info(`[reqUrl]:${reqUrl}`);
        const reqHeaders = req.headers(); // 请求头
        const { referer, 'user-agent': userAgent } = reqHeaders;
        const headers = {};
        if (referer) headers['referer'] = referer;
        if (userAgent) headers['user-agent'] = userAgent;

        if (parse_extra?.sniffer_exclude && reqUrl.match(new RegExp(parse_extra?.sniffer_exclude, 'gi'))) {
          logger.info(`[pie][正则排除] 请求地址:${reqUrl}, 规则: ${parse_extra.sniffer_exclude}`);
          return req.continue().catch((err) => logger.error(`[pie][continue]${err}`));
        }

        if (parse_extra?.custom_regex && reqUrl.match(new RegExp(parse_extra?.custom_regex, 'gi'))) {
          logger.info(`[pie][正则匹配] 请求地址:${reqUrl}, 规则: ${parse_extra.custom_regex}`);
          page.removeAllListeners('request');
          await cleanup(pageId);
          req.abort().catch((err) => logger.error(`[pie][RegExp]${err}`));
          return resolve(handleResponse(200, 'success', { url: reqUrl, header: headers }));
        }

        if (isVideoUrl(reqUrl)) {
          logger.info(`[pie][后缀匹配] 请求地址:${reqUrl}`);
          page.removeAllListeners('request');
          await cleanup(pageId);
          req.abort().catch((err) => logger.error(`[pie][isVideoUrl]${err}`));
          return resolve(handleResponse(200, 'success', { url: reqUrl, header: headers }));
        }

        if (req.method().toLowerCase() === 'head') {
          return req.abort().catch((err) => logger.error(`[pie][method]${err}`));
        }

        if (/\.(png|jpg|jpeg|ttf)$/.test(reqUrl) && ['stylesheet', 'image', 'font'].includes(req.resourceType())) {
          return req.abort().catch((err) => logger.error(`[pie][resourceType]${err}`));
        }

        req.continue().catch((err) => logger.error(`[pie][continue]${err}`));
      });

      // 设置超时
      if (!pageStore[pageId].timerId) {
        logger.info('--------!timerId---------');
        pageStore[pageId].timerId = setTimeout(async () => {
          page.removeAllListeners('request');
          await cleanup(pageId);
          logger.info(`[pie]id: ${pageId} sniffer timeout`);
          reject(handleResponse(500, 'fail', new Error('sniffer timeout')));
        }, 15000);
      } else {
        logger.info('--------has timerId------');
      }

      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch((err) => logger.error(err));

      if (run_script.trim()) {
        try {
          logger.info(`[sniffer] sniffer run_script in js_code: ${run_script}`);
          const js_code = `
            (function() {
              var scriptTimer;
              var scriptCounter = 0;
              scriptTimer = setInterval(function() {
                if (location.href !== 'about:blank') {
                  scriptCounter += 1;
                  console.log('---第' + scriptCounter + '次执行script[' + location.href + ']---');
                  ${run_script}
                  clearInterval(scriptTimer);
                  scriptCounter = 0;
                  console.log('---执行script成功---');
                }
              }, 200);
            })();
          `;
          await page.evaluateOnNewDocument(js_code);
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
