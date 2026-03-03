import { query } from "@/lib/db/admin-db";

export type AccessPermission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
};

export type AccessGroup = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  permissions: AccessPermission[];
};

export type UserAuditItem = {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  actor_email: string | null;
  created_at: string;
};

export type AdminAccessUser = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
  groups: AccessGroup[];
  permissions: AccessPermission[];
  effective_permissions: AccessPermission[];
};

type JsonRow = Record<string, unknown> & {
  groups?: unknown;
  permissions?: unknown;
  effective_permissions?: unknown;
};

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function withCollections<T extends JsonRow>(row: T): AdminAccessUser {
  return {
    ...(row as unknown as Omit<AdminAccessUser, "groups" | "permissions" | "effective_permissions">),
    groups: toArray<AccessGroup>(row.groups),
    permissions: toArray<AccessPermission>(row.permissions),
    effective_permissions: toArray<AccessPermission>(row.effective_permissions),
  };
}

const userSelect = `
  select
    u.id,
    u.clerk_user_id,
    u.email,
    u.contact_email,
    u.name,
    u.display_name,
    u.gid,
    u.role,
    u.status,
    u.phone,
    u.bio,
    u.location,
    u.company,
    u.website,
    u.avatar_url,
    u.created_at,
    u.updated_at,
    coalesce((
      select json_agg(
        json_build_object(
          'id', g.id,
          'code', g.code,
          'name', g.name,
          'description', g.description,
          'created_at', g.created_at,
          'updated_at', g.updated_at,
          'permissions', coalesce((
            select json_agg(
              json_build_object(
                'id', p.id,
                'code', p.code,
                'name', p.name,
                'description', p.description,
                'created_at', p.created_at,
                'updated_at', p.updated_at
              )
              order by p.name
            )
            from access_group_permissions agp
            join access_permissions p on p.id = agp.permission_id
            where agp.group_id = g.id
          ), '[]'::json)
        )
        order by g.name
      )
      from user_groups ug
      join access_groups g on g.id = ug.group_id
      where ug.user_id = u.id
    ), '[]'::json) as groups,
    coalesce((
      select json_agg(
        json_build_object(
          'id', p.id,
          'code', p.code,
          'name', p.name,
          'description', p.description,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        )
        order by p.name
      )
      from user_permissions up
      join access_permissions p on p.id = up.permission_id
      where up.user_id = u.id
    ), '[]'::json) as permissions,
    coalesce((
      select json_agg(
        json_build_object(
          'id', perms.id,
          'code', perms.code,
          'name', perms.name,
          'description', perms.description,
          'created_at', perms.created_at,
          'updated_at', perms.updated_at
        )
        order by perms.name
      )
      from (
        select distinct p.id, p.code, p.name, p.description, p.created_at, p.updated_at
        from user_permissions up
        join access_permissions p on p.id = up.permission_id
        where up.user_id = u.id
        union
        select distinct p.id, p.code, p.name, p.description, p.created_at, p.updated_at
        from user_groups ug
        join access_group_permissions agp on agp.group_id = ug.group_id
        join access_permissions p on p.id = agp.permission_id
        where ug.user_id = u.id
      ) perms
    ), '[]'::json) as effective_permissions
  from users u
`;

export async function fetchAccessPermissions() {
  const result = await query<AccessPermission>(
    `select id, code, name, description, created_at, updated_at
     from access_permissions
     order by name asc, code asc`,
  );
  return result;
}

export async function fetchAccessGroups() {
  const result = await query<JsonRow>(
    `select
       g.id,
       g.code,
       g.name,
       g.description,
       g.created_at,
       g.updated_at,
       coalesce((
         select json_agg(
           json_build_object(
             'id', p.id,
             'code', p.code,
             'name', p.name,
             'description', p.description,
             'created_at', p.created_at,
             'updated_at', p.updated_at
           )
           order by p.name
         )
         from access_group_permissions agp
         join access_permissions p on p.id = agp.permission_id
         where agp.group_id = g.id
       ), '[]'::json) as permissions
     from access_groups g
     order by g.name asc, g.code asc`,
  );

  return {
    rows: result.rows.map((row) => ({
      ...(row as unknown as Omit<AccessGroup, "permissions">),
      permissions: toArray<AccessPermission>(row.permissions),
    })),
    error: result.error,
  };
}

export async function fetchDecoratedUsers(limit?: number | null) {
  const result = await query<JsonRow>(
    `${userSelect}
     order by coalesce(u.updated_at, u.created_at) desc, u.created_at desc
     ${limit ? "limit $1" : ""}`,
    limit ? [limit] : undefined,
  );

  return {
    rows: result.rows.map(withCollections),
    error: result.error,
  };
}

export async function fetchDecoratedUserById(id: string) {
  const result = await query<JsonRow>(
    `${userSelect}
     where u.id = $1
     limit 1`,
    [id],
  );

  return {
    row: result.rows[0] ? withCollections(result.rows[0]) : null,
    error: result.error,
  };
}

export async function fetchUserAudit(userId: string, limit = 12) {
  const result = await query<UserAuditItem>(
    `select
       a.id,
       a.action,
       a.table_name,
       a.record_id,
       actor.email as actor_email,
       a.created_at
     from audit_log a
     left join users actor on actor.id = a.actor_user_id
     where (a.table_name = 'users' and a.record_id = $1)
        or actor.id = $1
     order by a.created_at desc
     limit $2`,
    [userId, limit],
  );
  return result;
}
