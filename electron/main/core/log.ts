/**  By default, it writes logs to the following locations:
 * on Linux: ~/.config/[appname]/logs/main.log
 * on macOS: ~/Library/Logs/[appname]/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\[appname]\logs\main.log
 * @see https://www.npmjs.com/package/electron-log
 */

import log from 'electron-log';

// 关闭控制台打印
log.transports.console.level = false;
log.transports.file.level = 'info';
log.transports.file.maxSize = 10024300; // 文件最大不超过 10M
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'; // 输出格式

// 有六个日志级别error, warn, info, verbose, debug, silly。默认是silly
export default {
  info(param: any) {
    log.info(param);
  },
  warn(param: any) {
    log.warn(param);
  },
  error(param: any) {
    log.error(param);
  },
  debug(param: any) {
    log.debug(param);
  },
  verbose(param: any) {
    log.verbose(param);
  },
  silly(param: any) {
    log.silly(param);
  },
};

log.info(`[logger] logger initialized`);
