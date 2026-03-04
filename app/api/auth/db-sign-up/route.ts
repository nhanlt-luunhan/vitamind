import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { getSignedInDestination, type SessionUser } from "@/lib/auth/admin-auth";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type SignUpRow = SessionUser;

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeName(value: unknown) {
  const name = String(value ?? "").trim();
  return name || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? "");
  const fullName = normalizeName(body?.fullName);
  const remember = Boolean(body?.remember);

  if (!email || !password) {
    return NextResponse.json({ error: "Thieu thong tin dang ky." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email khong hop le." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Mat khau can it nhat 8 ky tu." }, { status: 400 });
  }

  const result = await query<SignUpRow>(
    `insert into users (
       email,
       password_hash,
       name,
       display_name,
       contact_email,
       role,
       status
     )
     values (
       $1,
       crypt($2, gen_salt('bf')),
       $3,
       coalesce($3, split_part($1, '@', 1)),
       $1,
       'viewer',
       'active'
     )
     on conflict (email) do nothing
     returning id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at`,
    [email, password, fullName],
  );

  if (result.error) {
    return NextResponse.json({ error: "Khong the tao tai khoan luc nay." }, { status: 500 });
  }

  const user = result.rows[0] ?? null;
  if (!user) {
    return NextResponse.json({ error: "Email nay da duoc su dung." }, { status: 409 });
  }

  const token = await createSessionToken(
    { sub: user.id, role: user.role, status: user.status },
    remember,
  );

  const response = NextResponse.json({
    ok: true,
    user,
    destination: getSignedInDestination(user),
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(remember));
  return response;
}
