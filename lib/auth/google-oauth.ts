import { randomBytes, timingSafeEqual } from "node:crypto";
import { query } from "@/lib/db/admin-db";
import { getSignedInDestination } from "@/lib/auth/admin-auth";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";

const GOOGLE_OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

type GoogleOauthMode = "sign-in" | "sign-up";

type GoogleOauthStatePayload = {
  mode: GoogleOauthMode;
  nonce: string;
  iat: number;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type DbUser = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  phone: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

function getGoogleClientId() {
  return process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";
}

function getGoogleClientSecret() {
  return process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() ?? "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

async function signGoogleOauthState(payload: string) {
  const bytes = new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        process.env.AUTH_SESSION_SECRET ??
        process.env.INTERNAL_API_SECRET ??
        "change-me-session-secret",
      ),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    ),
    bytes,
  );

  return Buffer.from(signature)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function hasConfiguredGoogleOAuth() {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

export function getGoogleRedirectUri() {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3333";

  return new URL("/api/auth/google/callback", base).toString();
}

export async function createGoogleOauthState(mode: GoogleOauthMode) {
  const payload = base64UrlEncode(
    JSON.stringify({
      mode,
      nonce: randomBytes(24).toString("hex"),
      iat: Date.now(),
    } satisfies GoogleOauthStatePayload),
  );
  const signature = await signGoogleOauthState(payload);
  return `${payload}.${signature}`;
}

export async function verifyGoogleOauthState(state: string | null | undefined) {
  if (!state) return null;

  const [payload, actualSignature] = state.split(".");
  if (!payload || !actualSignature) return null;

  const expectedSignature = await signGoogleOauthState(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(actualSignature);
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as GoogleOauthStatePayload;
    const mode = parsed.mode === "sign-up" ? "sign-up" : parsed.mode === "sign-in" ? "sign-in" : null;
    if (!mode || !parsed.nonce || !parsed.iat) return null;
    if (Date.now() - parsed.iat > GOOGLE_OAUTH_STATE_MAX_AGE_MS) return null;
    return mode;
  } catch {
    return null;
  }
}

export function getGoogleAuthUrl(mode: GoogleOauthMode, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", getGoogleClientId());
  url.searchParams.set("redirect_uri", getGoogleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", mode === "sign-up" ? "consent select_account" : "select_account");
  url.searchParams.set("access_type", "online");
  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as GoogleTokenResponse | null;
  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "Google token exchange failed.");
  }

  return data.access_token;
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as GoogleUserInfo | null;
  if (!response.ok || !data?.sub || !data?.email) {
    throw new Error("Google user info is invalid.");
  }

  return data;
}

export async function upsertGoogleUser(profile: GoogleUserInfo) {
  const googleSubject = String(profile.sub ?? "").trim();
  const email = String(profile.email ?? "").trim().toLowerCase();
  const name = String(profile.name ?? "").trim() || null;
  const picture = String(profile.picture ?? "").trim() || null;
  const emailVerified = Boolean(profile.email_verified);

  if (!googleSubject || !email) {
    throw new Error("Google profile is incomplete.");
  }

  if (!emailVerified) {
    throw new Error("Google email is not verified.");
  }

  // Step 1: update by google_subject (returning user)
  const updated = await query<DbUser>(
    `update users
     set email = $2,
         contact_email = coalesce(contact_email, $2),
         name = coalesce($3, name),
         display_name = coalesce(display_name, $3, split_part($2, '@', 1)),
         avatar_url = coalesce(avatar_url, $4),
         google_subject = $1,
         google_email_verified = true,
         updated_at = now()
     where google_subject = $1
     returning id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at`,
    [googleSubject, email, name, picture],
  );
  // FIX #2: Nếu cột google_subject chưa tồn tại (migration 014 chưa chạy), throw rõ ràng
  if (updated.error) {
    if (/column.*google_subject.*does not exist/i.test(updated.error)) {
      throw new Error(
        "[DB migration required] Column 'google_subject' missing. Run docker/db-init/014_google_auth.sql on the database.",
      );
    }
    throw new Error(`[upsertGoogleUser step=update-by-subject] ${updated.error}`);
  }
  if (updated.rows[0]) {
    console.log("[upsertGoogleUser] matched by google_subject, userId:", updated.rows[0].id);
    return updated.rows[0];
  }

  // Step 2: link existing email account to Google
  const linked = await query<DbUser>(
    `update users
     set google_subject = $1,
         google_email_verified = true,
         email = $2,
         contact_email = coalesce(contact_email, $2),
         name = coalesce($3, name),
         display_name = coalesce(display_name, $3, split_part($2, '@', 1)),
         avatar_url = coalesce(avatar_url, $4),
         updated_at = now()
     where lower(email) = lower($2)
     returning id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at`,
    [googleSubject, email, name, picture],
  );
  if (linked.error) {
    throw new Error(`[upsertGoogleUser step=link-by-email] ${linked.error}`);
  }
  if (linked.rows[0]) {
    console.log("[upsertGoogleUser] linked Google to existing email account, userId:", linked.rows[0].id);
    return linked.rows[0];
  }

  // Step 3: create new account
  const inserted = await query<DbUser>(
    `insert into users (
       email,
       contact_email,
       name,
       display_name,
       avatar_url,
       role,
       status,
       google_subject,
       google_email_verified
     )
     values (
       $1,
       $1,
       $2,
       coalesce($2, split_part($1, '@', 1)),
       $3,
       'viewer',
       'active',
       $4,
       true
     )
     returning id, email, contact_email, name, display_name, gid, phone, role, status, avatar_url, updated_at`,
    [email, name, picture, googleSubject],
  );
  if (inserted.error) {
    throw new Error(`[upsertGoogleUser step=insert] ${inserted.error}`);
  }
  if (!inserted.rows[0]) {
    throw new Error("[upsertGoogleUser] Insert returned no rows — unknown DB error.");
  }

  console.log("[upsertGoogleUser] created new Google user, userId:", inserted.rows[0].id);
  return inserted.rows[0];
}

export async function createGoogleSessionResponse(user: DbUser, destinationOverride?: string | null) {
  const token = await createSessionToken(
    { sub: user.id, role: user.role, status: user.status },
    false,
  );

  return {
    destination: destinationOverride ?? getSignedInDestination(user),
    cookie: {
      name: SESSION_COOKIE_NAME,
      value: token,
      options: getSessionCookieOptions(false),
    },
  };
}
