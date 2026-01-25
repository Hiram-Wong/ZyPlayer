import type { FastifyPluginAsync } from 'fastify';

const generateRoutes = (): Array<{ plugin: FastifyPluginAsync; prefix?: string }> => {
  const routeModules = import.meta.glob<FastifyPluginAsync>('./v*/*/index.ts', { eager: true });

  return Object.entries(routeModules).flatMap(([path, subModule]) => {
    const versionMatch = path.match(/\.\/v(\d+)\//);
    const version = versionMatch ? `v${versionMatch[1]}` : null;

    return Object.values(subModule)
      .filter((handler): handler is FastifyPluginAsync => typeof handler === 'function')
      .map((handler) => ({
        plugin: handler,
        prefix: version === 'v0' ? undefined : version ? `api/${version}` : undefined,
      }));
  });
};

export default generateRoutes();
