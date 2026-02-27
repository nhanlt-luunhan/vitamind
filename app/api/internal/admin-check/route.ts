import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  role: string | null;
  status: string | null;
};

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing internal secret" }, { status: 500 });
  }

  const headerSecret = request.headers.get("x-internal-secret");
  if (headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUserId = request.headers.get("x-clerk-user-id");
  if (!clerkUserId) {
    return NextResponse.json({ error: "Missing user" }, { status: 400 });
  }

  const { rows } = await query<UserRow>(
    `select id, role, status
     from users
     where clerk_user_id = $1
     limit 1`,
    [clerkUserId],
  );

  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.status && user.status !== "active") {
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
