import CryptoJS from 'crypto-js';
import { hmac as forgeHmac, md as forgeMd } from 'node-forge';
import * as SmCrypto from 'sm-crypto-v2';

import type { HashOptions, HmacOptions } from '../type';
import { arrayToBytes as forgeArrayToBytes, stringify as forgeStringify } from '../utils/forge';
import { parse as wordParse, stringify as wordStringify, wordArrayToArray } from '../utils/wordArray';

/**
 * 通用哈希处理函数
 * @param options 哈希选项
 * @param hashFn 哈希函数
 * @returns 哈希结果
 */
const processHash = (options: HashOptions, hashFn: (srcBuffer: any) => any): string => {
  const { src, inputEncode = 'utf8', outputEncode = 'hex' } = options;
  if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
  const srcBuffer = wordParse[inputEncode](src);
  const cipherBuffer = hashFn(srcBuffer);
  return wordStringify[outputEncode](cipherBuffer);
};

/**
 * 通用HMAC处理函数
 * @param options HMAC选项
 * @param hmacFn HMAC函数
 * @returns HMAC结果
 */
const processHmac = (options: HmacOptions, hmacFn: (srcBuffer: any, keyBuffer: any) => any): string => {
  const { src, key = '', inputEncode = 'utf8', outputEncode = 'hex', keyEncode = 'utf8' } = options;
  if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
  const srcBuffer = wordParse[inputEncode](src);
  const keyBuffer = wordParse[keyEncode](key);
  const cipherBuffer = hmacFn(srcBuffer, keyBuffer);
  return wordStringify[outputEncode](cipherBuffer);
};

/**
 * 哈希算法集合
 * 在线工具参考:
 * - 全功能: https://1024tools.com/hash
 * - 普通: https://btool.cn/hash-text
 * - SM3: https://tool.hiofd.com/sm3-online/
 */
