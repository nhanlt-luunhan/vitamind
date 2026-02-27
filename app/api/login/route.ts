import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db/admin-db";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json({ error: "Thiáº¿u email hoáº·c máº­t kháº©u." }, { status: 400 });
  }

  const { rows } = await query<UserRow>(
    `
      select id, email, name, role
      from users
      where email = $1
        and password_hash = crypt($2, password_hash)
      limit 1
    `,
    [email, password],
  );

  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Sai email hoáº·c máº­t kháº©u." }, { status: 401 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    `
      insert into user_sessions (user_id, token, expires_at)
      values ($1, $2, $3)
    `,
    [user.id, token, expiresAt.toISOString()],
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vitamind_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

