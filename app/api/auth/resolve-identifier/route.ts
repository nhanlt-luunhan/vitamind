import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

type UserLookupRow = {
  email: string;
};

const normalizeIdentifier = (value: unknown) => String(value ?? "").trim();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = normalizeIdentifier(body?.identifier);

  if (!identifier) {
    return NextResponse.json({ error: "Thiếu thông tin đăng nhập." }, { status: 400 });
  }

  if (identifier.includes("@")) {
    return NextResponse.json({ identifier: identifier.toLowerCase() });
  }

  const { rows, error } = await query<UserLookupRow>(
    `select email
     from users
     where lower(gid) = lower($1)
       and coalesce(status, 'active') = 'active'
     limit 1`,
    [identifier],
  );

  if (error) {
    return NextResponse.json({ error: "Không thể xử lý GID lúc này." }, { status: 500 });
  }

  if (!rows[0]?.email) {
    return NextResponse.json({ identifier });
  }

  return NextResponse.json({ identifier: rows[0].email.toLowerCase() });
}
