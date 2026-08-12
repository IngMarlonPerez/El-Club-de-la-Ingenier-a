# CLAUDE.md — El Club de la Ingeniería
### Mega-Prompt de Ingeniería de Requerimientos para Claude Code

**Versión:** 1.0 · **Rol de quien redacta este documento:** Ingeniero de Software Senior — Gestión de Proyectos Informáticos
**Repositorio:** https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a
**Stack objetivo:** Next.js + Supabase + Vercel + OAuth (Google, GitHub, Facebook) + arquitectura de micro-frontends por subdominio

---

## 0. CÓMO USAR ESTE ARCHIVO

Este archivo va en la raíz del repo como `CLAUDE.md`. Claude Code lo lee automáticamente al iniciar sesión en el proyecto (`claude` en la carpeta del repo). Además, cada "equipo" descrito abajo debe copiarse como una **skill independiente** en `.claude/skills/<nombre-equipo>/SKILL.md`, para que puedas invocar a un equipo específico con `/skill nombre-equipo` cuando quieras que Claude Code razone con ese sombrero puesto (p. ej. "activa el equipo de ciberseguridad y audita el módulo de auth").

Estructura recomendada del repositorio:

```
El-club-de-la-Ingenieria/
├── CLAUDE.md                      ← este documento (contexto global)
├── .claude/
│   ├── skills/
│   │   ├── 01-ux-ui/SKILL.md
│   │   ├── 02-frontend-templates/SKILL.md
│   │   ├── 03-backend-api/SKILL.md
│   │   ├── 04-database-supabase/SKILL.md
│   │   ├── 05-auth-identity/SKILL.md
│   │   ├── 06-devops-infra/SKILL.md
│   │   ├── 07-ciberseguridad/SKILL.md
│   │   ├── 08-qa-testing/SKILL.md
│   │   ├── 09-performance-metricas/SKILL.md
│   │   └── 10-pm-documentacion/SKILL.md
│   └── settings.json
├── apps/
│   ├── portal/                    ← app "shell" (home, login, dashboard del club)
│   └── templates/
│       ├── noticia-ciencia-tec/   ← microservicio/mini-app plantilla
│       └── _template-base/        ← plantilla base para clonar nuevas
├── packages/
│   ├── ui/                        ← design system compartido
│   ├── config/                    ← eslint, tsconfig, tailwind compartidos
│   └── supabase-client/           ← wrapper tipado de Supabase
├── infra/
│   ├── vercel/
│   └── github-actions/
└── docs/
    ├── arquitectura.md
    ├── seguridad.md
    └── metricas.md
```

---

## 1. VISIÓN Y OBJETIVO DEL PROYECTO

**Nombre:** El Club de la Ingeniería
**Propósito:** Plataforma web para una comunidad de estudiantes/profesionales de ingeniería que necesita:

1. Un **portal principal** (identidad del club, membresía, login social).
2. Un sistema de **plantillas replicables** tipo micro-sitio, donde cada plantilla es una mini-aplicación independiente (arquitectura de microservicios/micro-frontends) que se puede desplegar en un **subdominio nuevo** cada vez que se publica un tipo de contenido nuevo (ej. `noticias.elclubdelaingenieria.com`, `eventos.elclubdelaingenieria.com`, `investigacion.elclubdelaingenieria.com`).
3. El primer caso de uso concreto: un template de **noticias de ciencia y tecnología** para mantener informados a los miembros del club.
4. Registro/login de usuarios vía **Google, GitHub y Facebook** (OAuth social, sin passwords propios en fase 1).

**Éxito se define como:**

- El club puede clonar la carpeta `_template-base`, cambiar configuración (branding, dominio, fuente de datos) y tener un subdominio nuevo funcionando en < 1 día.
- Cero incidentes críticos de seguridad en producción.
- Core Web Vitals en verde en todos los templates.
- Cobertura de pruebas ≥ 80% en lógica de negocio crítica (auth, publicación de contenido, roles).

---

