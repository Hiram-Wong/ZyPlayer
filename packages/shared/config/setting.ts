export enum SNIFFER_TYPE {
  CDP = 'cdp',
  CUSTOM = 'custom',
}
export type ISnifferType = `${SNIFFER_TYPE}`;

export enum REC_HOT_TYPE {
  BAIDU = 'baidu',
  DOUBAN = 'douban',
  ENLIGHTENT = 'enlightent',
  KOMECT = 'komect',
  KYLIVE = 'kylive',
  QUARK = 'quark',
}
export type IRecHotType = `${REC_HOT_TYPE}`;

export enum PLAYER_TYPE {
  XGPLAYER = 'xgplayer',
  DPLAYER = 'dplayer',
  ARTPLAYER = 'artplayer',
  NPLAYER = 'nplayer',
  OPLAYER = 'oplayer',
  // ALIPLAYER = 'aliplayer',
  // VEPLAYER = 'veplayer',
  CUSTOM = 'custom',
}
export type IPlayerType = `${PLAYER_TYPE}`;
export type IPlayerTypeWithoutCustom = Exclude<IPlayerType, 'custom'>;

export enum AIGC_PROVIDER_TYPE {
  AMZON = 'amazon',
  ANTHROPIC = 'anthropic',
  AZURE = 'azure',
  GEMINI = 'gemini',
  OPENAI = 'openai',
}
export type IAigcProviderType = `${AIGC_PROVIDER_TYPE}`;

export enum PROXY_TYPE {
  CUSTOM = 'custom',
  DIRECT = 'direct',
  SYSTEM = 'system',
}
export type IProxyType = `${PROXY_TYPE}`;
