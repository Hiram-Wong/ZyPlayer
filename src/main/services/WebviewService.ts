import { appLocale } from '@main/services/AppLocale';
import { configManager } from '@main/services/ConfigManager';
import { generateUserAgent } from '@main/utils/systeminfo';
import { session } from 'electron';

/**
 * init the useragent of the webview session
 * remove the zyfun and Electron from the useragent
 */
export function initSessionUserAgent() {
  const wvSession = session.fromPartition('persist:webview');
  // const originUA = wvSession.getUserAgent();
  const defaultUA = generateUserAgent();

  wvSession.setUserAgent(defaultUA);
  wvSession.webRequest.onBeforeSendHeaders((details, cb) => {
    const ua = configManager.ua;
    const language = appLocale.defaultLang();

    const headers = {
      ...details.requestHeaders,
      'User-Agent': ua,
      'Accept-Language': `${language}, en;q=0.9, *;q=0.5`,
    };
    cb({ requestHeaders: headers });
  });
}