## 2. STACK TECNOLÓGICO (decisión de arquitectura)

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS | SSR/ISR para SEO de noticias, soporte nativo de subdominios vía middleware |
| Componentes UI | shadcn/ui + design system propio (`packages/ui`) | Consistencia visual entre templates sin duplicar código |
| Backend/API | Next.js Route Handlers + Supabase Edge Functions (Deno) | Serverless, escala con Vercel, sin servidor propio que mantener |
| Base de datos | Supabase (PostgreSQL + Row Level Security) | Auth integrado, RLS para multi-tenant por template, storage para imágenes |
| Autenticación | Supabase Auth con proveedores OAuth: Google, GitHub, Facebook | Cumple el requisito de login social sin gestionar contraseñas |
| Hosting/CI-CD | Vercel (conectado al repo de GitHub) | Preview deployments automáticos, wildcard domains, edge network |
| Multi-dominio | Vercel Domains + wildcard `*.elclubdelaingenieria.com` + Next.js middleware de rewrite | Permite crear subdominios sin desplegar apps nuevas, solo config |
| Monorepo | Turborepo (o Nx) + pnpm workspaces | Compartir `packages/ui`, `packages/config` entre todas las mini-apps/templates |
| Observabilidad | Vercel Analytics + Sentry + Supabase Logs | Métricas de performance y errores en tiempo real |
| Seguridad | OWASP ZAP / Semgrep en CI, Supabase RLS, Vercel WAF, CSP headers | Pentesting automatizado y defensa en profundidad |

**Decisión clave de arquitectura — "microservicios" en un contexto Jamstack:**

No usaremos microservicios tradicionales con contenedores separados (sobre-ingeniería para este tamaño de proyecto). En su lugar usamos **micro-frontends + backend serverless multi-tenant**, que da los mismos beneficios (independencia de despliegue, aislamiento de fallos, equipos autónomos por template) sin la complejidad operativa de Kubernetes. Cada "template" vive en `apps/templates/<nombre>` y se puede desplegar como **proyecto Vercel independiente** apuntando al mismo repo (monorepo con múltiples proyectos Vercel), cada uno con su propio subdominio. Esto es intencional y se documenta para que Claude Code no proponga Docker/K8s por defecto.

---

## 3. ARQUITECTURA DE SUBDOMINIOS Y TEMPLATES

### 3.1 Flujo para publicar una nueva plantilla/subdominio

1. Copiar `apps/templates/_template-base` → `apps/templates/<nuevo-nombre>`.
2. Editar `template.config.ts` (nombre, colores, fuente de datos Supabase, metadata SEO).
3. Crear proyecto en Vercel apuntando a esa carpeta del monorepo (`vercel.json` con `root directory`).
4. Agregar subdominio en Vercel (`nuevo-nombre.elclubdelaingenieria.com`) → apunta automáticamente vía DNS wildcard.
5. Crear tabla/esquema en Supabase con RLS específico si el template necesita datos propios, o reutilizar tabla `contenidos` genérica con `template_type`.
6. Deploy automático vía GitHub Actions al hacer merge a `main`.

### 3.2 Template piloto: Noticias de Ciencia y Tecnología

- Ruta: `apps/templates/noticia-ciencia-tec`
- Subdominio sugerido: `noticias.elclubdelaingenieria.com`
- Funcionalidad: listado de noticias (fuentes propias + curadas), detalle de noticia, categorías (IA, robótica, espacio, energía, etc.), suscripción por email/notificación a miembros del club, panel de administración para publicar (solo roles `editor`/`admin`).
- Modelo de datos base (Supabase):
  - `noticias(id, titulo, slug, resumen, contenido, categoria, imagen_url, autor_id, estado, publicado_en, fuente_url)`
  - `categorias(id, nombre, slug)`
  - `miembros(id, user_id, rol, nombre, fecha_ingreso)`
  - `suscripciones(id, user_id, categoria_id)`

### 3.3 Reglas de aislamiento (RLS en Supabase)

