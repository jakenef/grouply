pg_dump "SESSION_POOLER_URL" \
--format=plain \
--data-only \
 --no-owner \
 --no-privileges \
 -f prod.sql

supabase db reset

psql postgresql://postgres:postgres@localhost:54322/postgres -f prod.sql

psql postgresql://postgres:postgres@localhost:54322/postgres
select id, email from auth.users;
