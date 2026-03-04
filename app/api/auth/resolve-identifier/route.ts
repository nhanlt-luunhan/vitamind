import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { normalizeGid } from "@/lib/utils/gid";

export const dynamic = "force-dynamic";

type UserLookupRow = {
  email: string;
  password_hash: string | null;
};

const normalizeIdentifier = (value: unknown) => String(value ?? "").trim();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = normalizeIdentifier(body?.identifier);

  if (!identifier) {
    return NextResponse.json({ error: "Thieu thong tin dang nhap." }, { status: 400 });
  }

  if (identifier.includes("@")) {
    const email = identifier.toLowerCase();
    const { rows } = await query<UserLookupRow>(
      `select email, password_hash
       from users
       where lower(email) = lower($1)
         and coalesce(status, 'active') = 'active'
       limit 1`,
      [email],
    );

    if (rows[0]?.password_hash) {
      return NextResponse.json({ mode: "db", identifier: email });
    }

    return NextResponse.json({ mode: "unknown", identifier: email });
  }

  const gid = normalizeGid(identifier);
  if (!gid) {
    return NextResponse.json({ mode: "unknown", identifier });
  }

  const { rows, error } = await query<UserLookupRow>(
    `select email, password_hash
     from users
     where lower(gid) = lower($1)
       and coalesce(status, 'active') = 'active'
     limit 1`,
    [gid],
  );

  if (error) {
    return NextResponse.json({ error: "Khong the xu ly yeu cau luc nay." }, { status: 500 });
  }

  if (!rows[0]?.email || !rows[0].password_hash) {
    return NextResponse.json({ mode: "unknown", identifier: gid });
  }

  return NextResponse.json({ mode: "db", identifier: gid });
}