- Cada template tiene su propio `schema` o su propio filtro por `template_id` en tablas compartidas.
- Políticas RLS: lectura pública para contenido publicado, escritura solo para roles `editor`/`admin` autenticados.
- Ningún template accede a datos de otro template salvo tabla `miembros` (compartida, es la identidad única del club).

---

## 4. SIMULACIÓN DE ORGANIZACIÓN: 10 EQUIPOS × 10 PERSONAS (100 desarrolladores)

Cada equipo tiene **1 Ingeniero Senior (Tech Lead)** + **9 Ingenieros**. Cuando trabajes con Claude Code, puedes pedirle explícitamente que "actúe como el equipo N" para que priorice esa perspectiva. Cada equipo abajo trae: misión, responsabilidades, entregables y Definition of Done (DoD).

### Equipo 1 — UI/UX (Diseño de Experiencia)

**Misión:** Que cualquier miembro del club entienda la web en menos de 5 segundos y que publicar contenido sea trivial para el editor.

- Responsabilidades: investigación de usuario, wireframes, sistema de diseño (`packages/ui`), accesibilidad (WCAG 2.1 AA), diseño responsive mobile-first, prototipos de flujo de registro/login social, diseño del panel de administración de noticias.
- Entregables: guía de estilo (tipografía, color, espaciado), componentes Figma → shadcn/ui, flujos de usuario documentados, checklist de accesibilidad.
- DoD: todo componente nuevo pasa contraste AA, es navegable por teclado, y tiene estados hover/focus/disabled definidos.

### Equipo 2 — Frontend / Arquitectura de Templates

**Misión:** Construir el sistema de templates replicables como mini-aplicaciones independientes.

- Responsabilidades: Next.js App Router, `_template-base`, sistema de theming por template, SEO técnico (metadata, sitemap, RSS para noticias), performance de imágenes (next/image), internacionalización si aplica.
- Entregables: `_template-base` funcional y documentado, template de noticias completo, Storybook de componentes.
- DoD: Lighthouse ≥ 90 en Performance/SEO/Best Practices/Accessibility para cada template antes de mergear.

### Equipo 3 — Backend / API

**Misión:** Exponer la lógica de negocio (publicación de noticias, roles, suscripciones) de forma segura y reutilizable entre templates.

- Responsabilidades: Route Handlers de Next.js, Supabase Edge Functions, validación de payloads (Zod), rate limiting, versionado de API interna.
- Entregables: API documentada (OpenAPI/Swagger), funciones edge para envío de notificaciones.
- DoD: toda API valida entrada con Zod, responde errores estandarizados, tiene test de contrato.

### Equipo 4 — Base de Datos / Supabase

**Misión:** Modelar datos multi-tenant (multi-template) con integridad y aislamiento correcto.

- Responsabilidades: diseño de esquema, migraciones versionadas (Supabase CLI), políticas RLS por tabla, índices de performance, backups.
- Entregables: `supabase/migrations/*.sql`, diagrama ER en `docs/arquitectura.md`, políticas RLS documentadas y testeadas.
- DoD: ninguna tabla sin RLS activo; toda migración es reversible y revisada por el senior del equipo.

### Equipo 5 — Autenticación e Identidad

**Misión:** Registro/login vía Google, GitHub y Facebook, gestión de roles del club (miembro, editor, admin).

- Responsabilidades: configuración de proveedores OAuth en Supabase Auth, callback URLs por subdominio, manejo de sesión compartida entre subdominios (cookies con dominio raíz `.elclubdelaingenieria.com`), flujo de onboarding (nuevo usuario → rol `miembro` por defecto).
- Entregables: guía de configuración de cada proveedor OAuth, middleware de sesión compartida cross-subdomain, tabla de roles y permisos.
- DoD: login funcional con los 3 proveedores en entorno de staging, sesión persiste al navegar entre subdominios, tokens con expiración y refresh correctos.

### Equipo 6 — DevOps / Infraestructura

**Misión:** CI/CD, despliegues por template, dominios y entornos.

