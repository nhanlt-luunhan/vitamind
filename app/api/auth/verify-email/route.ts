import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

type TokenRow = {
  id: string;
  email: string;
  code_hash: string;
  expires_at: string;
  consumed_at: string | null;
};

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

/**
 * Tạo một verified_token ngắn hạn (dùng 1 lần) để đính kèm vào request db-sign-up.
 * Token này chỉ là random hex, không phải JWT, vì nó được kiểm tra trực tiếp trong DB.
 */
function createVerifiedToken(email: string) {
  const secret =
    process.env.AUTH_SESSION_SECRET ??
    process.env.INTERNAL_API_SECRET ??
    "change-me-verify-secret";
  const nonce = randomBytes(16).toString("hex");
  const timestamp = Date.now();
  // Tạo HMAC-like token: nonce:timestamp:hash
  const signature = createHash("sha256")
    .update(`verified:${email}:${nonce}:${timestamp}:${secret}`)
    .digest("hex");
  return `${nonce}.${timestamp}.${signature}`;
}

export function verifyVerifiedToken(email: string, token: string): boolean {
  try {
    const secret =
      process.env.AUTH_SESSION_SECRET ??
      process.env.INTERNAL_API_SECRET ??
      "change-me-verify-secret";
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [nonce, rawTimestamp, signature] = parts;
    const timestamp = Number(rawTimestamp);
    if (!nonce || !timestamp || !signature) return false;

    // Token hết hạn sau 30 phút kể từ khi verify
    const age = Date.now() - timestamp;
    if (age > 30 * 60 * 1000 || age < 0) return false;

    const expectedSignature = createHash("sha256")
      .update(`verified:${email}:${nonce}:${timestamp}:${secret}`)
      .digest("hex");

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const code = String(body?.code ?? "").trim();

  if (!email || !code) {
    return NextResponse.json({ error: "Thiếu thông tin xác thực." }, { status: 400 });
  }

  const codeHash = hashCode(email, code);

  const tokenResult = await query<TokenRow>(
    `select id, email, code_hash, expires_at, consumed_at
     from email_verification_tokens
     where lower(email) = lower($1)
       and code_hash = $2
       and expires_at > now()
       and consumed_at is null
     limit 1`,
    [email, codeHash],
  );

  if (tokenResult.error) {
    return NextResponse.json({ error: "Không thể xác thực lúc này." }, { status: 500 });
  }

  const tokenRow = tokenResult.rows[0] ?? null;
  if (!tokenRow) {
    return NextResponse.json(
      { error: "Mã xác thực không hợp lệ hoặc đã hết hạn." },
      { status: 400 },
    );
  }

  // Đánh dấu token đã dùng
  const consumeResult = await query(
    `update email_verification_tokens
     set consumed_at = now()
     where id = $1`,
    [tokenRow.id],
  );

  if (consumeResult.error) {
    return NextResponse.json({ error: "Không thể xác thực lúc này." }, { status: 500 });
  }

  // Phát hành verified_token ngắn hạn (30 phút), đính kèm vào request db-sign-up
  const verifiedToken = createVerifiedToken(email);

  return NextResponse.json({
    ok: true,
    verified_token: verifiedToken,
    message: "Xác thực email thành công.",
  });
}
