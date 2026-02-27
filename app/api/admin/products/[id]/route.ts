import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageProducts } from "@/lib/auth/rbac";
import { slugify } from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  sku: string | null;
  brand: string | null;
  category: string | null;
  images: string[] | null;
  specs: Record<string, unknown> | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeImages = (value: unknown) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
};

const normalizeSpecs = (value: unknown) => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
};

const normalizeStatus = (value: unknown) => {
  if (value === undefined) return undefined;
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  return status || "draft";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!canManageProducts(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { rows: existingRows } = await query<ProductRow>(
    `select id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at
     from products
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }

  const name = body.name ? String(body.name).trim() : existing.name;
  const slug = body.slug ? slugify(String(body.slug)) : existing.slug;
  const price = body.price !== undefined ? Number(body.price) : existing.price;
  const sku = body.sku !== undefined ? String(body.sku).trim() || null : existing.sku;
  const brand = body.brand !== undefined ? String(body.brand).trim() || null : existing.brand;
  const category =
    body.category !== undefined ? String(body.category).trim() || null : existing.category;
  const images = normalizeImages(body.images) ?? existing.images ?? [];
  const specs = normalizeSpecs(body.specs) ?? existing.specs ?? {};
  const status = normalizeStatus(body.status) ?? existing.status;

  const { rows, error } = await query<ProductRow>(
    `update products
     set name = $2,
         slug = $3,
         price = $4,
         sku = $5,
         brand = $6,
         category = $7,
         images = $8,
         specs = $9,
         status = $10,
         updated_at = now()
     where id = $1
     returning id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at`,
    [id, name, slug, price, sku, brand, category, images, specs, status],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "update",
    tableName: "products",
    recordId: id,
    before: existing,
    after: rows[0],
  });

  return NextResponse.json({ product: rows[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!canManageProducts(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: existingRows } = await query<ProductRow>(
    `select id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at
     from products
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }

  await query(
    `update products
     set deleted_at = now(), updated_at = now()
     where id = $1`,
    [id],
  );

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "delete",
    tableName: "products",
    recordId: id,
    before: existing,
    after: { ...existing, deleted_at: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<ProductRow>(
    `select id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at
     from products
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  return NextResponse.json({ product: rows[0] ?? null });
}
