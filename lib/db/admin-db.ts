import { Pool } from "pg";

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
