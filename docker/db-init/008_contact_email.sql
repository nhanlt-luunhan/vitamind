alter table users
  add column if not exists contact_email text;

update users
set contact_email = email
where contact_email is null;
