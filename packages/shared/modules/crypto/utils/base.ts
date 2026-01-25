/**
 * Converts a UTF-8 string to a Uint8Array.
 * @param {string} str - The UTF-8 string to convert.
 * @returns {Uint8Array} The Uint8Array representation of the UTF-8 string.
 */
export const utf8ToArray = (str: string): Uint8Array => new TextEncoder().encode(str);

/**
 * Converts a Uint8Array to a UTF-8 string.
 * @param {Uint8Array} arr - The Uint8Array to convert.
 * @returns {string} The UTF-8 string representation of the Uint8Array.
 */
export const arrayToUtf8 = (arr: Uint8Array): string => new TextDecoder().decode(arr);

/**
 * Converts a Latin-1 string to a Uint8Array.
 * @param str - The Latin-1 encoded string.
 * @returns Uint8Array
 */
export const latin1ToArray = (str: string): Uint8Array => {
  const len = str.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff; // mask to 1 byte
  }
  return bytes;
};

/**
 * Converts a Uint8Array to a Latin-1 string.
 * @param arr - The Uint8Array to convert.
 * @returns Latin-1 encoded string
 */
export const arrayToLatin1 = (arr: Uint8Array): string => {
  let str = '';
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
};

/**
 * Converts a Uint8Array to a base64 string.
 * @param {Uint8Array} arr - The Uint8Array to convert.
 * @returns {string} The base64 string representation of the Uint8Array.
 */
export const arrayToBase64 = (arr: Uint8Array): string => {
  let binary = '';
  arr.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
};

/**
 * Converts a base64 string to a Uint8Array.
 * @param {string} b64 - The base64 string to convert.
 * @returns {Uint8Array} The Uint8Array representation of the base64 string.
 */
export const base64ToArray = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/**
 * Converts a hex string to a Uint8Array.
 * @param {string} hex - The hex string to convert.
 * @returns {Uint8Array} The Uint8Array representation of the hex string.
 */
export const hexToArray = (hex: string): Uint8Array => {
  const length = hex.length;
  const arr = new Uint8Array(length / 2);
  for (let i = 0; i < length; i += 2) {
    arr[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
};

/**
 * Converts a Uint8Array to a hex string.
 * @param {Uint8Array} arr - The Uint8Array to convert.
 * @returns {string} The hex string representation of the Uint8Array.
 */
export const arrayToHex = (arr: Uint8Array): string => [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Checks if a string is Latin-1 encoded.
 * @param {string} input - The string to check.
 * @returns {boolean} True if the string is Latin-1 encoded, false otherwise.
 */
export const isLatin1String = (input: string): boolean => {
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) > 255) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if the current environment is a browser.
 * @returns {boolean} True if the environment is a browser, false otherwise.
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Checks if the current environment is Node.js.
 * @returns {boolean} True if the environment is Node.js, false otherwise.
 */
export const isNode = (): boolean => {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
};

export default {
  isLatin1String,
  arrayToBase64,
  arrayToHex,
  arrayToLatin1,
  arrayToUtf8,
  base64ToArray,
  hexToArray,
  latin1ToArray,
  utf8ToArray,
  isBrowser,
  isNode,
};
