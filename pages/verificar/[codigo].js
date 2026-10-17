import Head from 'next/head';
import s from '../../styles/hud.module.css';
import HudBackground from '../../components/hud/HudBackground';
import Panel from '../../components/hud/Panel';

const store = require('../../lib/certificado/store');

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  let r;
  try { r = await store.verificarPublico(String(params.codigo || '')); } catch (e) { r = { error: 'fallo' }; }
  return { props: { codigo: String(params.codigo || '').slice(0, 40), r: JSON.parse(JSON.stringify(r)) } };
}

function fechaLarga(iso) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function Verificar({ codigo, r }) {
  let estado = 'noexiste'; let titulo = 'CERTIFICADO NO ENCONTRADO'; let color = '#ff6b6b';
  if (r.error) { estado = 'error'; titulo = 'VERIFICACIÓN NO DISPONIBLE'; color = '#e8b23a'; }
  else if (r.encontrado && r.valido) { estado = 'valido'; titulo = 'CERTIFICADO AUTÉNTICO'; color = '#39ff6a'; }
  else if (r.encontrado && r.revocado) { estado = 'revocado'; titulo = 'CERTIFICADO REVOCADO'; color = '#ff6b6b'; }
  else if (r.encontrado) { estado = 'invalido'; titulo = 'FIRMA NO VÁLIDA'; color = '#ff6b6b'; }

  return (
    <div className={s.root}>
      <Head>
        <title>Verificar certificado | El Club de la Ingeniería</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Verificación pública de certificados del Club de la Ingeniería." />
      </Head>
      <HudBackground />
      <div className={s.scan} aria-hidden="true" />
      <div className={s.vignette} aria-hidden="true" />
      <main className={s.shell} style={{ maxWidth: 760 }}>
        <div className={s.topbar}>
          <a className={s.back} href="/">◀ VOLVER AL CLUB</a>
          <div className={s.sysline}><span>REGISTRO <b>PÚBLICO</b></span></div>
        </div>
        <div className={s.titleBlock}>
          <div className={s.eyebrow}>EL CLUB DE LA INGENIERÍA</div>
          <h1 className={s.title} data-t="VERIFICAR">VERIFICAR</h1>
          <p className={s.sub}>Comprobación de autenticidad de certificados emitidos por el Club.</p>
        </div>

        <Panel titulo="Resultado" etiqueta={codigo} led={estado === 'valido' ? 'ok' : 'warn'} style={{ '--c': color }}>
          <div style={{ textAlign: 'center', padding: '.4rem 0 1rem' }}>
            <div style={{ fontFamily: 'var(--disp)', fontWeight: 900, letterSpacing: '.18em', fontSize: 'clamp(1.1rem,3.4vw,1.7rem)', color, textShadow: `0 0 20px ${color}66` }}>
              {estado === 'valido' ? '✔ ' : estado === 'error' ? '⚠ ' : '✖ '}{titulo}
            </div>
          </div>

          {r.encontrado && (
            <div className={s.stats} style={{ gridTemplateColumns: '1fr' }}>
              <div className={s.stat}><span>CERTIFICADO OTORGADO A</span><b style={{ fontSize: '1.3rem' }}>{r.nombre}</b></div>
              <div className={s.stats}>
                <div className={s.stat}><span>CÓDIGO</span><b style={{ fontSize: '1rem' }}>{r.codigo}</b></div>
                <div className={s.stat}><span>FECHA DE EMISIÓN</span><b style={{ fontSize: '1rem' }}>{fechaLarga(r.emitidoEn)}</b></div>
              </div>
              <div className={s.stat}><span>RECONOCIMIENTO</span><b style={{ fontSize: '1rem' }}>Héroe del Club · Kernel Cero (31 niveles)</b></div>
            </div>
          )}

          {estado === 'revocado' && <p className={s.p} style={{ marginTop: '1rem' }}>Este certificado fue revocado por el Club{r.revocadoMotivo ? `: ${r.revocadoMotivo}` : '.'}</p>}
          {estado === 'invalido' && <p className={s.p} style={{ marginTop: '1rem' }}>El registro existe, pero su firma digital no coincide: el documento pudo haber sido alterado. No lo des por válido.</p>}
          {estado === 'noexiste' && <p className={s.p}>No existe un certificado con el código <b>{codigo}</b>. Revisa que esté escrito igual que en el documento o escanea de nuevo el código QR.</p>}
          {estado === 'error' && <p className={s.p}>No pudimos consultar el registro en este momento. Intenta de nuevo en unos minutos.</p>}

          <hr className={s.sep} />
          <p className={s.p} style={{ fontSize: '.88rem' }}>
            <b style={{ color: '#e8f4f6' }}>Cómo funciona:</b> cada certificado queda firmado digitalmente por el Club al emitirse. Esta página recalcula esa firma con la clave pública del Club; si coincide, el nombre, el código y la fecha no han sido modificados.
            Es un <b>reconocimiento educativo y simbólico</b> del Club de la Ingeniería: no sustituye una certificación profesional, una acreditación pericial ni un título académico.
          </p>
        </Panel>
      </main>
    </div>
  );
}
