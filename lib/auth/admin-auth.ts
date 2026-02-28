import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db/admin-db";
import { syncClerkUserById } from "@/lib/auth/clerk-sync";

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

async function fetchUserByClerkId(clerkUserId: string): Promise<SessionUser | null> {
  const { rows } = await query<SessionUser>(
    `select id, clerk_user_id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at
     from users
     where clerk_user_id = $1
     limit 1`,
    [clerkUserId],
  );
  return rows[0] ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    await syncClerkUserById(userId);
  } catch {
    // Fall back to the last synced internal profile if Clerk is temporarily unreachable.
  }
  const user = await fetchUserByClerkId(userId);
  if (user?.status && user.status !== "active") {
    return null;
  }
  return user;
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
