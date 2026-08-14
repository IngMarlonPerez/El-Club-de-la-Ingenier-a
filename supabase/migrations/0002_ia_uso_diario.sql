-- Presupuesto diario del asistente de IA (Groq + NVIDIA como respaldo)
-- Aplicar en el SQL Editor de Supabase, o vía `supabase db push`.

create table if not exists public.ia_uso_diario (
  fecha date not null,
  proveedor text not null check (proveedor in ('groq', 'nvidia')),
  mensajes integer not null default 0,
  primary key (fecha, proveedor)
);

alter table public.ia_uso_diario enable row level security;
-- Sin políticas públicas: solo accesible con la service_role key,
-- desde pages/api/chat.js. Mismo criterio de mínimo privilegio que `solicitudes`.

-- Incremento atómico (evita condiciones de carrera entre pedidos simultáneos)
create or replace function public.increment_ia_uso(p_fecha date, p_proveedor text)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.ia_uso_diario (fecha, proveedor, mensajes)
  values (p_fecha, p_proveedor, 1)
  on conflict (fecha, proveedor)
  do update set mensajes = public.ia_uso_diario.mensajes + 1
  returning mensajes;
$$;
