import fs from 'fs-extra';
import find from 'lodash/find';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import { resolve } from 'url';
import request from '@main/utils/request';
import { base64 } from '@main/utils/crypto';

// 一键配置
const easyConfig = async (config, url, type) => {
  let data = {};
  let content = config;

  const formatType = (selectType: string, soureceType: number, api: string) => {
    // 0cms[xml] 1cms[json] 2drpy[js0] 6hipy[t4] 3app[v3] 4app[v3]

    if (selectType === 'drpy') {
      return 2; // drpy
    } else {
      if (api === 'csp_XBPQ')
        return 9; // xbpq
      else if (api === 'csp_XYQ')
        return 10; // xyq
      else if (api === 'csp_AppYsV2') return 11; // appysv2
      switch (soureceType) {
        case 0:
          return 0; // t0[xml]
        case 1:
          return 1; // t1[json]
        case 3:
          return 7; // t3[drpy]
        case 4:
          return 6; // t4[hipy]
      }
    }
  };

  const formatGroup = (type: string) => {
    switch (type) {
      case 'drpy':
        return 'drpy';
      case 'tvbox':
        return 'tvbox';
      default:
        return '';
    }
  };

  const formatUrl = (relativeUrl: string, baseUrl: string): string => {
    if (!relativeUrl) return '';
    if (typeof relativeUrl === 'object') return JSON.stringify(relativeUrl);
    if (
      relativeUrl.startsWith('csp_XBPQ') ||
      relativeUrl.startsWith('csp_XYQ') ||
      relativeUrl.startsWith('csp_AppYsV2')
    )
      return relativeUrl;
    return resolve(baseUrl, relativeUrl);
  };

  if (content.hasOwnProperty('sites')) {
    data['tbl_site'] = content.sites
      .filter(
        (item) =>
          [0, 1, 4].includes(item.type) ||
          (item.type === 3 && item.api === 'csp_XBPQ') ||
          (item.type === 3 && item.api === 'csp_XYQ') ||
          (item.type === 3 && item.api.includes('drpy')),
      )
      .map((item) => ({
        id: item?.id || uuidv4(),
        key: item?.key || uuidv4(),
        name: item.name,
        type: formatType(type, item.type, item.api),
        api: formatUrl(item.api, url),
        group: formatGroup(type),
        search: item.hasOwnProperty('searchable') && item?.searchable !== 0 ? true : false,
        categories: item.hasOwnProperty('categories')
          ? Array.isArray(item.categories)
            ? item.categories.join(',')
            : item.categories
          : '',
        ext: item.hasOwnProperty('ext') ? formatUrl(item.ext, url) : '',
        isActive: true,
      }));
  }
  if (content.hasOwnProperty('lives')) {
    let oldLives = find(content.lives, { group: 'redirect' });
    if (oldLives && !Array.isArray(oldLives)) {
      oldLives = [oldLives];
    }
    let iptv: any = [];
    if (oldLives && oldLives.length > 0 && oldLives[0].channels) {
      oldLives.forEach((live) => {
        live.channels.forEach((channel) => {
          const urlBase64 = channel.urls[0].split('&ext=')[1];
          let url = urlBase64;

          // 使用正则表达式判断字符串是否为 Base64 编码
          const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(urlBase64);

          if (isBase64) {
            // 如果具有 Base64 编码的特征，则解码
            url = base64.decode(urlBase64);
          }

          iptv.push({
            id: channel?.id || uuidv4(),
            name: channel.name,
            type: 'remote',
            url: url,
            epg: '',
            logo: '',
            isActive: true,
          });
        });
      });
    } else {
      iptv = content.lives.map((live) => {
        return {
          id: live?.id || uuidv4(),
          name: live.name,
          type: 'remote',
          url: formatUrl(live.url, url),
          epg: live?.epg || '',
          logo: live?.logo || '',
          isActive: true,
        };
      });
    }
    data['tbl_iptv'] = iptv;
  }
  if (content.hasOwnProperty('parses')) {
    const analyze = content.parses
      .filter((item) => item?.type !== 2 && item?.url)
      .map((item) => ({
        id: item?.id || uuidv4(),
        name: item.name,
        url: item.url,
        type: item.type ? item.type : 0,
        isActive: true,
      }));
    data['tbl_analyze'] = analyze;
  }
  if (content.hasOwnProperty('drives')) {
    const drives = content.drives
      .filter((item) => item.type === 'alist' || !item.type)
      .map((item) => ({
        id: item?.id || uuidv4(),
        name: item.name,
        server: item.server,
        startPage: item.startPage || '',
        search: !!item.search,
        headers: item.headers || null,
        params: item.params || null,
        isActive: true,
      }));
    data['tbl_drive'] = drives;
  }

  return data;
};

// 公共导入方法
const commonDelImportData = (data) => {
  // 先处理旧数据
  ['sites', 'iptv', 'analyze', 'drive', 'setting', 'channel'].forEach((key) => {
    if (data.hasOwnProperty(key)) {
      const tblKey = key === 'sites' ? 'site' : key;
      if (key === 'setting') {
        const tblSetting = data.setting[0]
          ? Object.entries(data.setting[0]).map(([k, v]) => ({ key: k, value: v }))
          : [];

        data[`tbl_${tblKey}`] = tblSetting;
      } else {
        data[`tbl_${tblKey}`] = data[key].data || data[key];
      }
    }
  });

  // 规范化 id 字段
  const newDataTypes = [
    'tbl_site',
    'tbl_iptv',
    'tbl_channel',
    'tbl_analyze',
    'tbl_drive',
    'tbl_history',
    'tbl_star',
    'tbl_setting',
  ];
  for (const dataType of newDataTypes) {
    if (data.hasOwnProperty(dataType)) {
      const dataArray = data[dataType];
      const existingIds = new Set();

      for (let i = 0; i < dataArray.length; i++) {
        const dataItem = dataArray[i];
        // 检查 id 是否为 UUIDv4
        if (dataItem.hasOwnProperty('id') && uuidValidate(dataItem.id) && uuidVersion(dataItem.id) === 4) {
          // 检查 id 是否已经存在
          if (!existingIds.has(dataItem.id)) {
            existingIds.add(dataItem.id); // 将新 id 添加到集合中
          } else {
            // 如果 id 已存在，则生成一个新的 id
            data[dataType][i].id = uuidv4();
            existingIds.add(data[dataType][i].id);
          }
        } else {
          // 如果 id 不存在或不是有效的 UUID v4，则生成一个新的 id
          data[dataType][i].id = uuidv4();
          existingIds.add(data[dataType][i].id);
        }
      }
    }
  }

  // 移除非新数据类型中的字段
  for (const key in data) {
    if (!newDataTypes.includes(key)) {
      delete data[key];
    }
  }

  return data;
};

const readData = async (path: string) => {
  let content: string = '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    content = await request({ url: path, method: 'GET' });
  } else {
    const resTxt: string = await fs.readFileSync(path, 'utf-8');
    content = JSON.parse(resTxt);
  }
  return content;
};

const importData = async (importType: string, remoteType: string, path: string) => {
  let content: any = await readData(path);
  if (importType === 'easy') {
    content = easyConfig(content, path, remoteType);
  }

  const formatData = commonDelImportData(content);

  return formatData;
};

export { importData };
