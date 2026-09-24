-- =====================================================================
--  Ju Pets · banco de dados do cadastro (Supabase)
--  Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
--  Pode rodar de novo sem problema (não apaga cadastros).
-- =====================================================================

-- ---------- Tabelas ----------
create table if not exists public.tutores (
  id                  uuid primary key default gen_random_uuid(),
  criado_em           timestamptz not null default now(),
  nome                text not null check (char_length(nome) between 1 and 200),
  cpf                 text not null check (char_length(cpf) <= 20),
  endereco            text not null check (char_length(endereco) <= 500),
  telefone            text not null check (char_length(telefone) <= 30),
  contato_emergencia  text not null check (char_length(contato_emergencia) <= 500),
  autoriza_fotos      boolean not null,
  autoriza_emergencia boolean not null
);

create table if not exists public.pets (
  id                 uuid primary key default gen_random_uuid(),
  tutor_id           uuid not null references public.tutores(id) on delete cascade,
  ordem              int  not null default 1,
  -- dados
  nome               text not null check (char_length(nome) between 1 and 120),
  nascimento         date,
  idade_aproximada   text check (char_length(idade_aproximada) <= 60),
  sexo               text not null check (sexo in ('Fêmea','Macho')),
  raca               text check (char_length(raca) <= 120),
  castrado           boolean not null,
  ultimo_cio         text check (char_length(ultimo_cio) <= 120),
  -- saúde
  veterinario        text check (char_length(veterinario) <= 300),
  hospitais          text[] not null default '{}',
  peso_kg            numeric(5,2),
  doenca_cronica     text check (char_length(doenca_cronica) <= 1000),   -- vazio = não tem
  alergia            text check (char_length(alergia) <= 1000),          -- vazio = não tem
  antipulgas_em_dia  boolean not null,
  medicamento        text check (char_length(medicamento) <= 1000),      -- vazio = não usa
  -- alimentação
  alimentacao        text not null check (char_length(alimentacao) <= 2000),
  pode_comer         text[] not null default '{}',
  -- comportamento
  reacoes            text[] not null default '{}',
  info_adicional     text check (char_length(info_adicional) <= 3000)
);

create index if not exists pets_tutor_id_idx on public.pets (tutor_id);

-- Segurança: ninguém lê nem grava direto nas tabelas pelo site.
-- Só dá pra cadastrar pela função "cadastrar" abaixo. Você vê tudo pelo painel.
alter table public.tutores enable row level security;
alter table public.pets    enable row level security;

-- ---------- Função de cadastro (tutor + todos os pets de uma vez) ----------
create or replace function public.cadastrar(tutor jsonb, pets jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
  p   jsonb;
  n   int := 0;
begin
  if jsonb_typeof(pets) <> 'array' or jsonb_array_length(pets) = 0 then
    raise exception 'Cadastre pelo menos um pet.';
  end if;
  if jsonb_array_length(pets) > 10 then
    raise exception 'Máximo de 10 pets por cadastro.';
  end if;

  insert into public.tutores (nome, cpf, endereco, telefone, contato_emergencia, autoriza_fotos, autoriza_emergencia)
  values (
    trim(tutor->>'nome'), tutor->>'cpf', tutor->>'endereco', tutor->>'telefone',
    tutor->>'contato_emergencia',
    (tutor->>'autoriza_fotos')::boolean,
    (tutor->>'autoriza_emergencia')::boolean
  )
  returning id into tid;

  for p in select * from jsonb_array_elements(pets) loop
    n := n + 1;
    insert into public.pets (
      tutor_id, ordem, nome, nascimento, idade_aproximada, sexo, raca, castrado, ultimo_cio,
      veterinario, hospitais, peso_kg, doenca_cronica, alergia, antipulgas_em_dia, medicamento,
      alimentacao, pode_comer, reacoes, info_adicional
    ) values (
      tid, n, trim(p->>'nome'),
      nullif(p->>'nascimento','')::date,
      nullif(p->>'idade_aproximada',''),
      p->>'sexo',
      nullif(p->>'raca',''),
      (p->>'castrado')::boolean,
      nullif(p->>'ultimo_cio',''),
      nullif(p->>'veterinario',''),
      coalesce(array(select jsonb_array_elements_text(p->'hospitais')), '{}'),
      nullif(p->>'peso_kg','')::numeric,
      nullif(p->>'doenca_cronica',''),
      nullif(p->>'alergia',''),
      (p->>'antipulgas_em_dia')::boolean,
      nullif(p->>'medicamento',''),
      p->>'alimentacao',
      coalesce(array(select jsonb_array_elements_text(p->'pode_comer')), '{}'),
      coalesce(array(select jsonb_array_elements_text(p->'reacoes')), '{}'),
      nullif(p->>'info_adicional','')
    );
  end loop;

  return tid;
end;
$$;

revoke all on function public.cadastrar(jsonb, jsonb) from public;
grant execute on function public.cadastrar(jsonb, jsonb) to anon, authenticated;

-- ---------- Keepalive (usado pela tarefa automática do GitHub) ----------
create or replace function public.keepalive()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

grant execute on function public.keepalive() to anon;

-- ---------- Visão pra consultar no painel: uma linha por pet, com os dados do tutor ----------
create or replace view public.fichas
with (security_invoker = true) as
select t.criado_em, t.nome as tutor, t.telefone, t.cpf, t.endereco, t.contato_emergencia,
       t.autoriza_fotos, t.autoriza_emergencia,
       p.nome as pet, p.sexo, p.raca, p.nascimento, p.idade_aproximada, p.castrado, p.ultimo_cio,
       p.peso_kg, p.veterinario, p.hospitais, p.doenca_cronica, p.alergia, p.antipulgas_em_dia,
       p.medicamento, p.alimentacao, p.pode_comer, p.reacoes, p.info_adicional,
       t.id as tutor_id, p.id as pet_id
from public.tutores t
join public.pets p on p.tutor_id = t.id
order by t.criado_em desc, p.ordem;

revoke all on public.fichas from anon, authenticated;

-- =====================================================================
--  Página de admin (admin.html): só quem está na tabela "admins" lê os cadastros.
--  Depois de rodar este arquivo, cadastre seu e-mail (o mesmo do usuário criado em
--  Authentication → Users) rodando no SQL Editor:
--    insert into public.admins (email) values ('seu-email@exemplo.com');
-- =====================================================================
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;   -- sem policies: ninguém lê pelo site

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant select, delete on public.tutores to authenticated;
grant select on public.pets to authenticated;

drop policy if exists "admin lê tutores" on public.tutores;
create policy "admin lê tutores" on public.tutores
  for select to authenticated using (public.is_admin());

drop policy if exists "admin apaga tutores" on public.tutores;
create policy "admin apaga tutores" on public.tutores
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin lê pets" on public.pets;
create policy "admin lê pets" on public.pets
  for select to authenticated using (public.is_admin());
