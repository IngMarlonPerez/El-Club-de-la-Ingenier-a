import { useRef } from 'react';
import s from '../../styles/hud.module.css';

// Panel con esquinas de mira, LED de estado y ligera inclinación 3D que sigue al puntero.
export default function Panel({ titulo, etiqueta, led = 'ok', tilt = false, className = '', children, ...rest }) {
  const ref = useRef(null);
  function move(e) {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--rx', `${(-y * 3.2).toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${(x * 4.2).toFixed(2)}deg`);
    ref.current.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg');
  }
  return (
    <section ref={ref} className={`${s.panel} ${tilt ? s.panelTilt : ''} ${className}`} onPointerMove={move} onPointerLeave={leave} {...rest}>
      <i className={`${s.corner} ${s.cTL}`} /><i className={`${s.corner} ${s.cTR}`} /><i className={`${s.corner} ${s.cBL}`} /><i className={`${s.corner} ${s.cBR}`} />
      {titulo && (
        <header className={s.panelHead}>
          <span className={`${s.led} ${s[`led_${led}`]}`} aria-hidden="true" />
          <h2>{titulo}</h2>
          {etiqueta && <em>{etiqueta}</em>}
        </header>
      )}
      <div className={s.panelBody}>{children}</div>
    </section>
  );
}
