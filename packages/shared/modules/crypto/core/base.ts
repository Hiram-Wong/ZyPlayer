import { toString } from '@shared/modules/toString';
import { isPositiveFiniteNumber, isUUID } from '@shared/modules/validate';
import type { UUIDTypes } from 'uuid';
import { v3 as uuidv3, v4 as uuidv4, v5 as uuidv5 } from 'uuid';

/**
 * Generate a random version 4 UUID
 * @returns A random UUID
 */
export const randomUUID = (): string => {
  // return 'xxxxxxxx-xxxx-4xxx-Vxxx-xxxxxxxxxxxx'.replace(/[xV]/g, (placeholder) => {
  //   let nibble = (Math.random() * 16) | 0;

  //   if (placeholder === 'V') {
  //     // Per RFC, the two MSB of byte 8 must be 0b10 (0x8).
  //     // 0x3 (0b11) masks out the bottom two bits.
  //     // See: https://tools.ietf.org/html/rfc4122.html#section-4.1.1
  //     nibble = (nibble & 0x3) | 0x8;
  //   }

  //   return nibble.toString(16);
  // });
  return uuidv4();
};

/**
 * Generate a random nanoid
 * @param {number} [len] Length of the nanoid
 * @returns {string} A random nanoid
 */
export const randomNanoid = (len?: number): string => {
  if (!isPositiveFiniteNumber(len)) len = 21;

  const URL_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

  const bytes = new Uint8Array(len!);
  for (let i = 0; i < len!; i++) {
    bytes[i] = (Math.random() * 256) | 0;
  }

  let id = '';
  for (let i = 0; i < len!; i++) {
    id += URL_ALPHABET[63 & bytes[i]];
  }

  return id;
};

/**
 * Generates the Name-Based UUID hashes v3 and v5 according to RFC-4122
 * https://tools.ietf.org/html/rfc4122#section-4.3
 * @param {string} value Hashing target
 * @param {string} [namespace] Some name space within which generation occurs, defaults to zeros if invalid or not provided
 * @param {3|5} [version] Version of UUID. Available versions is 3 and 5
 * according to RFC-4122. The version is responsible for the hashing algorithm:
 * version 3 uses MD5, and version 5 uses SHA-1. Default is 5.
 * @returns {string} UUID
 */
export const generateStrUUID = (value: string, namespace?: UUIDTypes, version?: number): string => {
  const content = toString(value);

  const safeNamespace = isUUID(namespace) ? namespace! : '00000000-0000-0000-0000-000000000000';
  const safeVersion = version === 3 || version === 5 ? version : 5;

  switch (safeVersion) {
    case 3:
      return uuidv3(content, safeNamespace);
    case 5:
    default:
      return uuidv5(content, safeNamespace);
  }
};
