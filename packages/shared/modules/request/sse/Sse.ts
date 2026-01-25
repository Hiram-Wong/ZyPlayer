import type { EventSourceMessage } from '@microsoft/fetch-event-source';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { cloneDeep, debounce, isFunction, throttle } from 'es-toolkit';
import { stringify } from 'qs';

import { ContentTypeEnum } from '../constants';
import type { RequestOptions } from '../type';
import { SseCanceler } from './SseCancel';
import type { ICreateSseInsOptions, ICreateSseOptions, ISseRequestConfig } from './SseTransform';

export class VSse {
  canceler: SseCanceler;
  private readonly options: ICreateSseInsOptions;

  constructor(options: ICreateSseInsOptions) {
    this.options = options;
    this.canceler = new SseCanceler();
  }

  /**
   * 获取数据处理类
   * @private
   */
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  /**
   * 支持 FormData 请求格式
   * @param config
   */
  supportFormData(config: ISseRequestConfig): ISseRequestConfig {
    const headers = config.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FormURLEncoded ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === 'GET'
    ) {
      return config;
    }

    return {
      ...config,
      data: stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  /**
   * 支持 params 序列化
   * @param config
   */
  supportParamsStringify(config: ISseRequestConfig): ISseRequestConfig {
    const headers = config.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (contentType === ContentTypeEnum.FormURLEncoded || !Reflect.has(config, 'params')) {
      return config;
    }

    return {
      ...config,
      // paramsSerializer: (params: any) => stringify(params, { arrayFormat: 'brackets' }),
    };
  }

  get<T = any>(config: ISseRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: ISseRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  /**
   * 请求封装
   * @param config
   * @param options
   */
  request<T = any>(config: ISseRequestConfig, options?: RequestOptions): Promise<T> {
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

  private async synthesisRequest<T = any>(config: ISseRequestConfig, options?: RequestOptions): Promise<T> {
    const { onMessage, onComplete, onAbort, onError, ...configRest } = config;

    const transform = this.getTransform();

    const { requestOptions } = this.options;
    const opt = { ...requestOptions, ...options };

    let conf: ICreateSseOptions = cloneDeep(configRest);

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

    if (
      conf.method.toUpperCase() !== 'GET' &&
      (conf.headers?.['Content-Type'] === ContentTypeEnum.Json ||
        conf.headers?.['content-type'] === ContentTypeEnum.Json) &&
      conf.data &&
      Object.keys(conf.data).length > 0
    ) {
      (conf as unknown as Omit<typeof conf, 'data'> & { data: string }).data = JSON.stringify(conf.data);
    }

    conf = this.supportFormData(conf);
    // 支持params数组参数格式化，因axios默认的toFormData即为brackets方式，无需配置paramsSerializer为qs，有需要可解除注释，参数参考qs文档
    // conf = this.supportParamsStringify(conf);

    if (conf.params) conf.url += `?${new URLSearchParams(conf.params).toString()}`;

    const canceler = this.canceler;
    const controller = new AbortController();
    controller.signal.onabort = () => {
      canceler.removePending(conf);
      onAbort?.();
    };

    const { ignoreCancelToken } = conf.requestOptions!;
    const ignoreCancel = ignoreCancelToken ?? this.options.requestOptions?.ignoreCancelToken;
    if (!ignoreCancel) canceler.addPending({ ...conf, signal: controller });
    if (requestInterceptors && isFunction(requestInterceptors)) {
      conf = requestInterceptors(conf, opt);
    }

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      fetchEventSource(conf.url, {
        method: conf.method,
        headers: conf.headers,
        body: conf.method !== 'GET' ? (conf.data as BodyInit) : undefined,
        signal: controller.signal,
        async onopen(response: Response): Promise<void> {
          if (conf.timeout && Date.now() - startTime > conf.timeout) {
            canceler.removePending(conf);
            reject(new Error('Request timeout'));
          }

          if (!response.ok) {
            if (requestCatchHook && isFunction(requestCatchHook)) {
              requestCatchHook(response.statusText, opt);
            }
            reject(new Error(`Request failed with status ${response.status}`));
          }

          resolve({ abort: () => controller.abort() } as unknown as T);
        },
        onmessage(event: EventSourceMessage): void {
          let chunk = event;

          try {
            if (transformRequestHook && isFunction(transformRequestHook)) {
              chunk = transformRequestHook(chunk, opt);
            }

            if (responseInterceptors && isFunction(responseInterceptors)) {
              chunk = responseInterceptors(chunk);
            }
          } catch {}

          onMessage?.(chunk);
        },
        onerror(error: Error): void {
          let err: Error = error;

          // 1. response interceptor
          if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch)) {
            try {
              responseInterceptorsCatch(error);
            } catch (e) {
              err = e as Error;
            }
          }

          // 2. user onError hook
          if (onError && isFunction(onError)) {
            try {
              onError(err);
            } catch {}
          }

          reject(err);
          throw err; // Needed to stop the fetchEventSource retrying
        },
        onclose(): void {
          canceler.removePending(conf);
          onComplete?.(controller.signal.aborted === true, conf);
        },
      });
    });
  }
}
