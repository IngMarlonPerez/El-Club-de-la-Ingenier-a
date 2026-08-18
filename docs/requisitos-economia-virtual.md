# Sistema de Economía Virtual — "Operación Laboratorio-B"
### Ingeniería de requisitos + Mega-prompt de implementación

---

## 0. Resumen de investigación (inspiración externa)

Antes de definir requisitos, revisé cómo diseñan su economía los juegos idle/incremental y los sistemas de progresión tipo RPG, porque tu caso (ganar moneda por misión → gastarla en mejoras que aceleran/desbloquean nuevas misiones) es estructuralmente el mismo patrón:

- **Regla de faucet/sink (fuente/sumidero):** todo lo que el juego "imprime" (moneda ganada) debe tener un destino que lo "destruye" (gasto). Si la fuente supera al sumidero de forma sostenida, la economía se infla y las mejoras dejan de sentirse especiales. Esta regla aparece de forma consistente tanto en guías de diseño de economías idle como en frameworks de balanceo tipo "Progression / Engagement / Prestige sinks", donde cada sumidero absorbe un recurso distinto (moneda blanda ≈ tiempo, energía ≈ sesión, prestigio ≈ tu progreso acumulado).
- **Curva "costos exponenciales, ingresos lineales":** es el patrón natural de los juegos incrementales (Cookie Clicker, AdVenture Capitalist, Clicker Heroes) — cada mejora sucesiva cuesta más que la anterior en una proporción fija, mientras que lo que ganas por misión crece de forma mucho más suave. Esto evita que un jugador "rompa" la economía comprando todo temprano.
- **Modelo de dos monedas:** moneda "blanda" (ganada jugando, abundante) + moneda "dura" (escasa, ligada a logros importantes) es un patrón estándar para separar progresión rutinaria de hitos narrativos importantes — lo vas a necesitar para diferenciar "moneda por completar un nivel" de "moneda por completar un episodio entero sin pistas".
- **Nunca vender poder directamente en un contexto real de dinero:** como tu juego es 100% educativo y sin dinero real, esto no aplica a monetización, pero el principio se traduce a "no rompas el balance pedagógico" — una mejora no debería nunca sustituir el aprendizaje real del comando, solo acelerar o dar comodidad (ver RF-09).
- **Tech tree como grafo acíclico dirigido (DAG):** los árboles de mejoras/tecnología en juegos de estrategia (Civilization, StarCraft, Master of Orion) son grafos donde cada nodo requiere nodos previos desbloqueados. Es el patrón correcto para modelar "RAM Nivel 2 requiere RAM Nivel 1", o "Servidor Propio requiere GPU Nivel 3 + Episodio 4 completado". Hay herramientas open-source (p. ej. generadores de skill-map en TOML, librerías de renderizado de árboles de habilidades en React) que usan exactamente este modelo de datos.
- **Diseño "closed-loop":** simular el total de moneda en circulación contra 100 horas de juego en una hoja de cálculo *antes* de programar es la práctica recomendada por guías de balanceo de economías idle — lo incorporo como requisito (RNF-08).

Estos patrones (no el código en sí) son la base de las secciones 2 y 3.

---

## 1. Contexto del sistema (resumen para quien lo implemente)

"Operación Laboratorio-B" es un juego educativo de ciberseguridad basado en terminal, con **31 niveles agrupados en 7 episodios narrativos** (reconocimiento → defensa/respuesta → DDoS → forense digital → pentesting autorizado → gobierno ISO 27001 → capstone de auditoría datacenter+nube). Cada nivel enseña comandos reales de Linux/seguridad mediante instrucción + pista + ejemplo. Todo el contenido de red/empresas/instituciones dentro del juego es ficticio.

