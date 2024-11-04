import {
  aes as aesModule,
  base64 as base64Module,
  crypto as cryptoModule,
  hash as hashModule,
  rc4 as rc4Module,
  rsa as rsaModule,
} from '../crypto';
import gbkModule from './gbk';

/**
 * 将字符串转换为Base64编码
 * @param {string} val - 要编码的字符串
 * @returns {string} - 编码后的Base64字符串
 */
const base64Encode = (val: string) => base64Module.encode(val);
/**
 * 将Base64编码转换为字符串
 * @param {string} val - 要解码的Base64字符串
 * @returns {string} - 解码后的字符串
 */
const base64Decode = (val: string) => base64Module.decode(val);

/**
 * 将字符串转换为指定长度的补位字符串
 * @param {string} val - 要处理的字符串
 * @param {number} size - 目标长度
 * @param {string} padChar - 补位字符，默认为'0'
 * @param {string} padDirection - 补位方向，默认为'end'，可选值为'start'或'end'
 * @returns {string} - 补位后的字符串
 */
const padString = (val: string, size: number, padChar: string = '0', padDirection: 'start' | 'end' = 'end') => {
  const requiredLength = size;
  const currentLength = val.length;
  const diff = requiredLength - currentLength;

  if (diff <= 0) {
    return val;
  }

  let padding = '';
  for (let i = 0; i < diff; i++) {
    padding += padChar;
  }

  if (padDirection === 'end') {
    return val + padding;
  } else if (padDirection === 'start') {
    return padding + val;
  }

  return val + padding;
};

/**
 * 将字符串转换为AES加密后的Base64编码
 * model: 'ecb' padding: 'Pkcs5Padding' iv: ''
 * @param {string} key - AES加密的密钥
 * @param {string} val - 要加密的字符串
 * @returns {string} - 加密后的Base64字符串
 */
const aesEncode = (key: string, val: string) =>
  aesModule.encode(val, padString(key, 32, '0', 'end'), 'ecb', 'Pkcs5Padding', 'base64', '');
/**
 * 将AES加密后的Base64编码转换为字符串
 * model: 'ecb' padding: 'Pkcs5Padding' iv: ''
 * @param {string} key - AES解密密钥
 * @param {string} val - 要解密的Base64字符串
 * @returns {string} - 解密后的字符串
 */
const aesDecode = (key: string, val: string) =>
  aesModule.decode(val, padString(key, 32, '0', 'end'), 'ecb', 'Pkcs5Padding', 'base64', '');

/**
 * 将字符串转换为指定解码的字符串
 * @param {string} val - 要解码的字符串
 * @param {string} encoding - 结果编码，默认为'utf8'，可选值为'utf8'、'gbk'、'gb2312'
 * @returns {string} - 解码后的字符串
 */
const decodeStr = (val: string, encoding: 'utf8' | 'gbk' | 'gb2312' = 'gbk') => {
  const strTool = gbkModule();

  switch (encoding) {
    case 'utf8':
      return decodeURIComponent(val);
    case 'gbk':
    case 'gb2312':
      return strTool.decode(val);
    default:
      return val;
  }
};
/**
 * 将字符串转换为指定编码的字符串
 * @param {string} val - 要编码的字符串
 * @param {string} encoding - 目标编码，默认为'gbk'，可选值为'utf8'、'gbk'、'gb2312'
 * @returns {string} - 编码后的Base64字符串
 */
const encodeStr = (val: string, encoding: 'utf8' | 'gbk' | 'gb2312' = 'gbk') => {
  const strTool = gbkModule();

  switch (encoding) {
    case 'utf8':
      return encodeURIComponent(val);
    case 'gbk':
    case 'gb2312':
      return strTool.encode(val);
    default:
      return val;
  }
};

interface RSAOption {
  config?: 'RSA' | 'ECB' | 'PKCS1Padding';
  type?: 1 | 2;
  long?: 1 | 2;
  block?: number | boolean;
}

const rsaEncrypt = (val: string, key: string, options: RSAOption = {}) => {};

const rsaDecrypt = (val: string) => {};

/**
 * 暴露CryptoJS对象，用于在js代码中直接使用CryptoJS加密解密等方法
 */
const CryptoJS = cryptoModule;

/**
 * 计算字符串的MD5值
 * @param {string} val - 要计算的字符串
 * @returns {string} - MD5值
 */
