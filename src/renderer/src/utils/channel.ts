import request from '@/utils/request';

let controller = new AbortController();

const checkChannel = async (url: string) => {
  try {
    const startTime: Date = new Date(); // 记录开始请求的时间
    await request({
      url,
      method: 'HEAD',
      timeout: 3000,
    });
    const endTime: Date = new Date(); // 记录接收到响应的时间
    const delay: number = endTime.getTime() - startTime.getTime(); // 计算延迟
    return delay;
  } catch (err) {
    // console.error(err);
    return 9999;
  }
};

const stopCheckChannel = () => {
  controller.abort();

  controller = new AbortController();
};

export { checkChannel, stopCheckChannel };
