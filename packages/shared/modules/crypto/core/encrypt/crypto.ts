import CryptoJS from 'crypto-js';

import type {
  AesOptions,
  DesOptions,
  RabbitLegacyOptions,
  RabbitOptions,
  Rc4DropOptions,
  Rc4Options,
  TripleDesOptions,
} from '../../type';
import { parse, stringify } from '../../utils/wordArray';

const getMode = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'cfb':
      return CryptoJS.mode.CFB;
    case 'ofb':
      return CryptoJS.mode.OFB;
    case 'ctr':
      return CryptoJS.mode.CTR;
    case 'ecb':
      return CryptoJS.mode.ECB;
    case 'cbc':
    default:
      return CryptoJS.mode.CBC;
  }
};

const getPad = (pad: string) => {
  switch (pad.toLowerCase()) {
    case 'pkcs5padding':
    case 'pkcs7padding':
      return CryptoJS.pad.Pkcs7;
    case 'ansix923':
      return CryptoJS.pad.AnsiX923;
    case 'iso10126':
      return CryptoJS.pad.Iso10126;
    case 'iso97971':
      return CryptoJS.pad.Iso97971;
    case 'zeropadding':
      return CryptoJS.pad.ZeroPadding;
    case 'nopadding':
    default:
      return CryptoJS.pad.NoPadding;
  }
};

/**
 * RC4 加密/解密工具
 */
