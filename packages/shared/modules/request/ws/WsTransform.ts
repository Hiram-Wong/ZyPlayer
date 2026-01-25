import type WebSocket from 'isomorphic-ws';

import type { RequestOptions } from '../type';

export const WsCloseCodeReasonMap: Record<number, string> = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',

  1005: 'No Status Received (client-side)',
  1006: 'Abnormal Closure (no close frame)',

  1007: 'Invalid Payload Data',
  1008: 'Policy Violation',
  1009: 'Message Too Big',
  1010: 'Mandatory Extension Missing',
  1011: 'Internal Server Error',

  1012: 'Service Restart',
  1013: 'Try Again Later',
  1014: 'Bad Gateway',
  1015: 'TLS Handshake Failure',
};

export type IWebSocketHeartbeatMessage = string | ArrayBuffer | Blob;

export interface ICreateWsParamsOptions {
  url: string;
  method: 'GET';
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, any>;
  /**
   * Send heartbeat for every x milliseconds passed
   *
   * @default false
   */
  heartbeat?:
    | boolean
    | {
        /**
         * Message for the heartbeat
         *
         * @default 'ping'
         */
        message?: IWebSocketHeartbeatMessage;
        /**
         * Response message for the heartbeat, if undefined the message will be used
         */
        responseMessage?: IWebSocketHeartbeatMessage;
        /**
         * Interval, in milliseconds
         *
         * @default 1000
         */
        interval?: number;
        /**
         * Heartbeat response timeout, in milliseconds
         *
         * @default 1000
         */
        pongTimeout?: number;
      };
  /**
   * Enabled auto reconnect
   *
   * @default false
   */
  autoReconnect?:
    | boolean
    | {
        /**
         * Maximum retry times.
         *
         * Or you can pass a predicate function (which returns true if you want to retry).
         *
         * @default -1
         */
        retries?: number | ((retried: number) => boolean);
        /**
         * Delay for reconnect, in milliseconds
         *
         * Or you can pass a function to calculate the delay based on the number of retries.
         *
         * @default 1000
         */
        delay?: number | ((retries: number) => number);
      };
}

export interface ICreateWsCallbackOptions {
  onConnected?: (ws: WebSocket) => void;
  onDisconnected?: (ws: WebSocket, event: WebSocket.CloseEvent) => void;
  onError?: (ws: WebSocket, error: Error) => void;
  onMessage?: (ws: WebSocket, event: WebSocket.MessageEvent) => void;
}

export type IWsRequestConfig = ICreateWsParamsOptions & ICreateWsCallbackOptions;

export type ICreateWsOptions = ICreateWsInsOptions & ICreateWsParamsOptions;

/**
 * @description 创建Ws实例配置
 */
export interface ICreateWsInsOptions {
  /**
   * 请求验证方案
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
   */
  authenticationScheme?: string;
  /**
   * 请求数据处理
   */
  transform?: IWsTransform;
  /**
   * 请求配置
   */
  requestOptions?: RequestOptions;
}

/**
 * Ws请求数据处理 抽象类
 */
export abstract class IWsTransform {
  /**
   * 请求前钩子
   */
  beforeRequestHook?: (config: ICreateWsParamsOptions, options: RequestOptions) => IWsRequestConfig;

  /**
   * 数据处理前钩子
   */
  transformRequestHook?: <T = any>(res, options: RequestOptions) => T;

  /**
   * 请求失败钩子
   */
  requestCatchHook?: <T = any>(error, options: RequestOptions) => Promise<T>;

  /**
   * 请求拦截器
   */
  requestInterceptors?: (config: ICreateWsParamsOptions, options: RequestOptions) => IWsRequestConfig;

  /**
   * 响应拦截器
   */
  responseInterceptors?: (res) => any;

  /**
   * 请求拦截器错误处理
   */
  requestInterceptorsCatch?: (error: WebSocket.ErrorEvent) => void;

  /**
   * 响应拦截器错误处理
   */
  responseInterceptorsCatch?: (error: WebSocket.ErrorEvent) => void;
}
