import logger from '@main/core/logger';
import webdev from '@main/utils/webdev';
import { setting, db } from '@main/core/db/service';

const syncWebdev = async () => {
  logger.info('[webdev][sync][start] try');

  try {
    const dbResWebdev = await setting.get('webdev');
    if (!dbResWebdev || !dbResWebdev.sync) {
      logger.info('[webdev][sync][skip] not open sync');
      return;
    }

    const webdevConfig = dbResWebdev.data;
    if (!webdevConfig.url || !webdevConfig.username || !webdevConfig.password) {
      logger.info('[webdev][sync][fail] incomplete config');
      return;
    }

    let instance: webdev | null = new webdev({
      url: webdevConfig.url,
      username: webdevConfig.username,
      password: webdevConfig.password,
    });

    const initRes = await instance.initializeWebdavClient();
    if (initRes) {
      const doc = await db.all();
      await instance.rsyncRemote(doc);
      instance = null; // 释放内存
      logger.info('[webdev][sync][success]');
    } else {
      logger.info('[webdev][sync][fail] init error');
    }
  } catch (err: any) {
    logger.info(`[webdev][sync][fail] ${err.message}`);
  }
};

const cronSyncWebdev = () => {
  setInterval(syncWebdev, 5 * 60 * 1000);
};

export { syncWebdev, cronSyncWebdev };
