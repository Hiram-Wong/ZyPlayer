import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = String(
  import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_URL_PREFIX}`,
);

const service: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 50000,
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
  const { data } = await service.request(config);
  return data as any;
};

export default request;
