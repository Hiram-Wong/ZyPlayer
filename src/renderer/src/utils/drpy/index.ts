import Worker from '@/utils/drpy/worker?worker';
import { getPinia } from '@/utils/tool';

let worker: Worker = new Worker();
let timer: any = null;

const doWork = (data) => {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const response = event.data;
      if (response) clearInterval(timer);
      resolve(response);
    };

    worker.onerror = (error) => {
      reject(error);
    };

    worker.postMessage(data);

    const TIMEOUT = getPinia('setting', 'timeout') || 5000;
    timer = setTimeout(async () => {
      worker.terminate();
      worker = new Worker();
      reject(new Error('Worker job run 15s, timed out'));
    }, TIMEOUT * 2);
  });
};

const terminateWork = () => {
  return new Promise((resolve, reject) => {
    if (timer) clearInterval(timer);
    if (typeof worker !== 'undefined' && worker !== null) {
      worker.terminate();
      worker = new Worker();
      resolve({
        msg: 'Worker terminated successfully.',
        code: 200,
      });
    } else {
      reject({
        msg: new Error('Worker is not defined or already terminated.'),
        code: 500,
      });
    }
  });
};

export { doWork, terminateWork };
