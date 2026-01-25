import type { IMigrate, IMigrations } from '@shared/types/db';
import semver from 'semver';

const pathToVersion = (path: string): string => {
  const match = path.match(/migrate-(\d+_\d+_\d+)\.ts/);
  return match![1].replaceAll('_', '.');
};

const generateMigrations = (): IMigrations => {
  const migrateModules = import.meta.glob<IMigrate>('./migrate-*.ts', {
    eager: true,
    import: 'default',
  });

  // Export order is important
  return Object.entries(migrateModules)
    .sort(([aPath], [bPath]) => semver.compare(pathToVersion(aPath), pathToVersion(bPath)))
    .map(([path, module]) => {
      return { version: pathToVersion(path), migrate: module };
    });
};

const migrations = generateMigrations();
export const initMigrate = migrations[0];
export const updateMigrate = migrations.slice(1);
export const latestVersion = migrations.at(-1)!.version;

export default migrations;
