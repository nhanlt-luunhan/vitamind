import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageOrders } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  user_id: string | null;
  items: unknown;
  subtotal: string | number;
  shipping: string | number;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeItems = (value: unknown) => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (typeof value === "object") {
    return value as unknown;
  }
  return [];
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<OrderRow>(
    `select id, user_id, items, subtotal, shipping, status, created_at, updated_at
     from orders
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );

  return NextResponse.json({ order: rows[0] ?? null });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!canManageOrders(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { rows: existingRows } = await query<OrderRow>(
    `select id, user_id, items, subtotal, shipping, status, created_at, updated_at
     from orders
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const items = normalizeItems(body.items) ?? existing.items;
  const subtotal = body.subtotal !== undefined ? Number(body.subtotal) : existing.subtotal;
  const shipping = body.shipping !== undefined ? Number(body.shipping) : existing.shipping;
  const status = body.status ? String(body.status).trim().toLowerCase() : existing.status;

  const { rows, error } = await query<OrderRow>(
    `update orders
     set items = $2,
         subtotal = $3,
         shipping = $4,
         status = $5,
         updated_at = now()
     where id = $1
     returning id, user_id, items, subtotal, shipping, status, created_at, updated_at`,
    [id, items, subtotal, shipping, status],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "update",
    tableName: "orders",
    recordId: id,
    before: existing,
    after: rows[0],
  });

  return NextResponse.json({ order: rows[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!canManageOrders(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: existingRows } = await query<OrderRow>(
    `select id, user_id, items, subtotal, shipping, status, created_at, updated_at
     from orders
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  await query(
    `update orders
     set deleted_at = now(), updated_at = now()
     where id = $1`,
    [id],
  );

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "delete",
    tableName: "orders",
    recordId: id,
    before: existing,
    after: { ...existing, deleted_at: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true });
}
