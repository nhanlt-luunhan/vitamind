import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.clerk_user_id) {
    return NextResponse.json({ error: "Missing Clerk user" }, { status: 400 });
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

  const updated = await clerkClient.users.updateUserProfileImage(user.clerk_user_id, { file });
  const avatarUrl = (updated as any).imageUrl ?? (updated as any).image_url ?? null;

  if (avatarUrl) {
    await query(
      `update users
       set avatar_url = $2,
           updated_at = now()
       where id = $1`,
      [user.id, avatarUrl],
    );
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}
