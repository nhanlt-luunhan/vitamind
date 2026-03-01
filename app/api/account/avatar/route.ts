import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { removeProjectUploadByUrl, saveProjectUpload } from "@/lib/uploads/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AvatarRow = {
  id: string;
  avatar_url: string | null;
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chưa chọn ảnh đại diện." }, { status: 400 });
  }

  const { rows: existingRows } = await query<AvatarRow>(
    `select id, avatar_url
     from users
     where id = $1
     limit 1`,
    [user.id],
  );

  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  let avatarUrl = "";
  try {
    const saved = await saveProjectUpload({
      scope: "avatars",
      file,
      fileNamePrefix: user.id,
      trackInMedia: false,
      meta: { owner: "user", user_id: user.id },
    });
    avatarUrl = saved.url;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const { rows, error } = await query<AvatarRow>(
    `update users
     set avatar_url = $2,
         updated_at = now()
     where id = $1
     returning id, avatar_url`,
    [user.id, avatarUrl],
  );

  if (error || !rows[0]) {
    return NextResponse.json({ error: error ?? "Không thể cập nhật ảnh đại diện." }, { status: 400 });
  }

  if (existing.avatar_url !== avatarUrl) {
    await removeProjectUploadByUrl(existing.avatar_url);
  }

  await logAudit({
    actorUserId: user.id,
    action: "update",
    tableName: "users",
    recordId: user.id,
    before: { avatar_url: existing.avatar_url },
    after: { avatar_url: rows[0].avatar_url },
  });

  return NextResponse.json({ user: rows[0] });
}
