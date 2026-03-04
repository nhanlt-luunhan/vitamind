import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { query } from "@/lib/db/admin-db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type SessionUser = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  phone: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

export function getSignedInDestination(user: Pick<SessionUser, "role">) {
  if (user.role === "admin") return "/admin";
  return "/";
}

const SESSION_USER_SELECT =
  "id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at";
const LEGACY_SESSION_USER_SELECT = "id, email, name, role, updated_at";

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacySessionUser(row: Record<string, unknown>): SessionUser {
  const name = typeof row.name === "string" ? row.name : null;
  const email = typeof row.email === "string" ? row.email : "";

  return {
    id: String(row.id ?? ""),
    email,
    contact_email: email || null,
    name,
    display_name: name,
    gid: null,
    phone: null,
    role: typeof row.role === "string" ? row.role : null,
    status: "active",
    avatar_url: null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

async function selectSessionUser(whereClause: string, params: Array<unknown>) {
  const current = await query<SessionUser>(
    `select ${SESSION_USER_SELECT}
     from users
     where ${whereClause}
     limit 1`,
    params,
  );

  if (!current.error) {
    return current.rows[0] ?? null;
  }

  if (!isMissingUsersColumnError(current.error)) {
    return null;
  }

  const legacy = await query<Record<string, unknown>>(
    `select ${LEGACY_SESSION_USER_SELECT}
     from users
     where ${whereClause}
     limit 1`,
    params,
  );

  if (legacy.error) {
    return null;
  }

  return legacy.rows[0] ? toLegacySessionUser(legacy.rows[0]) : null;
}

async function fetchUserById(userId: string): Promise<SessionUser | null> {
  return selectSessionUser("id = $1", [userId]);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const claims = await verifySessionToken(token);
  if (!claims?.sub) return null;

  const dbUser = await fetchUserById(claims.sub);
  if (dbUser?.status && dbUser.status !== "active") {
    return null;
  }
  return dbUser;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (user.status && user.status !== "active") {
    redirect("/not-authorized");
  }
  if (user.role && user.role !== "admin") {
    redirect("/not-authorized");
  }
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (user.status && user.status !== "active") {
    redirect("/not-authorized");
  }
  return user;
}
