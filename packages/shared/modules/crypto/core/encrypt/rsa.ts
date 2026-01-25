import { md, pki } from 'node-forge';

import type { RsaOptions } from '../../type';
import { arrayToBytes as forgeArrayToBytes, stringify as forgeStringify } from '../../utils/forge';
import { parse as wordArrayParse, wordArrayToArray } from '../../utils/wordArray';

const PUB_REGEX = /^-----BEGIN PUBLIC KEY-----[\s\S]+?-----END PUBLIC KEY-----[\s\S]*$/;
const PRI_REGEX =
  /^-----BEGIN (?:RSA |ENCRYPTED )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |ENCRYPTED )?PRIVATE KEY-----[\s\S]*$/;

const getPad = (pad: string) => {
  switch (pad.toLowerCase()) {
    case 'rsa-oaep':
    case 'rsa-oaep-sha1':
    case 'rsa-oaep-sha256':
    case 'rsa-oaep-sha384':
    case 'rsa-oaep-sha512':
    case 'rsa-oaep-md5':
      return 'RSA-OAEP';
    case 'rsaes-pkcs1-v1_5':
      return 'RSAES-PKCS1-V1_5';
    case 'nopadding':
    default:
      return 'RAW';
  }
};

/**
 * RSA 加密/解密工具对象
 */
