import * as SmCrypto from 'sm-crypto-v2';

import type { Sm4Options } from '../../type';
import {
  arrayToWordArray,
  parse as wordParse,
  stringify as wordStringify,
  wordArrayToArray,
} from '../../utils/wordArray';

type IGCMResult = SmCrypto.sm4.GCMResult<Uint8Array>;

const getMode = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'ecb':
      return 'ecb';
    case 'gcm':
      return 'gcm';
    case 'cbc':
    default:
      return 'cbc';
  }
};

const getPad = (pad: string) => {
  switch (pad.toLowerCase()) {
    case 'pkcs5padding':
    case 'pkcs7padding':
      return 'pkcs#7';
    case 'nopadding':
    default:
      return 'none';
  }
};

/**
 * SM4 加密/解密工具
 */
export const sm4 = {
  /**
   * SM4 加密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/SM4Encrypt
   * https://www.toolhelper.cn/SymmetricEncryption/SM4
   * 没找到 sm4-gcm 在线工具
   *
   * @param {Sm4Options} options - 加密参数
   * @returns {string} - 加密结果
   *
   * @example
   * sm4.encode({
   *   src: 'this is an example',
   *   key: 'h9g86bgiuygbi76bigbi76',
   *   iv: 'h9g86bgiuygbi76bigbi76',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'hex',
   * });
   *  => 11586f53f74451daa0bb8286d46dcfda7629e31e3f2ff0a587d0e92eccef54b9
   *  => EVhvU/dEUdqgu4KG1G3P2nYp4x4/L/Clh9DpLszvVLk=
   */
  encode: (options: Sm4Options): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      aad,
      inputEncode = 'utf-8',
      keyEncode = 'utf-8',
      ivEncode = 'utf-8',
      aadEncode = 'utf8',
      tagEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for SM4 encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && iv === '') {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const keyBuffer = wordParse[keyEncode](key);
    const ivBuffer = mode.toLowerCase() !== 'ecb' ? wordParse[ivEncode](iv) : undefined;
    const aadBuffer = mode.toLowerCase() === 'gcm' && aad ? wordParse[aadEncode](aad) : undefined;
    const srcBuffer = wordParse[inputEncode](src);

    if (keyBuffer.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (mode !== 'ecb' && ivBuffer!.sigBytes !== 16) throw new Error('IV must be 128 bytes');
    if (
      srcBuffer.sigBytes % 16 !== 0 &&
      pad.toLowerCase() === 'nopadding' &&
      ['cbc', 'ecb'].includes(mode.toLowerCase())
    ) {
      throw new Error('Message must be multipler of 128 bits');
    }

    const encrypted = SmCrypto.sm4.encrypt(
      wordArrayToArray(srcBuffer),
      wordArrayToArray(keyBuffer),
      Object.assign(
        {
          mode: getMode(mode),
          padding: mode.toLowerCase() !== 'gcm' ? getPad(pad) : 'none',
          output: 'array',
        },
        ivBuffer !== undefined ? { iv: wordArrayToArray(ivBuffer) } : {},
        mode.toLowerCase() === 'gcm' && aadBuffer ? { associatedData: wordArrayToArray(aadBuffer) } : {},
        mode.toLowerCase() === 'gcm' ? { outputTag: true } : {},
      ) as any,
    );

    if (mode.toLowerCase() === 'gcm') {
      const gcmResult = encrypted as IGCMResult;
      const output = wordStringify[outputEncode](arrayToWordArray(gcmResult.output));
      const tag = wordStringify[tagEncode](arrayToWordArray(gcmResult.tag!));
      return `${output}\nTag:${tag}`;
    }

    return wordStringify[outputEncode](arrayToWordArray(encrypted as unknown as Uint8Array));
  },
  /**
   * SM4 解密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/SM4Decrypt
   * https://www.toolhelper.cn/SymmetricEncryption/SM4
   * 没找到 sm4-gcm 在线工具
   *
   * @param {Sm4Options} options - 解密参数
   * @returns {string} - 解密结果
   *
   * @example
   * sm4.decode({
   *   src: '11586f53f74451daa0bb8286d46dcfda7629e31e3f2ff0a587d0e92eccef54b9',
   *   key: 'h9g86bgiuygbi76bigbi76',
   *   iv: 'h9g86bgiuygbi76bigbi76',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'hex',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'utf8',
   * });
   * => this is an example
   */
  decode: (options: Sm4Options): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      aad,
      tag,
      inputEncode = 'utf-8',
      keyEncode = 'utf-8',
      ivEncode = 'utf-8',
      aadEncode = 'utf8',
      tagEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for SM4 encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && iv === '') {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const keyBuffer = wordParse[keyEncode](key);
    const ivBuffer = mode.toLowerCase() !== 'ecb' ? wordParse[ivEncode](iv) : undefined;
    const aadBuffer = mode.toLowerCase() === 'gcm' && aad ? wordParse[aadEncode](aad) : undefined;
    const tagBuffer = mode.toLowerCase() === 'gcm' && tag ? wordParse[tagEncode](tag) : undefined;
    const srcBuffer = wordParse[inputEncode](src);

    if (keyBuffer.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (mode !== 'ecb' && ivBuffer!.sigBytes !== 16) throw new Error('IV must be 128 bytes');

    const decrypted = SmCrypto.sm4.decrypt(
      wordArrayToArray(srcBuffer),
      wordArrayToArray(keyBuffer),
      Object.assign(
        {
          mode: getMode(mode),
          padding: mode.toLowerCase() !== 'gcm' ? getPad(pad) : 'none',
          output: 'array',
        },
        ivBuffer !== undefined ? { iv: wordArrayToArray(ivBuffer) } : {},
        mode.toLowerCase() === 'gcm' && aadBuffer ? { associatedData: wordArrayToArray(aadBuffer) } : {},
        mode.toLowerCase() === 'gcm' && tagBuffer ? { tag: wordArrayToArray(tagBuffer) } : {},
      ) as any,
    );

    return wordStringify[outputEncode](arrayToWordArray(decrypted as unknown as Uint8Array));
  },
};
