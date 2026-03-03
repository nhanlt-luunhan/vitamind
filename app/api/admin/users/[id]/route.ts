import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query, withTransaction } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { normalizeRole, canManageUsers } from "@/lib/auth/rbac";
import { processQueuedClerkDeletion, queueClerkUserDeletion } from "@/lib/auth/clerk-sync";
import { GID_RULE_MESSAGE, normalizeGid, sanitizeGid } from "@/lib/utils/gid";
import { fetchDecoratedUserById, fetchUserAudit } from "@/lib/access-control/admin";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

const baseSelect = `select id, clerk_user_id, email, contact_email, name, display_name, gid, role, status, phone, bio, location, company, website, avatar_url, created_at, updated_at
                    from users`;

const normalizeText = (value: unknown) => {
  if (value === undefined) return undefined;
  const text = String(value ?? "").trim();
  return text.length ? text : null;
};

const splitName = (value: string | null) => {
  if (!value) return { firstName: null, lastName: null };
  const parts = value.split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  const lastName = parts.pop() ?? null;
  return { firstName: parts.join(" "), lastName };
};

const normalizeStatus = (value: unknown) => {
  if (value === undefined) return undefined;
  const status = String(value ?? "").trim().toLowerCase();
  if (status === "blocked" || status === "disabled") return "blocked";
  return "active";
};

function normalizeIdArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

async function syncClerkMetadata({
  clerkUserId,
  role,
  status,
  name,
  gid,
  phone,
  contactEmail,
  groupCodes,
  permissionCodes,
}: {
  clerkUserId: string | null;
  role: string;
  status: string;
  name: string | null;
  gid: string | null;
  phone: string | null;
  contactEmail: string | null;
  groupCodes: string[];
  permissionCodes: string[];
}) {
  if (!clerkUserId) return;
  try {
    const client = await clerkClient();
    const current = await client.users.getUser(clerkUserId);
    const { firstName, lastName } = splitName(name);
    const publicMetadata = {
      ...(current.publicMetadata ?? {}),
      role,
      status,
      gid,
      phone,
      contactEmail,
      groups: groupCodes,
      permissions: permissionCodes,
    };

    await client.users.updateUser(clerkUserId, {
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      publicMetadata,
    });
  } catch (error) {
    console.error("Failed to sync Clerk metadata", error);
  }
}

