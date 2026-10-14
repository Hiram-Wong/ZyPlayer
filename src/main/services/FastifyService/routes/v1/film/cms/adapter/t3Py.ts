import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { extname, join } from 'node:path';

import * as grpc from '@grpc/grpc-js';
import { loggerService } from '@logger';
import { PythonService } from '@main/services/PythonService';
import { readFile } from '@main/utils/file';
import { APP_FILE_PATH, APP_PUBLIC_PATH } from '@main/utils/path';
import { getTimeout } from '@main/utils/tool';
import { FILE_MANAGE_API } from '@shared/config/env';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import { isJson, isJsonStr } from '@shared/modules/validate';
import type { ICmsParams, ICmsResultPromise, IConstructorOptions } from '@shared/types/cms';
import JSON5 from 'json5';

import { getManagedPathFromUrl, resolveManagedPath } from '../../../file/path';

const logger = loggerService.withContext(SITE_LOGGER_MAP[SITE_TYPE.T3_PY]);

const GRPC_SERVICE_NAME = 't3py.SpiderService';

interface IGrpcRequest {
  code: string;
  token: string;
  type: string;
  options: any[];
}

interface IGrpcResponse {
  result?: any;
  error?: string;
}

type ISpiderGrpcClient = grpc.Client & {
  Exec: ((
    request: IGrpcRequest,
    options: grpc.CallOptions,
    callback: (error: grpc.ServiceError | null, response: IGrpcResponse) => void,
  ) => grpc.ClientUnaryCall) &
    ((
      request: IGrpcRequest,
      callback: (error: grpc.ServiceError | null, response: IGrpcResponse) => void,
    ) => grpc.ClientUnaryCall);
};

type ISpiderGrpcClientConstructor = new (
  address: string,
  credentials: grpc.ChannelCredentials,
  options?: Partial<grpc.ClientOptions>,
) => ISpiderGrpcClient;

const createGrpcClientCtor = (): ISpiderGrpcClientConstructor => {
  const serviceDefinition: grpc.ServiceDefinition = {
    Exec: {
      path: `/${GRPC_SERVICE_NAME}/Exec`,
      requestStream: false,
      responseStream: false,
      requestSerialize: (value: IGrpcRequest): Buffer => Buffer.from(JSON.stringify(value), 'utf-8'),
      requestDeserialize: (buffer: Buffer): IGrpcRequest => JSON5.parse(buffer.toString('utf-8')),
      responseSerialize: (value: IGrpcResponse): Buffer => Buffer.from(JSON.stringify(value), 'utf-8'),
      responseDeserialize: (buffer: Buffer): IGrpcResponse => JSON5.parse(buffer.toString('utf-8')),
      originalName: 'Exec',
    },
  };

  return grpc.makeGenericClientConstructor(
    serviceDefinition,
    GRPC_SERVICE_NAME,
  ) as unknown as ISpiderGrpcClientConstructor;
};

class ConnectService extends PythonService {
  private static instance: ConnectService;

  private client: ISpiderGrpcClient | null = null;
  private pids: number[] = [];
  private stdoutBuffer: string = '';

  private readonly port: number = 19979;
  private readonly token: string = randomBytes(32).toString('base64url');

  public static getInstance(): ConnectService {
    if (!ConnectService.instance) {
      ConnectService.instance = new ConnectService({
        projectBasePath: join(APP_PUBLIC_PATH, 't3PyBase'),
      });
    }
    return ConnectService.instance;
  }

