import { execSync, spawn } from 'node:child_process';
import { join } from 'node:path';

import { loggerService } from '@logger';
import { pathExist } from '@main/utils/file';
import { HOME_BIN_PATH } from '@main/utils/path';
import { chmodBinary, getBinaryName, killPid, matchPort, matchPs } from '@main/utils/process';
import { execAsync } from '@main/utils/shell';
import { LOG_MODULE } from '@shared/config/logger';
import { isArray, isArrayEmpty, isNil } from '@shared/modules/validate';

const logger = loggerService.withContext(LOG_MODULE.PYTHON);

export interface IPythonOptions {
  projectBasePath: string;
}

export class PythonService {
  projectBasePath: string;
  uvBinaryPath: string;

  constructor(options: IPythonOptions) {
    this.projectBasePath = options.projectBasePath;
    this.uvBinaryPath = join(HOME_BIN_PATH, getBinaryName('uv'));
  }

  async checkBinary() {
    if (!(await pathExist(this.uvBinaryPath))) {
      throw new Error('uv binary does not exist.');
    }
    if (!(await chmodBinary(this.uvBinaryPath, 0o755))) {
      throw new Error('Failed to set executable permissions for uv binary.');
    }
  }

  async matchProcess(kw: string): Promise<number[]> {
    return await matchPs(kw);
  }

  async matchPort(port: number): Promise<number[]> {
    return await matchPort(port);
  }

  async killProcess(pids: number[]): Promise<boolean> {
    return await killPid(pids);
  }

  async installDep(pkgs: string[] = []): Promise<boolean> {
    try {
      const tomlPath = join(this.projectBasePath, 'pyproject.toml');
      const requirementsPath = join(this.projectBasePath, 'requirements.txt');

      const cmd = (await pathExist(tomlPath))
        ? [this.uvBinaryPath, 'sync']
        : (await pathExist(requirementsPath))
          ? [this.uvBinaryPath, 'pip', 'install', '-r', 'requirements.txt']
          : isArray(pkgs) && !isArrayEmpty(pkgs)
            ? [this.uvBinaryPath, 'pip', 'install', ...pkgs]
            : null;

      if (isNil(cmd)) {
        logger.warn('No pyproject.toml or requirements.txt found, skipping dependency installation.');
        return false;
      }
      logger.debug(`Installing Python dependencies with command: ${cmd.join(' ')}`);

      const { stdout, stderr } = await execAsync(cmd.join(' '), {
        cwd: this.projectBasePath,
      });

      if (stdout) logger.debug(stdout.toString());
      if (stderr) logger.debug(stderr.toString());

      return true;
    } catch (error) {
      logger.error('Failed to install dependencies:', error as Error);
      throw error;
    }
  }

  runSpawn(
    args: string[] = [],
    stdoutCb?: (data: string) => void,
    stderrCb?: (data: string) => void,
    errorCb?: (error: Error) => void,
    closeCb?: (code: number | null) => void,
  ): void {
    try {
      logger.debug(`Spawning Python process with args: ${args.join(' ')}`);

      const cmd = ['run', ...args];
      const child = spawn(this.uvBinaryPath, cmd, {
        cwd: this.projectBasePath,
        detached: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      });

      child.stdout.on('data', (data) => {
        stdoutCb?.(data.toString());
      });

      child.stderr.on('data', (data) => {
        stderrCb?.(data.toString());
      });

      child.on('error', (error) => {
        errorCb?.(error);
      });

      child.on('close', (code) => {
        closeCb?.(code);
      });
    } catch (error) {
      logger.error('Error while starting Python process:', error as Error);
      throw error;
    }
  }

  async runExec(args: string[]): Promise<{ stdout: string; stderr: string }> {
    try {
      const cmd = [this.uvBinaryPath, 'run', ...args];
      const { stdout, stderr } = await execAsync(cmd.join(' '), {
        cwd: this.projectBasePath,
        windowsHide: true,
        encoding: 'utf-8',
      });
      return { stdout: stdout.toString().trim(), stderr: stderr.toString().trim() };
    } catch (error) {
      logger.error('Failed to run Python script:', error as Error);
      throw error;
    }
  }

  runExecSync(args: string[]): { stdout: string; stderr: string } {
    try {
      const cmd = [this.uvBinaryPath, 'run', ...args];
      const output = execSync(cmd.join(' '), {
        cwd: this.projectBasePath,
        windowsHide: true,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return { stdout: output.trim(), stderr: '' };
    } catch (error) {
      logger.error('Failed to run Python script synchronously:', error as Error);
      throw error;
    }
  }
}
