/* eslint-disable antfu/consistent-list-newline */
// Base64 Encoded Character Mapping Table
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Base64 Decode Character Mapping Table (precomputed lookup table)
const BASE64_DECODE_MAP = new Int8Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, -1, -1, -1, -1, -1,
]);

// ASCII code of the equal sign character
const EQUALS_CHAR_CODE = 61; // '='

/**
 * Convert strings to Base64 encoding
 * @param input - the input string to encode
 * @returns Base64 encoded string
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
 */
export const btoa = (input: string): string => {
  const len = input.length;
  let output = '';
  let i = 0;

  while (i < len) {
    const c1 = input.charCodeAt(i++) & 0xff;
    if (i === len) {
      output += BASE64_CHARS.charAt(c1 >> 2);
      output += BASE64_CHARS.charAt((c1 & 0x3) << 4);
      output += '==';
      break;
    }

    const c2 = input.charCodeAt(i++);
    if (i === len) {
      output += BASE64_CHARS.charAt(c1 >> 2);
      output += BASE64_CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      output += BASE64_CHARS.charAt((c2 & 0xf) << 2);
      output += '=';
      break;
    }

    const c3 = input.charCodeAt(i++);
    output += BASE64_CHARS.charAt(c1 >> 2);
    output += BASE64_CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    output += BASE64_CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    output += BASE64_CHARS.charAt(c3 & 0x3f);
  }

  return output;
};

/**
 * Converts Base64 encoded to strings
 * @param input - the input string to decode
 * @returns UTF-8 encoded string
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob
 */
export const atob = (input: string): string => {
  const len = input.length;
  let output = '';
  let i = 0;

  while (i < len) {
    let c1: number;
    do {
      c1 = BASE64_DECODE_MAP[input.charCodeAt(i++) & 0xff];
    } while (i < len && c1 === -1);

    if (c1 === -1) break;

    let c2: number;
    do {
      c2 = BASE64_DECODE_MAP[input.charCodeAt(i++) & 0xff];
    } while (i < len && c2 === -1);

    if (c2 === -1) break;
    output += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

    let c3: number;
    do {
      c3 = input.charCodeAt(i++) & 0xff;
      if (c3 === EQUALS_CHAR_CODE) return output;
      c3 = BASE64_DECODE_MAP[c3];
    } while (i < len && c3 === -1);
    if (c3 === -1) break;
    output += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

    let c4: number;
    do {
      c4 = input.charCodeAt(i++) & 0xff;
      if (c4 === EQUALS_CHAR_CODE) return output;
      c4 = BASE64_DECODE_MAP[c4];
    } while (i < len && c4 === -1);
    if (c4 === -1) break;
    output += String.fromCharCode(((c3 & 0x03) << 6) | c4);
  }

  return output;
};

export default { atob, btoa };
