create table if not exists access_permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists access_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists access_group_permissions (
  group_id uuid not null references access_groups(id) on delete cascade,
  permission_id uuid not null references access_permissions(id) on delete cascade,
  created_at timestamp default now(),
  primary key (group_id, permission_id)
);

create table if not exists user_groups (
  user_id uuid not null references users(id) on delete cascade,
  group_id uuid not null references access_groups(id) on delete cascade,
  created_at timestamp default now(),
  primary key (user_id, group_id)
);

create table if not exists user_permissions (
  user_id uuid not null references users(id) on delete cascade,
  permission_id uuid not null references access_permissions(id) on delete cascade,
  created_at timestamp default now(),
  primary key (user_id, permission_id)
);

create index if not exists idx_access_permissions_code on access_permissions(code);
create index if not exists idx_access_groups_code on access_groups(code);
create index if not exists idx_user_groups_user on user_groups(user_id);
create index if not exists idx_user_permissions_user on user_permissions(user_id);
create index if not exists idx_group_permissions_group on access_group_permissions(group_id);

insert into access_permissions (code, name, description)
values
  ('users.manage', 'Quan ly user', 'Tao, cap nhat, khoa hoac xoa user trong admin'),
  ('orders.manage', 'Quan ly don hang', 'Theo doi va cap nhat don hang'),
  ('blog.manage', 'Quan ly blog', 'Tao va cap nhat bai viet'),
  ('products.manage', 'Quan ly san pham', 'Cap nhat danh muc san pham'),
  ('media.manage', 'Quan ly media', 'Tai len va quan ly tai nguyen media')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

insert into access_groups (code, name, description)
values
  ('admins', 'Administrators', 'Nhom van hanh toan quyen'),
  ('editors', 'Editors', 'Nhom bien tap noi dung va media')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

insert into access_group_permissions (group_id, permission_id)
select g.id, p.id
from access_groups g
join access_permissions p on p.code in ('users.manage', 'orders.manage', 'blog.manage', 'products.manage', 'media.manage')
where g.code = 'admins'
on conflict do nothing;

insert into access_group_permissions (group_id, permission_id)
select g.id, p.id
from access_groups g
join access_permissions p on p.code in ('blog.manage', 'products.manage', 'media.manage')
where g.code = 'editors'
on conflict do nothing;
