import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import s from '../styles/hud.module.css';
import k from '../styles/k0.module.css';
import HudBackground from '../components/hud/HudBackground';
import Panel from '../components/hud/Panel';

const STORAGE_KEY = 'linuxGameProgress_v7';
const TOTAL = 31;
const EJEMPLO = 'Victor Lluilema';
const SITE = 'https://elclubdelaingenieria.dpdns.org';

const EPISODIOS = [
  { i: '🔰', t: 'Reconocimiento', d: 'Mira antes de que te digan qué buscar', n: 'Nivel 1' },
  { i: '📡', t: 'Infiltración WiFi', d: 'Seguridad inalámbrica en el laboratorio', n: 'Nivel 2' },
  { i: '🛰️', t: 'Comunicación segura', d: 'SSH, GPG y WireGuard', n: 'Nivel 3' },
  { i: '🛡️', t: 'Detección y respuesta', d: 'Encuentra y contiene la amenaza', n: 'Niveles 4–6' },
  { i: '🔍', t: 'Bajo ataque → Forense', d: 'DDoS, evidencia y peritaje', n: 'Niveles 7–13' },
  { i: '📋', t: 'Pentesting web + SGSI', d: 'Auditoría autorizada e ISO/IEC 27001', n: 'Niveles 14–21' },
  { i: '☁️', t: 'Datacenter + nube', d: 'Rescate de una universidad ficticia', n: 'Niveles 22–31' },
];

function progresoLocal() {
  try {
    const st = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!st) return 0;
    let n = 0;
    for (let i = 1; i <= TOTAL; i += 1) {
      const o = st[`l${i}`]; if (!o) continue;
      const v = Object.keys(o).filter((x) => typeof o[x] === 'boolean');
      if (v.length && v.every((x) => o[x])) n += 1;
    }
    return n;
  } catch (e) { return 0; }
}

function fechaHoy() { return new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }); }

// Certificado con el nombre superpuesto; el tamaño del texto sale del ancho real del papel (funciona en cualquier navegador).
function Papel({ nombre, fecha }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const med = () => el.style.setProperty('--cw', `${el.getBoundingClientRect().width}px`);
    med();
    if (!('ResizeObserver' in window)) { window.addEventListener('resize', med); return () => window.removeEventListener('resize', med); }
    const ro = new ResizeObserver(med); ro.observe(el); return () => ro.disconnect();
  }, []);
  const n = String(nombre || EJEMPLO); const cls = n.length > 34 ? k.xl : n.length > 26 ? k.l : n.length > 20 ? k.m : '';
  return (
    <div ref={ref} className={k.paper} role="img" aria-label={`Certificado de Héroe del Club a nombre de ${n}`}>
      <div className={`${k.pName} ${cls}`}>{n}</div>
      <div className={k.pDate}>Dado y firmado en Milagro, Ecuador, el {fecha || fechaHoy()}.</div>
    </div>
  );
}

