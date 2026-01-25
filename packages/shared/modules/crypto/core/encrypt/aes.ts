import { cipher } from 'node-forge';

import type { AesOptionsNew, Pad } from '../../type';
import {
  arrayToBytes as forgeArrayToBytes,
  bytesToArray as forgeBytesToArray,
  stringify as forgeStringify,
} from '../../utils/forge';
import {
  arrayToWordArray,
  pad as wordArrayPad,
  parse as wordArrayParse,
  unpad as wordArrayUnpad,
  wordArrayToArray,
} from '../../utils/wordArray';

/**
 * 获取填充模式名称
 */
const getPad = (pad: string): Pad => {
  switch (pad.toLowerCase()) {
    case 'pkcs5padding':
    case 'pkcs7padding':
      return 'pkcs7padding';
    case 'ansix923':
      return 'ansix923';
    case 'iso10126':
      return 'iso10126';
    case 'iso97971':
      return 'iso97971';
    case 'zeropadding':
      return 'zeropadding';
    case 'nopadding':
    default:
      return 'nopadding';
  }
};

/**
 * 获取加密模式
 */
const getMode = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'cfb':
      return 'AES-CFB';
    case 'ofb':
      return 'AES-OFB';
    case 'ctr':
      return 'AES-CTR';
    case 'ecb':
      return 'AES-ECB';
    case 'gcm':
      return 'AES-GCM';
    case 'cbc':
    default:
      return 'AES-CBC';
  }
};

/**
 * AES 加密/解密工具
 */
export const aes = {
  /**
   * AES 加密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/AESEncrypt
   * 不支持gcm-https://emn178.github.io/online-tools/aes/encrypt/
   * https://www.toolhelper.cn/SymmetricEncryption/AES
   *
   * @param {AesOptions} options - 加密参数
   * @returns {string} - 加密结果
   *
   * @example
   * aes.encode({
   *   src: 'this is an example',
   *   key: '8jki8sihkdjh7sukebky9j',
   *   iv: '8jki8sihkdjh7sukebky9j',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'hex',
   * });
   *  => 308988e542e1da36e676ad117627c3b496c2e64a63711a0310f6f562aa3904f8
   *  => MImI5ULh2jbmdq0RdifDtJbC5kpjcRoDEPb1Yqo5BPg=
   */
  encode: (options: AesOptionsNew): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      aad,
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      aadEncode = 'utf8',
      tagEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '') return '';
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const keyBuffer = wordArrayParse[keyEncode](key);
    const ivBuffer = mode.toLowerCase() !== 'ecb' ? wordArrayParse[ivEncode](iv!) : undefined;

    if (![16, 24, 32].includes(keyBuffer.sigBytes)) {
      throw new Error('Key must be 128, 192, or 256 bytes');
    }
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && ivBuffer.sigBytes !== 16) {
      throw new Error('IV must be 128 bytes');
    }

    const srcBuffer = wordArrayParse[inputEncode](src);
    const aadBuffer = mode.toLowerCase() === 'gcm' && aad ? wordArrayParse[aadEncode](aad) : undefined;

    const encipher = cipher.createCipher(getMode(mode), forgeArrayToBytes(wordArrayToArray(keyBuffer)));
    encipher.start({
      iv: ivBuffer ? forgeArrayToBytes(wordArrayToArray(ivBuffer)) : undefined,
      additionalData: aadBuffer ? forgeArrayToBytes(wordArrayToArray(aadBuffer)) : undefined,
    });
    const paddedData = ['cbc', 'ecb'].includes(mode.toLowerCase())
      ? wordArrayPad[getPad(pad)](srcBuffer, 4)
      : srcBuffer;

    if (
      paddedData.sigBytes % 16 !== 0 &&
      pad.toLowerCase() === 'nopadding' &&
      ['cbc', 'ecb'].includes(mode.toLowerCase())
    ) {
      throw new Error('Message must be multipler of 128 bits');
    }

    encipher.mode.pad = false;
    encipher.update(forgeArrayToBytes(wordArrayToArray(paddedData)));
    encipher.finish();
    const encrypted = encipher.output;

    // GCM模式需要返回标签
    if (mode.toLowerCase() === 'gcm') {
      const encryptedData = forgeStringify[outputEncode](encrypted.getBytes());
      const tag = forgeStringify[tagEncode](encipher.mode.tag);
      return `${encryptedData}\nTag:${tag}`;
    }

    return forgeStringify[outputEncode](encrypted.getBytes());
  },

  /**
   * AES 解密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/AESDecrypt
   * 不支持gcm-https://emn178.github.io/online-tools/aes/decrypt/
   * https://www.toolhelper.cn/SymmetricEncryption/AES
   *
   * @param {AesOptions} options - 解密参数
   * @returns {string} - 解密结果
   *
   * @example
   * aes.decode({
   *   src: '308988e542e1da36e676ad117627c3b496c2e64a63711a0310f6f562aa3904f8',
   *   key: '8jki8sihkdjh7sukebky9j',
   *   iv: '8jki8sihkdjh7sukebky9j',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'hex',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: AesOptionsNew): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      aad,
      tag,
      inputEncode = 'base64',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      aadEncode = 'utf8',
      tagEncode = 'utf8',
      outputEncode = 'utf8',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (key === '' || src === '') return '';
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const keyBuffer = wordArrayParse[keyEncode](key);
    const ivBuffer = mode.toLowerCase() !== 'ecb' ? wordArrayParse[ivEncode](iv!) : undefined;

    if (![16, 24, 32].includes(keyBuffer.sigBytes)) {
      throw new Error('Key must be 128, 192, or 256 bytes');
    }
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && ivBuffer.sigBytes !== 16) {
      throw new Error('IV must be 128 bytes');
    }

    const srcBuffer = wordArrayParse[inputEncode](src);
    const aadBuffer = mode.toLowerCase() === 'gcm' && aad ? wordArrayParse[aadEncode](aad) : undefined;
    const tagBuffer = mode.toLowerCase() === 'gcm' && tag ? wordArrayParse[tagEncode](tag) : undefined;

    const decipher = cipher.createDecipher(getMode(mode), forgeArrayToBytes(wordArrayToArray(keyBuffer)));
    decipher.start({
      iv: ivBuffer ? forgeArrayToBytes(wordArrayToArray(ivBuffer)) : undefined,
      additionalData: aadBuffer ? forgeArrayToBytes(wordArrayToArray(aadBuffer)) : undefined,
      tag: tagBuffer ? forgeArrayToBytes(wordArrayToArray(tagBuffer)) : undefined,
    });
    decipher.mode.unpad = false;
    decipher.update(forgeArrayToBytes(wordArrayToArray(srcBuffer)));
    decipher.finish();
    const decrypted = decipher.output;

    const unpaddedBuffer = wordArrayUnpad[getPad(pad)](arrayToWordArray(forgeBytesToArray(decrypted)));
    const unpaddedBytes = forgeArrayToBytes(wordArrayToArray(unpaddedBuffer));

    return forgeStringify[outputEncode](unpaddedBytes.getBytes());
  },
};
