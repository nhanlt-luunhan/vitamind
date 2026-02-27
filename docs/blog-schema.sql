create extension if not exists pgcrypto;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  content text not null,
  cover_image text,
  author text,
  category text,
  tags text[],
  published boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_slug on posts(slug);
