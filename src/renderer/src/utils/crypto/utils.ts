/**
 * Converts a UTF-8 string to a Uint8Array.
 * @param {string} str - The UTF-8 string to convert.
 * @returns {Uint8Array} The Uint8Array representation of the UTF-8 string.
 * */
const utf8ToUint8Array = (str: string): Uint8Array => new TextEncoder().encode(str);

/**
 * Converts a Uint8Array to a UTF-8 string.
 * @param {Uint8Array} arr - The Uint8Array to convert.
 * @returns {string} The UTF-8 string representation of the Uint8Array.
 * */
const uint8ArrayToUtf8 = (arr: Uint8Array): string => new TextDecoder().decode(arr);

/**
 * Converts a Latin-1 string to a Uint8Array.
 * @param str - The Latin-1 encoded string.
 * @returns Uint8Array
 */
const latin1ToUint8Array = (str: string): Uint8Array => {
  const len = str.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i) & 0xFF; // mask to 1 byte
  }
  return bytes;
};

/**
 * Converts a Uint8Array to a Latin-1 string.
 * @param arr - The Uint8Array to convert.
 * @returns Latin-1 encoded string
 */
const uint8ArrayToLatin1 = (arr: Uint8Array): string => {
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
 * */
const uint8ArrayToBase64 = (arr: Uint8Array): string => {
  let binary = '';
  arr.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
};

/**
 * Converts a base64 string to a Uint8Array.
 * @param {string} b64 - The base64 string to convert.
 * @returns {Uint8Array} The Uint8Array representation of the base64 string.
 * */
const base64ToUint8Array = (b64: string): Uint8Array => {
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
 * */
const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length;
  const arr = new Uint8Array(length / 2);
  for (let i = 0; i < length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
};

/**
 * Converts a Uint8Array to a hex string.
 * @param {Uint8Array} arr - The Uint8Array to convert.
 * @returns {string} The hex string representation of the Uint8Array.
 * */
const uint8ArrayToHex = (arr: Uint8Array): string => [...arr].map(b => b.toString(16).padStart(2, '0')).join('');

export {
  utf8ToUint8Array,
  uint8ArrayToUtf8,
  latin1ToUint8Array,
  uint8ArrayToLatin1,
  uint8ArrayToBase64,
  base64ToUint8Array,
  hexToUint8Array,
  uint8ArrayToHex,
}
