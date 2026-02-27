import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db/admin-db";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string | null;
};

async function getUserFromLegacySession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitamind_session")?.value;
  if (!token) return null;

  const { rows } = await query<SessionUser>(
    `
      select u.id, u.email, u.name, u.role, u.status
      from user_sessions s
      join users u on u.id = s.user_id
      where s.token = $1
        and s.expires_at > now()
      limit 1
    `,
    [token],
  );

  const legacy = rows[0] ?? null;
  if (legacy?.status && legacy.status !== "active") {
    return null;
  }
  return legacy;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return getUserFromLegacySession();
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.status && user.status !== "active") {
    redirect("/login");
  }
  if (user.role && user.role !== "admin") {
    redirect("/login");
  }
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.status && user.status !== "active") {
    redirect("/login");
  }
  return user;
}
