import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { getAllPostsAdmin, updatePostFrontmatter } from "@/lib/blog/posts";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageBlog } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!canManageBlog(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const posts = await getAllPostsAdmin();
  const existing = posts.find((post) => post.slug === slug);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  }

  const updated = await updatePostFrontmatter(slug, {
    title: body.title !== undefined ? String(body.title).trim() : undefined,
    description: body.description !== undefined ? String(body.description).trim() : undefined,
    summary: body.summary !== undefined ? body.summary : undefined,
    category: body.category !== undefined ? String(body.category).trim() : undefined,
    author: body.author !== undefined ? String(body.author).trim() : undefined,
    tags: body.tags !== undefined ? body.tags : undefined,
    cover_image: body.cover_image !== undefined ? String(body.cover_image).trim() : undefined,
    published: body.published !== undefined ? Boolean(body.published) : undefined,
    date: body.date !== undefined ? body.date : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Không cập nhật được bài viết." }, { status: 400 });
  }

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "update",
    tableName: "blog",
    recordId: slug,
    before: existing,
    after: updated,
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!canManageBlog(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getAllPostsAdmin();
  const existing = posts.find((post) => post.slug === slug);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  }

  const updated = await updatePostFrontmatter(slug, {
    published: false,
  });

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "delete",
    tableName: "blog",
    recordId: slug,
    before: existing,
    after: updated ?? existing,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getAllPostsAdmin();
  const post = posts.find((item) => item.slug === slug) ?? null;
  return NextResponse.json({ post });
}
