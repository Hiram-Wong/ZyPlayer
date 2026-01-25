import { join } from 'node:path';

import { loggerService } from '@logger';
import { PythonService } from '@main/services/PythonService';
import { APP_PUBLIC_PATH } from '@main/utils/path';
import { request } from '@main/utils/request';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import { isJson } from '@shared/modules/validate';
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
import workerpool from 'workerpool';
import * as zmq from 'zeromq';

const logger = loggerService.withContext(SITE_LOGGER_MAP[SITE_TYPE.T3_PY]);

const loggerModule = async (port: number) => {
  try {
    const workerpool = await import('workerpool');
    const zmq = await import('zeromq');

    const sock = new zmq.Subscriber();
    sock.connect(`tcp://127.0.0.1:${port}`);
    sock.subscribe('');

    for await (const [msgRaw] of sock) {
      const msg = JSON.parse(msgRaw as unknown as string);
      workerpool.workerEmit({ type: 'log', level: 'verbose', msg });
    }
  } catch (error) {
    workerpool.workerEmit({ type: 'log', level: 'error', msg: (error as Error).message });
  }
};

class ConnectService extends PythonService {
  private static instance: ConnectService;

  private pool: workerpool.Pool | null = null;
  private socket: zmq.Request | null = null;
  private pids: number[] = [];

  private readonly ctrlPort: number = 19979;
  private readonly logPort: number = this.ctrlPort + 1;

  public static getInstance(): ConnectService {
    if (!ConnectService.instance) {
      ConnectService.instance = new ConnectService({
        projectBasePath: join(APP_PUBLIC_PATH, 't3PyBase'),
      });
    }
    return ConnectService.instance;
  }

  private async connectLogger(): Promise<void> {
    if (this.pool) return;

    try {
      const pool = workerpool.pool({
        maxWorkers: 1,
        workerType: 'process',
        workerTerminateTimeout: 5000,
      });

      await pool.exec(loggerModule, [this.logPort], {
        on(payload) {
          const { type, level, msg } = payload;

          if (type === 'log') {
            const msgType = msg?.type;
            const msgList = msg?.msg ?? [];

            const log =
              msgType === 'single'
                ? msgList[0]
                : msgList.map((t: any) => (isJson(t) ? JSON.stringify(t) : t)).join(' ');

            logger[level](log);
          }
        },
      });

      this.pool = pool;
    } catch (error) {
      this.pool = null;
      throw new Error(`Failed to connect to Python logger service: ${error}`);
    }
  }

  private connectApi(): void {
    if (this.socket) return;

    try {
      const ctrlSocket = new zmq.Request();
      ctrlSocket.connect(`tcp://127.0.0.1:${this.ctrlPort}`);
      this.socket = ctrlSocket;
    } catch (error) {
      this.socket = null;
      throw new Error(`Failed to connect to Python api service: ${error}`);
    }
  }

  private async connect(): Promise<void> {
    this.connectLogger();
    this.connectApi();
  }

  public async prepare(): Promise<void> {
    this.checkBinary();
    await this.installDep();

    const args = ['main.py', '--ctrl-port', String(this.ctrlPort)];

    const pids = await this.matchProcess(args.join(' '));

    if (pids.length) {
      this.pids = pids;
      await this.connect();
      return;
    }

    try {
      this.runSpawn(['main.py', '--ctrl-port', String(this.ctrlPort)]);

      const pids = await this.matchProcess(args.join(' '));
      if (pids.length) {
        this.pids = pids;
        await this.connect();
      }
    } catch (error) {
      throw new Error(`Failed to start Python t3Py service: ${error}`);
    }
  }

  public async terminate(): Promise<void> {
    try {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      if (this.pool) {
        await this.pool.terminate(true);
        this.pool = null;
      }

      if (!this.pids.length) {
        const args = ['main.py', '--ctrl-port', String(this.ctrlPort)];
        const pids = await this.matchProcess(args.join(' '));
        if (pids.length) this.pids = pids;
      }

      if (this.pids.length) {
        await this.killProcess(this.pids);
      }

      this.pids = [];
    } catch (error) {
      logger.error('Error during termination:', error as Error);
    }
  }

  public getSocket(): zmq.Request | null {
    return this.socket;
  }
}

const connectService = ConnectService.getInstance();

