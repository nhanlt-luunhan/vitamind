import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { logAudit } from "@/lib/audit";
import { normalizeRole, canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeStatus = (value: unknown) => {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  return status === "disabled" ? "disabled" : "active";
};

export async function GET() {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<UserRow>(
    `select id, email, name, role, status, created_at, updated_at
     from users
     order by created_at desc`,
  );
  return NextResponse.json({ users: rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim();
  const name = body?.name?.toString().trim() || null;
  const role = normalizeRole(body?.role?.toString().trim());
  const status = normalizeStatus(body?.status);
  const password = body?.password?.toString();

  if (!email) {
    return NextResponse.json({ error: "Email là bắt buộc." }, { status: 400 });
  }

  const passwordSql = password
    ? "crypt($5, gen_salt('bf'))"
    : "crypt(gen_random_uuid()::text, gen_salt('bf'))";

  const { rows, error } = await query<UserRow>(
    `
      insert into users (email, password_hash, name, role, status)
      values ($1, ${passwordSql}, $2, $3, $4)
      on conflict (email) do update
      set name = excluded.name,
          role = excluded.role,
          status = excluded.status,
          updated_at = now()
      returning id, email, name, role, status, created_at, updated_at
    `,
    [email, name, role, status, password ?? null],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const created = rows[0];
  await logAudit({
    actorUserId: user?.id ?? null,
    action: "create",
    tableName: "users",
    recordId: created?.id,
    after: created,
  });

  return NextResponse.json({ user: created });
}

