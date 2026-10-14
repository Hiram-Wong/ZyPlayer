import { Buffer } from 'node:buffer';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const API_TOKEN = randomBytes(32).toString('base64url');

export const getApiToken = (): string => API_TOKEN;

export const isApiTokenValid = (authorization?: string): boolean => {
  const prefix = 'Bearer ';
  if (!authorization?.startsWith(prefix)) return false;

  const supplied = Buffer.from(authorization.slice(prefix.length), 'utf8');
  const expected = Buffer.from(API_TOKEN, 'utf8');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

export const isTrustedRendererUrl = (rawUrl: string): boolean => {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'file:') return url.pathname.endsWith('/renderer/index.html');

    const rendererUrl = process.env.ELECTRON_RENDERER_URL;
    return !!rendererUrl && url.origin === new URL(rendererUrl).origin;
  } catch {
    return false;
  }
};

export const isTrustedCorsOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (origin === 'null' || origin === 'file://') return true;

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (!rendererUrl) return false;

  try {
    return new URL(origin).origin === new URL(rendererUrl).origin;
  } catch {
    return false;
  }
};

export const isSameOriginUrl = (rawUrl: string, expectedOrigin: string): boolean => {
  try {
    return new URL(rawUrl).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
};

export const isPublicApiPath = (method: string, rawUrl: string): boolean => {
  const path = rawUrl.split('?', 1)[0];
  if (method === 'GET' && path.endsWith('/v1/system/health')) return true;
  return ['GET', 'HEAD'].includes(method) && path.endsWith('/v1/system/m3u8/adremove');
};
