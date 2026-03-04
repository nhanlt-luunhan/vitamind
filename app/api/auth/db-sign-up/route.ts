import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { getSignedInDestination, type SessionUser } from "@/lib/auth/admin-auth";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { verifyVerifiedToken } from "@/app/api/auth/verify-email/route";

export const dynamic = "force-dynamic";

type SignUpRow = SessionUser;

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeName(value: unknown) {
  const name = String(value ?? "").trim();
  return name || null;
}

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacySignUpRow(row: Record<string, unknown>): SignUpRow {
  const name = typeof row.name === "string" ? row.name : null;
  const email = typeof row.email === "string" ? row.email : "";

  return {
    id: String(row.id ?? ""),
    email,
    contact_email: email || null,
    name,
    display_name: name,
    gid: null,
    phone: null,
    role: typeof row.role === "string" ? row.role : "viewer",
    status: "active",
    avatar_url: null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

async function insertCurrentUser(email: string, password: string, fullName: string | null) {
  return query<SignUpRow>(
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
}

async function insertLegacyUser(email: string, password: string, fullName: string | null) {
  return query<Record<string, unknown>>(
    `insert into users (
       email,
       password_hash,
       name,
       role
     )
     values (
       $1,
       crypt($2, gen_salt('bf')),
       $3,
       'viewer'
     )
     on conflict (email) do nothing
     returning id, email, name, role, updated_at`,
    [email, password, fullName],
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? "");
  const fullName = normalizeName(body?.fullName);
  const remember = Boolean(body?.remember);
  const verifiedToken = String(body?.verified_token ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu thông tin đăng ký." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Mật khẩu cần ít nhất 8 ký tự." }, { status: 400 });
  }

  // Kiểm tra verified_token hợp lệ (cấp bởi /api/auth/verify-email)
  if (!verifyVerifiedToken(email, verifiedToken)) {
    return NextResponse.json(
      { error: "Email chưa được xác thực. Vui lòng nhập mã xác thực." },
      { status: 403 },
    );
  }

  const current = await insertCurrentUser(email, password, fullName);

  let user: SignUpRow | null = current.rows[0] ?? null;
  if (current.error) {
    if (!isMissingUsersColumnError(current.error)) {
      console.error("db-sign-up current insert failed:", current.error);
      return NextResponse.json({ error: "Không thể tạo tài khoản lúc này." }, { status: 500 });
    }

    const legacy = await insertLegacyUser(email, password, fullName);
    if (legacy.error) {
      console.error("db-sign-up legacy insert failed:", legacy.error);
      return NextResponse.json({ error: "Không thể tạo tài khoản lúc này." }, { status: 500 });
    }

    user = legacy.rows[0] ? toLegacySignUpRow(legacy.rows[0]) : null;
  }

  if (!user) {
    return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 409 });
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
