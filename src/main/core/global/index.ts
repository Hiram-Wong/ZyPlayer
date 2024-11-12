import { setting } from '@main/core/db/service';
import logger from '@main/core/logger';

const setup = async () => {
  const variable = {
    hardwareAcceleration: (await setting.get('hardwareAcceleration')) || false,
    ua: (await setting.get('ua')) || '',
    dns: (await setting.get('dns')) || '',
    selfBoot: (await setting.get('selfBoot')) || false,
    recordShortcut: (await setting.get('recordShortcut')) || '',
    timeout: (await setting.get('timeout')) || 3000,
    debug: (await setting.get('debug')) || false,
  };

  globalThis.variable = variable;
  logger.info(`[global][variable]`, variable);
};

export default setup;
