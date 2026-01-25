export enum DNS {
  TENCENT = 'https://sm2.doh.pub/dns-query',
  ALI = 'https://dns.alidns.com/dns-query',
  QIHOO = 'https://doh.360.cn/dns-query',
  CLOUDFLARE = 'https://cloudflare-dns.com/dns-query',
  OPENDNS = 'https://doh.opendns.com/dns-query',
  GOOGLE = 'https://dns.google/dns-query',
}

export type IDns = `${DNS}`;
