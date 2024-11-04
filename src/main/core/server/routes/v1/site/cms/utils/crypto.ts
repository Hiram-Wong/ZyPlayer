import { aes, base64, gzip, rsa } from '@main/utils/crypto';

const decodeSource = (js_code: string, doc: object = {}, method: string = '') => {
  const current_match = /var rule|[\u4E00-\u9FA5]+|function|let |var |const |\(|\)|"|'/;
  if (current_match.test(js_code)) {
    return js_code;
  }

  const decode_funcs = {
    gzip: (text: string, _doc) => {
      try {
        return gzip.decode(text);
      } catch (e) {
        console.log('not gzip encryption');
        return '';
      }
    },
    base64: (text: string, _doc) => {
      try {
        return base64.decode(text);
      } catch (e) {
        console.log('not base64 encryption');
        return '';
      }
    },
    aes: (text: string, doc) => {
      try {
        const { key, mode, padding, encoding, iv } = doc;
        return aes.decode(text, key, mode, padding, encoding, iv);
      } catch (e) {
        console.log('not aes encryption');
        return '';
      }
    },
    rsa: (text: string, doc) => {
      try {
        const { privateKey, padding, encoding } = doc;
        return rsa.decode(text, privateKey, padding, encoding);
      } catch (e) {
        console.log('not rsa encryption');
        return '';
      }
    },
  };

  if (method) {
    return decode_funcs[method](js_code, doc);
  }

  let decode_content: string = '';

  for (const func in decode_funcs) {
    decode_content = decode_funcs[func](js_code, doc);
    if (current_match.test(decode_content)) break;
  }
  return decode_content;
};

const encodeSource = (js_code: string, doc: object = {}, method: string = '') => {
  const encode_funcs = {
    gzip: (text: string, _doc) => {
      try {
        return gzip.encode(text);
      } catch (err) {
        console.log('encode gzip error');
        return '';
      }
    },
    base64: (text: string, _doc) => {
      try {
        return base64.encode(text);
      } catch (err) {
        console.log('encode base64 error');
        return '';
      }
    },
    aes: (text: string, doc) => {
      try {
        const { key, mode = 'cbc', padding = 'pkcs7', encoding = 'base64', iv } = doc;
        return aes.encode(text, key, mode, padding, encoding, iv);
      } catch (err) {
        console.log('encode aes error');
        return '';
      }
    },
    rsa: (text: string, doc) => {
      try {
        const { publicKey, padding = 'pkcs1', encoding = 'base64' } = doc;
        return rsa.encode(text, publicKey, padding, encoding);
      } catch (err) {
        console.log('encode rsa error');
        return '';
      }
    },
  };

  if (!method) {
    const list = ['aes', 'base64', 'gzip', 'rsa'];
    const randomIndex = Math.floor(Math.random() * list.length);
    method = list[randomIndex];
  }

  return encode_funcs[method](js_code, doc);
};

export { decodeSource, encodeSource };
