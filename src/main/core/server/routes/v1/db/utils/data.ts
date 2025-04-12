import find from 'lodash/find';
import JSON5 from 'json5';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import { resolve } from 'url';
import request from '@main/utils/request';
import { readFile } from '@main/utils/hiker/file';
import { base64 } from '@main/utils/crypto';
import initSettingData from '@main/core/db/migration/modules/init/tbl_setting.json';

const easy2catvod = (config, url) => {
  let data = {};
  if (config?.video && config.video?.sites && config.video?.sites.length > 0) {
    data['tbl_site'] = config.video.sites.map((item) => ({
      id: item?.id || uuidv4(),
      key: item?.key || uuidv4(),
      name: item.name,
      type: 8,
      api: resolve(url, item.api),
      group: 'catvod',
      search: 1,
      categories: '',
    }));
  }
  return data;
};

const easy2tvbox = async (config, url, type) => {
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

  const formatSearch = (searchable: number = 0, quickSearch: number = 0) => {
    // if (quickSearch === 1) return 2;
    if (searchable === 1) return 1;
    return 0;
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
        search: formatSearch(item?.searchable || 0, item?.quickSearch || 0),
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
        type: item?.type ? item.type : 0,
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
        showAll: item.showAll || false,
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
  // 1.key变换 - newkey
  ['sites', 'iptv', 'analyze', 'drive', 'setting', 'channel'].forEach((key) => {
    const tblKey = key === 'sites' ? 'site' : key;
    const newtblKey = tblKey.startsWith('tbl') ? tblKey : `tbl_${tblKey}`;
    if (data.hasOwnProperty(key)) {
      data[newtblKey] = data[key];
      delete data[key];
    }
  });

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

  // 2.移除非新数据类型中的字段
  for (const key in data) {
    if (!newDataTypes.includes(key)) {
      delete data[key];
    }
  }

  // 3. 格式化数据
  for (const key in data) {
    switch (key) {
      case 'tbl_setting':
        // 1. 将数组转换为对象
        if (Array.isArray(data[key])) {
          const doc = {};
          for (const item of data[key]) {
            doc[item.key] = item.value;
          }
          data[key] = doc;
        }

        // 2.更新缺失的设置项-init数据为准
        for (const item of initSettingData) {
          if (data[key][item.key] === undefined) {
            data[key][item.key] = item.value;
          }
        }

        // 3.删除不存在于初始配置中的键-已有数据
        for (const data_key in data[key]) {
          if (initSettingData.find((item) => item.key === data_key) === undefined) {
            delete data[key][data_key];
          }
        }

        // 4.处理默认数据
        ['defaultSite', 'defaultIptv', 'defaultAnalyze', 'defaultDrive'].forEach((defaultKey) => {
          if (defaultKey && (!uuidValidate(defaultKey) || uuidVersion(defaultKey) !== 4)) {
            data[key][defaultKey] = '';
          }
        });
        break;
      case 'tbl_site':
        data[key] = data[key]
          .filter((item) => item?.name && item?.api && item?.type)
          .map((item) => ({
            id: item?.id || uuidv4(),
            key: item?.key || item?.id || uuidv4(),
            name: item?.name || '',
            type: item?.type || 0,
            api: item?.api || '',
            group: item?.group || '',
            search: item?.search || 0,
            categories: item.hasOwnProperty('categories')
              ? Array.isArray(item.categories)
                ? item.categories.join(',')
                : item.categories
              : '',
            ext: item?.ext || '',
            isActive: true,
          }));
        break;
      case 'tbl_iptv':
        data[key] = data[key]
          .filter((item) => item?.name && item?.url)
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              name: item.name,
              type: item?.type || 'remote',
              url: item.url,
              epg: item?.epg || '',
              logo: item?.logo || '',
              isActive: true,
            };
          });
        break;
      case 'tbl_channel':
        data[key] = data[key]
          .filter((item) => item?.name && item?.url && item.url.startsWith('http'))
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              name: item.name || '',
              url: item?.url || '',
              group: item?.group || '',
            };
          });
        break;
      case 'tbl_drive':
        data[key] = data[key]
          .filter((item) => item?.name && item?.server)
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              name: item?.name || '',
              server: item?.server || '',
              showAll: item.showAll || false,
              startPage: item?.startPage || '',
              search: !!item.search,
              headers: item.headers || null,
              params: item.params || null,
              isActive: true,
            };
          });
        break;
      case 'tbl_analyze':
        data[key] = data[key]
          .filter((item) => item?.name && item?.url)
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              name: item?.name || '',
              url: item?.url || '',
              type: item?.type ? item.type : 0,
              isActive: true,
            };
          });
        break;
      case 'tbl_history':
        data[key] = data[key]
          .filter((item) => item?.type)
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              type: item?.type,
              relateId: item.relateId,
              siteSource: item?.siteSource || '',
              playEnd: item?.playEnd || null,
              videoId: item?.videoId || '',
              videoImage: item?.videoImage || '',
              videoName: item?.videoName || '',
              videoIndex: item?.videoIndex || '',
              watchTime: item?.watchTime || null,
              duration: item?.duration || null,
              skipTimeInEnd: item?.skipTimeInEnd || null,
              skipTimeInStart: item?.skipTimeInStart || null,
            };
          });
        break;
      case 'tbl_star':
        data[key] = data[key]
          .filter((item) => item?.trelateId && item?.videoId)
          .map((item) => {
            return {
              id: item?.id || uuidv4(),
              type: item?.type,
              relateId: item.relateId,
              videoId: item.videoId,
              videoImage: item?.videoImage || '',
              videoName: item?.videoName || '',
              videoType: item?.videoType || '',
              videoRemarks: item?.videoRemarks || '',
            };
          });
        break;
    }
  }

  // 4. 处理数据id 必须为 uuid
  for (const dataType of newDataTypes) {
    if (data.hasOwnProperty(dataType) && Array.isArray(data[dataType])) {
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

  return data;
};

const readData = async (path: string) => {
  let content: string = '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    content = await request({ url: path, method: 'GET', responseType: 'text' });
  } else {
    content = (await readFile(path)) || '';
  }
  content = JSON5.parse(content);
  return content;
};

const importData = async (importType: string, remoteType: string, path: string) => {
  let content: any = await readData(path);
  if (importType === 'easyConfig') {
    if (remoteType === 'catvod') content = await easy2catvod(content, path);
    else content = easy2tvbox(content, path, remoteType);
  }

  const formatData = commonDelImportData(content);

  return formatData;
};

export { importData };
