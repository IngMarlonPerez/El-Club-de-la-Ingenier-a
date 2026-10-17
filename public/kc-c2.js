/* Kernel Cero — Centro de Mando (C2).
 * Módulo independiente: NO modifica la lógica del juego. Lee el progreso guardado
 * (localStorage 'linuxGameProgress_v7') y observa la terminal (#scrollback) para mostrar
 * un panel de mando con mapa de red, telemetría simulada, bitácora y un tutor de estudio.
 * Todo es 100 % simulado y educativo; el tutor solo sugiere preguntas conceptuales,
 * defensivas y de documentación (nunca scripts ofensivos). */
(function () {
  'use strict';
  var STORAGE_KEY = 'linuxGameProgress_v7';
  var SEEN_KEY = 'kc-c2-seen';

  // ---------- datos: episodios, topologías y tutor ----------
  var EPISODES = [
    { n: 1, title: 'Reconocimiento', levels: [1] },
    { n: 2, title: 'Infiltración WiFi', levels: [2] },
    { n: 3, title: 'Comunicación Segura', levels: [3] },
    { n: 4, title: 'Detección y Respuesta', levels: [4, 5, 6] },
    { n: 5, title: 'Bajo Ataque → Forense', levels: [7, 8, 9, 10, 11, 12, 13] },
    { n: 6, title: 'Pentesting Web + SGSI', levels: [14, 15, 16, 17, 18, 19, 20, 21] },
    { n: 7, title: 'Datacenter + Nube', levels: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31] }
  ];
  var RANKS = [[2, 'Recluta', '🔰'], [6, 'Operador de Campo', '🛡️'], [10, 'Analista de Respuesta', '🚨'], [13, 'Investigador Forense', '🔍'],
    [17, 'Auditor Ofensivo', '🕸️'], [21, 'Arquitecto de Seguridad', '📋'], [30, 'Agente de Rescate', '☁️'], [31, 'Héroe del Club', '🦸']];

  // Nodos por episodio: [id, etiqueta, glifo, x, y, tipo, qué es, riesgo, defensa]
  var TOPO = {
    1: { edges: [[0, 1], [1, 2], [1, 3]], nodes: [
      ['agente', 'AGENTE', '🧑‍💻', 60, 165, 'Tu estación', 'Tu equipo de práctica dentro del laboratorio ficticio.', 'Una estación sin control puede filtrar credenciales.', 'Mínimo privilegio, actualizaciones y registro de actividad.'],
      ['gw', 'GATEWAY', '🌐', 220, 165, 'Puerta de enlace', 'Reparte el tráfico entre el laboratorio y los servicios.', 'Reglas abiertas permiten reconocimiento fácil.', 'Filtrado por defecto (deny-all), segmentación y registros.'],
      ['panel', 'PANEL', '🖥️', 400, 70, 'Panel administrativo', 'Servicio de gestión del club (simulado).', 'Un servicio con versión vulnerable expuesto.', 'Parches, acceso por VPN y autenticación fuerte.'],
      ['db', 'BASE DATOS', '🗄️', 400, 260, 'Datos de miembros', 'Almacena datos personales (ficticios).', 'Fuga de datos personales.', 'Cifrado, mínimos privilegios y respaldos probados.']] },
    2: { edges: [[0, 1], [1, 2], [2, 3], [2, 4]], nodes: [
      ['agente', 'AGENTE', '🧑‍💻', 60, 165, 'Tu estación', 'Equipo con adaptador en modo monitor (laboratorio).', 'Usar estas herramientas sin autorización es ilegal.', 'Solo con permiso escrito y alcance definido.'],
      ['ap', 'PUNTO WIFI', '📡', 215, 165, 'Punto de acceso', 'Red inalámbrica del laboratorio.', 'Contraseña débil o protocolo antiguo.', 'WPA3/WPA2-AES, contraseñas largas, 802.1X y segmentación.'],
      ['gw', 'GATEWAY', '🌐', 360, 165, 'Puerta de enlace', 'Conecta la WiFi con la red interna.', 'Red plana: quien entra, ve todo.', 'VLAN de invitados y firewall entre zonas.'],
      ['panel', 'PANEL', '🖥️', 510, 70, 'Panel administrativo', 'Gestiona la red por WiFi (simulado).', 'Administración expuesta en la misma red.', 'Red de gestión separada y MFA.'],
      ['db', 'BASE DATOS', '🗄️', 510, 260, 'Datos de miembros', 'Datos ficticios del club.', 'Acceso lateral desde la WiFi.', 'Microsegmentación y monitoreo.']] },
    3: { edges: [[0, 1], [1, 2], [2, 3], [2, 4]], nodes: [
      ['agente', 'AGENTE', '🧑‍💻', 60, 165, 'Tu estación', 'Origen de las conexiones cifradas.', 'Llaves privadas sin proteger.', 'Passphrase, permisos 600 y agente SSH controlado.'],
      ['vpn', 'WIREGUARD', '🔐', 215, 165, 'Túnel VPN', 'Canal cifrado y autenticado por llaves.', 'Llaves compartidas o sin rotación.', 'Rotación, revocación y lista de pares permitidos.'],
      ['bastion', 'BASTIÓN SSH', '🛂', 360, 165, 'Servidor de salto', 'Único punto de entrada administrativo.', 'Contraseñas SSH y root remoto.', 'Solo llaves, sin root, MFA y auditoría de sesiones.'],
      ['panel', 'PANEL', '🖥️', 510, 70, 'Panel administrativo', 'Accesible solo por el bastión.', 'Exposición directa a Internet.', 'Allowlist por IP y VPN.'],
      ['gpg', 'GPG', '✉️', 510, 260, 'Mensajería firmada', 'Cifra y firma comunicaciones del equipo.', 'Llaves comprometidas sin revocación.', 'Certificado de revocación y respaldo seguro.']] },
    4: { edges: [[0, 1], [1, 2], [2, 3], [1, 4]], nodes: [
      ['agente', 'ANALISTA', '🧑‍💻', 60, 165, 'Tu estación', 'Puesto del analista defensor.', 'Sin visibilidad no hay detección.', 'Centralizar registros y alertas.'],
      ['sensor', 'SENSOR', '👁️', 215, 165, 'IDS / monitoreo', 'Observa conexiones y registros.', 'Falsos negativos si no se ajusta.', 'Reglas afinadas y correlación de eventos.'],
      ['srv', 'SERVIDOR', '🖧', 380, 90, 'Servidor comprometido', 'Equipo con actividad anómala (simulado).', 'Persistencia y movimiento lateral.', 'Contención, erradicación y recuperación (NIST SP 800-61).'],
      ['ext', 'DESTINO EXT.', '☠️', 540, 90, 'Destino sospechoso', 'Dirección externa a la que se conecta el servidor.', 'Canal encubierto de salida.', 'Filtrado de egreso y listas de bloqueo.'],
      ['gw', 'GATEWAY', '🌐', 380, 255, 'Puerta de enlace', 'Punto donde se aplica la contención.', 'Aislar tarde amplía el daño.', 'Playbook de aislamiento documentado.']] },
    5: { edges: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]], nodes: [
      ['agente', 'RESPONDEDOR', '🧑‍💻', 55, 165, 'Tu estación', 'Equipo de respuesta a incidentes.', 'Decidir sin datos agrava el incidente.', 'Medir primero, actuar después.'],
      ['waf', 'WAF / LÍMITES', '🛡️', 190, 165, 'Defensa perimetral', 'Rate limiting y reglas de filtrado.', 'Sin límites, un flood agota recursos.', 'Límites de tasa, CDN y modo de defensa.'],
      ['web', 'SITIO CLUB', '🕸️', 335, 165, 'Servicio web', 'El sitio del club, bajo carga anómala.', 'Indisponibilidad (DDoS volumétrico).', 'Escalado, caché y mitigación upstream.'],
      ['bots', 'TRÁFICO', '🌊', 470, 70, 'Fuente del ruido', 'Direcciones que generan el tráfico excesivo.', 'Bloqueo manual no escala.', 'Reglas automáticas y reputación de IP.'],
      ['srv', 'SERVIDOR', '🖧', 470, 255, 'Servidor con indicios', 'Contiene señales de un acceso previo.', 'El DDoS puede ser una cortina de humo.', 'Preservar evidencia antes de tocar nada.'],
      ['forense', 'EVIDENCIA', '🔬', 585, 255, 'Imagen forense', 'Copia con hash y cadena de custodia.', 'Evidencia alterada pierde valor legal.', 'Hash, bloqueo de escritura y bitácora de custodia.']] },
    6: { edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], nodes: [
      ['agente', 'AUDITOR', '🧑‍💻', 55, 165, 'Tu estación', 'Auditor con autorización escrita.', 'Trabajar sin alcance es ilegal.', 'Reglas de enfrentamiento y carta de autorización.'],
      ['web', 'SITIO WEB', '🕸️', 190, 165, 'Aplicación web', 'Tu propio sitio, auditado con permiso.', 'Fingerprinting expone versiones.', 'Ocultar banners y endurecer cabeceras.'],
      ['api', 'API', '🔌', 330, 80, 'Servicios de datos', 'Endpoints que consume el sitio.', 'Validación insuficiente de entradas.', 'Validación estricta (p. ej. esquemas) y autenticación.'],
      ['deps', 'LIBRERÍAS', '📦', 330, 255, 'Dependencias de terceros', 'Código externo sin mantenimiento.', 'Eslabón débil de la cadena de suministro.', 'Inventario (SBOM), actualización y escaneo continuo.'],
      ['sgsi', 'SGSI', '📋', 470, 165, 'Sistema de gestión', 'Alcance, activos, riesgos y controles (ISO/IEC 27001).', 'Seguridad sin gobierno depende de héroes.', 'Políticas, auditoría interna y mejora continua.'],
      ['informe', 'INFORME', '📝', 590, 165, 'Informe profesional', 'Hallazgos con riesgo, evidencia y recomendación.', 'Sin informe no hay remediación.', 'Plantilla estándar y seguimiento de acciones.']] },
    7: { edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [2, 6], [5, 6]], nodes: [
      ['agente', 'AGENTE', '🧑‍💻', 50, 165, 'Tu estación', 'Agente de rescate del club.', 'Asumir causas sin evidencia.', 'Correlacionar hallazgos antes de concluir.'],
      ['dc', 'DATACENTER', '🏢', 175, 165, 'Sitio on-premise', 'Acceso físico, ambiente, inventario y hardware.', 'Controles físicos débiles.', 'Bitácora de acceso, monitoreo ambiental y RAID sano.'],
      ['backup', 'RESPALDOS', '💾', 310, 70, 'Backups', 'Copias de las calificaciones.', 'Backup sin restauración probada.', 'Regla 3-2-1 y pruebas periódicas de restauración.'],
      ['iam', 'IAM NUBE', '🔑', 310, 255, 'Identidad y accesos', 'Usuarios, políticas y llaves del proveedor.', 'Llaves antiguas y permisos amplios.', 'Mínimo privilegio, rotación y MFA.'],
      ['bucket', 'ALMACENAMIENTO', '🪣', 440, 255, 'Buckets', 'Donde viven las calificaciones en la nube.', 'Sin versionado ni control de acceso.', 'Versionado, ACL restrictivas y registro de cambios.'],
      ['sync', 'SINCRONIZACIÓN', '🔄', 565, 200, 'Servicio de sincronización', 'Mueve datos entre datacenter y nube.', 'Un bug puede borrar datos sin ataque.', 'Despliegues con rollback y alarmas.'],
      ['umt', 'UNIVERSIDAD', '🎓', 560, 70, 'Entidad aliada', 'La institución que depende del sistema.', 'Impacto en estudiantes y reputación.', 'Evaluación de impacto y comunicación a afectados.']] }
  };

  var PROMPTS = {
    general: [
      'Genera una plantilla de informe de hallazgo con: título, riesgo (probabilidad × impacto), evidencia, recomendación y responsable.',
      'Crea un checklist de auditoría de seguridad de la información para un club universitario, con 15 puntos verificables.',
      'Ayúdame a redactar un resumen ejecutivo de 150 palabras para directivos no técnicos sobre lo que hice en este nivel.',
      'Explícame la diferencia entre amenaza, vulnerabilidad, riesgo y control con ejemplos del laboratorio.',
      'Hazme un plan de estudio de 4 semanas para empezar en ciberseguridad defensiva, con recursos gratuitos.'
    ],
    1: [
      '¿Qué es el reconocimiento en una auditoría y qué diferencia hay entre pasivo y activo?',
      'Explícame cómo leer la salida de un escaneo de puertos: estado, servicio y versión, y qué decisiones se toman.',
      '¿Por qué escanear una red ajena sin autorización es delito? ¿Qué debe incluir una carta de autorización?',
      '¿Cómo se defiende una organización contra el reconocimiento? (filtrado, segmentación, detección)',
      '¿Qué es el principio de mínimo privilegio y cómo lo aplicaría en este laboratorio?'
    ],
    2: [
      'Compara WEP, WPA2 y WPA3 de forma conceptual y explica por qué una contraseña débil es el verdadero problema.',
      '¿Cómo diseñaría una red WiFi corporativa segura? (802.1X, VLAN de invitados, monitoreo)',
      'Explica con palabras simples qué es el cifrado de una red WiFi y por qué importan las contraseñas largas.',
      '¿Qué dice la normativa ecuatoriana sobre el acceso no autorizado a sistemas informáticos? Indica qué debo verificar en la fuente oficial.',
      '¿Cómo detectaría un equipo de seguridad un punto de acceso falso en una empresa?'
    ],
    3: [
      'Explícame cómo funcionan las llaves SSH (pública/privada) y por qué es mejor que una contraseña.',
      '¿Qué es GPG y cuándo usaría firma frente a cifrado? Dame un ejemplo del equipo del club.',
      '¿Qué ventajas tiene WireGuard como VPN y qué debo cuidar en la gestión de llaves?',
      'Dame una política breve de gestión de llaves: generación, almacenamiento, rotación y revocación.',
      '¿Qué es la autenticación multifactor y cómo la combinaría con SSH?'
    ],
    4: [
      'Explícame las fases de respuesta a incidentes del NIST SP 800-61 con un ejemplo del laboratorio.',
      '¿Qué son los indicadores de compromiso y qué registros revisaría un analista SOC para un canal encubierto?',
      'Diferencia contención, erradicación y recuperación, y cuándo conviene aislar un equipo.',
      '¿Qué información debe quedar en la bitácora de un incidente para que sea útil legalmente?',
      'Ayúdame a armar un playbook de respuesta de una página para "conexión saliente sospechosa".'
    ],
    5: [
      'Explica los tipos de DDoS (volumétrico, de protocolo, de aplicación) y cómo se mitiga cada uno.',
      '¿Qué es el rate limiting y qué compromisos tiene frente a usuarios legítimos?',
      '¿Qué es la cadena de custodia y por qué un hash protege la integridad de la evidencia?',
      '¿Cómo se estructura un informe pericial informático? Dame un esquema con secciones.',
      '¿Por qué un ataque DDoS puede ser una cortina de humo y qué debo revisar mientras tanto?'
    ],
    6: [
      'Explícame el OWASP Top 10 en lenguaje simple y cuáles aplican a un sitio como el del club.',
      '¿Qué son las reglas de enfrentamiento y el alcance de una prueba de seguridad autorizada?',
      '¿Qué es un SBOM y cómo ayuda a gestionar dependencias vulnerables?',
      'Dame un ejemplo de hallazgo bien redactado con severidad, impacto y recomendación (sin detalles de explotación).',
      'Explícame el ciclo de ISO/IEC 27001: alcance, activos, riesgos, Declaración de Aplicabilidad, políticas y auditoría interna.'
    ],
    7: [
      'Qué controles físicos y ambientales revisa un auditor en un datacenter y qué evidencia pide.',
      'Explica la regla de backups 3-2-1 y por qué un respaldo no probado no es un respaldo.',
      '¿Cómo se audita la gestión de identidades en la nube? (mínimo privilegio, rotación de llaves, MFA)',
      'Enséñame el método de los 5 porqués y un diagrama de Ishikawa aplicados a la pérdida de calificaciones.',
      '¿Cómo se evalúa el impacto de un incidente con datos personales y a quién se notifica según la LOPDP del Ecuador? Indica qué debo confirmar con la fuente oficial.'
    ]
  };

  var RESOURCES = [
    ['OWASP Top 10', 'https://owasp.org/www-project-top-ten/'],
    ['NIST SP 800-61 (respuesta a incidentes)', 'https://csrc.nist.gov/pubs/sp/800/61/r2/final'],
    ['MITRE ATT&CK (conocimiento defensivo)', 'https://attack.mitre.org/'],
    ['CIS Critical Security Controls', 'https://www.cisecurity.org/controls'],
    ['ISO/IEC 27001', 'https://www.iso.org/standard/27001']
  ];

  // ---------- utilidades ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
  function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (e) { return null; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmmss(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function episodeOf(level) { for (var i = 0; i < EPISODES.length; i++) if (EPISODES[i].levels.indexOf(level) >= 0) return EPISODES[i]; return EPISODES[0]; }
  function rankOf(level) { for (var i = 0; i < RANKS.length; i++) if (level <= RANKS[i][0]) return RANKS[i]; return RANKS[RANKS.length - 1]; }
  function levelProgress(state, n) {
    var s = state && state['l' + n]; if (!s) return { done: 0, total: 8 };
    var k = Object.keys(s).filter(function (x) { return typeof s[x] === 'boolean'; });
    var done = k.filter(function (x) { return s[x]; }).length;
    return { done: done, total: k.length || 8 };
  }
  function episodeFraction(state, ep) {
    var d = 0, t = 0;
    ep.levels.forEach(function (n) { var p = levelProgress(state, n); d += p.done; t += p.total; });
    return t ? d / t : 0;
  }
  function seeded(seed) { var x = seed; return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }

  // ---------- estado del módulo ----------
  var overlay, shell, refs = {}, feed = [], cmdCount = 0, lastKey = '', selNode = 0, tutorTab = 'nivel', tick = 0, timer = null;

  function toast(msg) {
    var t = el('div', 'c2-toast', esc(msg)); document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function pushFeed(text, cls) {
    feed.unshift({ t: new Date(), text: text, cls: cls || '' }); if (feed.length > 40) feed.pop();
    if (overlay && !overlay.hidden) renderFeed();
  }

  // observa la terminal del juego
  function watchTerminal() {
    var sb = $('#scrollback'); if (!sb || !window.MutationObserver) return;
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (!(n instanceof HTMLElement) || !n.classList.contains('line')) return;
          var txt = (n.textContent || '').trim(); if (!txt) return;
          if (n.classList.contains('echo')) { cmdCount++; pushFeed(txt.replace(/^\S+\$\s*/, '$ '), 'cmd'); }
          else if (n.classList.contains('warn') || n.classList.contains('intrusion')) pushFeed(txt.slice(0, 120), 'warn');
          else if (n.classList.contains('success')) pushFeed(txt.slice(0, 120), 'ok');
        });
      });
    }).observe(sb, { childList: true });
  }

  // ---------- construcción de la interfaz ----------
  function build() {
    overlay = el('div', 'c2-overlay'); overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Centro de Mando');
    shell = el('div', 'c2-shell');
    shell.innerHTML =
      '<div class="c2-top"><h1>◢ CENTRO DE MANDO</h1><span class="c2-sub" id="c2-sub"></span><span class="c2-spacer"></span><span class="c2-pill">SIMULACIÓN 100 % FICTICIA</span><span class="c2-pill" id="c2-rank"></span><button type="button" class="c2-close" id="c2-close">CERRAR [ESC]</button></div>' +
      '<div class="c2-grid">' +
      '<div class="c2-col">' +
      '<section class="c2-panel" style="--d:40ms"><h2><i class="c2-led"></i>MISIÓN ACTIVA<em id="c2-lv"></em></h2><div class="c2-body"><div class="c2-mission"><div class="c2-ring"><svg viewBox="0 0 86 86"><circle class="trk" cx="43" cy="43" r="37"/><circle class="arc" id="c2-arc" cx="43" cy="43" r="37"/></svg><b><span id="c2-pct">0%</span><small>NIVEL</small></b></div><div><h3 id="c2-title"></h3><p id="c2-brief"></p></div></div><ul class="c2-obj" id="c2-obj"></ul></div></section>' +
      '<section class="c2-panel" style="--d:120ms"><h2>ACCESOS DIRECTOS</h2><div class="c2-body"><div class="c2-tabs"><button class="c2-btn" data-act="hint">💡 PISTA</button><button class="c2-btn" data-act="example">📋 EJEMPLO</button><button class="c2-btn alt" data-act="codex">📖 CODEX</button><button class="c2-btn alt" data-act="levels">🎯 NIVELES</button><button class="c2-btn alt" data-act="shop">🏪 TIENDA</button><button class="c2-btn alt" data-act="cert">🎓 CERTIFICADO</button></div><div class="c2-stats" id="c2-stats"></div></div></section>' +
      '</div>' +
      '<div class="c2-col">' +
      '<section class="c2-panel" style="--d:80ms"><h2><i class="c2-led"></i>MAPA DE RED<em id="c2-ep"></em></h2><div class="c2-body"><div class="c2-map" id="c2-map"></div><div class="c2-legend"><span><i style="--c:#3a4d5c"></i>Sin explorar</span><span><i style="--c:#e8b23a"></i>Descubierto</span><span><i style="--c:#39ff6a"></i>Asegurado/analizado</span><span><i style="--c:#ff5f5f"></i>Alerta</span></div><div class="c2-nodecard" id="c2-nodecard"></div></div></section>' +
      '<section class="c2-panel" style="--d:160ms"><h2>TELEMETRÍA<em>SIMULADA</em></h2><div class="c2-body"><div class="c2-chlbl"><span>TRÁFICO DE RED</span><b id="c2-tr-v"></b></div><svg class="c2-chart" id="c2-tr" viewBox="0 0 300 74" preserveAspectRatio="none"></svg><div class="c2-chlbl"><span>CARGA DE CPU</span><b id="c2-cpu-v"></b></div><svg class="c2-chart" id="c2-cpu" viewBox="0 0 300 74" preserveAspectRatio="none"></svg><div class="c2-chlbl"><span>ALERTAS ACTIVAS</span><b id="c2-al-v"></b></div></div></section>' +
      '</div>' +
      '<div class="c2-col c2-right">' +
      '<section class="c2-panel" style="--d:100ms"><h2><i class="c2-led"></i>TUTOR DE ESTUDIO<em>INGenioso</em></h2><div class="c2-body"><div class="c2-ethics">🛡️ Aprende <b>defensa y auditoría</b>. Los prompts piden conceptos, detección, controles y documentación. Practica solo con autorización por escrito.</div><div class="c2-tabs" style="margin-top:.6rem" id="c2-tabs"></div><div class="c2-prompts" id="c2-prompts"></div><div class="c2-links" id="c2-links"></div></div></section>' +
      '<section class="c2-panel" style="--d:180ms"><h2>BITÁCORA EN VIVO<em id="c2-cmds"></em></h2><div class="c2-body"><ul class="c2-feed" id="c2-feed"></ul></div></section>' +
      '</div></div>';
    overlay.appendChild(shell); document.body.appendChild(overlay);
    refs = { sub: $('#c2-sub'), rank: $('#c2-rank'), lv: $('#c2-lv'), arc: $('#c2-arc'), pct: $('#c2-pct'), title: $('#c2-title'), brief: $('#c2-brief'), obj: $('#c2-obj'),
      stats: $('#c2-stats'), map: $('#c2-map'), ep: $('#c2-ep'), card: $('#c2-nodecard'), tr: $('#c2-tr'), cpu: $('#c2-cpu'), trv: $('#c2-tr-v'), cpuv: $('#c2-cpu-v'), alv: $('#c2-al-v'),
      tabs: $('#c2-tabs'), prompts: $('#c2-prompts'), links: $('#c2-links'), feed: $('#c2-feed'), cmds: $('#c2-cmds') };

    $('#c2-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    shell.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) { e.preventDefault(); close(); }
      else if ((e.key === 'F2' || (e.ctrlKey && e.key === '.')) ) { e.preventDefault(); overlay.hidden ? open() : close(); }
    });
  }

  function onClick(e) {
    var t = e.target.closest('[data-act],[data-node],[data-tab],[data-prompt]'); if (!t) return;
    if (t.dataset.act) {
      if (t.dataset.act === 'cert') { close(); setTimeout(function () { if (window.KC_CERT) KC_CERT.open(); }, 120); return; }
      var map = { hint: '#quick-hint-btn', example: '#quick-example-btn', codex: '#codex-toggle', levels: '#menu-btn', shop: '#shop-toggle' };
      var b = $(map[t.dataset.act]); if (b) { if (t.dataset.act === 'hint' || t.dataset.act === 'example') { close(); } else { close(); } setTimeout(function () { b.click(); }, 120); }
    } else if (t.dataset.node != null) { selNode = +t.dataset.node; renderMap(); }
    else if (t.dataset.tab) { tutorTab = t.dataset.tab; renderTutor(); }
    else if (t.dataset.prompt != null) {
      var list = currentPrompts(); var p = list[+t.dataset.prompt]; if (!p) return;
      if (t.dataset.how === 'copy') { copyText(p); toast('Prompt copiado ✓'); }
      else { sendToIngenioso(p); }
    }
  }
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).catch(function () {});
    else { var ta = el('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); }
  }
  function sendToIngenioso(text) {
    var input = $('#cmd-input'), form = $('#cmd-form'); if (!input || !form) { copyText(text); toast('Prompt copiado'); return; }
    close(); input.value = text; input.focus();
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    pushFeed('Pregunta enviada a INGenioso: ' + text.slice(0, 70) + '…', 'ok');
  }

  // ---------- render ----------
  function currentPrompts() {
    var s = loadState(); var lv = (s && s.level) || 1; var ep = episodeOf(lv);
    return tutorTab === 'general' ? PROMPTS.general : PROMPTS[ep.n];
  }
  function renderTutor() {
    var s = loadState(); var lv = (s && s.level) || 1; var ep = episodeOf(lv);
    refs.tabs.innerHTML = '<button class="c2-tab" data-tab="nivel" aria-selected="' + (tutorTab === 'nivel') + '">EPISODIO ' + ep.n + '</button><button class="c2-tab" data-tab="general" aria-selected="' + (tutorTab === 'general') + '">PLANTILLAS Y GENERAL</button>';
    var list = currentPrompts();
    refs.prompts.innerHTML = list.map(function (p, i) {
      return '<div class="c2-prompt"><p>' + esc(p) + '</p><div class="acts"><button class="c2-btn" data-prompt="' + i + '" data-how="ask">PREGUNTAR A INGENIOSO</button><button class="c2-btn alt" data-prompt="' + i + '" data-how="copy">COPIAR</button></div></div>';
    }).join('');
    refs.links.innerHTML = '<span class="c2-muted">Fuentes oficiales para profundizar:</span>' + RESOURCES.map(function (r) { return '<a href="' + r[1] + '" target="_blank" rel="noopener noreferrer">▸ ' + esc(r[0]) + '</a>'; }).join('');
  }
  function renderFeed() {
    refs.cmds.textContent = cmdCount + ' COMANDOS';
    if (!feed.length) { refs.feed.innerHTML = '<li class="c2-muted">Sin eventos todavía. Ejecuta comandos en la terminal y aparecerán aquí.</li>'; return; }
    refs.feed.innerHTML = feed.map(function (f) { return '<li class="' + f.cls + '"><time>' + hhmmss(f.t) + '</time><span>' + esc(f.text) + '</span></li>'; }).join('');
  }
  function renderMission(s, lv, ep) {
    var p = levelProgress(s, lv), pct = Math.round(100 * p.done / p.total), R = 37, C = 2 * Math.PI * R;
    refs.arc.style.strokeDasharray = C; refs.arc.style.strokeDashoffset = C * (1 - pct / 100); refs.pct.textContent = pct + '%';
    var label = $('#level-label'); refs.lv.textContent = label ? label.textContent : 'NIVEL ' + lv;
    refs.sub.textContent = 'EPISODIO ' + ep.n + ' · ' + ep.title.toUpperCase();
    var r = rankOf(lv); refs.rank.textContent = r[2] + ' ' + r[1].toUpperCase();
    refs.title.textContent = ep.title;
    var step = $('#current-step'); refs.brief.textContent = step ? step.textContent.replace(/\s+/g, ' ').trim() : '';
    var items = $all('#obj-list li');
    refs.obj.innerHTML = items.map(function (li) {
      var cls = li.classList.contains('done') ? 'done' : (li.classList.contains('current') ? 'cur' : '');
      var txt = (li.textContent || '').replace(/^✓/, '').trim();
      return '<li class="' + cls + '"><i>' + (cls === 'done' ? '✓' : '') + '</i><span>' + esc(txt) + '</span></li>';
    }).join('');
    var eco = (s && s.economy) || {};
    refs.stats.innerHTML = [['₿C', Number(eco.bytecoin || 0).toLocaleString('es-EC')], ['REPUTACIÓN', eco.reputation || 0], ['PISTAS NIVEL', (s && s.hintsUsed) || 0], ['COMANDOS', cmdCount]]
      .map(function (x) { return '<div class="c2-stat"><b>' + esc(x[1]) + '</b><span>' + x[0] + '</span></div>'; }).join('');
  }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function renderMap() {
    var s = loadState(); var lv = (s && s.level) || 1; var ep = episodeOf(lv); var topo = TOPO[ep.n];
    var frac = episodeFraction(s, ep); var N = topo.nodes.length;
    refs.ep.textContent = 'EP.' + ep.n + ' · ' + Math.round(frac * 100) + '%';
    var states = topo.nodes.map(function (n, i) {
      var th = i / (N - 1 || 1);
      if (i === 0) return 'sec';
      if (frac >= 0.98) return 'sec';
      if (frac >= th) return frac >= th + 0.22 ? 'sec' : 'disc';
      return 'unk';
    });
    var alertIdx = -1;
    if (ep.n === 5 && lv >= 7 && lv <= 8) alertIdx = 2;
    if (ep.n === 4 && lv >= 4 && lv <= 5) alertIdx = 2;
    if (ep.n === 7 && lv >= 27 && lv <= 28) alertIdx = 5;
    var svg = '<svg viewBox="0 0 640 330" role="img" aria-label="Mapa de red del laboratorio">';
    topo.edges.forEach(function (e) {
      var a = topo.nodes[e[0]], b = topo.nodes[e[1]]; var on = states[e[0]] !== 'unk' && states[e[1]] !== 'unk';
      svg += '<line class="c2-edge ' + (on ? 'on flow' : '') + '" x1="' + a[3] + '" y1="' + a[4] + '" x2="' + b[3] + '" y2="' + b[4] + '"/>';
    });
    topo.nodes.forEach(function (n, i) {
      var st = i === alertIdx && states[i] !== 'unk' ? 'alert disc' : states[i];
      svg += '<g class="c2-node ' + st + (i === selNode ? ' sel' : '') + '" data-node="' + i + '" tabindex="0" role="button" aria-label="' + esc(n[1]) + '" transform="translate(' + n[3] + ',' + n[4] + ')">' +
        '<circle class="ring" r="26"/><text class="glyph" y="1">' + (states[i] === 'unk' ? '❔' : n[2]) + '</text><text class="lbl" y="42">' + esc(states[i] === 'unk' ? '???' : n[1]) + '</text></g>';
    });
    refs.map.innerHTML = svg + '</svg>';
    $all('.c2-node').forEach(function (g) { g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); } }); });
    var n = topo.nodes[selNode] || topo.nodes[0];
    if (states[selNode] === 'unk') refs.card.innerHTML = '<h4>NODO SIN EXPLORAR</h4><p class="c2-muted">Sigue avanzando en las etapas del nivel para descubrirlo. ¡Un buen analista mira antes de que se lo digan!</p>';
    else refs.card.innerHTML = '<h4>' + esc(n[2]) + ' ' + esc(n[1]) + ' — ' + esc(n[5]) + '</h4><dl><dt>QUÉ ES</dt><dd>' + esc(n[6]) + '</dd><dt>RIESGO</dt><dd>' + esc(n[7]) + '</dd><dt>DEFENSA</dt><dd>' + esc(n[8]) + '</dd></dl>';
    refs.alv.textContent = alertIdx >= 0 ? '1 · ' + topo.nodes[alertIdx][1] : '0';
    refs.alv.style.color = alertIdx >= 0 ? '#ff9f9f' : '';
    return alertIdx >= 0;
  }

  function chartPath(vals, w, h) {
    var max = 100, step = w / (vals.length - 1), d = '';
    vals.forEach(function (v, i) { d += (i ? 'L' : 'M') + (i * step).toFixed(1) + ',' + (h - (v / max) * (h - 6) - 3).toFixed(1); });
    return d;
  }
  function renderTelemetry(alert) {
    var s = loadState(); var lv = (s && s.level) || 1;
    var rnd = seeded(lv * 997 + 13); var tr = [], cpu = [];
    var spike = alert && lv >= 7 && lv <= 8;
    for (var i = 0; i < 48; i++) {
      var base = 28 + rnd() * 14 + Math.sin((i + tick) / 4) * 6;
      var t = base + (spike && i > 26 ? 38 + rnd() * 20 : 0);
      var c = 22 + rnd() * 12 + Math.cos((i + tick) / 5) * 5 + (spike && i > 28 ? 30 + rnd() * 14 : 0);
      tr.push(Math.max(4, Math.min(98, t))); cpu.push(Math.max(4, Math.min(98, c)));
    }
    [[refs.tr, tr, refs.trv, ' Mbit/s', 6], [refs.cpu, cpu, refs.cpuv, ' %', 1]].forEach(function (a) {
      var path = chartPath(a[1], 300, 74), last = a[1][a[1].length - 1];
      a[0].setAttribute('class', 'c2-chart' + (last > 70 ? ' warn' : ''));
      a[0].innerHTML = '<defs><linearGradient id="c2g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00f3ff" stop-opacity=".35"/><stop offset="1" stop-color="#00f3ff" stop-opacity="0"/></linearGradient></defs><path class="area" d="' + path + ' L300,74 L0,74 Z"/><path class="line" d="' + path + '"/>';
      a[2].textContent = Math.round(last * a[4]) + a[3];
    });
  }

  function renderAll() {
    var s = loadState(); var lv = (s && s.level) || 1; var ep = episodeOf(lv);
    var key = lv + '|' + JSON.stringify(s && s['l' + lv]);
    renderMission(s, lv, ep);
    var alert = renderMap();
    renderTelemetry(alert);
    if (key !== lastKey) { lastKey = key; renderTutor(); }
    renderFeed();
  }

  function open() {
    if (!overlay) build();
    overlay.hidden = false; tick = 0; lastKey = ''; renderAll();
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    var b = $('#c2-toggle'); if (b) b.classList.remove('c2-new');
    timer = setInterval(function () { tick++; renderAll(); }, 1500);
    setTimeout(function () { var c = $('#c2-close'); if (c) c.focus(); }, 60);
  }
  function close() { if (!overlay) return; overlay.hidden = true; clearInterval(timer); var b = $('#c2-toggle'); if (b) b.focus(); }

  function init() {
    var btn = $('#c2-toggle'); if (!btn) return;
    var seen = false; try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}
    if (!seen) btn.classList.add('c2-new');
    btn.addEventListener('click', open);
    watchTerminal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  // API mínima para pruebas manuales
  window.KC_C2 = { open: open, close: close };
})();
