-- Table lưu mã OTP xác thực email khi đăng ký tài khoản mới.
-- Email được xác thực TRƯỚC khi user record được insert vào users table.

create table if not exists email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamp not null,
  consumed_at timestamp,
  created_at timestamp default now()
);

create index if not exists idx_email_verification_tokens_email
  on email_verification_tokens((lower(email)));

create index if not exists idx_email_verification_tokens_expires_at
  on email_verification_tokens(expires_at);
