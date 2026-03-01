import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { getSignedInDestination, type SessionUser } from "@/lib/auth/admin-auth";
import { normalizeGid } from "@/lib/utils/gid";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type LoginRow = SessionUser;

const normalizeIdentifier = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (text.includes("@")) return text;
  return normalizeGid(text) ?? text;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = normalizeIdentifier(body?.identifier);
  const password = String(body?.password ?? "");
  const remember = Boolean(body?.remember);

  if (!identifier || !password) {
    return NextResponse.json({ error: "Thiếu thông tin đăng nhập." }, { status: 400 });
  }

  const { rows, error } = await query<LoginRow>(
    `select id, clerk_user_id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at
     from users
     where (lower(email) = lower($1) or lower(coalesce(gid, '')) = lower($1))
       and password_hash is not null
       and password_hash = crypt($2, password_hash)
       and coalesce(status, 'active') = 'active'
     limit 1`,
    [identifier, password],
  );

  if (error) {
    return NextResponse.json({ error: "Không thể xác thực lúc này." }, { status: 500 });
  }

  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Email, GID hoặc mật khẩu không đúng." }, { status: 401 });
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
