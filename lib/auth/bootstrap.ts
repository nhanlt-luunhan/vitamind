import { cookies } from "next/headers";
import {
  canManageBlog,
  canManageMedia,
  canManageOrders,
  canManageProducts,
  canManageUsers,
  normalizeRole,
} from "@/lib/auth/rbac";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { query } from "@/lib/db/admin-db";
import { hasGidValue } from "@/lib/utils/gid";

export type BootstrapProfile = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export type BootstrapPayload = {
  userId: string;
  profile: {
    gid: string | null;
    phone: string | null;
    contactEmail: string | null;
    name: string | null;
    displayName: string | null;
    email: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    company: string | null;
    website: string | null;
  };
  role: string;
  permissions: {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageBlog: boolean;
    canManageMedia: boolean;
  };
  accountStatus: {
    locked: boolean;
    deleted: boolean;
    onboardingComplete: boolean;
    status: string | null;
  };
  version: string;
  updatedAt: string;
  redirectTo: string;
};

const BOOTSTRAP_PROFILE_SELECT =
  "id, email, contact_email, name, display_name, gid, phone, bio, location, company, website, role, status, avatar_url, created_at, updated_at";
const LEGACY_BOOTSTRAP_PROFILE_SELECT = "id, email, name, role, created_at, updated_at";

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacyBootstrapProfile(row: Record<string, unknown>): BootstrapProfile {
  const name = typeof row.name === "string" ? row.name : null;
  const email = typeof row.email === "string" ? row.email : "";
  const createdAt =
    typeof row.created_at === "string" ? row.created_at : new Date().toISOString();

  return {
    id: String(row.id ?? ""),
    email,
    contact_email: email || null,
    name,
    display_name: name,
    gid: null,
    phone: null,
    bio: null,
    location: null,
    company: null,
    website: null,
    role: typeof row.role === "string" ? row.role : null,
    status: "active",
    avatar_url: null,
    created_at: createdAt,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : createdAt,
  };
}

async function selectBootstrapProfile(whereClause: string, params: Array<unknown>) {
  const current = await query<BootstrapProfile>(
    `select ${BOOTSTRAP_PROFILE_SELECT}
     from users
     where ${whereClause}
     limit 1`,
    params,
  );

  if (!current.error) {
    return current.rows[0] ?? null;
  }

  if (!isMissingUsersColumnError(current.error)) {
    return null;
  }

  const legacy = await query<Record<string, unknown>>(
    `select ${LEGACY_BOOTSTRAP_PROFILE_SELECT}
     from users
     where ${whereClause}
     limit 1`,
    params,
  );

  if (legacy.error) {
    return null;
  }

  return legacy.rows[0] ? toLegacyBootstrapProfile(legacy.rows[0]) : null;
}

async function fetchBootstrapProfileById(userId: string) {
  return selectBootstrapProfile("id = $1", [userId]);
}

function isOnboardingComplete(user: BootstrapProfile) {
  const hasName = Boolean(user.name?.trim() || user.display_name?.trim());
  const hasContactEmail = Boolean((user.contact_email ?? user.email).trim());
  return hasName && hasContactEmail;
}

function getRedirectTo(payload: Omit<BootstrapPayload, "redirectTo">) {
  if (payload.accountStatus.deleted || payload.accountStatus.locked) {
    return "/not-authorized";
  }
  if (!payload.accountStatus.onboardingComplete) {
    return "/account";
  }
  return "/";
}

function toBootstrapPayload(user: BootstrapProfile): BootstrapPayload {
  const role = normalizeRole(user.role);
  const locked = Boolean(user.status && user.status !== "active");
  const deleted = false;
  const onboardingComplete = isOnboardingComplete(user);
  const updatedAt = user.updated_at ?? user.created_at;

  const payloadBase = {
    userId: user.id,
    profile: {
      gid: user.gid,
      phone: user.phone,
      contactEmail: user.contact_email,
      name: user.name,
      displayName: user.display_name,
      email: user.email,
      avatar: user.avatar_url,
      bio: user.bio,
      location: user.location,
      company: user.company,
      website: user.website,
    },
    role,
    permissions: {
      canManageUsers: canManageUsers(user),
      canManageProducts: canManageProducts(user),
      canManageOrders: canManageOrders(user),
      canManageBlog: canManageBlog(user),
      canManageMedia: canManageMedia(user),
    },
    accountStatus: {
      locked,
      deleted,
      onboardingComplete,
      status: user.status,
    },
    version: `${user.id}:${updatedAt}`,
    updatedAt,
  };

  return {
    ...payloadBase,
    redirectTo: getRedirectTo(payloadBase),
  };
}

export async function getBootstrapProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const claims = await verifySessionToken(token);
  if (!claims?.sub) return null;

  return fetchBootstrapProfileById(claims.sub);
}

export async function getBootstrap() {
  const user = await getBootstrapProfile();
  if (!user) return null;
  return toBootstrapPayload(user);
}

export async function createBootstrapSessionCookieValue() {
  const user = await getBootstrapProfile();
  if (!user) return null;

  const token = await createSessionToken(
    { sub: user.id, role: user.role, status: user.status },
    false,
  );

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: getSessionCookieOptions(false),
  };
}
