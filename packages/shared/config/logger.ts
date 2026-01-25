export interface LogSourceWithContext {
  process: 'main' | 'renderer';
  window?: string; // only for renderer process
  module?: string;
  context?: Record<string, any>;
}

type NullableObject = object | undefined | null;

export type LogContextData = [] | [Error | NullableObject] | [Error | NullableObject, ...NullableObject[]];

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly' | 'none';

export const LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
  SILLY: 'silly',
  NONE: 'none',
} satisfies Record<string, LogLevel>;

export const LEVEL_MAP: Record<LogLevel, number> = {
  [LEVEL.ERROR]: 10,
  [LEVEL.WARN]: 8,
  [LEVEL.INFO]: 6,
  [LEVEL.DEBUG]: 4,
  [LEVEL.VERBOSE]: 2,
  [LEVEL.SILLY]: 0,
  [LEVEL.NONE]: -1,
};

export enum LOG_MODULE {
  MAIN = 'Main',
  PRELOAD = 'Preload',
  RENDERER = 'Renderer',

  APP_IPC = 'AppIpc',
  APP_SERVICE = 'AppService',
  APP_UPDATE = 'AppUpdater',
  APP_PROTOCOL = 'AppProtocol',
  APP_PROXY = 'AppProxy',
  APP_POWER_MONITOR = 'AppPowerMonitor',
  APP_WINDOW = 'AppWindow',
  APP_SHORTCUT = 'AppShortcut',
  APP_LOCALE = 'AppLocale',

  CDP = 'Cdp',
  DATABASE = 'Database',
  FASTIFY = 'Fastify',
  FFMPEG = 'FFmpeg',
  FILE_STORAGE = 'FileStorage',
  PYTHON = 'Python',
  SYNC_STORAGE = 'SyncStorage',
  BINARY = 'Binary',

  FILM_REC_DOUBAN = 'FilmRecDouban',
  FILM_REC_HOT = 'FilmRecHot',
  FILM_REC_BARRAGE = 'FilmRecBarrage',
  FILM_CMS = 'FilmCms',

  AIGC_HELPER = 'AigcHelper',
  PARSE_HELPER = 'ParseHelper',
  SYSTEM_HELPER = 'SystemHelper',

  UTIL_PROCESS = 'UtilProcess',
  UTIL_ZIP = 'Utils:Zip',

  PLUGIN = 'Plugin',

  I18N = 'I18n',
}

export type ILogModuleType = `${LOG_MODULE}`;

export const ANSICOLORS = {
  RED: '\x1B[31m',
  GREEN: '\x1B[32m',
  // YELLOW: '\x1B[33m', // light yellow is hard to see on light background
  YELLOW: '\x1B[38;5;178m',
  BLUE: '\x1B[34m',
  MAGENTA: '\x1B[35m',
  CYAN: '\x1B[36m',
  END: '\x1B[0m',
  BOLD: '\x1B[1m',
  ITALIC: '\x1B[3m',
  UNDERLINE: '\x1B[4m',
};

export const LEVEL_COLOR_MAP: Record<LogLevel, keyof typeof ANSICOLORS> = {
  [LEVEL.ERROR]: 'RED',
  [LEVEL.WARN]: 'YELLOW',
  [LEVEL.INFO]: 'GREEN',
  [LEVEL.DEBUG]: 'CYAN',
  [LEVEL.VERBOSE]: 'END',
  [LEVEL.SILLY]: 'END',
  [LEVEL.NONE]: 'END',
};
