import { useEffect, useState } from 'react';
import s from '../../styles/hud.module.css';

export const DECISION_COLOR = { POSTULAR: '#39ff6a', ADAPTAR: '#e8b23a', NO_PRIORIZAR: '#ff6b6b', SIN_DETALLE: '#5c7a99' };

// Hook: cuenta de 0 a `target` con easing (respeta reduced-motion).
export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target == null) { setV(0); return undefined; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return undefined; }
    let raf = 0; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// Anillo de ajuste: arco animado + marcas rotatorias + número con cuenta ascendente.
export default function RingGauge({ value, size = 84, color = '#2fd8c9', label = 'AJUSTE', empty = false }) {
  const shown = useCountUp(empty ? null : value);
  const r = size / 2 - 7; const C = 2 * Math.PI * r;
  const off = C * (1 - (empty ? 0 : shown) / 100);
  return (
    <div className={s.ring} style={{ width: size, height: size, '--c': color }} role="img" aria-label={empty ? `${label}: sin datos` : `${label} ${value} por ciento`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle className={s.ringTicks} cx={size / 2} cy={size / 2} r={size / 2 - 2} />
        <circle className={s.ringTrack} cx={size / 2} cy={size / 2} r={r} />
        {!empty && <circle className={s.ringArc} cx={size / 2} cy={size / 2} r={r} strokeDasharray={C} strokeDashoffset={off} />}
      </svg>
      <div className={s.ringText}>
        <b>{empty ? '—' : `${shown}`}{!empty && <small>%</small>}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}
