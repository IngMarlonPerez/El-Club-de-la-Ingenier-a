import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import s from '../../styles/hud.module.css';
import HudBackground from '../../components/hud/HudBackground';
import BootSequence from '../../components/hud/BootSequence';
import Panel from '../../components/hud/Panel';
import Radar from '../../components/hud/Radar';
import RingGauge, { DECISION_COLOR, useCountUp } from '../../components/hud/RingGauge';
import { maskPII } from '../../lib/privacy/maskPII';
import { evaluarAjuste } from '../../lib/jobs/fit';

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
  Jooble: { color: '#2fd8c9' },
  Computrabajo: { color: '#e8b23a' },
};

const DECISION_LABEL = { POSTULAR: 'POSTULAR', ADAPTAR: 'POSTULAR ADAPTANDO', NO_PRIORIZAR: 'NO PRIORIZAR', SIN_DETALLE: 'SIN DETALLE' };
const NIVEL_TXT = { cv: 'con evidencia en tu CV', habilidad: 'solo en tus habilidades', falta: 'sin evidencia' };

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
  if (dias <= 0) return 'HOY';
  if (dias === 1) return 'AYER';
  return `HACE ${dias} DÍAS`;
}

function Stat({ valor, etiqueta, sufijo = '' }) {
  const v = useCountUp(valor == null ? null : valor, 1100);
  return (
    <div className={s.stat}>
      <b>{valor == null ? '—' : `${v}${sufijo}`}</b>
      <span>{etiqueta}</span>
    </div>
  );
}

function Requisitos({ fit }) {
  if (!fit || !fit.requisitos.length) return <p className={s.notes}>No se detectaron requisitos concretos en el texto disponible.</p>;
  return (
    <>
      <p className={s.legendMini}>● verde: evidencia en tu CV · ● ámbar: solo en tus habilidades · ● rojo tachado: sin evidencia</p>
      <div className={s.pills}>
        {fit.requisitos.map((r) => (
          <span key={r.termino} className={`${s.pill} ${s[`pill_${r.nivel}`] || ''}`} title={NIVEL_TXT[r.nivel] || 'sin evaluar'}>{r.termino}{r.peso === 2 ? ' ★' : ''}</span>
        ))}
      </div>
      {fit.filtros.length > 0 && <ul className={s.notes}>{fit.filtros.map((f) => <li key={f}>{f}</li>)}</ul>}
      {fit.brechas.length > 0 && <p className={s.legendMini}>Antes de postular: confirma si dominas {fit.brechas.slice(0, 4).map((b) => b.termino).join(', ')}. Si es así, súbelo a tu CV con un proyecto; si no, no lo afirmes.</p>}
    </>
  );
}

