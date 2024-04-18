import { createClient } from "webdav";
import { exportDb, initDb } from '@/api/setting';

let clientWebdev: ReturnType<typeof createClient> | undefined = undefined;

// 检查 WebDAV 配置的有效性
const isWebdevConfigValid = (url: string, username: string, password: string): boolean => {
  const protocolRegex = /^https?:\/\//i;
  const hasValidProtocol = protocolRegex.test(url);
  return Boolean(hasValidProtocol && password && username);
};

// 初始化
const initializeWebdavClient = async (url: string, username: string, password: string): Promise<boolean> => {
  try {
    if (!isWebdevConfigValid(url, username, password)) return false;
    
    clientWebdev = await createClient(
      url, { username, password }
    );

    const remoteDirectoryExists = await clientWebdev.exists('/zyplayer');
    if (!remoteDirectoryExists) {
      await clientWebdev.createDirectory('/zyplayer');
    }
    return true;
  } catch (err) {
    clientWebdev = undefined;
    console.error(`[webdev][initialize][error]${err}`);
    return false;
  }
};

const rsyncRemote = async (url: string, username: string, password: string): Promise<boolean> => {
  try {
    if (!clientWebdev) {
      const status = await initializeWebdavClient(url, username, password);
      if (!status) return false;
    };
    const dbExportResult = await exportDb(['all']);
    const formattedJson = JSON.stringify(dbExportResult);
    await clientWebdev!.putFileContents(
      '/zyplayer/config.json',
      formattedJson,
      { overwrite: false }
    );
    console.info(`[webdev][sync][success]`);
    return true;
  } catch (err) {
    console.error(`[webdev][sync][error]${err}`);
    return false;
  };
}

const rsyncLocal = async (url: string, username: string, password: string): Promise<boolean> => {
  try {
    if (!clientWebdev) {
      const status = await initializeWebdavClient(url, username, password);
      if (!status) return false;
    };
    const str = await clientWebdev!.getFileContents("/zyplayer/config.json", { format: "text" })  as unknown as string;
    const formattedJson = JSON.parse(str);
    await initDb(formattedJson);
    console.info(`[webdev][sync][success]`);
    return true;
  } catch (err) {
    console.error(`[webdev][sync][error]${err}`);
    return false;
  };
}

const autoSync = async (url: string, username: string, password: string): void => {
  try {
    if (!clientWebdev) {
      const status = await initializeWebdavClient(url, username, password);
      if (!status) return;
    };
    const dbExportResult = await exportDb(['all']);
    const formattedJson = JSON.stringify(dbExportResult);
    await clientWebdev!.putFileContents(
      '/zyplayer/config.json',
      formattedJson,
      { overwrite: false }
    );
    console.info(`[webdev][sync][success]`);
  } catch (err) {
    console.error(`[webdev][sync][error]${err}`);
  };
}

export { autoSync, initializeWebdavClient, rsyncLocal, rsyncRemote };