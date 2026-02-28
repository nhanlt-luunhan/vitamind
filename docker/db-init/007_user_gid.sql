alter table users
  add column if not exists gid text;

update users
set gid = null
where gid is not null
  and btrim(gid) = '';

create unique index if not exists idx_users_gid_unique
  on users ((lower(gid)))
  where gid is not null;

update users
set gid = 'GID-NHANLT'
where lower(email) = 'nhanlt.luunhan@gmail.com'
  and gid is null;
