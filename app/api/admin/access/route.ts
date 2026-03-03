import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/rbac";
import { fetchAccessGroups, fetchAccessPermissions } from "@/lib/access-control/admin";
import { withTransaction } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

type PermissionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
};

type GroupRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
};

const normalizeCode = (value: unknown) => {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return text || null;
};

const normalizeIdArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];

async function loadAccessPayload() {
  const [permissionsResult, groupsResult] = await Promise.all([
    fetchAccessPermissions(),
    fetchAccessGroups(),
  ]);

  if (permissionsResult.error) return { error: permissionsResult.error };
  if (groupsResult.error) return { error: groupsResult.error };

  return {
    permissions: permissionsResult.rows,
    groups: groupsResult.rows,
  };
}

export async function GET() {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await loadAccessPayload();
  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const kind = body.kind === "group" ? "group" : "permission";
  const code = normalizeCode(body.code);
  const name = normalizeText(body.name);
  const description = normalizeText(body.description);
  const permissionIds = normalizeIdArray(body.permission_ids);

  if (!code || !name) {
    return NextResponse.json({ error: "Code và tên là bắt buộc." }, { status: 400 });
  }

  const transaction = await withTransaction(async (client) => {
    if (kind === "permission") {
      const created = await client.query<PermissionRow>(
        `insert into access_permissions (code, name, description)
         values ($1, $2, $3)
         returning id, code, name, description, created_at, updated_at`,
        [code, name, description],
      );
      return {
        created: created.rows[0],
        tableName: "access_permissions",
      };
    }

    const created = await client.query<GroupRow>(
      `insert into access_groups (code, name, description)
       values ($1, $2, $3)
       returning id, code, name, description, created_at, updated_at`,
      [code, name, description],
    );
    const group = created.rows[0];

    if (permissionIds.length) {
      await client.query(
        `insert into access_group_permissions (group_id, permission_id)
         select $1, unnest($2::uuid[])`,
        [group.id, permissionIds],
      );
    }

    return {
      created: group,
      tableName: "access_groups",
    };
  });

  if (transaction.error) {
    return NextResponse.json({ error: transaction.error }, { status: 400 });
  }

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "create",
    tableName: transaction.result?.tableName ?? "access_control",
    recordId: transaction.result?.created?.id ?? null,
    after: transaction.result?.created ?? null,
  });

  const payload = await loadAccessPayload();
  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: "Thiếu id cần cập nhật." }, { status: 400 });
  }

  const kind = body.kind === "group" ? "group" : "permission";
  const id = String(body.id);
  const code = normalizeCode(body.code);
  const name = normalizeText(body.name);
  const description = normalizeText(body.description);
  const permissionIds = normalizeIdArray(body.permission_ids);

  if (!code || !name) {
    return NextResponse.json({ error: "Code và tên là bắt buộc." }, { status: 400 });
  }

  const transaction = await withTransaction(async (client) => {
    if (kind === "permission") {
      const before = await client.query<PermissionRow>(
        `select id, code, name, description, created_at, updated_at
         from access_permissions
         where id = $1
         limit 1`,
        [id],
      );

      const updated = await client.query<PermissionRow>(
        `update access_permissions
         set code = $2,
             name = $3,
             description = $4,
             updated_at = now()
         where id = $1
         returning id, code, name, description, created_at, updated_at`,
        [id, code, name, description],
      );

      return {
        before: before.rows[0] ?? null,
        after: updated.rows[0] ?? null,
        tableName: "access_permissions",
      };
    }

    const before = await client.query<GroupRow>(
      `select id, code, name, description, created_at, updated_at
       from access_groups
       where id = $1
       limit 1`,
      [id],
    );

    const updated = await client.query<GroupRow>(
      `update access_groups
       set code = $2,
           name = $3,
           description = $4,
           updated_at = now()
       where id = $1
       returning id, code, name, description, created_at, updated_at`,
      [id, code, name, description],
    );

    await client.query("delete from access_group_permissions where group_id = $1", [id]);
    if (permissionIds.length) {
      await client.query(
        `insert into access_group_permissions (group_id, permission_id)
         select $1, unnest($2::uuid[])`,
        [id, permissionIds],
      );
    }

    return {
      before: before.rows[0] ?? null,
      after: updated.rows[0] ?? null,
      tableName: "access_groups",
    };
  });

  if (transaction.error) {
    return NextResponse.json({ error: transaction.error }, { status: 400 });
  }

  await logAudit({
    actorUserId: user?.id ?? null,
    action: "update",
    tableName: transaction.result?.tableName ?? "access_control",
    recordId: id,
    before: transaction.result?.before ?? null,
    after: transaction.result?.after ?? null,
  });

  const payload = await loadAccessPayload();
  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  return NextResponse.json(payload);
}
