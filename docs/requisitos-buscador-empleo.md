# MEGA-PROMPT PARA CLAUDE CODE — Template "Buscador de Empleo"
## El Club de la Ingeniería (UNEMI)

> Copia y pega este documento completo como primer mensaje a Claude Code dentro del repo clonado. Está escrito para que actúe como Director de Ingeniería de una organización simulada de 10 equipos (contexto ya fijado en el proyecto) e implemente esta feature de punta a punta.

---

## 0. Rol y contexto fijo

Actúas como **Director de Ingeniería (VP Engineering)** de la plataforma web de **El Club de la Ingeniería**, comunidad universitaria de la Universidad Estatal de Milagro (UNEMI). Trabajas con una organización simulada de 100 desarrolladores en 10 equipos (1 líder senior + 9 ingenieros por equipo); identifica qué equipo(s) son dueños de cada parte de esta tarea y resuelve con ese sombrero puesto.

- **Repo:** `https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a`
- **Hosting/CI-CD:** Vercel (deploy preview por PR + producción en `main`)
- **Stack actual:** Next.js 16 (Pages Router) + React 19, HTML/CSS/JS vanilla para la landing, Zod para validación, Groq/NVIDIA para el asistente IA
- **Base de datos:** Supabase (Postgres + RLS) — en desarrollo
- **Idioma del producto:** español (Ecuador)
- **Fase actual del roadmap:** MVP activo + Reto Linux completos; Fase 0 (monorepo/CI-CD/subdominios) y Fase 1 (Supabase/OAuth) aún no completas. **Por lo tanto, esta feature se implementa como ruta/página dentro del Next.js actual (`/proyectos/buscador-empleo`), NO como subdominio independiente** — la migración a subdominio propio (`empleos.*`) queda documentada como paso futuro cuando la infraestructura de Fase 0 esté lista.

**Este es el entregable más importante de mi proyecto de titulación** — trátalo con ese nivel de rigor: cada decisión debe quedar justificada y documentable en el capítulo de implementación de la tesis.

---

## 1. Objetivo de la feature

Al hacer clic en la sección **"Proyectos"** del sitio, debe abrirse una pantalla (nueva ruta, no un template externo todavía) con un **buscador de trabajo**:

1. Formulario con: **carrera/profesión**, **experiencia** (rango: sin experiencia / 1-2 años / 3-5 años / 5+ años), **tipo de empleo** (tiempo completo / medio tiempo / freelance / remoto / prácticas), **ubicación** (opcional, default Ecuador).
2. Al buscar, el sistema devuelve **10 ofertas de los últimos 7 días**, ordenadas por fecha de publicación descendente.
3. Cada resultado muestra: título, empresa, ubicación, tipo de empleo, fecha de publicación, fuente (badge: Jooble / Computrabajo / Multitrabajos) y enlace directo a la oferta original (nunca se aloja el contenido completo de la oferta, solo un resumen).

---

## 2. Fuentes de datos (investigadas y decididas — no las cambies sin justificación)

| Fuente | Tipo | Rol | Notas |
|---|---|---|---|
| **Jooble API** | API REST oficial, gratuita | **Primaria** | `POST https://jooble.org/api/{JOOBLE_API_KEY}` con `{ keywords, location }`. Cobertura confirmada en Ecuador (`ec.jooble.org`). Registro gratis en `jooble.org/api/about`. Sin necesidad de scraping. |
| **Computrabajo Ecuador** (`ec.computrabajo.com`) y **Multitrabajos** (`multitrabajos.com`) | Scraping ligero server-side | **Secundaria, cacheada** | Portales sin API pública. Hay precedente académico (paper de Springer sobre inteligencia de mercado laboral en Ecuador) que scrapea exactamente estos dos portales. Implementar SOLO server-side, con caché agresivo (no scrapear en cada búsqueda de usuario), respetando `robots.txt`, sin login, con User-Agent identificado. |
| **Encuentra Empleo / Red Socio Empleo** (`.gob.ec`) | Scraping | **Opcional, fuera del MVP** | Dominio gubernamental, sin API/datos abiertos confirmados. Mayor sensibilidad legal/ética. NO implementar en el primer corte; dejar como trabajo futuro documentado con advertencia explícita en la tesis. |
| **Adzuna** | API | **Descartada** | Su cobertura no incluye Ecuador. No integrar. |
| **LinkedIn** | — | **Prohibida** | Su ToS prohíbe explícitamente scraping/extracción de datos. No usar bajo ninguna circunstancia. |

---

## 3. Arquitectura (Equipo 3 · Plataforma de Templates + Equipo 4 · Backend/API)

```
Cliente (React)
  └─ /proyectos/buscador-empleo (página Next.js)
       └─ POST /api/jobs/search  { carrera, experiencia, tipoEmpleo, ubicacion }
            ├─ Valida input con Zod
            ├─ Rate limit (mismo patrón que /api/chat)
            ├─ Revisa caché (Supabase o in-memory con TTL, ej. 1h) por combinación de filtros
            │    └─ Si hay caché fresco → responde desde caché
            ├─ Si no hay caché:
            │    ├─ Llama a Jooble API (server-side, API key en env var)
            │    ├─ Job en background/cron (NO en el request del usuario) mantiene actualizada
            │    │  la tabla de resultados scrapeados de Computrabajo/Multitrabajos
            │    ├─ Combina ambas fuentes, deduplica por (título + empresa normalizados)
            │    ├─ Filtra: solo ofertas con fecha ≤ 7 días
            │    └─ Guarda en caché, devuelve top 10 más recientes
            └─ Responde JSON al cliente
```

