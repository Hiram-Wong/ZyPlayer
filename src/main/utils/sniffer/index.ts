import { app, BrowserWindow } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';
import { createWin } from '@main/core/winManger';
import logger from '@main/core/logger';
import { PC_UA, IOS_UA } from '@main/utils/hiker/ua';

interface PieResponse {
  code: number;
  msg: string;
  data: any;
}

pie.initialize(app);
let snifferWindow: BrowserWindow;

const urlRegex: RegExp = new RegExp(
  'http((?!http).){12,}?\\.(m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3|tos)\\?.*|http((?!http).){12,}\\.(m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*|http((?!http).)*?obj/tos*',
);
const pageStore: object = {};

const handleResponse = (code: number, msg: string = 'ok', data: object | Error): PieResponse => {
  let dataString: any;
  if (typeof data === 'object') {
    dataString = JSON.stringify(data);
  } else {
    dataString = data;
  }
  logger.info(`[sniffer] code: ${code} - msg: ${msg} - data: ${dataString}`);
  return { code, msg, data };
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
  run_script: string,
  init_script: string,
  custom_regex: string,
  sniffer_exclude: string,
  is_pc: boolean = false,
): Promise<PieResponse> => {
  logger.info(`[sniffer] sniffer url: ${url}`);
  logger.info(`[sniffer] sniffer is_pc: ${is_pc}`);
  logger.info(`[sniffer] sniffer init_script: ${init_script}`);
  logger.info(`[sniffer] sniffer run_script: ${run_script}`);

  const pageId = uuidv4(); // 生成page页面id

  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    const debugStatus = global.variable.debug || false;
    snifferWindow = createWin(`sniffer-${pageId}`, { title: 'zy-sniifer', show: debugStatus }); // 创建无界面窗口
    snifferWindow.webContents.setAudioMuted(true); // 设置窗口静音
    snifferWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    }); // 禁止新窗口打开

    const page = await pie.getPage(browser, snifferWindow); // 获取页面
    const pageRecord = { page, browser, timestamp: Date.now() / 1000, timerId: null };
    pageStore[pageId] = pageRecord; // 存储页面

    await page.setUserAgent(is_pc ? PC_UA : IOS_UA); // 设置ua
    if (init_script && init_script.trim()) {
      try {
        await page.evaluateOnNewDocument(init_script);
      } catch (err: any) {
        logger.info(`[pie]执行初始化页面脚本发生错误:${err.message}`);
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

        if (sniffer_exclude && reqUrl.match(new RegExp(sniffer_exclude, 'gi'))) {
          logger.info(`[pie][正则排除] 请求地址:${reqUrl}, 规则: ${sniffer_exclude}`);
          return req.continue().catch((err) => logger.error(`[pie][continue]${err}`));
        }

        if (custom_regex && reqUrl.match(new RegExp(custom_regex, 'gi'))) {
          logger.info(`[pie][正则匹配] 请求地址:${reqUrl}, 规则: ${custom_regex}`);
          page.removeAllListeners('request');
          await cleanup(pageId);
          req.abort().catch((err) => logger.error(`[pie][RegExp]${err}`));
          return resolve(handleResponse(0, 'ok', { url: reqUrl, headers: headers }));
        }

        if (isVideoUrl(reqUrl)) {
          logger.info(`[pie][后缀匹配] 请求地址:${reqUrl}`);
          page.removeAllListeners('request');
          await cleanup(pageId);
          req.abort().catch((err) => logger.error(`[pie][isVideoUrl]${err}`));
          return resolve(handleResponse(0, 'ok', { url: reqUrl, headers: headers }));
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
          resolve(handleResponse(-1, 'sniffer timeout', new Error('sniffer timeout')));
        }, 15000);
      } else {
        logger.info('--------has timerId------');
      }

      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch((err) => logger.error(err));

      if (run_script.trim()) {
        try {
          logger.info(`[sniffer] sniffer run_script in js_code start`);
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
  } catch (err: any) {
    return handleResponse(-1, err.message, err as Error);
  }
};

export default puppeteerInElectron;
