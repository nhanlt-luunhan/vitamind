import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { normalizeRole, canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
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
  return status === "disabled" ? "disabled" : "active";
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

  const email = body?.email?.toString().trim();
  const name = body?.name?.toString().trim();
  const role = body?.role ? normalizeRole(body.role.toString().trim()) : undefined;
  const status = normalizeStatus(body?.status);

  const { rows: existingRows } = await query<UserRow>(
    `select id, email, name, role, status, created_at, updated_at
     from users
     where id = $1
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 });
  }

  if (id === currentUser?.id && status === "disabled") {
    return NextResponse.json(
      { error: "Không thể vô hiệu hóa tài khoản đang đăng nhập." },
      { status: 400 },
    );
  }

  const nextEmail = email?.length ? email : existing.email;
  const nextName = name?.length ? name : existing.name;
  const nextRole = role ?? existing.role;
  const nextStatus = status ?? existing.status ?? "active";

  const { rows, error } = await query<UserRow>(
    `update users
     set email = $2,
         name = $3,
         role = $4,
         status = $5,
         updated_at = now()
     where id = $1
     returning id, email, name, role, status, created_at, updated_at`,
    [id, nextEmail, nextName, nextRole, nextStatus],
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
      { error: "Không thể xoá chính tài khoản đang đăng nhập." },
      { status: 400 },
    );
  }

  const { rows: existingRows } = await query<UserRow>(
    `select id, email, name, role, status, created_at, updated_at
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
     set status = 'disabled', updated_at = now()
     where id = $1`,
    [id],
  );

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "delete",
    tableName: "users",
    recordId: id,
    before: existing,
    after: { ...existing, status: "disabled" },
  });

  return NextResponse.json({ ok: true });
}
