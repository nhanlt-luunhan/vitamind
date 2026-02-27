import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { getAllPostsAdmin, createPostFile } from "@/lib/blog/posts";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageBlog } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getAllPostsAdmin();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageBlog(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title?.toString().trim();
  if (!title) {
    return NextResponse.json({ error: "Tiêu đề là bắt buộc." }, { status: 400 });
  }

  try {
    const created = await createPostFile({
      title,
      description: body?.description?.toString().trim(),
      category: body?.category?.toString().trim(),
      cover_image: body?.cover_image?.toString().trim(),
    });

    await logAudit({
      actorUserId: user?.id ?? null,
      action: "create",
      tableName: "blog",
      recordId: created?.slug,
      after: created,
    });

    return NextResponse.json({ post: created });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

