export const IPTV_TYPE = {
  REMOTE: 1,
  LOCAL: 2,
  MANUAL: 3,
} as const;
export type IIptvType = (typeof IPTV_TYPE)[keyof typeof IPTV_TYPE];
export const iptvTypes = Object.values(IPTV_TYPE);
