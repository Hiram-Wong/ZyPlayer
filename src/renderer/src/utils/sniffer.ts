import { nanoid } from 'nanoid';

import request from '@/utils/request';
import { decodeBase64 } from '@/utils/tool'

const { getCurrentWindow } = require('@electron/remote');
const win = getCurrentWindow();

// const videoFormats = ['.m3u8', '.mp4', '.flv', 'avi', 'mkv'];
const urlRegex: RegExp = new RegExp(
  'http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*',
);
const isExcludedUrl = (reqUrl) => {
  return (
    reqUrl.indexOf('url=http') >= 0 ||
    reqUrl.indexOf('v=http') >= 0 ||
    reqUrl.indexOf('.css') >= 0 ||
    reqUrl.indexOf('.html') >= 0
  );
};

const getQueryParam = (url: string, paramName: string) => {
  const searchParams = new URLSearchParams(new URL(url).search);
  return searchParams.get(paramName);
};

/***
 * 链接中问号后面的query字符串转为object对象
 * @param url 链接，可以直接是?开头的
 * @param paramName object对象键值，如果不传就返回整个object
 */
const getQuery = (url: string, paramName: string) => {
  try {
    if (url.indexOf('?') > -1) {
      url = url.slice(url.indexOf('?') + 1);
    }
    let arr = url.split('#')[0].split('&');
    const resObj = {};
    arr.forEach((item) => {
      let arr1 = item.split('=');
      let key = arr1[0];
      let value = arr1.slice(1).join('=');
      resObj[key] = value;
    });
    return paramName ? resObj[paramName] : resObj;
  } catch (err) {
    console.log(`[t3][getQuery][error]${err}`);
    return {};
  }
};

const snifferPie = async (url: string, run_script: string, init_script: string, parse_extra: object): Promise<string> => {
  console.log('[detail][sniffer][pie][start]: pie嗅探流程开始');
  let data: string = '';

  try {
    const res = await window.electron.ipcRenderer.invoke('sniffer-media', url, run_script, init_script, parse_extra);

    if (res.code === 200) {
      data = res.data.url;
      console.log(`[detail][sniffer][pie][return]: pie嗅探流程返回链接:${data}`);
    } else if (res.code === 500) {
      console.log(`[detail][sniffer][pie][error]: pie嗅探流程错误:${res}`);
    }
  } catch (err) {
    console.log(`[detail][sniffer][pie][error]: pie嗅探流程错误:${err}`);
  } finally {
    console.log(`[detail][sniffer][pie][end]: pie嗅探流程结束`);
    return data;
  }
};

const createIframe = (
  iframeId: string,
  url: string,
): Promise<{ iframeRef: HTMLIFrameElement; contentWindow: Window | null }> => {
  return new Promise((resolve) => {
    const iframeRef = document.createElement('iframe');
    iframeRef.style.height = '0';
    iframeRef.style.width = '0';
    iframeRef.style.position = 'fixed';
    iframeRef.style.top = '-10px';
    iframeRef.style.left = '-10px';
    iframeRef.id = iframeId;
    iframeRef.setAttribute('frameborder', '0');
    iframeRef.src = url;

    iframeRef.onload = () => {
      resolve({ iframeRef, contentWindow: iframeRef.contentWindow || null });
    };

    document.body.appendChild(iframeRef);
  });
};

const removeIframe = (iframeId: string): void => {
  const iframeRef = document.getElementById(iframeId);
  if (iframeRef && iframeRef.parentNode) {
    iframeRef.parentNode.removeChild(iframeRef);

    // 清理可能存在的事件监听器等
    iframeRef.onload = null;
    iframeRef.onerror = null;
    iframeRef.onabort = null;
  }
};

