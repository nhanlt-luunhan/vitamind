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

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacyLoginRow(row: Record<string, unknown>): LoginRow {
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
    role: typeof row.role === "string" ? row.role : null,
    status: "active",
    avatar_url: null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = normalizeIdentifier(body?.identifier);
  const password = String(body?.password ?? "");
  const remember = Boolean(body?.remember);

  if (!identifier || !password) {
    return NextResponse.json({ error: "Thieu thong tin dang nhap." }, { status: 400 });
  }

  const current = await query<LoginRow>(
    `select id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at
     from users
     where (lower(email) = lower($1) or lower(coalesce(gid, '')) = lower($1))
       and password_hash is not null
       and password_hash = crypt($2, password_hash)
       and coalesce(status, 'active') = 'active'
     limit 1`,
    [identifier, password],
  );

  let user: LoginRow | null = current.rows[0] ?? null;
  if (current.error) {
    if (!isMissingUsersColumnError(current.error)) {
      return NextResponse.json({ error: "Khong the xac thuc luc nay." }, { status: 500 });
    }

    const legacy = await query<Record<string, unknown>>(
      `select id, email, name, role, updated_at
       from users
       where lower(email) = lower($1)
         and password_hash is not null
         and password_hash = crypt($2, password_hash)
       limit 1`,
      [identifier, password],
    );

    if (legacy.error) {
      return NextResponse.json({ error: "Khong the xac thuc luc nay." }, { status: 500 });
    }

    user = legacy.rows[0] ? toLegacyLoginRow(legacy.rows[0]) : null;
  }

  if (!user) {
    return NextResponse.json({ error: "Email hoac mat khau khong dung." }, { status: 401 });
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
