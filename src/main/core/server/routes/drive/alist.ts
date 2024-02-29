import _ from 'lodash';

import fetch from 'cross-fetch';

import { findBestLCS } from './similarity';

let __drives = {};
let __subtitle_cache = {};

const get_drives_path = async(tid) => {
	const index = tid.indexOf('/', 1);
	const name = tid.substring(1, index);
	const path = tid.substring(index);
	return { drives: await get_drives(name), path };
}

const get_drives = async(name) => {
	try {
		const { settings, api, server } = __drives[name];
		if (settings.v3 == null) {
			//获取 设置
			settings.v3 = false;
			const data = (await fetch(server + '/api/public/settings')).json().data;
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
		throw err
	}
}

const init = ({ skey, stype, ext }) => {
  const item = ext;
  const drive = {
    name: item.name,
    server: item.server.endsWith('/') ? item.server.substring(0, item.server.length - 1) : item.server,
    startPage: item.startPage || '/', //首页
    showAll: item.showAll === true, //默认只显示 视频和文件夹，如果想显示全部 showAll 设置true
    params: item.params || {},
    _path_param: item.params
      ? _.sortBy(Object.keys(item.params), function (x) {
          return -x.length;
        })
      : [],
    settings: {},
    api: {},

    //获取路径
    getParams(path) {
      const key = this._path_param.find((x) => path.startsWith(x));
      return Object.assign({}, this.params[key], { path });
    },

    //获取路径
    async getPath(path) {
      const response = await fetch(this.server + this.api.path,{
        method: "POST",
        mode: 'cors',
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: this.getParams(path)
      })
      const res = await response.json();
      return this.settings.v3 ? res.data.content : res.data.files;
    },

    //获取文件
    async getFile(path) {
      const response = await fetch(this.server + this.api.file,{
        method: "POST",
        mode: 'cors',
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: this.getParams(path)
      })
      const res = await response.json();
      const data = this.settings.v3 ? res.data : res.data.files[0];
      if (!this.settings.v3) data.raw_url = data.url; //v2 的url和v3不一样
      return data;
    },

    //获取其他
    async getOther(method, path) {
      const data = this.getParams(path);
      const response = await fetch(this.server + this.api.other,{
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: data
      })
      const res = await response.json();
      return res;
    },

    //是否是文件夹
    isFolder(data) {
      return data.type === 1;
    },

    //是否是视频
    isVideo(data) {
      return this.settings["v3"] ? data.type === 2 : data.type === 3;
    },

    //是否是字幕
    isSubtitle(data) {
      if (data.type === 1) return false;
      const ext = ['.srt', '.ass', '.scc', '.stl', '.ttml'];
      return ext.some((x) => data.name.endsWith(x));
    },

    //获取类型
    getType(data) {
      const isVideo = this.isVideo(data);
      return this.isFolder(data) ? 0 : isVideo ? 10 : 1;
    },

    //获取封面
    getPic(data) {
      let pic = this.settings["v3"] ? data.thumb : data.thumbnail;
      return pic || (this.isFolder(data) ? 'https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png' : '');
    },

    //获取大小
    getSize({ size = 0 }) {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    },
  

    //获取备注
    getRemark(data) {
      return '';
    },
  };

  // __drives[item.name] = drive;
  return drive;
};

//
const dir = async (dir, pg = 1) => {
  //清空缓存
  for (const k in __subtitle_cache) {
    delete __subtitle_cache[k];
  }
  pg = pg || 1;
  if (pg === 0) pg = 1;
  if (dir === '/' || dir === '') {
    const result = _.map(__drives, function (d) {
      return { name: d.name, path: '/' + d.name + d.startPage, type: 0, thumb: '' };
    });
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
  let subtList = [];
  let videos = [];
  let allList = [];
  list.forEach((item) => {
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
      if (sbust.bestMatch) __subtitle_cache[item.path] = [id + sbust.bestMatch.target];
    });
  }
  return JSON.stringify({
    parent: id,
    page: pg,
    pagecount: pg,
    list: allList,
  });
}

async function file(file) {
  let { drives, path } = await get_drives_path(file);
  const item = await drives.getFile(path);
  const subs = [];
  if (__subtitle_cache[file]) {
    for (const sub of __subtitle_cache[file]) {
      try {
        let subP = await get_drives_path(sub);
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
    return JSON.stringify(result);
  } else if (item.provider === '123Pan') {
    let url = item.raw_url;
    try {
      url = (await fetch(url)).json().data.redirect_url;
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
    return JSON.stringify(result);
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
    return JSON.stringify(result);
  }
}


const search = (wd) => {
	return JSON.stringify({
		list: [],
	});
}

export { init, dir, file, search }