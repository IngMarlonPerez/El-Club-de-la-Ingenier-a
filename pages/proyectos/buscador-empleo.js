import { useState, useRef, useEffect, useCallback } from 'react';
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

const FUENTE_BADGE = {
  Jooble: '#2fd8c9',
  Computrabajo: '#e8b23a',
};

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const handleSubmit = useCallback(async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (carrera.trim().length < 2) {
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
        body: JSON.stringify({ carrera: carrera.trim(), experiencia, tipoEmpleo, ubicacion: ubicacion.trim() || undefined }),
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
    } catch (err) {
      setErrorMsg('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
      setStatus('error');
    }
  }, [carrera, experiencia, tipoEmpleo, ubicacion]);

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

  return (
    <div className="page">
      <Head>
        <title>Buscador de Empleo | El Club de la Ingeniería</title>
        <meta name="description" content="Busca ofertas de empleo recientes en Ecuador: agregamos Jooble y Computrabajo, y te llevamos directo a Red Socio Empleo, el portal oficial del gobierno." />
      </Head>

      <header className="topbar">
        <a className="back" href="/">← volver al club</a>
        <h1>💼 Buscador de <span>Empleo</span></h1>
        <p className="subtitle">Filtra por carrera, experiencia y tipo de empleo. Mostramos hasta 10 ofertas publicadas en los últimos 7 días, con enlace directo a la fuente original — nunca alojamos el contenido completo de una oferta.</p>
      </header>

      <a className="gov-card" href="https://encuentraempleo.trabajo.gob.ec/socioEmpleo-war/paginas/index.jsf" target="_blank" rel="noopener noreferrer">
        <div className="gov-card-icon">🏛️</div>
        <div>
          <h2>Red Socio Empleo — portal oficial del gobierno</h2>
          <p>Es la fuente más confiable que existe: la administra directamente el Ministerio del Trabajo de Ecuador. <b>Recomendamos revisarla siempre</b>, además de los resultados de aquí abajo.</p>
          <span className="gov-card-link">Buscar en el portal oficial →</span>
        </div>
      </a>
      <div className="warn-box">
        ⚠️ <b>Antes de postular en cualquier oferta</b> (aquí o en cualquier portal): nunca compartas datos bancarios, pagues por un "proceso de selección", ni entregues copias de tu cédula sin confirmar que la empresa es real. Ante la duda, prioriza siempre ofertas de Red Socio Empleo o empresas que puedas verificar de forma independiente.
      </div>

      <form className="search-form" ref={formRef} noValidate>
        <label>
          Carrera o profesión
          <input type="text" name="carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Ej. Ingeniería en Sistemas, Marketing, Contabilidad..." maxLength={80} />
        </label>
        <label>
          Experiencia
          <select name="experiencia" value={experiencia} onChange={(e) => setExperiencia(e.target.value)}>
            {EXPERIENCIA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          Tipo de empleo
          <select name="tipoEmpleo" value={tipoEmpleo} onChange={(e) => setTipoEmpleo(e.target.value)}>
            {TIPO_EMPLEO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          Ubicación <span className="optional">(opcional)</span>
          <input type="text" name="ubicacion" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ecuador" maxLength={80} />
        </label>
        <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Buscando…' : 'Buscar ofertas'}</button>
      </form>

      {errorMsg && <div className="error-box">{errorMsg}</div>}
      {aviso && <div className="aviso-box">{aviso}</div>}

      {status === 'done' && ofertas.length === 0 && !aviso && (
        <div className="empty-state">
          No encontramos ofertas nuevas (últimos 7 días) para ese filtro todavía. Prueba con un término más general, o revisa el portal oficial de arriba — se actualiza directamente por el gobierno.
        </div>
      )}

      {ofertas.length > 0 && (
        <ul className="results">
          {ofertas.map((o, i) => (
            <li key={i} className="result-card">
              <div className="result-top">
                <span className="badge" style={{ background: FUENTE_BADGE[o.fuente] || '#8fa89c' }}>{o.fuente}</span>
                <span className="result-date">{formatFecha(o.fechaPublicacion)}</span>
              </div>
              <h3>{o.titulo}</h3>
              <p className="result-meta">{o.empresa} · {o.ubicacion}{o.tipoEmpleo ? ' · ' + o.tipoEmpleo : ''}</p>
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="result-link">Ver oferta original →</a>
            </li>
          ))}
        </ul>
      )}

      <a className="other-source" href="https://www.multitrabajos.com" target="_blank" rel="noopener noreferrer">
        🔎 También puedes buscar directo en Multitrabajos.com →
      </a>

      <style jsx>{`
        .page{max-width:760px;margin:0 auto;padding:2rem 1.2rem 4rem;font-family:'IBM Plex Sans',-apple-system,sans-serif;color:#eef3f6;background:#0a0f1a;min-height:100vh;}
        .topbar{margin-bottom:1.6rem;}
        .back{color:#2fd8c9;text-decoration:none;font-family:'IBM Plex Mono','Courier New',monospace;font-size:.8rem;}
        h1{font-family:'IBM Plex Mono','Courier New',monospace;font-size:1.6rem;margin:.8rem 0 .5rem;}
        h1 span{color:#e8b23a;}
        .subtitle{color:#8fa89c;font-size:.92rem;line-height:1.6;}
        .gov-card{display:flex;gap:1rem;align-items:flex-start;background:#101a2c;border:1px solid #e8b23a;border-radius:10px;padding:1.2rem;text-decoration:none;color:inherit;margin-bottom:1rem;transition:border-color .2s,transform .2s;}
        .gov-card:hover{transform:translateY(-2px);border-color:#f5c869;}
        .gov-card-icon{font-size:2rem;}
        .gov-card h2{font-size:1rem;color:#eef3f6;margin-bottom:.4rem;}
        .gov-card p{font-size:.84rem;color:#8fa89c;line-height:1.5;margin-bottom:.5rem;}
        .gov-card-link{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.78rem;color:#e8b23a;}
        .warn-box{background:rgba(232,178,58,.08);border:1px solid rgba(232,178,58,.35);border-radius:8px;padding:.9rem 1.1rem;font-size:.82rem;line-height:1.6;color:#eef3f6;margin-bottom:1.8rem;}
        .search-form{display:grid;grid-template-columns:1fr 1fr;gap:1rem;background:#101a2c;border:1px solid #1d2b42;border-radius:10px;padding:1.4rem;margin-bottom:1.4rem;}
        .search-form label{display:flex;flex-direction:column;gap:.4rem;font-size:.8rem;color:#8fa89c;grid-column:span 1;}
        .search-form label:first-child{grid-column:span 2;}
        .optional{color:#5c7267;}
        .search-form input,.search-form select{background:#0a0f1a;border:1px solid #1d2b42;border-radius:6px;padding:.6rem .7rem;color:#eef3f6;font-family:inherit;font-size:.88rem;}
        .search-form input:focus,.search-form select:focus{outline:2px solid #e8b23a;outline-offset:1px;}
        .search-form button{grid-column:span 2;background:#2fd8c9;color:#04140a;border:none;border-radius:6px;padding:.85rem;font-weight:700;font-family:'IBM Plex Mono','Courier New',monospace;cursor:pointer;font-size:.9rem;}
        .search-form button:disabled{opacity:.6;cursor:wait;}
        .search-form button:not(:disabled):hover{background:#5cf0e0;}
        .error-box{background:rgba(255,95,95,.1);border:1px solid rgba(255,95,95,.4);border-radius:8px;padding:.9rem 1.1rem;font-size:.85rem;margin-bottom:1.4rem;}
        .aviso-box{background:rgba(47,216,201,.08);border:1px solid rgba(47,216,201,.3);border-radius:8px;padding:.9rem 1.1rem;font-size:.85rem;margin-bottom:1.4rem;}
        .empty-state{color:#8fa89c;font-size:.9rem;line-height:1.6;padding:1.4rem;background:#101a2c;border:1px dashed #1d2b42;border-radius:8px;text-align:center;margin-bottom:1.4rem;}
        .results{list-style:none;padding:0;display:flex;flex-direction:column;gap:.9rem;margin-bottom:1.6rem;}
        .result-card{background:#101a2c;border:1px solid #1d2b42;border-radius:10px;padding:1.1rem 1.3rem;}
        .result-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;}
        .badge{font-family:'IBM Plex Mono','Courier New',monospace;font-size:.66rem;font-weight:700;color:#04140a;padding:.2rem .5rem;border-radius:4px;}
        .result-date{font-size:.72rem;color:#5c7267;font-family:'IBM Plex Mono','Courier New',monospace;}
        .result-card h3{font-size:1rem;margin-bottom:.35rem;}
        .result-meta{font-size:.82rem;color:#8fa89c;margin-bottom:.6rem;}
        .result-link{color:#2fd8c9;text-decoration:none;font-size:.82rem;font-family:'IBM Plex Mono','Courier New',monospace;}
        .result-link:hover{text-decoration:underline;}
        .other-source{display:block;text-align:center;color:#8fa89c;font-size:.82rem;text-decoration:none;padding:1rem;}
        .other-source:hover{color:#2fd8c9;}
        @media (max-width:560px){
          .search-form{grid-template-columns:1fr;}
          .search-form label:first-child{grid-column:span 1;}
          .search-form button{grid-column:span 1;}
        }
      `}</style>
    </div>
  );
}
