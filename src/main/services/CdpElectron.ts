import { loggerService } from '@logger';
import { windowService } from '@main/services/WindowService';
import { getTimeout, getUserAgent } from '@main/utils/tool';
import { LOG_MODULE } from '@shared/config/logger';
import { randomUUID } from '@shared/modules/crypto';
import { headersPascalCase } from '@shared/modules/headers';
import { toString } from '@shared/modules/toString';
import { isHttp, isNil, isObjectEmpty, isPositiveFiniteNumber, isStrEmpty, isString } from '@shared/modules/validate';
import type { BrowserWindow } from 'electron';
import { app } from 'electron';
import type {
  Browser as CdpBrowser,
  EvaluateFunc as CdpEvaluateFunc,
  GoToOptions as CdpGoToOptions,
  HTTPResponse as CdpHTTPResponse,
  Page as CdpPage,
} from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';

export interface ISnifferResult {
  url: string;
  headers?: Record<string, any>;
}

export interface ISnifferOptions {
  runScript?: string;
  initScript?: string;
  customRegex?: string;
  snifferExclude?: string;
  headers?: Record<string, any>;
  timeout?: number;
}

export interface ICdpOptions {
  timeout?: number;
  userAgent?: string;
}

const logger = loggerService.withContext(LOG_MODULE.CDP);

pie.initialize(app);

export class CdpElectron {
  private win: BrowserWindow | null = null;
  private browser: CdpBrowser | null = null;
  private page: CdpPage | null = null;

  private uuid: string | null = null;
  private timerId: NodeJS.Timeout | null = null;

  private options: ICdpOptions = { timeout: undefined, userAgent: undefined };

  constructor(options: Partial<ICdpOptions> = {}) {
    this.uuid = randomUUID();

    this.options = {
      timeout: options?.timeout,
      userAgent: options?.userAgent,
    };
  }

  private async init(): Promise<void> {
    this.win = windowService.createSnifferWindow(this.uuid!);
    this.win.webContents.setAudioMuted(true);
    this.win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

    this.browser = (await pie.connect(app, puppeteer as any)) as unknown as CdpBrowser;
    this.page = (await pie.getPage(this.browser as any, this.win)) as unknown as CdpPage;
  }

  private async cleanup(): Promise<void> {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;

    if (this.page) await this.page.close();
    this.page = null;

    if (this.browser?.connected) await this.browser.disconnect();
    this.browser = null;

    if (this.win && !this.win.isDestroyed()) this.win.close();
    this.win = null;
  }

  private reasonUserAgentMetadata(userAgent: string) {
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);

