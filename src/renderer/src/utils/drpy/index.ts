import Worker from '@/utils/drpy/worker?worker';   

const worker = new Worker();

const doWork = (data) => {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const response = event.data;
      console.log(response)
      resolve(response);
    };

    worker.onerror = (error) => {
      reject(error);
    };

    worker.postMessage(data);
  });
}

export default doWork;