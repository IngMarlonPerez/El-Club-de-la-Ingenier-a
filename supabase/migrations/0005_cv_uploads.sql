-- CVs guardados en el Buscador de Empleo -- opt-in, requiere login. El PDF se sube
-- directo desde el navegador del propio usuario a Supabase Storage (nunca pasa por
-- nuestro servidor), protegido por las mismas políticas RLS que ya usa `miembros`
-- (auth.uid() = user_id). Aplicar en el SQL Editor de Supabase, o vía `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- Bucket privado de Storage
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cv-uploads', 'cv-uploads', false, 8388608, array['application/pdf'])
on conflict (id) do nothing;

-- Un usuario solo puede subir/leer/borrar objetos dentro de su propia carpeta
-- (convención de ruta: {user_id}/{archivo}.pdf) -- patrón estándar de Supabase Storage.
-- `drop policy if exists` antes de cada `create` para que el script se pueda volver a
-- correr sin error si una corrida anterior quedó a medias (Postgres no soporta
-- `create policy if not exists`).
drop policy if exists "cv_uploads_select_own" on storage.objects;
create policy "cv_uploads_select_own" on storage.objects
  for select
  using (bucket_id = 'cv-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_uploads_insert_own" on storage.objects;
create policy "cv_uploads_insert_own" on storage.objects
  for insert
  with check (bucket_id = 'cv-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_uploads_delete_own" on storage.objects;
create policy "cv_uploads_delete_own" on storage.objects
  for delete
  using (bucket_id = 'cv-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────
-- Metadata: permite mostrar "ya tienes un CV guardado" sin listar el bucket,
-- y da un lugar limpio para el botón de eliminar.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.cv_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  nombre_original text,
  tamano_bytes integer,
  subido_en timestamptz not null default now()
);

alter table public.cv_uploads enable row level security;

drop policy if exists "cv_uploads_meta_select_own" on public.cv_uploads;
create policy "cv_uploads_meta_select_own" on public.cv_uploads
  for select
  using (auth.uid() = user_id);

drop policy if exists "cv_uploads_meta_insert_own" on public.cv_uploads;
create policy "cv_uploads_meta_insert_own" on public.cv_uploads
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "cv_uploads_meta_delete_own" on public.cv_uploads;
create policy "cv_uploads_meta_delete_own" on public.cv_uploads
  for delete
  using (auth.uid() = user_id);

create index if not exists cv_uploads_user_id_idx on public.cv_uploads (user_id);
