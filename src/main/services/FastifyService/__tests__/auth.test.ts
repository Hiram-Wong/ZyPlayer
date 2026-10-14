import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getApiToken,
  isApiTokenValid,
  isPublicApiPath,
  isSameOriginUrl,
  isTrustedCorsOrigin,
  isTrustedRendererUrl,
} from '../auth';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('fastify API security', () => {
  it('accepts only the per-process bearer token', () => {
    expect(isApiTokenValid()).toBe(false);
    expect(isApiTokenValid('Bearer invalid')).toBe(false);
    expect(isApiTokenValid(`Bearer ${getApiToken()}`)).toBe(true);
  });

  it('limits public routes to health and media playback', () => {
    expect(isPublicApiPath('GET', '/api/v1/system/health')).toBe(true);
    expect(isPublicApiPath('GET', '/api/v1/system/m3u8/adremove?url=https://example.com/a.m3u8')).toBe(true);
    expect(isPublicApiPath('POST', '/api/v1/data/db/export')).toBe(false);
    expect(isPublicApiPath('GET', '/api/v1/setting/list')).toBe(false);
  });

  it('allows only the application renderer origin', () => {
    vi.stubEnv('ELECTRON_RENDERER_URL', 'http://localhost:5173');

    expect(isTrustedCorsOrigin('http://localhost:5173')).toBe(true);
    expect(isTrustedCorsOrigin('https://attacker.example')).toBe(false);
    expect(isTrustedRendererUrl('http://localhost:5173/#/player')).toBe(true);
    expect(isTrustedRendererUrl('https://attacker.example')).toBe(false);
    expect(isTrustedRendererUrl('file:///opt/zyfun/out/renderer/index.html')).toBe(true);
    expect(isTrustedRendererUrl('file:///tmp/poc.html')).toBe(false);
  });

  it('does not confuse a URL prefix with the local API origin', () => {
    const localApi = 'http://127.0.0.1:9978';
    expect(isSameOriginUrl(`${localApi}/api/v1/system/health`, localApi)).toBe(true);
    expect(isSameOriginUrl('http://127.0.0.1:9978@attacker.example/collect', localApi)).toBe(false);
  });
});