    return {
      brands: [
        { brand: 'Chromium', version: '122' },
        { brand: 'Not(A:Brand', version: '24' },
      ],
      fullVersion: '122.0.6261.0',
      platform: /Windows/i.test(userAgent) ? 'Windows' : /Mac OS X/i.test(userAgent) ? 'macOS' : 'Linux',
      platformVersion: '',
      architecture: 'x86',
      model: '',
      mobile: isMobile,
    };
  }

  private async configurePage(page: CdpPage, headers: Record<string, any> = {}): Promise<void> {
    const h = headersPascalCase(headers);
    if (isObjectEmpty(h)) return;

    const userAgent = getUserAgent(h['User-Agent'], this.options.userAgent);
    if (userAgent) {
      // await page.setUserAgent(ua); // @deprecated api
      await page.setUserAgent({
        userAgent,
        userAgentMetadata: this.reasonUserAgentMetadata(userAgent),
      });

      delete h['User-Agent'];
    }

    if (h.Cookie) {
      const cookies = h.Cookie.split(';').map((c: string) => {
        const [name, value] = c.split('=').map((s) => s.trim());
        return { name, value, domain: '' };
      });
      // await page.setCookie(...cookies); // @deprecated api
      await this.browser!.setCookie(...cookies);

      delete h.Cookie;
    }

    await page.setExtraHTTPHeaders(h);
  }

  private async navigateToUrl(
    page: CdpPage,
    url: string,
    options: CdpGoToOptions = {},
  ): Promise<CdpHTTPResponse | null> {
    return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0, ...options });
  }

  private async execScript(
    page: CdpPage,
    script: string | CdpEvaluateFunc<any>,
    type: 'evaluate' | 'evaluateOnNewDocument' = 'evaluate',
  ): Promise<any> {
    switch (type) {
      case 'evaluate': {
        return await page.evaluate(script);
      }
      case 'evaluateOnNewDocument':
      default: {
        return await page.evaluateOnNewDocument(script);
      }
    }
  }

  // @ts-expect-error declared but its value is never read
  private async execClick(page: CdpPage, selector: string, type: 'js' | 'protozoa'): Promise<void> {
    switch (type) {
      case 'js': {
        return await this.execScript(page, `document.querySelector('${selector}').click()`, 'evaluate');
      }
      case 'protozoa':
      default: {
        return await page.click(selector);
      }
    }
  }

  // @ts-expect-error declared but its value is never read
  private async extractContent(page: CdpPage, selector?: string): Promise<string | Element[]> {
    if (selector) {
      return await page.$$eval(selector, (elements) => elements);
    }
    return page.content();
  }

  public async snifferMedia(url: string, options: ISnifferOptions = {}): Promise<ISnifferResult> {
    try {
      if (!isString(url) || !isHttp(url)) throw new Error('Invalid URL');
      const {
        runScript,
        initScript,
        customRegex,
        snifferExclude,
        headers: rawHeaders = {},
        timeout: rawTimeout,
      } = options;

      const timeout = getTimeout(rawTimeout, this.options.timeout);
      const headers = Object.fromEntries(
        Object.entries(headersPascalCase(rawHeaders))
          .map(([key, value]) => {
            if (key === 'User-Agent') {
              return [key, getUserAgent(value, this.options.userAgent)];
            }
            return [key, value];
          })
          .filter(([, value]) => !isNil(value)),
      );

      await this.init();
      const page = this.page!;
      await this.configurePage(page, headers);
      await page.setRequestInterception(true);

      // Hooks
      page.on('error', (error) => logger.error('Page error', error));
      page.on('console', async (msg) => {
        const args = await Promise.all(
          msg.args().map(async (arg) => {
            try {
              return await arg.jsonValue();
            } catch {
              return arg.toString();
            }
          }),
        );
        const log = args.map((v) => toString(v)).join(' ');
        if (!isStrEmpty(log)) logger.silly(log);
      });
      page.on('dialog', async (dialog) => await dialog.dismiss());

      // Anti-crawling Bypass
      await this.execScript(
        page,
        () => Object.defineProperty(navigator, 'webdriver', { get: () => false }),
        'evaluateOnNewDocument',
      );

      // Execute custom scripts
      if (isString(initScript) && !isStrEmpty(initScript)) {
        await this.execScript(page, initScript, 'evaluateOnNewDocument');
      }
      if (isString(runScript) && !isStrEmpty(runScript)) {
        const code = `
          (() => {
            var scriptTimer;
            var scriptCounter = 0;
            scriptTimer = setInterval(function() {
              if (location.href !== 'about:blank') {
                scriptCounter += 1;
                console.log(---exec run_script start ' + scriptCounter + '---');
                ${runScript}
                clearInterval(scriptTimer);
                scriptCounter = 0;
                console.log('---exec run_script complete---');
              }
            }, 200);
          })();
        `;
        await this.execScript(page, code, 'evaluateOnNewDocument');
      }

      // Handle timeout
      const timeoutPromise = new Promise<ISnifferResult>((_resolve, reject) => {
        if (!isPositiveFiniteNumber(timeout) || timeout <= 0) return;

        this.timerId = setTimeout(async () => {
          await this.cleanup();
          reject(new Error('timeout'));
        }, timeout);
      });

      // Handle sniffer
      const snifferPromise = new Promise<ISnifferResult>((resolve) => {
        page.on('request', async (req) => {
          if (req.isInterceptResolutionHandled()) return;

          const reqUrl = req.url();
          const reqHeaders = headersPascalCase(req.headers());
          const reqMethod = req.method();
          const reqResourceType = req.resourceType();

          if (snifferExclude && new RegExp(snifferExclude, 'gi').test(reqUrl)) {
            logger.warn(`Sniffer media custom exclude, url: ${reqUrl}`);
            return req.continue();
          }

          if (customRegex && new RegExp(customRegex, 'gi').test(reqUrl)) {
            logger.info(`Sniffer media custom match, url: ${reqUrl}`);
            resolve({ url: reqUrl, headers: reqHeaders });
            return req.abort();
          }

          const videoMatchRegex: RegExp =
            /http(?:(?!http).){12,}?\.(?:m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3|tos)\?.*|http(?:(?!http).){12,}\.(?:m3u8|mpd|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http(?:(?!http).)*?video\/tos*|http(?:(?!http).)*?obj\/tos*/;
          const videoExcludeRegex: RegExp = /\.(?:css|html)$|url=http|v=http/i;
          if (videoMatchRegex.test(reqUrl) && !videoExcludeRegex.test(reqUrl)) {
            logger.info(`Sniffer media default match, url: ${reqUrl}`);
            resolve({ url: reqUrl, headers: reqHeaders });
            return req.abort();
          }

          if (
            ['head'].includes(reqMethod) ||
            ['stylesheet', 'image', 'font', 'manifest', 'prefetch'].includes(reqResourceType) ||
            (['xhr', 'fetch'].includes(reqResourceType) && reqUrl.includes('.css')) ||
            [
              'google-analytics.com',
              'googletagmanager.com',
              'doubleclick.net',
              'facebook.net',
              'twitter.com',
              'linkedin.com',
              'adservice.google.com',
            ].some((domain) => reqUrl.includes(domain)) ||
            ['/ads/', '/analytics/', '/pixel/', '/tracking/', '/stats/', 'devtools-detector', 'disable-devtool'].some(
              (path) => reqUrl.includes(path),
            )
          ) {
            return await req.abort();
          }

          await req.continue();
        });
      });

      await this.navigateToUrl(page, url);

      return await Promise.race([timeoutPromise, snifferPromise]);
    } catch (error) {
      logger.error('SnifferMedia error', error as Error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

export default CdpElectron;
