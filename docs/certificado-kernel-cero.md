# Certificado "Héroe del Club" (Kernel Cero)

Reconocimiento educativo y simbólico del Club de la Ingeniería para quien completa los 31 niveles de Kernel Cero con una cuenta
(Google o GitHub). Se descarga en PDF, con el nombre de la persona, un código único y un QR que lleva a una página pública de verificación.

## Cómo funciona
1. El juego registra cada nivel completado en la cuenta de la persona (`POST /api/kc/progreso`). El servidor valida el orden de los
   niveles y que los tiempos sean plausibles.
2. Con los 31 niveles, la persona confirma su nombre (propuesto desde Google/GitHub; queda fijo al emitir) y el servidor emite el
   certificado (`POST /api/kc/certificado`): código `CLUB-CERT-AAAA-NNNN`, huella SHA-256 y **firma Ed25519 con la clave propia del Club**.
3. El PDF (`GET /api/kc/certificado-pdf`) solo se entrega al dueño con sesión iniciada; el servidor revalida la firma antes de generarlo.
4. El QR del PDF apunta a `/verificar/<código>`, que recalcula la firma con la clave pública y muestra: auténtico, revocado o no válido.

## Seguridad y límites (honestos)
- La firma es del **Club**, no la firma electrónica personal del fundador. El archivo `.p12` personal **no se usa ni se guarda** en el proyecto.
  Si más adelante se quiere validez legal de firma electrónica, se puede agregar una firma PAdES con un certificado de sello/persona jurídica
  dedicado, sin tocar el resto del flujo.
- El progreso nace en el navegador del jugador; el servidor reduce el fraude (orden, tiempos mínimos, un certificado por cuenta, registro
  auditable y revocable) pero **no es infalible**. Se puede revocar un certificado (`certificados.revocado = true`).
- La página de verificación no muestra correo ni identificadores internos: solo nombre, código, fecha y estado.

## Activación (una sola vez)
1. **Base de datos:** ejecutar `supabase/migrations/0006_kernel_cero_certificados.sql` en el SQL Editor de Supabase.
2. **Claves del Club:** `node scripts/generar-clave-certificados.js` → copiar los dos valores a las variables de entorno de Vercel:
   `CERT_SIGNING_PRIVATE_KEY` (secreta; no subir a GitHub ni compartir) y `CERT_SIGNING_PUBLIC_KEY`. Opcional: `SITE_URL`.
   Respaldar la clave privada en un lugar seguro: si se pierde, los certificados ya emitidos dejan de verificarse.
3. **Inicio de sesión:** en Supabase › Authentication › URL Configuration, agregar a *Redirect URLs*:
   `https://elclubdelaingenieria.dpdns.org/linux-cli.html` (y `http://localhost:3000/linux-cli.html` para pruebas).
4. Redesplegar en Vercel.

## Revocar un certificado
```sql
update public.certificados set revocado = true, revocado_motivo = 'motivo' where codigo = 'CLUB-CERT-2026-0001';
```

## Rediseñar el arte
`python scripts/generar-arte-certificado.py` regenera `lib/certificado/assets/club-cert-base.png`, `layout.json` y
`public/cert/club-cert-ejemplo.jpg`. Pruebas: `npm test`.
