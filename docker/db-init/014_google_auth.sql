alter table users
  add column if not exists google_subject text,
  add column if not exists google_email_verified boolean default false;

create unique index if not exists idx_users_google_subject
  on users(google_subject)
  where google_subject is not null;
