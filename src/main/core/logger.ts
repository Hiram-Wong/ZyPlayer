/**  By default, it writes logs to the following locations:
 * on Linux: ~/.config/[appname]/logs/main.log
 * on macOS: ~/Library/Logs/[appname]/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\[appname]\logs\main.log
 * @see https://www.npmjs.com/package/electron-log
 */
import { is } from "@electron-toolkit/utils";
import { ipcMain, app } from 'electron';
import { join } from "path";
import logger from 'electron-log';

const LOG_PATH = join(app.getPath("userData"), 'logs/main.log');

// 日志级别error, warn, info, verbose, debug, silly。开发模式默认是silly; 生产环境默认 warn
logger.transports.file.level = is.dev ? 'silly' : 'warn';
logger.transports.file.maxSize = 10024300; // 文件最大不超过 10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'; // 输出格式
logger.transports.file.resolvePathFn = () => LOG_PATH;

logger.info(`[logger] log module initialized; path: ${LOG_PATH}`)

ipcMain.on('logger:info', (_, message) => {
  logger.info(message);
});

ipcMain.on('logger:error', (_, message) => {
  logger.error(message);
});

ipcMain.on('logger:warn', (_, message) => {
  logger.warn(message);
});

export default logger;