- Responsabilidades: GitHub Actions (lint, test, build, deploy), configuración de múltiples proyectos Vercel en el monorepo, wildcard DNS, variables de entorno por ambiente (dev/staging/prod), rollback automático ante fallo.
- Entregables: pipelines `.github/workflows/*.yml`, documentación de alta de subdominio nuevo, entornos preview por PR.
- DoD: todo PR genera preview deployment; despliegue a producción requiere aprobación y pasa todos los checks (lint, test, build, security scan).

### Equipo 7 — Ciberseguridad

**Misión:** Proteger datos de miembros y prevenir abuso de la plataforma.

- Responsabilidades: revisión de RLS, cabeceras de seguridad (CSP, HSTS, X-Frame-Options), protección OAuth (state/PKCE), rate limiting anti-bruteforce, gestión segura de secretos (Vercel env vars, nunca en el repo), pentesting periódico (ver sección 6), escaneo de dependencias (Dependabot/Snyk), SAST con Semgrep en CI.
- Entregables: `docs/seguridad.md`, checklist OWASP Top 10 aplicado, reporte de pentesting trimestral.
- DoD: cero vulnerabilidades críticas/altas abiertas en producción; todo secreto vive en variables de entorno, nunca hardcodeado.

### Equipo 8 — QA / Testing

**Misión:** Confianza en cada release mediante pruebas automatizadas en todas las capas.

- Responsabilidades: pruebas unitarias (Vitest/Jest), pruebas de integración (Supabase local + Testing Library), pruebas E2E (Playwright) de flujos críticos (login social, publicar noticia, suscribirse), pruebas de regresión visual (Chromatic opcional).
- Entregables: suite de tests en CI, reporte de cobertura, plan de pruebas por feature.
- DoD: cobertura ≥ 80% en lógica crítica, todo PR con feature nueva incluye tests, E2E de login y publicación corren en cada deploy a staging.

### Equipo 9 — Performance, Escalabilidad y Métricas

**Misión:** Que la plataforma escale de 1 a miles de miembros sin degradarse.

- Responsabilidades: caching (ISR/Edge caching de noticias), optimización de queries Supabase (índices, `explain analyze`), monitoreo de Core Web Vitals, definición de KPIs de producto (ver sección 7), alertas de error rate/latencia (Sentry + Vercel Analytics).
- Entregables: dashboard de métricas, `docs/metricas.md`, plan de carga (load testing con k6 antes de eventos de alto tráfico).
- DoD: p95 de latencia de API < 300ms, LCP < 2.5s en templates públicos, alertas configuradas para error rate > 1%.

### Equipo 10 — Gestión de Proyecto y Documentación (PM Senior)

**Misión:** Coordinar a los 9 equipos, mantener el roadmap y la documentación viva.

- Responsabilidades: backlog priorizado, definición de sprints, actas de decisiones de arquitectura (ADR), onboarding de nuevos colaboradores del club, mantenimiento de este mismo `CLAUDE.md`.
- Entregables: roadmap en `docs/roadmap.md`, ADRs en `docs/adr/`, README de onboarding.
- DoD: toda decisión de arquitectura relevante tiene un ADR; el roadmap se actualiza cada sprint.

---

## 5. REQUISITOS

### 5.1 Requisitos funcionales

- RF01: Usuario puede registrarse/iniciar sesión con Google, GitHub o Facebook.
- RF02: Usuario autenticado tiene un rol (`miembro`, `editor`, `admin`) que determina permisos.
- RF03: Editor/Admin puede crear, editar, publicar y despublicar noticias.
- RF04: Miembro puede leer noticias, filtrar por categoría, suscribirse a categorías.
- RF05: Admin puede clonar la plantilla base para crear un nuevo tipo de contenido/subdominio.
- RF06: El sistema envía notificación (email o in-app) cuando se publica contenido de una categoría suscrita.
- RF07: Sesión de usuario persiste al navegar entre subdominios del club.

### 5.2 Requisitos no funcionales

