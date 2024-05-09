import _ from 'lodash';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import JSON5 from 'json5';

import { findBestLCS } from './similarity';

declare module 'axios' {
  export interface AxiosInstance {
    get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  }
}

axiosRetry(axios, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 500;
  },
});

const http = async function (url: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
  if (options.method === 'post' && options.data) {
    options.data = JSON.stringify(options.data);
    options.headers = {
      ...options.headers,
      'content-type': 'application/json',
    };
  }

  try {
    const res = await axios(url, options);
    return res;
  } catch (err) {
    throw err;
  }
};

http.get = axios.get;
http.post = axios.post;

['get', 'post'].forEach((method) => {
  http[method] = function (url: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return http(url, { ...options, method: method.toUpperCase() });
  };
});

let __drives = {};
let __subtitle_cache = {};

async function get_drives_path(tid) {
  const index = tid.indexOf('/', 1);
  const name = tid.substring(1, index);
  const path = tid.substring(index);
  return { drives: await get_drives(name), path };
}

async function get_drives(name) {
  try {
    const { settings, api, server } = __drives[name];
    if (settings.v3 == null) {
      //获取 设置
      settings.v3 = false;
      let { data } = await http.get(server + '/api/public/settings');
      data = data.data;
      if (_.isArray(data)) {
        settings.title = data.find((x) => x.key == 'title')?.value;
        settings.v3 = false;
        settings.version = data.find((x) => x.key == 'version')?.value;
        settings.enableSearch = data.find((x) => x.key == 'enable search')?.value == 'true';
      } else {
        settings.title = data.title;
        settings.v3 = true;
        settings.version = data.version;
        settings.enableSearch = false; //v3 没有找到 搜索配置
      }
      //不同版本 接口不一样
      api.path = settings.v3 ? '/api/fs/list' : '/api/public/path';
      api.file = settings.v3 ? '/api/fs/get' : '/api/public/path';
      api.search = settings.v3 ? '/api/public/search' : '/api/public/search';
      api.other = settings.v3 ? '/api/fs/other' : null;
    }
    return __drives[name];
  } catch (err) {
    throw err;
  }
}

const init = ({ skey: siteKey, stype: siteType, ext }) => {
  ext.forEach((item) => {
    const { name, server, startPage = '/', showAll = false, params = {}, headers = {} } = item;

    const cleanedServer = server.endsWith('/') ? server.slice(0, -1) : server;

    const drive = {
      name,
      server: cleanedServer,
      startPage,
      showAll,
      headers,
      params: params ? JSON5.parse(params) : {},
      settings: {},
      api: {},

      getParams(path) {
        let password = { password: '' };
        const formatPath = path.replace(/\/+$/, '');
        const checkPasswd = this.params[formatPath];
        if (checkPasswd !== undefined) password = this.params[formatPath];
        return Object.assign({}, password, { path });
      },

      async getPath(path) {
        const res = (await http.post(`${this.server}${this.api.path}`, { data: this.getParams(path) })).data;
        return this.settings.v3 ? res.data.content : res.data.files;
      },

      async getFile(path) {
        const res = (await http.post(`${this.server}${this.api.file}`, { data: this.getParams(path) })).data;
        const data = this.settings.v3 ? res.data : res.data.files[0];
        if (!this.settings.v3) data.raw_url = data.url;
        return data;
      },

      async getOther(method, path) {
        const data = this.getParams(path);
        data.method = method;
        const res = (await http.post(`${this.server}${this.api.other}`, { data })).data;
        return res;
      },

      isFolder(data) {
        return data.type === 1;
      },

      isVideo(data) {
        return this.settings.v3 ? data.type === 2 : data.type === 3;
      },

      isSubtitle(data) {
        if (data.type === 1) return false;
        const ext = ['.srt', '.ass', '.scc', '.stl', '.ttml'];
        return ext.some((x) => data.name.endsWith(x));
      },

      getType(data) {
        const isVideo = this.isVideo(data);
        return this.isFolder(data) ? 0 : isVideo ? 10 : 1;
      },

      getPic(data) {
        let pic = this.settings.v3 ? data.thumb : data.thumbnail;
        return (
          pic ||
          (this.isFolder(data)
            ? 'https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png'
            : '')
        );
      },

      getSize(data) {
        const sizes = ['KB', 'MB', 'GB', 'TB'];
        let sz = data.size || 0;
        let i = 0;
        while (sz >= 1024 && i < sizes.length - 1) {
          sz /= 1024;
          i++;
        }
        return `${sz.toFixed(2)} ${sizes[i]}`;
      },

      getRemark(data) {
        return '';
      },
    };

    __drives[item.name] = drive;
  });
};

