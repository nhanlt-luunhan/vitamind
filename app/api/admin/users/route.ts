import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { canManageUsers } from "@/lib/auth/rbac";
import { drainClerkDeletionQueue, syncAllClerkUsers } from "@/lib/auth/clerk-sync";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const shouldSync = searchParams.get("sync") !== "0";
  const rawLimit = Number(searchParams.get("limit") ?? "");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), 200) : null;

  if (shouldSync) {
    try {
      await drainClerkDeletionQueue();
      await syncAllClerkUsers();
    } catch {
      // Keep serving the latest internal snapshot if Clerk is unavailable.
    }
  }

  const { rows } = await query<UserRow>(
    `select id, clerk_user_id, email, name, display_name, gid, role, status, avatar_url, created_at, updated_at
     from users
     order by coalesce(updated_at, created_at) desc, created_at desc
     ${limit ? "limit $1" : ""}`,
    limit ? [limit] : undefined,
  );
  return NextResponse.json({
    users: rows,
    meta: {
      synced: shouldSync,
      limit,
      polled_at: new Date().toISOString(),
    },
  });
}

export async function POST() {
  return NextResponse.json({ error: "Users are managed by Clerk." }, { status: 405 });
}
