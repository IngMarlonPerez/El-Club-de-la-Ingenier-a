import { useEffect, useState } from 'react';
import s from '../../styles/hud.module.css';

const LINES = [
  'CIE-OS // NÚCLEO DE EMPLEO v3.0',
  'verificando escudo de privacidad ...... OK',
  'cargando motor de ajuste (local) ....... OK',
  'sincronizando fuentes de ofertas ....... OK',
  'sistema en línea. Bienvenido, operador.',
];

// Arranque estilo consola: se muestra una sola vez por sesión del navegador y se puede saltar con clic.
export default function BootSequence({ onDone }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = window.sessionStorage.getItem('cie-boot') === '1'; } catch (e) { /* sin storage */ }
    if (reduce || seen) { onDone(); return undefined; }
    try { window.sessionStorage.setItem('cie-boot', '1'); } catch (e) { /* sin storage */ }
    const timers = LINES.map((_, i) => setTimeout(() => setN(i + 1), 280 * (i + 1)));
    timers.push(setTimeout(() => setOut(true), 280 * LINES.length + 650));
    timers.push(setTimeout(onDone, 280 * LINES.length + 1150));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  function skip() { setOut(true); setTimeout(onDone, 250); }

  return (
    <div className={`${s.boot} ${out ? s.bootOut : ''}`} onClick={skip} role="presentation">
      <div className={s.bootBox}>
        {LINES.slice(0, n).map((l, i) => <p key={l} className={i === n - 1 ? s.bootLast : ''}>{`> ${l}`}</p>)}
        <span className={s.caret} />
        <small>clic para omitir</small>
      </div>
    </div>
  );
}
