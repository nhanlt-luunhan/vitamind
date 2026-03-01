import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageMedia } from "@/lib/auth/rbac";
import { query } from "@/lib/db/admin-db";
import { saveProjectUpload } from "@/lib/uploads/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    const scope = formData.get("scope")?.toString().trim() || "media";
    const saved = await saveProjectUpload({
      scope,
      file,
      trackInMedia: true,
      meta: { owner: "admin" },
    });
    const created = saved.media;
    if (!created) {
      return NextResponse.json({ error: "Không thể lưu media." }, { status: 400 });
    }

    await logAudit({
      actorUserId: user?.id ?? null,
      action: "create",
      tableName: "media",
      recordId: created?.id,
      after: created,
    });

    return NextResponse.json({ media: created });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