  private async connect(): Promise<void> {
    if (this.client) return;

    try {
      const ClientCtor = createGrpcClientCtor();
      const client = new ClientCtor(`127.0.0.1:${this.port}`, grpc.credentials.createInsecure());
      const deadline = new Date(Date.now() + 5 * 1000);

      await new Promise<void>((resolve, reject) => {
        client.waitForReady(deadline, (error?: Error | null) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });

      this.client = client;
    } catch (error) {
      this.client = null;
      throw new Error(`Failed to connect gRPC service: ${(error as Error).message}`);
    }
  }

  private handlePythonStdout(chunk: string): void {
    this.stdoutBuffer += chunk;

    const lines = this.stdoutBuffer.split(/\r?\n/);
    this.stdoutBuffer = lines.pop() ?? '';

    for (const line of lines) {
      const payload = line.trim();
      if (!payload) continue;

      const { type, level, msg } = isJsonStr(payload) ? JSON5.parse(payload) : {};

      if (type === 'log') {
        // const msgType = msg.type;
        const msgList = msg?.msg ?? [];

        const log = msgList.map((t: any) => (isJson(t) ? JSON.stringify(t) : t)).join(' ');

        logger[level](log);
      }
    }
  }

  private handlePythonStderr(chunk: string): void {
    const lines = chunk.split(/\r?\n/).map((line) => line.trim());

    for (const line of lines) {
      const payload = line.trim();
      if (!payload) continue;
      if (/I\d+/.test(payload)) continue;

      logger.warn(payload);
    }
  }

  public async prepare(): Promise<void> {
    try {
      const isBinaryEnv = await this.checkBinary();
      if (!isBinaryEnv) throw new Error('UV binary is not ready');

      const isPipInstalled = await this.pipInstall();
      if (!isPipInstalled) throw new Error('Failed to install pip dependencies');

      const pids = this.pids.length ? this.pids : await this.matchPort(this.port);
      if (!pids.length) {
        await new Promise<void>((resolve, reject) => {
          this.runSpawn(['main.py', '--port', String(this.port)], true, {
            env: { ZYFUN_T3PY_TOKEN: this.token },
            stdoutCb: async (data) => {
              this.handlePythonStdout(data);

              if (data.includes('Spider gRPC server started')) {
                const pids = await this.matchPort(this.port);
                if (pids.length) {
                  this.pids = pids;
                  resolve();
                }
              }
            },
            stderrCb: (data) => {
              this.handlePythonStderr(data);
            },
            errorCb: (error) => {
              reject(new Error(`Python process error: ${(error as Error).message}`));
            },
            closeCb: (code) => {
              reject(new Error(`Python process exited: ${code ?? 'unknown'}`));
            },
          });
        });
      }

      await this.connect();
    } catch (error) {
      logger.error(`Failed to prepare: ${(error as Error).message}`);
      throw error;
    }
  }

  public async terminate(): Promise<void> {
    try {
      if (this.client) {
        this.client.close();
      }

      if (!this.pids.length) {
        const pids = await this.matchPort(this.port);
        if (pids.length) this.pids = pids;
      }
      if (this.pids.length) await this.killProcess(this.pids);

      this.client = null;
      this.pids = [];
      this.stdoutBuffer = '';
    } catch (error) {
      logger.error(`Error on termination: ${(error as Error).message}`);
    }
  }

  public async execCtx(code: string, type: string, options: any[] = []): Promise<any> {
    if (!this.client) throw new Error('gRPC client is not initialized');

    return await new Promise<any>((resolve, reject) => {
      const payload: IGrpcRequest = { code, token: this.token, type, options };
      const deadline = new Date(Date.now() + getTimeout());

      this.client!.Exec(payload, { deadline }, (error, response) => {
        if (error) return reject(error);
        if (!response) return reject(new Error('response is empty'));
        if (response.error) return reject(new Error(response.error));
        resolve(response.result);
      });
    });
  }
}

const connectService = ConnectService.getInstance();

export class T3PyAdapter {
  categories: string[] = [];
  api: string = '';
  ext: string = '';

  code: string = '';

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

  public static async setup(): Promise<void> {
    await connectService.prepare();
  }

  private async execCtx(type: string, options: any[] = []): Promise<any> {
    const result = await connectService.execCtx(this.code, type, options);
    return result;
  }

  async init(): ICmsResultPromise['init'] {
    let requestedPath = '';
    try {
      requestedPath = getManagedPathFromUrl(this.api, FILE_MANAGE_API);
    } catch {
      throw new Error('T3Py sources must be stored in the application-managed file directory');
    }

    const sourcePath = await resolveManagedPath(APP_FILE_PATH, requestedPath);
    if (extname(sourcePath).toLowerCase() !== '.py') throw new Error('T3Py source must be a Python file');

    const content = await readFile(sourcePath);
    if (typeof content !== 'string') throw new Error('T3Py source could not be read');
    this.code = content;

    const resp = await this.execCtx('init', [this.ext]);
    return resp;
  }

  async home(): ICmsResultPromise['home'] {
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

  async homeVod(): ICmsResultPromise['homeVod'] {
    const resp = await this.execCtx('homeVideoContent', []);

    const rawList = Array.isArray(resp?.list) ? resp.list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: ['action', 'file', 'folder'].includes(v.vod_tag || 'file') ? v.vod_tag : 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || 1;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsParams['category']): ICmsResultPromise['category'] {
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
        vod_tag: ['action', 'file', 'folder'].includes(v.vod_tag || 'file') ? v.vod_tag : 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsParams['detail']): ICmsResultPromise['detail'] {
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

  async search(doc: ICmsParams['search']): ICmsResultPromise['search'] {
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
        vod_tag: ['action', 'file', 'folder'].includes(v.vod_tag || 'file') ? v.vod_tag : 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = Number(resp?.page) || page;
    const pagecount = Number(resp?.pagecount) || (videos.length ? 1 : 0);
    const total = Number(resp?.total) || videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsParams['play']): ICmsResultPromise['play'] {
    const { flag, play } = doc || {};
    const resp = await this.execCtx('playerContent', [flag, play, []]);

    const qs = resp?.parse_extra;
    const scriptObj = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};

    const res = {
      url: (Array.isArray(resp?.url) && resp.url.length > 0 ? resp.url?.[1] : resp?.url) || '',
      quality:
        Array.isArray(resp?.url) && resp.url.length > 0
          ? resp.url.flatMap((name, i, arr) => (i % 2 === 0 && arr[i + 1] ? [{ name, url: arr[i + 1] }] : []))
          : [],
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

  async action(doc: ICmsParams['action']): ICmsResultPromise['action'] {
    const { action, value, timeout } = doc || {};
    const resp = await this.execCtx('actionContent', [action, value, timeout]);
    return resp;
  }

  async proxy(doc: ICmsParams['proxy']): ICmsResultPromise['proxy'] {
    const resp = await this.execCtx('localProxy', [doc]);
    return resp;
  }

  async runMain(_doc: ICmsParams['runMain']): ICmsResultPromise['runMain'] {
    return '';
  }
}

export default T3PyAdapter;