export const rsa = {
  /**
   * RSA 加密 - 不支持私钥加密
   * https://emn178.github.io/online-tools/rsa/encrypt/
   * https://rivers.chaitin.cn/toolkit/cyberChef/RSAEncrypt
   * http://tool.chacuo.net/cryptrsapubkey
   * https://the-x.cn/cryptography/Rsa.aspx
   * https://www.toolzl.com/tools/testrsa.html
   *
   * @param {RsaOptions} options - 加密参数
   * @returns {string} - 加密结果
   *
   * @example
   * rsa.encode({
   *   src: 'this is an example',
   *   key: `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtT8DozafVIYR3Xim2GQX
        TRN0Y/LOh6iwX9xnBwDv+dmEvgJ9J7EDyzkubzsRPGsD+QPtim0Pf4qFat0g2nZb
        0VdTPWubYif2dS6R+I7Orw9khaXAGl6TS3DB1hc66u4EKx2v2dHLIhXj580T1VlY
        SU6+mibO2Lxj0NQfTKlYr9IHo2MnFwVJxCXuxv2hSn5WQT0eQRV1NpxPmeV5soHg
        mDjhqEc4S+2fH1LD73IVkqtZtgkhw3t2kZQWiX7jPWcydKMisG+s7SPNKDq1EMTq
        yCIKiJRUvLfZV1GRSaeYw5clbbxcoPIGv2L7iq/NrbZCWgQs6Bk88p8lJaK77HOl
        AQIDAQAB
        -----END PUBLIC KEY-----
      `,
   *   passphrase: 'zy',
   *   type: 0,
   *   pad: 'rsaes-pkcs1-v1_5',
   *   passphraseEncode: 'utf8',
   *   inputEncode: 'utf8',
   *   outputEncode: 'hex',
   * });
   *  => 091ddc4bb40a8acfaace3585bfb0e78ef3e69a7e4abe9abad9ebce6a8c76aca8887d018ef830a93575c37d1ff132a0ee8055e4e549982d36cf56bb39f6a9f59dad5457cb70ae22be44a3dccd5e03c56a41c975edb7d8134b73d511ec02fa170ac9e12b0aa703cc543ee439276bf16a65cfb2217ff1b7f2069bd1cbbfdb6486a5f42c061f7a59a1468bca612d29eefa83b664987f62d88d621f4568be335d11b71bacbdf6798bf0ac9a5c9fde298255bbf1aca8e5047caeec9f9da7d7b717a9cd3d7ccfa0b6029cf94c99a3ffd17e359391668a11d14a6e4da132d870a4ce4addba22e7fe9c3b90df9e908e796d4a10ea33d86c22ba2af320ee096f6ceaf6e5e7
   *  => nKuZeJClPhChgZRwHwuREXz044ty8lYwOIIOY6fM1PhivBef60t6VfcBNsaHYT9OpNFuu7thcD5GT9ritD8pZbcJFWzcAXm3ica3TJUJ1acXrb7OBJhT9qS2+fB61x3T79U5hY9uVfDwctCNruQWeA96TD8unPc8B/hTioRVfFeqxSYcMn2urO0LQ49TvvYsOATcIEaeweaBDoEiwNjiyWJT6b258t9qD1AiCFzCEX1we0eOmRsL3qpuvGE5vK0KL5pRZDUJOg1GTrGOMcRcfzVWTMBABuy9HsvbA4ezQZ0LS96lB7hqxPG01CV8J+aCD3PLL5XFzOIXnFLs4f3t3g==
   */
  encode: (options: RsaOptions): string => {
    const {
      src,
      key,
      passphrase = '',
      type = 0,
      long = false,
      pad = 'rsaes-pkcs1-v1_5',
      passphraseEncode = 'utf8',
      inputEncode = 'utf8',
      outputEncode = 'base64',
    } = options;

    if (!['base64', 'hex'].includes(outputEncode.toLowerCase())) return '';
    if (!src || !key) return '';

    let rsaKey: pki.rsa.PublicKey | pki.rsa.PrivateKey;
    if (type === 0) {
      if (!PUB_REGEX.test(key)) throw new Error('Key is not a valid public key');

      rsaKey = pki.publicKeyFromPem(key);
    } else if (type === 1) {
      if (!PRI_REGEX.test(key)) throw new Error('Key is not a valid private key');

      if (key.includes('ENCRYPTED')) {
        if (!passphrase) throw new Error('Passphrase is required for encrypted private key');

        const passphraseBuffer = wordArrayParse[passphraseEncode](passphrase);
        rsaKey = pki.decryptRsaPrivateKey(key, forgeArrayToBytes(wordArrayToArray(passphraseBuffer)).getBytes());
      } else {
        rsaKey = pki.privateKeyFromPem(key);
      }
    }

    const srcBuffer = wordArrayParse[inputEncode](src);

    const padding = getPad(pad);
    let schemeOptions = {};
    if (padding === 'RSA-OAEP' && pad.toLowerCase() !== 'rsa-oaep') {
      const algorithm = pad.toLowerCase().replace('rsa-oaep-', '') || 'sha1';
      if (!['md5', 'sha1', 'sha256', 'sha384', 'sha512'].includes(algorithm)) {
        throw new Error(`Unsupported RSA-OAEP algorithm: ${algorithm}`);
      }

      schemeOptions = {
        md: md[algorithm].create(),
        mgf1: {
          md: md[algorithm].create(),
        },
      };
    }

    let encrypted = '';
    if (long) {
      const chunks = wordArrayToArray(srcBuffer);
      const chunkLength = chunks.length;
      let offSet = 0;

      // 根据RSA密钥长度和填充方式确定最大加密块大小
      // 对于2048位密钥，PKCS#1 v1.5填充最大为245字节，OAEP填充最大为214字节
      // 这里根据填充方式动态调整块大小
      const MAX_ENCRYPT_BLOCK = padding === 'RSA-OAEP' ? 117 : 117;

      const encryptedChunks: string[] = [];

      while (offSet < chunkLength) {
        let end = offSet + MAX_ENCRYPT_BLOCK;
        if (end > chunkLength) {
          end = chunkLength;
        }

        const chunk = chunks.slice(offSet, end);

        const encryptedChunk = rsaKey.encrypt(forgeArrayToBytes(chunk).getBytes(), padding as any, schemeOptions);
        encryptedChunks.push(encryptedChunk);

        offSet += MAX_ENCRYPT_BLOCK;
      }

      encrypted = encryptedChunks.join('');
    } else {
      encrypted = rsaKey.encrypt(
        forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes(),
        padding as any,
        schemeOptions,
      );
    }

    return forgeStringify[outputEncode](encrypted);
  },

  /**
   * RSA 解密 - 支持长解密
   * https://emn178.github.io/online-tools/rsa/decrypt/
   * https://rivers.chaitin.cn/toolkit/cyberChef/RSADecrypt
   * http://tool.chacuo.net/cryptrsaprikey
   *
   * @param {RsaOptions} options - 解密参数
   * @returns {string} - 解密结果
   *
   * @example
   * rsa.decode({
   *   src: '091ddc4bb40a8acfaace3585bfb0e78ef3e69a7e4abe9abad9ebce6a8c76aca8887d018ef830a93575c37d1ff132a0ee8055e4e549982d36cf56bb39f6a9f59dad5457cb70ae22be44a3dccd5e03c56a41c975edb7d8134b73d511ec02fa170ac9e12b0aa703cc543ee439276bf16a65cfb2217ff1b7f2069bd1cbbfdb6486a5f42c061f7a59a1468bca612d29eefa83b664987f62d88d621f4568be335d11b71bacbdf6798bf0ac9a5c9fde298255bbf1aca8e5047caeec9f9da7d7b717a9cd3d7ccfa0b6029cf94c99a3ffd17e359391668a11d14a6e4da132d870a4ce4addba22e7fe9c3b90df9e908e796d4a10ea33d86c22ba2af320ee096f6ceaf6e5e7',
   *   key: `-----BEGIN ENCRYPTED PRIVATE KEY-----
        MIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQIDmaxKA1sPuECAggA
        MBQGCCqGSIb3DQMHBAiQ+zejUc+vvASCBMh+wCmZc8Z6eTuuxO2Vk+0u2eyEh5YF
        ysJ450CFlBP6XT8XLB3YkvhFYJPAE1GcBe0MJjRcRGDsE+XINwOqzALbdwAXEVcF
        gMCvDnG0SR2Q4oEmZd02ExgcbI3098V7kVMQkXH0DHzquH6QQJjxPKkLgA5B6VAn
        c+lmpTsduHossG3Xtl1RSchcOiBsTcOgrcRacVx/gD9PIEbzyoHD0tz0R7HEIZJ2
        ZJ4lbRBGgNPPo6VxPKel6mIfGCfWQpKTc8OVKnHxk3WPmmLssxsMHNMP2SGY8JzG
        WseO479YV+PkR9iSEJj4hvBVW1vIzX1JIrva2RTowBE3T8M/r/p+zdFFoKvOjvDf
        Ko4nrOp8dQ86qTo1vjwxjOTJNhqDFhLz6JXaz9613sVBISbhbVRrvqgrhe2ZcUjt
        y8iN1ajLe/5mWY3Pj9nnKmZC4ZuXYquOgNayjxGNR/F7oaJLETNkTZ/zQJYvyq5A
        PqvdPWSsNDex7K46F0Gpte5B9NZrISN4/BL9QX4tQFBOoXsCWqyA0Vjk6BE0uFZg
        nsHCPMNjNr1LjniXBM8uHysEvSfEV2YFu8gZSkKvmjEPwWePvV5JMV0js1rtV8Bs
        u58lIV+iQ8W5TxCu2Bm+wXd3z1ylNrboteAwpe6onz53RWRNLr215WIh8Rqo+xUE
        qlJ3W5Oim/lwnnafd5lcSPLFgvkrhiDtLmZOJZxP28Kty0JvIapi93sXBClZim5Q
        swgo/BKt0zxa1g9c/Wrn5UBXnUu59LSIro50vrcF77r/awhmvnjtm5ocQdhmFshp
        oHXbcgXAFIfIJkRcLT58bm0Yvzw7lTmB0cpg6+eN3CrqlWDOtzDgSY3hPii/aIQq
        sxSL7OufYUaGY1p2N/r/ZRlGGsdgATUYhkllD+9pIZbwRDjfmkmI11xm+FKarkFK
        1/wagJpyu8WXO1BhzwZXxS7HWN6RwfL8aF94gPrb1XzFJgL8PTWNWtjWWcY5cN0f
        p/hzgJ8rj9iMycBj7hNoDF+L6jZRIQ/N67AMDXW7YrmQQG+KvSGckisJzNrwMXZO
        wBseBitkgC38WC4nMhPGcA45ovX4g2jyJnug5zMoa94X58SCzCjIt9Q+fd8U0g1i
        djxHGZguvh2EbSJYmKw3yumU1jDIfqc5Pdio3It74XCuWKSVaxVa8oVmcZGByvDw
        XYcbcq6MZsS3jrIo2tvbjRHqoNYO6djnfHeO80YVb/xuL5f28zawz+X2JC5oiOT7
        iafE7KMa0ACd/CkR2Wguf1PqEL/tO6K3EkVxDrYPP8X9QlZJriM5jP5zWwy3PtKi
        y/po8dQLmARJveyoyJrog8clHC20VaMfs9Y+WTjREwRe80ZXkvZD8l/b4zWjfMIX
        IVPBUa20weJUUiEe5m0vld1M3W+dIEdjoeQWujPIVYO58+Cy7QOzclWOR0XPldHL
        zu2ec5HjylRM4dVQVbgelkDndYOP8C0Dek5ahsm95G+4Pm7TjW7HJA0TsRcBjDnv
        KDVoCXFTx+MVMI98fcJKNaOMVtmlUpk5QFO2TLV72HknzsGRcmd3+kTOHDkzb/PP
        btl1/B0Iv/JqYYbJFpu0xRL8esTHuTd/tsc8kDV4ryClSvwgZAjbv/3/wlcvUbfe
        yYk=
        -----END ENCRYPTED PRIVATE KEY-----
      `,
   *   passphrase: 'zy',
   *   type: 1,
   *   long: true,
   *   pad: 'rsaes-pkcs1-v1_5',
   *   passphraseEncode: 'utf8',
   *   inputEncode: 'hex',
   *   outputEncode: 'utf8',
   * });
   *  => this is an example
   */
  decode: (options: RsaOptions): string => {
    const {
      src,
      key,
      passphrase = '',
      type = 1, // 0: 公钥解密, 1: 私钥解密
      long = false,
      pad = 'rsaes-pkcs1-v1_5',
      passphraseEncode = 'utf8',
      inputEncode = 'base64',
      outputEncode = 'utf8',
    } = options;

    if (!['base64', 'hex'].includes(inputEncode.toLowerCase())) return '';
    if (!src || !key) return '';

    let rsaKey: pki.rsa.PublicKey | pki.rsa.PrivateKey;
    if (type === 0) {
      if (!PUB_REGEX.test(key)) throw new Error('Key is not a valid public key');

      rsaKey = pki.publicKeyFromPem(key);
    } else if (type === 1) {
      if (!PRI_REGEX.test(key)) throw new Error('Key is not a valid private key');

      if (key.includes('ENCRYPTED')) {
        if (!passphrase) throw new Error('Passphrase is required for encrypted private key');

        const passphraseBuffer = wordArrayParse[passphraseEncode](passphrase);
        rsaKey = pki.decryptRsaPrivateKey(key, forgeArrayToBytes(wordArrayToArray(passphraseBuffer)).getBytes());
      } else {
        rsaKey = pki.privateKeyFromPem(key);
      }
    }

    const srcBuffer = wordArrayParse[inputEncode](src);

    const padding = getPad(pad);
    let schemeOptions = {};
    if (padding === 'RSA-OAEP' && pad.toLowerCase() !== 'rsa-oaep') {
      const algorithm = pad.toLowerCase().replace('rsa-oaep-', '') || 'sha1';
      if (!['md5', 'sha1', 'sha256', 'sha384', 'sha512'].includes(algorithm)) {
        throw new Error(`Unsupported RSA-OAEP algorithm: ${algorithm}`);
      }

      schemeOptions = {
        md: md[algorithm].create(),
        mgf1: {
          md: md[algorithm].create(),
        },
      };
    }

    let decryptedBytes = '';

    if (long) {
      const bytes = forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes();

      // 对于RSA解密，块大小固定为密钥长度
      // 例如：2048位RSA密钥对应256字节的块大小
      const keySize = rsaKey.n.bitLength() / 8; // 获取密钥长度（字节）
      const MAX_DECRYPT_BLOCK = keySize || 256; // 如果无法获取密钥长度，默认使用256字节（适用于2048位密钥）

      const byteLength = bytes.length;
      let offSet = 0;

      const decryptedChunks: string[] = [];

      while (offSet < byteLength) {
        let end = offSet + MAX_DECRYPT_BLOCK;
        if (end > byteLength) {
          end = byteLength;
        }

        const chunk = bytes.substring(offSet, end);

        const decryptedChunk = rsaKey.decrypt(chunk, padding, schemeOptions);
        decryptedChunks.push(decryptedChunk);

        offSet += MAX_DECRYPT_BLOCK;
      }

      decryptedBytes = decryptedChunks.join('');
    } else {
      decryptedBytes = rsaKey.decrypt(
        forgeArrayToBytes(wordArrayToArray(srcBuffer)).getBytes(),
        padding,
        schemeOptions,
      );
    }

    return forgeStringify[outputEncode](decryptedBytes);
  },
};
