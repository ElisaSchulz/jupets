-- Função usada pela tarefa automática do GitHub (.github/workflows/supabase-keepalive.yml)
-- para manter o projeto do Supabase ativo no plano grátis.
-- Rode uma vez no Supabase: SQL Editor → New query → cole este arquivo → Run.

create or replace function public.keepalive()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

grant execute on function public.keepalive() to anon;
