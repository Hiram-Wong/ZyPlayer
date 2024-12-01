import { setting } from '@main/core/db/service';
import logger from '@main/core/logger';

const setup = async () => {
  const variable = {
    hardwareAcceleration: (await setting.get('hardwareAcceleration')) || false,
    ua:
      (await setting.get('ua')) ||
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Edg/131.0.0.0',
    dns: (await setting.get('dns')) || '',
    selfBoot: (await setting.get('selfBoot')) || false,
    recordShortcut: (await setting.get('recordShortcut')) || '',
    timeout: (await setting.get('timeout')) || 5000,
    debug: (await setting.get('debug')) || false,
  };

  globalThis.variable = variable;
  logger.info(`[global][variable]`, variable);
};

export default setup;
