import Worker from '@/utils/drpy/worker?worker';

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

    timer = setTimeout(async () => {
      worker.terminate();
      worker = new Worker();
      reject(new Error('Worker job run 15s, timed out'));
    }, 15000);
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
