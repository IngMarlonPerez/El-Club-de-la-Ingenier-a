/* Kernel Cero — efectos e interactividad HUD v3.
 * Capa independiente: no modifica la lógica del juego. Observa el DOM y reutiliza los botones
 * existentes (pista, ejemplo, codex, niveles, tienda, sonido, voz) para la paleta de comandos. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }

  // ---------- fondo vivo (rejilla en perspectiva + partículas) ----------
  function initBackground() {
    var cv = el('canvas'); cv.id = 'kc-bg'; cv.setAttribute('aria-hidden', 'true'); document.body.insertBefore(cv, document.body.firstChild);
    ['kc-vig', 'kc-scan', 'kc-bar'].forEach(function (c) { var d = el('div', c); d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); });
    var ctx = cv.getContext('2d'), w = 0, h = 0, t = 0, raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var N = window.innerWidth < 700 ? 24 : 55;
    var parts = []; for (var i = 0; i < N; i++) parts.push({ x: Math.random(), y: Math.random(), v: 0.00004 + Math.random() * 0.00011, r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.6 + 0.2 });
    function resize() { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw() {
      ctx.clearRect(0, 0, w, h); var hz = h * 0.5, vx = w / 2; ctx.lineWidth = 1;
      for (var i = -14; i <= 14; i++) { ctx.strokeStyle = 'rgba(0,243,255,' + (0.04 + 0.09 * (1 - Math.abs(i) / 14)) + ')'; ctx.beginPath(); ctx.moveTo(vx + i * 8, hz); ctx.lineTo(vx + i * (w / 7), h); ctx.stroke(); }
      for (var k = 0; k < 14; k++) { var p = Math.pow((k + (t * 0.012) % 1) / 14, 2.2), y = hz + p * (h - hz); ctx.strokeStyle = 'rgba(0,243,255,' + (0.03 + p * 0.14) + ')'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (var j = 0; j < parts.length; j++) { var q = parts[j], yy = ((q.y - t * q.v * 60) % 1 + 1) % 1; ctx.fillStyle = 'rgba(143,232,255,' + (q.a * 0.65) + ')'; ctx.beginPath(); ctx.arc(q.x * w, yy * h, q.r, 0, 6.2832); ctx.fill(); }
    }
    function loop() { t++; draw(); raf = requestAnimationFrame(loop); }
    resize(); draw(); if (!reduce) raf = requestAnimationFrame(loop);
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { cancelAnimationFrame(raf); if (!document.hidden && !reduce) raf = requestAnimationFrame(loop); });
  }

  // ---------- esquinas HUD + foco de luz que sigue al puntero ----------
  function addCorners(node) {
    if (!node || node.dataset.kcCorners) return; node.dataset.kcCorners = '1';
    if (node.tagName !== 'ASIDE' && getComputedStyle(node).position === 'static') node.style.position = 'relative';
    ['a', 'b', 'c', 'd'].forEach(function (c) { node.appendChild(el('i', 'kc-corner ' + c)); });
  }
  function glass(node) {
    if (!node || node.classList.contains('kc-glass')) return; node.classList.add('kc-glass');
    node.addEventListener('pointermove', function (e) { var r = node.getBoundingClientRect(); node.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); node.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
  }
  function decorate() {
    ['aside', '.ing-bubble-lg', '#cmd-form'].forEach(function (s) { var n = $(s); if (n) { addCorners(n); glass(n); } });
    $all('.modal').forEach(function (m) { addCorners(m); });
  }

  // ---------- destellos ----------
  function burst(x, y, color) {
    if (reduce) return;
    var b = el('div', 'kc-burst'); b.style.left = x + 'px'; b.style.top = y + 'px';
    for (var i = 0; i < 22; i++) {
      var p = el('i'); var a = (Math.PI * 2 * i) / 22 + Math.random() * 0.4, d = 40 + Math.random() * 70;
      p.style.setProperty('--x', Math.cos(a) * d + 'px'); p.style.setProperty('--y', Math.sin(a) * d + 'px'); p.style.setProperty('--c', color || '#39ff6a'); b.appendChild(p);
    }
    document.body.appendChild(b); setTimeout(function () { b.remove(); }, 1000);
  }
  function banner(title, sub) {
    var d = el('div', 'kc-banner', '<b>' + esc(title) + '</b><span>' + esc(sub || '') + '</span>'); document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2700);
  }

  // detecta objetivos recién completados y nivel completo
  var prevDone = null, lastLevelBanner = '';
  function watchObjectives() {
    var list = $('#obj-list'); if (!list || !window.MutationObserver) return;
    function snapshot() { return $all('#obj-list li').map(function (li) { return li.classList.contains('done'); }); }
    prevDone = snapshot();
    new MutationObserver(function () {
      var now = snapshot(), items = $all('#obj-list li');
      if (prevDone && prevDone.length === now.length) {
        now.forEach(function (d, i) { if (d && !prevDone[i]) { var r = items[i].getBoundingClientRect(); burst(r.left + 20, r.top + r.height / 2); } });
      }
      var all = now.length && now.every(Boolean);
      var lvl = ($('#level-label') || {}).textContent || '';
      if (all && prevDone && !prevDone.every(Boolean) && lastLevelBanner !== lvl) { lastLevelBanner = lvl; banner('NIVEL COMPLETADO', lvl + ' · BUEN TRABAJO, AGENTE'); }
      prevDone = now; refreshChips();
    }).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // ---------- sugerencias (lo que el juego ya muestra en la etapa) + autocompletado ----------
  var chipsBox;
  function pendingLabel() { var li = $('#obj-list li.current'); return li ? (li.textContent || '').replace(/^✓/, '').trim() : ''; }
  function refreshChips() {
    if (!chipsBox) return;
    var lbl = pendingLabel(), m = lbl.match(/\(([^)]{2,60})\)\s*$/);
    chipsBox.innerHTML = '<span class="lbl">SIGUIENTE ETAPA</span>';
    if (m) {
      var c = el('button', 'kc-chip', esc(m[1])); c.type = 'button'; c.title = 'Escribir en la consola';
      c.addEventListener('click', function () { var i = $('#cmd-input'); if (i) { i.value = m[1]; i.focus(); } });
      chipsBox.appendChild(c);
    } else if (lbl) { chipsBox.appendChild(el('span', '', esc(lbl.length > 70 ? lbl.slice(0, 70) + '…' : lbl))); }
    chipsBox.appendChild(el('span', 'kc-tabhint', '<kbd>Tab</kbd> autocompletar · <kbd>↑</kbd><kbd>↓</kbd> historial · <kbd>Ctrl</kbd>+<kbd>K</kbd> paleta'));
  }
  var LEXICON = ['pwd', 'ls', 'cd', 'cat', 'echo', 'grep', 'find', 'head', 'tail', 'chmod', 'mkdir', 'cp', 'mv', 'rm', 'ping', 'nmap', 'netstat', 'ss', 'ip', 'iwconfig', 'airmon-ng', 'airodump-ng', 'aircrack-ng', 'ssh', 'ssh-keygen', 'scp', 'gpg', 'wg', 'wg-quick', 'iptables', 'systemctl', 'journalctl', 'uptime', 'top', 'free', 'df', 'whatweb', 'nikto', 'gobuster', 'npm', 'sha256sum', 'md5sum', 'dd', 'autopsy', 'strings', 'exiftool', 'cloudcli', 'ayuda', 'misión', 'siguiente', 'pista', 'ejemplo', 'codex', 'tienda', 'clear', 'history', 'whoami', 'id', 'uname', 'date', 'man', 'less', 'tar', 'curl', 'wget'];
  var history = [], hIdx = -1;
  function initInput() {
    var input = $('#cmd-input'); if (!input) return;
    var bar = $('#cmd-form');
    if (bar && bar.parentNode) { chipsBox = el('div', 'kc-chips'); bar.parentNode.insertBefore(chipsBox, bar); refreshChips(); }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        var v = input.value; if (!v || /\s/.test(v.trim()) && v.indexOf(' ') >= 0 && v.slice(-1) === ' ') { return; }
        if (v.indexOf(' ') === -1) {
          var cand = LEXICON.filter(function (c) { return c.indexOf(v.toLowerCase()) === 0; });
          if (cand.length === 1) { e.preventDefault(); input.value = cand[0] + ' '; }
          else if (cand.length > 1) { e.preventDefault(); var pre = cand[0]; cand.forEach(function (c) { while (c.indexOf(pre) !== 0) pre = pre.slice(0, -1); }); if (pre.length > v.length) input.value = pre; toast(cand.slice(0, 8).join('  ')); }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!history.length) return; e.preventDefault();
        hIdx = e.key === 'ArrowUp' ? Math.min(history.length - 1, hIdx + 1) : Math.max(-1, hIdx - 1);
        input.value = hIdx >= 0 ? history[history.length - 1 - hIdx] : '';
      }
    });
    if (bar) bar.addEventListener('submit', function () { var v = input.value.trim(); if (v) { history.push(v); if (history.length > 60) history.shift(); hIdx = -1; } }, true);
  }
  var toastT;
  function toast(msg) {
    var t = $('.c2-toast'); if (t) t.remove();
    t = el('div', 'c2-toast', esc(msg)); document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, 2200);
  }

  // ---------- paleta de comandos (Ctrl+K) y atajos (?) ----------
  var pal, palInput, palList, palItems = [], palSel = 0;
  function click(sel) { var b = $(sel); if (b) b.click(); }
  var ACTIONS = [
    { i: '💡', t: 'Pedir una pista', k: 'pista', kw: 'ayuda hint ayúdame trabado', f: function () { click('#quick-hint-btn'); } },
    { i: '📋', t: 'Pedir un ejemplo', k: 'ejemplo', kw: 'ejemplo muestra comando', f: function () { click('#quick-example-btn'); } },
    { i: '🎓', t: 'Mi certificado de Héroe del Club', k: 'certificado', kw: 'diploma reconocimiento pdf qr verificar nombre', f: function () { if (window.KC_CERT) KC_CERT.open(); } },
    { i: '🛰️', t: 'Abrir el Centro de Mando', k: 'F2', kw: 'mando centro c2 mapa red telemetría bitácora tutor prompts estudio', f: function () { click('#c2-toggle'); } },
    { i: '📖', t: 'Abrir el Codex (referencia)', k: 'codex', kw: 'referencia sintaxis comandos teoría glosario', f: function () { click('#codex-toggle'); } },
    { i: '🎯', t: 'Elegir nivel', k: 'niveles', kw: 'menu menú misión mision nivel episodio', f: function () { click('#menu-btn'); } },
    { i: '🏪', t: 'Abrir la Tienda del Laboratorio', k: 'tienda', kw: 'comprar mejoras bytecoin wallet', f: function () { click('#shop-toggle'); } },
    { i: '🔊', t: 'Activar o silenciar sonido', k: 'sonido', kw: 'audio música musica silenciar mute', f: function () { click('#sound-toggle'); } },
    { i: '🗣️', t: 'Activar o desactivar la voz de INGenioso', k: 'voz', kw: 'hablar narración narracion', f: function () { click('#voice-toggle'); } },
    { i: '🧘', t: 'Modo enfoque (ocultar panel lateral)', k: 'enfoque', kw: 'zen concentrar panel lateral ocultar', f: function () { var a = $('#app'); if (a) a.classList.toggle('kc-focus'); } },
    { i: '⌨️', t: 'Ver atajos de teclado', k: '?', kw: 'teclas shortcuts atajos', f: function () { showKeys(); } },
    { i: '🏠', t: 'Volver al sitio del Club', k: 'salir', kw: 'home inicio sitio club volver', f: function () { location.href = '/'; } }
  ];
  function buildPalette() {
    pal = el('div', 'kc-pal-back'); pal.hidden = true;
    pal.innerHTML = '<div class="kc-pal" role="dialog" aria-modal="true" aria-label="Paleta de comandos"><input type="text" placeholder="Escribe una acción… (pista, mando, niveles, tienda)" aria-label="Buscar acción" autocomplete="off"><ul role="listbox"></ul><div class="foot"><span>↑↓ navegar</span><span>↵ ejecutar</span><span>esc cerrar</span></div></div>';
    document.body.appendChild(pal); palInput = $('input', pal); palList = $('ul', pal);
    pal.addEventListener('click', function (e) { if (e.target === pal) closePal(); });
    palInput.addEventListener('input', function () { palSel = 0; renderPal(); });
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); renderPal(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); renderPal(); }
      else if (e.key === 'Enter') { e.preventDefault(); runPal(palSel); }
      else if (e.key === 'Escape') { e.preventDefault(); closePal(); }
    });
  }
  function renderPal() {
    var q = palInput.value.trim().toLowerCase();
    palItems = ACTIONS.filter(function (a) { return !q || (a.t + ' ' + a.k + ' ' + (a.kw || '')).toLowerCase().indexOf(q) >= 0; });
    palList.innerHTML = palItems.map(function (a, i) { return '<li role="option" data-i="' + i + '" class="' + (i === palSel ? 'on' : '') + '"><i>' + a.i + '</i><span>' + esc(a.t) + '</span><em>' + esc(a.k) + '</em></li>'; }).join('') || '<li>Sin resultados</li>';
    $all('li[data-i]', palList).forEach(function (li) { li.addEventListener('click', function () { runPal(+li.dataset.i); }); li.addEventListener('mousemove', function () { palSel = +li.dataset.i; $all('li', palList).forEach(function (x) { x.classList.toggle('on', x === li); }); }); });
  }
  function runPal(i) { var a = palItems[i]; if (!a) return; closePal(); setTimeout(a.f, 80); }
  function openPal() { if (!pal) buildPalette(); pal.hidden = false; palInput.value = ''; palSel = 0; renderPal(); setTimeout(function () { palInput.focus(); }, 30); }
  function closePal() { if (pal) pal.hidden = true; var i = $('#cmd-input'); if (i) i.focus(); }
  function showKeys() {
    var d = el('div', 'kc-pal-back'); d.innerHTML = '<div class="kc-pal" role="dialog" aria-modal="true" aria-label="Atajos"><div class="kc-keys"><h3>ATAJOS DE TECLADO</h3>' +
      [['Ctrl + K', 'Paleta de comandos'], ['F2  o  Ctrl + .', 'Centro de Mando'], ['Tab', 'Autocompletar el comando'], ['↑  ↓', 'Historial de comandos'], ['?', 'Esta ayuda'], ['Esc', 'Cerrar paneles']]
        .map(function (r) { return '<span><kbd class="kc-kbd">' + r[0] + '</kbd></span><span>' + r[1] + '</span>'; }).join('') + '</div></div>';
    d.addEventListener('click', function () { d.remove(); }); document.body.appendChild(d);
    document.addEventListener('keydown', function h(e) { if (e.key === 'Escape') { d.remove(); document.removeEventListener('keydown', h); } });
  }
  function initKeys() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (pal && !pal.hidden) closePal(); else openPal(); }
      else if (e.key === '?' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); showKeys(); }
    });
  }

  function init() {
    initBackground(); decorate(); watchObjectives(); initInput(); initKeys();
    // los modales del juego se muestran/ocultan con "hidden": se decoran de nuevo si cambian
    setTimeout(decorate, 800);
    window.KC_FX = { burst: burst, banner: banner, palette: openPal };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
