import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';

const EXPERIENCIA_OPTIONS = [
  { value: 'sin_experiencia', label: 'Sin experiencia' },
  { value: '1_2_anios', label: '1-2 años' },
  { value: '3_5_anios', label: '3-5 años' },
  { value: '5_mas_anios', label: '5+ años' },
];

const TIPO_EMPLEO_OPTIONS = [
  { value: 'tiempo_completo', label: 'Tiempo completo' },
  { value: 'medio_tiempo', label: 'Medio tiempo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'practicas', label: 'Prácticas' },
];

const FUENTE_STYLE = {
  Jooble: { color: '#2fd8c9', icon: '🌐' },
  Computrabajo: { color: '#e8b23a', icon: '💼' },
};

const MAX_CV_TEXT_CHARS = 6000;
const MAX_CV_FILE_BYTES = 8 * 1024 * 1024;
const WARN_DISMISSED_KEY = 'empleo-warn-dismissed';

const UBICACION_OPTIONS = [
  'Ecuador', 'Remoto',
  'Quito', 'Guayaquil', 'Cuenca', 'Milagro', 'Machala', 'Manta', 'Ambato',
  'Loja', 'Riobamba', 'Portoviejo', 'Santo Domingo', 'Ibarra', 'Esmeraldas',
  'Durán', 'Babahoyo', 'Latacunga', 'Quevedo',
];

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
}

function haceCuanto(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  return `Hace ${dias} días`;
}

function matchedSkillsFor(oferta, skills) {
  if (!skills.length) return [];
  const haystack = `${oferta.titulo} ${oferta.empresa}`.toLowerCase();
  return skills.filter((s) => haystack.includes(s.toLowerCase()));
}

function SkeletonCard({ delay }) {
  return (
    <div className="skeleton-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="sk-line sk-badge" />
      <div className="sk-line sk-title" />
      <div className="sk-line sk-meta" />
      <div className="sk-line sk-link" />
    </div>
  );
}

