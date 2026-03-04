import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";
import { isMailConfigured, sendEmailVerificationCode } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  const secret =
    process.env.AUTH_SESSION_SECRET ??
    process.env.INTERNAL_API_SECRET ??
    "change-me-verify-secret";
  return createHash("sha256").update(`verify:${email}:${code}:${secret}`).digest("hex");
}

function createOtpCode() {
  return String(randomInt(100000, 1000000));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  // Kiểm tra email đã tồn tại chưa
  const existingResult = await query<{ id: string }>(
    `select id from users where lower(email) = lower($1) limit 1`,
    [email],
  );

  if (existingResult.error) {
    return NextResponse.json({ error: "Không thể xử lý yêu cầu lúc này." }, { status: 500 });
  }

  if (existingResult.rows[0]) {
    return NextResponse.json(
      { error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
      { status: 409 },
    );
  }

  const code = createOtpCode();
  const codeHash = hashCode(email, code);

  // Xóa token cũ của email này (nếu có) và các token hết hạn
  const cleanResult = await query(
    `delete from email_verification_tokens
     where lower(email) = lower($1)
        or expires_at <= now()
        or consumed_at is not null`,
    [email],
  );

  if (cleanResult.error) {
    return NextResponse.json({ error: "Không thể tạo mã xác thực." }, { status: 500 });
  }

  const insertResult = await query(
    `insert into email_verification_tokens (email, code_hash, expires_at)
     values ($1, $2, now() + interval '15 minutes')`,
    [email, codeHash],
  );

  if (insertResult.error) {
    return NextResponse.json({ error: "Không thể tạo mã xác thực." }, { status: 500 });
  }

  try {
    if (isMailConfigured()) {
      await sendEmailVerificationCode(email, code);
    } else if (process.env.NODE_ENV === "production") {
      await query(
        `delete from email_verification_tokens where lower(email) = lower($1) and code_hash = $2`,
        [email, codeHash],
      );
      return NextResponse.json(
        { error: "SMTP chưa được cấu hình để gửi mã xác thực." },
        { status: 500 },
      );
    }
  } catch {
    await query(
      `delete from email_verification_tokens where lower(email) = lower($1) and code_hash = $2`,
      [email, codeHash],
    );
    return NextResponse.json({ error: "Không thể gửi email xác thực lúc này." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Mã xác thực đã được gửi tới email của bạn.",
    // Chỉ trả về code trong môi trường dev để dễ test
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
