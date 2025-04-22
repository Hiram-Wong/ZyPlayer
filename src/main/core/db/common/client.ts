import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
// import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';
import { APP_DB_PATH } from '@main/utils/hiker/path';

const DB_PATH = APP_DB_PATH;

const client = new PGlite(DB_PATH);
const db = drizzle({ client, schema });

// const migrateAfterClientReady = async () => {
//   if (!client.ready) await client.waitReady;
//   await migrate(db, {
//     migrationsFolder: join(DB_PATH, '/db/drizzle/'), // set to your drizzle generated path
//     migrationsSchema: join(DB_PATH, '/db/schema'), // set to your schema path
//     migrationsTable: '__migrations',
//   });
// };
// migrateAfterClientReady();

const server = async () => {
  // @ts-ignore
  const { createServer } = await import('pglite-server');
  await client.waitReady;
  const PORT = 5432;
  const pgServer = createServer(client);
  pgServer.listen(PORT, () => {});
};

export { client, db, server };