- RNF01 (Seguridad): cumplimiento OWASP Top 10, RLS obligatorio, secretos fuera del repo.
- RNF02 (Rendimiento): LCP < 2.5s, TTFB < 600ms en contenido cacheado.
- RNF03 (Escalabilidad): arquitectura debe soportar agregar un template/subdominio nuevo sin tocar código de los demás.
- RNF04 (Disponibilidad): 99.5% uptime (dependiente de SLA de Vercel/Supabase).
- RNF05 (Mantenibilidad): código en TypeScript estricto, linting obligatorio en CI, componentes documentados.
- RNF06 (Accesibilidad): WCAG 2.1 AA en portal y templates públicos.
- RNF07 (Observabilidad): todo error en producción debe quedar registrado en Sentry con contexto de usuario/template.

---

## 6. CIBERSEGURIDAD Y PENTESTING

**Checklist obligatorio antes de cada release a producción (responsable: Equipo 7):**

1. Escaneo SAST (Semgrep) sin hallazgos críticos/altos.
2. Escaneo de dependencias (`npm audit` / Dependabot) sin CVEs críticos sin mitigar.
3. Revisión de políticas RLS: ninguna tabla con RLS deshabilitado.
4. Cabeceras de seguridad activas: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
5. Flujo OAuth usa `state` y PKCE, valida `redirect_uri` contra whitelist.
6. Rate limiting activo en endpoints de auth y de escritura (publicación de noticias).
7. Pentesting manual/automatizado (OWASP ZAP baseline scan) contra staging antes de cada release mayor.
8. Revisión de CORS: solo dominios `*.elclubdelaingenieria.com` autorizados.
9. Backups de Supabase verificados y con prueba de restauración trimestral.
10. Principio de menor privilegio: `service_role` key de Supabase solo en funciones server-side, nunca expuesta al cliente.

**Nota importante de alcance:** este documento define el proceso y checklist de seguridad. No incluye técnicas de explotación, payloads de ataque ni guías de intrusión — el pentesting real debe ejecutarse con herramientas estándar (OWASP ZAP, Semgrep, Supabase security advisor) por el equipo 7 en un entorno autorizado (staging propio), no contra terceros.

---

## 7. MÉTRICAS Y CALIDAD (KPIs)

| Métrica | Objetivo | Herramienta |
|---|---|---|
| Lighthouse Performance | ≥ 90 | Lighthouse CI |
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics |
| Cobertura de tests (lógica crítica) | ≥ 80% | Vitest/Playwright coverage |
| Error rate en producción | < 1% | Sentry |
| Tiempo de alta de subdominio nuevo | < 1 día hábil | Proceso Equipo 6 |
| Vulnerabilidades críticas abiertas | 0 | Semgrep + Dependabot |
| Uptime mensual | ≥ 99.5% | Vercel Status + monitoreo externo |
| Tiempo de build en CI | < 5 min | GitHub Actions |

---

## 8. ROADMAP SUGERIDO (fases)

1. **Fase 0 — Fundaciones (Equipo 6, 10):** setup monorepo, CI/CD, conexión GitHub↔Vercel, dominio y wildcard DNS.
2. **Fase 1 — Identidad (Equipo 4, 5):** Supabase, esquema `miembros`, OAuth Google/GitHub/Facebook, roles.
3. **Fase 2 — Design System (Equipo 1, 2):** `packages/ui`, portal principal, landing del club.
4. **Fase 3 — Template piloto de Noticias (Equipo 2, 3, 4):** CRUD de noticias, categorías, subdominio `noticias.*`.
5. **Fase 4 — Calidad y Seguridad (Equipo 7, 8, 9):** tests E2E, pentesting baseline, dashboards de métricas.
6. **Fase 5 — Generalización de templates (todos):** `_template-base` reutilizable, documentación de "cómo crear un subdominio nuevo".
7. **Fase 6 — Lanzamiento y monitoreo continuo (Equipo 6, 9, 10).**

---

## 9. INSTRUCCIÓN OPERATIVA PARA CLAUDE CODE

