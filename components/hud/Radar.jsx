import s from '../../styles/hud.module.css';
import { DECISION_COLOR } from './RingGauge';

// Radar interactivo: cada oferta es un punto. Cuanto mejor es el ajuste, más cerca del centro.
// Las ofertas sin detalle suficiente quedan en el anillo exterior (gris). Clic = enfoca la tarjeta.
export default function Radar({ ofertas, activo, onSelect, escaneando }) {
  const cx = 150; const cy = 150;
  const blips = ofertas.map((o, i) => {
    const ang = (i * 137.5 * Math.PI) / 180;
    const rad = o.fit && o.fit.ajuste != null ? 18 + (100 - o.fit.ajuste) * 1.05 : 128;
    return { i, x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang), color: DECISION_COLOR[o.fit?.decision || 'SIN_DETALLE'], o };
  });
  return (
    <div className={`${s.radar} ${escaneando ? s.radarScanning : ''}`}>
      <svg viewBox="0 0 300 300" role="group" aria-label="Radar de ofertas">
        <defs>
          <linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2fd8c9" stopOpacity="0" />
            <stop offset="1" stopColor="#2fd8c9" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="radarBg"><stop offset="0" stopColor="#0d2a30" stopOpacity="0.9" /><stop offset="1" stopColor="#07101a" stopOpacity="0.95" /></radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="145" fill="url(#radarBg)" stroke="#2fd8c9" strokeOpacity=".5" />
        {[36, 72, 108, 138].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#2fd8c9" strokeOpacity=".22" strokeDasharray="2 5" />)}
        {[0, 45, 90, 135].map((a) => <line key={a} x1={cx} y1={cy} x2={cx + 145 * Math.cos((a * Math.PI) / 180)} y2={cy + 145 * Math.sin((a * Math.PI) / 180)} stroke="#2fd8c9" strokeOpacity=".15" />)}
        {[0, 45, 90, 135].map((a) => <line key={`n${a}`} x1={cx} y1={cy} x2={cx - 145 * Math.cos((a * Math.PI) / 180)} y2={cy - 145 * Math.sin((a * Math.PI) / 180)} stroke="#2fd8c9" strokeOpacity=".15" />)}
        <g className={s.radarSweep}>
          <path d={`M ${cx} ${cy} L ${cx + 145} ${cy} A 145 145 0 0 0 ${cx + 145 * Math.cos(-0.6)} ${cy + 145 * Math.sin(-0.6)} Z`} fill="url(#sweepG)" />
          <line x1={cx} y1={cy} x2={cx + 145} y2={cy} stroke="#7dfff0" strokeWidth="1.5" />
        </g>
        {blips.map((b) => (
          <g key={b.i} className={s.blip} style={{ '--d': `${b.i * 90}ms`, '--c': b.color }} onClick={() => onSelect(b.i)} role="button" tabIndex={0} aria-label={`Oferta ${b.i + 1}: ${b.o.titulo}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(b.i); } }}>
            <circle className={s.blipPulse} cx={b.x} cy={b.y} r="5" />
            <circle cx={b.x} cy={b.y} r={activo === b.i ? 6.5 : 4} fill={b.color} stroke="#04140a" strokeWidth="1" />
            {activo === b.i && <text x={b.x + 9} y={b.y - 8} className={s.blipLabel}>{String(b.i + 1).padStart(2, '0')}</text>}
          </g>
        ))}
        <circle cx={cx} cy={cy} r="3.5" fill="#7dfff0" />
        <text x={cx} y="14" textAnchor="middle" className={s.radarTag}>100 %</text>
        <text x={cx} y="293" textAnchor="middle" className={s.radarTag}>0 %</text>
      </svg>
    </div>
  );
}