const dir = async (dir, pg = 1) => {
  for (const k in __subtitle_cache) {
    delete __subtitle_cache[k];
  }

  pg = pg || 1;

  if (pg === 0) {
    pg = 1;
  }

  if (dir === '/' || dir === '') {
    const result = Object.values(__drives).map((d) => ({
      name: d.name,
      path: `/${d.name}${d.startPage}`,
      type: 0,
      thumb: '',
    }));

    return JSON.stringify({
      parent: '',
      page: pg,
      pagecount: pg,
      list: result,
    });
  }

  const { drives, path } = await get_drives_path(dir);
  const id = dir.endsWith('/') ? dir : dir + '/';
  const list = await drives.getPath(path);

  const subtList = list.filter((item) => drives.isSubtitle(item)).map((item) => item.name);
  const videos = list
    .filter((item) => drives.showAll || drives.isFolder(item) || drives.isVideo(item))
    .map((item) => ({
      name: item.name.replace(/[$#]/g, '_'),
      path: `${id}${item.name}${drives.isFolder(item) ? '/' : ''}`,
      thumb: drives.getPic(item),
      type: drives.getType(item),
      size: drives.getSize(item),
      remark: drives.getRemark(item),
    }));

  const allList = videos.slice();

  if (subtList.length > 0) {
    videos.forEach((item) => {
      const sbust = findBestLCS(item.name, subtList);
      if (sbust.bestMatch) {
        __subtitle_cache[item.path] = [`${id}${sbust.bestMatch.target}`];
      }
    });
  }

  return JSON.stringify({
    parent: id,
    page: pg,
    pagecount: pg,
    list: allList,
  });
};

const file = async (file) => {
  try {
    const { drives, path } = await get_drives_path(file);
    const item = await drives.getFile(path);
    const subs = [];

    if (__subtitle_cache[file]) {
      for (const sub of __subtitle_cache[file]) {
        try {
          const subP = await get_drives_path(sub);
          const subItem = await drives.getFile(subP.path);
          subs.push(subItem.raw_url);
        } catch (error) {}
      }
    }

    const result = {
      name: item.name,
      url: '',
      sign: item.sign ? item.sign : '',
      size: drives.getSize(item),
      remark: drives.getRemark(item),
      header: {},
      extra: {
        subt: subs,
      },
    };

    if (item.provider === 'AliyundriveShare2Open' && drives.api.other) {
      const urls = ['原画', item.raw_url];
      try {
        const res = await drives.getOther('video_preview', path);
        res.data.video_preview_play_info.live_transcoding_task_list.forEach((live) => {
          if (live.status === 'finished') {
            urls.push(live.template_id, live.url);
          }
        });
      } catch (error) {}

      result.url = urls;
    } else if (item.provider === '123Pan') {
      try {
        let { data } = await http.get(item.raw_url);
        data = data.data;
        const redirectUrl = response.data.redirect_url;
        result.url = redirectUrl;
      } catch (error) {}
    } else {
      result.url = item.raw_url;
    }

    return JSON.stringify(result);
  } catch (error) {
    // Handle errors here
    return JSON.stringify({ error: 'An error occurred' });
  }
};

const search = async (wd) => {
  return JSON.stringify({
    list: [],
  });
};

const destroy = async () => {
  __drives = {};
  __subtitle_cache = {};
};

export function __jsEvalReturn() {
  return {
    init: init,
    dir: dir,
    file: file,
    search: search,
    destroy: destroy,
  };
}
