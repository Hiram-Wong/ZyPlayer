import request from '@/utils/request';
import { base64 } from '@/utils/crypto';
import { usePlayStore } from '@/store';

const storePlayer = usePlayStore();

const snifferPie = async (
  url: string,
  run_script: string,
  init_script: string,
  custom_regex: string,
  sniffer_exclude: string,
  headers: object = {},
): Promise<{ url: string; headers: object }> => {
  console.log('[sniffer][pie][start]: pie嗅探流程开始');
  const data: { url: string; headers: object } = {
    url: '',
    headers: {},
  };

  try {
    const res = await window.electron.ipcRenderer.invoke('sniffer-media', {
      url,
      run_script,
      init_script,
      custom_regex,
      sniffer_exclude,
      headers,
    });

    if (res.code === 0) {
      data.url = res.data.url;
      data.headers = res.data.headers;
      console.log(`[sniffer][pie][return]: pie嗅探流程返回链接:${JSON.stringify(data)}`);
    } else if (res.code === -1) {
      console.log(`[sniffer][pie][error]: pie嗅探流程错误:${res.msg}`);
    }
  } catch (err: any) {
    console.log(err);
    console.log(`[sniffer][pie][error]: pie嗅探流程错误:${err.message}`);
  } finally {
    console.log(`[sniffer][pie][end]: pie嗅探流程结束`);

    return data;
  }
};

const snifferCustom = async (
  url: string,
  run_script: string,
  init_script: string,
  sniffer_exclude: string,
  custom_regex: string,
  headers: object = {},
): Promise<{ url: string; headers: object }> => {
  console.log('[sniffer][snifferCustom][start]: pie嗅探流程开始');
  const data: { url: string; headers: object } = {
    url: '',
    headers: {},
  };
  try {
    const res = await request({
      url: storePlayer.setting.snifferMode.url,
      method: 'GET',
      params: {
        url,
        script: run_script,
        init_script,
        custom_regex,
        sniffer_exclude,
      },
    });
    if (res.code === 200) {
      data.url = res.url;
      data.headers = res.headers;
      console.log(`[sniffer][custom][return]: custom嗅探流程返回链接:${data}`);
    } else {
      const err = res.msg;
      console.log(`[sniffer][custom][error]: custom嗅探流程错误:${err}`);
    }
  } catch (err: any) {
    console.log(err);
    console.log(`[sniffer][custom][error]: custom嗅探流程错误:${err.message}`);
  } finally {
    console.log(`[sniffer][custom][end]: custom嗅探流程结束`);
    return data;
  }
};

// 嗅探
const sniffer = async (
  url: string,
  run_script: string = '',
  init_script: string = '',
  custom_regex: string = '',
  sniffer_exclude: string = '',
  headers: object = {},
): Promise<{ headers: object; url: string; orgin: string }> => {
  const runScript = encodeURIComponent(base64.encode(run_script));
  const initScript = encodeURIComponent(base64.encode(init_script));

  const data: { url: string; orgin: string; headers: object } = {
    url: '',
    orgin: url,
    headers: {},
  };

  const format_rule = (rule) => {
    if (rule.includes('*')) {
      return (rule = rule.replace(/\*\./g, '.*\\.'));
    } else {
      return (rule = rule.replace(/\./g, '\\.'));
    }
  };

  const type = storePlayer.setting.snifferMode.type;
  if (type === 'pie') {
    const res = await snifferPie(url, runScript, initScript, format_rule(custom_regex), format_rule(sniffer_exclude), headers);
    data.url = res['url'];
    data.headers = res['headers'];
  } else if (type === 'custom') {
    const res = await snifferCustom(
      url,
      runScript,
      initScript,
      format_rule(custom_regex),
      format_rule(sniffer_exclude),
    );
    data.url = res['url'];
    data.headers = res['headers'];
  }
  return data;
};

export default sniffer;