export default function BuscadorEmpleo() {
  const [booted, setBooted] = useState(false);
  const onBootDone = useCallback(() => setBooted(true), []);

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
  const [activo, setActivo] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [modal, setModal] = useState(null); // índice de oferta para evaluar con descripción pegada
  const [descPegada, setDescPegada] = useState('');
  const [fitManual, setFitManual] = useState({}); // { [indice]: fit calculado con la descripción pegada }

  // ---- Análisis de CV (opcional): el PDF se lee en el navegador (pdf.js) y ANTES de enviar nada
  // se enmascaran los datos personales (lib/privacy/maskPII). Solo el texto ya enmascarado viaja
  // al servidor para el análisis, y el servidor lo enmascara de nuevo. El PDF solo se guarda si la
  // persona tiene sesión y lo consiente de forma explícita.
  const [cvStatus, setCvStatus] = useState('idle'); // idle | reading | analyzing | done | error
  const [cvErrorMsg, setCvErrorMsg] = useState('');
  const [cvSkills, setCvSkills] = useState([]);
  const [cvResumen, setCvResumen] = useState('');
  const [cvTexto, setCvTexto] = useState(''); // texto ya enmascarado: base del ajuste, solo en memoria
  const [escudo, setEscudo] = useState(null); // { total, resumen }
  const cvFileRef = useRef(null);

  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [savedCv, setSavedCv] = useState(null);
  const [cvSaveStatus, setCvSaveStatus] = useState('idle');
  const [cvSaveConsent, setCvSaveConsent] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/public-config');
        const config = await res.json();
        if (!res.ok || !config.supabaseUrl || !active) return;
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
        setSupabase(client);

        const { data: { session: s0 } } = await client.auth.getSession();
        if (!active) return;
        setSession(s0);
        if (s0) {
          const { data } = await client
            .from('cv_uploads')
            .select('id, storage_path, nombre_original, subido_en')
            .eq('user_id', s0.user.id)
            .maybeSingle();
          if (active && data) setSavedCv(data);
        }

        client.auth.onAuthStateChange((_event, s2) => {
          setSession(s2);
          if (!s2) setSavedCv(null);
        });
      } catch (err) {
        console.error('No se pudo inicializar Supabase en el buscador de empleo', err);
      }
    })();
    return () => { active = false; };
  }, []);

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
    setActivo(null); setAbierta(null); setFitManual({});
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

  // El listener de "submit" se ata al DOM además del sintético de React (ver historial: se detectó
  // un envío nativo con recarga completa en pruebas anteriores).
  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const onNativeSubmit = (e) => { e.preventDefault(); handleSubmit(e); };
    form.addEventListener('submit', onNativeSubmit, { capture: true });
    return () => form.removeEventListener('submit', onNativeSubmit, { capture: true });
  }, [handleSubmit]);

  const extractPdfText = useCallback(async (fileLike) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const buffer = await fileLike.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    let texto = '';
    for (let i = 1; i <= doc.numPages && texto.length < MAX_CV_TEXT_CHARS; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      texto += content.items.map((it) => it.str || '').join(' ') + '\n';
    }
    return texto.trim().slice(0, MAX_CV_TEXT_CHARS);
  }, []);

  const analyzeAndFill = useCallback(async (textoOriginal) => {
    if (textoOriginal.length < 30) {
      setCvErrorMsg('No encontramos texto en ese PDF (¿es una imagen escaneada?). Prueba con el formulario manual.');
      setCvStatus('error');
      return;
    }
    // Escudo de privacidad: se enmascara ANTES de enviar y antes de guardar en memoria.
    const masked = maskPII(textoOriginal);
    setEscudo({ total: masked.total, resumen: masked.resumen });
    setCvTexto(masked.texto);
    setCvStatus('analyzing');
    try {
      const res = await fetch('/api/jobs/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoCv: masked.texto }),
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

  const onCvFileChange = useCallback(async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') { setCvErrorMsg('Ese archivo no es un PDF. Sube tu CV en formato PDF.'); setCvStatus('error'); return; }
    if (file.size > MAX_CV_FILE_BYTES) { setCvErrorMsg('El PDF es muy grande (máximo 8MB).'); setCvStatus('error'); return; }

    cvFileRef.current = file;
    setCvErrorMsg(''); setCvSkills([]); setCvResumen(''); setCvTexto(''); setEscudo(null);
    setCvSaveStatus('idle'); setCvSaveConsent(false); setCvStatus('reading');

    let texto = '';
    try { texto = await extractPdfText(file); } catch (err) {
      setCvErrorMsg('No pudimos leer ese PDF. Intenta con otro archivo o usa el formulario manual.');
      setCvStatus('error');
      return;
    }
    await analyzeAndFill(texto);
  }, [extractPdfText, analyzeAndFill]);

  const applySavedCv = useCallback(async () => {
    if (!supabase || !savedCv) return;
    cvFileRef.current = null;
    setCvErrorMsg(''); setCvSkills([]); setCvResumen(''); setCvTexto(''); setEscudo(null); setCvStatus('reading');
    try {
      const { data: blob, error } = await supabase.storage.from('cv-uploads').download(savedCv.storage_path);
      if (error) throw error;
      const texto = await extractPdfText(blob);
      await analyzeAndFill(texto);
    } catch (err) {
      console.error('No se pudo usar el CV guardado', err);
      setCvErrorMsg('No pudimos usar tu CV guardado. Intenta subir uno nuevo.');
      setCvStatus('error');
    }
  }, [supabase, savedCv, extractPdfText, analyzeAndFill]);

  const saveCurrentCv = useCallback(async () => {
    if (!supabase || !session || !cvFileRef.current || !cvSaveConsent) return;
    setCvSaveStatus('saving');
    try {
      const file = cvFileRef.current;
      const path = `${session.user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('cv-uploads').upload(path, file, { contentType: 'application/pdf' });
      if (upErr) throw upErr;
      const { data, error: insErr } = await supabase
        .from('cv_uploads')
        .insert({ user_id: session.user.id, storage_path: path, nombre_original: file.name, tamano_bytes: file.size })
        .select('id, storage_path, nombre_original, subido_en')
        .single();
      if (insErr) throw insErr;
      setSavedCv(data);
      setCvSaveStatus('idle');
    } catch (err) {
      console.error('No se pudo guardar el CV', err);
      setCvSaveStatus('error');
    }
  }, [supabase, session, cvSaveConsent]);

  const deleteSavedCv = useCallback(async () => {
    if (!supabase || !savedCv) return;
    try {
      await supabase.storage.from('cv-uploads').remove([savedCv.storage_path]);
      await supabase.from('cv_uploads').delete().eq('id', savedCv.id);
      setSavedCv(null);
    } catch (err) {
      console.error('No se pudo eliminar el CV guardado', err);
    }
  }, [supabase, savedCv]);

  // ---- Ajuste por oferta (local, determinista, sin IA ni cuota) ----
  const perfil = useMemo(() => ({ cvTexto, habilidades: cvSkills, carrera, resumen: cvResumen }), [cvTexto, cvSkills, carrera, cvResumen]);
  const tienePerfil = Boolean(cvTexto);

  const displayOfertas = useMemo(() => {
    const conFit = ofertas.map((o, idx) => ({
      ...o,
      _idx: idx,
      fit: tienePerfil ? evaluarAjuste(perfil, `${o.titulo}. ${o.resumen || ''}`) : null,
    }));
    if (!tienePerfil) return conFit;
    return [...conFit].sort((a, b) => (b.fit?.ajuste ?? -1) - (a.fit?.ajuste ?? -1));
  }, [ofertas, perfil, tienePerfil]);

  // Evalúa con la descripción pegada (todo en el navegador)
  const evaluarPegada = useCallback(() => {
    if (modal == null) return;
    const o = displayOfertas[modal];
    const fit = evaluarAjuste(perfil, `${o.titulo}. ${descPegada}`, { minRequisitos: 2 });
    setFitManual((m) => ({ ...m, [o._idx]: fit }));
  }, [modal, displayOfertas, perfil, descPegada]);

  const fitDe = (o) => fitManual[o._idx] || o.fit;

  const telemetria = useMemo(() => {
    const evaluadas = displayOfertas.map((o) => fitDe(o)).filter((f) => f && f.ajuste != null);
    const medio = evaluadas.length ? Math.round(evaluadas.reduce((a, f) => a + f.ajuste, 0) / evaluadas.length) : null;
    const freq = new Map();
    evaluadas.forEach((f) => f.brechas.forEach((b) => freq.set(b.termino, (freq.get(b.termino) || 0) + 1)));
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const mejor = evaluadas.length ? Math.max(...evaluadas.map((f) => f.ajuste)) : null;
    return { n: displayOfertas.length, evaluadas: evaluadas.length, medio, mejor, top };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayOfertas, fitManual]);

  const enfocar = useCallback((i) => {
    setActivo(i);
    const el = document.getElementById(`oferta-${i}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const cvBusy = cvStatus === 'reading' || cvStatus === 'analyzing';
  const radarOfertas = displayOfertas.map((o) => ({ ...o, fit: fitDe(o) }));

  return (
    <div className={s.root}>
      <Head>
        <title>Buscador de Empleo | El Club de la Ingeniería</title>
        <meta name="description" content="Busca ofertas de empleo recientes en Ecuador, mide qué tanto encajas con cada una y descubre qué te falta, con tu CV protegido: los datos personales se ocultan antes de enviar nada." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      {!booted && <BootSequence onDone={onBootDone} />}
      <HudBackground />
      <div className={s.scan} aria-hidden="true" />
      <div className={s.scanBar} aria-hidden="true" />
      <div className={s.vignette} aria-hidden="true" />

      <main className={s.shell}>
        <div className={s.topbar}>
          <a className={s.back} href="/">◀ VOLVER AL CLUB</a>
          <div className={s.sysline}>
            <span><i className={s.dotLive} />SISTEMA <b>EN LÍNEA</b></span>
            <span>MÓDULO <b>LAB-EMPLEO</b></span>
            <span>PRIVACIDAD <b>ACTIVA</b></span>
          </div>
        </div>

        <div className={s.titleBlock}>
          <div className={s.eyebrow}>EL CLUB DE LA INGENIERÍA</div>
          <h1 className={s.title} data-t="EMPLEO·OS">EMPLEO·OS</h1>
          <p className={s.sub}>Encuentra ofertas de los últimos 7 días, mide cuánto encajas con cada una y descubre qué te falta. Tu CV se lee en tu navegador y los datos personales se ocultan antes de enviar nada.</p>
        </div>

        <div className={s.hud}>
          {/* ================= COLUMNA IZQUIERDA: OPERADOR ================= */}
          <div className={`${s.col} ${s.colLeft}`}>
            <Panel titulo="Perfil · operador" etiqueta="CV" tilt style={{ '--pd': '120ms' }} led={tienePerfil ? 'ok' : 'warn'}>
              {savedCv ? (
                <>
                  <p className={s.p}>CV guardado el {formatFecha(savedCv.subido_en)} <span className={s.tag}>({savedCv.nombre_original})</span></p>
                  <div className={s.row}>
                    <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} onClick={applySavedCv} disabled={cvBusy}>
                      {cvBusy ? (<><span className={s.spinner} aria-hidden="true" /> {cvStatus === 'reading' ? 'Leyendo' : 'Analizando'}</>) : 'Usarlo para buscar'}
                    </button>
                    <label className={`${s.btn} ${s.btnGhost} ${s.btnSm} ${s.fileLbl}`}>
                      Subir otro
                      <input type="file" accept="application/pdf" onChange={onCvFileChange} disabled={cvBusy} hidden />
                    </label>
                    <button type="button" className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={deleteSavedCv} disabled={cvBusy}>Eliminar</button>
                  </div>
                </>
              ) : (
                <>
                  <p className={s.p}>Sube tu CV en PDF: la IA completa la búsqueda y el sistema calcula tu ajuste con cada oferta. Se procesa en tu navegador y <b style={{ color: '#e8f4f6' }}>no se guarda</b> a menos que tú lo decidas.</p>
                  <label className={`${s.btn} ${s.btnPrimary} ${s.fileLbl}`}>
                    {cvBusy ? (<><span className={s.spinner} aria-hidden="true" /> {cvStatus === 'reading' ? 'Leyendo PDF' : 'Analizando'}</>) : 'Cargar CV (PDF)'}
                    <input type="file" accept="application/pdf" onChange={onCvFileChange} disabled={cvBusy} hidden />
                  </label>
                </>
              )}

              {cvErrorMsg && <p className={s.err}>⚠ {cvErrorMsg}</p>}

              {escudo && (
                <div className={s.shield}>
                  <svg className={s.shieldIcon} viewBox="0 0 24 24" fill="none" stroke="#39ff6a" strokeWidth="1.6" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3z" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" /></svg>
                  <div>
                    <b>ESCUDO DE PRIVACIDAD</b>
                    <span>{escudo.total ? `Se ocultaron ${escudo.resumen.join(', ')} antes de enviar tu CV.` : 'No se detectaron datos personales para ocultar.'}</span>
                  </div>
                </div>
              )}

              {cvStatus === 'done' && (
                <div style={{ marginTop: '.9rem' }}>
                  {cvResumen && <p className={s.p}><span className={s.tag}>PERFIL DETECTADO</span><br />{cvResumen}</p>}
                  {cvSkills.length > 0 && <div className={s.chips}>{cvSkills.map((sk, i) => <span key={sk + i} className={s.chip} style={{ '--i': i }}>{sk}</span>)}</div>}
                  {!savedCv && cvFileRef.current && (
                    session ? (
                      <>
                        <hr className={s.sep} />
                        <label className={s.consent}>
                          <input type="checkbox" checked={cvSaveConsent} onChange={(e) => setCvSaveConsent(e.target.checked)} />
                          <span>Entiendo que mi CV quedará guardado en mi cuenta hasta que yo lo elimine — <a href="/privacidad.html" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</span>
                        </label>
                        <button type="button" className={`${s.btn} ${s.btnSm}`} onClick={saveCurrentCv} disabled={!cvSaveConsent || cvSaveStatus === 'saving'}>
                          {cvSaveStatus === 'saving' ? 'Guardando…' : 'Guardar mi CV'}
                        </button>
                        {cvSaveStatus === 'error' && <p className={s.err}>⚠ No pudimos guardar tu CV. Intenta de nuevo.</p>}
                      </>
                    ) : (
                      <p className={s.p} style={{ marginTop: '.8rem' }}>¿Quieres que recordemos tu CV? <a href="/#join" style={{ color: '#7dfff0' }}>Inicia sesión</a> para guardarlo.</p>
                    )
                  )}
                </div>
              )}
            </Panel>

            {!warnDismissed && (
              <div className={s.warn}>
                <span>⚠</span>
                <span>No compartas datos bancarios ni copias de tu cédula, ni pagues por un «proceso de selección» sin confirmar que la empresa es real.</span>
                <button type="button" aria-label="Cerrar aviso" onClick={dismissWarn}>✕</button>
              </div>
            )}
          </div>

          {/* ================= COLUMNA CENTRAL: CONSOLA + RADAR ================= */}
          <div className={`${s.col} ${s.colMain}`}>
            <Panel titulo="Consola de búsqueda" etiqueta="FILTROS" style={{ '--pd': '60ms' }}>
              <form className={s.form} ref={formRef} noValidate>
                <div className={`${s.field} ${s.fieldWide}`}>
                  <label htmlFor="f-carrera">Carrera o profesión</label>
                  <input id="f-carrera" type="text" name="carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Ej. Desarrollador web, Contabilidad, Marketing…" maxLength={80} />
                </div>
                <div className={s.field}>
                  <label htmlFor="f-exp">Experiencia</label>
                  <select id="f-exp" name="experiencia" value={experiencia} onChange={(e) => setExperiencia(e.target.value)}>
                    {EXPERIENCIA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={s.field}>
                  <label htmlFor="f-tipo">Tipo de empleo</label>
                  <select id="f-tipo" name="tipoEmpleo" value={tipoEmpleo} onChange={(e) => setTipoEmpleo(e.target.value)}>
                    {TIPO_EMPLEO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={`${s.field} ${s.fieldWide}`}>
                  <label htmlFor="f-ubi">Ubicación (opcional)</label>
                  <input id="f-ubi" type="text" name="ubicacion" list="ubicacion-list" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ecuador" maxLength={80} autoComplete="off" />
                  <datalist id="ubicacion-list">{UBICACION_OPTIONS.map((u) => <option key={u} value={u} />)}</datalist>
                </div>
                <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.formBtn}`} disabled={status === 'loading'}>
                  {status === 'loading' ? (<><span className={s.spinner} aria-hidden="true" /> Escaneando</>) : 'Escanear ofertas'}
                </button>
              </form>
            </Panel>

            {errorMsg && <div className={s.warn} style={{ borderColor: 'rgba(255,107,107,.5)', background: 'rgba(255,107,107,.08)' }}>⚠ {errorMsg}</div>}
            {aviso && <div className={s.warn}>ℹ {aviso}</div>}

            <div ref={resultsRef}>
              <Panel titulo="Radar de ofertas" etiqueta={status === 'loading' ? 'ESCANEANDO…' : `${displayOfertas.length} OBJETIVOS`} led={status === 'loading' ? 'warn' : 'ok'} style={{ '--pd': '180ms' }}>
                <div className={s.radarWrap}>
                  <Radar ofertas={radarOfertas} activo={activo} onSelect={enfocar} escaneando={status === 'loading'} />
                  <div className={s.legend}>
                    <span style={{ '--c': DECISION_COLOR.POSTULAR }}><i /> Ajuste alto (≥ 65 %): postular</span>
                    <span style={{ '--c': DECISION_COLOR.ADAPTAR }}><i /> Ajuste medio: postular adaptando el CV</span>
                    <span style={{ '--c': DECISION_COLOR.NO_PRIORIZAR }}><i /> Ajuste bajo: no priorizar</span>
                    <span style={{ '--c': DECISION_COLOR.SIN_DETALLE }}><i /> Sin detalle suficiente</span>
                    <span className={s.tag} style={{ marginTop: '.4rem' }}>{tienePerfil ? 'Cuanto más cerca del centro, mejor encajas. Toca un punto para ver la oferta.' : 'Carga tu CV para ubicar cada oferta según tu ajuste.'}</span>
                  </div>
                </div>
              </Panel>

              {status === 'loading' && (
                <ul className={s.list} style={{ marginTop: '1rem' }}>
                  {[0, 1, 2].map((i) => <li key={i} className={s.skeleton} style={{ '--i': i }} />)}
                </ul>
              )}

              {status === 'done' && ofertas.length === 0 && !aviso && (
                <div className={s.empty} style={{ marginTop: '1rem' }}>
                  Sin objetivos en los últimos 7 días para ese filtro. Prueba un término más general o revisa el portal oficial del gobierno.
                </div>
              )}

              {displayOfertas.length > 0 && (
                <>
                  <div className={s.countLine}><span>{displayOfertas.length} OFERTA{displayOfertas.length === 1 ? '' : 'S'} DETECTADA{displayOfertas.length === 1 ? '' : 'S'}</span><span>{tienePerfil ? 'ORDENADAS POR AJUSTE' : 'ORDENADAS POR FECHA'}</span></div>
                  <ul className={s.list}>
                    {displayOfertas.map((o, i) => {
                      const f = fitDe(o);
                      const fuente = FUENTE_STYLE[o.fuente] || { color: '#8fa8b3' };
                      const color = f ? DECISION_COLOR[f.decision] : fuente.color;
                      return (
                        <li id={`oferta-${i}`} key={`${o.url}-${i}`} className={`${s.offer} ${activo === i ? s.offerActive : ''}`} style={{ '--i': i, '--c': color }} onMouseEnter={() => setActivo(i)}>
                          <div className={s.offerMain}>
                            <div className={s.offerTop}>
                              <span className={s.num}>#{String(i + 1).padStart(2, '0')}</span>
                              <span className={s.badge} style={{ background: fuente.color }}>{o.fuente}</span>
                              <span className={s.date} title={formatFecha(o.fechaPublicacion)}>{haceCuanto(o.fechaPublicacion) || formatFecha(o.fechaPublicacion)}</span>
                            </div>
                            <h3>{o.titulo}</h3>
                            <div className={s.meta}>
                              <span>🏢 {o.empresa}</span><span>📍 {o.ubicacion}</span>{o.tipoEmpleo && <span>🕒 {o.tipoEmpleo}</span>}
                            </div>
                            {f && <span className={s.verdict}>{DECISION_LABEL[f.decision]}</span>}
                          </div>
                          <div className={s.offerSide}>
                            {f && f.ajuste != null
                              ? <RingGauge value={f.ajuste} color={color} />
                              : <div className={s.noFit}>{tienePerfil ? 'SIN DETALLE' : 'CARGA TU CV'}</div>}
                          </div>
                          <div className={s.actions}>
                            <a className={s.link} href={o.url} target="_blank" rel="noopener noreferrer">VER OFERTA Y POSTULAR ▶</a>
                            {tienePerfil && (
                              <>
                                <button type="button" className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => setAbierta(abierta === i ? null : i)}>{abierta === i ? 'Ocultar análisis' : 'Ver análisis'}</button>
                                <button type="button" className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => { setModal(i); setDescPegada(''); }}>Pegar descripción</button>
                              </>
                            )}
                          </div>
                          {abierta === i && f && <div className={s.drawer}><Requisitos fit={f} /></div>}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* ================= COLUMNA DERECHA: TELEMETRÍA ================= */}
          <div className={`${s.col} ${s.colRight}`}>
            <Panel titulo="Telemetría" etiqueta="LIVE" tilt style={{ '--pd': '240ms' }}>
              <div className={s.stats}>
                <Stat valor={telemetria.n} etiqueta="OFERTAS" />
                <Stat valor={telemetria.evaluadas} etiqueta="EVALUADAS" />
                <Stat valor={telemetria.medio} etiqueta="AJUSTE MEDIO" sufijo="%" />
                <Stat valor={telemetria.mejor} etiqueta="MEJOR AJUSTE" sufijo="%" />
              </div>
              {telemetria.top.length > 0 && (
                <>
                  <hr className={s.sep} />
                  <p className={s.tag}>BRECHAS MÁS FRECUENTES</p>
                  <div className={s.bars}>
                    {telemetria.top.map(([term, n], i) => (
                      <div key={term} className={s.bar}>
                        <span>{term}</span>
                        <div className={s.barTrack}><div className={s.barFill} style={{ '--w': `${Math.round((n / Math.max(1, telemetria.evaluadas)) * 100)}%`, '--i': i }} /></div>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                  <p className={s.legendMini} style={{ marginTop: '.7rem' }}>Aprender estas habilidades (y mostrarlas en un proyecto) sube tu ajuste en varias ofertas a la vez.</p>
                </>
              )}
              {!tienePerfil && <p className={s.p} style={{ marginTop: '.8rem' }}>Carga tu CV para activar el ajuste y las brechas.</p>}
            </Panel>

            <Panel titulo="Portal oficial" etiqueta="GOB.EC" tilt style={{ '--pd': '300ms' }} led="warn">
              <a className={s.gov} href="https://encuentraempleo.trabajo.gob.ec/socioEmpleo-war/paginas/index.jsf" target="_blank" rel="noopener noreferrer">
                <h3>RED SOCIO EMPLEO</h3>
                <p>La administra el Ministerio del Trabajo de Ecuador: es la fuente más confiable. Revísala siempre, además de estos resultados. ▶</p>
              </a>
            </Panel>

            <Panel titulo="Más fuentes" etiqueta="LINKS" style={{ '--pd': '360ms' }}>
              <div className={s.otherLinks}>
                <a href="https://www.linkedin.com/jobs/search/?location=Ecuador" target="_blank" rel="noopener noreferrer">▸ Ofertas en LinkedIn (Ecuador)</a>
                <a href="https://www.multitrabajos.com" target="_blank" rel="noopener noreferrer">▸ Multitrabajos.com</a>
                <a href="https://www.linkedin.com/in/marlon-p%C3%A9rez-06ab32303/" target="_blank" rel="noopener noreferrer">▸ JuniorJobs: boletín semanal júnior</a>
              </div>
            </Panel>
          </div>
        </div>
      </main>

      {modal != null && displayOfertas[modal] && (
        <div className={s.modalBack} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }} role="dialog" aria-modal="true" aria-label="Evaluar descripción de la oferta">
          <Panel titulo="Evaluar descripción" etiqueta="LOCAL · NO SE ENVÍA" className={s.modal}>
            <p className={s.p}>Pega la descripción completa de «{displayOfertas[modal].titulo}». El análisis ocurre en tu navegador: el texto no se envía a ningún servidor.</p>
            <textarea className={s.ta} value={descPegada} onChange={(e) => setDescPegada(e.target.value)} placeholder="Requisitos, conocimientos, responsabilidades…" />
            <div className={s.modalRes}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={evaluarPegada} disabled={descPegada.trim().length < 20}>Evaluar</button>
              <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => setModal(null)}>Cerrar</button>
              {fitManual[displayOfertas[modal]._idx] && fitManual[displayOfertas[modal]._idx].ajuste != null && (
                <RingGauge value={fitManual[displayOfertas[modal]._idx].ajuste} color={DECISION_COLOR[fitManual[displayOfertas[modal]._idx].decision]} />
              )}
            </div>
            {fitManual[displayOfertas[modal]._idx] && <div style={{ marginTop: '1rem' }}><Requisitos fit={fitManual[displayOfertas[modal]._idx]} /></div>}
          </Panel>
        </div>
      )}
    </div>
  );
}
