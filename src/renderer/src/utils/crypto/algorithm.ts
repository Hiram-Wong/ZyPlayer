import crypto from 'crypto-js';
import WxmpRsa from 'wxmp-rsa';
import * as smCrypto from 'sm-crypto-v2';
import {
  utf8ToUint8Array,
  uint8ArrayToUtf8,
  latin1ToUint8Array,
  uint8ArrayToLatin1,
  uint8ArrayToBase64,
  base64ToUint8Array,
  hexToUint8Array,
  uint8ArrayToHex,
} from './utils';

const parseEncode = (value: string, encoding: string) => {
  switch (encoding) {
    case 'base64':
      return crypto.enc.Base64.parse(value);
    case 'hex':
      return crypto.enc.Hex.parse(value);
    case 'latin1':
      return crypto.enc.Latin1.parse(value);
    case 'utf8':
    default:
      return crypto.enc.Utf8.parse(value);
  }
};

const formatEncode = (value: any, encoding: string) => {
  switch (encoding.toLowerCase()) {
    case 'base64':
      return value.toString(); // 整个CipherParams对象(含原数据), 默认输出 Base64
    case 'hex':
      return value.ciphertext.toString(); // ciphertext属性(仅密文), 默认输出 Hex
  }
};

const formatDecode = (value: any, encoding: string) => {
  switch (encoding.toLowerCase()) {
    case 'base64':
      return value.toString(crypto.enc.Base64);
    case 'hex':
      return value.toString(crypto.enc.Hex);
    case 'utf8':
    default:
      return value.toString(crypto.enc.Utf8);
  }
};

const getMode = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'cfb':
      return crypto.mode.CFB;
    case 'ofb':
      return crypto.mode.OFB;
    case 'ctr':
      return crypto.mode.CTR;
    case 'ecb':
      return crypto.mode.ECB;
    case 'cbc':
    default:
      return crypto.mode.CBC;
  }
};

const getPad = (padding: string) => {
  switch (padding.toLowerCase()) {
    case 'pkcs5padding':
    case 'pkcs7padding':
      return crypto.pad.Pkcs7;
    case 'ansix923':
      return crypto.pad.AnsiX923;
    case 'iso10126':
      return crypto.pad.Iso10126;
    case 'iso97971':
      return crypto.pad.Iso97971;
    case 'nopadding':
      return crypto.pad.NoPadding;
    case 'zeropadding':
    default:
      return crypto.pad.ZeroPadding;
  }
};

const rc4 = {
  encode: (
    src: string,
    key: string,
    encoding: string = 'utf8',
    keyEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (!key || !src) return '';

    const k = parseEncode(key, keyEncoding);
    // if (k.sigBytes > 256 || k.sigBytes < 5) return '';

    let plaintext = parseEncode(src, encoding);
    let encrypted = crypto.RC4.encrypt(plaintext, k);
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    encoding: string = 'utf8',
    keyEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (!key || !src) return '';

    const k = parseEncode(key, keyEncoding);
    // if (v.sigBytes > 256 || v.sigBytes < 5) return '';

    const ciphertext = parseEncode(src, encoding);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });
    const decrypted = crypto.RC4.decrypt(cipherParams, k);
    return formatDecode(decrypted, outputEncode);
  },
};

const aes = {
  encode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    let k = parseEncode(key, keyEncoding);
    let v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (![16, 24, 32].includes(k.sigBytes)) return '';
    if (mode !== 'ecb' && v.sigBytes !== 16) return '';

    let plaintext = parseEncode(src, encoding);
    let encrypted = crypto.AES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    let k = parseEncode(key, keyEncoding);
    let v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (![16, 24, 32].includes(k.sigBytes)) return '';
    if (mode !== 'ecb' && v.sigBytes !== 16) return '';

    const ciphertext = parseEncode(src, encoding);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });
    const decrypted = crypto.AES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatDecode(decrypted, outputEncode);
  },
};

const des = {
  encode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 8) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const plaintext = parseEncode(src, encoding);
    const encrypted = crypto.DES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 8) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.DES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatDecode(decrypted, outputEncode);
  },
};

const tripleDES = {
  encode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 24) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const plaintext = parseEncode(src, encoding);
    const encrypted = crypto.TripleDES.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 24) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.TripleDES.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatDecode(decrypted, outputEncode);
  },
};

