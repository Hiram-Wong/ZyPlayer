import { Buffer } from 'buffer';
import crypto from 'crypto-js';
import * as he from 'he';
import pako from 'pako';
import WxmpRsa from 'wxmp-rsa';

const base64 = {
  decode: (val: string) => {
    try {
      return crypto.enc.Utf8.stringify(crypto.enc.Base64.parse(val));
    } catch (err) {
      throw Error('Base64 decoding failed');
    }
  },
  encode: (val: string) => {
    try {
      return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(val));
    } catch (err) {
      throw Error('Base64 encoding failed');
    }
  },
  btoa: function (val: string) {
    try {
      const isAllAscii = (val: string) => {
        return val.split('').every((char) => {
          const code = char.charCodeAt(0);
          return code >= 0 && code <= 127;
        });
      };
      if (!isAllAscii(val)) throw Error('btoa contains has illegal characters');
      return this.encode(val);
    } catch (err) {
      throw err;
    }
  },
  atob: function (val: string) {
    return this.decode(val);
  },
};

const hash = {
  'md5-16': (val: string) => crypto.MD5(val).toString().substr(8, 16),
  'md5-32': (val: string) => crypto.MD5(val).toString(),
  sha1: (val: string) => crypto.SHA1(val).toString(),
  sha224: (val: string) => crypto.SHA224(val).toString(),
  sha256: (val: string) => crypto.SHA256(val).toString(),
  sha3: (val: string) => crypto.SHA3(val).toString(),
  sha384: (val: string) => crypto.SHA384(val).toString(),
  sha512: (val: string) => crypto.SHA512(val).toString(),
};

const html = {
  encode: (val: string) => he.encode(val, { encodeEverything: true }),
  decode: (val: string) => he.decode(val),
};

const unicode = {
  encode: (val: string) => {
    const encodeUnicode = (val: string) => {
      const res: any[] = [];
      for (let i = 0; i < val.length; i++) {
        res[i] = ('00' + val.charCodeAt(i).toString(16)).slice(-4);
      }
      return '\\u' + res.join('\\u');
    };
    return encodeUnicode(val);
  },
  decode: (val: string) => {
    const decodeUnicode = (val: string) => {
      val = val.replace(/\\/g, '%');
      return unescape(val);
    };
    return decodeUnicode(val);
  },
};

const gzip = {
  encode: (val: string) => Buffer.from(pako.gzip(val, {})).toString('base64'),
  decode: (val: string) => {
    try {
      const buffer = Buffer.from(val, 'base64');
      const uint8Array = new Uint8Array(buffer);
      const decompressed = pako.ungzip(uint8Array);
      return new TextDecoder().decode(decompressed);
    } catch (err) {
      throw Error('Gzip decoding failed');
    }
  },
};

const url = {
  encode: (val: string) => encodeURIComponent(val),
  decode: (val: string) => decodeURIComponent(val),
};

const hex = {
  decode: (val: string) => Buffer.from(val, 'hex').toString('utf-8'),
  encode: (val: string) => Buffer.from(val, 'utf-8').toString('hex'),
};

const rc4 = {
  encode: (val: string, key: string = '') => crypto.RC4.encrypt(val, key).toString(),
  decode: (val: string, key: string = '') => crypto.RC4.decrypt(val, key).toString(crypto.enc.Utf8),
};

const aes = (() => {
  const getMode = (mode: string) => {
    switch (mode) {
      case 'cbc':
        return crypto.mode.CBC;
      case 'cfb':
        return crypto.mode.CFB;
      case 'ofb':
        return crypto.mode.OFB;
      case 'ctr':
        return crypto.mode.CTR;
      case 'ecb':
        return crypto.mode.ECB;
      default:
        return crypto.mode.CBC;
    }
  };
  const getPadding = (padding: string) => {
    switch (padding) {
      case 'ZeroPadding':
        return crypto.pad.ZeroPadding;
      case 'Pkcs5Padding':
        return crypto.pad.Pkcs7;
      case 'Pkcs7Padding':
        return crypto.pad.Pkcs7;
      case 'AnsiX923':
        return crypto.pad.AnsiX923;
      case 'Iso10126':
        return crypto.pad.Iso10126;
      case 'Iso97971':
        return crypto.pad.Iso97971;
      case 'NoPadding':
        return crypto.pad.NoPadding;
      default:
        return crypto.pad.ZeroPadding;
    }
  };
  return {
    encode: (src: string, key: string, mode: string, padding: string, encoding: string, iv: string) => {
      if (key === '' || src === '' || (mode !== 'ecb' && iv === '')) {
        return '';
      }
      if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
        return '';
      }
      if (mode !== 'ecb' && iv.length !== 16) {
        return '';
      }

      let k = crypto.enc.Utf8.parse(key);
      let plaintext = crypto.enc.Utf8.parse(src);
      let encrypted = crypto.AES.encrypt(plaintext, k, {
        iv: mode !== 'ecb' ? crypto.enc.Utf8.parse(iv) : undefined,
        mode: getMode(mode),
        padding: getPadding(padding),
      });
      const result = encoding === 'base64' ? encrypted.toString() : encrypted.ciphertext.toString();
      return result;
    },
    decode: (src: string, key: string, mode: string, padding: string, encoding: string, iv: string) => {
      if (key === '' || src === '' || (mode !== 'ecb' && iv === '')) {
        return '';
      }
      if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
        return '';
      }
      if (mode !== 'ecb' && iv.length !== 16) {
        return '';
      }

      let k = crypto.enc.Utf8.parse(key);
      let result: string = '';
      let ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
      let cipherParams = crypto.lib.CipherParams.create({
        ciphertext: ciphertext,
      });
      let decrypted = crypto.AES.decrypt(cipherParams, k, {
        iv: mode !== 'ecb' ? crypto.enc.Utf8.parse(iv) : undefined,
        mode: getMode(mode),
        padding: getPadding(padding),
      });
      try {
        result = decrypted.toString(crypto.enc.Utf8);
      } catch {
        result = '';
      }
      return result;
    },
  };
})();

