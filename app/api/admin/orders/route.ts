import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageOrders } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  items: unknown;
  subtotal: string | number;
  shipping: string | number;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeItems = (value: unknown) => {
  if (!value) return [];
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

export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<OrderRow>(
    `select o.id, o.user_id, u.email as user_email, o.items, o.subtotal, o.shipping, o.status, o.created_at, o.updated_at
     from orders o
     left join users u on u.id = o.user_id
     where o.deleted_at is null
     order by o.created_at desc`,
  );

  return NextResponse.json({ orders: rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageOrders(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const userId = body.user_id ? String(body.user_id).trim() : null;
  const items = normalizeItems(body.items);
  const subtotal = Number(body.subtotal ?? 0);
  const shipping = Number(body.shipping ?? 0);
  const status = body.status ? String(body.status).trim().toLowerCase() : "new";

  const { rows, error } = await query<OrderRow>(
    `insert into orders (user_id, items, subtotal, shipping, status)
     values ($1, $2, $3, $4, $5)
     returning id, user_id, items, subtotal, shipping, status, created_at, updated_at`,
    [userId, items, subtotal, shipping, status],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const created = rows[0];
  await logAudit({
    actorUserId: user?.id ?? null,
    action: "create",
    tableName: "orders",
    recordId: created?.id,
    after: created,
  });

  return NextResponse.json({ order: created });
}

