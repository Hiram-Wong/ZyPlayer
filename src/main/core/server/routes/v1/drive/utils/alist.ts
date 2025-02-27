import request from '@main/utils/request';
import { findBestLCS } from './similarity';

class AListAdapter {
  drive: any = {};
  private subtitle_cache = {};

  constructor(source) {
    this.init(source);
  }

  async get_drives_path(tid: string) {
    const index = tid.indexOf('/', 1);
    const name = tid.substring(1, index);
    const path = tid.substring(index);
    return { drives: await this.get_drives(), path: tid };
  }

  async get_drives() {
    try {
      const { settings, api, server } = this.drive;
      if (settings.v3 == null) {
        //获取 设置
        settings.v3 = false;
        let { data } = await request({
          url: server + '/api/public/settings',
          method: 'GET',
        });

        if (Array.isArray(data)) {
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
        api.search = settings.v3 ? '/api/fs/search' : '/api/public/search';
        api.other = settings.v3 ? '/api/fs/other' : null;
      }
      return this.drive;
    } catch (err) {
      throw err;
    }
  }

  init(source) {
    let { name, server, startPage = '/', showAll = false, params = '{}', headers = '{}' } = source;
    if (params) params = '{}';
    if (headers) headers = '{}';
    if (startPage) startPage = '/';

    const cleanedServer = server.endsWith('/') ? server.slice(0, -1) : server;
    const drive = {
      name,
      server: cleanedServer,
      startPage,
      showAll,
      headers: JSON.parse(headers),
      params: JSON.parse(params),
      settings: {
        v3: null,
      },
      api: {
        path: '',
        file: '',
        other: '',
        search: '',
      },

      getParams(path: string) {
        let password = { password: '' };
        const formatPath = path.replace(/\/+$/, '');
        if (formatPath) {
          const checkPasswd = this.params?.[formatPath];
          if (checkPasswd !== undefined) password = this.params[formatPath];
        }
        return Object.assign({}, password, { path });
      },

      async getPath(path: string) {
        const res = await request({
          url: `${this.server}${this.api.path}`,
          method: 'POST',
          data: this.getParams(path),
        });
        return this.settings.v3 ? res.data.content : res.data.files;
      },

      async getFile(path: string) {
        const res = await request({
          url: `${this.server}${this.api.file}`,
          method: 'POST',
          data: this.getParams(path),
        });
        const data = this.settings.v3 ? res.data : res.data.files[0];
        if (!this.settings.v3) data.raw_url = data.url;
        return data;
      },

      async getOther(method: string, path: string) {
        const res = await request({
          url: `${this.server}${this.api.other}`,
          method: method,
          data: this.getParams(path),
        });
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

      getRemark(_data) {
        return '';
      },
    };

    this.drive = drive;
  }

  async dir(doc) {
    for (const k in this.subtitle_cache) {
      delete this.subtitle_cache[k];
    }
    let { path: dir, pg = 1 } = doc;
    if (pg === 0) pg = 1;
    if (dir === '') {
      return {
        parent: '',
        page: pg,
        pagecount: pg,
        list: {
          name: this.drive.name,
          path: this.drive.startPage,
          type: 0,
          thumb: '',
        },
      };
    }

    const { drives, path } = await this.get_drives_path(dir);
    const id = dir.endsWith('/') ? dir : dir + '/';
    const list = await drives.getPath(path);
    let subtList: any[] = [];
    let videos: any[] = [];
    let allList: any[] = [];
    list.forEach((item: any) => {
      if (drives.isSubtitle(item)) subtList.push(item.name);
      const isVideo = drives.isVideo(item);
      if (!drives.showAll && !drives.isFolder(item) && !isVideo) return;
      const file = {
        name: item.name.replaceAll('$', '_').replaceAll('#', '_'),
        path: id + item.name + (drives.isFolder(item) ? '/' : ''),
        thumb: drives.getPic(item),
        type: drives.getType(item),
        size: drives.getSize(item),
        remark: drives.getRemark(item),
      };
      if (drives.isVideo(item)) videos.push(file);
      allList.push(file);
    });
    if (subtList.length > 0) {
      videos.forEach((item) => {
        var sbust = findBestLCS(item.name, subtList);
        if (sbust.bestMatch) this.subtitle_cache[item.path] = [id + sbust.bestMatch.target];
      });
    }
    return {
      parent: id,
      page: pg,
      pagecount: pg,
      list: allList,
    };
  }

  async file(file) {
    let { drives, path } = await this.get_drives_path(file);
    const item = await drives.getFile(path);
    const subs: string[] = [];
    if (this.subtitle_cache[file]) {
      for (const sub of this.subtitle_cache[file]) {
        try {
          let subP = await this.get_drives_path(sub);
          const subItem = await drives.getFile(subP.path);
          subs.push(subItem.raw_url);
        } catch (error) {}
      }
    }
    if (item.provider === 'AliyundriveShare2Open' && drives.api.other) {
      const urls = ['原画', item.raw_url];
      try {
        const res = await drives.getOther('video_preview', path);
        for (const live of res.data.video_preview_play_info.live_transcoding_task_list) {
          if (live.status === 'finished') {
            urls.push(live.template_id);
            urls.push(live.url);
          }
        }
      } catch (error) {}
      const result = {
        name: item.name,
        url: urls,
        size: drives.getSize(item),
        remark: drives.getRemark(item),
        header: {},
        extra: {
          subt: subs,
        },
      };
      return result;
    } else if (item.provider === '123Pan') {
      let url = item.raw_url;
      try {
        url = (
          await request({
            url: url,
            method: 'GET',
          })
        ).redirect_url;
      } catch (error) {}
      const result = {
        name: item.name,
        url: url,
        size: drives.getSize(item),
        remark: drives.getRemark(item),
        header: {},
        extra: {
          subt: subs,
        },
      };
      return result;
    } else {
      const result = {
        name: item.name,
        url: item.raw_url,
        size: drives.getSize(item),
        remark: drives.getRemark(item),
        header: {},
        extra: {
          subt: subs,
        },
      };
      return result;
    }
  }

  search() {
    return {
      list: [],
    };
  }
}

export default AListAdapter;