export const rc4 = {
  /**
   * RC4 加密方法
   * https://emn178.github.io/online-tools/rc4/encrypt/
   * https://rivers.chaitin.cn/toolkit/cyberChef/RC4
   *
   * @param {Rc4Options} options - 加密参数
   * @returns {string} - 加密后的字符串
   *
   * @example
   * rc4.encode({
   *   src: 'this is an example',
   *   key: 'test',
   *   inputEncode: 'utf8',
   *   keyEncode: 'utf8',
   *   outputEncode: 'hex',
   * });
   *  => dae74e62c0430e05b7207d0669c58abfd1fb
   *  => 2udOYsBDDgW3IH0GacWKv9H7
   */
  encode: (options: Rc4Options): string => {
    const { src, key, inputEncode = 'utf8', keyEncode = 'utf8', outputEncode = 'base64' } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (key === '') {
      throw new Error('Key is required for RC4 encryption');
    }

    const k = parse[keyEncode](key);

    const plaintext = parse[inputEncode](src);
    const encrypted = CryptoJS.RC4.encrypt(plaintext, k);
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * RC4 解密方法
   * https://emn178.github.io/online-tools/rc4/decrypt/
   *
   * @param {Rc4Options} options - 解密参数
   * @returns {string} - 解密后的字符串
   *
   * @example
   * rc4.decode({
   *   src: 'dae74e62c0430e05b7207d0669c58abfd1fb',
   *   key: 'test',
   *   inputEncode: 'hex',
   *   keyEncode: 'utf8',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: Rc4Options): string => {
    const { src, key, inputEncode = 'utf8', keyEncode = 'utf8', outputEncode = 'base64' } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (key === '') {
      throw new Error('Key is required for RC4 encryption');
    }

    const k = parse[keyEncode](key);

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.RC4.decrypt(cipherParams, k);
    return stringify[outputEncode](decrypted);
  },
};

/**
 * RC4 Drop 加密/解密工具
 */
export const rc4Drop = {
  /**
   * RC4 Drop 加密方法
   * https://rivers.chaitin.cn/toolkit/cyberChef/RC4Drop
   *
   * @param {Rc4DropOptions} options - 加密参数
   * @returns {string} - 加密后的字符串
   *
   * @example
   * rc4Drop.encode({
   *   src: 'this is an example',
   *   key: 'text',
   *   drop: 192,
   *   inputEncode: 'utf8',
   *   keyEncode: 'utf8',
   *   outputEncode: 'hex',
   * });
   *  => d664763b8fc6df3c25c24bdd822069a99fb0
   *  => 1mR2O4/G3zwlwkvdgiBpqZ+w
   */
  encode: (options: Rc4DropOptions): string => {
    const { src, key, drop = 192, inputEncode = 'utf8', keyEncode = 'utf8', outputEncode = 'base64' } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (!(Number.isFinite(drop) && Number.isInteger(drop) && drop >= 0)) {
      throw new Error('Drop must be a positive integer');
    }
    if (key === '') {
      throw new Error('Key is required for RC4 encryption');
    }

    const k = parse[keyEncode](key);

    const plaintext = parse[inputEncode](src);
    const encrypted = CryptoJS.RC4Drop.encrypt(plaintext, k, {
      drop,
    });
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * RC4 Drop 解密方法
   * https://rivers.chaitin.cn/toolkit/cyberChef/RC4Drop
   *
   * @param {Rc4DropOptions} options - 解密参数
   * @returns {string} - 解密后的字符串
   *
   * @example
   * rc4Drop.decode({
   *   src: 'd664763b8fc6df3c25c24bdd822069a99fb0',
   *   key: 'text',
   *   drop: 192,
   *   inputEncode: 'hex',
   *   keyEncode: 'utf8',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: Rc4DropOptions): string => {
    const { src, key, drop = 192, inputEncode = 'utf8', keyEncode = 'utf8', outputEncode = 'base64' } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (!(Number.isFinite(drop) && Number.isInteger(drop) && drop >= 0)) {
      throw new Error('Drop must be a positive integer');
    }
    if (key === '') {
      throw new Error('Key is required for RC4 encryption');
    }

    const k = parse[keyEncode](key);

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.RC4Drop.decrypt(cipherParams, k, {
      drop,
    });
    return stringify[outputEncode](decrypted);
  },
};

/**
 * AES 加密/解密工具
 */
export const _aes = {
  /**
   * AES 加密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/AESDecrypt
   * 不支持gcm-https://emn178.github.io/online-tools/aes/decrypt/
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
  encode: (options: AesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for AES encryption');
    }
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && iv === '') {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;
    const plaintext = parse[inputEncode](src);

    if (![16, 24, 32].includes(k.sigBytes)) throw new Error('Key must be 128, 192 or 256 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 16) throw new Error('IV must be 128 bytes');

    if (
      plaintext.sigBytes % 64 !== 0 &&
      pad.toLowerCase() === 'nopadding' &&
      ['cbc', 'ecb'].includes(mode.toLowerCase())
    ) {
      throw new Error('Message must be multipler of 128 bits');
    }

    const encrypted = CryptoJS.AES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](encrypted.ciphertext);
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
  decode: (options: AesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for AES encryption');
    }
    if (!['ecb', 'gcm'].includes(mode.toLowerCase()) && iv === '') {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;

    if (![16, 24, 32].includes(k.sigBytes)) throw new Error('Key must be 128, 192 or 256 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 16) throw new Error('IV must be 128 bytes');

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](decrypted);
  },
};

/**
 * DES 加密/解密工具
 */
export const des = {
  /**
   * DES 加密方法
   * 中文有问题-https://rivers.chaitin.cn/toolkit/cyberChef/DESEncrypt
   * https://emn178.github.io/online-tools/des/encrypt/
   *
   * @param {DesOptions} options - 加密参数
   * @returns {string} - 加密结果
   *
   * @example
   * des.encode({
   *   src: 'this is an example',
   *   key: '4fr4g4jhbiu',
   *   iv: '4fr4g4jhbiu',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'hex',
   * });
   *  => 8aae2e6c45114fd43eebce934eeeda428b0cb01924613398
   *  => iq4ubEURT9Q+686TTu7aQosMsBkkYTOY
   */
  encode: (options: DesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for DES encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;
    const plaintext = parse[inputEncode](src);

    if (k.sigBytes !== 8) throw new Error('Key must be 64 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const encrypted = CryptoJS.DES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * DES 解密方法
   * https://rivers.chaitin.cn/toolkit/cyberChef/DESDecrypt
   * https://emn178.github.io/online-tools/des/decrypt/
   *
   * @param {DesOptions} options - 解密参数
   * @returns {string} - 解密结果
   *
   * @example
   * des.decode({
   *  src: '8aae2e6c45114fd43eebce934eeeda428b0cb01924613398',
   *  key: '4fr4g4jhbiu',
   *  iv: '4fr4g4jhbiu',
   *  mode: 'cbc',
   *  pad: 'pkcs7padding',
   *  inputEncode: 'hex',
   *  keyEncode: 'base64',
   *  ivEncode: 'base64',
   *  outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: DesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for DES encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;

    if (k.sigBytes !== 8) throw new Error('Key must be 64 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.DES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](decrypted);
  },
};

/**
 * 3DES 加密/解密工具
 */
export const tripleDes = {
  /**
   * 3DES 加密方法
   * 中文有问题-https://rivers.chaitin.cn/toolkit/cyberChef/3DESEncrypt
   * https://emn178.github.io/online-tools/triple-des/encrypt/
   *
   * @param {TripleDesOptions} options - 加密参数
   * @returns {string} - 加密结果
   *
   * @example
   * tripleDes.encode({
   *   src: 'this is an example',
   *   key: 'ugyi76iv2c4o87bo8q7238495btc0q87',
   *   iv: 'q7238495btc',
   *   mode: 'cbc',
   *   pad: 'pkcs7padding',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'base64',
   *   outputEncode: 'hex',
   * });
   *  => 1dfb0a46f6f788bc7708736bc508d16c2b640b683fc87246
   *  => HfsKRvb3iLx3CHNrxQjRbCtkC2g/yHJG
   */
  encode: (options: TripleDesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for 3DES encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;
    const plaintext = parse[inputEncode](src);

    if (k.sigBytes !== 24) throw new Error('Key must be 192 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const encrypted = CryptoJS.TripleDES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * 3DES 解密方法
   * https://rivers.chaitin.cn/toolkit/cyberChef/3DESDecrypt
   * https://emn178.github.io/online-tools/triple-des/decrypt/
   *
   * @param {TripleDesOptions} options - 解密参数
   * @returns {string} - 解密结果
   *
   * @example
   * tripleDes.decode({
   *  src: '1dfb0a46f6f788bc7708736bc508d16c2b640b683fc87246',
   *  key: 'ugyi76iv2c4o87bo8q7238495btc0q87',
   *  iv: 'q7238495btc',
   *  mode: 'cbc',
   *  pad: 'pkcs7padding',
   *  inputEncode: 'hex',
   *  keyEncode: 'base64',
   *  ivEncode: 'base64',
   *  outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: TripleDesOptions): string => {
    const {
      src,
      key,
      iv,
      mode = 'cbc',
      pad = 'pkcs7padding',
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for DES encryption');
    }
    if (!['ecb'].includes(mode.toLowerCase()) && (!iv || iv === '')) {
      throw new Error('IV is required in CBC/CFB/OFB/CTR mode');
    }

    const k = parse[keyEncode](key);
    const v = mode.toLowerCase() !== 'ecb' ? parse[ivEncode](iv!) : undefined;

    if (k.sigBytes !== 24) throw new Error('Key must be 256 bytes');
    if (mode !== 'ecb' && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(['cbc', 'ecb'].includes(mode.toLowerCase()) ? pad : 'nopadding'),
    });
    return stringify[outputEncode](decrypted);
  },
};

/**
 * Rabbit 加密/解密工具
 */
export const rabbit = {
  /**
   * Rabbit 加密方法
   * 不支持中文-https://rivers.chaitin.cn/toolkit/cyberChef/Rabbit
   * https://www.toolhelper.cn/SymmetricEncryption/Rabbit
   *
   * @param {RabbitOptions} options - 加密参数
   * @returns {string} - 加密后的字符串
   *
   * @example
   * rabbit.encode({
   *   src: 'this is an example',
   *   key: '7hjhguib67i6vtiuyg6rtv',
   *   iv: '',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'utf8',
   *   outputEncode: 'hex',
   * });
   *  => ab78255724b9dd5eaa4a95d5b573f56fffa9
   *  => q3glVyS53V6qSpXVtXP1b/+p
   */
  encode: (options: RabbitOptions): string => {
    const {
      src,
      key,
      iv,
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (key === '') {
      throw new Error('Key is required for Rabbit encryption');
    }

    const k = parse[keyEncode](key);
    const v = iv ? parse[ivEncode](iv) : undefined;

    if (k.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (iv && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const plaintext = parse[inputEncode](src);
    const encrypted = CryptoJS.Rabbit.encrypt(plaintext, k, {
      iv: v,
    });
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * Rabbit 解密方法
   * https://rivers.chaitin.cn/toolkit/cyberChef/Rabbit
   *
   * @param {RabbitOptions} options - 解密参数
   * @returns {string} - 解密后的字符串
   *
   * @example
   * rabbit.decode({
   *   src: 'ab78255724b9dd5eaa4a95d5b573f56fffa9',
   *   key: '7hjhguib67i6vtiuyg6rtv',
   *   iv: '',
   *   inputEncode: 'hex',
   *   keyEncode: 'base64',
   *   ivEncode: 'utf8',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: RabbitOptions): string => {
    const {
      src,
      key,
      iv,
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (!src) return '';
    if (key === '') {
      throw new Error('Key is required for Rabbit encryption');
    }

    const k = parse[keyEncode](key);
    const v = iv ? parse[ivEncode](iv) : undefined;

    if (k.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (iv && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.Rabbit.decrypt(cipherParams, k, {
      iv: v,
    });
    return stringify[outputEncode](decrypted);
  },
};

/**
 * Rabbit Legacy 加密/解密工具
 */
export const rabbitLegacy = {
  /**
   * Rabbit Legacy 加密方法
   *
   * @param {RabbitLegacyOptions} options - 加密参数
   * @returns {string} - 加密后的字符串
   *
   * @example
   * rabbit.encode({
   *   src: 'this is an example',
   *   key: '7hjhguib67i6vtiuyg6rtv',
   *   iv: '',
   *   inputEncode: 'utf8',
   *   keyEncode: 'base64',
   *   ivEncode: 'utf8',
   *   outputEncode: 'hex',
   * });
   *  => db81826a0d4a3fb16d4b6540d8083256361e
   *  => 24GCag1KP7FtS2VA2AgyVjYe
   */
  encode: (options: RabbitLegacyOptions): string => {
    const {
      src,
      key,
      iv,
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for RabbitLegacy encryption');
    }

    const k = parse[keyEncode](key);
    const v = iv ? parse[ivEncode](iv) : undefined;

    if (k.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (iv && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const plaintext = parse[inputEncode](src);
    const encrypted = CryptoJS.RabbitLegacy.encrypt(plaintext, k);
    return stringify[outputEncode](encrypted.ciphertext);
  },

  /**
   * Rabbit Legacy 解密方法
   *
   * @param {RabbitLegacyOptions} options - 解密参数
   * @returns {string} - 解密后的字符串
   *
   * @example
   * rabbit.decode({
   *   src: 'db81826a0d4a3fb16d4b6540d8083256361e',
   *   key: '7hjhguib67i6vtiuyg6rtv',
   *   iv: '',
   *   inputEncode: 'hex',
   *   keyEncode: 'base64',
   *   ivEncode: 'utf8',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: RabbitLegacyOptions): string => {
    const {
      src,
      key,
      iv,
      inputEncode = 'utf8',
      keyEncode = 'utf8',
      ivEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (src === '') return '';
    if (key === '') {
      throw new Error('Key is required for RabbitLegacy encryption');
    }

    const k = parse[keyEncode](key);
    const v = iv ? parse[ivEncode](iv) : undefined;

    if (k.sigBytes !== 16) throw new Error('Key must be 128 bytes');
    if (iv && v.sigBytes !== 8) throw new Error('IV must be 64 bytes');

    const ciphertext = parse[inputEncode](src);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.RabbitLegacy.decrypt(cipherParams, k);
    return stringify[outputEncode](decrypted);
  },
};
