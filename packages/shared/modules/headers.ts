import { pascalCase } from '@shared/modules/camelcase';
import { isArray, isNil, isObject, isObjectEmpty, isStrEmpty, isString, isUndefined } from '@shared/modules/validate';
import JSON5 from 'json5';
import type { ParsedQs } from 'qs';
import qs from 'qs';

type IHeaders = Record<string, any>;

export const UNSAFE_HEADERS: Array<string> = [
  'Host',
  'Referer',
  'Origin',
  'User-Agent',
  'Content-Length',
  'Set-Cookie',
  'Cookie',
  // 'Authorization',
  // 'X-CSRF-Token',
  // 'X-XSRF-Token'
];
export const UNSAFE_HEADERS_LOWER = UNSAFE_HEADERS.map((item: string) => item.toLowerCase());
export const UNSAFE_HEADERS_UPPER = UNSAFE_HEADERS.map((item: string) => item.toUpperCase());

export const ELECTRON_TAG: string = 'Electron';

/**
 * Converting HTTP headers keys to PascalCase format
 * @param headersRaw - HTTP headers object
 * @returns PascalCase HTTP headers object
 */
export const headersPascalCase = (headersRaw: IHeaders = {}): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  return Object.entries(headersRaw).reduce((acc, [key, val]) => {
    const newKey = pascalCase(key, '-', '-');
    acc[newKey] = val;
    return acc;
  }, {});
};

/**
 * Get all HTTP header keys in PascalCase format
 * @param headersRaw - HTTP headers object
 * @returns Array of PascalCase HTTP header keys
 */
export const headerKeysPascalCase = (headersRaw: IHeaders = {}): string[] => {
  if (isObjectEmpty(headersRaw)) return [];

  const headers = headersPascalCase(headersRaw);
  return Object.keys(headers);
};

/**
 * Checks whether a given document header is secure
 *
 * @param doc - The document header to check
 * @returns Returns true if all headers are safe, otherwise false
 */
export const isSafeHeader = (doc: string | Array<string> | IHeaders): boolean => {
  const check = (key: string): boolean => {
    const standardKey = pascalCase(key, '-', '-');

    if (UNSAFE_HEADERS.includes(standardKey) || standardKey.startsWith('Sec-')) {
      return false;
    } else {
      return true;
    }
  };

  if (isString(doc)) return check(doc);

  if (isArray(doc)) {
    return (doc as Array<string>).every((item: string) => check(item));
  }

  if (isObject(doc)) {
    return Object.keys(doc).every((key: string) => check(key));
  }

  return false;
};

/**
 * Remove insecure fields in the HTTP headers
 * @param headersRaw - Raw HTTP header object
 * @returns Filtered HTTP Header Objects
 */
export const removeUnSafeHeaders = (headersRaw: IHeaders = {}): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  const headers = headersPascalCase(headersRaw);
  const standardHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isUndefined(value)) continue;
    if (isSafeHeader(key)) {
      standardHeaders[key] = value;
    }
  }

  return standardHeaders;
};

/**
 * Remove "Remove-" prefix from headers
 * @param headersRaw - Raw HTTP headers object
 * @param prefixRaw - The prefix to remove (default: "Remove")
 * @param strict - Whether to strictly check for "Remove-" prefix (default: true)
 * @returns Standard HTTP headers object
 */
export const removePrefixHeaders = (
  headersRaw: IHeaders = {},
  prefixRaw: string = 'Remove',
  strict: boolean = true,
): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  const headers = headersPascalCase(headersRaw);
  const prefix = pascalCase(prefixRaw, '-', '-');
  const standardHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isUndefined(value)) continue;
    const newKey = strict ? `${prefix}-${key}` : prefix;
    if (!value.startsWith(newKey)) {
      standardHeaders[key] = value;
    }
  }

  return standardHeaders;
};

/**
 * Convert Web HTTP Headers to Electron Compatible Format
 * @param headersRaw - Raw HTTP header object
 * @returns Electron compatible HTTP header object
 */
