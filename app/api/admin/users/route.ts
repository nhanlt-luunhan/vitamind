import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  display_name: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function GET() {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<UserRow>(
    `select id, clerk_user_id, email, name, display_name, role, status, avatar_url, created_at, updated_at
     from users
     order by created_at desc`,
  );
  return NextResponse.json({ users: rows });
}

export async function POST() {
  return NextResponse.json({ error: "Users are managed by Clerk." }, { status: 405 });
}
