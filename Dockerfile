# Imagen de desarrollo/portabilidad local -- la producción real sigue viviendo en
# Vercel (cron, dominio, SSL). Esta imagen sirve para que el entorno de desarrollo
# sea idéntico en cualquier máquina, o para probar el build de producción localmente
# sin depender de Vercel.

# ---- deps: instala dependencias con caché de capas separado del código fuente ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila el sitio (output standalone, ver next.config.js) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: imagen final, solo lo necesario para correr ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
