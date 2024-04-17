import axios from 'axios';
import { nanoid } from 'nanoid';

const { getCurrentWindow } = require('@electron/remote');
const win = getCurrentWindow();

// const videoFormats = ['.m3u8', '.mp4', '.flv', 'avi', 'mkv'];
const urlRegex: RegExp = new RegExp('http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*');
const isExcludedUrl = (reqUrl) => {
  return (
    reqUrl.indexOf('url=http') >= 0 ||
    reqUrl.indexOf('v=http') >= 0 ||
    reqUrl.indexOf('.css') >= 0 ||
    reqUrl.indexOf('.html') >= 0
  );
}

const snifferPie = async (url: string): Promise<string> => {
  console.log('[detail][sniffer][pie][start]: pie嗅探流程开始');
  let data: string = '';

  try {
    const res = await window.electron.ipcRenderer.invoke('sniffer-media', url);

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

const createIframe = (iframeId: string, url: string): Promise<{ iframeRef: HTMLIFrameElement, contentWindow: Window | null }> => {
  return new Promise((resolve) => {
    const iframeRef = document.createElement("iframe");
    iframeRef.style.height = '0';
    iframeRef.style.width = '0';
    iframeRef.style.position = 'fixed';
    iframeRef.style.top = '-10px';
    iframeRef.style.left = '-10px';
    iframeRef.id = iframeId;
    iframeRef.setAttribute("frameborder", "0");
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

const snifferIframe = async (url: string, totalTime: number = 15000, speeder: number = 250): Promise<string> => {
  win.webContents.setAudioMuted(true); // 静音
  const iframeId = nanoid();
  const iframeWindow = await createIframe(iframeId, url);

  const totalCounter = totalTime / speeder; // 计算总次数

  let counter = 1;
  let snifferTimer;
  let data = '';

  const checkResourceName = (resourceName: string) => {
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

const snifferCustom = async (url: string): Promise<string> => {
  let data: string = '';
  try { 
    const res = await axios.get(url);
    if (res.data.code === 200) {
      data = res.data.url;
      console.log(`[detail][sniffer][custom][return]: custom嗅探流程返回链接:${data}`);
    } else {
      console.log(`[detail][sniffer][custom][error]: custom嗅探流程错误:${res}`);
    }
  } catch (err) {
    console.log(`[detail][sniffer][custom][error]: custom嗅探流程错误:${err}`);
  } finally {
    console.log(`[detail][sniffer][custom][end]: custom嗅探流程结束`);
    return data;
  }
}

// 嗅探
const sniffer = async (type: string, url: string): Promise<string> => {
  let data: string = '';
  if (type === 'iframe') {
    data = await snifferIframe(url);
  } else if (type === 'pie') {
    data = await snifferPie(url);
  } else if (type === 'custom') {
    data = await snifferCustom(url);
  }
  return data;
};

export default sniffer;