import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { hasRole, canManageMedia } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type MediaRow = {
  id: string;
  url: string;
  type: string | null;
  meta: unknown;
  created_at: string;
  updated_at: string | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!hasRole(user, "viewer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<MediaRow>(
    `select id, url, type, meta, created_at, updated_at
     from media
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );

  return NextResponse.json({ media: rows[0] ?? null });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!canManageMedia(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: existingRows } = await query<MediaRow>(
    `select id, url, type, meta, created_at, updated_at
     from media
     where id = $1 and deleted_at is null
     limit 1`,
    [id],
  );
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy media." }, { status: 404 });
  }

  await query(
    `update media
     set deleted_at = now(), updated_at = now()
     where id = $1`,
    [id],
  );

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "delete",
    tableName: "media",
    recordId: id,
    before: existing,
    after: { ...existing, deleted_at: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true });
}
