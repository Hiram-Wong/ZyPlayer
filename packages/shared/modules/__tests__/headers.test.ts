import { describe, expect, it } from 'vitest';

import { convertStandardToUri, convertUriToStandard, newUrl, stripUrlParam } from '../headers';

describe('headers', () => {
  describe('convertUriToStandard', () => {
    it('should parse URL without headers correctly', () => {
      const url = 'https://example.com/path?foo=bar#top';
      const result = convertUriToStandard(url);
      expect(result).toEqual({ redirect: url, headers: {} });
    });

    it('should parse only UNSAFE_HEADERS correctly', () => {
      const url = 'https://example.com/path@Cookie=session123@User-Agent=UA123';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path',
        headers: { Cookie: 'session123', 'User-Agent': 'UA123' },
      });
    });

    it('should parse @Headers with JSON correctly', () => {
      const url = 'https://example.com/path@Headers=%7B%22custom%22%3A%22abc%22%7D';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path',
        headers: { custom: 'abc' },
      });
    });

    it('should parse mixed UNSAFE_HEADERS and @Headers', () => {
      const url = 'https://example.com/path@Cookie=abc@Headers=%7B%22custom%22%3A%22abc%22%7D';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path',
        headers: { Cookie: 'abc', custom: 'abc' },
      });
    });

    it('should decode special characters correctly', () => {
      const url =
        'https://example.com/path@Cookie=tok%26en@Headers=%7B%22custom%22%3A%22%E4%BD%A0%E5%A5%BD%20%26%20123%22%7D';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path',
        headers: {
          Cookie: 'tok&en',
          custom: '你好 & 123',
        },
      });
    });

    it('should handle URL with search and hash', () => {
      const url = 'https://example.com/path?foo=bar#section@Cookie=abc@Headers=%7B%22custom%22%3A%22abc%22%7D';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path?foo=bar#section',
        headers: { Cookie: 'abc', custom: 'abc' },
      });
    });

    it('should ignore non-UNSAFE headers in @Headers', () => {
      const url =
        'https://example.com/path@Headers=%7B%22Authorization%22%3A%22tok%26en%22%2C%22custom%22%3A%22abc%22%7D';
      const result = convertUriToStandard(url);
      expect(result).toEqual({
        redirect: 'https://example.com/path',
        headers: { Authorization: 'tok&en', custom: 'abc' },
      });
    });
  });

  describe('convertStandardToUri', () => {
    const baseUrl = 'https://example.com/path';

    it('should handle UNSAFE_HEADERS', () => {
      const headers = { Cookie: 'abc', Host: 'example.com' };
      const result = convertStandardToUri(baseUrl, headers, true);

      const expected = `${baseUrl}@Host=example.com@Cookie=abc`;
      expect(result).toBe(expected);
    });

    it('should handle normal headers into @Headers (encoded)', () => {
      const headers = { Authorization: 'token123', custom: 'abc' };
      const result = convertStandardToUri(baseUrl, headers, true);

      const expectedHeaders = encodeURIComponent(JSON.stringify(headers));
      const expected = `${baseUrl}@Headers=${expectedHeaders}`;
      expect(result).toBe(expected);
    });

    it('should handle normal headers into @Headers (not encoded)', () => {
      const headers = { Authorization: 'token123', custom: 'abc' };
      const result = convertStandardToUri(baseUrl, headers, false);

      const expected = `${baseUrl}@Headers=${JSON.stringify(headers)}`;
      expect(result).toBe(expected);
    });

    it('should handle mixed UNSAFE_HEADERS and normal headers', () => {
      const headers = { Cookie: 'abc', custom: 'abc' };
      const result = convertStandardToUri(baseUrl, headers, true);

      const expectedHeaders = encodeURIComponent(JSON.stringify({ custom: 'abc' }));
      const expected = `${baseUrl}@Cookie=abc@Headers=${expectedHeaders}`;
      expect(result).toBe(expected);
    });

    it('should handle special characters in headers', () => {
      const headers = { Cookie: 'tok&en', custom: '你好 & 123' };
      const result = convertStandardToUri(baseUrl, headers, true);

      const expectedHeaders = encodeURIComponent(JSON.stringify({ custom: '你好 & 123' }));
      const expected = `${baseUrl}@Cookie=tok&en@Headers=${expectedHeaders}`;
      expect(result).toBe(expected);
    });

    it('should not encode redirect, only unsafeHeaders when encode=true', () => {
      const redirect = 'https://example.com/path?foo=bar#top';
      const headers = { Cookie: 'abc', custom: 'abc' };
      const result = convertStandardToUri(redirect, headers, true);

      const expectedHeaders = encodeURIComponent(JSON.stringify({ custom: 'abc' }));
      const expected = `${redirect}@Cookie=abc@Headers=${expectedHeaders}`;
      expect(result).toBe(expected);
    });

    it('should handle encode=false correctly', () => {
      const redirect = 'https://example.com/path?foo=bar#top';
      const headers = { Cookie: 'abc', custom: 'abc' };
      const result = convertStandardToUri(redirect, headers, false);

      const expected = `${redirect}@Cookie=abc@Headers=${JSON.stringify({ custom: 'abc' })}`;
      expect(result).toBe(expected);
    });
  });

  describe('newUrl', () => {
    it('should build only hostname', () => {
      const url = newUrl({ hostname: 'example.com' });
      expect(url).toBe('https://example.com/');
    });

    it('should build only hostname and remove protocol', () => {
      const url = newUrl({ hostname: 'http://example.com' });
      expect(url).toBe('https://example.com/');
    });

    it('should build custom protocol', () => {
      const url = newUrl({ protocol: 'http', hostname: 'example.com' });
      expect(url).toBe('http://example.com/');
    });

    it('should support pathname as string', () => {
      const url = newUrl({ hostname: 'example.com', pathname: '/foo/bar' });
      expect(url).toBe('https://example.com/foo/bar');
    });

    it('should support pathname as array', () => {
      const url = newUrl({ hostname: 'example.com', pathname: ['foo', 'bar', 'baz'] });
      expect(url).toBe('https://example.com/foo/bar/baz');
    });

    it('should support pathname with duplicated slashes in array', () => {
      const url = newUrl({ hostname: 'example.com', pathname: ['foo', '/bar/', 'baz'] });
      expect(url).toBe('https://example.com/foo/bar/baz');
    });

    it('should support searchParams as object', () => {
      const url = newUrl({ hostname: 'example.com', searchParams: { a: 1, b: 'test' } });
      expect(url).toBe('https://example.com/?a=1&b=test');
    });

    it('should support searchParams as string', () => {
      const url = newUrl({ hostname: 'example.com', searchParams: 'a=1&b=test' });
      expect(url).toBe('https://example.com/?a=1&b=test');
    });

    it('should keep duplicated search params from string', () => {
      const url = newUrl({ hostname: 'example.com', searchParams: 'a=1&a=2' });
      expect(url).toBe('https://example.com/?a[]=1&a[]=2');
    });

    it('should support hash fragment', () => {
      const url = newUrl({ hostname: 'example.com', hash: '#section' });
      expect(url).toBe('https://example.com/#section');
    });

    it('should support all options together (encoded)', () => {
      const url = newUrl(
        {
          protocol: 'http',
          hostname: 'example.com',
          pathname: ['api', '用户'],
          searchParams: {
            q: 'hello world',
          },
          hash: '#top',
        },
        true,
      );

      expect(url).toBe('http://example.com/api/%E7%94%A8%E6%88%B7?q=hello%20world#top');
    });

    it('should support all options together (decoded)', () => {
      const url = newUrl(
        {
          protocol: 'http',
          hostname: 'example.com',
          pathname: ['api', '用户'],
          searchParams: 'q=hello+world',
          hash: '#top',
        },
        false,
      );

      expect(url).toBe('http://example.com/api/用户?q=hello world#top');
    });
  });

  describe('stripUrlParam', () => {
    it('should remove query params by value', () => {
      expect(stripUrlParam('/?a=1&b={id}&c=3', '{id}', 'value')).toBe('/?a=1&c=3');
    });

    it('should remove query params by key', () => {
      expect(stripUrlParam('/?a=1&b=2&c=3', 'b', 'key')).toBe('/?a=1&c=3');
    });

    it('should delete matched items in array value', () => {
      expect(stripUrlParam('/?x=1&x={id}&x=2', '{id}', 'value')).toBe('/?x=1&x=2');
    });

    it('should keep hash while removing param', () => {
      expect(stripUrlParam('/?a={id}&b=2#section', '{id}', 'value')).toBe('/?b=2#section');
    });

    it('should return original url when nothing changed', () => {
      expect(stripUrlParam('/?a=1&b=2#hash', 'notExist', 'key')).toBe('/?a=1&b=2#hash');
    });
  });
});
