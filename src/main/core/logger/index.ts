/**  By default, it writes logs to the following locations:
 * Linux: ~/.config/{app name}/logs/main.log                        ~/.config/zyplayer/logs/main.log
 * Linux: $XDG_CONFIG_HOME/{app name}/logs/main.log                 $XDG_CONFIG_HOME/zyplayer/logs/main.log
 * macOS: ~/Library/Logs/{app name}/main.log                        ~/Library/Logs/zyplayer/main.log
 * Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log  %USERPROFILE%\AppData\Roaming\zyplayer\logs\main.log
 * @see https://www.npmjs.com/package/electron-log
 */
import { app } from 'electron';
import { join } from 'path';
import logger from 'electron-log';

const LOG_PATH = join(app.getPath('userData'), 'logs/main.log');

// 日志级别error, warn, info, verbose, debug, silly。默认是silly最低级别否则不生成日志
logger.transports.file.level = 'silly';
logger.transports.file.maxSize = 10024300; // 文件最大不超过 10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'; // 输出格式
logger.transports.file.resolvePathFn = () => LOG_PATH;

logger.info(`[log][init] path:${LOG_PATH}`);

export default logger;
