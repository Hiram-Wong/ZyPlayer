import { app, BrowserWindow } from 'electron';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';
import logger from '../core/logger';
import { v4 as uuidv4 } from 'uuid';

interface PieResponse {
  code: number;
  message: 'sucess' | 'fail';
  data: object | Error;
}

pie.initialize(app);
let snifferWindow: BrowserWindow;
const urlRegex: RegExp = new RegExp('http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*');
const pageStore: object = {};

const handleResponse = (code: number, message: 'sucess' | 'fail', data: object | Error, pageId: string): PieResponse => {
  if (pageId) {
    if (pageStore[pageId].timerId) {
      clearTimeout(pageStore[pageId].timerId);
    }
    delete pageStore[pageId];
  }
  let dataString;
  if (typeof data === 'object') {
    dataString = JSON.stringify(data);
  } else {
    dataString = data;
  }
  logger.info(`[sniffer] code: ${code} - message: ${message} - data: ${dataString}`);
  return ({ code: code, message: message, data });
};

// 排除url
const isExcludedUrl = (reqUrl) => {
  return (
    reqUrl.indexOf('url=http') >= 0 ||
    reqUrl.indexOf('v=http') >= 0 ||
    reqUrl.indexOf('.css') >= 0 ||
    reqUrl.indexOf('.html') >= 0
  );
};

// 视频url
const isVideoUrl = (reqUrl) => {
  return reqUrl.match(urlRegex) && !isExcludedUrl(reqUrl);
};

const puppeteerInElectron = async (url: string, script: string = '', customRegex: string, ua: string | null = null): Promise<PieResponse> => {
  logger.info(`[sniffer] sniffer url: ${url}`);
  logger.info(`[sniffer] sniffer script: ${script}`);
  logger.info(`[sniffer] sniffer ua: ${ua}`);
  let pageId = ''; // 如果窗口没起来就空的页面id
  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    snifferWindow = new BrowserWindow({ show: false }); // 创建无界面窗口
    snifferWindow.webContents.setAudioMuted(true); // 设置窗口静音
    const page = await pie.getPage(browser, snifferWindow); // 获取页面
    pageId = uuidv4(); // 生成page页面id
    pageStore[pageId] = { page: page, time: new Date().getTime() / 1000, timerId: null }; // 存储页面
    if (ua) await page.setUserAgent(ua); // 设置ua
    await page.setRequestInterception(true); // 开启请求拦截

    return new Promise(async (resolve, reject) => {
      page.on('request', async (req) => {
        const reqUrl = req.url(); // 请求url
        const reqHeaders = req.headers();
        const { referer, 'user-agent': userAgent } = reqHeaders;
        const headers = {};
        if (referer) headers['referer'] = referer;
        if (userAgent) headers['user-agent'] = userAgent;

        if (customRegex && reqUrl.match(new RegExp(customRegex, 'gi'))) {
          logger.info(`[pie]通过custom_regex嗅探到真实地址:${reqUrl}`);
          await page.close();
          await browser.disconnect();
          req.abort().catch((e) => logger.error(e));
          resolve(handleResponse(200, 'sucess', { url: reqUrl, header: headers }, pageId));
        }

        if (isVideoUrl(reqUrl)) {
          logger.info(`[pie]后缀名匹配嗅探到真实地址:${reqUrl}`);
          await page.close();
          await browser.disconnect();
          req.abort().catch((e) => logger.error(e));
          resolve(handleResponse(200, 'sucess', { url: reqUrl, header: headers }, pageId));
        }

        if (req.isInterceptResolutionHandled()) return; // 已处理过的请求不再处理
        if (req.method().toLowerCase() === 'head') {
          req.abort().catch((err) => logger.error(err));
        }
        const resourceTypesToAbort = ['font'];
        if (resourceTypesToAbort.includes(req.resourceType())) {
          req.abort().catch((err) => logger.error(err));
        } else {
          req.continue().catch((err) => logger.error(err));
        }
      });

      // 设置超时
      if (!pageStore[pageId].timerId) {
        logger.info('--------!timerId---------');
        pageStore[pageId].timerId = setTimeout(async () => {
          await page.close();
          await browser.disconnect();
          pageStore[pageId].timerId = null;
          reject(new Error('嗅探失败', { cause: '请求超时' }));
        }, 15000);
      } else {
        logger.info('--------has timerId---------');
      }


      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(err => reject(err));
      logger.info('----------waitUntil---------------');
      if (script.trim()) {
        try {
          logger.info(`[pie]start run script`);
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
          await page.evaluateOnNewDocument(script = js_code);
          await page.evaluate(js_code);
        } catch (err) {
          logger.info(`[pie][error]run script: ${err}`);
        }
      }
    });
  } catch (err) {
    return handleResponse(500, 'fail', err as Error, pageId);
  }
};

export default puppeteerInElectron;
