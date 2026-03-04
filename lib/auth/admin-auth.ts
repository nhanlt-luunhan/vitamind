import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db/admin-db";
import { syncClerkUserById } from "@/lib/auth/clerk-sync";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type SessionUser = {
  id: string;
  clerk_user_id: string | null;
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
  return user.role === "admin" ? "/admin" : "/";
}

const SESSION_USER_SELECT =
  "id, clerk_user_id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at";
const LEGACY_SESSION_USER_SELECT = "id, email, name, role, updated_at";

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacySessionUser(row: Record<string, unknown>): SessionUser {
  const name = typeof row.name === "string" ? row.name : null;
  const email = typeof row.email === "string" ? row.email : "";

  return {
    id: String(row.id ?? ""),
    clerk_user_id: null,
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

async function fetchUserByClerkId(clerkUserId: string): Promise<SessionUser | null> {
  return selectSessionUser("clerk_user_id = $1", [clerkUserId]);
}

async function fetchUserById(userId: string): Promise<SessionUser | null> {
  return selectSessionUser("id = $1", [userId]);
}

async function fetchUserByEmail(email: string): Promise<SessionUser | null> {
  return selectSessionUser("lower(email) = lower($1)", [email]);
}

async function fetchClerkPrimaryEmail(clerkUserId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    return user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  // Try Clerk auth first — if no Clerk session or Clerk is not configured, fall through to cookie
  try {
    const { userId } = await auth();

    if (userId) {
      let syncedUser: SessionUser | null = null;
      try {
        syncedUser = await syncClerkUserById(userId);
      } catch {
        // Fall back to the last synced internal profile if Clerk is temporarily unreachable.
      }
      let user = syncedUser ?? (await fetchUserByClerkId(userId));
      if (!user) {
        const clerkEmail = await fetchClerkPrimaryEmail(userId);
        if (clerkEmail) {
          user = await fetchUserByEmail(clerkEmail);
        }
      }
      if (user?.status && user.status !== "active") {
        return null;
      }
      if (user) {
        return user;
      }
      // No DB record found for this Clerk user — return null so the caller
      // can redirect appropriately (e.g. to /sign-in or show an error).
    }
  } catch {
    // Clerk not configured or threw — fall through to cookie-based session
  }

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
