import { lstat, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const isOutsideRoot = (root: string, target: string): boolean => {
  const rel = relative(root, target);
  return rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel);
};

export const resolvePathWithinBase = (basePath: string, requestedPath: string): string => {
  const normalized = requestedPath.replaceAll('\\', '/').trim();
  const segments = normalized.split('/');

  if (
    !normalized ||
    normalized.includes('\0') ||
    normalized.startsWith('/') ||
    /^[a-z]:\//i.test(normalized) ||
    segments.some((segment) => segment === '..' || segment === '')
  ) {
    throw new Error('Invalid managed file path');
  }

  const target = resolve(basePath, ...segments);
  if (isOutsideRoot(resolve(basePath), target)) {
    throw new Error('Managed file path escapes the application directory');
  }
  return target;
};

export const getManagedPathFromUrl = (rawUrl: string, managedApiRoot: string): string => {
  const url = new URL(rawUrl);
  const root = new URL(managedApiRoot.endsWith('/') ? managedApiRoot : `${managedApiRoot}/`);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname) || url.search || url.hash) {
    throw new Error('URL is outside the managed file API');
  }

  return decodeURIComponent(url.pathname.slice(root.pathname.length));
};

export const resolveManagedPath = async (basePath: string, requestedPath: string): Promise<string> => {
  const root = await realpath(basePath);
  const target = resolvePathWithinBase(root, requestedPath);
  const relativeSegments = relative(root, target).split(sep);

  let current = root;
  for (const segment of relativeSegments) {
    current = resolve(current, segment);
    try {
      const state = await lstat(current);
      if (state.isSymbolicLink()) throw new Error('Symbolic links are not allowed in managed file paths');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') break;
      throw error;
    }
  }

  return target;
};
