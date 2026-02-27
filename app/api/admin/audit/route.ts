import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
};

export async function GET() {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<AuditRow>(
    `select a.id,
            u.email as actor_email,
            a.action,
            a.table_name,
            a.record_id,
            a.created_at
     from audit_log a
     left join users u on u.id = a.actor_user_id
     order by a.created_at desc
     limit 200`,
  );

  return NextResponse.json({ audit: rows });
}
