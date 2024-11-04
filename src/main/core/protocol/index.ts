import { app } from 'electron';
import { resolve } from 'path';
import logger from '@main/core/logger';

const PROTOCOL = 'zy';

const protocolHandler = () => {
  const args: string[] = [];

  if (!app.isPackaged) {
    args.push(resolve(process.argv[1]));
  }
  args.push('--');

  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);

  // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
  handleArgv(process.argv);

  // 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
  app.on('second-instance', (_, argv) => {
    // Windows 下通过协议 URL 启动时，URL 会作为参数，所以需要在这个事件里处理
    if (process.platform === 'win32') {
      handleArgv(argv);
    }
  });

  // macOS 下通过协议 URL 启动时，主实例会通过 open-url 事件接收这个 URL
  app.on('open-url', (_, urlStr) => {
    handleUrl(urlStr);
  });

  // 处理参数
  function handleArgv(argv: string[]) {
    const prefix = `${PROTOCOL}:`;
    // 开发阶段，跳过前两个参数（`electron.exe .`）
    // 打包后，跳过第一个参数（`myapp.exe`）
    const offset = app.isPackaged ? 1 : 2;
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix));
    if (url) handleUrl(url);
  }

  // 解析 URL
  function handleUrl(urlStr: string) {
    // 解析 URL 参数
    const urlObj = new URL(urlStr);
    const searchParams = urlObj.searchParams;

    // 使用 querystring 模块解析查询参数
    const query = Object.fromEntries(searchParams.entries());
    logger.info(query);

    // 根据需要做其他事情
  }
};

export default protocolHandler;