**Decisión de diseño clave:** el scraping NUNCA ocurre en el hilo de la petición del usuario. Corre en un job programado (Vercel Cron Job o Supabase Edge Function con cron) que refresca una tabla `job_listings_cache` cada N horas. El endpoint que consume el usuario solo lee de Jooble (en vivo, es API real) + de esa tabla cacheada (scraping). Esto evita golpear los portales scrapeados en tiempo real y reduce el riesgo de bloqueo/IP-ban.

---

## 4. Tareas concretas para implementar

1. **Equipo 1 (UX/UI):** diseñar la página `/proyectos/buscador-empleo` — formulario con los 4 campos, estado de carga, estado vacío ("no hay ofertas nuevas en 7 días para ese filtro"), tarjetas de resultado con badge de fuente. Mantener paleta teal/gold/dark mode y tipografía IBM Plex ya usadas en el sitio.
2. **Equipo 4 (Backend/API):**
   - `pages/api/jobs/search.js`: valida con Zod, aplica rate limit, orquesta Jooble + caché.
   - `lib/jobs/jooble.js`: cliente Jooble (fetch server-side, `JOOBLE_API_KEY` en env var, nunca expuesta al cliente).
   - `lib/jobs/aggregator.js`: función pura que recibe arrays de ambas fuentes, deduplica y filtra por fecha — con tests unitarios.
   - `lib/jobs/cache.js`: lectura/escritura de `job_listings_cache` en Supabase (o alternativa in-memory si Supabase aún no está listo — documentar cuál se usó y por qué).
3. **Equipo 6 (Infra/DevOps):** configurar el cron job (Vercel Cron o Supabase Edge Function) que ejecuta el scraper de Computrabajo/Multitrabajos cada N horas y puebla `job_listings_cache`. Agregar `JOOBLE_API_KEY` a las variables de entorno de Vercel y al `.env.local.example`.
4. **Equipo 7 (Ciberseguridad) — checklist obligatorio antes de mergear:**
   - API key de Jooble solo en servidor, nunca en bundle de cliente.
   - Validación estricta de los 4 campos del formulario con Zod (whitelist de valores para experiencia/tipo de empleo, no texto libre sin sanitizar).
   - Rate limiting en `/api/jobs/search` (mismo mecanismo que ya existe en `/api/chat`).
   - Scraper con User-Agent identificado, respeta `robots.txt` de cada portal, sin bypass de CAPTCHAs ni login.
   - No se persiste información personal de terceros (nombres de reclutadores, emails de contacto de ofertas) más allá de lo estrictamente necesario para mostrar la oferta.
5. **Equipo 8 (QA/Testing):**
   - Tests unitarios de `aggregator.js` (dedupe, filtro de fecha, orden).
   - Test de integración de `/api/jobs/search` con mocks de Jooble y de la tabla de caché (sin llamadas reales en CI).
   - Test manual: formulario vacío, filtros sin resultados, error de red hacia Jooble (debe degradar a solo caché, no romper la UI).
6. **Equipo 9 (Datos/Métricas):** agregar tracking básico de cuántas búsquedas se hacen y con qué filtros (sin datos personales), para poder reportar en la tesis el uso real de la feature.

---

## 5. Variables de entorno nuevas

```
JOOBLE_API_KEY=          # requerida — obtener en https://jooble.org/api/about
JOB_CACHE_TTL_HOURS=1    # opcional, default 1
JOB_SCRAPER_CRON_HOURS=6 # opcional, default 6
```

Documentarlas en el README junto a las ya existentes (`GROQ_API_KEY`, etc.), y nunca commitear `.env.local`.

---

## 6. Criterio de "hecho"

- [ ] Página `/proyectos/buscador-empleo` accesible desde la tarjeta "Proyectos" de la landing.
- [ ] Formulario funcional con los 4 campos y validación en cliente y servidor.
- [ ] Devuelve exactamente hasta 10 ofertas, todas con fecha ≤ 7 días, sin duplicados entre fuentes.
- [ ] Jooble integrado como API real (no scraping).
- [ ] Scraping de Computrabajo/Multitrabajos corre solo en el cron, nunca en el request del usuario.
- [ ] Checklist de Equipo 7 cumplido.
- [ ] Al menos los tests descritos en Equipo 8 pasando en CI.
- [ ] README actualizado con las nuevas variables de entorno y con una nota corta sobre las fuentes de datos usadas y por qué (para poder citarlo directo en la tesis).

Empieza por el punto 2 (Backend/API) ya que todo lo demás depende del contrato de `/api/jobs/search`. Antes de escribir código, confírmame en una línea el plan de archivos que vas a crear/tocar.
