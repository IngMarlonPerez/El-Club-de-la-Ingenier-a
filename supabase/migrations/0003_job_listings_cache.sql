-- Caché del Buscador de Empleo (Jooble + Computrabajo scrapeado por el cron).
-- Aplicar en el SQL Editor de Supabase, o vía `supabase db push`.

create table if not exists public.job_listings_cache (
  clave_busqueda text primary key,
  resultados jsonb not null default '[]'::jsonb,
  actualizado_en timestamptz not null default now()
);

alter table public.job_listings_cache enable row level security;
-- Sin políticas públicas: solo accesible con la service_role key, desde
-- pages/api/jobs/search.js y pages/api/cron/scrape-jobs.js. Mismo criterio de
-- mínimo privilegio que ia_uso_diario.

create index if not exists job_listings_cache_actualizado_en_idx
  on public.job_listings_cache (actualizado_en);
