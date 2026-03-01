import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { logAudit } from "@/lib/audit";
import { canManageBlog } from "@/lib/auth/rbac";
import { saveAdminImageUpload } from "@/lib/uploads/admin-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageBlog(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chưa chọn ảnh bài viết." }, { status: 400 });
  }

  try {
    const media = await saveAdminImageUpload("posts", file);
    await logAudit({
      actorUserId: user?.id ?? null,
      action: "create",
      tableName: "media",
      recordId: media.id,
      after: media,
    });
    return NextResponse.json({ media, url: media.url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
