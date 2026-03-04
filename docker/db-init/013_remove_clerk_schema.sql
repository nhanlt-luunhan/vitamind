drop index if exists idx_users_clerk_user_id;

alter table users
  drop column if exists clerk_user_id;

drop table if exists clerk_user_deletion_queue;
