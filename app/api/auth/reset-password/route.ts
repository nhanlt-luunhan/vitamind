import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db/admin-db";
import { getSignedInDestination } from "@/lib/auth/admin-auth";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ResetTokenRow = {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  status: string | null;
};

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function hashResetCode(email: string, code: string) {
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.INTERNAL_API_SECRET ?? "change-me-reset-secret";
  return createHash("sha256").update(`${email}:${code}:${secret}`).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const code = String(body?.code ?? "").trim();
  const password = String(body?.password ?? "");

  if (!email || !code || !password) {
    return NextResponse.json({ error: "Thiếu thông tin đặt lại mật khẩu." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Mật khẩu cần ít nhất 8 ký tự." }, { status: 400 });
  }

  const codeHash = hashResetCode(email, code);
  const tokenResult = await query<ResetTokenRow>(
    `select t.id, t.user_id, t.email, u.role, u.status
     from password_reset_tokens t
     join users u on u.id = t.user_id
     where lower(t.email) = lower($1)
       and t.code_hash = $2
       and t.consumed_at is null
       and t.expires_at > now()
       and coalesce(u.status, 'active') = 'active'
     order by t.created_at desc
     limit 1`,
    [email, codeHash],
  );

  if (tokenResult.error) {
    return NextResponse.json({ error: "Không thể xác minh mã khôi phục." }, { status: 500 });
  }

  const tokenRow = tokenResult.rows[0] ?? null;
  if (!tokenRow) {
    return NextResponse.json({ error: "Mã khôi phục không hợp lệ hoặc đã hết hạn." }, { status: 400 });
  }

  const tx = await withTransaction(async (client) => {
    await client.query(
      `update users
       set password_hash = crypt($2, gen_salt('bf')),
           updated_at = now()
       where id = $1`,
      [tokenRow.user_id, password],
    );

    await client.query(
      `update password_reset_tokens
       set consumed_at = now()
       where user_id = $1
         and consumed_at is null`,
      [tokenRow.user_id],
    );
  });

  if (tx.error) {
    return NextResponse.json({ error: "Không thể cập nhật mật khẩu." }, { status: 500 });
  }

  const user = {
    id: tokenRow.user_id,
    role: tokenRow.role,
    status: tokenRow.status,
  };

  const sessionToken = await createSessionToken(
    { sub: user.id, role: user.role, status: user.status },
    true,
  );

  const response = NextResponse.json({
    ok: true,
    destination: getSignedInDestination(user),
  });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(true));
  return response;
}