export const convertWebToElectron = (headersRaw: IHeaders = {}): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  const headers = headersPascalCase(headersRaw);
  const standardHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isUndefined(value)) continue;
    const newKey = isSafeHeader(key) ? key : `${ELECTRON_TAG}-${key}`;
    standardHeaders[newKey] = value;
  }

  return standardHeaders;
};

/**
 * Convert Electron HTTP Headers to Web Compatible Format
 * @param headersRaw - Electron HTTP header object
 * @returns Web compatible HTTP header object
 */
export const convertElectronToWeb = (headersRaw: IHeaders = {}): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  const headers = headersPascalCase(headersRaw);
  const standardHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isUndefined(value)) continue;
    const newKey = isSafeHeader(key) ? key : key.replace(`${ELECTRON_TAG}-`, '');
    standardHeaders[newKey] = value;
  }

  return standardHeaders;
};

/**
 * Convert a URI to standard format
 * @param url - The URI to convert
 * @returns The converted URI
 *
 * @example http://xxx.com/xxx.png@Referer=xxx.com@User-Agent=okhttp
 */
export const convertUriToStandard = (url: string): { redirect: string; headers: IHeaders } => {
  try {
    url = decodeURIComponent(url);
    const headers = {};

    // Handle keys from UNSAFE_HEADERS.
    UNSAFE_HEADERS.forEach((key) => {
      const unsafeRegex = new RegExp(`@${key}=([^@]*)`, 'i');
      const unsafeMatch = unsafeRegex.exec(url);
      if (unsafeMatch && unsafeMatch[1]) {
        headers[key] = decodeURIComponent(unsafeMatch[1]);
        url = url.replace(unsafeMatch[0], '');
      }
    });

    // Handle @Headers={...}
    const headerRegex = /@Headers=(\{[^}]+\})/i;
    const headerMatch = headerRegex.exec(url);
    if (headerMatch && headerMatch[1]) {
      try {
        const parsedHeaders = JSON5.parse(decodeURIComponent(headerMatch[1]));
        Object.assign(headers, parsedHeaders);
      } catch {
        // intentionally ignore JSON parse errors
      }
      url = url.replace(headerMatch[0], '');
    }

    return { redirect: url, headers: headersPascalCase(headers) };
  } catch {
    return { redirect: url, headers: {} };
  }
};

/**
 * Convert a standard URI to a URI
 * @param redirect - The standard URI to convert
 * @param headersRaw - The HTTP headers
 * @param encode - Whether to return an encoded URL string (default: true)
 * @returns The converted URI
 *
 * @see https://github.com/takagen99/Box/blob/main/app/src/main/java/com/github/tvbox/osc/util/ImgUtil.java#L211
 *
 */
export const convertStandardToUri = (redirect: string, headersRaw: IHeaders = {}, encode: boolean = false): string => {
  try {
    if (isObjectEmpty(headersRaw)) return redirect;

    const headers = headersPascalCase(headersRaw);
    const unsafeHeaders = {};

    // Handle keys from UNSAFE_HEADERS.
    UNSAFE_HEADERS.forEach((key) => {
      if (headers[key]) {
        unsafeHeaders[`@${key}`] = headers[key];
        delete headers[key];
      }
    });

    // Handle @Headers={...}
    if (!isObjectEmpty(headers)) {
      unsafeHeaders['@Headers'] = encode ? encodeURIComponent(JSON.stringify(headers)) : JSON.stringify(headers);
    }

    const unsafePart = Object.entries(unsafeHeaders)
      .map(([key, value]) => `${key}=${value}`)
      .join('');

    return `${redirect}${unsafePart}`;
  } catch {
    return redirect;
  }
};

/**
 * Convert HTTP headers to standard format
 * @param headersRaw - Raw HTTP headers object
 * @param type - The type of headers ('electron' | 'web'), default is 'electron'
 * @param strict - Whether to strictly check for safe headers (default: true)
 * @returns Standard HTTP headers object
 */