export default function BuscadorEmpleo() {
  const [carrera, setCarrera] = useState('');
  const [experiencia, setExperiencia] = useState('sin_experiencia');
  const [tipoEmpleo, setTipoEmpleo] = useState('tiempo_completo');
  const [ubicacion, setUbicacion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [ofertas, setOfertas] = useState([]);
  const [aviso, setAviso] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef(null);
  const resultsRef = useRef(null);

  // ---- Análisis de CV (opcional): sube un PDF, la IA lo lee y pre-llena esta misma
  // búsqueda -- el CV se procesa en el navegador (pdf.js), solo el texto extraído viaja
  // al servidor, nunca el PDF en sí, y nada se guarda.
  const [cvStatus, setCvStatus] = useState('idle'); // idle | reading | analyzing | done | error
  const [cvErrorMsg, setCvErrorMsg] = useState('');
  const [cvSkills, setCvSkills] = useState([]);
  const [cvResumen, setCvResumen] = useState('');

  // El aviso de seguridad empieza oculto y solo se muestra si localStorage confirma
  // que el usuario no lo cerró antes — evita el parpadeo de mostrarlo y ocultarlo.
  const [warnDismissed, setWarnDismissed] = useState(true);
  useEffect(() => {
    setWarnDismissed(typeof window !== 'undefined' && window.localStorage.getItem(WARN_DISMISSED_KEY) === '1');
  }, []);
  const dismissWarn = useCallback(() => {
    try { window.localStorage.setItem(WARN_DISMISSED_KEY, '1'); } catch (e) {}
    setWarnDismissed(true);
  }, []);

  const runSearch = useCallback(async (filters) => {
    if (!filters.carrera || filters.carrera.trim().length < 2) {
      setErrorMsg('Escribe tu carrera o profesión (al menos 2 letras).');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    setAviso('');
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrera: filters.carrera.trim(),
          experiencia: filters.experiencia,
          tipoEmpleo: filters.tipoEmpleo,
          ubicacion: (filters.ubicacion && filters.ubicacion.trim()) || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'No se pudo completar la búsqueda. Intenta de nuevo.');
        setStatus('error');
        return;
      }
      setOfertas(data.ofertas || []);
      setAviso(data.aviso || '');
      setStatus('done');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (err) {
      setErrorMsg('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
      setStatus('error');
    }
  }, []);

  const handleSubmit = useCallback(function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    runSearch({ carrera, experiencia, tipoEmpleo, ubicacion });
  }, [runSearch, carrera, experiencia, tipoEmpleo, ubicacion]);

  // Se ata el listener de "submit" directamente al DOM (en vez de depender solo del
  // onSubmit sintético de React) para blindar contra un envío nativo del formulario
  // (recarga completa de página con los filtros como query string) detectado durante
  // pruebas — con esto, el preventDefault() corre siempre, sin importar el orden de
  // inicialización del sistema de eventos de React.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onNativeSubmit = (e) => { e.preventDefault(); handleSubmit(e); };
    form.addEventListener('submit', onNativeSubmit, { capture: true });
    return () => form.removeEventListener('submit', onNativeSubmit, { capture: true });
  }, [handleSubmit]);

  const onCvFileChange = useCallback(async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo si hace falta reintentar
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setCvErrorMsg('Ese archivo no es un PDF. Sube tu CV en formato PDF.');
      setCvStatus('error');
      return;
    }
    if (file.size > MAX_CV_FILE_BYTES) {
      setCvErrorMsg('El PDF es muy grande (máximo 8MB).');
      setCvStatus('error');
      return;
    }

    setCvErrorMsg('');
    setCvSkills([]);
    setCvResumen('');
    setCvStatus('reading');

    let texto = '';
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const buffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
      for (let i = 1; i <= doc.numPages && texto.length < MAX_CV_TEXT_CHARS; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map((it) => it.str || '').join(' ') + '\n';
      }
    } catch (err) {
      setCvErrorMsg('No pudimos leer ese PDF. Intenta con otro archivo o usa el formulario manual de abajo.');
      setCvStatus('error');
      return;
    }

    texto = texto.trim().slice(0, MAX_CV_TEXT_CHARS);
    if (texto.length < 30) {
      setCvErrorMsg('No encontramos texto en ese PDF (¿es una imagen escaneada?). Prueba con el formulario manual de abajo.');
      setCvStatus('error');
      return;
    }

    setCvStatus('analyzing');
    try {
      const res = await fetch('/api/jobs/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoCv: texto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCvErrorMsg(data.error || 'No pudimos analizar el CV. Intenta de nuevo.');
        setCvStatus('error');
        return;
      }
      setCarrera(data.carrera);
      setExperiencia(data.experiencia);
      setTipoEmpleo(data.tipoEmpleo);
      setCvSkills(data.habilidadesClave || []);
      setCvResumen(data.resumenPerfil || '');
      setCvStatus('done');
      runSearch({ carrera: data.carrera, experiencia: data.experiencia, tipoEmpleo: data.tipoEmpleo, ubicacion });
    } catch (err) {
      setCvErrorMsg('No pudimos conectarnos para analizar el CV. Revisa tu conexión e intenta de nuevo.');
      setCvStatus('error');
    }
  }, [runSearch, ubicacion]);

  const displayOfertas = useMemo(() => {
    if (!cvSkills.length) return ofertas;
    return [...ofertas].sort((a, b) => matchedSkillsFor(b, cvSkills).length - matchedSkillsFor(a, cvSkills).length);
  }, [ofertas, cvSkills]);

  const cvBusy = cvStatus === 'reading' || cvStatus === 'analyzing';

  return (
    <div className="page">
      <Head>
        <title>Buscador de Empleo | El Club de la Ingeniería</title>
        <meta name="description" content="Busca ofertas de empleo recientes en Ecuador: agregamos Jooble y Computrabajo, y te llevamos directo a Red Socio Empleo, el portal oficial del gobierno." />
      </Head>

      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="bg-glow bg-glow-b" aria-hidden="true" />

      <header className="topbar">
        <a className="back" href="/">← volver al club</a>
        <span className="topbar-pill">CIE · LAB-EMPLEO</span>
      </header>

      <section className="hero">
        <div className="hero-icon" aria-hidden="true">💼</div>
        <span className="eyebrow">EMPLEO &amp; DATOS</span>
        <h1>Buscador de <span>Empleo</span></h1>
        <p className="subtitle">Filtra por carrera, experiencia y tipo de empleo. Agregamos ofertas recientes de varias fuentes y te llevamos directo al sitio original — nunca alojamos el contenido completo de una oferta.</p>
        <div className="hero-facts">
          <div className="fact"><b>7 días</b><span>ventana de publicación</span></div>
          <div className="fact"><b>10</b><span>ofertas por búsqueda</span></div>
          <div className="fact"><b>3</b><span>fuentes consultadas</span></div>
        </div>
      </section>

      <a className="gov-card" href="https://encuentraempleo.trabajo.gob.ec/socioEmpleo-war/paginas/index.jsf" target="_blank" rel="noopener noreferrer">
        <div className="gov-card-icon">🏛️</div>
        <div>
          <h2>Red Socio Empleo — portal oficial del gobierno</h2>
          <p>Es la fuente más confiable que existe: la administra directamente el Ministerio del Trabajo de Ecuador. <b>Recomendamos revisarla siempre</b>, además de los resultados de aquí abajo.</p>
          <span className="gov-card-link">Buscar en el portal oficial →</span>
        </div>
      </a>

      {!warnDismissed && (
        <div className="warn-box">
          <span className="warn-icon">⚠️</span>
          <span className="warn-text">No compartas datos bancarios ni copias de tu cédula, ni pagues por un &quot;proceso de selección&quot; sin confirmar que la empresa es real.</span>
          <button type="button" className="warn-close" aria-label="Cerrar aviso" onClick={dismissWarn}>✕</button>
        </div>
      )}

      <div className="cv-card">
        <div className="cv-card-icon">📄</div>
        <div className="cv-card-body">
          <h2>¿Tienes tu CV a mano?</h2>
          <p>Súbelo en PDF y dejamos que la IA rellene la búsqueda por ti, resaltando qué ofertas coinciden más con tu perfil. Tu CV se procesa en tu navegador — solo el texto extraído se envía a la IA para el análisis, nunca se guarda en nuestros servidores.</p>
          <label className={`cv-upload-btn${cvBusy ? ' busy' : ''}`}>
            {cvBusy ? (
              <><span className="spinner spinner-dark" aria-hidden="true" /> {cvStatus === 'reading' ? 'Leyendo PDF…' : 'Analizando con IA…'}</>
            ) : (
              <>📎 Subir mi CV (PDF)</>
            )}
            <input type="file" accept="application/pdf" onChange={onCvFileChange} disabled={cvBusy} hidden />
          </label>
          {cvErrorMsg && <p className="cv-error">⚠️ {cvErrorMsg}</p>}
          {cvStatus === 'done' && (
            <div className="cv-result">
              {cvResumen && <p className="cv-resumen"><b>Perfil detectado:</b> {cvResumen}</p>}
              {cvSkills.length > 0 && (
                <div className="cv-skills">
                  {cvSkills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <form className="search-form" ref={formRef} noValidate>
        <label className="field-carrera">
          <span className="field-label"><span className="field-icon">🔍</span> Carrera o profesión</span>
          <input type="text" name="carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Ej. Ingeniería en Sistemas, Marketing, Contabilidad..." maxLength={80} />
        </label>
        <label>
          <span className="field-label"><span className="field-icon">📈</span> Experiencia</span>
          <select name="experiencia" value={experiencia} onChange={(e) => setExperiencia(e.target.value)}>
            {EXPERIENCIA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          <span className="field-label"><span className="field-icon">🕒</span> Tipo de empleo</span>
          <select name="tipoEmpleo" value={tipoEmpleo} onChange={(e) => setTipoEmpleo(e.target.value)}>
            {TIPO_EMPLEO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          <span className="field-label"><span className="field-icon">📍</span> Ubicación <span className="optional">(opcional)</span></span>
          <input type="text" name="ubicacion" list="ubicacion-list" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ecuador" maxLength={80} autoComplete="off" />
          <datalist id="ubicacion-list">
            {UBICACION_OPTIONS.map((u) => <option key={u} value={u} />)}
          </datalist>
        </label>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? (<><span className="spinner" aria-hidden="true" /> Buscando…</>) : (<>🔎 Buscar ofertas</>)}
        </button>
      </form>

      {errorMsg && <div className="error-box">⚠️ {errorMsg}</div>}
      {aviso && <div className="aviso-box">ℹ️ {aviso}</div>}

      <div ref={resultsRef}>
        {status === 'loading' && (
          <div className="results">
            <SkeletonCard delay={0} />
            <SkeletonCard delay={90} />
            <SkeletonCard delay={180} />
          </div>
        )}

        {status === 'done' && ofertas.length === 0 && !aviso && (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            No encontramos ofertas nuevas (últimos 7 días) para ese filtro todavía. Prueba con un término más general, o revisa el portal oficial de arriba — se actualiza directamente por el gobierno.
          </div>
        )}

        {displayOfertas.length > 0 && (
          <>
            <div className="results-count">{displayOfertas.length} oferta{displayOfertas.length === 1 ? '' : 's'} encontrada{displayOfertas.length === 1 ? '' : 's'}</div>
            <ul className="results">
              {displayOfertas.map((o, i) => {
                const fuenteStyle = FUENTE_STYLE[o.fuente] || { color: '#8fa89c', icon: '📋' };
                const coincidencias = matchedSkillsFor(o, cvSkills);
                return (
                  <li key={i} className="result-card" style={{ '--accent': fuenteStyle.color }}>
                    <div className="result-top">
                      <span className="badge" style={{ background: fuenteStyle.color }}>{fuenteStyle.icon} {o.fuente}</span>
                      <span className="result-date" title={formatFecha(o.fechaPublicacion)}>{haceCuanto(o.fechaPublicacion) || formatFecha(o.fechaPublicacion)}</span>
                    </div>
                    <h3>{o.titulo}</h3>
                    <p className="result-meta">
                      <span className="meta-item">🏢 {o.empresa}</span>
                      <span className="meta-item">📍 {o.ubicacion}</span>
                      {o.tipoEmpleo && <span className="meta-item">🕒 {o.tipoEmpleo}</span>}
                    </p>
                    {coincidencias.length > 0 && (
                      <p className="match-chip">✓ Coincide en: {coincidencias.join(', ')}</p>
                    )}
                    <a href={o.url} target="_blank" rel="noopener noreferrer" className="result-link">Ver oferta y postular →</a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <a className="junior-card" href="https://www.linkedin.com/in/marlon-p%C3%A9rez-06ab32303/" target="_blank" rel="noopener noreferrer">
        <div className="junior-card-icon">📬</div>
        <div>
          <h2>JuniorJobs — boletín semanal para perfiles júnior</h2>
          <p>Cada domingo, JuniorJobs selecciona a mano decenas de ofertas para perfiles con 0-2 años de experiencia en España, Europa y LATAM. No reproducimos su lista aquí (es contenido curado por su autor) — compartimos el boletín en nuestro LinkedIn, míralo ahí.</p>
          <span className="junior-card-link">Ver en LinkedIn →</span>
        </div>
      </a>

      <a className="other-source" href="https://www.linkedin.com/jobs/search/?location=Ecuador" target="_blank" rel="noopener noreferrer">
        💼 Ver ofertas en LinkedIn (Ecuador) →
      </a>

      <a className="other-source" href="https://www.multitrabajos.com" target="_blank" rel="noopener noreferrer">
        🔎 También puedes buscar directo en Multitrabajos.com →
      </a>

      <style jsx>{`
        :global(body){background:#0a0f1a;}
        .page{max-width:820px;margin:0 auto;padding:2.2rem 1.2rem 4rem;font-family:'IBM Plex Sans',-apple-system,sans-serif;color:#eef3f6;background:#0a0f1a;min-height:100vh;position:relative;overflow-x:hidden;}
        .bg-glow{position:fixed;width:60vw;height:60vw;max-width:640px;max-height:640px;border-radius:50%;filter:blur(90px);opacity:.12;pointer-events:none;z-index:0;}
        .bg-glow-a{background:#2fd8c9;top:-20vw;right:-15vw;}
        .bg-glow-b{background:#e8b23a;bottom:-10vw;left:-20vw;opacity:.08;}
        .page > *:not(.bg-glow){position:relative;z-index:1;}

        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;}
        .back{color:#2fd8c9;text-decoration:none;font-family:'IBM Plex Mono','Courier New',monospace;font-size:.8rem;}
        .back:hover{text-decoration:underline;}
        .topbar-pill{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.66rem;letter-spacing:.1em;color:#5c7267;border:1px solid #1d2b42;border-radius:20px;padding:.25rem .7rem;}

        .hero{text-align:center;margin-bottom:1.8rem;padding:0 .5rem;}
        .hero-icon{font-size:2.6rem;margin-bottom:.6rem;filter:drop-shadow(0 0 18px rgba(47,216,201,.35));}
        .eyebrow{display:inline-block;font-family:'IBM Plex Mono','Courier New',monospace;font-size:.72rem;letter-spacing:.18em;color:#2fd8c9;margin-bottom:.6rem;}
        h1{font-family:'IBM Plex Mono','Courier New',monospace;font-size:clamp(1.6rem,4vw,2.1rem);margin:0 0 .7rem;}
        h1 span{color:#e8b23a;}
        .subtitle{color:#8fa89c;font-size:.94rem;line-height:1.65;max-width:52ch;margin:0 auto;}
        .hero-facts{display:flex;justify-content:center;gap:2rem;margin-top:1.6rem;flex-wrap:wrap;}
        .fact{display:flex;flex-direction:column;font-family:'IBM Plex Mono','Courier New',monospace;}
        .fact b{font-size:1.15rem;color:#eef3f6;}
        .fact span{font-size:.68rem;color:#5c7267;letter-spacing:.03em;}

        .gov-card{display:flex;gap:1rem;align-items:flex-start;background:linear-gradient(135deg,#101a2c,#0d1826);border:1px solid #e8b23a;border-radius:12px;padding:1.3rem;text-decoration:none;color:inherit;margin-bottom:1rem;transition:border-color .2s,transform .2s,box-shadow .2s;}
        .gov-card:hover{transform:translateY(-3px);border-color:#f5c869;box-shadow:0 12px 30px rgba(232,178,58,.12);}
        .gov-card-icon{font-size:2.1rem;flex-shrink:0;}
        .gov-card h2{font-size:1rem;color:#eef3f6;margin:0 0 .4rem;}
        .gov-card p{font-size:.84rem;color:#8fa89c;line-height:1.55;margin:0 0 .6rem;}
        .gov-card-link{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.78rem;color:#e8b23a;}

        .warn-box{display:flex;gap:.6rem;align-items:center;background:rgba(232,178,58,.08);border:1px solid rgba(232,178,58,.3);border-radius:8px;padding:.55rem .8rem;font-size:.76rem;line-height:1.45;color:#c9d6cf;margin-bottom:1rem;}
        .warn-icon{flex-shrink:0;}
        .warn-text{flex:1;}
        .warn-close{flex-shrink:0;background:none;border:none;color:#8fa89c;cursor:pointer;font-size:.85rem;padding:.2rem .3rem;line-height:1;}
        .warn-close:hover{color:#eef3f6;}

        .cv-card{display:flex;gap:1rem;align-items:flex-start;background:linear-gradient(135deg,#101a2c,#0d1e22);border:1px dashed #2fd8c9;border-radius:12px;padding:1.3rem;margin-bottom:1.4rem;}
        .cv-card-icon{font-size:2.1rem;flex-shrink:0;}
        .cv-card-body{flex:1;min-width:0;}
        .cv-card h2{font-size:1rem;color:#eef3f6;margin:0 0 .4rem;}
        .cv-card p{font-size:.84rem;color:#8fa89c;line-height:1.55;margin:0 0 .8rem;}
        .cv-upload-btn{display:inline-flex;align-items:center;gap:.5rem;background:#2fd8c9;color:#04140a;border-radius:8px;padding:.7rem 1.1rem;font-weight:700;font-family:'IBM Plex Mono','Courier New',monospace;cursor:pointer;font-size:.85rem;transition:transform .15s,box-shadow .15s;}
        .cv-upload-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(47,216,201,.25);}
        .cv-upload-btn.busy{cursor:wait;opacity:.85;}
        .spinner-dark{border-color:rgba(4,20,10,.35);border-top-color:#04140a;}
        .cv-error{font-size:.82rem;color:#ff9f9f;margin-top:.7rem;}
        .cv-result{margin-top:.9rem;padding-top:.9rem;border-top:1px solid #1d2b42;}
        .cv-resumen{font-size:.84rem;color:#eef3f6;line-height:1.5;margin:0 0 .6rem;}
        .cv-skills{display:flex;flex-wrap:wrap;gap:.4rem;}
        .skill-chip{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.7rem;color:#2fd8c9;background:rgba(47,216,201,.1);border:1px solid rgba(47,216,201,.3);border-radius:20px;padding:.25rem .6rem;}

        .search-form{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem;background:#101a2c;border:1px solid #1d2b42;border-radius:14px;padding:1.6rem;margin-bottom:1.4rem;box-shadow:0 20px 50px rgba(0,0,0,.25);}
        .search-form label{display:flex;flex-direction:column;gap:.5rem;font-size:.8rem;color:#8fa89c;grid-column:span 1;}
        .field-carrera{grid-column:span 2;}
        .field-label{display:flex;align-items:center;gap:.4rem;font-family:'IBM Plex Mono','Courier New',monospace;font-size:.74rem;letter-spacing:.02em;}
        .field-icon{font-size:.85rem;}
        .optional{color:#5c7267;}
        .search-form input,.search-form select{background:#0a0f1a;border:1px solid #1d2b42;border-radius:8px;padding:.75rem .85rem;color:#eef3f6;font-family:inherit;font-size:.9rem;transition:border-color .15s;}
        .search-form input:focus,.search-form select:focus{outline:none;border-color:#2fd8c9;box-shadow:0 0 0 3px rgba(47,216,201,.15);}
        .search-form button{grid-column:span 2;display:flex;align-items:center;justify-content:center;gap:.55rem;background:linear-gradient(135deg,#2fd8c9,#22b8ab);color:#04140a;border:none;border-radius:8px;padding:.95rem;font-weight:700;font-family:'IBM Plex Mono','Courier New',monospace;cursor:pointer;font-size:.92rem;transition:transform .15s,box-shadow .15s;}
        .search-form button:disabled{opacity:.7;cursor:wait;}
        .search-form button:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(47,216,201,.25);}
        .spinner{width:14px;height:14px;border:2px solid rgba(4,20,10,.35);border-top-color:#04140a;border-radius:50%;animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        .error-box{background:rgba(255,95,95,.1);border:1px solid rgba(255,95,95,.4);border-radius:10px;padding:.9rem 1.1rem;font-size:.85rem;margin-bottom:1.4rem;}
        .aviso-box{background:rgba(47,216,201,.08);border:1px solid rgba(47,216,201,.3);border-radius:10px;padding:.9rem 1.1rem;font-size:.85rem;margin-bottom:1.4rem;}

        .empty-state{color:#8fa89c;font-size:.9rem;line-height:1.6;padding:2.2rem 1.4rem;background:#101a2c;border:1px dashed #1d2b42;border-radius:12px;text-align:center;margin-bottom:1.4rem;}
        .empty-icon{font-size:2rem;margin-bottom:.6rem;opacity:.7;}

        .results-count{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.72rem;color:#5c7267;letter-spacing:.05em;margin-bottom:.8rem;}
        .results{list-style:none;padding:0;display:flex;flex-direction:column;gap:.9rem;margin:0 0 1.8rem;}
        .result-card{background:#101a2c;border:1px solid #1d2b42;border-left:3px solid var(--accent,#2fd8c9);border-radius:10px;padding:1.15rem 1.35rem;transition:transform .15s,border-color .15s;}
        .result-card:hover{transform:translateY(-2px);border-color:#2c3f5c;}
        .result-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.55rem;flex-wrap:wrap;gap:.4rem;}
        .badge{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.66rem;font-weight:700;color:#04140a;padding:.25rem .55rem;border-radius:5px;white-space:nowrap;}
        .result-date{font-size:.72rem;color:#5c7267;font-family:'IBM Plex Mono','Courier New',monospace;}
        .result-card h3{font-size:1.02rem;margin:0 0 .5rem;line-height:1.35;}
        .result-meta{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.82rem;color:#8fa89c;margin:0 0 .5rem;}
        .meta-item{white-space:nowrap;}
        .match-chip{font-size:.76rem;color:#e8b23a;margin:0 0 .6rem;}
        .result-link{color:#2fd8c9;text-decoration:none;font-size:.82rem;font-family:'IBM Plex Mono','Courier New',monospace;}
        .result-link:hover{text-decoration:underline;}

        .skeleton-card{background:#101a2c;border:1px solid #1d2b42;border-radius:10px;padding:1.15rem 1.35rem;animation:pulse 1.4s ease-in-out infinite;}
        .sk-line{background:#1d2b42;border-radius:5px;height:.8rem;}
        .sk-badge{width:5rem;height:1.1rem;margin-bottom:.7rem;}
        .sk-title{width:70%;height:1.1rem;margin-bottom:.7rem;}
        .sk-meta{width:50%;margin-bottom:.7rem;}
        .sk-link{width:30%;}
        @keyframes pulse{0%,100%{opacity:.6;}50%{opacity:1;}}

        .junior-card{display:flex;gap:1rem;align-items:flex-start;background:#101a2c;border:1px solid #1d2b42;border-radius:12px;padding:1.2rem;text-decoration:none;color:inherit;margin-bottom:1rem;transition:border-color .2s,transform .2s;}
        .junior-card:hover{transform:translateY(-2px);border-color:#2fd8c9;}
        .junior-card-icon{font-size:1.8rem;flex-shrink:0;}
        .junior-card h2{font-size:.94rem;color:#eef3f6;margin:0 0 .4rem;}
        .junior-card p{font-size:.8rem;color:#8fa89c;line-height:1.55;margin:0 0 .5rem;}
        .junior-card-link{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.76rem;color:#2fd8c9;}

        .other-source{display:block;text-align:center;color:#8fa89c;font-size:.82rem;text-decoration:none;padding:1rem;}
        .other-source:hover{color:#2fd8c9;}

        @media (max-width:560px){
          .search-form{grid-template-columns:1fr;padding:1.3rem;}
          .field-carrera{grid-column:span 1;}
          .search-form button{grid-column:span 1;}
          .hero-facts{gap:1.4rem;}
          .gov-card,.junior-card,.cv-card{flex-direction:column;}
        }
      `}</style>
    </div>
  );
}
