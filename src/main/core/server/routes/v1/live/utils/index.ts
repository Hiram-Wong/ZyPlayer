import request from '@main/utils/request';
import fs from 'fs-extra';

const m3u = (text: string) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,\s*(.+)/i;

  const docs: any[] = [];
  let doc: { name?: any; logo?: any; group?: any; url?: any };
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)![1]?.trim() : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)![1]?.trim() : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)![1]?.trim() : '';
    } else if (line?.startsWith('http')) {
      if (line.startsWith('#EXT-X-SUB-URL')) return; // #EXT-X-SUB-URL https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u
      if (line.startsWith('#EXTM3U')) return; // #EXTM3U url-tvg="http://epg.51zmt.top:8000/e.xml,https://epg.112114.xyz/pp.xml
      doc.url = line?.trim();
      docs.push(doc);
    }
  });
  return docs;
};

const txt = (text: string) => {
  const docs: any[] = [];
  let group: any;
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    const split = line.split(',');
    if (split.length < 2) return;
    if (line.indexOf('#genre#') > -1) [group] = split;
    if (split[1]?.startsWith('http')) {
      const doc = {
        name: split[0]?.trim(),
        url: split[1]?.trim(),
        group: group?.trim(),
      };
      docs.push(doc);
    }
  });
  return docs;
};

const parseChannel = async (type: 'local' | 'remote' | 'manual', path: string) => {
  let fileContent: string;
  if (type === 'local') {
    fileContent = await fs.readFileSync(path, 'utf-8');
  } else if (type === 'remote') {
    const response = await request({
      url: path,
      method: 'GET',
    });
    fileContent = response;
  } else {
    fileContent = path;
  }
  if (fileContent) {
    fileContent = fileContent.trim();
    let channelContent: any[];

    if (fileContent.startsWith('#EXTM3U')) {
      channelContent = m3u(fileContent);
    } else {
      channelContent = txt(fileContent);
    }

    for (let i = 0; i < channelContent.length; i++) {
      const dataItem = channelContent[i];
      if (dataItem.hasOwnProperty('id')) {
        delete channelContent[i].id;
      }
    }

    return channelContent;
  }
  return [];
};

export { parseChannel };
