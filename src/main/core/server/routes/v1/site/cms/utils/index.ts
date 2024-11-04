const buildUrl = (url, paramsStr) => {
  const u = new URL(url);
  const api = u.origin + u.pathname.replace(/\/$/, '');
  const params = new URLSearchParams(u.search);

  if (paramsStr.startsWith('?') || paramsStr.startsWith('&')) {
    const p = new URLSearchParams(paramsStr);
    p.forEach((value, key) => params.set(key, value));
    return api + '?' + params.toString();
  } else {
    const cleanParamsStr = paramsStr.startsWith('/') ? paramsStr.slice(1) : paramsStr;
    return api + (cleanParamsStr ? '/' + cleanParamsStr : '');
  }
};

const singleton = <T extends new (...args: any[]) => any>(className: T): T => {
  let instance: InstanceType<T> | null = null;
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance as InstanceType<T>;
    },
  });
  proxy.prototype.construct = proxy;
  return proxy;
};

export { buildUrl, singleton };
