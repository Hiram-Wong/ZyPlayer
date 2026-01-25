export const DATA_IMPORT_TYPE = {
  SIMPLE: 'simple',
  COMPLETE: 'complete',
} as const;
export type IDataImportType = (typeof DATA_IMPORT_TYPE)[keyof typeof DATA_IMPORT_TYPE];
export const dataImportTypes = Object.values(DATA_IMPORT_TYPE);

export const DATA_SIMPLE_TYPE = {
  TVBOX: 'tvbox',
  CATVOD: 'catvod',
  DRPY: 'drpy',
} as const;
export type IDataSimpleType = (typeof DATA_SIMPLE_TYPE)[keyof typeof DATA_SIMPLE_TYPE];
const dataSimpleTypes = Object.values(DATA_SIMPLE_TYPE);

export const DATA_COMPLETE_TYPE = {
  LOCAL: 'local',
  REMOTE: 'remote',
} as const;
export type IDataCompleteType = (typeof DATA_COMPLETE_TYPE)[keyof typeof DATA_COMPLETE_TYPE];
const dataCompleteTypes = Object.values(DATA_COMPLETE_TYPE);

export type IDataRemoteType = IDataSimpleType | IDataCompleteType;
export const dataRemoteTypes = [...dataSimpleTypes, ...dataCompleteTypes];

export const DATA_PUT_TYPE = {
  OVERWRITE: 'overwrite',
  ADDITIONAL: 'additional',
} as const;
export type IDataPutType = (typeof DATA_PUT_TYPE)[keyof typeof DATA_PUT_TYPE];
export const dataPutTypes = Object.values(DATA_PUT_TYPE);

export const DATA_PAGE = {
  FILM: 'film',
  LIVE: 'live',
  MOMENT: 'moment',
  PARSE: 'parse',
} as const;
export type IDataPage = (typeof DATA_PAGE)[keyof typeof DATA_PAGE];
export const dataPages = Object.values(DATA_PAGE);
export const DATA_TABLE_PAGE = {
  FILM: ['site'],
  LIVE: ['iptv', 'channel'],
  MOMENT: ['history', 'star'],
  PARSE: ['analyze'],
} as const;
