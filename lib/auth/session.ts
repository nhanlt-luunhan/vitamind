const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = "vitamind_session";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;
const REMEMBERED_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionClaims = {
  sub: string;
  role: string | null;
  status: string | null;
  exp: number;
};

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return base64UrlEncode(binary);
}

function base64UrlDecodeBytes(value: string) {
  const binary = base64UrlDecode(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ??
    process.env.INTERNAL_API_SECRET ??
    "change-me-session-secret"
  );
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string) {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

export async function createSessionToken(
  claims: Omit<SessionClaims, "exp"> & { exp?: number },
  remember = false,
) {
  const ttl = remember ? REMEMBERED_SESSION_TTL_SECONDS : DEFAULT_SESSION_TTL_SECONDS;
  const payload: SessionClaims = {
    ...claims,
    exp: claims.exp ?? Math.floor(Date.now() / 1000) + ttl,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | null | undefined) {
  if (!token) return null;

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  const key = await importSigningKey();
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecodeBytes(encodedSignature),
    encoder.encode(encodedPayload),
  );

  if (!isValid) return null;

  try {
    const payload = JSON.parse(decoder.decode(base64UrlDecodeBytes(encodedPayload))) as SessionClaims;
    if (!payload?.sub || !payload?.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(remember = false) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: REMEMBERED_SESSION_TTL_SECONDS } : {}),
  };
}
