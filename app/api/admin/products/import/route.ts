import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { canManageProducts } from "@/lib/auth/rbac";
import { slugify } from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageProducts(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) {
    return NextResponse.json({ error: "Không có dữ liệu để import." }, { status: 400 });
  }

  if (items.length > 200) {
    return NextResponse.json({ error: "Chỉ hỗ trợ tối đa 200 dòng mỗi lần." }, { status: 400 });
  }

  const created: string[] = [];
  for (const raw of items) {
    const name = String(raw?.name ?? "").trim();
    if (!name) continue;
    const slug = raw?.slug ? slugify(String(raw.slug)) : slugify(name);
    const price = Number(raw?.price ?? 0);
    const sku = raw?.sku ? String(raw.sku).trim() : null;
    const brand = raw?.brand ? String(raw.brand).trim() : null;
    const category = raw?.category ? String(raw.category).trim() : null;
    const images = normalizeImages(raw?.images);
    const specs = normalizeSpecs(raw?.specs);
    const status = raw?.status ? String(raw.status).trim().toLowerCase() : "draft";

    const { rows, error } = await query<{ id: string }>(
      `insert into products (name, slug, price, sku, brand, category, images, specs, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (slug) do update
       set name = excluded.name,
           price = excluded.price,
           sku = excluded.sku,
           brand = excluded.brand,
           category = excluded.category,
           images = excluded.images,
           specs = excluded.specs,
           status = excluded.status,
           updated_at = now()
       returning id`,
      [name, slug, price, sku, brand, category, images, specs, status],
    );

    if (!error && rows[0]) {
      created.push(rows[0].id);
    }
  }

  if (created.length) {
    await logAudit({
      actorUserId: user?.id ?? null,
      action: "import",
      tableName: "products",
      recordId: created.join(","),
      after: { count: created.length },
    });
  }

  return NextResponse.json({ ok: true, count: created.length });
}

