import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
// import { migrate } from 'drizzle-orm/pglite/migrator';
import { app } from 'electron';
import { join } from 'path';
import * as schema from './schema';

const DB_PATH = join(app.getPath('userData'), 'database');

const client = new PGlite(DB_PATH);
const db = drizzle({ client, schema });
// const migrateAfterClientReady = async () => {
//   if (!client.ready) await client.waitReady;
//   console.log(111);
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
