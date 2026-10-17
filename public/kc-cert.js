/* Kernel Cero — certificado "Héroe del Club".
 * Muestra el diseño como motivación, registra tu progreso en tu cuenta (Google/GitHub) y, al completar los 31 niveles,
 * permite emitir y descargar el PDF firmado por el Club. La emisión y la validación ocurren en el servidor
 * (/api/kc/*); este módulo solo es la interfaz y no puede "desbloquear" nada por su cuenta. */
(function () {
  'use strict';
  var STORAGE_KEY = 'linuxGameProgress_v7', TIMES_KEY = 'kc-cert-times', TOTAL = 31;
  var EJEMPLO = 'Victor Lluilema';
  var S = { sb: null, session: null, listo: false, config: true, completados: 0, cert: null, nombreSug: '', puedeEmitir: false, msg: '', msgCls: '', ocupado: false, localN: 0 };

  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
  function readState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (e) { return null; } }
  function readTimes() { try { return JSON.parse(localStorage.getItem(TIMES_KEY)) || {}; } catch (e) { return {}; } }
  function writeTimes(t) { try { localStorage.setItem(TIMES_KEY, JSON.stringify(t)); } catch (e) {} }

  // ---------- progreso local ----------
  function levelDone(s, n) { var o = s && s['l' + n]; if (!o) return false; var v = Object.keys(o).filter(function (k) { return typeof o[k] === 'boolean'; }); return v.length > 0 && v.every(function (k) { return o[k]; }); }
  function levelsDone(s) { var r = []; for (var n = 1; n <= TOTAL; n++) if (levelDone(s, n)) r.push(n); return r; }
  function trackTimes() {
    var s = readState(); if (!s) return; var t = readTimes(), ch = false, now = Date.now();
    var done = levelsDone(s);
    var cur = s.level; if (cur && !done.includes(cur) && !(t[cur] && t[cur].start)) { t[cur] = t[cur] || {}; t[cur].start = now; ch = true; }
    done.forEach(function (n) { if (t[n] && t[n].start && !t[n].dur) { t[n].dur = Math.max(1, Math.round((now - t[n].start) / 1000)); ch = true; } });
    if (ch) writeTimes(t);
    S.localN = done.length;
  }
  function estDuracion(s, n, done, t) {
    if (t[n] && t[n].dur) return t[n].dur;
    var total = (s.elapsedBefore || 0) + (s.startedAt ? Date.now() - s.startedAt : 0);   // ms jugados en total
    return Math.max(25, Math.round(total / 1000 / Math.max(1, done.length)));            // promedio por nivel (niveles anteriores al módulo)
  }

  // ---------- sesión (Supabase, igual que el sitio principal) ----------
  async function initAuth() {
    try {
      var res = await fetch('/api/public-config'); var cfg = await res.json();
      if (!res.ok || !cfg.supabaseUrl) throw new Error('sin config');
      var mod = await import('https://esm.sh/@supabase/supabase-js@2?bundle');
      S.sb = mod.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      var r = await S.sb.auth.getSession(); S.session = r.data.session;
      S.sb.auth.onAuthStateChange(function (_e, ses) { S.session = ses; refresh(); });
    } catch (e) { S.sb = null; }
    S.listo = true; await refresh();
  }
  function token() { return S.session && S.session.access_token; }
  function nombreCuenta() { var u = S.session && S.session.user, m = (u && u.user_metadata) || {}; return String(m.full_name || m.name || '').trim(); }
  function api(path, opts) {
    opts = opts || {}; opts.headers = Object.assign({ Authorization: 'Bearer ' + token() }, opts.headers || {});
    return fetch(path, opts);
  }

  async function refresh() {
    trackTimes();
    if (S.session) {
      try {
        var r = await api('/api/kc/certificado'); var d = await r.json();
        if (r.status === 503) { S.config = false; }
        else if (r.ok) { S.config = true; S.completados = d.completados; S.cert = d.certificado; S.nombreSug = d.nombreSugerido || nombreCuenta(); S.puedeEmitir = d.puedeEmitir; }
      } catch (e) { /* sin red: se muestra el progreso local */ }
      syncProgress();
    } else { S.cert = null; S.completados = 0; S.puedeEmitir = false; }
    render();
  }
  var sincronizando = false;
  async function syncProgress() {
    if (sincronizando || !S.session || !S.config) return; sincronizando = true;
    try {
      var s = readState(); if (!s) return; var done = levelsDone(s), t = readTimes();
      var r = await api('/api/kc/progreso'); if (!r.ok) return; var srv = (await r.json()).niveles || [];
      var faltan = done.filter(function (n) { return srv.indexOf(n) < 0; }).sort(function (a, b) { return a - b; });
      var cambio = false;
      for (var i = 0; i < faltan.length; i++) {
        var n = faltan[i];
        var pr = await api('/api/kc/progreso', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nivel: n, duracionSeg: estDuracion(s, n, done, t), pistas: (s.hintsUsed || 0) }) });
        if (!pr.ok) break; cambio = true;
      }
      if (cambio) { var r2 = await api('/api/kc/certificado'); if (r2.ok) { var d = await r2.json(); S.completados = d.completados; S.cert = d.certificado; S.puedeEmitir = d.puedeEmitir; render(); } }
    } catch (e) {} finally { sincronizando = false; }
  }

  // ---------- acciones ----------
  function signIn(p) { if (!S.sb) { S.msg = 'El inicio de sesión no está disponible ahora. Intenta más tarde.'; S.msgCls = 'err'; render(); return; } S.sb.auth.signInWithOAuth({ provider: p, options: { redirectTo: location.origin + '/linux-cli.html' } }); }
  async function emitir() {
    var inp = $('#kcc-nombre'); var nombre = inp ? inp.value : S.nombreSug; S.ocupado = true; S.msg = 'Emitiendo tu certificado…'; S.msgCls = ''; render();
    try {
      var r = await api('/api/kc/certificado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nombre }) }); var d = await r.json();
      if (!r.ok) { S.msg = d.error || 'No se pudo emitir el certificado.'; S.msgCls = 'err'; }
      else { S.cert = d.certificado; S.puedeEmitir = false; S.msg = '¡Certificado emitido! Ya puedes descargarlo.'; S.msgCls = 'ok'; if (window.KC_FX) KC_FX.banner('CERTIFICADO EMITIDO', S.cert.codigo); }
    } catch (e) { S.msg = 'No pudimos conectarnos. Revisa tu conexión.'; S.msgCls = 'err'; }
    S.ocupado = false; render();
  }
  async function descargar() {
    S.ocupado = true; S.msg = 'Preparando tu PDF…'; S.msgCls = ''; render();
    try {
      var r = await api('/api/kc/certificado-pdf');
      if (!r.ok) { var d = await r.json().catch(function () { return {}; }); S.msg = d.error || 'No se pudo descargar el certificado.'; S.msgCls = 'err'; }
      else { var b = await r.blob(), a = el('a'); a.href = URL.createObjectURL(b); a.download = 'Certificado-Club-' + S.cert.codigo + '.pdf'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); S.msg = 'Descarga lista ✓'; S.msgCls = 'ok'; }
    } catch (e) { S.msg = 'No pudimos descargar el PDF. Intenta de nuevo.'; S.msgCls = 'err'; }
    S.ocupado = false; render();
  }

  // ---------- vista ----------
  function fechaHoy() { return new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function paper(nombre, fecha) {
    var n = String(nombre || EJEMPLO), cls = n.length > 34 ? 'xl' : n.length > 26 ? 'l' : n.length > 20 ? 'm' : '';
    return '<div class="kcc-paper" role="img" aria-label="Certificado de Héroe del Club a nombre de ' + esc(n) + '"><div class="kcc-name ' + cls + '">' + esc(n) + '</div><div class="kcc-date">Dado y firmado en Milagro, Ecuador, el ' + esc(fecha || fechaHoy()) + '.</div></div>';
  }
  function progreso() { return Math.max(S.completados, S.localN); }
  function nombreVista() { return S.cert ? S.cert.nombre : (S.session ? (S.nombreSug || nombreCuenta() || EJEMPLO) : EJEMPLO); }
  function pie() {
    if (S.cert) return '<div class="kcc-cap">CERTIFICADO EMITIDO · ' + esc(S.cert.codigo) + '</div>';
    return '<div class="kcc-cap">' + (S.session ? 'ASÍ SALDRÁ TU CERTIFICADO' : 'EJEMPLO ILUSTRATIVO') + '</div>';
  }
  function cuerpo(ctx) {
    var n = progreso(), pct = Math.round(100 * n / TOTAL), h = '';
    if (S.cert) {
      h += '<p><b>¡Felicitaciones, ' + esc(S.cert.nombre) + '!</b> Tu certificado de Héroe del Club ya está emitido y firmado por el Club.</p>';
      h += '<div class="kcc-row"><button class="kcc-btn primary" data-k="dl"' + (S.ocupado ? ' disabled' : '') + '>⬇ Descargar PDF</button><a class="kcc-btn" href="/verificar/' + esc(S.cert.codigo) + '" target="_blank" rel="noopener">Ver verificación</a></div>';
    } else if (!S.session) {
      h += '<p>Pasa los <b>31 niveles</b> de Kernel Cero y recibe el <b>certificado oficial del Club</b>, firmado por el fundador, con un <b>código QR verificable</b>.</p>';
      h += '<span class="kcc-lock">🔒 Se descarga en PDF al completar los 31 niveles</span>';
      h += '<p><b>Regístrate con Google o GitHub</b> para que el certificado salga con <b>tu nombre</b> y tu progreso quede guardado.</p>';
      h += '<div class="kcc-row"><button class="kcc-btn primary" data-k="g">Continuar con Google</button><button class="kcc-btn" data-k="gh">Continuar con GitHub</button></div>';
    } else if (S.puedeEmitir) {
      h += '<p><b>¡Completaste los 31 niveles!</b> Confirma el nombre que irá en tu certificado. <b>Una vez emitido, no se puede cambiar.</b></p>';
      h += '<input class="kcc-input" id="kcc-nombre" maxlength="70" autocomplete="name" value="' + esc(S.nombreSug) + '" placeholder="Nombre y apellido">';
      h += '<div class="kcc-row"><button class="kcc-btn primary" data-k="emit"' + (S.ocupado ? ' disabled' : '') + '>🎓 Emitir mi certificado</button></div>';
    } else {
      h += '<p>Hola, <b>' + esc(nombreCuenta() || 'agente') + '</b>. Tu certificado saldrá a este nombre. Llevas <b>' + n + ' de ' + TOTAL + '</b> niveles.</p>';
      h += '<div class="kcc-prog" aria-hidden="true"><i style="width:' + pct + '%"></i></div>';
      h += '<span class="kcc-lock">🔒 Se desbloquea al completar los 31 niveles</span>';
      if (!S.config) h += '<p class="kcc-msg">Estamos activando la emisión de certificados; tu progreso se guardará en cuanto esté lista.</p>';
    }
    if (S.session && ctx === 'modal') h += '<div class="kcc-row" style="margin-top:.6rem"><button class="kcc-btn gold" data-k="out">Cerrar sesión</button></div>';
    if (S.msg) h += '<p class="kcc-msg ' + S.msgCls + '" role="status">' + esc(S.msg) + '</p>';
    return h;
  }
  function bloque(ctx) { return '<div>' + paper(nombreVista(), S.cert ? new Date(S.cert.emitido_en).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }) : '') + pie() + '</div><div>' + (ctx === 'card' ? '<h3>🎓 CONSIGUE TU CERTIFICADO</h3>' : '') + cuerpo(ctx) + '</div>'; }

  var card, modal;
  function render() {
    if (card) card.innerHTML = bloque('card');
    if (modal) { var b = $('.kcc-modal-body', modal); if (b) b.innerHTML = '<div class="kcc-card" style="margin:0">' + bloque('modal') + '</div>'; }
    var fin = $('#kcc-final'); if (fin) fin.style.display = progreso() >= TOTAL ? '' : 'none';
  }
  function onClick(e) {
    var b = e.target.closest('[data-k]'); if (!b) return; var k = b.dataset.k;
    if (k === 'g') signIn('google'); else if (k === 'gh') signIn('github'); else if (k === 'emit') emitir(); else if (k === 'dl') descargar();
    else if (k === 'out' && S.sb) S.sb.auth.signOut().then(function () { S.msg = ''; refresh(); });
    else if (k === 'open') open();
  }

  function open() {
    if (!modal) {
      modal = el('div', 'modal-overlay'); modal.id = 'kcc-modal'; modal.hidden = true;
      modal.innerHTML = '<div class="modal"><h1>🎓 Certificado <span>Héroe del Club</span></h1><div class="kcc-modal-body"></div><button class="btn" type="button" data-close>Cerrar</button></div>';
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.hasAttribute('data-close')) close(); onClick(e); });
      document.body.appendChild(modal);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.hidden) close(); });
    }
    modal.hidden = false; S.msg = ''; refresh();
  }
  function close() { if (modal) modal.hidden = true; }

  function init() {
    var intro = $('#intro-modal .modal'), start = $('#intro-start');
    if (intro && start) { card = el('div', 'kcc-card'); card.addEventListener('click', onClick); start.parentNode.insertBefore(card, start); }
    var comp = $('#complete-modal .certificate');
    if (comp && comp.parentNode) {
      var f = el('div', 'kcc-final'); f.id = 'kcc-final'; f.innerHTML = '<p>🏆 <b>¡Llegaste al final!</b> Reclama tu certificado oficial del Club, con tu nombre y código QR verificable.</p><button class="kcc-btn primary" type="button" data-k="open">🎓 Reclamar mi certificado</button>';
      f.addEventListener('click', onClick); comp.parentNode.insertBefore(f, comp.nextSibling);
    }
    render(); initAuth();
    setInterval(function () { trackTimes(); if (S.session && !document.hidden) syncProgress(); var fin = $('#kcc-final'); if (fin) fin.style.display = progreso() >= TOTAL ? '' : 'none'; }, 6000);
    window.KC_CERT = { open: open, close: close };
    if (location.hostname === 'localhost') window.KC_CERT._test = { S: S, render: render };   // solo para pruebas locales
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
