const publicBarrageSend = (url: string, options: any) => {
  const okd = new FormData();
  okd.append('player', options.id);
  okd.append('text', options.text);
  okd.append('time', options.time);
  okd.append('color', options.color);
  okd.append('type', options.type);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.send(okd);
};

export { publicBarrageSend };
