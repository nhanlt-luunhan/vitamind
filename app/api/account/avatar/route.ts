import path from "path";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const getExtension = (name: string) => {
  const ext = path.extname(name || "").toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : "";
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chưa chọn ảnh." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Định dạng ảnh không hỗ trợ." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ảnh vượt quá 2MB." }, { status: 400 });
  }

  const ext = getExtension(file.name) || ".png";
  const fileName = `${user.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);

  const url = `/uploads/avatars/${fileName}`;
  await query(
    `update users
     set avatar_url = $2,
         updated_at = now()
     where id = $1`,
    [user.id, url],
  );

  return NextResponse.json({ avatar_url: url });
}

