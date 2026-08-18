// Monitoreo de errores del lado del servidor (API routes, cron). Opt-in: si no hay
// SENTRY_DSN configurada, Sentry simplemente no envía nada -- no rompe nada ni agrega
// latencia perceptible. Crear cuenta gratis en sentry.io, proyecto tipo Next.js, y
// pegar el DSN en SENTRY_DSN (local y en Vercel) para activarlo.
const Sentry = require('@sentry/nextjs');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: Boolean(process.env.SENTRY_DSN),
});
