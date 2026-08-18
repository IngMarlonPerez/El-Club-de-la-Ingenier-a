-- Rate limiting real, compartido entre instancias serverless (reemplaza los `Map` en
-- memoria de pages/api/chat.js, pages/api/join.js y lib/jobs/rateLimit.js, que se
-- reseteaban cada vez que Vercel arrancaba una instancia nueva de la función).
-- Aplicar en el SQL Editor de Supabase, o vía `supabase db push`.

create table if not exists public.rate_limits (
  bucket_key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Sin políticas públicas: solo accesible con la service_role key, desde
-- lib/rateLimit.js. Mismo criterio de mínimo privilegio que ia_uso_diario
-- y job_listings_cache.

-- Incremento atómico con reseteo de ventana en una sola sentencia (evita
-- condiciones de carrera entre pedidos concurrentes del mismo IP/ruta).
-- Devuelve true si el pedido debe bloquearse (superó p_max en la ventana actual).
create or replace function public.increment_rate_limit(p_key text, p_window_ms integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (bucket_key, count, window_start)
  values (p_key, 1, now())
  on conflict (bucket_key) do update
    set count = case
          when public.rate_limits.window_start < now() - (p_window_ms::text || ' milliseconds')::interval
            then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < now() - (p_window_ms::text || ' milliseconds')::interval
            then now()
          else public.rate_limits.window_start
        end
  returning count into v_count;

  return v_count > p_max;
end;
$$;

create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);
