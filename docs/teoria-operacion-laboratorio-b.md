# Teoría Aplicada — Operación Laboratorio-B

Este documento acompaña al reto de terminal Linux del Club de la Ingeniería ([`/linux-cli.html`](../public/linux-cli.html)). No es un manual de comandos: es la **teoría aplicada** detrás de cada nivel, para que cualquier persona pueda estudiar un tema específico sin necesidad de jugar o de preguntarle a la IA del juego (lo que además ayuda a cuidar la cuota diaria del asistente).

**Cómo usar esto:** si vas a jugar un nivel, lee su sección antes o después de completarlo. Si solo quieres aprender un concepto puntual (¿qué es IAM? ¿cómo funciona una cadena de custodia?), usa el índice y ve directo ahí. Todo el contenido técnico es real y aplicable fuera del juego; los datos, IPs, empresas e instituciones dentro del juego son 100% ficticios ([LAB-FICTICIO]).

## Índice

- [Episodio 1 — Fundamentos de Reconocimiento](#episodio-1--fundamentos-de-reconocimiento-niveles-1-2) (Niveles 1-2)
- [Episodio 2 — Defensa y Respuesta](#episodio-2--defensa-y-respuesta-niveles-3-6) (Niveles 3-6)
- [Episodio 3 — Defensa contra DDoS](#episodio-3--defensa-contra-ddos-niveles-7-10) (Niveles 7-10)
- [Episodio 4 — Análisis Forense Digital](#episodio-4--análisis-forense-digital-niveles-11-13) (Niveles 11-13)
- [Episodio 5 — Pentesting Web Autorizado](#episodio-5--pentesting-web-autorizado-niveles-14-17) (Niveles 14-17)
- [Episodio 6 — Gobierno de la Seguridad (ISO 27001)](#episodio-6--gobierno-de-la-seguridad-iso-27001-niveles-18-21) (Niveles 18-21)
- [Episodio 7 — Rescate: Datacenter y Nube](#episodio-7--rescate-datacenter-y-nube-niveles-22-31) (Niveles 22-31)
- [Glosario rápido](#glosario-rápido)
- [Para profundizar](#para-profundizar)

---

## Episodio 1 — Fundamentos de Reconocimiento (Niveles 1-2)

El reconocimiento es la primera fase de cualquier evaluación de seguridad, ofensiva o defensiva: **no puedes proteger (ni evaluar) lo que no conoces**. Esta fase responde preguntas básicas — ¿qué hay ahí?, ¿qué versión corre?, ¿qué está expuesto? — antes de actuar.

### Nivel 1 — Reconocimiento

**🎯 Objetivo:** aprender a moverte en una terminal Linux y a hacer un escaneo básico de red.

**📖 Teoría aplicada:**
Todo sistema Linux organiza su información en una jerarquía de archivos navegable con comandos simples. Antes de escanear una red hay que saber ubicarse en el propio sistema — de ahí que el nivel empiece con `pwd`, `ls` y `cat`, no con herramientas de red.

El escaneo de puertos (con `nmap`) es la técnica central de reconocimiento en redes: cada "puerto abierto" es un servicio escuchando conexiones. Sin el flag `-sV`, `nmap` solo dice si un puerto está abierto o cerrado; con `-sV` intenta identificar la versión exacta del software detrás de ese puerto — y las versiones antiguas o sin parchar son, con frecuencia, la vulnerabilidad en sí. Este es el mismo principio que vas a repetir en el Nivel 14 (reconocimiento web) y en el Nivel 25 (auditoría de IAM en la nube): **identificar antes de actuar**.

**🛠 Comandos clave:**

| Comando | Qué hace | Por qué importa |
|---|---|---|
| `pwd` | Muestra el directorio actual | Orientarte es el primer paso de cualquier tarea en terminal |
| `ls` / `ls -a` | Lista archivos (incluidos ocultos con `-a`) | Los archivos que empiezan con `.` están ocultos por convención, no por seguridad real |
| `cat archivo` | Muestra el contenido de un archivo | La forma más simple de leer configuración, logs o notas |
| `ping <ip>` | Verifica si un host responde | Confirmación básica de conectividad antes de escanear |
| `nmap <ip>` | Escanea puertos abiertos | Reconocimiento de superficie de ataque/evaluación |
| `nmap -sV <ip>` | Escanea puertos y detecta versiones | Las versiones desactualizadas son la vulnerabilidad más común y más fácil de encontrar |

**💡 En el mundo real:** `nmap` es la herramienta de reconocimiento de red más usada en la industria, tanto por equipos de seguridad ofensiva (pentesters) como defensiva (para inventariar su propia red). Escanear una red que no es tuya, sin autorización, es ilegal en la gran mayoría de países — exactamente el aviso que el juego muestra al inicio.

### Nivel 2 — Infiltración WiFi

**🎯 Objetivo:** entender el proceso de auditoría de seguridad WiFi (WPA/WPA2) de punta a punta.

**📖 Teoría aplicada:**
Las redes WiFi protegidas con WPA/WPA2-PSK dependen de una contraseña compartida. La forma estándar de auditar esa contraseña no es "adivinarla en el aire": es capturar el **4-way handshake** — el intercambio criptográfico que ocurre cuando un dispositivo se conecta al punto de acceso — y luego intentar reproducirlo offline contra un diccionario de contraseñas candidatas.

El flujo tiene una lógica clara: `airmon-ng` pone la tarjeta de red en **modo monitor** (deja de comportarse como cliente normal y empieza a "escuchar" todo el tráfico del aire, no solo el dirigido a ti). `airodump-ng` usa ese modo para mapear las redes cercanas. Una vez identificado el objetivo, una captura dirigida se enfoca en un solo canal/BSSID para no perder paquetes. El paso de `aireplay-ng --deauth` fuerza una **reconexión** de un cliente ya conectado — como el handshake solo ocurre al conectarse, forzar una reconexión (breve y molesta, de ahí el recordatorio ético del juego) acelera capturarlo en vez de esperar pasivamente. Finalmente, `aircrack-ng` prueba cada palabra del diccionario contra el handshake capturado hasta encontrar la que genera las mismas claves criptográficas.

**🛠 Comandos clave:**

| Comando | Qué hace | Por qué importa |
|---|---|---|
| `iwconfig` | Lista interfaces WiFi | Punto de partida: saber qué adaptador tienes |
| `airmon-ng start wlan0` | Activa modo monitor | Sin esto no puedes capturar tráfico ajeno al tuyo |
| `airodump-ng` | Escanea redes cercanas | Reconocimiento de objetivos WiFi |
| `aireplay-ng --deauth` | Fuerza una reconexión | Acelera la captura del handshake (**solo con autorización explícita**) |
| `aircrack-ng -w wordlist` | Prueba un diccionario contra el handshake | Auditoría de fortaleza de contraseña |

**💡 En el mundo real:** esta es la misma metodología que certificaciones como OSCP o cursos de seguridad WiFi enseñan formalmente. La contraseña `wifi12345` del juego es intencionalmente débil para ilustrar por qué las contraseñas cortas y predecibles son inseguras incluso con buen cifrado detrás — el cifrado protege el canal, no compensa una contraseña mala.

---

## Episodio 2 — Defensa y Respuesta (Niveles 3-6)

Este episodio cambia de sombrero: de encontrar debilidades a **construir defensas y responder cuando algo falla**. Es el corazón de lo que hace un analista de seguridad defensivo (blue team) en el día a día.

### Nivel 3 — Comunicación Segura

**🎯 Objetivo:** entender autenticación y cifrado real: SSH, GPG y VPN (WireGuard).

**📖 Teoría aplicada:**
Hay una diferencia crucial entre **cifrar** (que nadie más pueda leer el contenido) y **autenticar** (confirmar que eres quien dices ser). SSH con llaves resuelve ambos: en vez de una contraseña que se puede adivinar o filtrar, usas un par de llaves criptográficas (`ssh-keygen`) — la privada nunca sale de tu máquina, la pública se copia al servidor (`ssh-copy-id`). El servidor te reconoce porque puedes demostrar matemáticamente que tienes la privada, sin transmitirla nunca.

GPG (GNU Privacy Guard) implementa cifrado de clave pública para mensajes: cualquiera puede cifrar un mensaje con tu llave pública, pero solo tú (con tu llave privada) puedes descifrarlo. WireGuard es una VPN moderna: crea un túnel cifrado entre dos puntos, de forma que todo el tráfico que pasa por ahí queda protegido de quien esté escuchando la red intermedia.

El punto pedagógico central de este nivel: la palabra "seguro" en ciberseguridad significa **cifrado y autenticado con herramientas estándar y auditadas**, no "oculto" o "invisible". Ocultar tráfico no es lo mismo que protegerlo.

**🛠 Comandos clave:**

| Comando | Qué hace | Por qué importa |
|---|---|---|
| `ssh-keygen -t ed25519` | Genera un par de llaves SSH | Autenticación sin contraseñas transmitidas |
| `ssh-copy-id usuario@host` | Copia tu llave pública al servidor | Habilita el login por llave |
| `ssh usuario@host` | Conexión remota cifrada | Reemplaza protocolos antiguos sin cifrado (como telnet) |
| `gpg --gen-key` | Genera un par de llaves GPG | Base del cifrado de extremo a extremo |
| `gpg --encrypt --recipient <a> archivo` | Cifra un archivo para un destinatario específico | Solo el destinatario puede leerlo |
| `wg genkey` / `wg-quick up` | Genera llaves y levanta un túnel WireGuard | VPN moderna, cifrado de todo el tráfico del túnel |

**💡 En el mundo real:** SSH con llaves (y contraseñas deshabilitadas) es la configuración recomendada en cualquier servidor de producción. GPG sigue siendo el estándar para firmar commits de Git y cifrar correo sensible. WireGuard es hoy el protocolo VPN más usado por su simplicidad y rendimiento frente a alternativas como OpenVPN o IPsec.

### Nivel 4 — Detección

**🎯 Objetivo:** aprender a detectar actividad maliciosa activa en un sistema (blue team).

**📖 Teoría aplicada:**
La detección combina varias fuentes de evidencia porque ninguna por sí sola es concluyente. `netstat`/`ss` muestra conexiones de red activas — un proceso desconocido con una conexión saliente a una IP rara es una señal. `ps aux` lista procesos en ejecución — un proceso corriendo desde `/tmp` (una carpeta temporal, no un lugar típico para software legítimo) es otra señal. `lsof -p <pid>` muestra qué archivos y sockets tiene abiertos un proceso específico — puede revelar que el binario que lo generó ya fue borrado del disco (una táctica común para dificultar el análisis forense posterior).

Los logs del sistema (`/var/log/auth.log` y similares) registran eventos de autenticación y tareas programadas — correlacionar "¿cuándo apareció este proceso?" con "¿qué evento del sistema coincide con esa hora?" es análisis de log básico. `tcpdump` captura tráfico de red en vivo: un patrón de conexión regular cada X segundos (un "beacon") es la huella típica de un canal de control automatizado. Finalmente, `sha256sum` calcula un hash del binario sospechoso para compararlo contra una base de firmas conocidas (inteligencia de amenazas) — así se confirma si es una amenaza documentada o algo nuevo.

**🛠 Comandos clave:**

| Comando | Qué hace | Por qué importa |
|---|---|---|
| `netstat -tulpn` / `ss -tulpn` | Lista conexiones y puertos activos | Revela comunicación de red sospechosa |
| `ps aux` | Lista procesos en ejecución | Encuentra procesos que no deberían estar ahí |
| `lsof -p <pid>` | Archivos/sockets abiertos por un proceso | Revela IPs remotas y binarios borrados |
| `cat /var/log/auth.log` | Revisa el log de autenticación | Correlaciona eventos con la línea de tiempo |
| `tcpdump -i <interfaz>` | Captura tráfico en vivo | Detecta patrones de comunicación anómalos |
| `sha256sum <archivo>` | Calcula el hash de un binario | Lo compara contra amenazas conocidas |

**💡 En el mundo real:** este flujo (red → procesos → archivos → logs → tráfico → hash) es, en esencia, lo que hace un analista de SOC (Security Operations Center) en una investigación de nivel 1-2, y lo que automatizan parcialmente los EDR (Endpoint Detection and Response) modernos.

### Nivel 5 — Respuesta a Incidentes

**🎯 Objetivo:** aplicar el ciclo formal de respuesta a incidentes.

**📖 Teoría aplicada:**
Detectar una amenaza no es lo mismo que resolverla bien. El estándar de facto (NIST SP 800-61) define un ciclo: **preparación → detección y análisis → contención, erradicación y recuperación → lecciones aprendidas**. Este nivel practica la parte de contención/erradicación/recuperación:

- **Contener** (`ip link set eth0 down`) aísla el sistema de la red *antes* de tocar nada más — evita que el atacante reaccione o que el daño se propague mientras investigas.
- **Erradicar** significa eliminar tanto la amenaza activa (`kill -9`, borrar el binario) como su **persistencia** — el mecanismo que la relanzaría automáticamente (una entrada en `crontab`, por ejemplo). Erradicar solo el proceso sin quitar la persistencia es un error común: el "problema resuelto" vuelve solo, minutos después.
- **Recuperar** implica corregir la causa que permitió la entrada (`apt upgrade` sobre el software vulnerable) y reconectar el sistema solo cuando está limpio y parchado, verificando al final que no queda nada sospechoso.

**🛠 Comandos clave:**

| Comando | Qué hace | Por qué importa |
|---|---|---|
| `ip link set eth0 down` / `up` | Aísla o reconecta el sistema | Contención antes de investigar más a fondo |
| `kill -9 <pid>` | Termina un proceso | Elimina la amenaza activa |
| `rm -f <archivo>` | Elimina un archivo | Quita el binario malicioso del disco |
| `crontab -l` / `-r` | Lista o elimina tareas programadas | La persistencia es lo que hace que "resuelto" no dure |
| `apt upgrade <paquete>` | Actualiza el software vulnerable | Corrige la causa, no solo el síntoma |

**💡 En el mundo real:** saltarse el orden (por ejemplo, borrar el malware antes de aislar el sistema, o "limpiar" sin quitar la persistencia) es de los errores más comunes en respuesta a incidentes real, y suele terminar en una reinfección minutos después de dar el caso por cerrado.

### Nivel 6 — Simulacro de Incidente

**🎯 Objetivo:** aplicar de punta a punta, sin ayuda escalonada, todo lo de los niveles 1 a 5 en un escenario nuevo.

**📖 Teoría aplicada:** no hay teoría nueva aquí — es la evaluación práctica de todo el episodio: reconocimiento (Nivel 1) + comunicación segura (Nivel 3) + detección (Nivel 4) + respuesta (Nivel 5), contra un servidor distinto, bajo presión de tiempo. Repasa esas secciones si necesitas refrescar algún comando.

---

## Episodio 3 — Defensa contra DDoS (Niveles 7-10)

### Contexto general del episodio

Un ataque de **Denegación de Servicio Distribuida (DDoS)** intenta saturar un servicio con tráfico desde muchas fuentes hasta dejarlo inaccesible para usuarios legítimos. No hay una sola defensa que lo resuelva: se combinan capas (detección, bloqueo manual de emergencia, límites automáticos permanentes) porque cada capa cubre lo que la anterior no alcanza a tiempo.

### Nivel 7 — Bajo Ataque (Detección)

**📖 Teoría aplicada:** antes de reaccionar hay que confirmar qué está pasando. `uptime` revela una carga (load average) anormalmente alta — el primer síntoma visible. `ss -s` cuantifica cuántas conexiones simultáneas hay (miles, en un ataque volumétrico, muy por encima de lo normal). El análisis del log de acceso (`access.log`) con una tubería `awk | sort | uniq -c | sort -nr` es la técnica clásica de análisis de logs: cuenta cuántas peticiones vienen de cada IP y ordena de mayor a menor — si 2-3 IPs concentran más del 90% del tráfico, no son usuarios reales, es un flood.

**🛠 Comandos clave:** `uptime`, `systemctl status`, `ss -s`, `cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head`, `whois <ip>`, `grep <ip> access.log | wc -l`.

**💡 Mundo real:** esta secuencia de comandos (carga → conexiones → análisis de log) es literalmente el primer triage que hace cualquier SRE/DevOps cuando un sitio se cae sin causa aparente, DDoS o no.

### Nivel 8 — Mitigación de Emergencia

**📖 Teoría aplicada:** `iptables -A INPUT -s <ip> -j DROP` agrega una regla al firewall que descarta silenciosamente todo el tráfico de una IP específica — es rápido pero no escala: si el atacante rota de IP (algo que este nivel simula deliberadamente), el bloqueo manual siempre va un paso atrás. `fail2ban` automatiza ese bloqueo: monitorea patrones (como demasiadas peticiones en poco tiempo) y banea IPs dinámicamente, sin intervención humana constante.

**🛠 Comandos clave:** `iptables -A INPUT -s <ip> -j DROP`, `iptables -L -n`, `fail2ban-client status`, `fail2ban-client set <jail> banip <ip>`.

**💡 Mundo real:** el bloqueo manual de IPs es la respuesta instintiva y necesaria en el momento, pero ningún equipo serio se queda solo con eso — es exactamente el gancho hacia el Nivel 9.

### Nivel 9 — Endurecimiento

**📖 Teoría aplicada:** el **rate limiting** (límite de tasa) es la defensa estructural: en vez de decidir IP por IP, se establece una regla general ("nadie puede hacer más de X peticiones por segundo") a nivel de servidor web (`nginx`) y de firewall (`iptables -m limit`). `nginx -t` prueba la sintaxis de una configuración *antes* de aplicarla — un hábito profesional esencial, porque una config rota tumba el servicio igual que un ataque. Un "modo bajo ataque" (challenge mode, como el que usan CDNs reales) agrega un reto extra (por ejemplo, una verificación JavaScript) que un bot automatizado simple no puede resolver, filtrando tráfico sin bloquear usuarios reales.

**🛠 Comandos clave:** `cp` (config), `nginx -t`, `systemctl reload nginx`, `iptables ... -m limit --limit 25/minute`, verificación de `fail2ban` bajo carga.

**💡 Mundo real:** esta es, en esencia, la función que cumplen servicios como Cloudflare o AWS Shield: absorber y filtrar tráfico masivo antes de que llegue al servidor de origen.

### Nivel 10 — Recuperación

**📖 Teoría aplicada:** cerrar un incidente de disponibilidad implica más que "ya no está caído": reiniciar con calma los servicios que se apagaron por precaución, confirmar de punta a punta que todo responde (`curl -I`), y verificar que el **contenido** no fue alterado durante el caos (`sha256sum` contra un hash de referencia — la integridad importa tanto como la disponibilidad). Cerrar con métricas reales del impacto (duración, peticiones bloqueadas) es lo que permite escribir un postmortem útil en vez de una descripción vaga.

**🛠 Comandos clave:** `systemctl restart/status`, `curl -I <url>`, `sha256sum index.html`, revisión de métricas de impacto.

**💡 Mundo real:** el "postmortem sin culpa" (blameless postmortem) — documentar qué pasó y cómo evitarlo, sin buscar a quién culpar — es una práctica estándar en SRE (Google la popularizó con su libro de Site Reliability Engineering).

---

## Episodio 4 — Análisis Forense Digital (Niveles 11-13)

### Contexto general del episodio

La informática forense sigue una metodología distinta a la respuesta a incidentes: prioriza la **preservación de evidencia** sobre la velocidad, porque el objetivo puede incluir sostener conclusiones ante una autoridad o un proceso formal, no solo "arreglar el problema".

### Nivel 11 — Rastreo de Indicios

**📖 Teoría aplicada:** el triage forense usa metadatos, no solo contenido. `stat` muestra fechas de un archivo (creación/modificación) — un archivo modificado a las 3 AM es, como mínimo, sospechoso. `file` identifica el tipo *real* de un archivo analizando su contenido binario, no su nombre — un archivo `.sh` que en realidad es un ejecutable ELF es un disfraz clásico (la extensión es solo una convención, no una garantía). `strings` extrae texto legible de un binario, a menudo revelando URLs, IPs o mensajes de depuración que el autor no pensó en ocultar. `exiftool` lee metadatos ocultos de imágenes (a veces incluyen autor, software usado, hasta ubicación GPS). Correlacionar todo esto contra el historial de comandos (`.bash_history`) y los logs ya revisados en episodios anteriores es lo que convierte piezas sueltas en una historia coherente.

**🛠 Comandos clave:** `ssh`, `stat <archivo>`, `file <archivo>`, `strings <archivo> | grep -i http`, `cat .bash_history`, `exiftool <imagen>`, `grep <patrón> access.log`.

### Nivel 12 — Captura Forense

**📖 Teoría aplicada:** el principio rector es **nunca analizar la evidencia original**. Primero se aísla el equipo (igual que en respuesta a incidentes) para no contaminar el estado. Luego se crea una **copia forense bit a bit** (`dc3dd`, una variante de `dd` diseñada para forense, con hash automático incluido) — una copia exacta, no solo de los archivos, sino de cada sector del disco, incluyendo espacio "vacío" que puede contener datos borrados recuperables. El hash (`sha256sum`) se calcula de forma independiente y se compara contra el que registró la herramienta al copiar — si coinciden, la copia es idéntica al original, byte por byte. A partir de ahí, todo el análisis se hace sobre la copia, nunca sobre el original. La **cadena de custodia** documenta, por escrito, quién tuvo la evidencia, cuándo, y qué le hizo — cualquier hueco en ese registro debilita su valor como prueba, sin importar qué tan buena sea la evidencia en sí.

**🛠 Comandos clave:** `ip link set eth0 down`, `dc3dd if=<disco> of=<imagen> hash=sha256`, `sha256sum`, `cat` (verificación de logs de hash), `echo ... > cadena-custodia.txt` (y `>>` para agregar entradas), `sha256sum -c` (verificación contra checksum guardado).

### Nivel 13 — Peritaje Informático

**📖 Teoría aplicada:** el análisis forense estructurado usa herramientas como **Autopsy** (real, gratuita y de código abierto, construida sobre The Sleuth Kit) para trabajar sobre la imagen: indexar el contenido para poder buscarlo, reconstruir una **línea de tiempo** (cuándo se creó/modificó/ejecutó cada archivo relevante — a menudo revela la secuencia real de un ataque), **recuperar archivos borrados** (borrar no es lo mismo que sobrescribir; el espacio queda marcado como libre pero el contenido suele seguir ahí hasta que algo lo pisa), y correlacionar coincidencias de un mismo indicio (nombre, hash, patrón) a través de todas las piezas de evidencia. El informe final debe ser trazable: cada conclusión debe poder rastrearse hasta la evidencia concreta que la sostiene.

**🛠 Comandos clave:** `autopsy --new-case`, `--index`, `--timeline`, `--recover-deleted`, `--search <término>`, `--report generate`, `--verify-report`.

**💡 Mundo real de todo el episodio:** esta metodología (identificar → preservar → recolectar → examinar → analizar → presentar) sigue estándares como NIST SP 800-86 e ISO/IEC 27037, y es la base de certificaciones como GCFA o CHFI.

---

## Episodio 5 — Pentesting Web Autorizado (Niveles 14-17)

### Contexto general del episodio

Un **pentest** (prueba de penetración) es un ataque simulado con autorización explícita, por escrito, para encontrar vulnerabilidades reales antes de que alguien sin permiso lo haga. La palabra clave es *autorización*: es lo único que separa un pentest legal de un delito, aunque la técnica usada sea idéntica.

### Nivel 14 — Reconocimiento Web

**📖 Teoría aplicada:** el reconocimiento web repite la lógica del Nivel 1 pero a nivel de aplicación: `whatweb` identifica la pila tecnológica de un sitio (servidor, framework, librerías) por sus huellas (cabeceras HTTP, patrones del HTML). `gobuster` fuerza bruta rutas comunes (`/admin`, `/api`, `/.git`) contra un diccionario, revelando endpoints no enlazados públicamente. Un `.git` accesible desde la web es una de las fugas de información más comunes y más graves en despliegues reales: expone el historial completo del código fuente, incluyendo configuración y, a veces, credenciales olvidadas en commits antiguos.

**🛠 Comandos clave:** `whatweb`, `nmap -sV -p-` (escaneo de *todos* los puertos, no solo los comunes), `gobuster dir`, `curl` (robots.txt, endpoints de versión, `.git/HEAD`), `wget -r`.

### Nivel 15 — Análisis de Dependencias

**📖 Teoría aplicada:** el software moderno depende de decenas o cientos de librerías de terceros. El **riesgo de cadena de suministro** aparece cuando una de esas dependencias deja de mantenerse — sin parches de seguridad, con un único responsable inactivo — y sigue en producción. `npm audit` escanea automáticamente las dependencias contra bases de datos de vulnerabilidades conocidas (CVE). `npm info` revela metadatos del paquete: última publicación, número de mantenedores, actividad — las señales de abandono. Cuando no existe un parche disponible (paquete abandonado), la solución correcta no es esperar: es **reemplazar** la dependencia por una alternativa mantenida activamente (practicado en el Nivel 17).

**🛠 Comandos clave:** `cat package.json`, `npm audit`, `npm info <paquete>`, `npm view <paquete> versions`.

### Nivel 16 — Explotación Controlada

**📖 Teoría aplicada:** confirmar una vulnerabilidad con una **prueba de concepto (PoC)** demuestra el riesgo de forma innegable — un hallazgo teórico convence menos que uno demostrado. Pero un pentest profesional sigue reglas estrictas: autorización por escrito con alcance definido *antes* de cualquier acción, una PoC mínima (solo lo necesario para confirmar, nada más), y cierre inmediato de cualquier acceso obtenido apenas se confirma el punto — nunca persistencia, nunca explorar más allá del alcance acordado. **Metasploit** (`msfconsole`) es el framework de explotación más usado en la industria para pentesting autorizado y en certificaciones como OSCP; su flujo típico es `use` (seleccionar módulo) → `set` (configurar parámetros del objetivo) → `exploit`/`run` (ejecutar) → `sessions` (gestionar accesos obtenidos, incluido cerrarlos).

**🛠 Comandos clave:** `cat` (verificación de autorización), `msfconsole`, `use <módulo>`, `set RHOST <objetivo>`, `exploit`, `sessions -K` (cierre inmediato).

### Nivel 17 — Remediación e Informe

**📖 Teoría aplicada:** encontrar una vulnerabilidad no cierra el caso. La remediación real reemplaza la dependencia abandonada, reaudita para confirmar que el hallazgo desapareció, y verifica que el sitio sigue funcionando después del cambio (regresión) — un parche que rompe el sitio no es una solución. El informe final combina severidad técnica (a menudo con una escala como CVSS) con hallazgos claros y accionables: no basta con decir "hay un problema", hay que decir qué es, qué tan grave, y cómo se corrigió.

**🛠 Comandos clave:** `npm update` / `uninstall` / `install` / `audit`, `curl -I` (verificación post-cambio), redacción del informe.

**💡 Mundo real de todo el episodio:** este ciclo (recon → hallazgo → PoC autorizada → remediación → informe) es exactamente la estructura de un informe de pentest profesional, y el manejo cuidadoso de la "explotación controlada" reflleja las reglas de compromiso (rules of engagement) que cualquier pentester certificado firma antes de empezar.

---

## Episodio 6 — Gobierno de la Seguridad: ISO 27001 (Niveles 18-21)

### Contexto general del episodio

Hasta aquí, el juego practicó habilidades técnicas. Este episodio es distinto: es **gobierno y proceso** — cómo una organización decide, documenta y sostiene sus decisiones de seguridad a lo largo del tiempo, más allá de una sola persona o un solo incidente. **ISO/IEC 27001** es el estándar internacional para un **SGSI** (Sistema de Gestión de Seguridad de la Información), estructurado como un ciclo de mejora continua: **Plan → Do → Check → Act (PDCA)**.

### Nivel 18 — Alcance y Activos

**📖 Teoría aplicada:** ISO 27001 empieza por definir el **alcance** (¿qué sistemas, datos y procesos cubre el SGSI?) — sin esto, todo lo demás carece de límites claros. El **inventario de activos** lista qué hay que proteger (servidores, bases de datos, credenciales) con un **propietario** asignado a cada uno (alguien concreto, responsable, no "el equipo" en abstracto). La **clasificación** (público/interno/confidencial/crítico) determina qué nivel de protección corresponde a cada activo — no todo merece el mismo esfuerzo. Identificar **amenazas** y el **marco legal aplicable** (en Ecuador, la LOPDP para datos personales) cierra el panorama antes de evaluar riesgos.

### Nivel 19 — Riesgos

**📖 Teoría aplicada:** el corazón de ISO 27001 es la evaluación de riesgo: una **metodología** (típicamente probabilidad × impacto) que convierte amenazas difusas en una **matriz de riesgos** comparable y priorizable. Para cada riesgo se define un **tratamiento** — mitigar (reducirlo con controles), transferir (un seguro, un proveedor externo), evitar (dejar de hacer la actividad riesgosa) o aceptar (documentar formalmente que el riesgo residual es tolerable). La **Declaración de Aplicabilidad (SoA)** es el documento central del estándar: de los 93 controles del Anexo A (ISO 27002), dice cuáles aplican a tu organización y por qué — no se implementan todos siempre, se justifica cada decisión.

### Nivel 20 — Políticas y Controles

**📖 Teoría aplicada:** las decisiones de riesgo se vuelven inútiles si no se escriben como **políticas** que la organización realmente sigue. Este nivel redacta, una por una, las políticas que formalizan lo ya practicado en episodios anteriores: seguridad de la información (la política "paraguas"), control de acceso (mínimo privilegio), respuesta a incidentes (formaliza el NIST 800-61 del Episodio 2), desarrollo seguro (formaliza la lección de dependencias del Episodio 5), respaldo, concientización (el factor humano — phishing sigue siendo la puerta de entrada más común a incidentes reales) y requisitos a proveedores (formaliza el riesgo de cadena de suministro).

### Nivel 21 — Auditoría del SGSI

**📖 Teoría aplicada:** un SGSI que nunca se audita es solo un documento. La **auditoría interna** verifica evidencia real contra cada política — y encontrar cero hallazgos suele ser señal de una auditoría poco rigurosa, no de perfección. Una **no conformidad** (algo que no cumple lo que la propia política exige) requiere una **acción correctiva** formal, con responsable y plazo. La **revisión por la dirección** (cláusula 9.3 del estándar) asegura que la seguridad no sea solo un tema técnico aislado, sino una decisión respaldada por quienes lideran la organización, con indicadores (KPIs) que permiten medir si el SGSI realmente funciona.

**🛠 Comandos clave de todo el episodio:** en este episodio casi todos los "comandos" son en realidad `cat` (revisar plantillas/documentos existentes) y `echo ... > archivo.txt` (redactar cada documento del SGSI) — reflejando que la gobernanza de seguridad es, en la práctica, un ejercicio de documentación disciplinada, no de terminal.

**💡 Mundo real:** certificarse en ISO 27001 es un proceso real que muchas empresas atraviesan; la certificación **ISO 27001 Lead Implementer** (o Lead Auditor) es una de las más reconocidas en el campo de GRC (Governance, Risk & Compliance).

---

## Episodio 7 — Rescate: Datacenter y Nube (Niveles 22-31)

### Contexto general del episodio

El capstone final combina **todo** lo aprendido en un caso integral: una universidad ficticia (Universidad Metropolitana de Tecnología, [LAB-FICTICIO] — este episodio no hace ninguna afirmación sobre ninguna institución real) pierde calificaciones en su sistema académico. El club investiga tanto su infraestructura **on-premise** (datacenter propio) como su proveedor **cloud**, hasta encontrar la causa raíz real.

### Niveles 22-24 — Datacenter

**📖 Teoría aplicada:** toda auditoría empieza con **triage y autorización** (Nivel 22) — entender síntomas reportados antes de asumir causas. La auditoría de datacenter combina controles **físicos** (bitácora de acceso, monitoreo ambiental) y **lógicos** (inventario, estado de hardware). `smartctl` revisa la salud S.M.A.R.T. de un disco — un indicador temprano de fallo real, no solo una sospecha. Un **RAID degradado** (Nivel 23) sigue funcionando pero sin margen de tolerancia a fallos; repararlo *siguiendo el procedimiento formal* (no "a las carreras") es la diferencia entre un mantenimiento de rutina y un segundo incidente.

El Nivel 24 introduce una lección incómoda pero fundamental: **un respaldo que nunca se prueba no es un respaldo confiable, es una suposición**. Un backup puede fallar silenciosamente durante semanas si nadie revisa los logs ni configura alertas — exactamente lo que este nivel simula. La única forma de confiar en un respaldo es restaurarlo periódicamente en un entorno aislado (sandbox) y confirmar que los datos realmente están completos e íntegros.

**🛠 Comandos clave:** `cat` (solicitud, autorización, tickets, bitácoras, políticas), `curl -I`, `ping`, `smartctl -a`, `grep ERROR`, `sha256sum`, `restauracion-prueba --sandbox`.

### Niveles 25-27 — Nube

**📖 Teoría aplicada:** la seguridad en la nube sigue el **modelo de responsabilidad compartida**: el proveedor asegura la infraestructura física; el cliente es responsable de cómo configura **IAM** (Identity and Access Management), permisos de almacenamiento y monitoreo. La inmensa mayoría de los incidentes reales en la nube son de **configuración**, no del proveedor — exactamente el patrón que este arco reproduce.

Un rol de servicio con política `"Action": "*", "Resource": "*"` (Nivel 25) viola el principio de **mínimo privilegio**: un proceso automatizado no debería poder hacer más de lo estrictamente necesario para su función. Llaves de acceso sin rotar durante años y huecos en el registro de auditoría (logging) agravan el riesgo — sin logs, no hay forma de reconstruir qué pasó cuando algo falla.

El almacenamiento (Nivel 26) sin **versionado** activo no permite deshacer un borrado o sobrescritura accidental — una configuración de bajo costo que evita pérdidas de datos irreversibles. Y la pieza que cierra el misterio: el propio **servicio de sincronización automatizado** (Nivel 27), con un bug introducido en un despliegue reciente, resultó ser quien eliminó los datos — no un atacante externo. Esto ilustra un punto real y contraintuitivo: **muchos incidentes de "pérdida de datos" son causados por fallos internos de automatización, no por ataques**, y por eso la causa raíz nunca debe asumirse de antemano.

**🛠 Comandos clave:** `cloudcli iam list-users / get-policy / list-access-keys`, `cloudcli logging status`, `cloudcli storage list-buckets / get-acl / get-versioning / list-deleted`, `cloudcli logging query --event DeleteObject`, `cat historial-cambios.txt`, `grep ERROR`, `cloudcli monitoring list-alarms`.

### Niveles 28-29 — Causa Raíz e Impacto

**📖 Teoría aplicada:** un buen análisis de **causa raíz (RCA)** no se conforma con la primera explicación plausible: correlaciona todos los hallazgos en una **línea de tiempo**, intenta **reproducir el fallo** en un entorno controlado antes de darlo por confirmado (correlación no es lo mismo que causalidad), y **descarta explícitamente** teorías alternativas (por ejemplo, confirmar que no hubo acceso físico no autorizado) para que el informe final sea defendible, no solo plausible.

La **evaluación de impacto** (Nivel 29) evita reacciones desproporcionadas: contar exactamente cuántos registros se vieron afectados, y — el giro clave de este nivel — verificar si la **fuente de la verdad real** (la base de datos on-premise, no la copia en la nube) seguía íntegra. Saber *dónde vive realmente el dato original* cambia por completo la gravedad de un incidente. Comunicar con un plan estructurado (qué pasó, a quién afecta, qué se está haciendo) a las partes interesadas es tan parte de la respuesta como la corrección técnica.

**🛠 Comandos clave:** `cat` (hallazgos previos), `sandboxcli replay --dry-run` / `confirm`, `cloudcli storage list-deleted --count`, `dbcli verify-integrity`.

### Nivel 30 — Remediación y Recuperación

**📖 Teoría aplicada:** corregir la causa raíz de verdad significa revertir el cambio defectuoso (`rollback`), no solo mitigar sus síntomas; aplicar mínimo privilegio donde antes no lo había; cerrar los huecos de monitoreo que permitieron que el problema pasara desapercibido; activar controles preventivos (versionado) para el futuro; y restaurar los datos afectados desde la fuente íntegra confirmada en el nivel anterior — solo después de que la causa está corregida, para no restaurar datos hacia un sistema que va a volver a romperlos.

**🛠 Comandos clave:** `cloudcli deploy rollback`, `cloudcli iam update-policy` (mínimo privilegio), `cloudcli monitoring create-alarm`, `cloudcli storage enable-versioning`, `dbcli export`, `raidcli rebuild --follow-procedure`, `dbcli verify-integrity`.

### Nivel 31 — Informe Final y Reconocimiento

**📖 Teoría aplicada:** el cierre de cualquier auditoría o investigación seria compila todas las fases en un **informe estructurado**: resumen ejecutivo (para quien no tiene tiempo de leer el detalle técnico), hallazgos técnicos (para quien sí), y recomendaciones concretas y accionables — no solo "mejorar la seguridad" en abstracto, sino compromisos verificables (revisión trimestral de IAM, pruebas de restauración mensuales). Cerrar un capítulo grande de aprendizaje con reconocimiento —en este caso, el propio Club de la Ingeniería reconociendo el trabajo del jugador— es, honestamente, tan válido pedagógicamente como el contenido técnico: aprender ciberseguridad de punta a punta, con 31 niveles de profundidad creciente, es un logro real que vale la pena celebrar.

**💡 Mundo real de todo el episodio:** esta es, en esencia, la disciplina de **auditoría de TI / seguridad en la nube** que ejercen roles como Cloud Security Engineer o IT Auditor, y el capstone reproduce fielmente cómo luce una investigación real de incidente híbrido (on-premise + cloud) de principio a fin.

---

## Glosario rápido

| Término | Definición corta |
|---|---|
| **RAID** | Combina discos para tolerar fallos o ganar velocidad. "Degradado" = un disco falló, sigue funcionando sin margen. |
| **IAM** | Identity and Access Management — quién es quién y qué puede hacer en un sistema. |
| **SGSI / ISO 27001** | Sistema de Gestión de Seguridad de la Información — ciclo de mejora continua (PDCA) para gobernar la seguridad. |
| **SoA** | Declaración de Aplicabilidad — qué controles del Anexo A de ISO 27001 aplican, y por qué. |
| **Cadena de custodia** | Registro ininterrumpido de quién tuvo una evidencia, cuándo y qué le hizo. |
| **RCA** | Root Cause Analysis — encontrar la causa real de un incidente, no solo su síntoma. |
| **Responsabilidad compartida** | En la nube: el proveedor asegura la infraestructura, tú configuras IAM/permisos/monitoreo. |
| **DFIR** | Digital Forensics and Incident Response — responder rápido y analizar con rigor forense. |
| **CVE / CVSS** | Identificador único de una vulnerabilidad conocida / escala 0-10 de qué tan grave es. |
| **WAF** | Web Application Firewall — filtra tráfico malicioso a nivel de aplicación web. |
| **Rate limiting** | Límite de peticiones aceptadas en un tiempo dado — defensa clave contra DDoS y fuerza bruta. |
| **Mínimo privilegio** | Cada cuenta/rol/proceso tiene solo los permisos estrictamente necesarios, nada más. |
| **DDoS** | Denegación de Servicio Distribuida — saturar un servicio con tráfico desde muchas fuentes. |
| **Pentest** | Ataque simulado con autorización explícita por escrito, para encontrar vulnerabilidades reales. |
| **Hash** | Huella digital de tamaño fijo de un archivo — cualquier cambio en el original cambia el hash por completo. |
| **NIST SP 800-61** | Guía de referencia para el ciclo de respuesta a incidentes de seguridad. |
| **Cadena de suministro (software)** | Riesgo de depender de código/servicios de terceros fuera de tu control. |

---

## Para profundizar

Estos son los mismos estándares y herramientas reales que el juego menciona — vale la pena conocerlos si el tema te interesó:

- **Redes y reconocimiento:** documentación oficial de `nmap` (nmap.org), OWASP Testing Guide.
- **WiFi:** Aircrack-ng (aircrack-ng.org) — suite completa con documentación de cada herramienta.
- **Criptografía aplicada:** documentación de OpenSSH, GnuPG (gnupg.org), WireGuard (wireguard.com).
- **Respuesta a incidentes:** NIST SP 800-61 Rev. 2 ("Computer Security Incident Handling Guide", de acceso público).
- **Forense digital:** Autopsy / The Sleuth Kit (sleuthkit.org), NIST SP 800-86, ISO/IEC 27037.
- **Pentesting:** OWASP Top 10, PortSwigger Web Security Academy (gratuito), Metasploit Unleashed.
- **Gobierno de seguridad:** ISO/IEC 27001 e ISO/IEC 27002 (el estándar es de pago, pero hay muchísimos resúmenes y guías de implementación libres), marco de controles CIS Controls (gratuito, cisecurity.org).
- **Cloud security:** documentación de "shared responsibility model" de cualquier proveedor cloud grande (AWS, Azure, GCP la explican en detalle y gratis).

---

*Este documento es parte de Operación Laboratorio-B, del Club de la Ingeniería. Toda la teoría aquí es real y aplicable; los datos, IPs, empresas e instituciones dentro del juego son ficticios.*