**Lo que falta y se va a agregar:** una capa de progresión con moneda virtual ficticia ("ByteCoin", símbolo ₿C) que el jugador gana al resolver misiones, y que puede gastar en mejoras de **hardware simulado** (RAM, CPU, GPU, almacenamiento, servidores propios) y en **infraestructura ofensiva simulada dentro del laboratorio ficticio** (por ejemplo, más "nodos" de escaneo paralelo, cluster de fuerza bruta simulado, etc. — ver nota ética en RF-12) que aceleran o desbloquean variantes de los retos existentes.

---

## 2. Requisitos funcionales (RF)

### 2.1 Moneda y wallet
- **RF-01.** El sistema debe tener una moneda virtual única llamada **ByteCoin (₿C)**, sin ningún vínculo a dinero real, blockchain real o exchange real (ficticia al 100%, coherente con el resto del juego).
- **RF-02.** Cada jugador tiene una **wallet persistente** con: saldo actual, historial de transacciones (ganancia/gasto, timestamp, motivo), y saldo total ganado histórico (para logros tipo "millonario").
- **RF-03.** Opcional (recomendado por el patrón de dos monedas): una segunda moneda **"Reputación del Club" (REP)**, no gastable en tienda, que se gana solo al completar un *episodio* completo y que actúa como *prestigio* — desbloquea cosméticos de perfil (insignias, título, avatar) y sirve de "leaderboard" del club, separada de la moneda de compra para no mezclar progresión rutinaria con hitos narrativos.

### 2.2 Generación de moneda (faucets)
- **RF-04.** Cada nivel completado otorga una recompensa base en ₿C, escalada por episodio (los episodios más avanzados otorgan más, ver tabla de balanceo en Sección 3.2).
- **RF-05.** Bonificaciones sobre la recompensa base:
  - Completar sin pedir pistas: **+X %**
  - Completar sin errores de comando (o bajo umbral de errores): **+X %**
  - Completar por debajo de un tiempo objetivo: **+X %**
  - Primera vez que se completa el nivel (evita farmear rejugando indefinidamente el mismo nivel de forma idéntica — ver RF-08): bono completo; repeticiones posteriores otorgan una fracción reducida.
- **RF-06.** Logros/hitos especiales (completar un episodio, completar el juego, rachas de días jugando) otorgan ₿C y/o REP en un monto fijo, no escalado.
- **RF-07.** Un "desafío diario" opcional (una variante corta de un nivel ya desbloqueado) otorga una recompensa pequeña, para dar una fuente de ingreso sin depender de avanzar niveles nuevos.

### 2.3 Anti-inflación / anti-exploit
- **RF-08.** Rejugar un nivel ya completado debe otorgar **una fracción reducida** de la recompensa original (p. ej. 15–25 %), con un tope diario de ₿C ganable por rejugadas, para evitar farmeo infinito que rompa la curva de costos.
- **RF-09.** Ninguna mejora comprada con ₿C puede **saltarse** la resolución real del reto (por ejemplo, "auto-resolver nivel" está prohibido). Las mejoras solo pueden: (a) dar pistas adicionales, (b) acelerar procesos simulados en pantalla (ej. una barra de progreso de "escaneo" más rápida), o (c) desbloquear rutas alternativas/variantes de nivel. Esto preserva el valor pedagógico (alineado con el principio de "no vender poder que sustituya el aprendizaje").
- **RF-10.** El saldo y las transacciones se validan y calculan **en el servidor/backend** (o en el store de estado autoritativo si es una app sin backend), nunca confiando en un valor enviado por el cliente — coherente e irónico con que el propio juego enseña por qué la validación del lado del servidor importa.

