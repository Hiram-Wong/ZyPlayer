import crypto from 'crypto-js';
import * as he from 'he';
import pako from 'pako';
import { utf8ToUint8Array, uint8ArrayToUtf8, uint8ArrayToBase64, base64ToUint8Array } from './utils';

const base64 = {
  encode: (val: string) => crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(val)),
  decode: (val: string) => crypto.enc.Utf8.stringify(crypto.enc.Base64.parse(val)),
  btoa: (val: string) => uint8ArrayToBase64(utf8ToUint8Array(val)),
  atob: (val: string) => uint8ArrayToUtf8(base64ToUint8Array(val)),
};

const hash = {
  'md5-16': (val: string) => crypto.MD5(val).toString().slice(8, 24),
  'md5-32': (val: string) => crypto.MD5(val).toString(),
  sha1: (val: string) => crypto.SHA1(val).toString(),
  sha224: (val: string) => crypto.SHA224(val).toString(),
  sha256: (val: string) => crypto.SHA256(val).toString(),
  sha3: (val: string) => crypto.SHA3(val).toString(),
  sha384: (val: string) => crypto.SHA384(val).toString(),
  sha512: (val: string) => crypto.SHA512(val).toString(),
  ripemd160: (val: string) => crypto.RIPEMD160(val).toString(),
};

const hmac = {
  'md5-16': (val: string, key: string) => crypto.HmacMD5(val, key).toString().slice(8, 24),
  'md5-32': (val: string, key: string) => crypto.HmacMD5(val, key).toString(),
  sha1: (val: string, key: string) => crypto.HmacSHA1(val, key).toString(),
  sha224: (val: string, key: string) => crypto.HmacSHA224(val, key).toString(),
  sha256: (val: string, key: string) => crypto.HmacSHA256(val, key).toString(),
  sha3: (val: string, key: string) => crypto.HmacSHA3(val, key).toString(),
  sha384: (val: string, key: string) => crypto.HmacSHA384(val, key).toString(),
  sha512: (val: string, key: string) => crypto.HmacSHA512(val, key).toString(),
  ripemd160: (val: string, key: string) => crypto.HmacRIPEMD160(val, key).toString(),
};

const html = {
  encode: (val: string) => he.encode(val, { encodeEverything: true }),
  decode: (val: string) => he.decode(val),
};

const unicode = {
  encode: (val: string) => val.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''),
  decode: (val: string) => val.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16))),
};

const gzip = {
  encode: (val: string) => uint8ArrayToBase64(pako.gzip(utf8ToUint8Array(val))),
  decode: (val: string) => {
    const uint8Array = base64ToUint8Array(val);
    const decompressed = pako.ungzip(uint8Array);
    return uint8ArrayToUtf8(decompressed);
  },
};

const url = {
  encode: (val: string) => encodeURIComponent(val),
  decode: (val: string) => decodeURIComponent(val),
};

const hex = {
  encode: (val: string) => Array.from(utf8ToUint8Array(val)).map(b => b.toString(16).padStart(2, '0')).join(''),
  decode: (val: string) => uint8ArrayToUtf8(new Uint8Array(val.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))),
};

export { base64, hash, hmac, html, unicode, gzip, url, hex };