const md5 = (val: string) => hashModule['md5-32'](val);

/**
 * 复刻android.util.Base64
 */
const _base64 = {
  decodeToString: function (val: string, flags: string) {
    // Buffer.from不关心换行符
    let data = val;
    switch (flags) {
      case 'NO_CLOSE':
        data = '';
        break;
      case 'CRLF':
        data = val.replace(/\r\n/g, '\n');
        break;
      case 'URL_SAFE':
        data = val.replace(/\-/g, '+');
        break;
      case 'NO_PADDING':
        const paddingNeeded = 4 - (val.length % 4);
        if (paddingNeeded === 4) {
          data = val;
        } else data = val + '='.repeat(paddingNeeded);
        break;
      case 'NO_WRAP':
      case 'DEFAULT':
      default:
        data = val;
        break;
    }
    return Buffer.from(data, 'base64').toString('utf-8');
  },
  encodeToString: function (val: string, flags: string) {
    const base64String = Buffer.from(val, 'utf-8').toString('base64');
    let formattedBase64String = '';
    for (let i = 0; i < base64String.length; i += 76) {
      formattedBase64String += base64String.substring(i, i + 76) + '\n';
    }
    formattedBase64String = formattedBase64String.slice(0, -1);

    switch (flags) {
      case 'NO_CLOSE':
        return '';
      case 'CRLF':
        return formattedBase64String.replace(/\n/g, '\r\n');
      case 'URL_SAFE':
        return formattedBase64String.replace(/\+/g, '-');
      case 'NO_PADDING':
        return formattedBase64String.replace(/=+$/, '');
      case 'NO_WRAP':
        return formattedBase64String.replace(/(\r\n|\r|\n)/g, '');
      case 'DEFAULT':
      default:
        return formattedBase64String;
    }
  },
  encode: function (val: string, flags: string) {
    return Buffer.from(this.encodeToString(val, flags));
  },
  decode: function (val: string, flags: string) {
    return Buffer.from(this.decodeToString(val, flags));
  },
};
const base64java = _base64.decode;

/**
 * 将16进制字符串转换为Uint8Array
 * @param {string} val - 16进制字符串  如:'e4bda0e5a5bde7be8ee5a5b3'
 * @returns {Uint8Array} - 转换后的Uint8Array对象  如:[228, 189, 160, 229, 165, 189, 231, 190, 142, 229, 165, 179 ]
 */
const hexToBytes = (val: string) => {
  val = val.replace(/\s/g, '');
  // 确保长度为偶数
  if (val.length % 2 !== 0) return '';
  // 创建一个与16进制字符串长度相匹配的Uint8Array
  const length = val.length / 2;
  const uint8Array = new Uint8Array(length);
  // 将16进制字符串转换为Uint8Array
  for (let i = 0, j = 0; i < length; i++, j += 2) {
    uint8Array[i] = parseInt(val.substring(j, j + 2), 16);
  }
  return uint8Array;
};

/**
 * 将16进制字符串转换为Base64字符串
 * @param {string} val - 16进制字符串  如:'e4bda0e5a5bde7be8ee5a5b3'
 * @returns {string} - 转换后的Base64字符串  如:'5L2g5aW9576O5aWz'
 */
const hexToBase64 = (val: string) => {
  let hexStr = val;
  hexStr = hexStr.replace(/\s/g, '');

  if (hexStr.length % 2 !== 0) return '';

  const buffer = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < hexStr.length; i += 2) {
    const byteValue = parseInt(hexStr.substring(i, i + 2), 16);
    buffer[i / 2] = byteValue;
  }

  const base64Str = base64Decode(String.fromCharCode.apply(null, Array.from(buffer)));

  return base64Str;
};

/**
 * 模拟window对象，用于解析js代码
 */
const window0 = {
  btoa: (val: string) => base64Module.btoa(val),
  atob: (val: string) => base64Module.atob(val),
};

const rc4 = {
  encode: (val: string, key: string = '') => rc4Module.encode(val, key),
  decode: (val: string, key: string = '') => rc4Module.decode(val, key),
};

export {
  base64Encode,
  base64Decode,
  aesEncode,
  aesDecode,
  decodeStr,
  encodeStr,
  rsaEncrypt,
  rsaDecrypt,
  md5,
  base64java,
  _base64,
  hexToBytes,
  hexToBase64,
  window0,
  rc4,
};