### 2.4 Tienda / árbol de mejoras (tech tree)
- **RF-11.** Modelo de datos tipo **grafo acíclico dirigido (DAG)**: cada mejora tiene `id`, `categoría`, `nivel_requerido` (rango 1–5 típico), `prerequisitos` (otras mejoras y/o episodio mínimo completado), `costo_ByteCoin`, `efecto` y `descripción_narrativa`.
- **RF-12.** Categorías de mejora sugeridas (todas son *representaciones simuladas dentro del laboratorio ficticio*, nunca herramientas reales funcionales fuera del juego):
  | Categoría | Ejemplo de efecto en el juego |
  |---|---|
  | RAM | Reduce el tiempo simulado de "carga" de comandos pesados (ej. escaneos largos) |
  | CPU | Reduce tiempo simulado de comandos de cómputo intensivo (crackeo de hash simulado, `aircrack-ng` del Nivel 2) |
  | GPU | Desbloquea una variante de nivel con diccionario más grande en retos de fuerza bruta simulada |
  | Almacenamiento | Aumenta el número de "capturas"/evidencias que se pueden guardar en el inventario del jugador (forense) |
  | Servidor propio | Desbloquea un "sandbox" para repetir niveles anteriores en modo libre sin afectar el progreso de la historia |
  | Nodo de escaneo distribuido *(ficticio)* | Acelera visualmente el escaneo de puertos/red en niveles de reconocimiento; **nunca** se explica ni se referencia como una botnet real ni se enseña cómo construir una — es una animación de "más nodos trabajando en paralelo" dentro del laboratorio ficticio del club |
  | Cosméticos | Temas de terminal, avatar, insignias — comprables con REP, no con ₿C |

  > ⚠️ **Nota de diseño importante:** evita el término "botnet" en la interfaz y en el copy del juego. Aunque la idea (más "poder de cómputo simulado" para acelerar retos) es válida y common en juegos de hacking ficticios (ver *Hacknet*, *Uplink*, *Hacker's Type*), la palabra "botnet" implica una red de máquinas comprometidas sin consentimiento — un concepto real y dañino que no conviene normalizar ni gamificar con ese nombre, incluso en un contexto ficticio y educativo. Usa un nombre in-universe propio del club (ej. **"Clúster del Club"**, **"Nodo Aliado"**, **"Red de Voluntarios del Club"**) que transmita la misma mecánica (más nodos = más rápido) sin usar terminología de ataque real. Esto es coherente con el propio tono del documento base, que ya evita glorificar técnicas ofensivas y las enmarca siempre bajo autorización y ética.
- **RF-13.** La tienda muestra: mejoras disponibles (cumplen prerequisitos), mejoras bloqueadas (con motivo visible: "Requiere Episodio 4" o "Requiere GPU Nivel 2"), y mejoras ya compradas.
- **RF-14.** Cada mejora comprada debe reflejarse visualmente en un **"panel de laboratorio" persistente** (ej. una sala/rack que va creciendo) para dar sensación de progreso tangible, no solo un número que sube.

### 2.5 Progresión y balance
- **RF-15.** Costo de cada mejora dentro de una misma categoría sigue una **curva exponencial** (`costo_n = costo_base × factor^n`, factor sugerido 1.4–1.8) mientras que la recompensa por nivel crece de forma **lineal o logarítmica** por episodio — para asegurar que comprar todo de una vez nunca sea posible ni óptimo.
- **RF-16.** Debe existir una **hoja de balance simulable** (spreadsheet o script) que modele 100 "sesiones" de juego típicas contra la curva de costos antes de fijar los números finales en producción (ver RNF-08).

### 2.6 Historial, transparencia y aprendizaje reflexivo
- **RF-17.** El historial de transacciones debe ser visible al jugador en todo momento (tabla simple: fecha, motivo, +/− ₿C, saldo resultante) — refuerza el concepto de "log de auditoría" que el propio juego enseña en el Episodio 4 (forense) y Episodio 6 (gobierno ISO 27001): es un guiño pedagógico intencional.
- **RF-18.** Al final del juego (Nivel 31), el informe final del jugador (ya contemplado en el documento base) debe incluir un resumen de su economía: ₿C totales ganados, mejoras adquiridas, REP acumulada — como parte del "reconocimiento" narrativo ya diseñado.

---

## 3. Requisitos no funcionales (RNF)

### 3.1 General
- **RNF-01 (Persistencia).** El progreso, wallet e historial deben persistir entre sesiones (localStorage/IndexedDB si es cliente puro, o backend con base de datos si hay servidor). **Nota para artifacts de Claude:** si se implementa como artifact React/HTML dentro de Claude, no se puede usar `localStorage`/`sessionStorage` — usar el sistema de `window.storage` (persistente) o estado en memoria si es solo una demo.
- **RNF-02 (Integridad de datos / anti-cheat).** El saldo nunca debe poder volverse negativo ni ser editable directamente desde la consola del navegador sin pasar por las funciones de negocio (validación de reglas antes de cada transacción).
- **RNF-03 (Rendimiento).** La tienda y el árbol de mejoras (potencialmente 30–60 nodos) deben renderizar sin lag perceptible en un dispositivo de gama media; las animaciones de progreso simulado (barras de carga, etc.) no deben bloquear el hilo principal.
- **RNF-04 (Accesibilidad).** Toda la interfaz de economía (tienda, wallet, árbol) debe ser navegable por teclado y con etiquetas legibles por lector de pantalla; contraste de color AA mínimo, especialmente en indicadores de "bloqueado/desbloqueado".
- **RNF-05 (Localización).** Todos los textos de economía en español neutro (Ecuador como contexto principal), con estructura de strings externalizada por si se traduce a inglés después.
- **RNF-06 (Privacidad).** Si hay backend con cuentas de usuarios (posiblemente estudiantes menores de edad en contexto de club escolar/universitario), no recolectar datos personales innecesarios; cumplir buenas prácticas equivalentes a protección de datos de menores (mínima recolección, sin publicidad, sin compartir datos con terceros).
- **RNF-07 (Escalabilidad).** El modelo de datos de mejoras (DAG) debe poder crecer de 20 a 100+ nodos sin cambios estructurales — usar configuración externa (JSON/TOML), no hardcodear en el componente de UI.
- **RNF-08 (Balanceabilidad / testeable).** Los parámetros económicos (recompensas base, factor de curva exponencial, bonos) deben vivir en un archivo de configuración único y documentado, para poder simular y ajustar el balance sin tocar lógica de negocio.
- **RNF-09 (Consistencia narrativa).** Todo elemento de economía debe mantener el marco de ficción ya establecido en el documento base (`[LAB-FICTICIO]`), evitar terminología que normalice actividad maliciosa real (ver RF-12), y mantener el mismo tono ético del resto del juego (autorización explícita, consecuencias realistas).
- **RNF-10 (Compatibilidad con el modo "sin IA").** El sistema de economía debe funcionar completamente sin requerir llamadas al asistente de IA del juego — es una capa de datos/UI local, no debe consumir la cuota diaria de IA mencionada en el documento base.
- **RNF-11 (Reversibilidad / soporte).** Debe existir una función de "reset de wallet" (solo accesible a un admin/profesor del club, no al jugador) para casos de bug o abuso, con confirmación explícita.

---

## 4. Modelo de datos sugerido (referencia rápida)

```json
// wallet.json (por jugador)
{
  "player_id": "string",
  "bytecoin_balance": 0,
  "bytecoin_lifetime_earned": 0,
  "reputation_balance": 0,
  "transactions": [
    { "id": "tx_001", "timestamp": "ISO8601", "type": "earn|spend",
      "amount": 0, "reason": "nivel_completado|mejora_comprada|bono_racha|...",
      "reference_id": "nivel_07|mejora_ram_02" }
  ],
  "upgrades_owned": ["mejora_ram_01", "mejora_cpu_01"]
}

// upgrades.json (catálogo global, DAG)
{
  "id": "mejora_ram_02",
  "categoria": "RAM",
  "nombre": "Módulo RAM — 16GB",
  "nivel": 2,
  "prerequisitos": { "mejoras": ["mejora_ram_01"], "episodio_minimo": 2 },
  "costo_bytecoin": 450,
  "efecto": { "tipo": "reduce_tiempo_simulado", "valor_pct": 20, "aplica_a": ["nivel_04","nivel_05","nivel_06"] },
  "descripcion": "..."
}
```

---

## 5. Mega-prompt listo para usar

Copia y pega el siguiente prompt completo en la herramienta con la que vayas a implementar el sistema (Claude Code, Cursor, otro LLM, o como especificación para un equipo humano). Está escrito para ser autocontenido.

```
Eres un/a ingeniero/a de software senior especializado/a en diseño de juegos educativos y sistemas de economía virtual. Vas a implementar la capa de "Economía Virtual" del juego "Operación Laboratorio-B", un juego educativo de ciberseguridad de 31 niveles / 7 episodios basado en retos de terminal Linux, dirigido a estudiantes de un club de ingeniería (desde secundaria hasta universidad, en Ecuador). Todo el contenido narrativo del juego (empresas, IPs, instituciones) es ficticio y así debe mantenerse.

CONTEXTO DEL JUEGO BASE (no lo modifiques, solo intégrate con él):
- 31 niveles agrupados en 7 episodios: (1) Reconocimiento, (2) Defensa y Respuesta, (3) Defensa contra DDoS, (4) Análisis Forense Digital, (5) Pentesting Web Autorizado, (6) Gobierno ISO 27001, (7) Capstone Datacenter+Nube.
- Cada nivel tiene: objetivo, teoría aplicada, comandos clave (tabla), y una nota "en el mundo real".
- El juego ya tiene un asistente de IA integrado con cuota diaria limitada — el sistema de economía NO debe depender de llamadas a ese asistente.

TU TAREA: diseñar e implementar el sistema de moneda virtual "ByteCoin (₿C)" y la tienda de mejoras ("tech tree"), siguiendo ESTRICTAMENTE estos requisitos:

REQUISITOS FUNCIONALES:
1. Moneda ficticia ByteCoin (₿C), sin ningún vínculo a dinero real ni criptomonedas reales. Wallet persistente por jugador con saldo, historial de transacciones y total histórico ganado.
2. Moneda secundaria opcional "Reputación del Club (REP)" ganada solo al completar episodios completos, usada para cosméticos/leaderboard, nunca para comprar poder.
3. El jugador gana ₿C al completar cada nivel: recompensa base escalada por episodio + bonos (sin pistas, sin errores, bajo tiempo objetivo). Primera vez completado = recompensa completa; rejugadas = 15-25% de la recompensa, con tope diario para evitar farmeo.
4. Tienda de mejoras estructurada como grafo acíclico dirigido (DAG): cada mejora tiene id, categoría, nivel (1-5), prerequisitos (mejoras previas + episodio mínimo), costo en ₿C, efecto y descripción narrativa. Categorías: RAM, CPU, GPU, Almacenamiento, Servidor Propio (desbloquea modo sandbox de niveles pasados), "Clúster del Club" (nodo de cómputo simulado que acelera escaneos — IMPORTANTE: nunca lo llames "botnet" ni le des funcionalidad de ataque real; es una animación/mecánica de "más nodos trabajando en paralelo" dentro del laboratorio ficticio del club), y Cosméticos (comprables solo con REP).
5. Las mejoras SOLO pueden: dar pistas adicionales, acelerar animaciones/tiempos simulados en pantalla, o desbloquear variantes/modo sandbox. NUNCA deben permitir "autoresolver" un reto ni saltarse la resolución real del comando — el valor pedagógico del juego es la prioridad sobre la gratificación de la economía.
6. Curva de costos exponencial por categoría (costo_n = costo_base × factor^n, factor sugerido 1.4-1.8), con recompensas por nivel creciendo de forma lineal/logarítmica — de modo que nunca sea óptimo ni posible comprar todo de una vez.
7. Toda validación de saldo y transacciones ocurre en la capa de lógica de negocio/backend, nunca confiando en valores enviados desde la UI del cliente.
8. Panel de "laboratorio" visual persistente que refleje las mejoras compradas (no solo un contador numérico).
9. Historial de transacciones visible al jugador en todo momento (tabla: fecha, motivo, monto, saldo resultante).
10. Al completar el nivel 31, el informe final del jugador debe incluir un resumen de su economía (₿C ganados, mejoras adquiridas, REP acumulada).

REQUISITOS NO FUNCIONALES:
1. Persistencia entre sesiones (usa el mecanismo de almacenamiento persistente disponible en tu entorno de implementación; si es un artifact web sin backend, usa almacenamiento clave-valor persistente en vez de localStorage/sessionStorage, que no está soportado en algunos entornos de artifacts).
2. El saldo nunca puede quedar negativo ni ser editable fuera de las funciones de negocio oficiales.
3. Renderizado fluido del árbol de mejoras con 30-60+ nodos sin lag perceptible; animaciones de progreso que no bloqueen el hilo principal.
4. Accesibilidad: navegación por teclado, etiquetas para lector de pantalla, contraste AA mínimo, especialmente en estados bloqueado/desbloqueado.
5. Todo el texto en español neutro (contexto Ecuador), con strings externalizados para facilitar traducción futura.
6. Si hay backend con cuentas de usuario, recolecta el mínimo de datos personales posible (posibles usuarios menores de edad), sin publicidad ni compartición con terceros.
7. El catálogo de mejoras (DAG) debe vivir en un archivo de configuración externo (JSON/TOML), no hardcodeado en componentes de UI, para poder escalar de 20 a 100+ nodos sin refactor.
8. Todos los parámetros económicos (recompensas base, factor exponencial, bonos, topes de farmeo) deben vivir en un único archivo de configuración documentado, pensado para poder simular 100 sesiones de juego y ajustar el balance antes de publicar.
9. Mantén el marco de ficción ya establecido (`[LAB-FICTICIO]`) y el tono ético del juego base (autorización explícita, consecuencias realistas, nunca glorificar ataques reales) en todo texto, nombre de mejora y descripción que generes.
10. El sistema de economía debe funcionar sin ninguna llamada al asistente de IA del juego.
11. Incluye una función de reset de wallet accesible solo a un rol admin/profesor, con confirmación explícita, para casos de bug o abuso.

ENTREGABLES ESPERADOS:
1. Modelo de datos (wallet + catálogo de mejoras en JSON) siguiendo el esquema de referencia que te voy a pasar.
2. Lógica de negocio (funciones puras, testeables) para: calcular recompensa de nivel, validar y ejecutar compra de mejora, validar prerequisitos del DAG, aplicar límites anti-farmeo.
3. Componentes de UI: Wallet/balance visible, Historial de transacciones, Árbol de mejoras (vista tipo DAG con nodos bloqueados/disponibles/comprados), Panel de laboratorio visual, Resumen económico en el informe final del Nivel 31.
4. Una hoja/script de balanceo (puede ser una función que simule N sesiones de juego) para validar que la curva de costos vs. recompensas no genera inflación descontrolada ni estancamiento.
5. Documentación breve de cómo agregar una nueva mejora al catálogo sin tocar código de lógica de negocio.

Antes de escribir cualquier código, dame primero: (a) el árbol de mejoras completo propuesto (todas las categorías, niveles 1-5 cada una, costos sugeridos), y (b) la tabla de recompensas base por episodio, para que yo las apruebe antes de implementar.
```

---

## 6. Notas finales

- El mega-prompt de la sección 5 está pensado para pegarse completo en Claude Code, Cursor, o cualquier LLM/IDE de tu preferencia — es autocontenido y no depende de que la otra herramienta haya leído este documento.
- Si quieres, en un siguiente paso puedo generarte directamente el **catálogo de mejoras completo en JSON** (con las 5-6 categorías, niveles 1-5, costos calculados con la curva exponencial) o un **prototipo funcional del árbol de mejoras** como artifact interactivo, para que veas la mecánica antes de dársela a implementar por otra herramienta.
