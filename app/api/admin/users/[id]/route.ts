import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { normalizeRole, canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  display_name: string | null;
  role: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeStatus = (value: unknown) => {
  if (value === undefined) return undefined;
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  if (status === "blocked" || status === "disabled") return "blocked";
  return "active";
};

const syncClerkMetadata = async (clerkUserId: string | null, role: string, status: string) => {
  if (!clerkUserId) return;
  try {
    const current = await clerkClient.users.getUser(clerkUserId);
    const publicMetadata = {
      ...(current.publicMetadata ?? {}),
      role,
      status,
    };
    await clerkClient.users.updateUser(clerkUserId, { publicMetadata });
  } catch (error) {
    console.error("Failed to sync Clerk metadata", error);
  }
};

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

  const { rows: existingRows } = await query<UserRow>(
    `select id, clerk_user_id, email, name, display_name, role, status, created_at, updated_at
     from users
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

  const { rows, error } = await query<UserRow>(
    `update users
     set role = $2,
         status = $3,
         updated_at = now()
     where id = $1
     returning id, clerk_user_id, email, name, display_name, role, status, created_at, updated_at`,
    [id, nextRole, nextStatus],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "update",
    tableName: "users",
    recordId: id,
    before: existing,
    after: rows[0],
  });

  await syncClerkMetadata(existing.clerk_user_id, nextRole, nextStatus);

  return NextResponse.json({ user: rows[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getSessionUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (id === currentUser?.id) {
    return NextResponse.json(
      { error: "Không thể khóa tài khoản đang đăng nhập." },
      { status: 400 },
    );
  }

  const { rows: existingRows } = await query<UserRow>(
    `select id, clerk_user_id, email, name, display_name, role, status, created_at, updated_at
     from users
     where id = $1
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 });
  }

  await query(
    `update users
     set status = 'blocked', updated_at = now()
     where id = $1`,
    [id],
  );

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "block",
    tableName: "users",
    recordId: id,
    before: existing,
    after: { ...existing, status: "blocked" },
  });

  await syncClerkMetadata(existing.clerk_user_id, existing.role ?? "viewer", "blocked");

  return NextResponse.json({ ok: true });
}
