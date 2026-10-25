import fs from 'node:fs';
import path from 'node:path';

const SCHEMA_FILE = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
const globalStore = globalThis;

function statementList(schema) {
  return schema
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function connect() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const { default: postgres } = await import('postgres');
    const sql = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      ssl: process.env.DATABASE_SSL === 'true' ? 'require' : undefined,
    });
    const exec = async (text) => {
      await sql.begin(async (trx) => {
        for (const statement of statementList(text)) {
          await trx.unsafe(statement);
        }
      });
    };
    return {
      driver: 'postgres',
      query: async (text, params = []) => sql.unsafe(text, params),
      tx: async (fn) =>
        sql.begin(async (trx) =>
          fn({ query: (text, params = []) => trx.unsafe(text, params) }),
        ),
      exec,
      close: () => sql.end({ timeout: 5 }),
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = path.resolve(
    process.cwd(),
    process.env.PGLITE_DIR || '.data/martify-pg',
  );
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const db = new PGlite(dataDir);
  await db.waitReady;

  return {
    driver: 'pglite',
    dataDir,
    query: async (text, params = []) => (await db.query(text, params)).rows,
    tx: async (fn) =>
      db.transaction(async (trx) =>
        fn({
          query: async (text, params = []) =>
            (await trx.query(text, params)).rows,
        }),
      ),
    exec: (text) => db.exec(text),
    close: () => db.close(),
  };
}

async function initialize() {
  const database = await connect();
  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  await database.exec(schema);

  const [{ count }] = await database.query(
    'SELECT count(*)::int AS count FROM users',
  );

  if (Number(count) === 0 && process.env.AUTO_SEED !== 'false') {
    const { seedDatabase } = await import('./seed.js');
    await seedDatabase(database);
  }

  globalStore.__martifyDriver = database.driver;
  return database;
}

function databasePromise() {
  if (!globalStore.__martifyDbPromise) {
    globalStore.__martifyDbPromise = initialize().catch((error) => {
      globalStore.__martifyDbPromise = null;
      throw error;
    });
  }
  return globalStore.__martifyDbPromise;
}

export async function getDatabase() {
  return databasePromise();
}

export async function query(text, params = []) {
  const database = await databasePromise();
  return database.query(text, params);
}

export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

export async function transaction(fn) {
  const database = await databasePromise();
  return database.tx(fn);
}

export async function getDatabaseInfo() {
  const database = await databasePromise();
  return {
    driver: database.driver,
    dataDir: database.dataDir ?? null,
    managed: Boolean(process.env.DATABASE_URL),
  };
}