const rabbit = {
  encode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 16) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const plaintext = parseEncode(src, encoding);
    const encrypted = crypto.Rabbit.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 16) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.Rabbit.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatDecode(decrypted, outputEncode);
  },
};

const rabbitLegacy = {
  encode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 16) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const plaintext = parseEncode(src, encoding);
    const encrypted = crypto.RabbitLegacy.encrypt(plaintext, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatEncode(encrypted, outputEncode);
  },
  decode: (
    src: string,
    key: string,
    mode: string,
    padding: string,
    encoding: string,
    iv: string,
    keyEncoding: string = 'utf8',
    ivEncoding: string = 'utf8',
    outputEncode: string = 'base64',
  ) => {
    if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
    if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

    const k = parseEncode(key, keyEncoding);
    const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

    if (k.sigBytes !== 16) return '';
    if (mode !== 'ecb' && v.sigBytes !== 8) return '';

    const ciphertext = encoding === 'base64' ? crypto.enc.Base64.parse(src) : crypto.enc.Hex.parse(src);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.RabbitLegacy.decrypt(cipherParams, k, {
      iv: v,
      mode: getMode(mode),
      padding: getPad(padding),
    });
    return formatDecode(decrypted, outputEncode);
  },
};

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
          return uint8ArrayToHex(base64ToUint8Array(encrypted));
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
          bytes = uint8ArrayToBase64(hexToUint8Array(ciphertext));
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

const sm4 = (() => {
  const getMode = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'ecb':
        return 'ecb';
      case 'cbc':
      default:
        return 'cbc';
    }
  };
  const getPad = (padding: string) => {
    switch (padding.toLowerCase()) {
      case 'nopadding':
        return 'none';
      case 'pkcs5padding':
      case 'pkcs7padding':
      default:
        return 'pkcs#7';
    }
  };
  const parseEncode = (value: string, encoding: string): Uint8Array => {
    switch (encoding.toLowerCase()) {
      case 'base64':
        return base64ToUint8Array(value);
      case 'hex':
        return hexToUint8Array(value);
      case 'latin1':
        return latin1ToUint8Array(value);
      case 'utf8':
      default:
        return utf8ToUint8Array(value);
    }
  };
  const formatDecode = (value: Uint8Array, encoding: string): string => {
    switch (encoding.toLowerCase()) {
      case 'utf8':
        return uint8ArrayToUtf8(value);
      case 'hex':
        return uint8ArrayToHex(value);
      case 'latin1':
        return uint8ArrayToLatin1(value);
      case 'base64':
      default:
        return uint8ArrayToBase64(value);
    }
  };
  return {
    encode: (
      src: string,
      key: string,
      mode: string,
      padding: string,
      encoding: string,
      iv: string,
      keyEncoding: string = 'utf8',
      ivEncoding: string = 'utf8',
      outputEncode: string = 'base64',
    ) => {
      if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
      if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

      const k = parseEncode(key, keyEncoding);
      const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

      if (k.length !== 16) return '';
      if (mode !== 'ecb' && v?.length !== 16) return '';
      const plaintext = parseEncode(src, encoding);
      const encrypted = smCrypto.sm4.encrypt(plaintext, k, {
        iv: v,
        mode: getMode(mode),
        padding: getPad(padding),
        output: 'array',
      });
      return formatDecode(encrypted, outputEncode);
    },
    decode: (
      src: string,
      key: string,
      mode: string,
      padding: string,
      encoding: string,
      iv: string,
      keyEncoding: string = 'utf8',
      ivEncoding: string = 'utf8',
      outputEncode: string = 'base64',
    ) => {
      if (!['base64', 'hex'].includes(encoding.toLowerCase())) return '';
      if (key === '' || src === '' || (mode.toLowerCase() !== 'ecb' && iv === '')) return '';

      const k = parseEncode(key, keyEncoding);
      const v = mode.toLowerCase() !== 'ecb' ? parseEncode(iv, ivEncoding) : undefined;

      if (k.length !== 16) return '';
      if (mode !== 'ecb' && v?.length !== 16) return '';

      const ciphertext = parseEncode(src, encoding);
      const decrypted = smCrypto.sm4.decrypt(ciphertext, k, {
        iv: v,
        mode: getMode(mode),
        padding: getPad(padding),
        output: 'array',
      });
      return formatDecode(decrypted, outputEncode);
    },
  };
})();

export {
  rsa,
  rc4,
  aes,
  des,
  tripleDES,
  rabbit,
  rabbitLegacy,
  sm4,
}
