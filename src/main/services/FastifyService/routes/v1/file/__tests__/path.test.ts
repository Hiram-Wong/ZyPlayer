import { describe, expect, it, vi } from 'vitest';

vi.mock('node:path', async (importOriginal) => importOriginal());

import { getManagedPathFromUrl, resolvePathWithinBase } from '../path';

describe('managed file path resolution', () => {
  const base = '/var/lib/zyfun/file';

  it('resolves ordinary child paths inside the managed root', () => {
    expect(resolvePathWithinBase(base, 'plugins/demo/index.json')).toBe('/var/lib/zyfun/file/plugins/demo/index.json');
  });

  it.each([
    '../secret.txt',
    'plugins/../../secret.txt',
    '/etc/passwd',
    '\\\\server\\share\\secret.txt',
    'C:\\Users\\Public\\secret.txt',
    'plugins//secret.txt',
    '',
  ])('rejects unsafe path %s', (path) => {
    expect(() => resolvePathWithinBase(base, path)).toThrow('Invalid managed file path');
  });

  it('extracts only paths from the exact managed API root', () => {
    const root = 'http://127.0.0.1:9978/api/v1/file/manage/file';
    expect(getManagedPathFromUrl(`${root}/py/example.py`, root)).toBe('py/example.py');
    expect(() => getManagedPathFromUrl('https://attacker.example/example.py', root)).toThrow();
    expect(() => getManagedPathFromUrl(`${root}/../system/secret`, root)).toThrow();
    expect(() => getManagedPathFromUrl(`${root}/py/example.py?token=1`, root)).toThrow();
  });
});