export class T3PyAdapter {
  categories: string[] = [];
  api: string = '';
  ext: string = '';

  code: string = '';
  pids: number[] = [];

  constructor(source: IConstructorOptions) {
    this.api = source.api!;
    this.ext = source.ext!;
    this.categories = source.categories;
  }

  public static async prepare(): Promise<void> {
    await connectService.prepare();
  }

  public static async terminate(): Promise<void> {
    await connectService.terminate();
  }

  async execCtx(type: string, options: any[] = []): Promise<any> {
    const socket = connectService.getSocket();
    if (!socket) {
      throw new Error('Socket is not initialized.');
    }

    await socket.send(JSON.stringify({ code: this.code, type, options }));

    const [reply] = await socket.receive();
    const result = JSON.parse(reply.toString());

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  }

  async init(): Promise<ICmsInit> {
    let content = '';
    if (this.api.startsWith('http')) {
      const { data } = await request.request({ url: this.api, method: 'GET' });
      content = data;
    }
    this.code = content;

    const resp = await this.execCtx('init', [this.ext]);
    return resp;
  }

  async home(): Promise<ICmsHome> {
    const resp = await this.execCtx('homeContent', [true]);

    const rawClassList = Array.isArray(resp?.class) ? resp.class : [];
    const classes = rawClassList
      .map((item) => ({
        type_id: String(item.type_id ?? '').trim(),
        type_name: item.type_name?.toString().trim() ?? '',
      }))
      .filter(
        (item, index, self) =>
          item.type_id &&
          item.type_name &&
          !this.categories?.includes(item.type_name) &&
          self.findIndex((other) => other.type_id === item.type_id) === index,
      );
    const classIds = classes.map((item) => item.type_id);

    const rawFiltersObj = resp?.filters && Object.keys(resp?.filters).length ? resp.filters : {};
    const filters = Object.keys(rawFiltersObj).reduce((acc, key) => {
      if (String(key) && classIds.includes(String(key))) {
        acc[String(key)] = rawFiltersObj[key];
      }
      return acc;
    }, {});

    return { class: classes, filters };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    const resp = await this.execCtx('homeVideoContent', []);

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || 1;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { tid, page = 1, extend = {} } = doc || {};
    const resp = await this.execCtx('categoryContent', [tid, page, Object.keys(extend).length > 0, extend]);

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const resp = await this.execCtx('detailContent', [[ids]]);

    const idsArray = [ids];
    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v, i) => ({
        vod_id: String((v.vod_id || idsArray[i]) ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_year: String(v.vod_year ?? ''),
        vod_lang: v.vod_lang ?? '',
        vod_area: v.vod_area ?? '',
        vod_score: String(v.vod_score ?? '0.0'),
        vod_state: v.vod_state ?? '', // '正片' | '预告' | '花絮'
        vod_class: v.vod_class ?? '', // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
        vod_actor: v.vod_actor ?? '',
        vod_director: v.vod_director ?? '',
        vod_content: (v.vod_content ?? '')?.trim(),
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_play_from: v.vod_play_from ?? '',
        vod_play_url: v.vod_play_url ?? '',
        type_name: v.type_name ?? '',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || 1;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page = 1 } = doc || {};
    const resp = await this.execCtx('searchContent', [wd, false, page]);

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { flag, play } = doc || {};
    const resp = await this.execCtx('playerContent', [flag, play, []]);

    const qs = resp?.parse_extra;
    const scriptObj = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};

    const res = {
      url: resp?.url || '',
      quality: resp.quality || [],
      parse: resp.parse || 0,
      jx: resp.jx || 0,
      headers: resp?.header || resp?.headers || {},
      script: Object.keys(scriptObj).length
        ? {
            ...(resp.js ? { runScript: resp.js } : {}),
            ...(scriptObj.init_script ? { initScript: scriptObj.init_script } : {}),
            ...(scriptObj.custom_regex ? { customRegex: scriptObj.custom_regex } : {}),
            ...(scriptObj.sniffer_exclude ? { snifferExclude: scriptObj.sniffer_exclude } : {}),
          }
        : {},
    };

    return res;
  }

  async proxy(doc: ICmsProxyOptions): Promise<ICmsProxy> {
    const resp = await this.execCtx('localProxy', [doc]);
    return resp;
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }
}

export default T3PyAdapter;
