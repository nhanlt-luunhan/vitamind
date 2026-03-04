import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { canManageUsers, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { query } from "@/lib/db/admin-db";
import { GID_RULE_MESSAGE, normalizeGid } from "@/lib/utils/gid";
import { isProtectedSharedClerkMode } from "@/lib/auth/environment";

export const dynamic = "force-dynamic";

type ImportInput = Record<string, unknown>;

type ImportedUserRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

const normalizeText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text ? text : null;
};

const normalizeEmail = (value: unknown) => {
  const text = String(value ?? "").trim().toLowerCase();
  return text ? text : null;
};

const normalizeStatus = (value: unknown) => {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return null;
  if (text === "blocked" || text === "disabled") return "blocked";
  return "active";
};

const getField = (item: ImportInput, keys: string[]) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      return item[key];
    }
  }
  return undefined;
};

async function upsertImportedUser(item: ImportInput) {
  const email = normalizeEmail(getField(item, ["email", "Email", "gmail", "mail"]));
  if (!email) {
    throw new Error("Thiếu email.");
  }

  const rawGid = getField(item, ["gid", "GID", "gui", "GUI"]);
  const gidText = String(rawGid ?? "").trim();
  const gid = gidText ? normalizeGid(gidText) : null;
  if (gidText && !gid) {
    throw new Error(GID_RULE_MESSAGE);
  }

  const displayName = normalizeText(getField(item, ["display_name", "displayName", "ten_hien_thi"]));
  const name = normalizeText(getField(item, ["name", "full_name", "fullName", "ten"])) ?? displayName;
  const contactEmail = normalizeEmail(getField(item, ["contact_email", "contactEmail"]));
  const phone = normalizeText(getField(item, ["phone", "so_dien_thoai"]));
  const avatarUrl = normalizeText(getField(item, ["avatar_url", "avatarUrl"]));
  const password = normalizeText(getField(item, ["password", "mat_khau"]));
  const roleText = normalizeText(getField(item, ["role", "vai_tro"]));
  const role = roleText ? normalizeRole(roleText) : null;
  const status = normalizeStatus(getField(item, ["status", "trang_thai"]));

  const { rows, error } = await query<ImportedUserRow>(
    `insert into users (
       email,
       contact_email,
       name,
       display_name,
       gid,
       phone,
       avatar_url,
       role,
       status,
       password_hash
     )
     values (
       $1,
       coalesce($2, $1),
       $3,
       $4,
       $5,
       $6,
       $7,
       coalesce($8, 'viewer'),
       coalesce($9, 'active'),
       case
         when nullif($10::text, '') is not null then crypt($10::text, gen_salt('bf'))
         else null
       end
     )
     on conflict (email) do update
     set contact_email = coalesce(excluded.contact_email, users.contact_email, users.email),
         name = coalesce(excluded.name, users.name),
         display_name = coalesce(excluded.display_name, users.display_name),
         gid = coalesce(excluded.gid, users.gid),
         phone = coalesce(excluded.phone, users.phone),
         avatar_url = coalesce(excluded.avatar_url, users.avatar_url),
         role = coalesce($8, users.role, 'viewer'),
         status = coalesce($9, users.status, 'active'),
         password_hash = case
           when nullif($10::text, '') is not null then crypt($10::text, gen_salt('bf'))
           else users.password_hash
         end,
         updated_at = now()
     returning id, clerk_user_id, email, name, display_name, gid, role, status, avatar_url, created_at, updated_at`,
    [email, contactEmail, name, displayName, gid, phone, avatarUrl, role, status, password],
  );

  if (error) {
    throw new Error(error);
  }

  return rows[0] ?? null;
}

export async function POST(request: Request) {
  const currentUser = await getSessionUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? (body.items as ImportInput[]) : null;
  if (!items?.length) {
    return NextResponse.json({ error: "Không có dữ liệu import." }, { status: 400 });
  }

  if (isProtectedSharedClerkMode()) {
    const touchesProtectedFields = items.some((item) =>
      ["gid", "GID", "gui", "GUI", "role", "vai_tro", "status", "trang_thai"].some((key) =>
        Object.prototype.hasOwnProperty.call(item, key),
      ),
    );

    if (touchesProtectedFields) {
      return NextResponse.json(
        {
          error: "Shared Clerk mode is enabled. Import cannot modify gid/role/status in this environment.",
        },
        { status: 403 },
      );
    }
  }

  const imported: ImportedUserRow[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (const [index, item] of items.entries()) {
    try {
      const row = await upsertImportedUser(item);
      if (row) {
        imported.push(row);
      }
    } catch (error) {
      errors.push({
        index: index + 1,
        error: error instanceof Error ? error.message : String(error ?? "Có lỗi xảy ra."),
      });
    }
  }

  await logAudit({
    actorUserId: currentUser?.id ?? null,
    action: "import",
    tableName: "users",
    recordId: null,
    before: null,
    after: {
      imported: imported.length,
      failed: errors.length,
      emails: imported.map((row) => row.email),
    },
  });

  return NextResponse.json(
    {
      ok: errors.length === 0,
      imported: imported.length,
      failed: errors.length,
      users: imported,
      errors,
    },
    { status: errors.length && !imported.length ? 400 : 200 },
  );
}
