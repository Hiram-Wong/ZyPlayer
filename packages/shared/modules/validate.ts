import {
  isArrayBuffer,
  isBoolean,
  isBuffer,
  isJSONArray,
  isJSONObject,
  isJSONValue,
  isMap,
  isNil,
  isSet,
  isString,
  isTypedArray,
} from 'es-toolkit';
import JSON5 from 'json5';

/**
 * Export typeof validation function directly from es-toolkit
 */
export {
  isBoolean,
  isDate,
  isFunction,
  isMap,
  isNil,
  isNull,
  isSet,
  isString,
  isSymbol,
  isUndefined,
} from 'es-toolkit';

/**
 * Check if value is a valid number
 * @param value - Value to check
 * @returns Returns true if it's a valid number, otherwise false
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' || typeof value === 'bigint';
}

/**
 * Check if value is a valid integer
 * @param value - Value to check
 * @returns Returns true if it's a valid integer, otherwise false
 */
export function isIntNumber(value: unknown): boolean {
  if (!isNumber(value)) return false;
  if (typeof value === 'bigint') return true; // bigint is always an integer
  return Number.isInteger(value) && !Number.isNaN(value);
}

/**
 * Check if value is a finite integer
 * @param value - Value to check
 * @returns Returns true if value is a finite integer, otherwise false
 */
export function isFiniteNumber(value: unknown): boolean {
  if (!isNumber(value)) return false;
  if (typeof value === 'bigint') return true; // bigint is always finite
  return Number.isFinite(value);
}

/**
 * Check if value is a positive finite integer
 * @param value - Value to check
 * @returns Returns true if value is a finite integer, otherwise false
 */
export function isPositiveFiniteNumber(value: unknown): boolean {
  return isFiniteNumber(value) && (value as number) >= 0;
}

/**
 * Check if value is a valid permission number
 * @param value - Value to check
 * @returns Returns true if value is a valid permission number, otherwise false
 */
export function isPermissionNumber(value: unknown): boolean {
  if (!/^[0-7]+$/.test(String(value))) return false;
  return (value as number) >= 0 && (value as number) <= 0o777;
}

/**
 * Check if string is empty
 * @param value - Value to check
 * @returns Returns true if string is empty, otherwise false
 */
export function isStrEmpty(value: unknown): boolean {
  return isString(value) && value.trim().length === 0;
}

/**
 * Check if value is an object
 * @param value - Value to check
 * @returns Returns true if value is an object, otherwise false
 */
export function isObject(value?: any): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

/**
 * Check if object is empty
 * @param value - Object to check
 * @returns Returns true if object is empty, otherwise false
 */
export function isObjectEmpty(value: unknown): boolean {
  return isJSONObject(value) && Object.keys(value).length === 0;
}

/**
 * Check if value is an array
 * @param value - Value to check
 * @returns Returns true if value is an array, otherwise false
 */
