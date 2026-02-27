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
  if (!value) return [] as string[];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [] as string[];
};

const normalizeSpecs = (value: unknown) => {
  if (!value) return {};
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
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  return status || "draft";
};

export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<ProductRow>(
    `select id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at
     from products
     where deleted_at is null
     order by created_at desc`,
  );
  return NextResponse.json({ products: rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageProducts(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Tên sản phẩm là bắt buộc." }, { status: 400 });
  }

  const name = String(body.name).trim();
  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  const price = Number(body.price ?? 0);
  const sku = body.sku ? String(body.sku).trim() : null;
  const brand = body.brand ? String(body.brand).trim() : null;
  const category = body.category ? String(body.category).trim() : null;
  const images = normalizeImages(body.images);
  const specs = normalizeSpecs(body.specs);
  const status = normalizeStatus(body.status);

  const { rows, error } = await query<ProductRow>(
    `insert into products (name, slug, price, sku, brand, category, images, specs, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, name, slug, price, sku, brand, category, images, specs, status, created_at, updated_at`,
    [name, slug, price, sku, brand, category, images, specs, status],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const created = rows[0];
  await logAudit({
    actorUserId: user?.id ?? null,
    action: "create",
    tableName: "products",
    recordId: created?.id,
    after: created,
  });

  return NextResponse.json({ product: created });
}

