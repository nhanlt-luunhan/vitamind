import { Pool, type PoolClient } from "pg";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const connectionString = process.env.DATABASE_URL;

type GlobalWithPg = typeof globalThis & { adminPgPool?: Pool };
const globalForPg = globalThis as GlobalWithPg;

const pool = connectionString
  ? (globalForPg.adminPgPool ?? new Pool({ connectionString, max: 5 }))
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForPg.adminPgPool = pool;
}

export type QueryResult<T> = {
  rows: T[];
  error?: string;
};

export async function query<T extends Record<string, unknown>>(
  text: string,
  params?: Array<unknown>,
): Promise<QueryResult<T>> {
  if (!pool) {
    if (isBuildPhase) return { rows: [] };
    return { rows: [], error: "DATABASE_URL is not set." };
  }
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows };
  } catch (error) {
    return { rows: [], error: (error as Error).message };
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<{ result?: T; error?: string }> {
  if (!pool) {
    if (isBuildPhase) return {};
    return { error: "DATABASE_URL is not set." };
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return { result };
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    return { error: (error as Error).message };
  } finally {
    client.release();
  }
}
