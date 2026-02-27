import { query } from "@/lib/db/admin-db";

type AuditPayload = {
  actorUserId: string | null;
  action: "create" | "update" | "delete" | string;
  tableName: string;
  recordId?: string | null;
  before?: unknown;
  after?: unknown;
};

export async function logAudit(payload: AuditPayload) {
  const { actorUserId, action, tableName, recordId, before, after } = payload;
  await query(
    `insert into audit_log (actor_user_id, action, table_name, record_id, before, after)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      actorUserId,
      action,
      tableName,
      recordId ?? null,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
    ],
  );
}

