import { request } from '@main/utils/request';
import { defaultOptions } from '@shared/config/xmlOptions';
import { toYMD } from '@shared/modules/date';
import { isHttp, isNil, isStrEmpty, isString } from '@shared/modules/validate';
import { XMLParser } from 'fast-xml-parser';

interface IEpgItem {
  title: string;
  desc: string;
  start: string;
  end: string;
}

const parser = new XMLParser(defaultOptions);

const xmlToStandard = async (api: string, program: string, _date: string): Promise<IEpgItem[]> => {
  const { data: xmlResp } = await request.request({ url: api, method: 'GET' });
  const xmlJson = parser.parse(xmlResp);

  const channelIdMapName = new Map((xmlJson.tv.channel ?? []).map((ch) => [ch.id, ch['display-name']?.$text ?? '']));

  // if (![...channelIdMapName.values()].includes(program)) return [];
  const channelId = [...channelIdMapName.entries()].find(([, name]) => name === program)?.[0];
  if (!channelId) return [];

  const getParsedTime = (time?: string) => {
    const getNow = () => {
      const t = new Date(Date.now() + 8 * 60 * 60 * 1000);
      const m = t.getMonth() + 1;
      const d = t.getDate();
      return `${t.getFullYear()}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
    };

    if (!time || time.length < 8) {
      return { date: getNow(), time: '' };
    }

    const year = time.substring(0, 4);
    const month = time.substring(4, 6);
    const day = time.substring(6, 8);
    const date = `${year}-${month}-${day}`;

    let timeStr = '';
    if (time.length >= 12) {
      const hour = time.substring(8, 10);
      const minute = time.substring(10, 12);
      timeStr = `${hour}:${minute}`;
    }

    return { date, time: timeStr };
  };

  const list: IEpgItem[] = [];

  for (const p of xmlJson.tv.programme ?? []) {
    if (p.channel !== channelId) continue;

    list.push({
      title: p.title?.$text ?? '未知节目',
      desc: p.desc?.$text ?? '',
      start: getParsedTime(p.start).time,
      end: getParsedTime(p.stop).time,
    });
  }

  return list;
};

const jsonToStandard = async (api: string, program: string, date: string): Promise<IEpgItem[]> => {
  const url = api.replace('{name}', program).replace('{date}', date);
  const { data: resp } = await request.request({ url, method: 'GET' });
  return resp?.epg_data ?? [];
};

export const convertToStandard = async (api: string, program: string, date?: string) => {
  if (!isHttp(api) || !isString(program) || isStrEmpty(program)) return [];

  if (isNil(date)) date = toYMD();
  program = program.replaceAll('-', '').toUpperCase();

  const day = date.replaceAll('-', '');
  if (Number.parseInt(day) < 20240214) return [];

  const type = api.includes('{name}') || api.includes('{date}') ? 'diyp' : 'xml';
  const list = type === 'xml' ? await xmlToStandard(api, program, date) : await jsonToStandard(api, program, date);

  return list;
};
