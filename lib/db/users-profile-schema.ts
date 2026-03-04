import { query, type QueryResult } from "@/lib/db/admin-db";

const USERS_PROFILE_SCHEMA_SQL = `
alter table users
  add column if not exists display_name text,
  add column if not exists contact_email text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists avatar_url text,
  add column if not exists gid text,
  add column if not exists clerk_user_id text,
  add column if not exists status text default 'active';

update users
set contact_email = email
where contact_email is null or btrim(contact_email) = '';

update users
set display_name = coalesce(nullif(name, ''), split_part(email, '@', 1))
where display_name is null or btrim(display_name) = '';

update users
set status = 'active'
where status is null or btrim(status) = '';
`;

export function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

let ensureUsersProfileColumnsPromise: Promise<QueryResult<Record<string, unknown>>> | null = null;

export async function ensureUsersProfileColumns() {
  if (!ensureUsersProfileColumnsPromise) {
    ensureUsersProfileColumnsPromise = query<Record<string, unknown>>(USERS_PROFILE_SCHEMA_SQL);
  }

  const result = await ensureUsersProfileColumnsPromise;
  if (result.error) {
    ensureUsersProfileColumnsPromise = null;
  }
  return result;
}

export async function queryUsersWithProfileColumns<T extends Record<string, unknown>>(
  text: string,
  params?: Array<unknown>,
): Promise<QueryResult<T>> {
  const first = await query<T>(text, params);
  if (!isMissingUsersColumnError(first.error)) {
    return first;
  }

  const ensured = await ensureUsersProfileColumns();
  if (ensured.error) {
    return { rows: [], error: ensured.error };
  }

  return query<T>(text, params);
}
