import { base64 } from './core/encode';
import { aes, des, rabbit, rabbitLegacy, rc4, rsa, sm4, tripleDes } from './core/encrypt';
import { hash } from './core/mac';
import type { Mode, Pad, RsaPad, Sm4Mode, Sm4Pad } from './type';

export const base64Encode = (val: string) => base64.encode({ src: val });
export const base64Decode = (val: string) => base64.decode({ src: val });

export const md5 = (val: string) => hash['md5-32']({ src: val });
export const md5X = md5;

export const aesEncode = (val: string, key: string, iv?: string, mode?: Mode, pad?: Pad, aad?: string) =>
  aes.encode({ src: val, key, iv, mode, pad, aad });
export const aesDecode = (val: string, key: string, iv?: string, mode?: Mode, pad?: Pad, aad?: string) =>
  aes.decode({ src: val, key, iv, mode, pad, aad });
export const aesX = (
  mode: Mode,
  encrypt: boolean,
  input: string,
  inBase64: boolean,
  key: string,
  iv: string,
  outBase64: boolean,
) => {
  if (encrypt) {
    return aes.encode({
      src: input,
      key,
      iv,
      mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
    });
  } else {
    return aes.decode({
      src: input,
      key,
      iv,
      mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
    });
  }
};

export const desEncode = (val: string, key: string, iv?: string, mode?: Mode, pad?: Pad) =>
  des.encode({ src: val, key, iv, mode, pad });
export const desDecode = (val: string, key: string, iv?: string, mode?: Mode, pad?: Pad) =>
  des.decode({ src: val, key, iv, mode, pad });
export const desX = (
  mode: Mode,
  encrypt: boolean,
  input: string,
  inBase64: boolean,
  key: string,
  iv: string,
  outBase64: boolean,
) => {
  if (encrypt) {
    return des.encode({
      src: input,
      key,
      iv,
      mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
    });
  } else {
    return des.decode({
      src: input,
      key,
      iv,
      mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
    });
  }
};

export const rabbitEncode = (val: string, key: string, iv?: string) => rabbit.encode({ src: val, key, iv });
export const rabbitDecode = (val: string, key: string, iv?: string) => rabbit.decode({ src: val, key, iv });

export const rabbitLegacyEncode = (val: string, key: string, iv?: string) => rabbitLegacy.encode({ src: val, key, iv });
export const rabbitLegacyDecode = (val: string, key: string, iv?: string) => rabbitLegacy.decode({ src: val, key, iv });

export const rc4Encode = (val: string, key: string) => rc4.encode({ src: val, key });
export const rc4Decode = (val: string, key: string) => rc4.decode({ src: val, key });

export const rsaEncode = (val: string, key: string, passphrase?: string, pad?: RsaPad) =>
  rsa.encode({ src: val, key, passphrase, pad });
export const rsaDecode = (val: string, key: string, passphrase?: string, pad?: RsaPad) =>
  rsa.decode({ src: val, key, passphrase, pad });
export const rsaX = (
  mode: RsaPad,
  pub: boolean,
  encrypt: boolean,
  input: string,
  inBase64: boolean,
  key: string,
  outBase64: boolean,
) => {
  if (encrypt) {
    return rsa.encode({
      src: input,
      key,
      type: pub ? 0 : 1,
      pad: mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
      long: true,
    });
  } else {
    return rsa.decode({
      src: input,
      key,
      type: pub ? 0 : 1,
      pad: mode,
      inputEncode: inBase64 ? 'base64' : 'utf8',
      outputEncode: outBase64 ? 'base64' : 'utf8',
      long: true,
    });
  }
};

export const sm4Encode = (val: string, key: string, iv?: string, mode?: Sm4Mode, pad?: Sm4Pad, aad?: string) =>
  sm4.encode({ src: val, key, iv, mode, pad, aad });
export const sm4Decode = (val: string, key: string, iv?: string, mode?: Sm4Mode, pad?: Sm4Pad, aad?: string) =>
  sm4.decode({ src: val, key, iv, mode, pad, aad });

export const tripleDesEncode = (val: string, key: string, iv: string, mode?: Mode, pad?: Pad) =>
  tripleDes.encode({ src: val, key, iv, mode, pad });
export const tripleDesDecode = (val: string, key: string, iv: string, mode?: Mode, pad?: Pad) =>
  tripleDes.decode({ src: val, key, iv, mode, pad });
