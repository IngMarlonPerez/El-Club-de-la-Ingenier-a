-- Kernel Cero: progreso por usuario y certificados "Héroe del Club".
-- Aplicar en el SQL Editor de Supabase, o vía `supabase db push`. Se puede volver a ejecutar sin error.
--
-- Diseño de seguridad: los usuarios SOLO pueden LEER lo suyo. Escribir progreso y emitir certificados
-- lo hace únicamente el servidor (service role) tras validar el orden de niveles y la plausibilidad de
-- los tiempos. No hay políticas de insert/update/delete para usuarios.

-- ─────────────────────────────────────────────────────────────
-- Progreso: una fila por usuario y nivel completado
-- ─────────────────────────────────────────────────────────────
create table if not exists public.kc_progreso (
  user_id uuid not null references auth.users(id) on delete cascade,
  nivel smallint not null check (nivel between 1 and 31),
  duracion_seg integer not null check (duracion_seg >= 0),
  pistas integer not null default 0 check (pistas >= 0),
  completado_en timestamptz not null default now(),
  primary key (user_id, nivel)
);

alter table public.kc_progreso enable row level security;

drop policy if exists "kc_progreso_select_own" on public.kc_progreso;
create policy "kc_progreso_select_own" on public.kc_progreso
  for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Certificados: uno por usuario, con código único y firma del Club
-- ─────────────────────────────────────────────────────────────
create sequence if not exists public.certificado_seq;

create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^CLUB-CERT-[0-9]{4}-[0-9]{4,6}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 3 and 70),
  emitido_en timestamptz not null default now(),
  huella text not null,            -- SHA-256 de la cadena canónica (código|nombre|fecha)
  firma text not null,             -- firma Ed25519 (base64url) con la clave propia del Club
  resumen jsonb not null default '{}'::jsonb,   -- tiempo total, nº de niveles, etc. (auditoría)
  revocado boolean not null default false,
  revocado_motivo text
);

alter table public.certificados enable row level security;

drop policy if exists "certificados_select_own" on public.certificados;
create policy "certificados_select_own" on public.certificados
  for select
  using (auth.uid() = user_id);

-- Número consecutivo para el código. Solo lo puede llamar el servidor.
create or replace function public.siguiente_secuencia_certificado()
returns bigint
language sql
security definer
set search_path = public
as $$ select nextval('public.certificado_seq') $$;

revoke all on function public.siguiente_secuencia_certificado() from public, anon, authenticated;
grant execute on function public.siguiente_secuencia_certificado() to service_role;
