update users
set role = 'admin',
    status = 'active',
    updated_at = now()
where lower(email) = 'nhanlt.luunhan@gmail.com';
