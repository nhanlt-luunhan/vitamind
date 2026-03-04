alter table users
  add column if not exists display_name text,
  add column if not exists contact_email text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists avatar_url text,
  add column if not exists gid text,
  add column if not exists clerk_user_id text,
  add column if not exists status text default 'active';

update users
set contact_email = email
where contact_email is null or btrim(contact_email) = '';

update users
set display_name = coalesce(nullif(name, ''), split_part(email, '@', 1))
where display_name is null or btrim(display_name) = '';

update users
set status = 'active'
where status is null or btrim(status) = '';
