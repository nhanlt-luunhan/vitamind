import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { query } from "@/lib/db/admin-db";
import { normalizeGid } from "@/lib/utils/gid";

export const dynamic = "force-dynamic";

type UserLookupRow = {
  email: string;
  clerk_user_id: string | null;
  password_hash: string | null;
};

const normalizeIdentifier = (value: unknown) => String(value ?? "").trim();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = normalizeIdentifier(body?.identifier);

  if (!identifier) {
    return NextResponse.json({ error: "Thiếu thông tin đăng nhập." }, { status: 400 });
  }

  const client = await clerkClient();

  if (identifier.includes("@")) {
    const email = identifier.toLowerCase();
    const { rows } = await query<UserLookupRow>(
      `select email, clerk_user_id, password_hash
       from users
       where lower(email) = lower($1)
         and coalesce(status, 'active') = 'active'
       limit 1`,
      [email],
    );

    if (rows[0]?.password_hash) {
      return NextResponse.json({ mode: "db", identifier: email });
    }

    if (rows[0]?.clerk_user_id) {
      return NextResponse.json({ mode: "clerk", identifier: email });
    }

    if (rows[0]?.email) {
      return NextResponse.json({ mode: "unknown", identifier: email });
    }

    try {
      const users = await client.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      if (users.data[0]?.id) {
        return NextResponse.json({ mode: "clerk", identifier: email });
      }
    } catch {
      // Fall back to local DB lookup if Clerk is temporarily unavailable.
    }

    // Email not found in DB or Clerk — do not assume clerk mode
    return NextResponse.json({ mode: "unknown", identifier: email });
  }

  const gid = normalizeGid(identifier);
  if (!gid) {
    return NextResponse.json({ mode: "unknown", identifier });
  }

  const { rows, error } = await query<UserLookupRow>(
    `select email, clerk_user_id, password_hash
     from users
     where lower(gid) = lower($1)
      and coalesce(status, 'active') = 'active'
     limit 1`,
    [gid],
  );

  if (error) {
    return NextResponse.json({ error: "Không thể xử lý GID lúc này." }, { status: 500 });
  }

  if (!rows[0]?.email) {
    return NextResponse.json({ mode: "unknown", identifier: gid });
  }

  if (rows[0].password_hash) {
    return NextResponse.json({ mode: "db", identifier: gid });
  }

  if (rows[0].clerk_user_id) {
    return NextResponse.json({ mode: "clerk", identifier: rows[0].email.toLowerCase() });
  }

  return NextResponse.json({ mode: "unknown", identifier: gid });
}
