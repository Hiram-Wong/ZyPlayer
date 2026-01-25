export const runAsyncFunction = async (fn: () => void | Promise<void>) => {
  await fn();
};
