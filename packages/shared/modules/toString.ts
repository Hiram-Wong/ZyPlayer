import {
  isBoolean,
  isDate,
  isFunction,
  isJson,
  isMap,
  isNil,
  isNumber,
  isSet,
  isString,
  isSymbol,
} from '@shared/modules/validate';
import JSON5 from 'json5';

export const toString = (value: unknown): string => {
  if (isNil(value)) {
    return '';
  }

  if (isString(value)) {
    return value;
  }

  if (isNumber(value)) {
    if (typeof value === 'bigint') {
      return `${value.toString()}n`;
    } else if (typeof value === 'number') {
      return String(value);
    }
  }

  if (isBoolean(value)) return value ? 'true' : 'false';

  if (isSymbol(value) || isFunction(value)) {
    return value.toString();
  }

  if (typeof value === 'object') {
    try {
      if (isDate(value)) return value.toISOString();
      if (isMap(value)) return JSON5.stringify(Object.fromEntries(value));
      if (isSet(value)) return JSON5.stringify(Array.from(value));
      if (isJson(value)) return JSON5.stringify(value);
      return JSON5.stringify(value);
    } catch {
      return '[object Object]';
    }
  }

  try {
    return value?.toString?.() ?? '';
  } catch {
    return '';
  }
};
