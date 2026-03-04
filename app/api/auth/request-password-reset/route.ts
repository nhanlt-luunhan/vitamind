import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { isMailConfigured, sendPasswordResetCodeEmail } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string;
};

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function hashResetCode(email: string, code: string) {
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.INTERNAL_API_SECRET ?? "change-me-reset-secret";
  return createHash("sha256").update(`${email}:${code}:${secret}`).digest("hex");
}

function createResetCode() {
  return String(randomInt(100000, 1000000));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);

  if (!email) {
    return NextResponse.json({ error: "Thiếu email." }, { status: 400 });
  }

  const userResult = await query<UserRow>(
    `select id, email
     from users
     where lower(email) = lower($1)
       and coalesce(status, 'active') = 'active'
     limit 1`,
    [email],
  );

  if (userResult.error) {
    return NextResponse.json({ error: "Không thể xử lý yêu cầu lúc này." }, { status: 500 });
  }

  const user = userResult.rows[0] ?? null;
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản phù hợp." }, { status: 404 });
  }

  const code = createResetCode();
  const codeHash = hashResetCode(user.email.toLowerCase(), code);

  const resetResult = await query(
    `delete from password_reset_tokens
      where user_id = $1
         or expires_at <= now()
         or consumed_at is not null`,
    [user.id],
  );

  if (resetResult.error) {
    return NextResponse.json({ error: "Không thể tạo mã khôi phục." }, { status: 500 });
  }

  const insertResult = await query(
    `insert into password_reset_tokens (user_id, email, code_hash, expires_at)
     values ($1, $2, $3, now() + interval '15 minutes')`,
    [user.id, user.email.toLowerCase(), codeHash],
  );

  if (insertResult.error) {
    return NextResponse.json({ error: "Không thể tạo mã khôi phục." }, { status: 500 });
  }

  try {
    if (isMailConfigured()) {
      await sendPasswordResetCodeEmail(user.email, code);
    } else if (process.env.NODE_ENV === "production") {
      await query(`delete from password_reset_tokens where user_id = $1 and code_hash = $2`, [user.id, codeHash]);
      return NextResponse.json(
        { error: "SMTP chưa được cấu hình để gửi mã khôi phục." },
        { status: 500 },
      );
    }
  } catch {
    await query(`delete from password_reset_tokens where user_id = $1 and code_hash = $2`, [user.id, codeHash]);
    return NextResponse.json({ error: "Không thể gửi email khôi phục lúc này." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Mã khôi phục đã được gửi tới email của bạn.",
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
