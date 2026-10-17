import { useEffect, useRef } from 'react';
import s from '../../styles/hud.module.css';

// Fondo vivo: rejilla en perspectiva que avanza, partículas flotantes y haces de datos.
// Un solo <canvas> fijo, DPR limitado, se pausa con la pestaña oculta y respeta
// prefers-reduced-motion (en ese caso dibuja un único cuadro estático).
export default function HudBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0; let h = 0; let raf = 0; let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const N = window.innerWidth < 700 ? 28 : 60;
    const parts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), v: 0.00004 + Math.random() * 0.00012, r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.6 + 0.2 }));
    const beams = Array.from({ length: 5 }, () => ({ x: Math.random(), y: Math.random(), l: 0.08 + Math.random() * 0.12, v: 0.0006 + Math.random() * 0.001 }));

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Rejilla en perspectiva (suelo) con desplazamiento continuo
      const horizon = h * 0.46; const vx = w / 2;
      ctx.lineWidth = 1;
      for (let i = -14; i <= 14; i += 1) {
        const x2 = vx + i * (w / 7);
        ctx.strokeStyle = `rgba(47,216,201,${0.05 + 0.1 * (1 - Math.abs(i) / 14)})`;
        ctx.beginPath(); ctx.moveTo(vx + i * 8, horizon); ctx.lineTo(x2, h); ctx.stroke();
      }
      for (let k = 0; k < 14; k += 1) {
        const p = ((k + (t * 0.012) % 1) / 14) ** 2.2;
        const y = horizon + p * (h - horizon);
        ctx.strokeStyle = `rgba(47,216,201,${0.03 + p * 0.16})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Haces de datos verticales
      for (const b of beams) {
        const y = ((b.y + t * b.v) % 1) * h; const x = b.x * w;
        const g = ctx.createLinearGradient(x, y - b.l * h, x, y);
        g.addColorStop(0, 'rgba(47,216,201,0)'); g.addColorStop(1, 'rgba(47,216,201,0.45)');
        ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y - b.l * h); ctx.lineTo(x, y); ctx.stroke();
      }
      // Partículas
      for (const p of parts) {
        const y = ((p.y - t * p.v * 60) % 1 + 1) % 1;
        ctx.fillStyle = `rgba(143,232,255,${p.a * 0.7})`;
        ctx.beginPath(); ctx.arc(p.x * w, y * h, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() {
      t += 1; draw();
      raf = requestAnimationFrame(loop);
    }
    function onVis() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    }

    resize(); draw();
    if (!reduce) raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return <canvas ref={ref} className={s.bgCanvas} aria-hidden="true" />;
}
