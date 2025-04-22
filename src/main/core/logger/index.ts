/**  By default, it writes logs to the following locations:
 * Linux: ~/.config/{app name}/logs/main.log                        ~/.config/zyfun/logs/main.log
 * Linux: $XDG_CONFIG_HOME/{app name}/logs/main.log                 $XDG_CONFIG_HOME/zyfun/logs/main.log
 * macOS: ~/Library/Logs/{app name}/main.log                        ~/Library/Logs/zyfun/main.log
 * Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log  %USERPROFILE%\AppData\Roaming\zyfun\logs\main.log
 * @see https://www.npmjs.com/package/electron-log
 */
import logger from 'electron-log';
import { join } from 'path';
import { APP_LOG_PATH } from '@main/utils/hiker/path';

const LOG_PATH = join(APP_LOG_PATH, 'main.log');

// 日志级别error, warn, info, verbose, debug, silly。默认是silly最低级别否则不生成日志
logger.transports.file.level = 'silly';
logger.transports.file.maxSize = 10024300; // 文件最大不超过 10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'; // 输出格式
logger.transports.file.resolvePathFn = () => LOG_PATH;

logger.info(`[log][init] path:${LOG_PATH}`);

export default logger;