export const hash = {
  /**
   * MD5-16位 哈希算法
   * @param options 哈希选项
   * @returns 16位MD5哈希值
   * @example hash['md5-16']({ src: 'this is an example' }) => 'abaaf34bb106a104'
   */
  'md5-16': (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => {
      const cipherHex = CryptoJS.MD5(srcBuffer).toString().slice(8, 24);
      return wordParse.hex(cipherHex);
    });
  },

  /**
   * MD5-32位 哈希算法
   * @param options 哈希选项
   * @returns 32位MD5哈希值
   * @example hash['md5-32']({ src: 'this is an example' }) => '9202816dabaaf34bb106a10421b9a0d0'
   */
  'md5-32': (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.MD5(srcBuffer));
  },

  /**
   * SHA1 哈希算法
   * @param options 哈希选项
   * @returns SHA1哈希值
   * @example hash.sha1({ src: 'this is an example' }) => '87b4af8c0dda53bb757c0badf9d506e260bc04ba'
   */
  sha1: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA1(srcBuffer));
  },

  /**
   * SHA224 哈希算法
   * @param options 哈希选项
   * @returns SHA224哈希值
   * @example hash.sha224({ src: 'this is an example' }) => 'e48c98e09bd59adea0f335815e43fd1eb308688495d9247980e01ae6'
   */
  sha224: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA224(srcBuffer));
  },

  /**
   * SHA256 哈希算法
   * @param options 哈希选项
   * @returns SHA256哈希值
   * @example hash.sha256({ src: 'this is an example' }) => 'd44c035835f1c5e0668b7d186a2ff5b0dc2e3137ec3c50b12a34c47b7af51e44'
   */
  sha256: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA256(srcBuffer));
  },

  /**
   * SHA3 哈希算法
   * @param options 哈希选项
   * @returns SHA3哈希值
   * @example hash.sha3({ src: 'this is an example' }) => 'fd68f056afd39a54158979cd5dd68e64d49f001556f45979877b09968b897d7cebd49f2ee022675d221ed56f8ca8e82b1236fe2c441fc23a1aa34639e7f1faa0'
   */
  sha3: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA3(srcBuffer));
  },

  /**
   * SHA384 哈希算法
   * @param options 哈希选项
   * @returns SHA384哈希值
   * @example hash.sha384({ src: 'this is an example' }) => 'e4f8571338b2ceda5859ed5c8663b8a3fcea2a40c42e932d7dd03bddf6744832d7c3d6263ef82b4e4b6408fe3ef29544'
   */
  sha384: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA384(srcBuffer));
  },

  /**
   * SHA512 哈希算法
   * @param options 哈希选项
   * @returns SHA512哈希值
   * @example hash.sha512({ src: 'this is an example' }) => '3fb303c89207ddbfbf71fb4299fe6374d7adb298d56f43e5d2e1760b2dd1b00b27f16d3e39ebde4ca23109e9dd158b84e1a03bbba0c1b4a7fb586e3e0e6e6918'
   */
  sha512: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.SHA512(srcBuffer));
  },
  /**
   * SHA512-224 哈希算法
   * @param options 哈希选项
   * @returns SHA512-224哈希值
   * @example hash['sha512-224']({ src: 'this is an example' }) => 'd4d5c27c47ca844bfd91bf41668e7fd7ae3049dcb3654ab6ec4f6197'
   */
  'sha512-224': (options: HashOptions): string => {
    const { src, inputEncode = 'utf8', outputEncode = 'hex' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const cipherBuffer = forgeMd['sha512/224']
      .create()
      .update(forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes())
      .digest();
    return forgeStringify[outputEncode](cipherBuffer.getBytes());
  },

  /**
   * SHA512-256 哈希算法
   * @param options 哈希选项
   * @returns SHA512-256哈希值
   * @example hash['sha512-256']({ src: 'this is an example' }) => '8ab46fda39de9dfafef41b16268edd30751de364df432795c06730aae5f6a3e6'
   */
  'sha512-256': (options: HashOptions): string => {
    const { src, inputEncode = 'utf8', outputEncode = 'hex' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const cipherBuffer = forgeMd['sha512/256']
      .create()
      .update(forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes())
      .digest();
    return forgeStringify[outputEncode](cipherBuffer.getBytes());
  },

  /**
   * RIPEMD160 哈希算法
   * @param options 哈希选项
   * @returns RIPEMD160哈希值
   * @example hash.ripemd160({ src: 'this is an example' }) => '9d9334f6733a18415045e946e6ab85d3174e0a4e'
   */
  ripemd160: (options: HashOptions): string => {
    return processHash(options, (srcBuffer) => CryptoJS.RIPEMD160(srcBuffer));
  },

  /**
   * SM3 哈希算法（国密算法）
   * @param options 哈希选项
   * @returns SM3哈希值
   * @example hash.sm3({ src: 'this is an example' }) => 'e66750ddcee668315bdbdf47fcced115c3d62f6153d4724ab800660900a06093'
   */
  sm3: (options: HashOptions): string => {
    const { src, inputEncode = 'utf8', outputEncode = 'hex' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const cipherHex = SmCrypto.sm3(wordArrayToArray(srcBuffer));
    const cipherBuffer = wordParse.hex(cipherHex);
    return wordStringify[outputEncode](cipherBuffer);
  },
};

/**
 * HMAC算法集合
 * 在线工具参考:
 * - 全功能: https://1024tools.com/hmac
 * - 普通+SM3: https://btool.cn/hmac-generator
 */
export const hmac = {
  /**
   * HMAC-MD5-16位算法
   * @param options HMAC选项
   * @returns 16位HMAC-MD5值
   * @example hmac['md5-16']({ src: 'this is an example', key: 'zy' }) => 'ec8e0c400f4a2207'
   */
  'md5-16': (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => {
      const cipherHex = CryptoJS.HmacMD5(srcBuffer, keyBuffer).toString().slice(8, 24);
      return wordParse.hex(cipherHex);
    });
  },

  /**
   * HMAC-MD5-32位算法
   * @param options HMAC选项
   * @returns 32位HMAC-MD5值
   * @example hmac['md5-32']({ src: 'this is an example', key: 'zy' }) => 'fe4c3df9ec8e0c400f4a2207124f36cc'
   */
  'md5-32': (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacMD5(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA1算法
   * @param options HMAC选项
   * @returns HMAC-SHA1值
   * @example hmac.sha1({ src: 'this is an example', key: 'zy' }) => 'd68a1c8607443eced2b9ddd106019c9df371c550'
   */
  sha1: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA1(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA224算法
   * @param options HMAC选项
   * @returns HMAC-SHA224值
   * @example hmac.sha224({ src: 'this is an example', key: 'zy' }) => '97285486cefddaf30d1cd3c82e8954a8711f726a3b0413f3d93c8028'
   */
  sha224: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA224(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA256算法
   * @param options HMAC选项
   * @returns HMAC-SHA256值
   * @example hmac.sha256({ src: 'this is an example', key: 'zy' }) => '4ac4435d831ecf3f472969e0fd892c01890041dc80f087ec8baa67ea31d66731'
   */
  sha256: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA256(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA3算法
   * @param options HMAC选项
   * @returns HMAC-SHA3值
   * @example hmac.sha3({ src: 'this is an example', key: 'zy' }) => '3c58d36a563637fd4d1c437c52b42cce007db422ef04485cc2bffe8c0e2fcd833408762ffbc140617aab73b9e4fc7b7139b1927dbb1b9d0f473f8f6295fbe6ef'
   */
  sha3: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA3(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA384算法
   * @param options HMAC选项
   * @returns HMAC-SHA384值
   * @example hmac.sha384({ src: 'this is an example', key: 'zy' }) => '843b0c90c009370b4947cbb2fa0ed023a1fd0b68e00554927a31cd419ac2fdfb5c47d7a0c4768a06b895499c7b6925f4'
   */
  sha384: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA384(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SHA512算法
   * @param options HMAC选项
   * @returns HMAC-SHA512值
   * @example hmac.sha512({ src: 'this is an example', key: 'zy' }) => 'd7d752e9477327133df026a74e4fe5df488906f5f7e7a12aa21075c09498f6b5dc00659dd08f35eafa7028aff818f4166dd979ee9b9690f495be4fe93ec3125a'
   */
  sha512: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacSHA512(srcBuffer, keyBuffer));
  },
  /**
   * HMAC-SHA512/224算法
   * @param options HMAC选项
   * @returns HMAC-SHA512/224值
   * @example hmac['sha512-224']({ src: 'this is an example', key: 'zy' }) => 'b2fe57483a595bd575ad5b69f4ec1f223566500c9f39b5c1d9c92f00'
   */
  'sha512-224': (options: HmacOptions): string => {
    const { src, key = '', inputEncode = 'utf8', outputEncode = 'hex', keyEncode = 'utf8' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const keyBuffer = wordParse[keyEncode](key);
    const hmac = forgeHmac.create();
    hmac.start('sha512/224', forgeArrayToBytes(wordArrayToArray(keyBuffer)).getBytes());
    hmac.update(forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes());
    const cipherBuffer = hmac.digest();
    return forgeStringify[outputEncode](cipherBuffer.getBytes());
  },

  /**
   * HMAC-SHA512/256算法
   * @param options HMAC选项
   * @returns HMAC-SHA512/256值
   * @example hmac['sha512-256']({ src: 'this is an example', key: 'zy' }) => 'd6ae99f22346f65342fab4cf9e40adf8aa88cec4bc32f30a023a14e1c5dbc919'
   */
  'sha512-256': (options: HmacOptions): string => {
    const { src, key = '', inputEncode = 'utf8', outputEncode = 'hex', keyEncode = 'utf8' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const keyBuffer = wordParse[keyEncode](key);
    const hmac = forgeHmac.create();
    hmac.start('sha512/256', forgeArrayToBytes(wordArrayToArray(keyBuffer)).getBytes());
    hmac.update(forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes());
    const cipherBuffer = hmac.digest();
    return forgeStringify[outputEncode](cipherBuffer.getBytes());
  },

  /**
   * HMAC-RIPEMD160算法
   * @param options HMAC选项
   * @returns HMAC-RIPEMD160值
   * @example hmac.ripemd160({ src: 'this is an example', key: 'zy' }) => 'fe022aff0043dca6497a18d21779f396296db1dd'
   */
  ripemd160: (options: HmacOptions): string => {
    return processHmac(options, (srcBuffer, keyBuffer) => CryptoJS.HmacRIPEMD160(srcBuffer, keyBuffer));
  },

  /**
   * HMAC-SM3算法
   * @param options HMAC选项
   * @returns HMAC-SM3值
   * @example hmac.sm3({ src: 'this is an example', key: 'zy' }) => '063f083039a56c7440de518c62b6d9cfb8e0275440c7d55dcdbd9034af127f46'
   */
  sm3: (options: HmacOptions): string => {
    const { src, key = '', inputEncode = 'utf8', outputEncode = 'hex', keyEncode = 'utf8' } = options;
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    const srcBuffer = wordParse[inputEncode](src);
    const keyBuffer = wordParse[keyEncode](key);
    const cipherHex = SmCrypto.sm3(wordArrayToArray(srcBuffer), {
      mode: 'hmac',
      key: wordArrayToArray(keyBuffer),
    });
    const cipherBuffer = wordParse.hex(cipherHex);
    return wordStringify[outputEncode](cipherBuffer);
  },
};
