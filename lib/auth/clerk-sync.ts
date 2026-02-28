import { clerkClient } from "@clerk/nextjs/server";
import { query } from "@/lib/db/admin-db";

type ClerkEmail = {
  id?: string | null;
  email_address?: string | null;
  emailAddress?: string | null;
};

type ClerkPhone = {
  id?: string | null;
  phone_number?: string | null;
  phoneNumber?: string | null;
};

type ClerkUserPayload = {
  id: string;
  email_addresses?: ClerkEmail[] | null;
  emailAddresses?: ClerkEmail[] | null;
  primary_email_address_id?: string | null;
  primaryEmailAddressId?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  username?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  phone_numbers?: ClerkPhone[] | null;
  phoneNumbers?: ClerkPhone[] | null;
  primary_phone_number_id?: string | null;
  primaryPhoneNumberId?: string | null;
  public_metadata?: Record<string, unknown> | null;
  publicMetadata?: Record<string, unknown> | null;
  unsafe_metadata?: Record<string, unknown> | null;
  unsafeMetadata?: Record<string, unknown> | null;
};

type DbUser = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeEmail = (value: string | null) => value?.trim().toLowerCase() ?? null;

const pickPrimaryEmail = (payload: ClerkUserPayload) => {
  const emails = payload.email_addresses ?? payload.emailAddresses ?? [];
  if (!emails.length) return null;
  const primaryId = payload.primary_email_address_id ?? payload.primaryEmailAddressId;
  const primary =
    emails.find((item) => item.id === primaryId) ??
    emails.find((item) => item.email_address || item.emailAddress) ??
    emails[0];
  return primary?.email_address ?? primary?.emailAddress ?? null;
};

const pickPrimaryPhone = (payload: ClerkUserPayload) => {
  const phones = payload.phone_numbers ?? payload.phoneNumbers ?? [];
  if (!phones.length) return null;
  const primaryId = payload.primary_phone_number_id ?? payload.primaryPhoneNumberId;
  const primary =
    phones.find((item) => item.id === primaryId) ??
    phones.find((item) => item.phone_number || item.phoneNumber) ??
    phones[0];
  return primary?.phone_number ?? primary?.phoneNumber ?? null;
};

const pickMetadataPhone = (payload: ClerkUserPayload) => {
  const publicMeta = payload.public_metadata ?? payload.publicMetadata;
  const unsafeMeta = payload.unsafe_metadata ?? payload.unsafeMetadata;
  const fromPublic = typeof publicMeta?.phone === "string" ? publicMeta.phone : null;
  const fromUnsafe = typeof unsafeMeta?.phone === "string" ? unsafeMeta.phone : null;
  return fromPublic ?? fromUnsafe;
};

const pickMetadataGid = (payload: ClerkUserPayload) => {
  const publicMeta = payload.public_metadata ?? payload.publicMetadata;
  const unsafeMeta = payload.unsafe_metadata ?? payload.unsafeMetadata;
  const fromPublic = typeof publicMeta?.gid === "string" ? publicMeta.gid : null;
  const fromUnsafe = typeof unsafeMeta?.gid === "string" ? unsafeMeta.gid : null;
  const value = fromPublic ?? fromUnsafe;
  const text = value?.trim() ?? "";
  return text ? text.toUpperCase() : null;
};

const pickMetadataContactEmail = (payload: ClerkUserPayload) => {
  const publicMeta = payload.public_metadata ?? payload.publicMetadata;
  const unsafeMeta = payload.unsafe_metadata ?? payload.unsafeMetadata;
  const fromPublic =
    typeof publicMeta?.contactEmail === "string" ? publicMeta.contactEmail : null;
  const fromUnsafe =
    typeof unsafeMeta?.contactEmail === "string" ? unsafeMeta.contactEmail : null;
  const value = normalizeEmail(fromPublic ?? fromUnsafe);
  return value;
};

const buildDisplayName = (payload: ClerkUserPayload, email: string | null) => {
  const first = payload.first_name ?? payload.firstName ?? "";
  const last = payload.last_name ?? payload.lastName ?? "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (payload.username) return payload.username;
  if (email) return email.split("@")[0];
  return "User";
};

const pickImageUrl = (payload: ClerkUserPayload) =>
  payload.image_url ?? payload.imageUrl ?? null;