const snifferIframe = async (
  url: string,
  run_script: string,
  init_script: string,
  parse_extra: object,
  totalTime: number = 15000,
  speeder: number = 250,
): Promise<string> => {
  win.webContents.setAudioMuted(true); // 静音
  const iframeId = nanoid();
  const iframeWindow = await createIframe(iframeId, url);
  // if (script) {
  //   const js_code = `
  //     (function() {
  //       var scriptTimer;
  //       var scriptCounter = 0;
  //       scriptTimer = setInterval(function() {
  //         if (location.href !== 'about:blank') {
  //           scriptCounter += 1;
  //           console.log('---第' + scriptCounter + '次执行script[' + location.href + ']---');
  //           ${script}
  //           clearInterval(scriptTimer);
  //           scriptCounter = 0;
  //           console.log('---执行script成功---');
  //         }
  //       }, 2000);
  //     })();
  //   `;
  //   iframeWindow.contentWindow!.eval(js_code);
  // }

  const totalCounter = totalTime / speeder; // 计算总次数

  let counter = 1;
  let snifferTimer;
  let data = '';

  const checkResourceName = (resourceName: string) => {
    // console.log('https://v3-cha.toutiaovod.com/1583f35430641ba3ca5b9c9411e45d57/6636a17c/video/tos/cn/tos-cn-v-0004/owPbPen5Q8AqRdBIIeDDKdAFArL9bRGBmvXRgm/?a=13&ch=0&cr=0&dr=0&net=5&cd=0%7C0%7C0%7C0&br=1014&bt=1014&cs=0&ds=3&ft=WG6aM0-ERR0sLOC3NNn2Nc.xBiGNbLpAP5sU_4jJPUwJNv7TGW&mime_type=video_mp4&qs=13&rc=M3M5eGQ6ZmhlcjMzNDczM0BpM3M5eGQ6ZmhlcjMzNDczM0BlYXJtcjRfaWRgLS1kLTBzYSNlYXJtcjRfaWRgLS1kLTBzcw%3D%3D&btag=80000200078030&dy_q=1714844945&l=202405050149052CDB97F0CB25211326A4'.match(urlRegex) && !isExcludedUrl('https://v3-cha.toutiaovod.com/1583f35430641ba3ca5b9c9411e45d57/6636a17c/video/tos/cn/tos-cn-v-0004/owPbPen5Q8AqRdBIIeDDKdAFArL9bRGBmvXRgm/?a=13&ch=0&cr=0&dr=0&net=5&cd=0%7C0%7C0%7C0&br=1014&bt=1014&cs=0&ds=3&ft=WG6aM0-ERR0sLOC3NNn2Nc.xBiGNbLpAP5sU_4jJPUwJNv7TGW&mime_type=video_mp4&qs=13&rc=M3M5eGQ6ZmhlcjMzNDczM0BpM3M5eGQ6ZmhlcjMzNDczM0BlYXJtcjRfaWRgLS1kLTBzYSNlYXJtcjRfaWRgLS1kLTBzcw%3D%3D&btag=80000200078030&dy_q=1714844945&l=202405050149052CDB97F0CB25211326A4'))
    return resourceName.match(urlRegex) && !isExcludedUrl(resourceName);
    // const formatIndex = videoFormats.findIndex((format) => resourceName.toLowerCase().includes(format));
    // return formatIndex > -1;
  };

  const stopSniffer = () => {
    clearInterval(snifferTimer);
    removeIframe(iframeId);
    win.webContents.setAudioMuted(false);
  };

  await new Promise((resolve) => {
    snifferTimer = setInterval(async () => {
      console.log(`[detail][sniffer][iframe][start]iframe嗅第${counter}次探流程开始`);

      try {
        const resources = iframeWindow.contentWindow!.performance.getEntriesByType('resource'); // 获取所有资源

        for (const resource of resources) {
          const resourceName = resource.name;
          if (checkResourceName(resourceName)) {
            data = resourceName;
            console.log(`[detail][sniffer][iframe][return]iframe嗅探流程返回链接:${data}`);

            stopSniffer();
            resolve('');
            return;
          }
        }
      } catch (err) {
        console.log(`[detail][sniffer][iframe][error]iframe第${counter}次嗅探发生错误:${err}`);
      }

      if (counter >= totalCounter) {
        console.log(`[detail][sniffer][iframe][end]iframe嗅探超时结束`);
        stopSniffer();
        resolve('');
      }

      counter += 1;
    }, speeder);
  });

  console.log(`[detail][sniffer][iframe][end]iframe嗅探流程结束`);
  return data;
};

const snifferCustom = async (url: string): Promise<{ headers: object; data: string }> => {
  let data: string = '';
  let headers: object | null = null;
  try {
    const response = await request({
      url,
      method: 'GET',
    });
    if (response.code === 200) {
      data = response.url;
      headers = response.headers;
      console.log(`[detail][sniffer][custom][return]: custom嗅探流程返回链接:${data}`);
    } else {
      const err = response.msg;
      console.log(`[detail][sniffer][custom][error]: custom嗅探流程错误:${err}`);
    }
  } catch (err) {
    console.log(`[detail][sniffer][custom][error]: custom嗅探流程错误:${err}`);
  } finally {
    console.log(`[detail][sniffer][custom][end]: custom嗅探流程结束`);
    return { data, headers: headers! };
  }
};

// 嗅探
const sniffer = async (type: string, url: string): Promise<{ headers: object; data: string }> => {
  let data: string = '';
  let headers: object | null = null;
  let query: any = getQuery(url, '');
  console.log(`[detail][sniffer][query]`, query);
  let script = query.script;
  if (script) script = decodeBase64(decodeURIComponent(script));
  // console.log(`[detail][sniffer][script]`, script);
  let init_script = query.init_script;
  if (init_script) init_script = decodeBase64(decodeURIComponent(init_script));
  // console.log(`[detail][sniffer][init_script]`, init_script);
  const custom_regex = query.custom_regex || '';
  const sniffer_exclude = query.sniffer_exclude || '';

  const format_rule = (rule) => {
    if (rule.includes("*")) {
      return rule = rule.replace(/\*\./g, '.*\\.');
    } else {
      return rule = rule.replace(/\./g, '\\.');
    }
  }

  const parse_extra = {
    custom_regex: format_rule(custom_regex),
    sniffer_exclude: format_rule(sniffer_exclude),
  };

  const realUrl = query.url;
  if (type === 'iframe') {
    data = await snifferIframe(realUrl!, script!, init_script!, parse_extra!);
  } else if (type === 'pie') {
    data = await snifferPie(realUrl!, script!, init_script!, parse_extra!);
  } else if (type === 'custom') {
    let _obj = await snifferCustom(url);
    data = _obj.data;
    headers = _obj.headers;
  }
  return { data, headers: headers! };
};

export default sniffer;
