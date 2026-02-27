-- Admin schema additions
alter table users
  add column if not exists status text default 'active';

alter table users
  alter column role set default 'viewer';

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price numeric(12, 2) default 0,
  sku text,
  brand text,
  category text,
  images text[] default array[]::text[],
  specs jsonb default '{}'::jsonb,
  status text default 'draft',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_deleted on products(deleted_at);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  items jsonb default '[]'::jsonb,
  subtotal numeric(12, 2) default 0,
  shipping numeric(12, 2) default 0,
  status text default 'new',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_deleted on orders(deleted_at);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text,
  meta jsonb default '{}'::jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create index if not exists idx_media_type on media(type);
create index if not exists idx_media_deleted on media(deleted_at);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  before jsonb,
  after jsonb,
  created_at timestamp default now()
);

create index if not exists idx_audit_table on audit_log(table_name);
create index if not exists idx_audit_created on audit_log(created_at);