> Cuando trabajes en este repositorio, actúa siguiendo este documento como fuente de verdad. Antes de generar código: (1) identifica qué equipo(s) de la sección 4 son dueños de la tarea, (2) revisa los requisitos relevantes de la sección 5, (3) aplica el checklist de seguridad de la sección 6 si la tarea toca datos de usuario o autenticación, (4) escribe o actualiza tests siguiendo el DoD del Equipo 8, (5) actualiza `docs/` si la tarea implica una decisión de arquitectura nueva (ADR, Equipo 10). Si una petición del usuario contradice la arquitectura de subdominios/microservicios definida en la sección 3, señálalo antes de implementar en lugar de improvisar una arquitectura distinta.

---

## 10. ESTADO ACTUAL DEL PROYECTO (bitácora viva — Equipo 10 mantiene esto al día)

El proyecto real diverge un poco de la estructura ideal de la sección 0 porque se está construyendo incrementalmente, de MVP hacia arquitectura completa. Estado real a la fecha:

- **Identidad del club:** no es ingeniería genérica — es el **Club de Ingeniería en Tecnologías de la Información, Ciencias e Investigación**. Las áreas técnicas son: desarrollo de software, ciencia de datos e IA, ciberseguridad, redes y cloud, sistemas de información, investigación aplicada. No hay componente de hardware/mecánica/civil.
- **Sitio raíz (Template 0):** `public/index.html` — landing de una sola página con boot retro (computadora "todo en uno" estilo Macintosh dibujada en CSS puro), hero, proyectos, equipo, medios, formulario de unión y widget de chat con IA. Es HTML/CSS/JS vanilla, no componentes React todavía.
- **Backend mínimo:** se migró de sitio 100% estático a un proyecto Next.js (Pages Router) mínimo — no el monorepo Turborepo completo de la sección 0 todavía. `next.config.js` hace un rewrite de `/` → `/index.html` para servir el sitio estático sin reescribirlo en JSX, evitando romper el boot animation y el canvas de Matrix (mucho DOM manipulation manual).
- **Asistente de IA:** `pages/api/chat.js` — proxy server-side hacia la API de Groq (`GROQ_API_KEY` en variable de entorno, nunca en el cliente). Incluye validación con Zod, rate limiting básico en memoria (best-effort, no distribuido) y system prompt con el contexto del club. El widget de chat vive en `public/index.html` y solo habla con `/api/chat`, nunca directo a Groq.
- **Auth y membresía (Supabase):** implementado con Google + GitHub (Facebook queda deshabilitado en el UI hasta pasar la revisión de Meta). Esquema en `supabase/migrations/0001_auth_and_members.sql` (tablas `miembros`/`solicitudes`, RLS, trigger `handle_new_user`, protección anti-escalación de rol). Cliente en el navegador vía import ESM de `esm.sh` (sin bundler); config pública servida por `pages/api/public-config.js`; el formulario sin login pasa por `pages/api/join.js` con `SUPABASE_SERVICE_ROLE_KEY` server-side. RF01/RF02 de la sección 5 quedan cubiertos. Falta configurar las apps OAuth reales en Google Cloud Console / GitHub / Supabase Dashboard (acción manual, no automatizable desde aquí) antes de que el login funcione en producción.
- **Cumplimiento legal (LOPDP):** `public/privacidad.html` — aviso de tratamiento de datos alineado a la Ley Orgánica de Protección de Datos Personales de Ecuador (responsable, finalidades, transferencias internacionales, derechos ARCO+, contacto malmachi@unemi.edu.ec). El formulario sin login exige checkbox de consentimiento explícito antes de enviar. Aviso de almacenamiento local (no cookies de rastreo) en el sitio.
- **Pendiente (no implementado aún):** configurar las apps OAuth de Google/GitHub en sus consolas y pegar las credenciales en Supabase; Facebook OAuth (pendiente de revisión de Meta); monorepo con `apps/templates/`, subdominios, CI/CD en GitHub Actions, tests automatizados.

Cuando se retome el trabajo, seguir el roadmap de la sección 8 desde donde quedó: falta completar Fase 0 (monorepo real) y Fase 1 (Supabase + auth) antes de construir el template de noticias de la Fase 3.
