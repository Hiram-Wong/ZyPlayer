import type { EventSourceMessage } from '@microsoft/fetch-event-source';

import type { RequestOptions } from '../type';

export interface ICreateSseParamsOptions {
  url: string;
  method: 'GET' | 'POST';
  timeout?: number;
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, any>;
}

export interface ICreateSseCallbackOptions {
  onAbort?: () => void;
  onComplete?: (aborted: boolean, config: ICreateSseParamsOptions) => void;
  onError?: (error: Error) => void;
  onMessage?: (event: EventSourceMessage) => void;
}

export type ISseRequestConfig = ICreateSseParamsOptions & ICreateSseCallbackOptions;

export type ICreateSseOptions = ICreateSseInsOptions & ICreateSseParamsOptions;

/**
 * @description 创建Sse实例配置
 */
export interface ICreateSseInsOptions {
  /**
   * 请求验证方案
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
   */
  authenticationScheme?: string;
  /**
   * 请求数据处理
   */
  transform?: ISseTransform;
  /**
   * 请求配置
   */
  requestOptions?: RequestOptions;
}

/**
 * Sse请求数据处理 抽象类
 */
export abstract class ISseTransform {
  /**
   * 请求前钩子
   */
  beforeRequestHook?: (config: ICreateSseParamsOptions, options: RequestOptions) => ISseRequestConfig;

  /**
   * 数据处理前钩子
   */
  transformRequestHook?: <T = any>(res, options: RequestOptions) => T;

  /**
   * 请求失败钩子
   */
  requestCatchHook?: <T = any>(error: string, options: RequestOptions) => Promise<T>;

  /**
   * 请求拦截器
   */
  requestInterceptors?: (config: ICreateSseParamsOptions, options: RequestOptions) => ISseRequestConfig;

  /**
   * 响应拦截器
   */
  responseInterceptors?: (res) => any;

  /**
   * 请求拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void;

  /**
   * 响应拦截器错误处理
   */
  responseInterceptorsCatch?: (error: Error) => void;
}
