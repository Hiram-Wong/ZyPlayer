import { execSync, spawn } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';

import { loggerService } from '@logger';
import type { IFileMode } from '@main/utils/file';
import {
  fileChmod,
  fileChmodSync,
  filePermission,
  filePermissionSync,
  pathExist,
  pathExistSync,
} from '@main/utils/file';
import { execAsync } from '@main/utils/shell';
import { isWindows, linebreak } from '@main/utils/systeminfo';
import { LOG_MODULE } from '@shared/config/logger';
import { isArray, isArrayEmpty, isPositiveFiniteNumber, isStrEmpty, isString } from '@shared/modules/validate';

const logger = loggerService.withContext(LOG_MODULE.UTIL_PROCESS);

/**
 * Get the appropriate binary name based on the operating system.
 * @param name - Base name of the binary.
 * @returns The binary name with the correct extension for the OS.
 */
export function getBinaryName(name: string): string {
  if (isWindows) return `${name}.exe`;
  return name;
}

/**
 * Run a binary script as a child process.
 * @param scriptPath - Path to the script to run.
 * @returns A promise that resolves when the script completes.
 */
export function downBinary(scriptPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    logger.info(`Running script at: ${scriptPath}`);

    const nodeProcess = spawn(process.execPath, [scriptPath], {
      windowsHide: true,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_PATH: join(process.resourcesPath, 'app.asar', 'node_modules'),
      },
    });

    nodeProcess.stdout.on('data', (data) => {
      logger.info(`Script output: ${data}`);
    });

    nodeProcess.stderr.on('data', (data) => {
      logger.error(`Script error: ${data}`);
    });

    nodeProcess.on('close', (code) => {
      if (code === 0) {
        logger.info('Script completed successfully');
        resolve();
      } else {
        logger.warn(`Script exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Set permissions for a binary file.
 * @param binaryPath - Path to the binary file.
 * @param permission - File mode to set.
 * @returns True if permissions were set successfully, false otherwise.
 */
export async function chmodBinary(binaryPath: string, permission: IFileMode): Promise<boolean> {
  if ((await pathExist(binaryPath)) === false) return false;
  if (isWindows) return true;

  try {
    if ((await filePermission(binaryPath)).code !== permission) {
      await fileChmod(binaryPath, permission);
      logger.info(`Set executable permissions for binary: ${binaryPath}`);
    }
    return true;
  } catch (error) {
    logger.error(`Failed to set permissions for binary: ${binaryPath}`, error as Error);
    return false;
  }
}

/**
 * Synchronously set permissions for a binary file.
 * @param binaryPath - Path to the binary file.
 * @param permission - File mode to set.
 * @returns True if permissions were set successfully, false otherwise.
 */
export function chmodBinarySync(binaryPath: string, permission: IFileMode): boolean {
  if (pathExistSync(binaryPath) === false) return false;
  if (isWindows) return true;

  try {
    if (filePermissionSync(binaryPath).code !== permission) {
      fileChmodSync(binaryPath, permission);
      logger.info(`Set executable permissions for binary: ${binaryPath}`);
    }
    return true;
  } catch (error) {
    logger.error(`Failed to set permissions for binary: ${binaryPath}`, error as Error);
    return false;
  }
}

/**
 * match processes by keyword.
 * @param keyword - Keyword to match processes.
 * @returns Array of matched process IDs.
 */
export async function matchPs(keyword: string): Promise<number[]> {
  if (isPositiveFiniteNumber(keyword)) keyword = String(keyword);
  if (!isString(keyword) || isStrEmpty(keyword)) return [];

  try {
    const cmd = isWindows
      ? `for /f "tokens=3 delims=," %p in ('cmd /c wmic process get ProcessId^,CommandLine /format:csv ^| findstr /i "${keyword}" ^| findstr /v /i "wmic" ^| findstr /v /i "findstr"') do @echo %p`
      : `pgrep -f "${keyword}"`;
    logger.debug(`Match process cmd: ${cmd}`);

    const { stdout: output } = await execAsync(cmd, { encoding: 'utf8' });
    if (!output) return [];

    const pids = output
      .split(linebreak)
      .map((line) => line.trim())
      .map((line) => (/^\d+$/.test(line) ? Number.parseInt(line) : null))
      .filter((pid): pid is number => pid !== null);

    const equalPids = Array.from(new Set(pids));
    logger.debug(`Matched PIDs: ${equalPids.join(', ')}`);

    return equalPids;
  } catch (error) {
    logger.error(`Failed to match process: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Synchronously match processes by keyword.
 * @param keyword - Keyword to match processes.
 * @returns Array of matched process IDs.
 */
export function matchPsSync(keyword: string): number[] {
  if (isPositiveFiniteNumber(keyword)) keyword = String(keyword);
  if (!isString(keyword) || isStrEmpty(keyword)) return [];

  try {
    const cmd = isWindows
      ? `for /f "tokens=3 delims=," %p in ('cmd /c wmic process get ProcessId^,CommandLine /format:csv ^| findstr /i "${keyword}" ^| findstr /v /i "wmic" ^| findstr /v /i "findstr"') do @echo %p`
      : `pgrep -f "${keyword}"`;
    logger.debug(`Match process cmd: ${cmd}`);

    const output = execSync(cmd, { encoding: 'utf8' });
    if (!output) return [];

    const pids = output
      .split(linebreak)
      .map((line) => line.trim())
      .map((line) => (/^\d+$/.test(line) ? Number.parseInt(line) : null))
      .filter((pid): pid is number => pid !== null);

    const equalPids = Array.from(new Set(pids));
    logger.debug(`Matched PIDs: ${equalPids.join(', ')}`);

    return equalPids;
  } catch (error) {
    logger.error(`Failed to match process: ${(error as Error).message}`);
    return [];
  }
}

/**
 * match processes by port.
 * @param port - Port number to match processes.
 * @returns Array of process IDs listening on the specified port.
 */
export async function matchPort(port: number): Promise<number[]> {
  if (isString(port) && !isStrEmpty(port)) port = Number.parseInt(String(port), 10);
  if (!isPositiveFiniteNumber(port)) return [];

  try {
    const cmd = isWindows
      ? `@for /f "tokens=5" %p in ('netstat -ano ^| findstr ":${port}" ^| findstr LISTENING') do @echo %p`
      : `lsof -i :${port} -sTCP:LISTEN -P -n -t`;
    logger.debug(`Match process cmd: ${cmd}`);

    const { stdout: output } = await execAsync(cmd, { encoding: 'utf8' });
    if (!output) return [];

    const pids = output
      .split(linebreak)
      .map((line) => line.trim())
      .map((line) => (/^\d+$/.test(line) ? Number.parseInt(line) : null))
      .filter((pid): pid is number => pid !== null);

    const equalPids = Array.from(new Set(pids));
    logger.debug(`Matched PIDs: ${equalPids.join(', ')}`);

    return equalPids;
  } catch (error) {
    logger.error(`Failed to match process: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Synchronously match processes by port.
 * @param port - Port number to match processes.
 * @returns Array of process IDs listening on the specified port.
 */
export function matchPortSync(port: number): number[] {
  if (isString(port) && !isStrEmpty(port)) port = Number.parseInt(String(port), 10);
  if (!isPositiveFiniteNumber(port)) return [];

  try {
    const cmd = isWindows
      ? `@for /f "tokens=5" %p in ('netstat -ano ^| findstr ":${port}" ^| findstr LISTENING') do @echo %p`
      : `lsof -i :${port} -sTCP:LISTEN -P -n -t`;
    logger.debug(`Match process cmd: ${cmd}`);

    const output = execSync(cmd, { encoding: 'utf8' });
    if (!output) return [];

    const pids = output
      .split(linebreak)
      .map((line) => line.trim())
      .map((line) => (/^\d+$/.test(line) ? Number.parseInt(line) : null))
      .filter((pid): pid is number => pid !== null);

    const equalPids = Array.from(new Set(pids));
    logger.debug(`Matched PIDs: ${equalPids.join(', ')}`);

    return equalPids;
  } catch (error) {
    logger.error(`Failed to match process: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Kill processes by their PIDs.
 * @param pids - Array of process IDs to kill.
 * @returns True if all processes were killed successfully, false otherwise.
 */
export async function killPid(pids: number[]): Promise<boolean> {
  if (!isArray(pids) || isArrayEmpty(pids)) return true;

  try {
    const cmd = isWindows
      ? `taskkill ${pids.map((pid) => `/PID ${pid}`).join(' ')} /T /F`
      : `kill -9 ${pids.join(' ')}`;
    logger.debug(`Kill process cmd: ${cmd}`);

    await execAsync(cmd);
    return true;
  } catch (error) {
    logger.error('Failed to kill process:', error as Error);
    return false;
  }
}

/**
 * Synchronously kill processes by their PIDs.
 * @param pids - Array of process IDs to kill.
 * @returns True if all processes were killed successfully, false otherwise.
 */
export function killPidSync(pids: number[]): boolean {
  if (!isArray(pids) || isArrayEmpty(pids)) return true;

  try {
    const cmd = isWindows
      ? `taskkill ${pids.map((pid) => `/PID ${pid}`).join(' ')} /T /F`
      : `kill -9 ${pids.join(' ')}`;
    logger.debug(`Kill process cmd: ${cmd}`);

    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (error) {
    logger.error('Failed to kill process:', error as Error);
    return false;
  }
}

/**
 * Determine if PowerShell is available on Windows system.
 * @returns True if PowerShell is available, false otherwise.
 */
export async function isWindowsPowerShell(): Promise<boolean> {
  try {
    // await execAsync('powershell -Command "exit"');
    await execAsync('where powershell');
    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronously determine if PowerShell is available on Windows system.
 * @returns True if PowerShell is available, false otherwise.
 */
export function isWindowsPowerShellSync(): boolean {
  try {
    // execSync('powershell -Command "exit"', { stdio: 'ignore' });
    execSync('where powershell', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
