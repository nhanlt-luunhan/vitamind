alter table users
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists avatar_url text;
