import { isJson, isJsonStr, isStrEmpty, isString } from '@shared/modules/validate';
import JSON5 from 'json5';

/**
 * Convert a JSON string to an object.
 *
 * @param val - The JSON string to convert
 * @returns The converted object
 */
export const jsonStrToObj = (val: string): Record<string, any> => {
  try {
    if (!isJsonStr(val)) return {};
    return JSON5.parse(val);
  } catch {
    return {};
  }
};

/**
 * Convert a JSON5 object to a JSON object.
 *
 * @param val - The JSON5 object to convert
 * @returns The converted JSON object
 */
export const json5Tojson = (val: Record<string, any>): Record<string, any> => {
  try {
    if (!isJson(val)) return {};
    return JSON.parse(JSON5.stringify(val));
  } catch {
    return {};
  }
};

/**
 * Create an object from an iterable of key/value pairs.
 *
 * @param entries - The key value pairs (ex. [['a', 1], ['b', 2]])
 * @return The created object
 */
export function entriesToObj<V>(entries: Iterable<readonly [PropertyKey, V]>): {
  [k: string]: V;
} {
  try {
    const result: Record<PropertyKey, V> = {};

    for (const [key, value] of entries) {
      result[key] = value;
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Get value by path from object.
 * @param obj - The object to get value from
 * @param path - The path string (ex. 'a.b.c')
 * @returns The value at the specified path
 */
export const objPathValue = (obj: Record<string, any>, path: string): any => {
  if (!isString(path) || isStrEmpty(path)) return undefined;
  const normalized = path
    .replace(/\['?"?'?([^'\]]+)'?"?'?\]/g, '.$1')
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/\[\*\]/g, '.0');
  return normalized.split('.').reduce((acc, key) => acc?.[key], obj);
};
