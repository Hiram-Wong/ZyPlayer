import axios from 'axios';
import { nanoid } from 'nanoid';
import _ from 'lodash';

axios.defaults.withCredentials = true; //让ajax携带cookie

let controller = new AbortController();

const m3u = (text: string) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)(?:$|\n|\s)/i;

  const docs = [];
  let doc: { name?: any; logo?: any; group?: any; url?: any };
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)[1] : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)[1] : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)[1] : '';
    } else if (line.indexOf('://') > -1) {
      if (line.startsWith('#EXT-X-SUB-URL')) return; // #EXT-X-SUB-URL https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u
      if (line.startsWith('#EXTM3U')) return; // #EXTM3U url-tvg="http://epg.51zmt.top:8000/e.xml,https://epg.112114.xyz/pp.xml
      doc.url = line;
      docs.push(doc);
    }
  });
  return docs;
};

const txt = (text: string) => {
  const docs = [];
  let group: any;
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    const split = line.split(',');
    if (split.length < 2) return;
    if (line.indexOf('#genre#') > -1) [group] = split;
    if (split[1].indexOf('://') > -1) {
      const doc = {
        name: split[0],
        url: split[1],
        group,
      };
      docs.push(doc);
    }
  });
  return docs;
};

const parseChannel = async(type: 'local'|'remote'|'url', path: string) => {
  try {
    let fileContent;
    if (type === 'local') {
      await window.electron.ipcRenderer.invoke('read-file', path).then(res => {
        fileContent = res;
      });
    } else if (type === 'remote') {
      const response = await axios.get(path);
      fileContent = response.data;
    } else {
      fileContent = path;
    }
    if (fileContent) {
      fileContent = fileContent.trim();
      let channelContent;

      if (fileContent.startsWith('#EXTM3U')) {
        channelContent = m3u(fileContent);
      } else {
        channelContent = txt(fileContent);
      }

      for(let i = 0 ;i < channelContent.length; i++ ) {
        const dataItem = channelContent[i];
        if (_.has(dataItem, 'id')) {
          // 使用 _.isString() 检查 dataItem.id 是否为字符串类型
          if (!_.isString(dataItem.id)) {
            channelContent[i].id = `${channelContent[i].id.id}`;
          }
        } else {
          channelContent[i].id = nanoid();
        }
      }

      return channelContent;
    }
    return [];
  } catch (err) {
    throw err;
  }
}

const checkChannel = async(url:string) => {
  try {
    const startTime: Date = new Date(); // 记录开始请求的时间
    await axios.get(url, { timeout: 3000 }); // 3s超时
    const endTime: Date = new Date(); // 记录接收到响应的时间
    const delay: number = endTime.getTime() - startTime.getTime(); // 计算延迟
    return delay;
  } catch (err) {
    console.error(err);
    return false;
  }
}

const stopCheckChannel = () => {
  controller.abort();

  controller = new AbortController();
}

/**
 * 获取电子节目单
 * @param {*} url epg阶段单api
 * @param {*} tvg_name 节目名称
 * @param {*} date 日期 2023-01-31
 * @returns 电子节目单列表
 */
const fetchChannelEpg = async(url: string, tvg_name: string, date: Date) => {
  try {
    const res = await axios.get(url, {
      params: {
        ch: tvg_name,
        date: date
      }
    });
    const epgData = res.data.epg_data;
    return epgData;
  } catch (err) {
    throw err;
  }
}

export { parseChannel, checkChannel, stopCheckChannel, fetchChannelEpg }