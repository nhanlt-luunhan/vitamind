create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamp not null,
  consumed_at timestamp,
  created_at timestamp default now()
);

create index if not exists idx_password_reset_tokens_user_id
  on password_reset_tokens(user_id);

create index if not exists idx_password_reset_tokens_email
  on password_reset_tokens((lower(email)));

create index if not exists idx_password_reset_tokens_expires_at
  on password_reset_tokens(expires_at);
