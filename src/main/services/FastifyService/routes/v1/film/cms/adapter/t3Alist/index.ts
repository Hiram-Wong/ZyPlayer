import { request } from '@main/utils/request';
import type {
  ICmsCategory,
  ICmsCategoryOptions,
  ICmsDetail,
  ICmsDetailOptions,
  ICmsHome,
  ICmsHomeVod,
  ICmsInit,
  ICmsPlay,
  ICmsPlayOptions,
  ICmsProxy,
  ICmsProxyOptions,
  ICmsRunMian,
  ICmsRunMianOptions,
  ICmsSearch,
  ICmsSearchOptions,
  IConstructorOptions,
} from '@shared/types/cms';
import JSON5 from 'json5';

interface ISource {
  name: string;
  server: string;
  startPage?: string;
  showAll?: boolean;
  search?: boolean;
  params?: string;
  headers?: string;
  username?: string;
  password?: string;
}

interface ISettings {
  title: string;
  v3: boolean;
  version: string;
  enableSearch: boolean;
  pagSize: number;
}

interface IApi {
  path: string;
  file: string;
  search: string;
  other: string | null;
}

interface IUser {
  username: string;
  password: string;
}

const isJsonStr = (value: unknown): boolean => {
  if (typeof value !== 'string' || value?.trim()?.length === 0) return false;
  try {
    JSON5.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * @see https://github.com/AlistGo/alist-doc/blob/main/docs/api.md -v2
 * @see https://alist-public.apifox.cn/327961242e0 - v3
 */
class T3AlistAdapter {
  private ext: string = '';

  private headers: Record<string, any> = {};
  private params: Record<string, any> = {};
  private settings: Partial<ISettings> = {};
  private api: Partial<IApi> = {};
  private user: Partial<IUser> = {};
  private startPage: string = '/';
  private server: string = '';
  private showAll: boolean = false;

  constructor(source: IConstructorOptions) {
    this.ext = source.ext!;
  }

  async init(): Promise<ICmsInit> {
    let ext: string = this.ext;
    let source: ISource = { name: '', server: '' };
    if (ext.startsWith('http')) {
      const { data } = await request.request({ url: ext, method: 'GET', responseType: 'text' });
      ext = data;
    }
    try {
      source = JSON5.parse(ext);
    } catch {
      // ignore
    }

    const {
      name,
      server: rawServer,
      startPage = '/',
      showAll = false,
      params: rawParams = '{}',
      headers: rawHeaders = '{}',
      username = '',
      password = '',
    } = source;

    this.server = rawServer.endsWith('/') ? rawServer.slice(0, -1) : rawServer;
    this.params = isJsonStr(rawParams) ? JSON5.parse(rawParams) : {};
    this.headers = isJsonStr(rawHeaders) ? JSON5.parse(rawHeaders) : {};
    this.startPage = startPage;
    this.showAll = showAll;
    this.user = { username, password };

    const { data: resp } = await request.request({
      url: `${this.server}/api/public/settings`,
      method: 'GET',
      headers: this.headers,
    });
    const rawData = resp.data;

    const settings: Partial<ISettings> = {};
    if (Array.isArray(rawData)) {
      settings.title = rawData.find((x) => x.key === 'title')?.value || name;
      settings.v3 = false;
      settings.version = rawData.find((x) => x.key === 'version')?.value;
      settings.enableSearch = rawData.find((x) => x.key === 'enable search')?.value === 'true';
      settings.pagSize = Number(rawData.find((x) => x.key === 'default page size')?.value) || 30;
    } else {
      settings.title = rawData.site_title || name;
      settings.v3 = true;
      settings.version = rawData.version;
      settings.enableSearch = true;
      settings.pagSize = Number(rawData.default_page_size) || 30;
    }
    this.settings = settings as ISettings;

    this.api = {
      path: settings.v3 ? '/api/fs/list' : '/api/public/path',
      file: settings.v3 ? '/api/fs/get' : '/api/public/path',
      search: settings.v3 ? '/api/fs/search' : '/api/public/search',
      other: settings.v3 ? '/api/fs/other' : '',
    };

    await this.getToken();
  }

  async home(): Promise<ICmsHome> {
    return { class: [{ type_id: 'default', type_name: '默认' }], filters: {} };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    return { page: 1, pagecount: 0, total: 0, list: [] };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { page = 1, tid: rawTid = '/' } = doc || {};

    const tid = rawTid === 'default' ? this.startPage : rawTid;

    const { data: resp } = await request.request({
      url: `${this.server}${this.api.path}`,
      method: 'POST',
      data: {
        ...this.getParams(tid),
        ...(this.settings.v3
          ? {
              page,
              per_page: this.settings.pagSize,
              refresh: false,
            }
          : { page_num: page, page_size: this.settings.pagSize }),
      },
      headers: this.headers,
    });

    const parent = tid.endsWith('/') ? tid : `${tid}/`;

    const rawContent = this.settings.v3 ? resp.data?.content : resp.data?.files?.[0];
    const rawList = Array.isArray(rawContent) ? rawContent : [];

    const total = Number(resp?.data?.total) || 0;
    const pagecount = total > 0 ? Math.ceil(total / this.settings.pagSize!) : 0;
    const pagecurrent = page;

    const videos = rawList
      .filter((v) => (this.showAll ? true : this.isFolder(v) || this.isVideo(v)))
      .filter((v) => v.name)
      .map((v) => ({
        vod_id: parent + v.name + (this.isFolder(v) ? '/' : ''),
        vod_name: v.name.replaceAll('$', '_').replaceAll('#', '_') ?? '',
        vod_pic: this.getPic(v) || '',
        vod_remarks: String(this.getSize(v) || 0),
        vod_blurb: '',
        vod_tag: this.isFolder(v) ? 'folder' : 'file',
      }));

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const idsArray = [ids];

    const { data: resp } = await request.request({
      url: `${this.server}${this.api.file}`,
      method: 'POST',
      data: this.getParams(ids),
      headers: this.headers,
    });

    const rawContent = this.settings.v3 ? [resp.data] : [resp.data.files[0]];
    const rawList = Array.isArray(rawContent) ? rawContent : [];

    const pagecurrent = 1;
    const pagecount = rawList.length ? 1 : 0;
    const total = rawList.length;

    const videos = rawList
      .filter((v) => v.name)
      .map((v, i) => {
        return {
          vod_id: String((v.id || idsArray[i]) ?? ''),
          vod_name: v.name ?? '',
          vod_pic: this.getPic(v) || '',
          vod_remarks: String(this.getSize(v) || 0),
          vod_year: '',
          vod_lang: '',
          vod_area: '',
          vod_score: '0.0',
          vod_state: '',
          vod_class: '',
          vod_actor: '',
          vod_director: '',
          vod_content: '',
          vod_blurb: '',
          vod_play_from: this.settings.title ?? '',
          vod_play_url: `${v.name ?? ''}$${this.settings.v3 ? v.raw_url : v.url}`,
          type_name: '',
        };
      });

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  /**
   * only v3+ and enable search
   */
  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page = 1 } = doc || {};

    if (!this.settings.enableSearch) {
      return { page, pagecount: 0, total: 0, list: [] };
    }

    const { data: resp } = await request.request({
      url: `${this.server}${this.api.search}`,
      method: 'POST',
      data: {
        ...this.getParams('/'),
        keywords: wd,
        parent: '/',
        page,
        per_page: this.settings.pagSize,
        scope: 0, // 0:all 1:folder 2:file
      },
      headers: this.headers,
    });

    const rawContent = this.settings.v3 ? resp.data?.content : resp.data?.files?.[0];
    const rawList = Array.isArray(rawContent) ? rawContent : [];

    const total = Number(resp?.data?.total) || 0;
    const pagecount = total > 0 ? Math.ceil(total / this.settings.pagSize!) : 0;
    const pagecurrent = page;

    const videos = rawList
      .filter((v) => (this.showAll ? true : this.isFolder(v) || this.isVideo(v)))
      .filter((v) => v.name)
      .map((v) => ({
        vod_id: `${v.parent}${v.name}`,
        vod_name: v.name.replaceAll('$', '_').replaceAll('#', '_') ?? '',
        vod_pic: this.getPic(v) || '',
        vod_remarks: String(this.getSize(v) || 0),
        vod_blurb: '',
        vod_tag: this.isFolder(v) ? 'folder' : 'file',
      }));

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { play } = doc || {};
    return { parse: 0, url: play };
  }

  async proxy(_doc: ICmsProxyOptions): Promise<ICmsProxy> {
    return [];
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }

  private isFolder(data: { type: number }): boolean {
    return data.type === 1;
  }

  private isVideo(data: { type: number }): boolean {
    return this.settings.v3 ? data.type === 2 : data.type === 3;
  }

  // @ts-expect-error declared but its value is never read
  private isSubtitle(data: { type: number; name: string }) {
    if (data.type === 1) return false;
    const ext = ['.srt', '.ass', '.scc', '.stl', '.ttml'];
    return ext.some((x) => data.name.endsWith(x));
  }

  // @ts-expect-error declared but its value is never read
  private getType(data: { type: number }) {
    const isVideo = this.isVideo(data);
    return this.isFolder(data) ? 0 : isVideo ? 10 : 1;
  }

  private getPic(data: { type: number; thumb?: string; thumbnail?: string }) {
    const pic = this.settings.v3 ? data.thumb : data.thumbnail;
    if (pic) return pic;

    return this.isFolder(data)
      ? 'https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png'
      : '';
  }

  private getSize(data: { size: number }) {
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    let sz = data.size || 0;
    let i = 0;
    while (sz >= 1024 && i < sizes.length - 1) {
      sz /= 1024;
      i++;
    }
    return `${sz.toFixed(2)} ${sizes[i]}`;
  }

  // @ts-expect-error declared but its value is never read
  private getTime(data: { updated_at: string; time_str: string; modified: string }) {
    const tTime = data.updated_at || data.time_str || data.modified || '';
    const time = new Date(tTime);
    return time.toISOString().split('T')[0];
  }

  private getParams(path: string) {
    let password = { password: '' };
    const formatPath = path.replace(/\/+$/, '');
    if (formatPath) {
      const checkPasswd = this.params?.[formatPath];
      if (checkPasswd !== undefined) password = this.params[formatPath];
    }
    return Object.assign({}, password, { path });
  }

  private async getToken() {
    const { username, password } = this.user;
    const { v3 } = this.settings;

    if (v3 && username && password) {
      try {
        const { data: resp } = await request.request({
          url: `${this.server}/api/auth/login`,
          method: 'POST',
          data: { username, password },
        });
        const token = resp?.data?.token || '';
        if (token) this.headers.Authorization = token;
        return token;
      } catch {
        return '';
      }
    }
  }
}

export default T3AlistAdapter;