const des = (() => {
  const getMode = (mode: string) => {
    switch (mode) {
      case 'cbc':
        return crypto.mode.CBC;
      case 'cfb':
        return crypto.mode.CFB;
      case 'ofb':
        return crypto.mode.OFB;
      case 'ctr':
        return crypto.mode.CTR;
      case 'ecb':
        return crypto.mode.ECB;
      default:
        return crypto.mode.CBC;
    }
  };
  const getPadding = (padding: string) => {
    switch (padding) {
      case 'ZeroPadding':
        return crypto.pad.ZeroPadding;
      case 'Pkcs5Padding':
        return crypto.pad.Pkcs7;
      case 'Pkcs7Padding':
        return crypto.pad.Pkcs7;
      case 'AnsiX923':
        return crypto.pad.AnsiX923;
      case 'Iso10126':
        return crypto.pad.Iso10126;
      case 'Iso97971':
        return crypto.pad.Iso97971;
      case 'NoPadding':
        return crypto.pad.NoPadding;
      default:
        return crypto.pad.ZeroPadding;
    }
  };
  return {
    encode: (src: string, key: string, mode: string, padding: string, encoding: string, iv: string) => {
      if (key === '' || src === '' || (mode !== 'ecb' && iv === '')) {
        return '';
      }

      if (key.length !== 8) {
        return '';
      }

      if (mode !== 'ecb' && iv.length !== 8) {
        return '';
      }

      let k = crypto.enc.Utf8.parse(key);
      let plaintext = crypto.enc.Utf8.parse(src);
      let encrypted = crypto.DES.encrypt(plaintext, k, {
        iv: mode !== 'ecb' ? crypto.enc.Utf8.parse(iv) : undefined,
        mode: getMode(mode),
        padding: getPadding(padding),
      });
      return encoding === 'base64' ? encrypted.toString() : encrypted.ciphertext.toString();
    },
    decode: (src: string, key: string, mode: string, padding: string, encoding: string, iv: string) => {
      let ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
      let cipherParams = crypto.lib.CipherParams.create({
        ciphertext: ciphertext,
      });
      let k = crypto.enc.Utf8.parse(key);
      let decrypted = crypto.DES.decrypt(cipherParams, k, {
        iv: mode !== 'ecb' ? crypto.enc.Utf8.parse(iv) : undefined,
        mode: getMode(mode),
        padding: getPadding(padding),
      });
      let result: string = '';
      try {
        result = decrypted.toString(crypto.enc.Utf8);
      } catch {
        result = '';
      }

      return result;
    },
  };
})();

const rsa = (() => {
  const isValidHex = (str: string) => {
    return /^[0-9A-Fa-f]+$/.test(str);
  };
  const isValidBase64 = (str: string) => {
    return /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(str);
  };
  return {
    encode: (
      plaintext: string,
      key: string,
      padding: string,
      encoding: string,
      type: 1 | 2,
      long: 1 | 2 = 1,
      block: boolean = true,
    ) => {
      if (plaintext === '') {
        return '';
      }
      let encrypted: string;

      try {
        const encryptor = new WxmpRsa();
        type === 1 ? encryptor.setPublicKey(key) : encryptor.setPrivateKey(key);
        encrypted = encryptor.encryptLong(plaintext);
      } catch (error) {
        const err = error as Error;
        console.log(err);
        return '';
      }
      switch (encoding) {
        case 'hex':
          return Buffer.from(encrypted, 'base64').toString('hex');
        case 'base64':
          return encrypted;
        default:
          console.log('未知的编码格式！');
          return '';
      }
    },
    decode: (
      ciphertext: string,
      key: string,
      padding: string,
      encoding: string,
      type: 1 | 2,
      long: 1 | 2 = 1,
      block: boolean = true,
    ) => {
      if (key === null) {
        return '';
      }
      if (ciphertext === '') {
        return '';
      }

      let bytes: string;
      switch (encoding) {
        case 'hex':
          if (!isValidHex(ciphertext)) {
            return '';
          }
          bytes = Buffer.from(ciphertext, 'hex').toString('base64');
          break;
        case 'base64':
          if (!isValidBase64(ciphertext)) {
            return '';
          }
          bytes = ciphertext;
          break;
        default:
          return '';
      }

      let decrypted: string;
      try {
        const encryptor = new WxmpRsa();
        type === 1 ? encryptor.setPrivateKey(key) : encryptor.setPublicKey(key);
        decrypted = encryptor.decryptLong(bytes);
      } catch (error) {
        const err = error as Error;
        console.log(err);
        return '';
      }
      return decrypted;
    },
  };
})();

export { aes, base64, crypto, des, gzip, hash, html, rc4, rsa, unicode, url, hex };
