create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  name text,
  role text default 'admin',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

insert into users (email, password_hash, name, role)
values (
  'nhanlt.luunhan@gmail.com',
  crypt('111222333', gen_salt('bf')),
  'Nhan LT',
  'admin'
)
on conflict (email) do update
set password_hash = excluded.password_hash,
    name = excluded.name,
    role = excluded.role,
    updated_at = now();
