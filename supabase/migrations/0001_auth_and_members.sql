-- Club de Ingeniería — esquema de membresía y solicitudes
-- Aplicar en el SQL Editor de Supabase, o vía `supabase db push` si tienes el CLI enlazado.

-- ─────────────────────────────────────────────────────────────
-- Tabla: miembros (una fila por usuario autenticado)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.miembros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nombre text,
  correo text,
  rol text not null default 'miembro' check (rol in ('miembro', 'editor', 'admin')),
  area_interes text,
  mensaje text,
  creado_en timestamptz not null default now()
);

alter table public.miembros enable row level security;

-- Helper: ¿el usuario que llama es editor/admin?
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.miembros
    where user_id = auth.uid() and rol in ('editor', 'admin')
  );
$$;

create policy "miembros_select_own" on public.miembros
  for select
  using (auth.uid() = user_id);

create policy "miembros_select_staff" on public.miembros
  for select
  using (public.is_staff());

create policy "miembros_update_own" on public.miembros
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "miembros_update_staff" on public.miembros
  for update
  using (public.is_staff())
  with check (public.is_staff());

-- Evita que un usuario normal se auto-asigne rol editor/admin
-- editando su propia fila (la policy de arriba permite el UPDATE,
-- este trigger protege específicamente la columna `rol`).
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rol is distinct from old.rol and not public.is_staff() then
    new.rol := old.rol;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_self_escalation on public.miembros;
create trigger trg_prevent_role_self_escalation
  before update on public.miembros
  for each row
  execute function public.prevent_role_self_escalation();

-- Crea automáticamente la fila de miembro al registrarse (cualquier proveedor OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.miembros (user_id, nombre, correo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Tabla: solicitudes (leads del formulario sin login)
-- Sin políticas públicas: solo accesible con la service_role key,
-- desde pages/api/join.js. RLS activo = ningún acceso por defecto.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  area_interes text,
  mensaje text,
  consentimiento boolean not null,
  creado_en timestamptz not null default now()
);

alter table public.solicitudes enable row level security;
