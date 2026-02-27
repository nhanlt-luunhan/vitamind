import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db/admin-db";

const parseAllowlist = () => {
  const raw = process.env.ALLOW_EMAILS;
  if (!raw) return null;
  const items = raw
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return items.length ? new Set(items) : null;
};

const allowlist = parseAllowlist();

type UserRow = {
  id: string;
  email: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();
  const name = body?.name?.toString().trim() || null;

  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu email hoặc mật khẩu." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự." }, { status: 400 });
  }

  if (allowlist && !allowlist.has(email)) {
    return NextResponse.json({ error: "Email chưa được cấp quyền đăng ký." }, { status: 403 });
  }

  const { rows: existingRows } = await query<UserRow>(
    `select id, email from users where email = $1 limit 1`,
    [email],
  );
  if (existingRows[0]) {
    return NextResponse.json({ error: "Email đã tồn tại." }, { status: 409 });
  }

  const { rows, error } = await query<UserRow>(
    `
      insert into users (email, password_hash, name, role, status)
      values ($1, crypt($2, gen_salt('bf')), $3, 'viewer', 'active')
      returning id, email
    `,
    [email, password, name],
  );

  if (error || !rows[0]) {
    return NextResponse.json({ error: error ?? "Không thể tạo tài khoản." }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    `
      insert into user_sessions (user_id, token, expires_at)
      values ($1, $2, $3)
    `,
    [rows[0].id, token, expiresAt.toISOString()],
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
