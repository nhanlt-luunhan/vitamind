create table if not exists clerk_user_deletion_queue (
  clerk_user_id text primary key,
  email text,
  requested_at timestamp default now(),
  processed_at timestamp,
  last_error text
);

create index if not exists idx_clerk_user_deletion_queue_pending
  on clerk_user_deletion_queue (processed_at, requested_at);
