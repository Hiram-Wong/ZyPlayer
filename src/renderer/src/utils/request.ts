import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getPinia } from '@/utils/tool';

const baseURL = String(
  import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_URL_PREFIX}`,
);

const service: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  // timeout: TIMEOUT,
});

service.interceptors.request.use((config: AxiosRequestConfig) => {
  return config;
});

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response;
    return res;
  },
  (error: AxiosError) => {
    const { response } = error;
    const data = response?.data as any;
    if (data?.code === 301 && data?.message === '未登录') {
      console.log('未登录');
    }
    return Promise.reject(error);
  },
);

const request = async (config: AxiosRequestConfig) => {
  if (config?.timeout) {
    const TIMEOUT = getPinia('setting', 'timeout') || 5;
    config.timeout = TIMEOUT;
  }
  const { data } = await service.request(config);
  return data as any;
};

const requestComplete = async (config: AxiosRequestConfig) => {
  if (config?.timeout) {
    const TIMEOUT = getPinia('setting', 'timeout') || 5;
    config.timeout = TIMEOUT;
  }
  const { status, data, headers } = await service.request(config);
  return {
    status,
    data,
    headers,
  };
};

export { request as default, requestComplete };
