// Monitoreo de errores del lado del navegador. Necesita NEXT_PUBLIC_SENTRY_DSN (con
// ese prefijo) porque las env vars sin NEXT_PUBLIC_ nunca llegan al bundle del
// cliente -- puede ser el mismo valor que SENTRY_DSN del servidor. Opt-in: sin esa
// variable, no se envía nada.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});
