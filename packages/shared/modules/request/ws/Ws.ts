import { cloneDeep, debounce, isFunction, throttle } from 'es-toolkit';
import WebSocket from 'isomorphic-ws';

import type { RequestOptions } from '../type';
import { WsCanceler } from './WsCancel';
import type { ICreateWsInsOptions, ICreateWsOptions, IWsRequestConfig } from './WsTransform';
import { WsCloseCodeReasonMap } from './WsTransform';

export class VWs {
  canceler: WsCanceler;
  private readonly options: ICreateWsInsOptions;

  constructor(options: ICreateWsInsOptions) {
    this.options = options;
    this.canceler = new WsCanceler();
  }

  /**
   * 获取数据处理类
   * @private
   */
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  get<T = any>(config: IWsRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  /**
   * 请求封装
   * @param config
   * @param options
   */
  request<T = any>(config: IWsRequestConfig, options?: RequestOptions): Promise<T> {
    const { requestOptions } = this.options;

    if (requestOptions?.throttle !== undefined && requestOptions.debounce !== undefined) {
      throw new Error('throttle and debounce cannot be set at the same time');
    }

    if (requestOptions?.throttle && requestOptions.throttle.delay !== 0) {
      return new Promise((resolve) => {
        throttle(() => resolve(this.synthesisRequest(config, options)), requestOptions.throttle?.delay as number);
      });
    }

    if (requestOptions?.debounce && requestOptions.debounce.delay !== 0) {
      return new Promise((resolve) => {
        debounce(() => resolve(this.synthesisRequest(config, options)), requestOptions.debounce?.delay as number);
      });
    }

    return this.synthesisRequest(config, options);
  }

  private async synthesisRequest<T = any>(config: IWsRequestConfig, options?: RequestOptions): Promise<T> {
    const { onConnected, onDisconnected, onMessage, onError, ...configRest } = config;

    const transform = this.getTransform();

    const { requestOptions } = this.options;
    const opt = { ...requestOptions, ...options };

    let conf: ICreateWsOptions = cloneDeep(configRest);

    const {
      beforeRequestHook,
      requestCatchHook,
      requestInterceptors,
      transformRequestHook,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform || {};

    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }

    conf.requestOptions = opt;
    conf.method ||= 'GET';

    conf.headers = {
      ...(conf.headers || {}),
    };

    if (conf.params) conf.url += `?${new URLSearchParams(conf.params).toString()}`;

    let aborted = false;
    const canceler = this.canceler;
    const controller = new AbortController();
    controller.signal.onabort = () => {
      if (aborted) return;
      aborted = true;
      stopHeartbeat();
      ws?.close();
      canceler.removePending(conf);
    };

    const { ignoreCancelToken } = conf.requestOptions;
    const ignoreCancel = ignoreCancelToken ?? this.options.requestOptions?.ignoreCancelToken;
    if (!ignoreCancel) canceler.addPending({ ...conf, signal: controller });
    if (requestInterceptors && isFunction(requestInterceptors)) {
      conf = requestInterceptors(conf, opt);
    }

    let ws: WebSocket;
    let reconnectCount: number = 0;

    const heartbeatCfg =
      typeof conf?.heartbeat === 'object'
        ? {
            message: conf.heartbeat.message ?? 'ping',
            responseMessage: conf.heartbeat.responseMessage ?? conf.heartbeat.message ?? 'ping',
            interval: conf.heartbeat.interval ?? 1000,
            pongTimeout: conf.heartbeat.pongTimeout ?? 1000,
          }
        : conf?.heartbeat
          ? {
              message: 'ping',
              responseMessage: 'ping',
              interval: 1000,
              pongTimeout: 1000,
            }
          : null;

    let heartbeatTimer: NodeJS.Timeout | null = null;
    let pongTimer: NodeJS.Timeout | null = null;

    const startHeartbeat = () => {
      if (!heartbeatCfg) return;
      stopHeartbeat();
      heartbeatTimer = setInterval(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(heartbeatCfg.message as any);
        pongTimer = setTimeout(() => ws.close(), heartbeatCfg.pongTimeout);
      }, heartbeatCfg.interval);
    };

    const stopHeartbeat = () => {
      heartbeatTimer && clearInterval(heartbeatTimer);
      pongTimer && clearTimeout(pongTimer);
      heartbeatTimer = pongTimer = null;
    };

    const autoReconnectCfg =
      typeof conf?.autoReconnect === 'object'
        ? conf.autoReconnect
        : conf?.autoReconnect
          ? { retries: -1, delay: 1000 }
          : null;

    const canReconnect = () => {
      if (!autoReconnectCfg) return false;
      if (typeof autoReconnectCfg.retries === 'function') {
        return autoReconnectCfg.retries(reconnectCount);
      }
      if (typeof autoReconnectCfg.retries === 'number') {
        return autoReconnectCfg.retries < 0 || reconnectCount < autoReconnectCfg.retries;
      }
      return true;
    };

    const getReconnectDelay = () => {
      if (typeof autoReconnectCfg?.delay === 'function') {
        return autoReconnectCfg.delay(reconnectCount);
      }
      return autoReconnectCfg?.delay ?? 1000;
    };

    if (!conf.requestOptions?.ignoreCancelToken) {
      this.canceler.addPending({
        ...conf,
        abort: () => {
          stopHeartbeat();
          ws?.close();
        },
      });
    }

    const connect = (): Promise<T> => {
      return new Promise((resolve, reject) => {
        const socket = new WebSocket(conf.url);

        socket.onopen = (_event: WebSocket.Event): void => {
          reconnectCount = 0;
          onConnected?.(socket);
          startHeartbeat();

          resolve(socket as unknown as T);
        };

        socket.onmessage = (event: WebSocket.MessageEvent): void => {
          if (heartbeatCfg && event.data === heartbeatCfg.responseMessage) {
            pongTimer && clearTimeout(pongTimer);
            return;
          }

          let packet = event;

          try {
            if (transformRequestHook && isFunction(transformRequestHook)) {
              packet = transformRequestHook(packet, opt);
            }

            if (responseInterceptors && isFunction(responseInterceptors)) {
              packet = responseInterceptors(packet);
            }
          } catch {}

          onMessage?.(socket, packet);
        };

        socket.onerror = (event: WebSocket.ErrorEvent): void => {
          let err: Error = new Error('WebSocket error occurred');

          // 1. response interceptor
          if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch)) {
            try {
              responseInterceptorsCatch(event);
            } catch (e) {
              err = e as Error;
            }
          }

          // 2. user onError hook
          if (onError && isFunction(onError)) {
            try {
              onError?.(socket, err);
            } catch {}
          }
        };

        socket.onclose = (event: WebSocket.CloseEvent): void => {
          stopHeartbeat();
          canceler.removePending(conf);
          onDisconnected?.(socket, event);

          if (!aborted && canReconnect()) {
            reconnectCount++;
            setTimeout(async () => {
              ws = (await connect()) as WebSocket;
            }, getReconnectDelay());
          }

          if (!event.wasClean && !canReconnect()) {
            if (requestCatchHook && isFunction(requestCatchHook)) {
              requestCatchHook(event, opt);
            }
            const reason = WsCloseCodeReasonMap?.[event.code] || 'WebSocket disconnected unexpectedly';
            reject(new Error(reason));
          }
        };
      });
    };

    ws = (await connect()) as WebSocket;

    return ws as unknown as Promise<T>;
  }
}
