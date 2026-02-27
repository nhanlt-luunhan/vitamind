import path from "path";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageMedia } from "@/lib/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const getExtension = (name: string) => path.extname(name || "").toLowerCase();

export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query(
    `select id, url, type, meta, created_at, updated_at
     from media
     where deleted_at is null
     order by created_at desc`,
  );

  return NextResponse.json({ media: rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageMedia(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chưa chọn file." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Định dạng file không hỗ trợ." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File vượt quá 10MB." }, { status: 400 });
  }

  const ext = getExtension(file.name) || ".bin";
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "media");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);

  const url = `/uploads/media/${fileName}`;
  const meta = {
    original_name: file.name,
    size: file.size,
  };

  const { rows, error } = await query<{
    id: string;
    url: string;
    type: string | null;
    meta: unknown;
  }>(
    `insert into media (url, type, meta)
     values ($1, $2, $3)
     returning id, url, type, meta, created_at, updated_at`,
    [url, file.type, meta],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const created = rows[0];
  await logAudit({
    actorUserId: user?.id ?? null,
    action: "create",
    tableName: "media",
    recordId: created?.id,
    after: created,
  });

  return NextResponse.json({ media: created });
}

