import type { ISiteType } from '@shared/config/film';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import { toHMS } from '@shared/modules/date';
import { isJsonStr, isObjectEmpty } from '@shared/modules/validate';
import JSON5 from 'json5';

import { fetchLoggerStream } from '@/api/system';
import type { ITerminalLog } from '@/components/terminal/index.vue';
import { wsRequest } from '@/utils/request';

type ILogger = (type: 'logger' | 'testResult', prefix: string, level: ITerminalLog, text: unknown) => void;

const parseLog = (chunk: string) => {
  if (!isJsonStr(chunk)) return null;
  const data = JSON5.parse(chunk);
  return isObjectEmpty(data) ? null : data;
};

const emitLog = (logger: ILogger, timestamp: number, level: ITerminalLog, message: string) => {
  logger('logger', `<Logger>${toHMS(timestamp)} > `, level, message);
};

const createSystemSseTransport = async (logger: ILogger, type: ISiteType) => {
  const onMessage = (chunk: string) => {
    const logData = parseLog(chunk);
    if (!logData) return;

    const { level, message, timestamp } = logData;
    emitLog(logger, timestamp, level, message);
  };

  const ins = await fetchLoggerStream({ type: SITE_LOGGER_MAP[type] }, { onMessage });

  return {
    ins,
    abort: () => ins.abort(),
  };
};

const createDrpysWsTransport = async (logger: ILogger) => {
  const onMessage = (_socket, chunk) => {
    const logData = parseLog(chunk);
    if (!logData) return;

    const { content, level: rawLevel, type, timestamp } = logData;
    if (type !== 'console') return;

    const level = ['warn', 'info', 'debug'].includes(rawLevel) ? rawLevel : 'verbose';

    emitLog(logger, timestamp, level, content);
  };

  const ins = await wsRequest.request({
    url: 'ws://localhost:5757/ws',
    method: 'GET',
    onMessage,
  });

  return {
    ins,
    abort: () => ins.close(),
  };
};

export const SITE_LOG_MAP = {
  [SITE_TYPE.T0_XML]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T0_XML),
  [SITE_TYPE.T1_JSON]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T1_JSON),
  [SITE_TYPE.T4_DRPYJS0]: () => null,
  [SITE_TYPE.T4_DRPYS]: (logger: ILogger) => createDrpysWsTransport(logger),
  [SITE_TYPE.T3_DRPY]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_DRPY),
  [SITE_TYPE.T4_CATVOD]: () => null,
  [SITE_TYPE.T3_XBPQ]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_XBPQ),
  [SITE_TYPE.T3_XYQ]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_XYQ),
  [SITE_TYPE.T3_APPYSV2]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_APPYSV2),
  [SITE_TYPE.T3_PY]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_PY),
  [SITE_TYPE.T3_QUICK]: () => null,
  [SITE_TYPE.T3_ALIST]: (logger: ILogger) => createSystemSseTransport(logger, SITE_TYPE.T3_ALIST),
};