async function loadDecoratedPayload(userId: string) {
  const [{ row, error }, auditResult] = await Promise.all([
    fetchDecoratedUserById(userId),
    fetchUserAudit(userId, 16),
  ]);

  if (error) {
    return { error, status: 400 as const };
  }

  if (!row) {
    return { error: "Không tìm thấy user.", status: 404 as const };
  }

  return {
    user: row,
    audit: auditResult.rows,
    auditError: auditResult.error,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getSessionUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await loadDecoratedPayload(id);
  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: payload.status });
  }

  return NextResponse.json(payload);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getSessionUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const role = body?.role ? normalizeRole(body.role.toString().trim()) : undefined;
  const status = normalizeStatus(body?.status);
  const name = normalizeText(body?.name);
  const displayName = normalizeText(body?.display_name);
  const contactEmail = normalizeText(body?.contact_email);
  const phone = normalizeText(body?.phone);
  const bio = normalizeText(body?.bio);
  const location = normalizeText(body?.location);
  const company = normalizeText(body?.company);
  const website = normalizeText(body?.website);
  const rawGid = sanitizeGid(body?.gid);
  const gid = body?.gid === undefined ? undefined : rawGid ? normalizeGid(body?.gid) : null;
  const groupIds = normalizeIdArray(body?.group_ids);
  const permissionIds = normalizeIdArray(body?.permission_ids);

  if (rawGid && !gid) {
    return NextResponse.json({ error: GID_RULE_MESSAGE }, { status: 400 });
  }

  const { rows: existingRows } = await query<UserRow>(
    `${baseSelect}
     where id = $1
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 });
  }

  if (id === currentUser?.id && status === "blocked") {
    return NextResponse.json(
      { error: "Không thể khóa tài khoản đang đăng nhập." },
      { status: 400 },
    );
  }

  const nextRole = role ?? existing.role ?? "viewer";
  const nextStatus = status ?? existing.status ?? "active";
  const nextName = name === undefined ? existing.name : name;
  const nextDisplayName = displayName === undefined ? existing.display_name : displayName;
  const nextGid = gid === undefined ? existing.gid : gid;
  const nextContactEmail = contactEmail === undefined ? existing.contact_email : contactEmail;
  const nextPhone = phone === undefined ? existing.phone : phone;
  const nextBio = bio === undefined ? existing.bio : bio;
  const nextLocation = location === undefined ? existing.location : location;
  const nextCompany = company === undefined ? existing.company : company;
  const nextWebsite = website === undefined ? existing.website : website;

  const transaction = await withTransaction(async (client) => {
    await client.query(
      `update users
       set role = $2,
           status = $3,
           name = $4,
           display_name = $5,
           gid = $6,
           contact_email = $7,
           phone = $8,
           bio = $9,
           location = $10,
           company = $11,
           website = $12,
           updated_at = now()
       where id = $1`,
      [
        id,
        nextRole,
        nextStatus,
        nextName,
        nextDisplayName,
        nextGid,
        nextContactEmail,
        nextPhone,
        nextBio,
        nextLocation,
        nextCompany,
        nextWebsite,
      ],
    );

    if (groupIds) {
      await client.query("delete from user_groups where user_id = $1", [id]);
      if (groupIds.length) {
        await client.query(
          `insert into user_groups (user_id, group_id)
           select $1, unnest($2::uuid[])`,
          [id, groupIds],
        );
      }
    }

    if (permissionIds) {
      await client.query("delete from user_permissions where user_id = $1", [id]);
      if (permissionIds.length) {
        await client.query(
          `insert into user_permissions (user_id, permission_id)
           select $1, unnest($2::uuid[])`,
          [id, permissionIds],
        );
      }
    }

    const updated = await client.query<UserRow>(
      `${baseSelect}
       where id = $1
       limit 1`,
      [id],
    );

    return updated.rows[0] ?? null;
  });

  if (transaction.error) {
    if (transaction.error.includes("idx_users_gid_unique") || transaction.error.includes("duplicate key")) {
      return NextResponse.json({ error: "GID này đã được sử dụng." }, { status: 400 });
    }
    return NextResponse.json({ error: transaction.error }, { status: 400 });
  }

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "update",
    tableName: "users",
    recordId: id,
    before: existing,
    after: transaction.result,
  });

  const payload = await loadDecoratedPayload(id);
  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: payload.status });
  }

  await syncClerkMetadata({
    clerkUserId: existing.clerk_user_id,
    role: nextRole,
    status: nextStatus,
    name: nextName,
    gid: nextGid,
    phone: nextPhone,
    contactEmail: nextContactEmail,
    groupCodes: payload.user.groups.map((group) => group.code),
    permissionCodes: payload.user.effective_permissions.map((permission) => permission.code),
  });

  return NextResponse.json(payload);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getSessionUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (id === currentUser?.id) {
    return NextResponse.json(
      { error: "Không thể xóa tài khoản đang đăng nhập." },
      { status: 400 },
    );
  }

  const { rows: existingRows } = await query<UserRow>(
    `${baseSelect}
     where id = $1
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 });
  }

  if (existing.clerk_user_id) {
    await queueClerkUserDeletion(existing.clerk_user_id, existing.email);
  }

  await query(`delete from users where id = $1`, [id]);

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "delete",
    tableName: "users",
    recordId: id,
    before: existing,
    after: null,
  });

  if (existing.clerk_user_id) {
    await processQueuedClerkDeletion(existing.clerk_user_id).catch(() => null);
  }

  return NextResponse.json({ ok: true, deletedId: id });
}
