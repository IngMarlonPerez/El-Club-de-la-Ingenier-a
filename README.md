<div align="center">

<img src="public/logo.jpg" alt="Logo del Club de Ingeniería" width="120" style="border-radius: 50%; border: 2px solid #2fd8c9;" />

# El Club de la Ingeniería

### *Innovando el futuro desde Tecnologías de la Información, Ciencias e Investigación*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-2fd8c9?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Estado-MVP%20activo-e8b23a?style=for-the-badge)](https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a)

**Comunidad universitaria · Proyectos reales · Aprendizaje colaborativo · IA integrada**

[Explorar el código](#-inicio-rápido) · [Ver arquitectura](#-arquitectura) · [Roadmap](#-roadmap) · [Contribuir](#-contribuir)

<img src="public/hero-banner.jpg" alt="Banner del Club de Ingeniería" width="100%" style="border-radius: 12px; margin-top: 24px;" />

</div>

---

## 📋 Tabla de contenidos

<details open>
<summary><strong>Mostrar / ocultar índice</strong></summary>

- [Acerca del proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Inicio rápido](#-inicio-rápido)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [API del asistente IA y Sistema Multiproveedor](#-api-del-asistente-ia-y-sistema-multiproveedor)
- [Reto Terminal Linux](#-reto-terminal-linux-operación-laboratorio-b)
- [Roadmap](#-roadmap)
- [Seguridad](#-seguridad)
- [Contribuir](#-contribuir)
- [Contacto](#-contacto)
- [Licencia](#-licencia)


</details>

---

## 🎯 Acerca del proyecto

**El Club de la Ingeniería** es la plataforma web oficial del **Club de Ingeniería en Tecnologías de la Información, Ciencias e Investigación** — una comunidad universitaria fundada en **2016** en el **Taller-B, Facultad de Ingeniería**, abierta a estudiantes de todas las carreras.

> *No se necesita experiencia previa para unirse. Solo curiosidad, ganas de aprender y construir.*

Este repositorio evoluciona desde un **MVP funcional** hacia una **plataforma modular con micro-frontends por subdominio**, donde cada plantilla (noticias, eventos, investigación) puede desplegarse de forma independiente.

<table>
<tr>
<td width="50%">

### 🧭 Misión

Conectar estudiantes y profesionales de TI para **aprender haciendo**: proyectos reales, mentoría entre pares y difusión de ciencia y tecnología.

</td>
<td width="50%">

### 🔭 Visión

Ser la plataforma de referencia del club: identidad digital, contenido especializado y herramientas que escalen con la comunidad.

</td>
</tr>
</table>

### Áreas técnicas del club

| Área | Enfoque |
|:-----|:--------|
| 💻 **Desarrollo de software** | Aplicaciones web, APIs, buenas prácticas |
| 🤖 **Ciencia de datos e IA** | ML, análisis, asistentes inteligentes |
| 🔐 **Ciberseguridad** | OWASP, hardening, auditoría |
| ☁️ **Redes y cloud** | Infraestructura, despliegue, DevOps |
| 📊 **Sistemas de información** | Modelado, procesos, arquitectura |
| 🔬 **Investigación aplicada** | Proyectos con impacto académico y social |

---

## ✨ Características

<table>
<tr>
<td align="center" width="33%">
<h3>🖥️ Landing retro</h3>
Boot animado estilo Macintosh en <strong>CSS puro</strong>, efecto Matrix y experiencia inmersiva al entrar al sitio.
</td>
<td align="center" width="33%">
<h3>🤖 Asistente IA y Voz</h3>
Chat con <strong>Groq/NVIDIA</strong> (respaldo automático), síntesis de voz (Web Speech API) y holograma reactivo (GSAP).
</td>
<td align="center" width="33%">
<h3>⚡ Next.js híbrido</h3>
Landing estática preservada + API Routes. Sin reescribir el DOM manual en React.
</td>
</tr>
<tr>
<td align="center">
<h3>📱 Responsive</h3>
Diseño mobile-first con tipografía IBM Plex y paleta teal/gold sobre dark mode.
</td>
<td align="center">
<h3>🛡️ Seguridad</h3>
API keys solo en servidor. Validación de entrada. Límites anti-abuso por IP.
</td>
<td align="center">
<h3>🚀 Deploy-ready</h3>
Preparado para <strong>Vercel</strong> con configuración mínima y variables de entorno documentadas.
</td>
</tr>
</table>

<br />

<details>
<summary><strong>🔍 Ver detalle de secciones del sitio</strong></summary>

| Sección | Descripción |
|:--------|:------------|
| **Hero** | Presentación del club con CTA para unirse |
| **Proyectos** | Portafolio de iniciativas del club |
| **Equipo** | Miembros y roles |
| **Medios** | Enlaces a redes y contenido |
| **Unirse** | Formulario de contacto / membresía |
| **Chat IA** | Widget flotante con contexto del club |

</details>

---

## 🛠 Stack tecnológico

<div align="center">

| Capa | Tecnología | Estado |
|:-----|:-----------|:------:|
| **Frontend** | HTML5 · CSS3 · JavaScript vanilla | ✅ Activo |
| **Framework** | Next.js 16 (Pages Router) | ✅ Activo |
| **UI Runtime** | React 19 | ✅ Activo |
| **Validación** | Zod | ✅ Activo |
| **IA** | Groq API + NVIDIA NIM (Respaldo) | ✅ Activo |
| **Base de datos** | Supabase (PostgreSQL + RLS) | ⚠️ En desarrollo (Migraciones creadas) |
| **Animaciones** | GSAP (GreenSock) | ✅ Activo |
| **Multimedia** | Web Speech API (Síntesis de voz) | ✅ Activo |
| **Auth** | OAuth — Google · GitHub · Facebook | 🔜 Planificado |
| **Monorepo** | Turborepo + pnpm workspaces | 🔜 Planificado |
| **CI/CD** | GitHub Actions + Vercel | 🔜 Planificado |
| **Observabilidad** | Sentry · Vercel Analytics | 🔜 Planificado |

</div>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,nodejs,vercel,github,js,html,css" alt="Stack icons" />
</p>

---

## 🏗 Arquitectura

### Estado actual (MVP)

```mermaid
flowchart TB
    subgraph Cliente["🌐 Navegador"]
        A["public/index.html<br/>Landing + Chat Widget"]
    end

    subgraph NextJS["⚡ Next.js Server"]
        B["Rewrite / → /index.html"]
        C["pages/api/chat.js<br/>Proxy + Zod + Rate Limit"]
    end

    subgraph Externo["☁️ Servicios externos"]
        D["Groq API<br/>LLM"]
    end

    A -->|"GET /"| B
    A -->|"POST /api/chat"| C
    C -->|"API Key server-side"| D

    style A fill:#101a2c,stroke:#2fd8c9,color:#eef3f6
    style C fill:#101a2c,stroke:#e8b23a,color:#eef3f6
    style D fill:#0d1626,stroke:#93a2b8,color:#eef3f6
```

### Visión futura (roadmap)

```mermaid
flowchart LR
    subgraph Portal["portal.elclubdelaingenieria.com"]
        P["Portal principal<br/>Auth · Dashboard"]
    end

    subgraph Templates["Micro-frontends por subdominio"]
        T1["noticias.*"]
        T2["eventos.*"]
        T3["investigacion.*"]
    end

    subgraph Backend["Supabase"]
        DB[(PostgreSQL + RLS)]
        AUTH[OAuth Providers]
        STORE[Storage]
    end

    P --> AUTH
    P --> DB
    T1 --> DB
    T2 --> DB
    T3 --> DB
    T1 --> STORE

    style Portal fill:#101a2c,stroke:#2fd8c9,color:#eef3f6
    style Templates fill:#0d1626,stroke:#e8b23a,color:#eef3f6
    style Backend fill:#101a2c,stroke:#93a2b8,color:#eef3f6
```

<details>
<summary><strong>📐 Principios de diseño arquitectónico</strong></summary>

- **Micro-frontends Jamstack** — independencia de despliegue sin complejidad de Kubernetes
- **Multi-tenant con RLS** — cada template aislado a nivel de datos
- **Serverless first** — Next.js Route Handlers + Supabase Edge Functions
- **Seguridad en profundidad** — OWASP, CSP, rate limiting, secretos fuera del repo
- **Clonabilidad** — nueva plantilla = copiar `_template-base` + config + subdominio en < 1 día

</details>

---

## 🚀 Inicio rápido

### Prerrequisitos

```text
Node.js 18+     →  https://nodejs.org/
npm o pnpm      →  gestor de paquetes
Cuenta Groq     →  https://console.groq.com/  (para el chat IA)
```

### 1 · Clonar el repositorio

```bash
git clone https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a.git
cd El-Club-de-la-Ingenier-a
```

### 2 · Instalar dependencias

```bash
npm install
```

### 3 · Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tu clave de Groq.

### 4 · Ejecutar en desarrollo

```bash
npm run dev
```

Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador.

### 5 · Build de producción

```bash
npm run build
npm start
```

<details>
<summary><strong>☁️ Desplegar en Vercel (recomendado)</strong></summary>

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Next.js**
3. Agrega la variable de entorno `GROQ_API_KEY` en el panel de Vercel
4. Deploy → tu sitio estará en `*.vercel.app`

> **Importante:** nunca subas `.env.local` al repositorio. Usa variables de entorno del hosting.

</details>

---

## 🔐 Variables de entorno

| Variable | Requerida | Descripción |
|:---------|:---------:|:------------|
| `GROQ_API_KEY` | ✅ | Clave de API de Groq para el asistente de chat (Proveedor Principal) |
| `NVIDIA_API_KEY` | ❌ | Clave de API de NVIDIA NIM (Proveedor de Respaldo) |
| `GROQ_DAILY_LIMIT` | ❌ | Límite diario de mensajes para Groq (Por defecto: 500) |
| `NVIDIA_DAILY_LIMIT` | ❌ | Límite diario de mensajes para NVIDIA (Por defecto: 300) |
| `SUPABASE_URL` | ⚠️ | URL del proyecto Supabase (para tracking de cuotas e integrantes) |
| `SUPABASE_ANON_KEY` | ⚠️ | Clave pública Anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Clave de rol de servicio (privada) para bypass RLS en backend |

```env
# .env.local
GROQ_API_KEY=tu_clave_de_groq_aqui
NVIDIA_API_KEY=tu_clave_de_nvidia_aqui
GROQ_DAILY_LIMIT=500
NVIDIA_DAILY_LIMIT=300
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

---

## 📁 Estructura del repositorio

```
El-Club-de-la-Ingenier-a/
│
├── 📂 public/                  # Assets estáticos servidos por Next.js
│   ├── index.html              # Landing completa con holograma interactivo y widget de voz
│   ├── linux-cli.html          # Reto educativo de terminal Linux interactivo
│   ├── hero-banner.jpg         # Banner principal
│   └── logo.jpg                # Logo del club
│
├── 📂 pages/
│   └── 📂 api/
│       └── chat.js             # Proxy IA multianfitrión (Groq/NVIDIA) + cuota Supabase
│
├── 📂 supabase/
│   └── 📂 migrations/          # Migraciones de base de datos SQL
│       ├── 0001_auth_and_members.sql
│       └── 0002_ia_uso_diario.sql   # Tabla y función RPC para control de cuota de IA
│
├── 📄 next.config.js           # Rewrite / → index.html
├── 📄 package.json             # Dependencias y scripts
├── 📄 .env.local.example       # Plantilla de variables de entorno
├── 📄 .gitignore               # Excluye node_modules, .next, .env*
├── 📄 CLAUDE.md                # Contexto de ingeniería para IA dev tools
└── 📄 README.md                # Este archivo
```

---

## 🤖 API del asistente IA y Sistema Multiproveedor

El endpoint `/api/chat` actúa como **proxy seguro** e inteligente entre el frontend y las APIs de LLM de Groq y NVIDIA NIM.

| Aspecto | Detalle |
|:--------|:--------|
| **Método** | `POST` |
| **Modelos de IA** | Primario: Groq (`llama-3.1-8b-instant`) <br> Respaldo: NVIDIA NIM (`llama-3.1-nemotron-70b-instruct`) |
| **Control de Cuota** | Registro diario de mensajes en Supabase (`ia_uso_diario`) para control estricto de cuota gratuita. |
| **Voz & UI** | Síntesis de voz interactiva mediante Web Speech API y visualización holográfica reactiva por GSAP. |
| **Validación** | Zod — roles `user`/`assistant`, máx. 20 mensajes, 1000 chars c/u |
| **Rate limit** | 12 solicitudes / minuto / IP (en memoria) |
| **Seguridad** | API Keys y Service Role Key nunca expuestas al cliente |
| **Contexto** | System prompt optimizado con misión, visión y enlaces oficiales del club |

```bash
# Ejemplo de solicitud
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"¿Cómo me uno al club?"}]}'
```

## 🎮 Reto Terminal Linux (Operación Laboratorio-B)

El proyecto incluye un entorno simulado de terminal Linux interactiva, accesible desde `/linux-cli.html`, pensado para que los nuevos miembros aprendan comandos básicos mediante la gamificación.

- **Nivel 1:** Navegación por directorios, lectura de archivos y decodificación de mensajes.
- **Nivel 2:** Simulación educativa de escaneo de red local (`nmap`) y auditoría de redes WiFi (`aircrack-ng`).
- **Características:** Registro de objetivos completados, sistema de ayuda integrado y diseño retro futurista.

---

## 🗺 Roadmap

<table>
<tr>
<th>Fase</th>
<th>Entregable</th>
<th>Estado</th>
</tr>
<tr>
<td><strong>Fase 0</strong></td>
<td>Monorepo Turborepo + CI/CD + dominio wildcard</td>
<td align="center">🔜</td>
</tr>
<tr>
<td><strong>Fase 1</strong></td>
<td>Supabase · OAuth (Google, GitHub, Facebook) · roles</td>
<td align="center">🔜</td>
</tr>
<tr>
<td><strong>Fase 2</strong></td>
<td>Design system · portal principal · landing React</td>
<td align="center">🔜</td>
</tr>
<tr>
<td><strong>Fase 3</strong></td>
<td>Template de noticias · subdominio <code>noticias.*</code></td>
<td align="center">🔜</td>
</tr>
<tr>
<td><strong>MVP actual</strong></td>
<td>Landing retro + API chat IA + deploy Next.js</td>
<td align="center">✅</td>
</tr>
</table>

<details>
<summary><strong>📊 KPIs objetivo</strong></summary>

| Métrica | Objetivo |
|:--------|:---------|
| Lighthouse Performance | ≥ 90 |
| LCP | < 2.5s |
| Cobertura tests (lógica crítica) | ≥ 80% |
| Error rate en producción | < 1% |
| Alta de subdominio nuevo | < 1 día hábil |
| Vulnerabilidades críticas abiertas | 0 |

</details>

---

## 🛡 Seguridad

Este proyecto sigue prácticas alineadas con **OWASP Top 10**:

- ✅ Secretos en variables de entorno, nunca en el código
- ✅ Validación de entrada con Zod en la API
- ✅ Rate limiting en endpoints de IA
- ✅ Proxy server-side — el cliente no accede a APIs externas directamente
- 🔜 Row Level Security (RLS) en Supabase
- 🔜 Cabeceras CSP, HSTS en producción
- 🔜 Escaneo SAST (Semgrep) en CI

¿Encontraste una vulnerabilidad? Repórtala de forma responsable vía [Issues](https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a/issues) o contacto directo (ver abajo).

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este club crece con la comunidad.

```mermaid
gitGraph
   commit id: "fork"
   branch feature
   checkout feature
   commit id: "desarrollo"
   commit id: "tests"
   checkout main
   merge feature id: "PR mergeado"
```

### Pasos

1. **Fork** del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Commit con mensaje claro: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/mi-mejora`
5. Abre un **Pull Request** con descripción y plan de pruebas

### Convención de commits (recomendada)

| Prefijo | Uso |
|:--------|:----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Solo documentación |
| `refactor:` | Refactor sin cambio de comportamiento |
| `test:` | Tests |
| `chore:` | Mantenimiento, deps, CI |

---

## 📬 Contacto

<div align="center">

| Canal | Enlace |
|:------|:-------|
| 📧 **Email** | [ingmarlonperez2026@gmail.com](mailto:ingmarlonperez2026@gmail.com) |
| 💬 **WhatsApp** | [+593 98 602 3149](https://wa.me/593986023149) |
| 🐙 **GitHub** | [@IngMarlonPerez](https://github.com/IngMarlonPerez) |
| 📺 **YouTube** | El Club de la Ingeniería |
| 📘 **Facebook** | El Club de la Ingeniería |

**Sede:** Taller-B · Facultad de Ingeniería · Tarde abierta los **jueves**

</div>

---

## 📄 Licencia

Este proyecto se distribuye bajo licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con 💚 por la comunidad del Club de Ingeniería**

*Desarrollo de software · Ciencia de datos · Ciberseguridad · Cloud · Investigación*

<br />

⭐ **Si este proyecto te resulta útil, déjanos una estrella en GitHub** ⭐

<br />

[![GitHub stars](https://img.shields.io/github/stars/IngMarlonPerez/El-Club-de-la-Ingenier-a?style=social)](https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/IngMarlonPerez/El-Club-de-la-Ingenier-a?style=social)](https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a/network/members)
[![GitHub issues](https://img.shields.io/github/issues/IngMarlonPerez/El-Club-de-la-Ingenier-a?style=social)](https://github.com/IngMarlonPerez/El-Club-de-la-Ingenier-a/issues)

</div>
