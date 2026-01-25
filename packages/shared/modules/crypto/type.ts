import type * as CryptoJS from 'crypto-js';

export type Pad = 'pkcs5padding' | 'pkcs7padding' | 'ansix923' | 'iso10126' | 'iso97971' | 'nopadding' | 'zeropadding';
export type RsaPad = 'rsaes-pkcs1-v1_5' | 'rsaes-oaep-sha1';
export type Sm4Pad = 'pkcs5padding' | 'pkcs7padding' | 'nopadding';

export type Mode = 'cfb' | 'ofb' | 'ctr' | 'ecb' | 'cbc';
export type Sm4Mode = 'ecb' | 'cbc' | 'gcm';
export type AesMode = Mode | 'gcm';

export type Encode = 'utf8' | 'utf16' | 'utf16be' | 'utf16le' | 'hex' | 'base64' | 'latin1';

export type ParseFunction = (str: string) => CryptoJS.lib.WordArray;
export type StringifyFunction = (wordArray: CryptoJS.lib.WordArray) => string;

export interface HashOptions {
  src: string;
  inputEncode?: Encode;
  outputEncode?: Encode;
}

export interface HmacOptions extends HashOptions {
  key?: string;
  keyEncode?: Encode;
}

export interface Rc4Options {
  src: string;
  key: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  outputEncode?: Encode;
}

export interface Rc4DropOptions {
  src: string;
  key: string;
  drop?: number;
  inputEncode?: Encode;
  keyEncode?: Encode;
  outputEncode?: Encode;
}

export interface AesOptions {
  src: string;
  key: string;
  iv?: string;
  mode?: Mode;
  pad?: Pad;
  aad?: string;
  tag?: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  tagEncode?: Encode;
  aadEncode?: Encode;
  outputEncode?: Encode;
}

export interface AesOptionsNew {
  src: string;
  key: string;
  iv?: string;
  mode?: AesMode;
  pad?: Pad;
  aad?: string;
  tag?: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  tagEncode?: Encode;
  aadEncode?: Encode;
  outputEncode?: Encode;
}

export interface DesOptions {
  src: string;
  key: string;
  iv?: string;
  mode?: Mode;
  pad?: Pad;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  outputEncode?: Encode;
}

export interface TripleDesOptions {
  src: string;
  key: string;
  iv?: string;
  mode?: Mode;
  pad?: Pad;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  outputEncode?: Encode;
}

export interface RabbitOptions {
  src: string;
  key: string;
  iv?: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  outputEncode?: Encode;
}

export interface RabbitLegacyOptions {
  src: string;
  key: string;
  iv?: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  outputEncode?: Encode;
}

export interface Sm4Options {
  src: string;
  key: string;
  iv?: string;
  mode?: Sm4Mode;
  pad?: Sm4Pad;
  aad?: string;
  tag?: string;
  inputEncode?: Encode;
  keyEncode?: Encode;
  ivEncode?: Encode;
  tagEncode?: Encode;
  aadEncode?: Encode;
  outputEncode?: Encode;
}

export interface RsaOptions {
  src: string;
  key: string;
  pad?: RsaPad;
  type?: 0 | 1; // 0: 公钥加密, 私钥解密; 1: 私钥加密, 公钥解密
  long?: boolean;
  passphrase?: string;
  passphraseEncode?: Encode;
  inputEncode?: Encode;
  outputEncode?: Encode;
}

export interface Base64EncodeOptions {
  src: string;
  inputEncode?: Encode;
  ignore?: boolean; // 是否忽略 Latin-1 编码检查
}

export interface Base64DecodeOptions {
  src: string;
  outputEncode?: Encode;
}

export type UniCodePrefix = '\\u' | '%u' | 'U+';

export interface UnicodeEncodeOptions {
  src: string;
  prefix?: UniCodePrefix;
  pad?: number;
  encodeEverything?: boolean;
  inputEncode?: Encode;
}

export interface UnicodeDecodeOptions {
  src: string;
  outputEncode?: Encode;
  prefix?: UniCodePrefix;
}

export type HtmlEntities = 'hex' | 'named' | 'numeric';

export interface HtmlEncodeOptions {
  src: string;
  encodeEverything?: boolean;
  entities?: HtmlEntities;
  inputEncode?: Encode;
}

export interface HtmlDecodeOptions {
  src: string;
  outputEncode?: Encode;
}

export interface GzipEncodeOptions {
  src: string;
  inputEncode?: Encode;
  outputEncode?: Encode;
}

export interface GzipDecodeOptions {
  src: string;
  inputEncode?: Encode;
  outputEncode?: Encode;
}

export type UrlType = 'component' | 'uri';

export interface UrlEncodeOptions {
  src: string;
  type?: UrlType;
  inputEncode?: Encode;
}

export interface UrlDecodeOptions {
  src: string;
  type?: UrlType;
  outputEncode?: Encode;
}

export type HexDelimiter =
  | 'space'
  | 'percent'
  | 'comma'
  | 'semiColon'
  | 'colon'
  | 'lineFeed'
  | 'crlf'
  | '0x'
  | '0xComma'
  | '\\x'
  | 'none';

export interface HexEncodeOptions {
  src: string;
  delimiter?: HexDelimiter;
  inputEncode?: Encode;
}

export interface HexDecodeOptions {
  src: string;
  delimiter?: HexDelimiter;
  outputEncode?: Encode;
}