export default function Kernel0() {
  const [sb, setSb] = useState(null);
  const [session, setSession] = useState(null);
  const [srv, setSrv] = useState(null); // { completados, certificado, nombreSugerido } o null
  const [local, setLocal] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setLocal(progresoLocal());
    let activo = true;
    (async () => {
      try {
        const res = await fetch('/api/public-config'); const cfg = await res.json();
        if (!res.ok || !cfg.supabaseUrl || !activo) return;
        const cli = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); setSb(cli);
        const { data: { session: s0 } } = await cli.auth.getSession(); if (activo) setSession(s0);
        cli.auth.onAuthStateChange((_e, s1) => setSession(s1));
      } catch (e) { /* sin sesión disponible: la página sigue funcionando como invitado */ }
    })();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let vivo = true; setSrv(null);
    if (!session) return undefined;
    (async () => {
      try {
        const r = await fetch('/api/kc/certificado', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (r.ok && vivo) setSrv(await r.json());
      } catch (e) { /* se muestra el progreso local */ }
    })();
    return () => { vivo = false; };
  }, [session]);

  useEffect(() => {
    if (!zoom) return undefined;
    const f = (e) => { if (e.key === 'Escape') setZoom(false); };
    document.addEventListener('keydown', f); return () => document.removeEventListener('keydown', f);
  }, [zoom]);

  const entrar = useCallback((prov) => {
    if (!sb) { setMsg('El inicio de sesión no está disponible ahora. Intenta más tarde.'); return; }
    sb.auth.signInWithOAuth({ provider: prov, options: { redirectTo: `${window.location.origin}/kernel0` } });
  }, [sb]);
  const salir = useCallback(() => { if (sb) sb.auth.signOut().then(() => { setSrv(null); setMsg(''); }); }, [sb]);

  const meta = (session && session.user && session.user.user_metadata) || {};
  const nombreCuenta = String(meta.full_name || meta.name || '').trim();
  const cert = srv && srv.certificado;
  const nombreVista = cert ? cert.nombre : (session ? (nombreCuenta || (srv && srv.nombreSugerido) || EJEMPLO) : EJEMPLO);
  const fechaVista = cert ? new Date(cert.emitido_en).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const n = Math.max(local, srv ? srv.completados : 0);
  const pct = Math.round((100 * n) / TOTAL);

  return (
    <div className={s.root}>
      <Head>
        <title>Kernel Cero — reto de ciberseguridad y terminal Linux | El Club de la Ingeniería</title>
        <meta name="description" content="Juega Kernel Cero: 31 niveles de terminal Linux, ciberseguridad, forense, pentesting autorizado e ISO/IEC 27001, 100 % simulado y guiado por INGenioso. Termínalo y recibe tu certificado de Héroe del Club con QR verificable." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050a12" />
        <link rel="canonical" href={`${SITE}/kernel0`} />
        <meta property="og:title" content="Kernel Cero — llega al final y gana tu certificado del Club" />
        <meta property="og:description" content="31 niveles, 7 episodios y un certificado de Héroe del Club con QR verificable." />
        <meta property="og:image" content={`${SITE}/cert/club-cert-ejemplo.jpg`} />
        <meta property="og:url" content={`${SITE}/kernel0`} />
        <meta property="og:type" content="website" />
      </Head>

      <HudBackground />
      <div className={s.scan} aria-hidden="true" />
      <div className={s.vignette} aria-hidden="true" />

      <main className={`${s.shell} ${s.shellApp}`}>
        <div className={s.topbar}>
          <a className={s.back} href="/">◀ VOLVER AL CLUB</a>
          <div className={s.sysline}>
            <span><i className={s.dotLive} />SIMULACIÓN <b>100 % FICTICIA</b></span>
            <span>NODO <b>CIE_84</b></span>
            <a href="/proyectos/buscador-empleo" style={{ color: 'inherit', textDecoration: 'none' }}>EMPLEO <b>›</b></a>
          </div>
        </div>

        <div className={k.grid}>
          {/* ================= IZQUIERDA: el juego ================= */}
          <div className={k.col}>
            <header>
              <div className={k.kicker}><i />OPERACIÓN LABORATORIO-B</div>
              <h1 className={k.h1} data-t="KERNEL CERO">KERNEL CERO</h1>
              <p className={k.code}>RETO DE <b>TERMINAL LINUX</b> · CIBERSEGURIDAD · AUDITORÍA</p>
              <p className={k.lede}>Aprende comandos reales de Linux <strong>jugando</strong>: reconocimiento, WiFi, criptografía, detección de amenazas, defensa contra DDoS, forense digital, pentesting web autorizado, ISO/IEC 27001 y una auditoría de datacenter y nube. Todo en tu navegador, <strong>100 % simulado y ficticio</strong>, con <strong>INGenioso</strong>, nuestro oso cyborg con IA, como guía.</p>
              <div className={k.stats3}>
                <div><b>31</b>NIVELES</div><div><b>7</b>EPISODIOS</div><div><b>8</b>ETAPAS POR NIVEL</div><div><b>QR</b>CERTIFICADO VERIFICABLE</div>
              </div>
            </header>

            <Panel titulo="Los 7 episodios" etiqueta="31 NIVELES" style={{ '--pd': '100ms' }}>
              <ol className={k.eps}>
                {EPISODIOS.map((e, i) => (
                  <li key={e.t} className={k.ep} style={{ '--i': i }}>
                    <span className={k.ic} aria-hidden="true">{e.i}</span>
                    <div><b>{e.t}</b><span>{e.d}</span></div>
                    <em>{e.n}</em>
                  </li>
                ))}
              </ol>
            </Panel>

            <div className={k.aviso}><b>⚠ Antes de empezar:</b> las herramientas que verás (nmap, aircrack-ng…) existen de verdad y son profesionales. Usarlas contra una red o dispositivo que no sea tuyo, o sin autorización escrita, <b>es ilegal</b>. Aquí solo practicas la sintaxis y el propósito en un entorno seguro.</div>
          </div>

          {/* ================= DERECHA: tarjeta de entrada ================= */}
          <div className={k.col}>
            <Panel titulo="Tarjeta de entrada" etiqueta={cert ? 'CERTIFICADO EMITIDO' : session ? 'SESIÓN ACTIVA' : 'INVITADO'} tilt led={session ? 'ok' : 'warn'} style={{ '--pd': '60ms' }}>
              <button type="button" className={k.paperBtn} onClick={() => setZoom(true)} aria-label="Ver el certificado en grande">
                <Papel nombre={nombreVista} fecha={fechaVista} />
                <span className={k.zoomHint}>🔍 VER EN GRANDE</span>
              </button>
              <div className={k.cap}>{cert ? `CERTIFICADO EMITIDO · ${cert.codigo}` : session ? 'ASÍ SALDRÁ TU CERTIFICADO' : 'EJEMPLO ILUSTRATIVO · EL TUYO SALDRÁ CON TU NOMBRE'}</div>

              {cert ? (
                <>
                  <p className={k.hola}><b>¡Felicitaciones, {cert.nombre}!</b> Ya eres Héroe del Club. Descarga tu PDF desde el juego.</p>
                  <span className={k.ok}>✔ CERTIFICADO EMITIDO Y FIRMADO</span>
                  <div className={k.row}>
                    <span className={k.glow}><a className={k.btnGame} href="/linux-cli.html"><span className={k.play}>▶</span>Abrir el juego</a></span>
                    <a className={k.btnGhost} href={`/verificar/${cert.codigo}`} target="_blank" rel="noopener noreferrer">Ver verificación</a>
                  </div>
                </>
              ) : session ? (
                <>
                  <p className={k.hola}>Hola, <b>{nombreCuenta || 'agente'}</b>. Tu certificado saldrá a este nombre. {n > 0 ? <>Llevas <b>{n} de {TOTAL}</b> niveles.</> : 'Aún no has empezado: ¡es tu momento!'}</p>
                  <div className={k.prog} aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
                  <span className={k.lock}>🔒 Se descarga en PDF al completar los 31 niveles</span>
                  <div className={k.row}>
                    <span className={k.glow}><a className={k.btnGame} href="/linux-cli.html"><span className={k.play}>▶</span>{n > 0 ? `Continuar (${n}/${TOTAL})` : 'Entrar al juego'}</a></span>
                    <button type="button" className={k.btnGhost} onClick={salir}>Cerrar sesión</button>
                  </div>
                </>
              ) : (
                <>
                  <p className={k.hola}>Supera los <b>31 niveles</b> y recibe el <b>certificado oficial del Club</b>, firmado por el fundador y con <b>QR verificable</b>. <b>Regístrate con Google o GitHub</b> para que salga con <b>tu nombre</b> y tu progreso se guarde.</p>
                  <span className={k.lock}>🔒 Se descarga en PDF al completar los 31 niveles</span>
                  {n > 0 && <div className={k.prog} aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>}
                  <div className={k.row}>
                    <button type="button" className={k.btnGhost} onClick={() => entrar('google')}>Continuar con Google</button>
                    <button type="button" className={k.btnGhost} onClick={() => entrar('github')}>Continuar con GitHub</button>
                  </div>
                  <div className={k.row} style={{ marginTop: '.9rem' }}>
                    <span className={k.glow}><a className={k.btnGame} href="/linux-cli.html"><span className={k.play}>▶</span>{n > 0 ? `Continuar (${n}/${TOTAL})` : 'Jugar sin registrarme'}</a></span>
                  </div>
                </>
              )}
              {msg && <p className={k.msg} role="status">{msg}</p>}
              <p className={k.small} style={{ marginTop: '.9rem' }}>¿Tienes un certificado? <a href="/#certificado">Verifícalo con su código</a>.</p>
            </Panel>
          </div>
        </div>
      </main>

      {zoom && (
        <div className={k.lightbox} role="dialog" aria-modal="true" aria-label="Certificado ampliado" onClick={() => setZoom(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'contents' }}>
            <Papel nombre={nombreVista} fecha={fechaVista} />
          </div>
          <button type="button" className={k.x} onClick={() => setZoom(false)}>CERRAR [ESC]</button>
        </div>
      )}
    </div>
  );
}
