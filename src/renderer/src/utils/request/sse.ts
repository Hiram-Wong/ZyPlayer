// sse配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
import { VSse } from '@shared/modules/request';
import { ContentTypeEnum } from '@shared/modules/request/constants';
import type { ICreateSseInsOptions, ISseTransform } from '@shared/modules/request/sse/SseTransform';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from '@shared/modules/request/utils';
import { isString, merge } from 'es-toolkit';

import { host, prefix } from '@/utils/env';
import { getTimeout } from '@/utils/tool';

// 数据处理，方便区分多种处理方式
const transform: ISseTransform = {
  // 处理请求数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: (res, options) => {
    const { isTransformResponse, isReturnNativeResponse } = options;

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }

    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data;
    }

    return res;
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const { apiUrl, isJoinPrefix, urlPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    if (!config.url.startsWith('http') && !config.url.startsWith('https')) {
      // 添加接口前缀
      if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
        config.url = `${urlPrefix}${config.url}`;
      }

      // 将baseUrl拼接
      if (apiUrl && isString(apiUrl)) {
        config.url = `${apiUrl}${config.url}`;
      }
    }

    const params = config.params || {};
    const data = config.data || {};

    if (formatDate && data && !isString(data)) {
      formatRequestDate(data);
    }
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params);
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Object.keys(config.data).length > 0 || data instanceof FormData)
      ) {
        config.data = data;
        config.params = params;
      } else {
        // 非GET请求如果没有提供data，则将params视为data
        config.data = params;
        config.params = undefined;
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.data });
      }
    } else {
      // 兼容restful风格
      config.url += params;
      config.params = undefined;
    }
    // 设置超时时间
    config.timeout = getTimeout(config?.timeout);
    return config;
  },

  // 请求拦截器处理
  requestInterceptors: (config, _options) => {
    // 请求之前处理config
    return config;
  },

  // 响应拦截器处理
  responseInterceptors: (res) => {
    return res.data;
  },

  // 响应错误处理
  responseInterceptorsCatch: (error: any) => {
    throw error;
  },
};

function createSse(opt?: Partial<ICreateSseInsOptions>) {
  return new VSse(
    merge(
      <ICreateSseInsOptions>{
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // 例如: authenticationScheme: 'Bearer'
        authenticationScheme: '',
        // 超时
        timeout: 10 * 1000,
        // 携带Cookie
        withCredentials: true,
        // 头信息
        headers: { 'Content-Type': ContentTypeEnum.Json },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 接口地址
          apiUrl: host,
          // 是否自动添加接口前缀
          isJoinPrefix: true,
          // 接口前缀
          // 例如: https://www.baidu.com/api
          urlPrefix: prefix,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 是否加入时间戳
          joinTime: true,
          // 是否忽略请求取消令牌
          // 如果启用，则重复请求时不进行处理
          // 如果禁用，则重复请求时会取消当前请求
          ignoreCancelToken: false,
          // 是否携带token
          withToken: false,
          // 重试
          retry: {
            count: 0,
            delay: 1000,
          },
        },
      },
      opt || {},
    ),
  );
}
export const request = createSse();
