import { join } from 'node:path';

import { loggerService } from '@logger';
import { pathExist } from '@main/utils/file';
import { APP_PUBLIC_PATH, HOME_BIN_PATH } from '@main/utils/path';
import { chmodBinary, downBinary, getBinaryName } from '@main/utils/process';
import { LOG_MODULE } from '@shared/config/logger';
import { isArray, isArrayEmpty } from '@shared/modules/validate';

const logger = loggerService.withContext(LOG_MODULE.BINARY);

export interface IBinaryInfo {
  name: string;
  path: string;
  exist: boolean;
}

class BinaryService {
  private static instance: BinaryService;
  private readonly DEFAULT_BINARIES = ['uv', 'bun', 'ffmpeg', 'ffprobe'] as const;

  private constructor() {}

  public static getInstance(): BinaryService {
    if (!this.instance) {
      this.instance = new BinaryService();
    }
    return this.instance;
  }

  private getBinaryPath(name: string): string {
    return join(HOME_BIN_PATH, getBinaryName(name));
  }

  private async isBinaryExist(name: string): Promise<boolean> {
    return await pathExist(this.getBinaryPath(name));
  }

  private async getBinaryInfo(name: string): Promise<IBinaryInfo> {
    const path = this.getBinaryPath(name);
    return {
      name,
      path,
      exist: await this.isBinaryExist(name),
    };
  }

  public async getBinaryList(names?: string[]): Promise<{ list: IBinaryInfo[]; total: number }> {
    const normalizedNames = isArray(names) && !isArrayEmpty(names) ? names : this.DEFAULT_BINARIES;
    return {
      list: await Promise.all(normalizedNames.map((name) => this.getBinaryInfo(name))),
      total: normalizedNames.length,
    };
  }

  public async installBinary(names: string[]): Promise<IBinaryInfo[]> {
    if (!isArray(names) || isArrayEmpty(names)) {
      return [];
    }

    await Promise.all(
      names.map(async (name) => {
        try {
          await downBinary(join(APP_PUBLIC_PATH, 'scripts', `install-${name}.js`));
          chmodBinary(this.getBinaryPath(name), 0o755);
        } catch (error) {
          logger.error(`Failed to install binary ${name}: ${(error as Error).message}`);
        }
      }),
    );

    return (await this.getBinaryList(names))?.list;
  }
}

export const binaryService = BinaryService.getInstance();
