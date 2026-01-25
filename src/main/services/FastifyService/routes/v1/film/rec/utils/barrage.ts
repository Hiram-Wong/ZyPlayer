import { loggerService } from '@logger';
import { request } from '@main/utils/request';
import { LOG_MODULE } from '@shared/config/logger';
import { stripUrlParam } from '@shared/modules/headers';
import { objPathValue } from '@shared/modules/obj';
import { isArray, isArrayEmpty, isHttp, isPositiveFiniteNumber, isStrEmpty, isString } from '@shared/modules/validate';
import type { IBarrage, IBarrageResult, IBarrageSendOptions } from '@shared/types/barrage';

const logger = loggerService.withContext(LOG_MODULE.FILM_REC_BARRAGE);

interface IBarrageOptions {
  url: string;
  id: string;
  key: string;
  type: number;
  text: number;
  time: number;
  color: number;
}

export const fetchBarrage = async (id: string, options: IBarrageOptions): Promise<IBarrageResult> => {
  if (
    !isHttp(options.url) ||
    !isString(options.id) ||
    isStrEmpty(options.id) ||
    !isString(options.key) ||
    isStrEmpty(options.key) ||
    !isPositiveFiniteNumber(options.type) ||
    !isPositiveFiniteNumber(options.text) ||
    !isPositiveFiniteNumber(options.time) ||
    !isPositiveFiniteNumber(options.color)
  ) {
    return { id: '', list: [] };
  }

  const url = options.url.replace('{id}', id);

  let barrageRes: any;
  try {
    const { data } = await request.request({ url, method: 'GET' });
    barrageRes = data;
  } catch (error) {
    logger.error('fetch barrage request error:', error as Error);
    return { id: '', list: [] };
  }

  const comments = objPathValue(barrageRes, options.key) || [];
  const uuid = objPathValue(barrageRes, options.id) || id;
  if (!isArray(comments) || isArrayEmpty(comments)) return { id: '', list: [] };

  const res: IBarrage[] = comments
    .map((item, index) => {
      const time = Number.parseFloat(item?.[options.time]);
      if (!isPositiveFiniteNumber(time) || isStrEmpty(item?.[options.text])) return null;

      const rawType = item?.[options.type];
      const type: IBarrage['type'] = ['top', 'bottom', 'left', 'right'].includes(rawType) ? rawType : 'left';

      const rawColor = item?.[options.color];
      const color: IBarrage['color'] = isString(rawColor) && !isStrEmpty(rawColor) ? rawColor : '#FFFFFF';

      return {
        id: String(index + 1),
        type,
        text: String(item[options.text]),
        time,
        color,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.time - b!.time) as IBarrage[];

  return { id: uuid, list: res };
};

export const sendBarrage = async (url: string, options: IBarrageSendOptions): Promise<boolean> => {
  const { id, type, color, text, time, size } = options;
  if (
    !isHttp(url) ||
    !isString(id) ||
    isStrEmpty(id) ||
    !['top', 'bottom', 'left', 'right'].includes(type) ||
    !isString(text) ||
    isStrEmpty(text) ||
    !isPositiveFiniteNumber(time)
  ) {
    return false;
  }

  const postUrl = stripUrlParam(url, '{id}', 'value');

  let barrageRes: any;
  try {
    const { data } = await request.request({
      url: postUrl,
      method: 'POST',
      data: { player: id, type, text, time, color: color || '#ffffff', size: size || '24px' },
    });
    barrageRes = data;
  } catch (error) {
    logger.error('post barrage error:', error as Error);
    return false;
  }

  if (barrageRes?.code === 23 || barrageRes?.msg === true) {
    return true;
  }

  return false;
};