export const convertStandardHeaders = (
  headersRaw: IHeaders = {},
  type: 'electron' | 'web' = 'electron',
  strict: boolean = true,
): IHeaders => {
  if (isObjectEmpty(headersRaw)) return {};

  const headers = headersPascalCase(headersRaw);
  let standardHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isUndefined(value)) continue;

    let newKey = key;
    if (type === 'web' && !isSafeHeader(key)) {
      newKey = `${ELECTRON_TAG}-${key}`;
    }
    if (type === 'electron' && !isSafeHeader(key) && key.startsWith(`${ELECTRON_TAG}-`)) {
      newKey = key.replace(`${ELECTRON_TAG}-`, '');
    }

    standardHeaders[newKey] = value;
  }

  standardHeaders = removePrefixHeaders(standardHeaders, 'Remove', strict);

  return standardHeaders;
};

/**
 * Check if the URI is localhost
 * @param url - The URI to check
 * @returns Whether the URI is localhost
 */
export const isLocalhostURI = (url: string): boolean => {
  if (isNil(url) || !isString(url) || isStrEmpty(url)) return false;
  try {
    const hostname = new URL(url).hostname;
    return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
};

/**
 * Get the origin part of a URL
 * @param str - Input string
 * @returns Origin part of the URL
 */
export const getHome = (str: string): string => {
  if (!isString(str)) return str;

  try {
    const url = new URL(str);
    return url.origin;
  } catch {
    return str;
  }
};

/**
 * Parse a query string into an object
 * @param str - Query string
 * @returns Parsed query parameters
 */
export const parseQueryString = (str: string): ParsedQs => {
  const query = str.replace(/^[?&]/, '');
  return qs.parse(query);
};

/**
 * Resolve URL from base URL and relative URL
 * @param from - The base URL
 * @param to - The relative URL
 * @returns The resolved URL
 */
export function urlResolve(from: string = '', to: string = ''): string {
  try {
    const base = new URL(from, 'resolve://');
    const resolved = new URL(to, base);
    return resolved.protocol === 'resolve:' ? `${resolved.pathname}${resolved.search}${resolved.hash}` : resolved.href;
  } catch {
    return from;
  }
}

/**
 * Build a URL by appending a path or query string to a base URL
 * @param baseUrl - The base URL
 * @param append - The path or query string to append
 * @returns The constructed URL
 */
export const buildUrl = (baseUrl: string, append: string = ''): string => {
  try {
    const u = new URL(baseUrl);
    const basePath = u.pathname.replace(/\/$/, '');
    const api = u.origin + basePath;

    if (/^[?&]/.test(append)) {
      const originalParams = new URLSearchParams(u.search);
      const newParams = new URLSearchParams(append);

      newParams.forEach((value, key) => originalParams.set(key, value));
      const query = originalParams.toString();
      return query ? `${api}?${query}` : api;
    }

    const extraPath = append.replace(/^\/+/, '');
    return extraPath ? `${api}/${extraPath}` : api;
  } catch {
    return baseUrl;
  }
};

/**
 * Remove the scheme and separators from the given URL.
 *
 * @example
 * ```javascript
 * removeScheme('https://music.apple.com/browse') // => 'music.apple.com/browse'
 * removeScheme('apple-music://music.apple.com/browse') // => 'music.apple.com/browse'
 * removeScheme('music.apple.com/browse') // => 'music.apple.com/browse'
 * ```
 */
export function removeScheme(url: string | URL | null | undefined): string {
  if (isNil(url)) {
    return '';
  }

  return String(url).replace(/^([^:]*:\/{0,2}|:?\/\/)/, '');
}

/**
 * Strip scheme and host (hostname + port) from a URL, leaving just the path, query
 * params, and hash.
 *
 * @param {string} url The URL possibly containing a host
 * @returns {string} hostlessUrl The url without its host
 */
export function removeHost(url: string | URL | null | undefined): string {
  return removeScheme(url)?.replace(/^([^/]*)/, '');
}

/**
 * Strip query params and fragment from a URL.
 */
export function removeQueryParams(url: string | URL | undefined): string {
  if (isNil(url)) {
    return '';
  }

  const value = String(url);
  const splitIndex = value.indexOf('?');
  return splitIndex >= 0 ? value.slice(0, splitIndex) : value;
}

/**
 * Get the base URL of the current window
 * @returns The base URL as a string
 */
export function getBaseUrl(): string {
  const currentUrl = new URL(window.location.href);
  return `${currentUrl.protocol}//${currentUrl.host}`;
}

/**
 * Builds a URL string from the given components.
 *
 * This utility normalizes the hostname, constructs the pathname,
 * appends query parameters and hash, and returns the final URL string.
 *
 * By default, the returned URL is fully encoded (RFC 3986 compliant).
 * If `encode` is set to `false`, the URL will be decoded for readability
 * (e.g. spaces and non-ASCII characters will remain visible).
 *
 * @param props - URL components
 * @param props.protocol - URL protocol (default: "https")
 * @param props.hostname - Hostname, with or without protocol
 * @param props.pathname - URL pathname as a string or string array
 * @param props.searchParams - Query parameters as a string or key-value object
 * @param props.hash - URL hash fragment (e.g. "#section")
 * @param encode - Whether to return an encoded URL string (default: true)
 *
 * @returns The generated URL as a string
 */
export function newUrl(
  props: {
    protocol?: string;
    hostname: string;
    pathname?: string | string[];
    searchParams?: string | IHeaders;
    hash?: string;
  },
  encode: boolean = true,
): string {
  try {
    const { hostname, pathname = '/', searchParams = {}, protocol = 'https', hash = '' } = props;

    const url = new URL(`${protocol}://${removeScheme(hostname)}`);
    url.pathname = `/${Array.isArray(pathname) ? `${pathname.join('/')}` : pathname}`.replace(/\/+/g, '/'); // pathname
    url.hash = hash; // hash

    const queryObj: IHeaders =
      isString(searchParams) && !isStrEmpty(searchParams)
        ? qs.parse(searchParams)
        : isObject(searchParams) && !isObjectEmpty(searchParams)
          ? searchParams
          : {};
    const queryString = qs.stringify(queryObj, {
      encode, // encode values if true
      encodeValuesOnly: true,
      arrayFormat: 'brackets',
      format: 'RFC3986', // %20 instead of +
    });
    url.search = queryString ? `?${queryString}` : ''; // search

    return encode ? url.toString() : decodeURI(url.toString());
  } catch {
    return '';
  }
}

/**
 * Strip all occurrences of a specific query parameter value from a URL.
 * @param url - The original URL
 * @param param - The query parameter to remove
 * @param type - Whether to remove by 'key' or 'value' (default is 'key')
 * @returns The URL with the specified query parameter value removed
 */
export function stripUrlParam(url: string, param: string, type: 'key' | 'value' = 'key'): string {
  if (!param) return url;

  const [beforeHash, hash = ''] = url.split('#');
  const [originPath, search] = beforeHash.split('?');
  if (!search) return url;

  const query = qs.parse(search);
  let changed = false;

  Object.keys(query).forEach((key) => {
    const value = query[key];

    // remove by key
    if (type === 'key' && key === param) {
      delete query[key];
      changed = true;
      return;
    }

    // remove by value
    if (type === 'value') {
      if (Array.isArray(value)) {
        const filtered = value.filter((v) => v !== param);
        if (filtered.length !== value.length) {
          changed = true;
          if (filtered.length === 0) {
            delete query[key];
          } else {
            query[key] = filtered;
          }
        }
      } else if (value === param) {
        delete query[key];
        changed = true;
      }
    }
  });

  // nothing changed → return original url
  if (!changed) return url;

  const newSearch = qs.stringify(query, { addQueryPrefix: true, arrayFormat: 'repeat' });
  return originPath + newSearch + (hash ? `#${hash}` : '');
}