// export const isArray = isJSONArray;
export function isArray(value?: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Check if value is an array with multiple dimensions
 * @param value - Value to check
 * @param depth - Depth of dimensions to check, default is 2
 * @returns Returns true if value is an array with multiple dimensions, otherwise false
 */
export function isMultidimensionalArray(value?: any, depth: number = 2): boolean {
  if (!isArray(value)) return false;
  if (depth <= 1) return true;

  return !isArrayEmpty(value) && value.every((item) => isMultidimensionalArray(item, depth - 1));
}

/**
 * Check if array is empty
 * @param value - Array to check
 * @returns Returns true if array is empty, otherwise false
 */
export function isArrayEmpty(value: unknown): boolean {
  return isJSONArray(value) && value.length === 0;
}

/**
 * Check if object can be serialized to valid JSON
 * @param value - Object to check
 * @returns Returns true if object can be serialized to valid JSON, otherwise false
 */
export function isJson(value: unknown): boolean {
  return typeof value === 'object' && value !== null && isJSONValue(value);
}

/**
 * Check if string is valid JSON format
 * @param value - String to check
 * @returns Returns true if string is valid JSON format, otherwise false
 */
export function isJsonStr(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  // return isJSON(value); // not parse json5
  try {
    const resp = JSON5.parse(value);
    if (!isJson(resp)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid binary format
 * @param value - String to check
 * @returns Returns true if string is valid binary format, otherwise false
 */
export function isBinary(value: unknown): boolean {
  return isBuffer(value) || isArrayBuffer(value) || isTypedArray(value);
}

/**
 * Check if string is valid base64 format
 * @param value - String to check
 * @returns Returns true if string is valid base64 format, otherwise false
 */
export function isBase64(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;

  try {
    const normalizedValue = value.trim();
    if (normalizedValue.length % 4 !== 0) return false;
    return /^[A-Z0-9+/]*={0,2}$/i.test(normalizedValue);
  } catch {
    return false;
  }
}

/**
 * Check if value is empty
 * @param value - Value to check, can be any type
 * @returns Returns true if value is empty, otherwise false
 */
export function isValEmpty(value: unknown): boolean {
  // Check null/undefined
  if (isNil(value)) {
    return true;
  }

  // Check string
  if (isString(value)) {
    return value.trim().length === 0;
  }

  // Check map/set
  if (isMap(value) || isSet(value)) {
    return value.size === 0;
  }

  // Check array
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // Check object
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length === 0;
  }

  return false;
}

// Cache compiled regex patterns for better performance
const pathMatchRegexCache = new Map<string, RegExp>();

/**
 * Check if a path matches the specified pattern
 * @param pattern - Matching pattern, supports * and ** wildcards
 * @param path - Path to check
 * @returns Returns true if the path matches the pattern, otherwise false
 */
export function isPathMatch(pattern: string, path: string): boolean {
  if (isValEmpty(pattern) || isValEmpty(path)) return false;

  // Use cached regex if available
  if (!pathMatchRegexCache.has(pattern)) {
    const regexPattern = pattern.replace(/\//g, '\\/').replace(/\*\*/g, '.*').replace(/\*/g, '[^\\/]*');
    pathMatchRegexCache.set(pattern, new RegExp(`^${regexPattern}$`));
  }

  return pathMatchRegexCache.get(pattern)!.test(path);
}

/**
 * Check if string contains HTTP/HTTPS protocol
 * @param value - String to check
 * @param strict - Check for strict protocol for https://
 * @returns Returns true if string contains HTTP/HTTPS protocol, otherwise false
 */
export function isHttp(value: unknown, strict: boolean = false): boolean {
  if (!isString(value) || isValEmpty(value)) return false;
  if (strict) {
    return /^https:\/\//i.test(value);
  }
  return /^https?:\/\//i.test(value);
}

/**
 * Check if URL is an external resource (http, mailto, tel)
 * @param value - URL string to validate
 * @returns Returns true if URL is an external resource, otherwise false
 */
export function isExternal(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  // eslint-disable-next-line regexp/no-unused-capturing-group
  return /^(https?:|file:|mailto:|tel:)/i.test(value);
}

/**
 * Check if value is a valid URI
 * @param value - URL to check
 * @returns Returns true if it's a valid URI, otherwise false
 */
export function isURI(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url);
  } catch {
    return false;
  }
}

/**
 * Check if string contains only lowercase letters
 * @param value - String to check
 * @returns Returns true if string contains only lowercase letters, otherwise false
 */
export function isLowerCase(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  return /^[a-z]+$/.test(value);
}

/**
 * Check if string contains only uppercase letters
 * @param value - String to check
 * @returns Returns true if string contains only uppercase letters, otherwise false
 */
export function isUpperCase(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  return /^[A-Z]+$/.test(value);
}

/**
 * Check if string contains only alphabets (both lowercase & uppercase)
 * @param value - String to check
 * @returns Returns true if string contains only alphabets, otherwise false
 */
export function isAlphabets(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  return /^[A-Z]+$/i.test(value);
}

/**
 * Check if string contains special characters
 * @param value - String to check
 * @param patten - Regular expression pattern to match special characters, default is /[!@#¥$%.&*^()_+=\-~]/
 * @returns Returns true if string contains special characters, otherwise false
 */
export const isContainsSpecialChar = (value: string, patten = /[!@#¥$%.&*^()_+=\-~]/) => patten.test(value);

/**
 * Check if string contains alpha and numeric
 * @param value - String to check
 * @returns Returns true if string contains  alpha and numeric, otherwise false
 */
export const isContainsAlphaNumeric = (value: string) => {
  const hasLetter = /[a-z]/i.test(value);
  const hasNumber = /\d/.test(value);
  return hasLetter && hasNumber;
};

/**
 * Check if string is a valid email address
 * @param value - Email address to check
 * @returns Returns true if it's a valid email address, otherwise false
 */
export function isEmail(value: unknown): boolean {
  if (!isString(value) || isStrEmpty(value)) return false;
  return /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
}

export type UUIDVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'nil' | 'max' | 'all';

/**
 * Check if string is a valid UUID
 * @param value - UUID string to check
 * @param version - UUID version, can be 1-8, 'nil', 'max', or 'all', defaults to 'all'
 * @returns Returns true if it's a valid UUID, otherwise false
 */
export function isUUID(value: unknown, version: UUIDVersion = 'all'): boolean {
  if (!isString(value) || isStrEmpty(value) || value.length !== 36) return false;

  // Precompile UUID regexes for better performance
  const UUID_REGEXES: Record<UUIDVersion, RegExp> = {
    1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    6: /^[0-9A-F]{8}-[0-9A-F]{4}-6[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    7: /^[0-9A-F]{8}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    8: /^[0-9A-F]{8}-[0-9A-F]{4}-8[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    nil: /^00000000-0000-0000-0000-000000000000$/,
    max: /^ffffffff-ffff-ffff-ffff-ffffffffffff$/i,
    // https://github.com/uuidjs/uuid/blob/main/src/regex.ts
    all: /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i,
  };
  return version in UUID_REGEXES && UUID_REGEXES[version].test(value);
}

/**
 * Check if string is a valid port number
 * @param value - String or number to check
 * @returns Returns true if it's a valid port number (1-65535), otherwise false
 */
export function isPort(value: unknown): boolean {
  const num = Number(value);
  return isPositiveFiniteNumber(num) && num >= 1 && num <= 65535;
}

export function isTimestamp(value: unknown, type: 'ms' | 's' = 'ms'): boolean {
  if (!isFiniteNumber(value)) return false;
  if (type === 'ms') {
    return String(value).length === 13;
  }
  return String(value).length === 10;
}

export default {
  isNumber,
  isIntNumber,
  isFiniteNumber,
  isPositiveFiniteNumber,
  isPermissionNumber,
  isString,
  isStrEmpty,
  isObject,
  isObjectEmpty,
  isArray,
  isArrayEmpty,
  isJson,
  isJsonStr,
  isBinary,
  isBase64,
  isBoolean,
  isValEmpty,
  isPathMatch,
  isHttp,
  isExternal,
  isURI,
  isLowerCase,
  isUpperCase,
  isAlphabets,
  isEmail,
  isUUID,
  isPort,
  isTimestamp,
};