export async function upsertClerkUser(payload: ClerkUserPayload): Promise<DbUser | null> {
  const email = normalizeEmail(pickPrimaryEmail(payload));
  if (!email) return null;

  const displayName = buildDisplayName(payload, email);
  const phone = pickMetadataPhone(payload) ?? pickPrimaryPhone(payload);
  const gid = pickMetadataGid(payload);
  const contactEmail = pickMetadataContactEmail(payload);
  const avatarUrl = pickImageUrl(payload);

  const { rows: updated } = await query<DbUser>(
    `update users
     set email = $2,
         contact_email = coalesce($3, contact_email, $2),
         name = $4,
         display_name = $5,
         phone = $6,
         avatar_url = $7,
         gid = coalesce($8, gid),
         updated_at = now()
    where clerk_user_id = $1
    returning id, clerk_user_id, email, contact_email, name, display_name, gid, phone, avatar_url, role, status, created_at, updated_at`,
    [payload.id, email, contactEmail, displayName, displayName, phone, avatarUrl, gid],
  );

  if (updated[0]) return updated[0];

  const { rows: linkedByEmail } = await query<DbUser>(
    `update users
     set clerk_user_id = $1,
         email = $2,
         contact_email = coalesce($3, contact_email, $2),
         name = $4,
         display_name = $5,
         phone = $6,
         avatar_url = $7,
         gid = coalesce($8, gid),
         updated_at = now()
     where lower(email) = $2
     returning id, clerk_user_id, email, contact_email, name, display_name, gid, phone, avatar_url, role, status, created_at, updated_at`,
    [payload.id, email, contactEmail, displayName, displayName, phone, avatarUrl, gid],
  );

  if (linkedByEmail[0]) return linkedByEmail[0];

  const { rows } = await query<DbUser>(
    `insert into users (clerk_user_id, email, contact_email, name, display_name, gid, phone, avatar_url, role, status)
     values ($1, $2, coalesce($3, $2), $4, $5, $6, $7, $8, 'viewer', 'active')
     on conflict (email) do update
     set clerk_user_id = excluded.clerk_user_id,
         contact_email = coalesce(excluded.contact_email, users.contact_email, users.email),
         name = excluded.name,
         display_name = excluded.display_name,
         gid = coalesce(excluded.gid, users.gid),
         phone = excluded.phone,
         avatar_url = excluded.avatar_url,
         updated_at = now()
     returning id, clerk_user_id, email, contact_email, name, display_name, gid, phone, avatar_url, role, status, created_at, updated_at`,
    [payload.id, email, contactEmail, displayName, displayName, gid, phone, avatarUrl],
  );

  return rows[0] ?? null;
}

type ClerkListUser = {
  id: string;
  emailAddresses: ClerkEmail[];
  primaryEmailAddressId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  phoneNumbers: ClerkPhone[];
  primaryPhoneNumberId: string | null;
  publicMetadata: Record<string, unknown> | null;
  unsafeMetadata: Record<string, unknown> | null;
};

const toPayload = (user: ClerkListUser): ClerkUserPayload => ({
  id: user.id,
  emailAddresses: user.emailAddresses,
  primaryEmailAddressId: user.primaryEmailAddressId,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  imageUrl: user.imageUrl,
  phoneNumbers: user.phoneNumbers,
  primaryPhoneNumberId: user.primaryPhoneNumberId,
  publicMetadata: user.publicMetadata,
  unsafeMetadata: user.unsafeMetadata,
});

export async function syncClerkUserById(clerkUserId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  return upsertClerkUser(toPayload(user));
}

export async function syncAllClerkUsers() {
  const client = await clerkClient();
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  let synced = 0;

  do {
    const response = await client.users.getUserList({
      limit: pageSize,
      offset,
      orderBy: "-updated_at",
    });

    totalCount = response.totalCount;
    for (const user of response.data) {
      await upsertClerkUser(toPayload(user));
      synced += 1;
    }

    offset += response.data.length;
  } while (offset < totalCount);

  return { synced, totalCount };
}

export async function disableClerkUser(clerkUserId: string | null | undefined) {
  if (!clerkUserId) return;
  await query(
    `update users
     set status = 'blocked',
         updated_at = now()
     where clerk_user_id = $1`,
    [clerkUserId],
  );
}
