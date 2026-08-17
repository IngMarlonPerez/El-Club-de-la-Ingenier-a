# Guion narrativo completo — Kernel Cero (31 niveles × 8 etapas)

**Estado: BORRADOR DE DISEÑO — no implementado todavía.** Este documento es el guion completo que se va a revisar contigo antes de tocar una sola línea de `linux-cli.html`. Una vez aprobado, cada entrada se traduce 1:1 a los diálogos que muestra la ventana flotante de INGenioso en el juego.

## De dónde sale el contenido técnico

No se inventa teoría nueva: cada explicación técnica de este guion es una adaptación, en formato de diálogo hablado y por etapas, de lo que ya está verificado y escrito en [`docs/teoria-operacion-laboratorio-b.md`](teoria-operacion-laboratorio-b.md) (7 episodios, 31 niveles, con tablas de comandos). Ese documento sigue siendo la referencia "de consulta libre" (el jugador puede leerlo aparte); este guion es su versión narrada, trozo a trozo, dentro del propio juego.

## Plantilla de cada etapa (se repite 248 veces: 31 niveles × 8 etapas)

Cada entrada de este guion tiene tres piezas, que son exactamente los tres campos que ya soporta la ventana flotante de INGenioso (`showInstrPanel(kicker, dialogue, instruction)`):

1. **Transición** (1 frase corta, variada, en tono hacker/mentor) — reacciona a lo que el jugador acaba de lograr antes de introducir lo nuevo. Nunca genérica dos veces seguidas dentro del mismo nivel.
2. **Diálogo/teoría** (el texto grande narrado, 2-4 frases) — combina *qué vamos a hacer y por qué* con *qué hace el comando realmente* (la pieza de teoría aplicada, condensada de la tabla del documento de teoría). Aquí es donde el jugador aprende de verdad, no solo memoriza un comando.
3. **Instrucción** (la caja verde, 1 línea imperativa y corta) — el comando exacto que el parser del juego espera para esa etapa. Debe coincidir con la lógica real de `handleLevelN`, no solo con la tabla de teoría (por eso este guion se valida contra el código antes de escribirse, etapa por etapa).

**Tono por rango** (ver tabla `RANKS` ya existente en el juego): a medida que sube el rango, INGenioso explica menos "desde cero" y habla más de igual a igual — el Recluta necesita que le expliquen qué es un directorio; el Héroe del Club ya no.

| Rango | Niveles | Tono de INGenioso |
|---|---|---|
| 🔰 Recluta | 1-2 | Mentor paciente. Explica cada concepto asumiendo cero experiencia previa. Frases cortas. |
| 🛡️ Operador de Campo | 3-6 | Guía cercano. Ya asume que sabe lo básico; empieza a introducir vocabulario técnico real sin traducirlo todo. |
| 🚨 Analista de Respuesta | 7-10 | Urgencia calibrada (hay un incidente real en curso) sin dejar de enseñar el porqué de cada paso. |
| 🔍 Investigador Forense | 11-13 | Tono meticuloso, casi detectivesco — precisión antes que velocidad. |
| 🕸️ Auditor Ofensivo | 14-17 | Colega técnico. Explica el *porqué* de las reglas de un pentest profesional, no solo el comando. |
| 📋 Arquitecto de Seguridad | 18-21 | Tono de consultoría/gobierno — menos terminal, más "por qué esto importa para la organización". |
| ☁️ Agente de Rescate | 22-30 | Par experimentado. Poca mano tomada; refuerza conexiones con episodios anteriores ("esto ya lo hiciste, en otro nombre, en el Nivel X"). |
| 🦸 Héroe del Club | 31 | Cierre. Tono de reconocimiento genuino, mirando atrás al recorrido completo. |

## Cómo se va a construir este documento

1. Se extrae de `linux-cli.html` el mapeo exacto de las 8 etapas × 31 niveles → comando/condición real que las completa (en curso, agente en background).
2. Se escribe el guion nivel por nivel, en el orden narrativo de los 7 episodios, en bloques de: Niveles 1-6, 7-13, 14-21, 22-31.
3. Se entrega este documento completo para tu revisión — **nada se implementa en el juego hasta que apruebes el guion**.

---

## Nivel 1 — Reconocimiento (🔰 Recluta) — EJEMPLO DE REFERENCIA

*(Este nivel se escribe primero, completo, como ejemplo de la plantilla — con el estilo que tú mismo diste como muestra. El resto de los 31 niveles sigue este mismo patrón.)*

**Kicker de bienvenida (ya existe, sin cambios — Vera narra el brief inicial):** el jugador entra al taller, Vera le asigna el equipo sin decirle qué tiene de especial. Sin cambios respecto al `BRIEFINGS[1]` actual.

### Etapa 1/8 — `pwd`
- **Transición:** "¡Bienvenido de verdad, hacker! Antes de tocar nada, ubiquémonos."
- **Diálogo:** "Todo sistema Linux organiza su información en una jerarquía de carpetas, como un árbol. Antes de escanear cualquier red, un buen analista primero se ubica en su propio sistema — es el reflejo más básico y el que más se salta la gente que recién empieza."
- **Instrucción:** "Escribe `pwd` (*print working directory*) para ver en qué carpeta estás parado ahora mismo."

### Etapa 2/8 — `ls`
- **Transición:** "Perfecto, ya sabes dónde estás. Ahora vamos a ver qué hay aquí."
- **Diálogo:** "`ls` lista el contenido de la carpeta actual. Es el comando que vas a escribir más veces que cualquier otro en tu vida de hacker — es tan básico como mirar antes de cruzar la calle."
- **Instrucción:** "Escribe `ls` para listar los archivos de tu carpeta de inicio."

### Etapa 3/8 — `ls -a`
- **Transición:** "Buen ojo. Pero espera — ¿eso es *todo* lo que hay aquí? Casi nunca lo es."
- **Diálogo:** "En Linux, cualquier archivo o carpeta cuyo nombre empiece con un punto (`.`) queda oculto por convención al listar con `ls` normal — no por seguridad real, solo para no saturar la vista. El flag `-a` (*all*) te muestra absolutamente todo, ocultos incluidos. Vas a usar este mismo truco una y otra vez: lo oculto no es lo mismo que lo seguro."
- **Instrucción:** "Escribe `ls -a` para descubrir qué se estaba escondiendo."

### Etapa 4/8 — `cat readme.txt`
- **Transición:** "Ahí está. Alguien dejó algo para ti."
- **Diálogo:** "`cat` (*concatenate*) muestra el contenido de un archivo directo en tu terminal — la forma más simple de leer configuración, notas o, en este caso, un mensaje de bienvenida. La sintaxis es siempre la misma: el comando, un espacio, y el nombre del archivo con su extensión."
- **Instrucción:** "Escribe `cat readme.txt` para leerlo."

### Etapa 5/8 — `cat briefing.txt`
- **Transición:** "Vera no te va a decir qué buscar dos veces. Pero dejó una pista más."
- **Diálogo:** "Mismo comando, archivo distinto — así de reutilizable es `cat`. Este archivo en particular contiene tu misión real para este nivel: el objetivo concreto que tienes que confirmar antes de avanzar."
- **Instrucción:** "Escribe `cat briefing.txt` para encontrar tu misión."

### Etapa 6/8 — `ping <objetivo>`
- **Transición:** "Ya sabes qué buscar. Ahora hay que confirmar que sigue ahí."
- **Diálogo:** "`ping` envía un paquete diminuto a una dirección y espera respuesta — la forma más básica de confirmar que un equipo está encendido y responde en la red, antes de invertir tiempo escaneándolo a fondo. Sin esto, podrías pasar minutos escaneando algo que ni siquiera está en línea."
- **Instrucción:** "Escribe `ping` seguido de la dirección del objetivo que encontraste en la misión."

### Etapa 7/8 — `nmap <objetivo>`
- **Transición:** "Está vivo. Ahora sí, momento de reconocimiento real."
- **Diálogo:** "`nmap` es la herramienta de escaneo de red más usada del mundo, tanto por quien ataca como por quien defiende su propia infraestructura. Cada 'puerto abierto' que encuentre es un servicio real escuchando conexiones — tu primer mapa de la superficie de ataque del objetivo."
- **Instrucción:** "Escribe `nmap` seguido de la dirección del objetivo para escanear sus puertos."

### Etapa 8/8 — `nmap -sV <objetivo>`
- **Transición:** "Encontraste puertos abiertos. Pero un puerto abierto no te dice el cuento completo."
- **Diálogo:** "Sin el flag `-sV` (*version detection*), `nmap` solo te dice si un puerto está abierto o cerrado. Con `-sV`, intenta identificar la versión exacta del software detrás de ese puerto — y las versiones viejas o sin parchar son, con mucha frecuencia, la vulnerabilidad en sí misma. Vas a repetir este mismo principio — identificar antes de actuar — en el reconocimiento web del Nivel 14 y en la auditoría de nube del Nivel 25."
- **Instrucción:** "Escribe `nmap -sV` seguido de la dirección para descubrir versiones — y tu primera vulnerabilidad."

**Cierre de nivel:** al completar la etapa 8/8, INGenioso celebra con un halago calibrado por esfuerzo (banco `HACKER_PRAISE` ya existente) y anuncia el Nivel 2.

---

## Nivel 2 — Infiltración WiFi (🔰 Recluta)

### Etapa 1/8 — `iwconfig`
- **Transición:** "Nivel 2 desbloqueado. Ese servicio vulnerable que encontraste habla con un panel administrado por WiFi — vamos por esa red."
- **Diálogo:** "Antes de auditar cualquier red inalámbrica necesitas saber qué adaptador WiFi tienes y en qué modo está — la mayoría de adaptadores vienen en 'modo cliente' (para conectarse a una red), no en el modo que necesitas para auditar."
- **Instrucción:** "Escribe `iwconfig` para revisar tu adaptador WiFi."

### Etapa 2/8 — `airmon-ng start wlan0`
- **Transición:** "Ahí está tu interfaz. Ahora hay que cambiarle el comportamiento por completo."
- **Diálogo:** "Un adaptador en modo normal solo escucha el tráfico dirigido a ti. El **modo monitor** lo cambia: empieza a capturar *todos* los paquetes que pasan por el aire en su rango, estén dirigidos a ti o no — es la base de cualquier auditoría WiFi real."
- **Instrucción:** "Activa el modo monitor con `airmon-ng start wlan0`."

### Etapa 3/8 — `airodump-ng wlan0mon`
- **Transición:** "Tu adaptador ya escucha todo. Momento de ver qué hay en el aire."
- **Diálogo:** "`airodump-ng` usa ese modo monitor para mapear las redes cercanas: nombre, canal, nivel de señal, y qué dispositivos están conectados a cada una. Es tu reconocimiento WiFi, el mismo concepto de `nmap` pero para el espectro radioeléctrico en vez de una red cableada."
- **Instrucción:** "Escanea las redes cercanas con `airodump-ng wlan0mon`."

### Etapa 4/8 — `airodump-ng --bssid AA:BB:CC:11:22:33 -c <canal> -w captura wlan0mon`
- **Transición:** "Ya viste la red objetivo en el listado. Ahora hay que dejar de escuchar todo y enfocarte solo en ella."
- **Diálogo:** "Escanear en general captura paquetes de decenas de redes a la vez — desperdicia capacidad y te hace perder justo el paquete que necesitas. Una captura *dirigida* usa `--bssid` (la dirección física del punto de acceso), `-c` (su canal) y `-w` (dónde guardar la captura) para concentrarte en un solo objetivo."
- **Instrucción:** "Apunta una captura dirigida con `--bssid`, `-c` y `-w` usando los datos de la red objetivo."

### Etapa 5/8 — `aireplay-ng --deauth 5 -a AA:BB:CC:11:22:33 wlan0mon`
- **Transición:** "La captura está corriendo, pero podría tardar minutos u horas en pasar algo útil. Hay una forma de acelerarlo."
- **Diálogo:** "El **4-way handshake** — el intercambio criptográfico que prueba que conoces la contraseña de la red — solo ocurre en el momento exacto en que un dispositivo se conecta. `aireplay-ng --deauth` fuerza a un cliente ya conectado a desconectarse y reconectarse, provocando ese handshake bajo demanda en vez de esperar pasivamente. Es breve y molesto para quien lo sufre — exactamente por eso, **solo se hace con autorización explícita por escrito**, nunca contra una red real sin permiso."
- **Instrucción:** "Fuerza una reconexión con `aireplay-ng --deauth 5 -a` y el BSSID del objetivo."

### Etapa 6/8 — `airodump-ng --bssid AA:BB:CC:11:22:33 -c <canal> -w captura wlan0mon` (segunda vez)
- **Transición:** "El cliente se reconectó. Justo en ese instante pasó lo que estabas esperando."
- **Diálogo:** "Vuelve a tu captura dirigida y revisa la esquina superior — `airodump-ng` marca en pantalla cuándo detecta un handshake completo. A partir de aquí, ya no necesitas seguir escuchando el aire: tienes lo que necesitas guardado en un archivo, listo para analizar sin conexión."
- **Instrucción:** "Vuelve a correr tu captura dirigida para confirmar que el handshake quedó registrado."

### Etapa 7/8 — `cat wordlist.txt`
- **Transición:** "Handshake capturado. Ahora el problema deja de ser de redes y pasa a ser un problema matemático."
- **Diálogo:** "El handshake por sí solo no te da la contraseña — es una prueba criptográfica que puedes verificar *offline* contra candidatos. Un diccionario (wordlist) es una lista de contraseñas probables; cada una se prueba matemáticamente contra el handshake hasta encontrar la que calza."
- **Instrucción:** "Revisa tu diccionario disponible con `cat wordlist.txt`."

### Etapa 8/8 — `aircrack-ng -w wordlist.txt captura-01.cap`
- **Transición:** "Diccionario en mano, handshake capturado. Es hora de la prueba final."
- **Diálogo:** "`aircrack-ng` prueba cada palabra del diccionario contra tu handshake capturado, generando las mismas claves criptográficas que generaría un dispositivo real conectándose — cuando una coincide, encontraste la contraseña. Esta es la misma metodología que enseñan certificaciones profesionales como la OSCP, aplicada aquí en un laboratorio 100% controlado."
- **Instrucción:** "Crackea la contraseña con `aircrack-ng -w wordlist.txt captura-01.cap`."

**Cierre de nivel:** contraseña encontrada (`wifi12345` — intencionalmente débil: el cifrado protege el canal, no compensa una mala contraseña). INGenioso lo celebra y anuncia el Nivel 3, con el recordatorio de Vera sobre autorización siempre por escrito.

---

## Nivel 3 — Comunicación Segura (🛡️ Operador de Campo)

### Etapa 1/8 — `ssh-keygen -t ed25519`
- **Transición:** "Nivel 3. Ya tienes acceso — ahora hagamos esto bien, con herramientas de verdad."
- **Diálogo:** "En vez de una contraseña que se puede adivinar, filtrar o reutilizar en otro sitio, SSH con llaves usa un par criptográfico: una llave privada que nunca sale de tu máquina, y una pública que compartes libremente. `ed25519` es el algoritmo moderno recomendado hoy — más rápido y seguro que las llaves RSA antiguas."
- **Instrucción:** "Genera tu par de llaves con `ssh-keygen -t ed25519`."

### Etapa 2/8 — `ssh-copy-id agente@192.168.56.20`
- **Transición:** "Tienes tus llaves. Ahora el servidor necesita conocer la mitad pública."
- **Diálogo:** "`ssh-copy-id` copia tu llave *pública* al servidor de forma automática. A partir de ahora, el servidor puede reconocerte porque puedes demostrar matemáticamente que tienes la llave privada — sin transmitirla nunca por la red."
- **Instrucción:** "Copia tu llave pública con `ssh-copy-id agente@192.168.56.20`."

### Etapa 3/8 — `ssh agente@192.168.56.20`
- **Transición:** "Llave copiada. Momento de la verdad."
- **Diálogo:** "SSH cifra y autentica cada conexión — reemplaza protocolos antiguos como Telnet, que enviaban usuario y contraseña en texto plano, legibles por cualquiera que estuviera escuchando la red. Con llaves configuradas, ni siquiera necesitas escribir una contraseña."
- **Instrucción:** "Conéctate al servidor con `ssh agente@192.168.56.20`."

### Etapa 4/8 — `gpg --gen-key`
- **Transición:** "Ya tienes un canal seguro para conectarte. Ahora necesitas uno para *mensajes* — no todo es una sesión en vivo."
- **Diálogo:** "GPG implementa cifrado de clave pública igual que SSH, pero para mensajes y archivos: cualquiera puede cifrar algo con tu llave pública, pero solo tú puedes descifrarlo con la privada. Es el mismo estándar que se usa hoy para firmar código y cifrar correo sensible."
- **Instrucción:** "Genera tu par de llaves GPG con `gpg --gen-key`."

### Etapa 5/8 — `gpg --encrypt --recipient mentor mensaje.txt`
- **Transición:** "Llaves listas. Manda tu primer mensaje cifrado de verdad."
- **Diálogo:** "`--recipient` le dice a GPG *para quién* estás cifrando — usa la llave pública de esa persona específica, así que solo ella (con su llave privada) puede abrirlo. Ni siquiera tú, una vez cifrado, puedes volver a leerlo sin la llave del destinatario."
- **Instrucción:** "Cifra un mensaje para tu mentora con `gpg --encrypt --recipient mentor mensaje.txt`."

### Etapa 6/8 — `wg genkey`
- **Transición:** "SSH para conexiones, GPG para mensajes. Falta una pieza: proteger *todo* el tráfico de una vez."
- **Diálogo:** "WireGuard es una VPN moderna: crea un túnel cifrado entre dos puntos, así que todo lo que pase por ahí queda protegido de quien esté escuchando la red intermedia — no solo un mensaje o una conexión, sino todo tu tráfico."
- **Instrucción:** "Genera las llaves de WireGuard con `wg genkey`."

### Etapa 7/8 — `wg-quick up wg0`
- **Transición:** "Llaves generadas. Ahora levanta el túnel."
- **Diálogo:** "`wg-quick up` activa la interfaz VPN usando esa configuración — a partir de este momento, tu tráfico viaja cifrado de punta a punta por ese túnel, sin importar qué tan insegura sea la red por la que pasa físicamente."
- **Instrucción:** "Levanta el túnel con `wg-quick up wg0`."

### Etapa 8/8 — `wg show`
- **Transición:** "Túnel arriba. Confirma que realmente está funcionando antes de confiar en él."
- **Diálogo:** "`wg show` te confirma el estado real de la interfaz — nunca asumas que algo de seguridad está activo solo porque ejecutaste el comando para activarlo; siempre verifica. El punto pedagógico de todo este nivel: 'seguro' significa cifrado *y* autenticado con herramientas estándar y auditadas — no oculto, no invisible."
- **Instrucción:** "Verifica el estado del túnel con `wg show`."

**Cierre de nivel:** INGenioso celebra y anuncia el Nivel 4 — el tono de Vera cambia: "esto no estaba en el plan de hoy", una alerta real acaba de llegar.

---

## Nivel 4 — Detección (🛡️ Operador de Campo)

### Etapa 1/8 — `netstat -tulpn` (o `ss -tulpn`)
- **Transición:** "Alerta real, no ejercicio. Ponte el sombrero de analista — vamos a ver qué está pasando de verdad."
- **Diálogo:** "La detección combina varias fuentes de evidencia porque ninguna por sí sola es concluyente. Empezamos por la red: `netstat`/`ss` muestra las conexiones activas de tu sistema. Un proceso desconocido con una conexión saliente hacia una IP que no reconoces es la primera señal de alerta."
- **Instrucción:** "Revisa las conexiones activas con `netstat -tulpn` (o `ss -tulpn`)."

### Etapa 2/8 — `ps aux`
- **Transición:** "Hay una conexión que no debería estar ahí. ¿Qué proceso la generó?"
- **Diálogo:** "`ps aux` lista todos los procesos en ejecución del sistema. Estás buscando algo que no encaja: un nombre raro, o — la señal más clara — un proceso corriendo desde `/tmp`, una carpeta temporal que casi nunca es el lugar legítimo para software real."
- **Instrucción:** "Lista los procesos en ejecución con `ps aux`."

### Etapa 3/8 — `lsof -p 4821`
- **Transición:** "Encontraste el proceso sospechoso. Ahora averigua qué tiene abierto."
- **Diálogo:** "`lsof -p <pid>` muestra qué archivos y conexiones de red tiene abiertos un proceso específico. A veces revela algo revelador: que el binario que lo generó ya fue borrado del disco — una táctica común para dificultar el análisis posterior, porque 'si no está el archivo, no hay qué analizar'... o eso cree quien lo hizo."
- **Instrucción:** "Revisa qué tiene abierto ese proceso con `lsof -p` y su PID."

### Etapa 4/8 — `cat /var/log/auth.log`
- **Transición:** "El proceso está corriendo desde hace un rato. ¿Cuándo apareció exactamente?"
- **Diálogo:** "Los logs del sistema registran eventos de autenticación y tareas programadas con marca de tiempo. Correlacionar '¿cuándo apareció este proceso?' con '¿qué evento del log coincide con esa hora?' es análisis de log básico — y suele ser la pieza que conecta síntomas sueltos en una historia coherente."
- **Instrucción:** "Revisa el registro de autenticación con `cat /var/log/auth.log`."

### Etapa 5/8 — `tcpdump -i eth0`
- **Transición:** "El log confirma cuándo entró. Ahora escucha qué está diciendo hacia afuera, en vivo."
- **Diálogo:** "`tcpdump` captura tráfico de red en tiempo real. Un patrón de conexión regular — cada cierto número de segundos, siempre hacia el mismo destino — se llama un *beacon*, y es la huella típica de un canal de control automatizado: el malware 'reportándose' periódicamente a quien lo controla."
- **Instrucción:** "Captura tráfico en vivo con `tcpdump -i eth0`."

### Etapa 6/8 — `sha256sum /tmp/.sysupdate`
- **Transición:** "Confirmado el comportamiento. Falta identificar exactamente qué es."
- **Diálogo:** "Un hash (`sha256sum`) es una huella digital única de un archivo — cualquier cambio, por mínimo que sea, cambia el hash por completo. Calculando el hash del binario sospechoso puedes compararlo contra bases de datos de amenazas conocidas, sin depender de su nombre (que puede mentir) ni de su comportamiento aparente."
- **Instrucción:** "Calcula el hash del binario sospechoso con `sha256sum` y su ruta en `/tmp`."

### Etapa 7/8 — `cat threat-intel.txt`
- **Transición:** "Hash en mano. Ahora cruza esa huella contra lo que ya se sabe."
- **Diálogo:** "La inteligencia de amenazas (*threat intelligence*) es exactamente esto: bases de datos, compartidas entre organizaciones de seguridad, de hashes y patrones ya identificados como maliciosos. Si tu hash coincide con uno documentado, ya sabes con qué tipo de amenaza estás lidiando — y probablemente cómo se comporta."
- **Instrucción:** "Compara el hash con `cat threat-intel.txt`."

### Etapa 8/8 — `echo "hallazgo" > incident-report.txt`
- **Transición:** "Ya sabes qué es, cuándo entró y cómo se comunica. Es momento de dejarlo por escrito."
- **Diálogo:** "Documentar el hallazgo — no solo resolverlo mentalmente — es lo que permite que otra persona del equipo retome el caso, o que quede registro para la respuesta formal que viene en el siguiente nivel. Un hallazgo que solo vive en tu cabeza no ayuda a nadie más."
- **Instrucción:** "Documenta lo encontrado con `echo \"hallazgo\" > incident-report.txt`."

**Cierre de nivel:** INGenioso celebra la detección confirmada y anuncia el Nivel 5: ahora toca actuar.

---

## Nivel 5 — Respuesta a Incidentes (🛡️ Operador de Campo)

### Etapa 1/8 — `ip link set eth0 down`
- **Transición:** "Detectaste la amenaza. Detectar no es lo mismo que resolverla bien — el orden en el que actúes ahora importa tanto como lo que hagas."
- **Diálogo:** "El estándar de referencia en la industria (NIST SP 800-61) define un ciclo claro: contener → erradicar → recuperar. **Contener primero** — aislar el sistema de la red *antes* de tocar cualquier otra cosa — evita que quien esté detrás reaccione, o que el daño siga propagándose mientras investigas."
- **Instrucción:** "Aísla el sistema de la red con `ip link set eth0 down`."

### Etapa 2/8 — `kill -9 4821`
- **Transición:** "Sistema aislado. Ahora sí, elimina la amenaza activa."
- **Diálogo:** "`kill -9` termina un proceso de forma inmediata, sin darle oportunidad de reaccionar o limpiar rastros por su cuenta. Es el primer paso de erradicar — pero solo el primero: un proceso muerto puede volver si algo lo relanza."
- **Instrucción:** "Termina el proceso malicioso con `kill -9` y su PID."

### Etapa 3/8 — `rm -f /tmp/.sysupdate`
- **Transición:** "Proceso terminado. El binario que lo generó sigue ahí, esperando que algo lo vuelva a ejecutar."
- **Diálogo:** "Erradicar significa eliminar tanto el proceso activo como el archivo que lo origina. Dejar el binario en disco, aunque el proceso ya no corra, es dejar la puerta entreabierta."
- **Instrucción:** "Elimina el binario con `rm -f /tmp/.sysupdate`."

### Etapa 4/8 — `crontab -l`
- **Transición:** "Proceso muerto, binario borrado. Pero ¿qué lo lanzó la primera vez? Eso también hay que encontrarlo."
- **Diálogo:** "La **persistencia** es el mecanismo que relanza una amenaza automáticamente — muchas veces, una entrada en `crontab` (el programador de tareas de Linux) que ejecuta el binario cada cierto tiempo. Erradicar solo el proceso, sin quitar la persistencia, es el error más común en respuesta a incidentes: el 'problema resuelto' vuelve solo, minutos después."
- **Instrucción:** "Revisa las tareas programadas con `crontab -l`."

### Etapa 5/8 — `crontab -r`
- **Transición:** "Ahí está la persistencia. Elimínala para que esto no vuelva."
- **Diálogo:** "`crontab -r` elimina todas las tareas programadas del usuario actual — en este caso, específicamente la que relanzaba el binario. Sin esto, todo el trabajo de las etapas anteriores es temporal."
- **Instrucción:** "Elimina la persistencia con `crontab -r`."

### Etapa 6/8 — `apt upgrade clubpanel`
- **Transición:** "Amenaza eliminada, persistencia eliminada. Pero si no corriges cómo entró, alguien más va a volver a entrar por el mismo hueco."
- **Diálogo:** "Recuperar no es solo 'limpiar' — es corregir la causa que permitió la entrada. Si el servicio vulnerable original tenía una versión desactualizada, actualizarla ahora es lo que rompe el ciclo, no solo lo que arregla el síntoma de hoy."
- **Instrucción:** "Actualiza el servicio vulnerable con `apt upgrade clubpanel`."

### Etapa 7/8 — `ip link set eth0 up`
- **Transición:** "Sistema limpio y parchado. Ya puedes reconectarlo con confianza."
- **Diálogo:** "Reconectar antes de tiempo — con la amenaza aún activa o la causa raíz sin corregir — deshace todo lo avanzado. Reconectar *después* de confirmar que está limpio es la secuencia correcta, no al revés."
- **Instrucción:** "Reconecta el sistema con `ip link set eth0 up`."

### Etapa 8/8 — `ps aux`
- **Transición:** "Sistema reconectado. Un último vistazo antes de dar el caso por cerrado."
- **Diálogo:** "Cerrar un incidente sin una verificación final es asumir, no confirmar. Volver a listar los procesos — el mismo comando con el que empezó todo este nivel — y ver una lista limpia es tu confirmación real de que el trabajo quedó bien hecho."
- **Instrucción:** "Confirma que el sistema está limpio con `ps aux`."

**Cierre de nivel:** INGenioso celebra el ciclo completo de respuesta y anuncia el Nivel 6 — un simulacro sin ayuda escalonada, para demostrar que el ciclo completo (reconocimiento → comunicación segura → detección → respuesta) ya es tuyo, no solo del juego.

---

## Nivel 6 — Simulacro de Incidente (🛡️ Operador de Campo → examen)

*Nota de diseño: este nivel es intencionalmente el primer "examen" del juego (junto con los Niveles 13, 21 y 31) — repite exactamente el flujo de los Niveles 1, 3, 4 y 5 contra un servidor nuevo (`192.168.56.30`), sin la mano tomada de la explicación extensa. INGenioso da menos teoría nueva aquí a propósito: el punto pedagógico es que el jugador demuestre que ya lo sabe, no que lo vuelva a aprender.*

### Etapa 1/8 — `nmap -sV 192.168.56.30`
- **Transición:** "Nada de ayuda escalonada esta vez, agente. Sabes hacer esto — demuéstralo."
- **Diálogo:** "Mismo principio del Nivel 1: identificar antes de actuar. Un servidor nuevo, un objetivo nuevo — la metodología no cambia."
- **Instrucción:** "Escanea el servidor con `nmap -sV 192.168.56.30`."

### Etapa 2/8 — `ssh agente@192.168.56.30`
- **Transición:** "Reconocimiento hecho. Conéctate como ya sabes hacerlo."
- **Diálogo:** "El canal cifrado y autenticado que configuraste en el Nivel 3 no era solo para practicar — es cómo te conectas a *cualquier* servidor de aquí en adelante."
- **Instrucción:** "Conéctate al servidor con `ssh agente@192.168.56.30`."

### Etapa 3/8 — `ps aux`
- **Transición:** "Estás dentro. Algo no encaja en este sistema — encuéntralo."
- **Diálogo:** "Vuelve al flujo de detección: procesos primero. Confía en tu instinto de la primera vez."
- **Instrucción:** "Lista los procesos en ejecución con `ps aux`."

### Etapa 4/8 — `sha256sum /tmp/.cachesvc`
- **Transición:** "Encontraste al sospechoso. Confírmalo antes de actuar contra él."
- **Diálogo:** "Nunca actúes solo por sospecha si puedes confirmar — el hash es tu confirmación objetiva, igual que en el Nivel 4."
- **Instrucción:** "Calcula el hash del binario sospechoso con `sha256sum` y su ruta."

### Etapa 5/8 — `kill -9 7733`
- **Transición:** "Confirmado. Contén la amenaza."
- **Diálogo:** "El ciclo de respuesta no cambia de servidor en servidor: contener, erradicar, recuperar. Empieza por lo activo."
- **Instrucción:** "Termina el proceso con `kill -9` y su PID."

### Etapa 6/8 — `crontab -r`
- **Transición:** "Proceso eliminado. Ya sabes lo que sigue — no dejes que vuelva."
- **Diálogo:** "La persistencia es lo primero que se revisa y lo último que se olvida. No te lo vuelvo a explicar esta vez: sabes por qué importa."
- **Instrucción:** "Elimina cualquier persistencia con `crontab -r`."

### Etapa 7/8 — `apt upgrade clubpanel`
- **Transición:** "Amenaza y persistencia fuera. Cierra el hueco por el que entró."
- **Diálogo:** "Recuperar de verdad es corregir la causa, no solo limpiar el síntoma — el mismo principio de siempre."
- **Instrucción:** "Actualiza el servicio vulnerable con `apt upgrade clubpanel`."

### Etapa 8/8 — `echo "cerrado" > informe-final.txt`
- **Transición:** "Sistema limpio, parchado, verificado. Cierra el simulacro como cerrarías un caso real."
- **Diálogo:** "Un incidente no está resuelto hasta que queda documentado. Este informe es tu prueba — para ti mismo y para cualquiera que revise el caso después — de que el ciclo completo se ejecutó bien."
- **Instrucción:** "Entrega tu informe con `echo \"cerrado\" > informe-final.txt`."

**Cierre de nivel:** simulacro superado sin ayuda escalonada. INGenioso reconoce el logro con un halago calibrado por el esfuerzo real del recorrido (Episodio 1 completo), y Vera anuncia el giro: hay algo en el servidor del Nivel 3-5 que no encaja con la firma del bot que provocó el DDoS original — arranca el arco de Bajo Ataque → Forense (Niveles 7-13).

---

## Nivel 7 — Bajo Ataque (🚨 Analista de Respuesta)

*Cambio de rango: INGenioso deja de explicar "desde cero" — ya asume que el jugador entiende los fundamentos. El tono ahora tiene urgencia real: el sitio del club está caído mientras juegas.*

### Etapa 1/8 — `uptime`
- **Transición:** "El sitio del club está lento o caído — ahora, en tiempo real. Esto no es un ejercicio programado."
- **Diálogo:** "Antes de reaccionar hay que confirmar qué está pasando, no asumirlo. `uptime` muestra la carga promedio del sistema — el primer síntoma visible cuando algo satura un servidor."
- **Instrucción:** "Revisa la carga del sistema con `uptime`."

### Etapa 2/8 — `systemctl status nginx`
- **Transición:** "Carga anormal confirmada. ¿El servicio web sigue respondiendo o ya se rindió?"
- **Diálogo:** "`systemctl status` te dice si el servicio (`nginx`, en este caso) sigue activo, y con qué estado — la diferencia entre 'lento' y 'caído' cambia por completo tu siguiente movimiento."
- **Instrucción:** "Revisa el estado del servicio web con `systemctl status nginx`."

### Etapa 3/8 — `ss -s`
- **Transición:** "Servicio vivo pero luchando. Cuantifica cuánta gente — o cuánto tráfico — lo está exigiendo."
- **Diálogo:** "`ss -s` da un resumen de cuántas conexiones simultáneas hay ahora mismo. En un ataque volumétrico real, este número está muy por encima de cualquier tráfico normal — miles de conexiones donde debería haber decenas."
- **Instrucción:** "Cuenta las conexiones activas con `ss -s`."

### Etapa 4/8 — `tail /var/log/nginx/access.log`
- **Transición:** "Las conexiones confirman el volumen. Ahora necesitas ver quién las está generando."
- **Diálogo:** "El log de acceso registra cada petición que llega al sitio, con la IP de origen. Es tu evidencia cruda — el siguiente paso es convertir esa lista larga en algo que puedas leer."
- **Instrucción:** "Revisa el log de accesos con `tail /var/log/nginx/access.log`."

### Etapa 5/8 — `cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head`
- **Transición:** "El log tiene miles de líneas. A mano es imposible — para eso existen las tuberías."
- **Diálogo:** "Encadenar comandos con `|` es la técnica clásica de análisis de logs en terminal: `awk` extrae solo la IP de cada línea, `sort` las ordena para agrupar iguales, `uniq -c` las cuenta, y el segundo `sort -nr` pone las más frecuentes primero. Si 2-3 IPs concentran la enorme mayoría del tráfico, no son usuarios reales — es un flood."
- **Instrucción:** "Resume el log con la tubería: `cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head`."

### Etapa 6/8 — `whois 198.51.100.23`
- **Transición:** "Ahí están las IPs sospechosas. ¿De dónde vienen realmente?"
- **Diálogo:** "`whois` consulta el registro público de una dirección IP: a qué organización o rango pertenece. No siempre revela al atacante directamente, pero te da contexto — y a veces confirma que el tráfico viene de redes que no tienen ninguna razón legítima para hablar con tu sitio."
- **Instrucción:** "Investiga el origen de la primera IP sospechosa con `whois 198.51.100.23`."

### Etapa 7/8 — `grep 198.51.100.23 access.log | wc -l`
- **Transición:** "Ya sabes de dónde viene. Ahora cuantifica exactamente cuánto daño está haciendo esa IP en particular."
- **Diálogo:** "`grep` filtra las líneas que contienen esa IP específica, y `wc -l` cuenta cuántas son. Un número concreto — no una impresión vaga — es lo que necesitas para justificar la siguiente acción y para el informe que viene después."
- **Instrucción:** "Cuantifica el impacto de esa IP con `grep 198.51.100.23 access.log | wc -l`."

### Etapa 8/8 — `echo "DDoS volumétrico" > alerta-ddos.txt`
- **Transición:** "Carga anormal, conexiones masivas, IPs concentradas. El diagnóstico ya es innegable."
- **Diálogo:** "Documentar la alerta formalmente — no solo saberlo internamente — es lo que dispara la respuesta del resto del equipo y queda como registro del incidente desde su origen."
- **Instrucción:** "Documenta la alerta con `echo \"DDoS volumétrico\" > alerta-ddos.txt`."

**Cierre de nivel:** diagnóstico confirmado: ataque de Denegación de Servicio Distribuida (DDoS) volumétrico. INGenioso celebra y anuncia el Nivel 8 — hay que frenar la hemorragia antes de poder pensar en algo permanente.

---

## Nivel 8 — Mitigación de Emergencia (🚨 Analista de Respuesta)

### Etapa 1/8 — `iptables -A INPUT -s 198.51.100.23 -j DROP`
- **Transición:** "Diagnóstico hecho. Ahora frena la hemorragia primero, piensa en soluciones elegantes después."
- **Diálogo:** "`iptables -A INPUT -s <ip> -j DROP` agrega una regla al firewall que descarta en silencio todo el tráfico de esa IP específica. Es rápido — exactamente lo que necesitas en este momento."
- **Instrucción:** "Bloquea la primera IP identificada con `iptables -A INPUT -s 198.51.100.23 -j DROP`."

### Etapa 2/8 — `iptables -A INPUT -s 198.51.100.87 -j DROP`
- **Transición:** "Una menos. Pero identificaste tres IPs concentrando el tráfico, no una."
- **Diálogo:** "Bloquear IP por IP escala mal, pero en este momento es lo único que tienes disponible de forma inmediata — sigue con la siguiente."
- **Instrucción:** "Bloquea la segunda IP con `iptables -A INPUT -s 198.51.100.87 -j DROP`."

### Etapa 3/8 — `iptables -A INPUT -s 198.51.100.144 -j DROP`
- **Transición:** "Dos bloqueadas. Cierra el círculo con la tercera."
- **Diálogo:** "Con las tres principales bloqueadas, el grueso del volumen debería caer — pero un atacante decidido puede rotar de IP, y el bloqueo manual siempre va un paso atrás de eso."
- **Instrucción:** "Bloquea la tercera IP con `iptables -A INPUT -s 198.51.100.144 -j DROP`."

### Etapa 4/8 — `fail2ban-client status`
- **Transición:** "Las tres están bloqueadas... y justo apareció una cuarta. Exactamente lo que temías."
- **Diálogo:** "`fail2ban` automatiza lo que acabas de hacer a mano: monitorea patrones (como demasiadas peticiones en poco tiempo) y banea IPs dinámicamente, sin que tengas que estar ahí cada vez que aparece una nueva."
- **Instrucción:** "Revisa el estado de fail2ban con `fail2ban-client status`."

### Etapa 5/8 — `fail2ban-client set nginx-req-limit banip 198.51.100.200`
- **Transición:** "fail2ban está activo pero esta IP nueva se le escapó. Aplícale el baneo directamente."
- **Diálogo:** "Puedes forzar un baneo inmediato dentro de un 'jail' (grupo de reglas) específico de fail2ban — así no dependes solo de que lo detecte automáticamente a tiempo."
- **Instrucción:** "Banea la IP nueva con `fail2ban-client set nginx-req-limit banip 198.51.100.200`."

### Etapa 6/8 — `iptables -L -n`
- **Transición:** "Cuatro IPs fuera. Verifica que tus reglas realmente están activas antes de confiar en ellas."
- **Diálogo:** "`iptables -L -n` lista todas las reglas de firewall activas en este momento — un hábito profesional esencial: nunca asumas que una regla se aplicó solo porque escribiste el comando para crearla."
- **Instrucción:** "Lista las reglas activas con `iptables -L -n`."

### Etapa 7/8 — `ss -s`
- **Transición:** "Reglas confirmadas. ¿Bajó realmente el número de conexiones?"
- **Diálogo:** "Vuelve a medir lo mismo que mediste al detectar el ataque — comparar el número de antes contra el de ahora es la única forma objetiva de confirmar que tu mitigación está funcionando de verdad."
- **Instrucción:** "Vuelve a contar las conexiones activas con `ss -s`."

### Etapa 8/8 — `echo "..." > mitigacion-inicial.txt`
- **Transición:** "Las conexiones bajaron. La emergencia inmediata está controlada — mientras dure."
- **Diálogo:** "Bloquear a mano fue necesario y correcto en el momento, pero ningún equipo serio se queda solo con eso: si el atacante rota de IP otra vez, vas a estar exactamente en el mismo punto. Documenta este avance como lo que es — una solución temporal."
- **Instrucción:** "Documenta la mitigación inicial con `echo \"...\" > mitigacion-inicial.txt`."

**Cierre de nivel:** INGenioso celebra haber contenido lo inmediato, y anuncia el Nivel 9: momento de construir algo que no dependa de que tú estés mirando la pantalla las 24 horas.

---

## Nivel 9 — Endurecimiento (🚨 Analista de Respuesta)

### Etapa 1/8 — `cp ratelimit-nginx.conf /etc/nginx/conf.d/ratelimit.conf`
- **Transición:** "Bloqueo manual: hecho, pero no escala. Toca construir una defensa que no dependa de ti."
- **Diálogo:** "En vez de decidir IP por IP, vas a instalar una configuración que aplica una regla general de una vez — el primer paso es copiar esa configuración a donde el servidor web la va a leer."
- **Instrucción:** "Copia la configuración con `cp ratelimit-nginx.conf /etc/nginx/conf.d/ratelimit.conf`."

### Etapa 2/8 — `nginx -t`
- **Transición:** "Configuración copiada. No la actives todavía."
- **Diálogo:** "`nginx -t` prueba la sintaxis de una configuración *antes* de aplicarla — un hábito profesional esencial. Una configuración con un error tumba el sitio exactamente igual que un ataque, y sería un pésimo momento para descubrirlo a la fuerza."
- **Instrucción:** "Prueba la sintaxis con `nginx -t`."

### Etapa 3/8 — `systemctl reload nginx`
- **Transición:** "Sintaxis válida. Ahora sí, aplícala sin tumbar el servicio."
- **Diálogo:** "`reload` aplica una configuración nueva sin interrumpir las conexiones activas — a diferencia de `restart`, que sí las corta. En medio de un incidente, esa diferencia importa."
- **Instrucción:** "Aplica el cambio sin caídas con `systemctl reload nginx`."

### Etapa 4/8 — `iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT`
- **Transición:** "Configuración del servidor web lista. Ahora la misma idea, a nivel de firewall."
- **Diálogo:** "El **rate limiting** (límite de tasa) es la defensa estructural real: en vez de bloquear IPs específicas, defines cuántas peticiones por minuto se aceptan de cualquier origen. Nadie decide manualmente — la regla decide sola, todo el tiempo."
- **Instrucción:** "Agrega el límite de tasa con `iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT`."

### Etapa 5/8 — `clubwaf --mode=under-attack enable`
- **Transición:** "Límite de tasa activo. Para un ataque grande, hay un nivel más."
- **Diálogo:** "Un 'modo bajo ataque' (challenge mode, como el que usan CDNs reales tipo Cloudflare) agrega un reto extra que un bot automatizado simple no puede resolver — filtra tráfico sin bloquear a usuarios reales, que sí pueden pasar la verificación."
- **Instrucción:** "Activa el modo bajo ataque con `clubwaf --mode=under-attack enable`."

### Etapa 6/8 — `fail2ban-client status nginx-req-limit`
- **Transición:** "Tres capas activas: rate limiting de nginx, firewall, modo bajo ataque. Verifica que el jail de fail2ban sigue coordinado con todo esto."
- **Diálogo:** "Cada capa cubre lo que la anterior no alcanza a tiempo — por eso se combinan, no se reemplazan entre sí. Confirmar que todas siguen activas a la vez es parte de terminar bien el trabajo."
- **Instrucción:** "Revisa el jail específico con `fail2ban-client status nginx-req-limit`."

### Etapa 7/8 — `uptime`
- **Transición:** "Todas las capas activas y coordinadas. ¿Cómo se ve la carga del sistema ahora?"
- **Diálogo:** "Vuelve a medir lo mismo con lo que empezaste el Episodio: la carga del sistema. Verla estabilizada, incluso con tráfico hostil de fondo, es la prueba de que el endurecimiento realmente funciona."
- **Instrucción:** "Verifica la carga con `uptime`."

### Etapa 8/8 — `echo "..." > endurecimiento.txt`
- **Transición:** "Carga estable, tres capas de defensa activas. Esto ya no depende de que alguien esté mirando la pantalla."
- **Diálogo:** "Esta es, en esencia, la misma función que cumplen servicios como Cloudflare o AWS Shield en producción: absorber y filtrar tráfico masivo antes de que llegue al servidor real. Documenta el endurecimiento como el cierre técnico que es."
- **Instrucción:** "Documenta el endurecimiento con `echo \"...\" > endurecimiento.txt`."

**Cierre de nivel:** INGenioso celebra la defensa estructural completa y anuncia el Nivel 10: hora de levantar todo con calma y cerrar el incidente como se debe.

---

## Nivel 10 — Recuperación (🚨 Analista de Respuesta)

### Etapa 1/8 — `systemctl restart clubpanel-api`
- **Transición:** "El ataque está contenido de verdad. Ahora, con calma, levanta lo que se apagó por precaución."
- **Diálogo:** "Cerrar un incidente de disponibilidad implica más que 'ya no está caído' — hay servicios que se detuvieron o degradaron durante el caos y necesitan reiniciarse deliberadamente, no solo esperar a que se recuperen solos."
- **Instrucción:** "Reinicia el backend con `systemctl restart clubpanel-api`."

### Etapa 2/8 — `systemctl status clubpanel-api`
- **Transición:** "Reiniciado. No asumas que arrancó bien — confírmalo."
- **Diálogo:** "El mismo hábito de siempre: después de una acción, verificar el resultado, no solo ejecutar el comando y seguir adelante."
- **Instrucción:** "Confirma el estado con `systemctl status clubpanel-api`."

### Etapa 3/8 — `curl -I https://clubdeingenieria.lab`
- **Transición:** "Backend saludable. ¿El sitio completo responde de punta a punta para un usuario real?"
- **Diálogo:** "`curl -I` hace una petición real al sitio y muestra solo las cabeceras de la respuesta — la forma más directa de confirmar 'esto funciona' desde la perspectiva de quien lo visita, no solo desde dentro del servidor."
- **Instrucción:** "Verifica el sitio con `curl -I https://clubdeingenieria.lab`."

### Etapa 4/8 — `sha256sum index.html`
- **Transición:** "El sitio responde. Pero disponibilidad no es lo único que importa — confirma que el contenido sigue siendo el correcto."
- **Diálogo:** "Durante el caos de un ataque, también es posible que algo se haya alterado sin que nadie lo note. Comparar el hash del archivo actual contra un valor de referencia confirma la **integridad**: que el contenido es exactamente el que debería ser, no una versión modificada."
- **Instrucción:** "Confirma la integridad del sitio con `sha256sum index.html`."

### Etapa 5/8 — `cat metricas-incidente.txt`
- **Transición:** "Disponibilidad e integridad confirmadas. Ahora dimensiona lo que realmente pasó."
- **Diálogo:** "Cerrar con métricas reales del impacto — duración, peticiones bloqueadas, picos de tráfico — es lo que permite escribir un postmortem útil después, en vez de una descripción vaga tipo 'estuvimos caídos un rato'."
- **Instrucción:** "Revisa el impacto con `cat metricas-incidente.txt`."

### Etapa 6/8 — `alertas-cli enable ddos-watch`
- **Transición:** "Impacto documentado. Que la próxima vez te avisen antes de que un usuario tenga que decírtelo."
- **Diálogo:** "Cerrar un incidente sin mejorar la detección para el futuro es desperdiciar la lección más valiosa que deja. Activa vigilancia específica para este tipo de patrón."
- **Instrucción:** "Activa vigilancia con `alertas-cli enable ddos-watch`."

### Etapa 7/8 — `alertas-cli test ddos-watch`
- **Transición:** "Alerta activada. Nunca confíes en una alarma que nunca probaste."
- **Diálogo:** "Una alerta configurada pero nunca probada es una suposición, no una garantía — vas a ver este mismo principio otra vez, aplicado a respaldos, en el Nivel 24."
- **Instrucción:** "Prueba la alerta con `alertas-cli test ddos-watch`."

### Etapa 8/8 — `echo "..." > postmortem-ddos.txt`
- **Transición:** "Todo verificado: servicios arriba, contenido íntegro, impacto medido, alerta probada. Cierra el capítulo."
- **Diálogo:** "El 'postmortem sin culpa' — documentar qué pasó y cómo evitarlo, sin buscar a quién señalar — es una práctica estándar en equipos de infraestructura serios. Escribe el tuyo."
- **Instrucción:** "Cierra el incidente con `echo \"...\" > postmortem-ddos.txt`."

**Cierre de nivel:** incidente de DDoS oficialmente cerrado. Pero al revisar una última vez el servidor del Nivel 3-5, INGenioso y Vera notan algo que no encaja con la firma del bot — un archivo que no debería estar ahí. El DDoS pudo haber sido una cortina de humo. Arranca el Nivel 11.

---

## Nivel 11 — Rastreo de Indicios (🔍 Investigador Forense)

*Cambio de rango: el tono se vuelve meticuloso, casi detectivesco. INGenioso dice menos y deja que las pistas hablen — pero cada explicación técnica sigue siendo completa.*

### Etapa 1/8 — `ssh agente@192.168.56.20`
- **Transición:** "Algo no encaja con la firma del bot del DDoS. Alguien entró antes del ataque — y el ataque fue la cortina de humo."
- **Diálogo:** "Vuelves al mismo servidor de antes, pero ahora con otros ojos: ya no buscas 'qué está fallando', buscas 'quién estuvo aquí'."
- **Instrucción:** "Reconéctate al servidor con `ssh agente@192.168.56.20`."

### Etapa 2/8 — `stat sospechoso.sh`
- **Transición:** "Estás dentro. El triage forense empieza por los metadatos, no por el contenido."
- **Diálogo:** "`stat` muestra las fechas de un archivo: cuándo se creó, cuándo se modificó por última vez. Un archivo modificado a las 3 de la mañana, cuando nadie del equipo estaba trabajando, es sospechoso solo por el horario — antes de siquiera abrirlo."
- **Instrucción:** "Revisa las fechas del archivo con `stat sospechoso.sh`."

### Etapa 3/8 — `file sospechoso.sh`
- **Transición:** "Horario sospechoso confirmado. ¿Es realmente lo que su nombre dice que es?"
- **Diálogo:** "`file` identifica el tipo *real* de un archivo analizando su contenido binario, no su nombre ni su extensión. Un archivo `.sh` que en realidad es un ejecutable ELF es un disfraz clásico — la extensión es solo una convención, nunca una garantía."
- **Instrucción:** "Confirma el tipo real del archivo con `file sospechoso.sh`."

### Etapa 4/8 — `strings sospechoso.sh | grep -i http`
- **Transición:** "No es un script, es un binario disfrazado. Los binarios a veces hablan más de lo que su autor quisiera."
- **Diálogo:** "`strings` extrae todo el texto legible dentro de un archivo binario — a menudo revela URLs, IPs o mensajes de depuración que quien lo escribió no pensó en ocultar. Filtrar por 'http' es buscar específicamente direcciones a las que ese binario se conecta."
- **Instrucción:** "Busca texto legible con `strings sospechoso.sh | grep -i http`."

### Etapa 5/8 — `cat .bash_history`
- **Transición:** "Una URL de contacto. Ahora reconstruye qué comandos se ejecutaron antes de que aparezca este archivo."
- **Diálogo:** "El historial de comandos de un usuario (`.bash_history`) es, literalmente, un registro cronológico de qué se escribió en esa terminal. Rara vez alguien lo borra por completo — y cuando sí lo hacen, esa ausencia es en sí misma una pista."
- **Instrucción:** "Revisa el historial de comandos con `cat .bash_history`."

### Etapa 6/8 — `exiftool señuelo.jpg`
- **Transición:** "El historial confirma la secuencia. Hay una imagen que llegó junto con todo esto — las imágenes también dejan huellas."
- **Diálogo:** "`exiftool` lee los metadatos ocultos de una imagen: a veces incluyen el software usado para crearla o editarla, el autor, hasta coordenadas GPS si el dispositivo las guardó. Información que nadie ve a simple vista, pero que sigue ahí."
- **Instrucción:** "Revisa los metadatos de la imagen con `exiftool señuelo.jpg`."

### Etapa 7/8 — `grep nullshadow77 access.log`
- **Transición:** "Un nombre empieza a repetirse en las piezas sueltas. Cruza esa referencia contra el registro de acceso web."
- **Diálogo:** "Correlacionar un mismo indicio — un nombre, un hash, un patrón — a través de *todas* las piezas de evidencia es lo que convierte fragmentos aislados en una historia coherente, no una casualidad."
- **Instrucción:** "Cruza el nombre con el log con `grep nullshadow77 access.log`."

### Etapa 8/8 — `echo "..." > indicios.txt`
- **Transición:** "Metadatos, historial, imagen, log — todo apunta al mismo nombre. Es momento de dejarlo por escrito, con cuidado."
- **Diálogo:** "A partir de aquí, cada paso que des importa doblemente: no solo estás investigando, estás empezando a construir evidencia que podría sostenerse ante algo más formal que una conversación interna. Documenta con precisión."
- **Instrucción:** "Documenta los indicios encontrados con `echo \"...\" > indicios.txt`."

**Cierre de nivel:** primera pista real de identidad: `nullshadow77`. INGenioso reconoce el hallazgo con seriedad — esto ya no es un incidente aislado — y anuncia el Nivel 12: antes de analizar nada más a fondo, hay que preservar la evidencia como se debe.

---

## Nivel 12 — Captura Forense (🔍 Investigador Forense)

### Etapa 1/8 — `ip link set eth0 down`
- **Transición:** "Tienes indicios reales. A partir de ahora, un descuido invalida todo lo que sigue."
- **Diálogo:** "El principio rector forense es nunca analizar la evidencia original. El primer paso, igual que en respuesta a incidentes, es aislar el equipo — para que nada, ni siquiera un proceso automático del propio sistema, siga modificando su estado mientras trabajas."
- **Instrucción:** "Aísla el equipo con `ip link set eth0 down`."

### Etapa 2/8 — `dc3dd if=/dev/sdb1 of=evidencia.img hash=sha256 log=captura.log`
- **Transición:** "Sistema aislado. Ahora, la pieza central de todo el nivel: la copia forense."
- **Diálogo:** "`dc3dd` (una variante de `dd` diseñada para forense) crea una copia **bit a bit** — no solo de los archivos, sino de cada sector del disco, incluyendo espacio 'vacío' que puede contener datos borrados recuperables. El flag `hash=sha256` calcula el hash automáticamente durante la copia, y `log` guarda ese registro."
- **Instrucción:** "Crea la copia forense con `dc3dd if=/dev/sdb1 of=evidencia.img hash=sha256 log=captura.log`."

### Etapa 3/8 — `sha256sum evidencia.img`
- **Transición:** "Copia creada, con su hash registrado automáticamente. Ahora calcúlalo tú mismo, de forma independiente."
- **Diálogo:** "Calcular el hash por tu cuenta — sin depender del que reportó `dc3dd` — es lo que te permite comparar dos fuentes independientes. Si coinciden, tienes prueba matemática de que nadie alteró la copia entre el momento en que se creó y ahora."
- **Instrucción:** "Calcula el hash de la copia con `sha256sum evidencia.img`."

### Etapa 4/8 — `cat captura.log`
- **Transición:** "Tienes tu hash calculado. Compáralo contra lo que quedó registrado durante la copia."
- **Diálogo:** "Si el hash que acabas de calcular coincide con el que `dc3dd` registró al momento de copiar, la copia es idéntica al original, byte por byte — verificado, no asumido."
- **Instrucción:** "Compara los hashes con `cat captura.log`."

### Etapa 5/8 — `echo "Evidencia #001..." > cadena-custodia.txt`
- **Transición:** "Copia verificada. A partir de aquí, todo el análisis se hace sobre ella, nunca sobre el original."
- **Diálogo:** "La **cadena de custodia** documenta por escrito quién tuvo la evidencia, cuándo, y qué le hizo. Cualquier hueco en ese registro debilita su valor como prueba, sin importar qué tan buena sea la evidencia en sí misma — así que empieza el registro ahora, con la etiqueta inicial."
- **Instrucción:** "Etiqueta la evidencia con `echo \"Evidencia #001...\" > cadena-custodia.txt`."

### Etapa 6/8 — `cp evidencia.img /lab/evidencia/`
- **Transición:** "Cadena de custodia iniciada. Mueve la copia a su ubicación oficial de resguardo."
- **Diálogo:** "Cada movimiento físico o lógico de la evidencia — incluso uno tan simple como copiarla a otra carpeta — es un evento que la cadena de custodia debería poder reconstruir después."
- **Instrucción:** "Transporta la evidencia con `cp evidencia.img /lab/evidencia/`."

### Etapa 7/8 — `echo "Recibido..." >> cadena-custodia.txt`
- **Transición:** "Evidencia transferida. Registra la recepción — no asumas que el traslado se documenta solo."
- **Diálogo:** "Fíjate en el operador: `>>` en vez de `>`. Uno sobrescribe el archivo completo; el otro *agrega* una línea nueva sin borrar lo que ya había. La cadena de custodia es un registro acumulativo — nunca reemplazas una entrada anterior."
- **Instrucción:** "Registra la recepción con `echo \"Recibido...\" >> cadena-custodia.txt`."

### Etapa 8/8 — `sha256sum -c evidencia.sha256`
- **Transición:** "Cadena de custodia completa. Un último cierre antes de pasar al análisis real."
- **Diálogo:** "`sha256sum -c` verifica automáticamente un archivo contra un hash guardado previamente — la forma programática de confirmar 'esta evidencia sigue siendo exactamente la misma', el mismo principio de integridad que vas a usar una y otra vez en el resto del juego."
- **Instrucción:** "Verifica la integridad final con `sha256sum -c evidencia.sha256`."

**Cierre de nivel:** evidencia preservada correctamente, cadena de custodia sin huecos. INGenioso lo celebra — este nivel no perdona atajos — y anuncia el Nivel 13: el peritaje final, sin ayuda escalonada.

---

## Nivel 13 — Peritaje Informático (🔍 Investigador Forense → examen)

*Nivel examen (como el 6, 21 y 31): INGenioso confía en que el jugador ya domina la metodología forense — menos explicación nueva, más ejecución precisa.*

### Etapa 1/8 — `autopsy --new-case Caso-DDoS-001 --add evidencia.img`
- **Transición:** "La evidencia está lista, preservada como corresponde. Ahora analízala con una herramienta profesional real."
- **Diálogo:** "Autopsy (construida sobre The Sleuth Kit) es gratuita, de código abierto, y se usa en investigaciones forenses reales. Todo caso empieza igual: se crea el expediente y se le agrega la imagen que vas a analizar."
- **Instrucción:** "Abre el caso con `autopsy --new-case Caso-DDoS-001 --add evidencia.img`."

### Etapa 2/8 — `autopsy --index`
- **Transición:** "Caso creado. Antes de poder buscar nada, la herramienta necesita entender qué hay dentro."
- **Diálogo:** "Indexar el contenido de la imagen es lo que hace posible buscar dentro de ella después — como el índice de un libro, pero construido automáticamente sobre gigabytes de datos."
- **Instrucción:** "Indexa la imagen con `autopsy --index`."

### Etapa 3/8 — `autopsy --timeline`
- **Transición:** "Indexado. Reconstruye el orden real de los eventos."
- **Diálogo:** "Una línea de tiempo forense ordena cuándo se creó, modificó o ejecutó cada archivo relevante — a menudo revela la secuencia real de un ataque de una forma que ningún archivo individual, visto solo, podría mostrar."
- **Instrucción:** "Reconstruye la línea de tiempo con `autopsy --timeline`."

### Etapa 4/8 — `autopsy --recover-deleted`
- **Transición:** "La línea de tiempo tiene un hueco. Alguien intentó borrar algo."
- **Diálogo:** "Borrar un archivo no es lo mismo que sobrescribirlo — el espacio queda marcado como libre, pero el contenido suele seguir ahí hasta que algo nuevo lo pisa físicamente. La recuperación forense aprovecha exactamente esa diferencia."
- **Instrucción:** "Recupera archivos borrados con `autopsy --recover-deleted`."

### Etapa 5/8 — `autopsy --search nullshadow77`
- **Transición:** "Archivos recuperados. Busca ese nombre que ya viste antes, ahora en todo el caso completo."
- **Diálogo:** "Buscar un mismo término a través de toda la evidencia indexada — no archivo por archivo a mano — es lo que hace viable analizar un caso grande en tiempo razonable."
- **Instrucción:** "Busca coincidencias con `autopsy --search nullshadow77`."

### Etapa 6/8 — `autopsy --report generate`
- **Transición:** "Las coincidencias confirman todo lo que sospechabas. Momento de convertirlo en un informe formal."
- **Diálogo:** "Un informe pericial no es una opinión — es una compilación trazable de evidencia. `--report generate` construye ese primer borrador a partir de todo lo que indexaste, recuperaste y encontraste."
- **Instrucción:** "Genera el borrador del informe con `autopsy --report generate`."

### Etapa 7/8 — `autopsy --verify-report`
- **Transición:** "Borrador generado. No lo entregues sin revisarlo."
- **Diálogo:** "Cada conclusión de un informe pericial debe poder rastrearse hasta la evidencia concreta que la sostiene. Verificar el informe antes de cerrarlo es la última oportunidad de detectar una afirmación que suena bien pero que no tiene respaldo suficiente."
- **Instrucción:** "Verifica la consistencia del informe con `autopsy --verify-report`."

### Etapa 8/8 — `echo "..." > informe-pericial.txt`
- **Transición:** "Informe verificado. Cierra el caso con tu firma."
- **Diálogo:** "Esta metodología completa — identificar, preservar, recolectar, examinar, analizar, presentar — sigue estándares reales como NIST SP 800-86 e ISO/IEC 27037, y es la base de certificaciones profesionales como GCFA o CHFI."
- **Instrucción:** "Redacta tu informe final con `echo \"...\" > informe-pericial.txt`."

**Cierre de nivel:** caso pericial cerrado con nombre e indicios documentados. Vera reconoce el trabajo con una frase que pesa: "cierra el caso, agente — te lo ganaste." INGenioso anuncia el Nivel 14: usar lo aprendido para dejar de reaccionar y empezar a buscar los puntos ciegos del club antes de que alguien más los encuentre.

---

## Nivel 14 — Reconocimiento Web (🕸️ Auditor Ofensivo)

*Cambio de rango: INGenioso habla ahora como colega técnico — explica el **porqué** de las reglas de un pentest profesional, no solo el comando. A los 1.6s de entrar a este nivel aparece la intrusión de nullshadow77 (evento ya implementado, sin cambios).*

### Etapa 1/8 — `whatweb https://clubdeingenieria.lab`
- **Transición:** "Atrapaste una amenaza real. Ahora usemos esa misma disciplina para encontrar los puntos ciegos del club antes de que alguien más lo haga — con autorización por escrito, claro."
- **Diálogo:** "El reconocimiento web repite la lógica del Nivel 1, pero a nivel de aplicación. `whatweb` identifica la pila tecnológica de un sitio — servidor, framework, librerías — por sus huellas: cabeceras HTTP, patrones del HTML."
- **Instrucción:** "Identifica la tecnología del sitio con `whatweb https://clubdeingenieria.lab`."

### Etapa 2/8 — `nmap -sV -p- clubdeingenieria.lab`
- **Transición:** "Ya sabes qué corre por dentro. Ahora, un reconocimiento de red más exhaustivo que el del Nivel 1."
- **Diálogo:** "El flag `-p-` le dice a `nmap` que escanee **todos** los 65535 puertos posibles, no solo los más comunes. Es más lento, pero un servicio olvidado en un puerto inusual es exactamente el tipo de cosa que un escaneo rápido se pierde."
- **Instrucción:** "Escanea todos los puertos con `nmap -sV -p- clubdeingenieria.lab`."

### Etapa 3/8 — `gobuster dir -u https://clubdeingenieria.lab -w wordlist-web.txt`
- **Transición:** "Puertos mapeados. Ahora busca rutas que no están enlazadas desde ningún lado visible."
- **Diálogo:** "`gobuster` fuerza bruta rutas comunes (`/admin`, `/api`, `/.git`) contra un diccionario de nombres probables — revela endpoints que existen en el servidor aunque ningún link público apunte hacia ellos."
- **Instrucción:** "Descubre rutas ocultas con `gobuster dir -u https://clubdeingenieria.lab -w wordlist-web.txt`."

### Etapa 4/8 — `curl -s https://clubdeingenieria.lab/robots.txt`
- **Transición:** "Rutas mapeadas. Antes de seguir, revisa lo que el propio sitio te dice explícitamente que no mires."
- **Diálogo:** "Irónicamente, `robots.txt` — pensado para decirle a los buscadores qué NO indexar — a menudo termina siendo un mapa de las rutas más sensibles de un sitio, justo porque alguien quiso ocultarlas de Google."
- **Instrucción:** "Revisa el archivo con `curl -s https://clubdeingenieria.lab/robots.txt`."

### Etapa 5/8 — `curl -I https://clubdeingenieria.lab/api/version`
- **Transición:** "Pista interesante en robots.txt. Sigue el rastro hacia el endpoint de versión de la API."
- **Diálogo:** "Un endpoint que expone la versión exacta del software en ejecución es información valiosa para quien audita — y para quien ataca: las versiones desactualizadas son, con mucha frecuencia, la vulnerabilidad en sí misma."
- **Instrucción:** "Revisa el endpoint de versión con `curl -I https://clubdeingenieria.lab/api/version`."

### Etapa 6/8 — `curl https://clubdeingenieria.lab/.git/HEAD`
- **Transición:** "Versión identificada. Pero gobuster encontró algo mucho más grave escondido en las rutas."
- **Diálogo:** "Un directorio `.git` accesible desde la web es una de las fugas de información más comunes y más graves en despliegues reales — expone el historial completo del código fuente, incluyendo configuración y, a veces, credenciales olvidadas en commits antiguos."
- **Instrucción:** "Confirma la exposición con `curl https://clubdeingenieria.lab/.git/HEAD`."

### Etapa 7/8 — `wget -r https://clubdeingenieria.lab/.git/`
- **Transición:** "Confirmado: el repositorio completo está expuesto. Descárgalo para analizarlo con calma."
- **Diálogo:** "`wget -r` descarga recursivamente toda la estructura de carpetas y archivos accesibles bajo esa ruta — te lleva el repositorio git completo a tu máquina para examinarlo offline, historial de commits incluido."
- **Instrucción:** "Descarga el repositorio expuesto con `wget -r https://clubdeingenieria.lab/.git/`."

### Etapa 8/8 — `echo "..." > recon-web.txt`
- **Transición:** "Tecnología, puertos, rutas ocultas, y un repositorio git completo expuesto al público. Suficiente para un primer hallazgo serio."
- **Diálogo:** "Documentar el reconocimiento completo — no solo el hallazgo más llamativo — le da contexto a cualquiera que revise el caso después sobre cómo llegaste hasta ahí."
- **Instrucción:** "Documenta el reconocimiento con `echo \"...\" > recon-web.txt`."

**Cierre de nivel:** INGenioso celebra el hallazgo del `.git` expuesto — un clásico real — y anuncia el Nivel 15: el código fuente recién descargado revela algo más.

---

## Nivel 15 — Análisis de Dependencias (🕸️ Auditor Ofensivo)

### Etapa 1/8 — `cat package.json`
- **Transición:** "Tienes el código fuente completo ahora. Empieza por ver de qué está hecho realmente."
- **Diálogo:** "El software moderno depende de decenas o cientos de librerías de terceros. `package.json` lista exactamente cuáles usa este proyecto y en qué versión — tu punto de partida para auditar la cadena de suministro."
- **Instrucción:** "Revisa las dependencias con `cat package.json`."

### Etapa 2/8 — `npm audit`
- **Transición:** "Lista de dependencias en mano. Ahora, revísalas automáticamente contra vulnerabilidades conocidas."
- **Diálogo:** "`npm audit` escanea todas las dependencias del proyecto contra bases de datos de vulnerabilidades conocidas (CVE) — en segundos, hace lo que a mano tomaría revisar librería por librería."
- **Instrucción:** "Escanéalas con `npm audit`."

### Etapa 3/8 — `npm info plantilla-carrusel`
- **Transición:** "El audit marcó una dependencia en rojo. Investígala más a fondo."
- **Diálogo:** "`npm info` revela metadatos del paquete: cuándo se publicó por última vez, cuántos mantenedores tiene, qué tan activo está. Estas son las señales de abandono — un paquete sin actividad reciente es un paquete sin quien lo repare."
- **Instrucción:** "Investiga el paquete sospechoso con `npm info plantilla-carrusel`."

### Etapa 4/8 — `cat cve-detalle.txt`
- **Transición:** "Confirmado: nadie lo mantiene hace tiempo. Revisa exactamente qué vulnerabilidad tiene documentada."
- **Diálogo:** "Conocer el CVE específico — no solo 'tiene una vulnerabilidad' — te dice qué tan explotable es realmente y qué condiciones se necesitan para aprovecharla. Esa precisión es la diferencia entre un hallazgo útil y una alarma vaga."
- **Instrucción:** "Revisa el detalle del CVE con `cat cve-detalle.txt`."

### Etapa 5/8 — `curl -I https://clubdeingenieria.lab/api/version`
- **Transición:** "Vulnerabilidad documentada. Confirma si la versión que corre en producción es realmente la afectada."
- **Diálogo:** "Un hallazgo teórico ('esta librería tiene un CVE') vale poco sin confirmar que el sitio real está usando esa versión específica. Cruza lo que acabas de leer contra lo que ya viste en el reconocimiento del Nivel 14."
- **Instrucción:** "Confírmalo con `curl -I https://clubdeingenieria.lab/api/version`."

### Etapa 6/8 — `npm view plantilla-carrusel versions`
- **Transición:** "Confirmado: producción corre la versión vulnerable. Busca si existe alguna versión más nueva que la corrija."
- **Diálogo:** "`npm view <paquete> versions` lista todo el historial de versiones publicadas. Cuando no existe un parche disponible — paquete verdaderamente abandonado — la solución correcta no es esperar: es reemplazar la dependencia por una alternativa mantenida activamente."
- **Instrucción:** "Busca un parche disponible con `npm view plantilla-carrusel versions`."

### Etapa 7/8 — `echo "..." > riesgo-dependencia.txt`
- **Transición:** "No hay parche — el paquete está muerto. Documenta el riesgo de cadena de suministro con claridad."
- **Diálogo:** "El **riesgo de cadena de suministro** aparece exactamente así: una dependencia deja de mantenerse, sin parches de seguridad, con un único responsable inactivo — y sigue en producción de todos modos, sin que nadie lo note hasta que alguien la audita."
- **Instrucción:** "Documenta el riesgo con `echo \"...\" > riesgo-dependencia.txt`."

### Etapa 8/8 — `echo "..." > hallazgo-critico.txt`
- **Transición:** "Riesgo documentado con todo su contexto. Regístralo como el hallazgo crítico que es."
- **Diálogo:** "Este hallazgo se resuelve en el Nivel 17 — reemplazando la dependencia, no esperando un parche que nunca va a llegar. Por ahora, tu trabajo es dejarlo registrado con la severidad que merece."
- **Instrucción:** "Registra el hallazgo crítico con `echo \"...\" > hallazgo-critico.txt`."

**Cierre de nivel:** dependencia abandonada identificada como riesgo crítico real de cadena de suministro. INGenioso anuncia el Nivel 16: confirmar el riesgo con una prueba de concepto controlada y autorizada.

---

## Nivel 16 — Explotación Controlada (🕸️ Auditor Ofensivo)

### Etapa 1/8 — `cat autorizacion-pentest.txt`
- **Transición:** "Encontraste el riesgo. Antes de confirmarlo con una prueba real, hay un paso que nunca se salta."
- **Diálogo:** "Un pentest profesional sigue reglas estrictas, y la primera es innegociable: autorización por escrito con alcance definido, *antes* de cualquier acción. La técnica que vas a usar hoy es idéntica a la de un ataque real — lo único que la distingue es este documento."
- **Instrucción:** "Revisa la autorización con `cat autorizacion-pentest.txt`."

### Etapa 2/8 — `msfconsole`
- **Transición:** "Autorización confirmada, alcance claro. Abre la herramienta."
- **Diálogo:** "Metasploit (`msfconsole`) es el framework de explotación más usado en la industria para pentesting autorizado, y base de certificaciones como la OSCP. No es una herramienta 'de hacker malo' — es un estándar profesional, usado responsablemente."
- **Instrucción:** "Abre el framework con `msfconsole`."

### Etapa 3/8 — `use exploit/lab_ficticio/clubpanel_carrusel_deser`
- **Transición:** "Framework abierto. Selecciona el módulo específico para la vulnerabilidad que ya documentaste."
- **Diálogo:** "El flujo típico de Metasploit es siempre el mismo: `use` selecciona el módulo, `set` configura el objetivo, `exploit` ejecuta. Empieza por seleccionar exactamente el módulo que corresponde al CVE que investigaste en el Nivel 15."
- **Instrucción:** "Selecciona el módulo con `use exploit/lab_ficticio/clubpanel_carrusel_deser`."

### Etapa 4/8 — `set RHOST clubdeingenieria.lab`
- **Transición:** "Módulo seleccionado. Ahora apúntalo, con precisión, solo al objetivo autorizado."
- **Diálogo:** "`set RHOST` configura el objetivo remoto. Esto es exactamente lo que el documento de autorización delimitó — nunca un objetivo fuera de ese alcance, sin importar qué tan interesante parezca."
- **Instrucción:** "Configura el objetivo con `set RHOST clubdeingenieria.lab`."

### Etapa 5/8 — `exploit`
- **Transición:** "Todo configurado dentro del alcance autorizado. Ejecuta la prueba mínima necesaria."
- **Diálogo:** "Una prueba de concepto (PoC) demuestra el riesgo de forma innegable — un hallazgo teórico convence menos que uno demostrado. Pero 'mínima' es la palabra clave: solo lo necesario para confirmar, nunca más."
- **Instrucción:** "Ejecuta la prueba con `exploit`."

### Etapa 6/8 — `sessions -K`
- **Transición:** "Confirmado — el riesgo es real. Ahora, la regla más importante de todo este nivel."
- **Diálogo:** "Un pentest profesional nunca mantiene persistencia ni explora más allá del alcance acordado. Apenas se confirma el punto, cualquier acceso obtenido se cierra de inmediato — sin excepciones, sin 'ya que estoy aquí, reviso un poco más'."
- **Instrucción:** "Cierra inmediatamente cualquier sesión abierta con `sessions -K`."

### Etapa 7/8 — `echo "..." > poc-evidencia.txt`
- **Transición:** "Acceso cerrado de inmediato, como debe ser. Documenta la evidencia de la prueba."
- **Diálogo:** "La evidencia de la PoC — qué se hizo, qué se confirmó, cuánto duró el acceso — es lo que sostiene tu informe. Sin esto, 'confirmé la vulnerabilidad' es solo tu palabra."
- **Instrucción:** "Documenta la evidencia con `echo \"...\" > poc-evidencia.txt`."

### Etapa 8/8 — `echo "..." > confirmacion-explotacion.txt`
- **Transición:** "Evidencia registrada, acceso cerrado, alcance respetado en todo momento. Cierra la confirmación formal."
- **Diálogo:** "La diferencia entre lo que acabas de hacer y lo que hizo `nullshadow77` no es la técnica — es exactamente esta línea de autorización, alcance y cierre responsable que respetaste en cada paso."
- **Instrucción:** "Registra la confirmación con `echo \"...\" > confirmacion-explotacion.txt`."

**Cierre de nivel:** vulnerabilidad confirmada de forma responsable y autorizada. INGenioso anuncia el Nivel 17: encontrar y confirmar no cierra el caso — falta corregirlo de verdad.

---

## Nivel 17 — Remediación e Informe (🕸️ Auditor Ofensivo)

### Etapa 1/8 — `npm update plantilla-carrusel`
- **Transición:** "Vulnerabilidad confirmada con evidencia sólida. Ahora corrígela de verdad — encontrarla no es suficiente."
- **Diálogo:** "El primer intento lógico es actualizar la dependencia a una versión parchada. Ya sabes, por el Nivel 15, que este paquete específico no tiene ese lujo — pero confirmarlo aquí, con el comando real, es parte de hacer las cosas en orden."
- **Instrucción:** "Intenta actualizar con `npm update plantilla-carrusel`."

### Etapa 2/8 — `npm uninstall plantilla-carrusel`
- **Transición:** "Sin parche disponible, confirmado. La solución correcta no es esperar — es reemplazar."
- **Diálogo:** "Cuando una dependencia está genuinamente abandonada, mantenerla 'por si acaso algún día se actualiza' es dejar la puerta abierta indefinidamente. Elimínala."
- **Instrucción:** "Elimina la dependencia vulnerable con `npm uninstall plantilla-carrusel`."

### Etapa 3/8 — `npm install carrusel-seguro`
- **Transición:** "Dependencia eliminada. Instala la alternativa que sí tiene mantenimiento activo."
- **Diálogo:** "Reemplazar por una librería activamente mantenida —no la primera que aparezca, sino una con historial real de actividad— es la remediación de fondo, no un parche temporal."
- **Instrucción:** "Instala la alternativa segura con `npm install carrusel-seguro`."

### Etapa 4/8 — `npm audit`
- **Transición:** "Reemplazo instalado. No des el hallazgo por cerrado sin confirmarlo de nuevo."
- **Diálogo:** "Vuelve a correr exactamente la misma auditoría con la que empezaste el Nivel 15. Ver el hallazgo desaparecer del reporte es tu confirmación objetiva — no basta con 'creo que ya está resuelto'."
- **Instrucción:** "Vuelve a auditar con `npm audit`."

### Etapa 5/8 — `curl -I https://clubdeingenieria.lab`
- **Transición:** "Hallazgo resuelto, confirmado. Pero un parche que rompe el sitio no es una solución — verifica que todo sigue funcionando."
- **Diálogo:** "La verificación de regresión — confirmar que el cambio no rompió nada más — es tan parte de una remediación seria como el cambio mismo. Un fix que tumba el sitio cambia un problema por otro."
- **Instrucción:** "Verifica que el sitio sigue funcionando con `curl -I https://clubdeingenieria.lab`."

### Etapa 6/8 — `cat resumen-hallazgos.txt`
- **Transición:** "Todo funcionando, hallazgo resuelto. Antes de escribir el informe, revisa todo lo que documentaste en el camino."
- **Diálogo:** "Un buen informe de pentest no se improvisa al final — se construye recopilando cada hallazgo documentado desde el reconocimiento hasta la remediación."
- **Instrucción:** "Revisa el resumen de hallazgos con `cat resumen-hallazgos.txt`."

### Etapa 7/8 — `echo "Severidad: Crítica" > severidad.txt`
- **Transición:** "Hallazgos reunidos. Clasifica formalmente qué tan grave fue esto."
- **Diálogo:** "Combinar severidad técnica (a menudo con una escala como CVSS) con hallazgos claros y accionables es lo que separa un informe profesional de una lista de quejas. No basta con decir 'hay un problema' — hay que decir qué tan grave."
- **Instrucción:** "Documenta la severidad con `echo \"Severidad: Crítica\" > severidad.txt`."

### Etapa 8/8 — `echo "..." > informe-seguridad-web.txt`
- **Transición:** "Severidad clasificada. Cierra el informe completo del episodio."
- **Diálogo:** "Este ciclo completo — reconocimiento, hallazgo, PoC autorizada, remediación, informe — es exactamente la estructura de un informe de pentest profesional real, de principio a fin. Lo acabas de recorrer completo."
- **Instrucción:** "Entrega el informe final con `echo \"...\" > informe-seguridad-web.txt`."

**Cierre de nivel:** vulnerabilidad remediada de verdad, informe entregado con el mismo estándar que cerró el caso forense del Nivel 13. INGenioso anuncia el Nivel 18: un club que crece no puede depender solo de héroes individuales — toca diseñar un sistema de gestión de seguridad formal.

---

## Nivel 18 — Alcance y Activos — SGSI (📋 Arquitecto de Seguridad)

*Cambio de rango: tono de consultoría/gobierno. Menos terminal, más "por qué esto importa para la organización completa" — casi todos los comandos de este episodio son `cat`/`echo`, reflejo de que gobernar seguridad es, en la práctica, documentación disciplinada.*

### Etapa 1/8 — `echo "Alcance: portal web, API, base de datos de miembros" > alcance-sgsi.txt`
- **Transición:** "El club creció — más miembros, más proyectos, más datos. Atrapar amenazas está bien, pero eso no puede depender solo de que tú estés mirando."
- **Diálogo:** "ISO/IEC 27001 es el estándar internacional para un Sistema de Gestión de Seguridad de la Información (SGSI). Todo empieza definiendo el **alcance**: ¿qué sistemas, datos y procesos cubre exactamente? Sin límites claros, todo lo que sigue carece de fundamento."
- **Instrucción:** "Define el alcance con `echo \"Alcance: portal web, API, base de datos de miembros\" > alcance-sgsi.txt`."

### Etapa 2/8 — `echo "..." > inventario-activos.txt`
- **Transición:** "Alcance definido. Ahora, lista concretamente qué hay que proteger dentro de él."
- **Diálogo:** "El inventario de activos enumera qué hay que proteger — servidores, bases de datos, credenciales — de forma explícita. No puedes proteger lo que no está en una lista en algún lado."
- **Instrucción:** "Crea el inventario con `echo \"...\" > inventario-activos.txt`."

### Etapa 3/8 — `echo "..." > clasificacion-activos.txt`
- **Transición:** "Inventario hecho. No todos esos activos merecen el mismo nivel de esfuerzo — clasifícalos."
- **Diálogo:** "La clasificación (público/interno/confidencial/crítico) determina qué nivel de protección corresponde a cada activo. Tratar un dato público con el mismo rigor que uno crítico desperdicia recursos que deberían ir a lo que realmente importa."
- **Instrucción:** "Clasifica los activos con `echo \"...\" > clasificacion-activos.txt`."

### Etapa 4/8 — `echo "..." >> inventario-activos.txt`
- **Transición:** "Activos clasificados. A cada uno le falta algo esencial: alguien concreto responsable de él."
- **Diálogo:** "Un **propietario** asignado a cada activo — una persona concreta, no 'el equipo' en abstracto — es lo que convierte una lista en algo accionable. Fíjate que uses `>>`: estás agregando esta información al inventario que ya existe, no reemplazándolo."
- **Instrucción:** "Asigna propietarios con `echo \"...\" >> inventario-activos.txt`."

### Etapa 5/8 — `echo "..." > amenazas-identificadas.txt`
- **Transición:** "Activos, clasificación y propietarios definidos. Ahora, ¿de qué los estás protegiendo exactamente?"
- **Diálogo:** "Identificar amenazas de forma explícita — no de manera vaga — es lo que va a alimentar la evaluación de riesgo formal del siguiente nivel. Muchas de estas amenazas ya las viviste en carne propia en este mismo laboratorio."
- **Instrucción:** "Identifica las amenazas con `echo \"...\" > amenazas-identificadas.txt`."

### Etapa 6/8 — `cat requisitos-legales.txt`
- **Transición:** "Amenazas identificadas. Falta un marco que no es técnico, pero es igual de obligatorio."
- **Diálogo:** "En Ecuador, la LOPDP (Ley Orgánica de Protección de Datos Personales) establece requisitos legales sobre cómo tratar datos personales — como los de los miembros del club. Ignorar el marco legal aplicable, sin importar qué tan buena sea tu seguridad técnica, deja huecos reales."
- **Instrucción:** "Revisa el marco legal con `cat requisitos-legales.txt`."

### Etapa 7/8 — `echo "..." > partes-interesadas.txt`
- **Transición:** "Marco legal revisado. Identifica quiénes tienen algo en juego en todo esto."
- **Diálogo:** "Las partes interesadas — miembros, directiva del club, proveedores — son quienes se ven afectados por (o pueden afectar) las decisiones de seguridad. Un SGSI que no las considera desde el inicio suele chocar con la realidad más adelante."
- **Instrucción:** "Identifícalas con `echo \"...\" > partes-interesadas.txt`."

### Etapa 8/8 — `echo "..." > fase1-sgsi.txt`
- **Transición:** "Alcance, activos, amenazas, marco legal, partes interesadas — los cimientos están puestos. Cierra esta primera fase."
- **Diálogo:** "Este documento de cierre marca el fin de la fase de fundamentos — todo lo que sigue en el Nivel 19 (evaluación de riesgo) se construye directamente sobre lo que acabas de definir aquí."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase1-sgsi.txt`."

**Cierre de nivel:** fundamentos del SGSI establecidos. INGenioso anuncia el Nivel 19: convertir amenazas difusas en riesgos medibles y priorizables.

---

## Nivel 19 — Riesgos — SGSI (📋 Arquitecto de Seguridad)

### Etapa 1/8 — `cat metodologia-riesgo.txt`
- **Transición:** "Los fundamentos están listos. El corazón real de ISO 27001 empieza aquí: convertir amenazas en algo medible."
- **Diálogo:** "Antes de evaluar cualquier riesgo específico, necesitas una **metodología** consistente — típicamente probabilidad × impacto — para que los riesgos sean comparables entre sí, no juicios sueltos sin criterio común."
- **Instrucción:** "Revisa la metodología con `cat metodologia-riesgo.txt`."

### Etapa 2/8 — `echo "Riesgo: DDoS..." > matriz-riesgos.txt`
- **Transición:** "Metodología definida. Empieza a poblar la matriz con el primer riesgo — uno que ya conoces bien."
- **Diálogo:** "El DDoS que viviste en los Niveles 7-10 no fue solo un incidente resuelto — es, formalmente, un riesgo que sigue existiendo y que ahora necesita evaluarse con la misma metodología que cualquier otro."
- **Instrucción:** "Registra el primer riesgo con `echo \"Riesgo: DDoS...\" > matriz-riesgos.txt`."

### Etapa 3/8 — `echo "Riesgo: Dependencia..." >> matriz-riesgos.txt`
- **Transición:** "Primer riesgo registrado. Agrega el segundo — otro que también viviste de primera mano."
- **Diálogo:** "El riesgo de dependencias sin mantenimiento del Nivel 15 es igual de real y merece su propia entrada. Nota el `>>`: cada riesgo se agrega a la misma matriz, no la reemplaza."
- **Instrucción:** "Agrega el segundo riesgo con `echo \"Riesgo: Dependencia...\" >> matriz-riesgos.txt`."

### Etapa 4/8 — `echo "Tratamiento: ..." >> matriz-riesgos.txt`
- **Transición:** "Dos riesgos registrados. Identificar un riesgo no basta — hay que decidir qué hacer con él."
- **Diálogo:** "Para cada riesgo se define un **tratamiento**: mitigar (reducirlo con controles), transferir (un seguro, un proveedor externo), evitar (dejar de hacer la actividad riesgosa), o aceptar (documentar formalmente que el riesgo residual es tolerable). Ninguna opción es automáticamente la correcta — depende del riesgo."
- **Instrucción:** "Define el tratamiento con `echo \"Tratamiento: ...\" >> matriz-riesgos.txt`."

### Etapa 5/8 — `cat controles-anexo-a.txt`
- **Transición:** "Tratamiento definido. Ahora revisa el catálogo oficial de controles disponibles."
- **Diálogo:** "El Anexo A de ISO 27001 (detallado en ISO 27002) contiene 93 controles posibles. No se implementan todos siempre — se selecciona y se justifica cada uno según lo que tu organización realmente necesita."
- **Instrucción:** "Revisa los controles disponibles con `cat controles-anexo-a.txt`."

### Etapa 6/8 — `echo "..." > declaracion-aplicabilidad.txt`
- **Transición:** "Controles revisados. Redacta el documento más importante de todo el estándar."
- **Diálogo:** "La Declaración de Aplicabilidad (SoA) es el documento central de ISO 27001: de todos los controles del Anexo A, dice cuáles aplican a tu organización específica y por qué — cada decisión, justificada, no una lista genérica copiada de otro lado."
- **Instrucción:** "Redacta la Declaración de Aplicabilidad con `echo \"...\" > declaracion-aplicabilidad.txt`."

### Etapa 7/8 — `echo "..." >> matriz-riesgos.txt`
- **Transición:** "SoA redactada. Cierra la matriz con la decisión formal sobre el riesgo residual."
- **Diálogo:** "Después de aplicar controles, casi siempre queda algo de riesgo — el riesgo residual. Aceptarlo formalmente, por escrito, es distinto a ignorarlo: es una decisión consciente y documentada, no un descuido."
- **Instrucción:** "Registra la aceptación con `echo \"...\" >> matriz-riesgos.txt`."

### Etapa 8/8 — `echo "..." > fase2-sgsi.txt`
- **Transición:** "Matriz completa, SoA lista. Cierra esta segunda fase del SGSI."
- **Diálogo:** "Con los riesgos evaluados y tratados, ya tienes la base para convertir todo esto en políticas reales que la organización pueda seguir día a día — eso viene en el Nivel 20."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase2-sgsi.txt`."

**Cierre de nivel:** riesgos evaluados, tratados y con SoA formal. INGenioso anuncia el Nivel 20: las decisiones de riesgo se vuelven inútiles si no se escriben como políticas que la organización realmente sigue.

---

## Nivel 20 — Políticas y Controles — SGSI (📋 Arquitecto de Seguridad)

### Etapa 1/8 — `echo "Política de Seguridad de la Información del Club" > politica-seguridad.txt`
- **Transición:** "Riesgos evaluados y tratados. Ahora conviértelos en algo que la organización realmente pueda seguir, no solo un documento archivado."
- **Diálogo:** "Empieza por la política 'paraguas': la Política de Seguridad de la Información general, que enmarca a todas las demás que vas a escribir en este nivel."
- **Instrucción:** "Redáctala con `echo \"Política de Seguridad de la Información del Club\" > politica-seguridad.txt`."

### Etapa 2/8 — `echo "..." > politica-acceso.txt`
- **Transición:** "Política general lista. Ahora, una específica sobre quién puede acceder a qué."
- **Diálogo:** "La política de control de acceso formaliza el principio de **mínimo privilegio**: cada persona tiene acceso solo a lo que necesita para su rol, ni más ni menos."
- **Instrucción:** "Redáctala con `echo \"...\" > politica-acceso.txt`."

### Etapa 3/8 — `echo "..." > procedimiento-ir.txt`
- **Transición:** "Control de acceso definido. Formaliza algo que ya practicaste de verdad, en el Episodio 2."
- **Diálogo:** "Este procedimiento formaliza el ciclo NIST SP 800-61 que ya ejecutaste con las manos en los Niveles 4 y 5 — contener, erradicar, recuperar — como política oficial y repetible, no solo como algo que 'ya sabes hacer'."
- **Instrucción:** "Formalízalo con `echo \"...\" > procedimiento-ir.txt`."

### Etapa 4/8 — `echo "..." > politica-desarrollo-seguro.txt`
- **Transición:** "Respuesta a incidentes formalizada. Ahora, la lección del Nivel 15, convertida en regla permanente."
- **Diálogo:** "La política de desarrollo seguro formaliza exactamente lo que aprendiste sobre dependencias abandonadas: auditar librerías de terceros regularmente, no solo cuando algo ya salió mal."
- **Instrucción:** "Redáctala con `echo \"...\" > politica-desarrollo-seguro.txt`."

### Etapa 5/8 — `echo "..." > politica-respaldo.txt`
- **Transición:** "Desarrollo seguro cubierto. Una política más, sobre algo que suele darse por sentado hasta que falla."
- **Diálogo:** "La política de respaldo define no solo que se hagan copias de seguridad, sino con qué frecuencia, dónde, y — crucial, aunque todavía no lo hayas vivido — que se prueben periódicamente. Vas a ver por qué esto importa tanto en el Nivel 24."
- **Instrucción:** "Redáctala con `echo \"...\" > politica-respaldo.txt`."

### Etapa 6/8 — `echo "..." > plan-concientizacion.txt`
- **Transición:** "Respaldo cubierto. Ninguna política técnica sirve si las personas no saben aplicarla."
- **Diálogo:** "El phishing sigue siendo la puerta de entrada más común a incidentes reales en el mundo — no una vulnerabilidad de software, sino una decisión humana bajo presión. Un plan de concientización aborda exactamente ese factor humano."
- **Instrucción:** "Diséñalo con `echo \"...\" > plan-concientizacion.txt`."

### Etapa 7/8 — `echo "..." > politica-proveedores.txt`
- **Transición:** "Factor humano cubierto. Una política final, sobre algo que ya te costó caro en el Nivel 15."
- **Diálogo:** "Esta política formaliza el riesgo de cadena de suministro como requisito permanente hacia proveedores externos: no volver a descubrir una dependencia abandonada por accidente, sino exigir mantenimiento activo desde el principio."
- **Instrucción:** "Redáctalos con `echo \"...\" > politica-proveedores.txt`."

### Etapa 8/8 — `echo "..." > fase3-sgsi.txt`
- **Transición:** "Siete políticas redactadas, cada una anclada en algo que ya viviste. Cierra esta tercera fase."
- **Diálogo:** "Políticas escritas y archivadas no valen nada si nadie las audita después — eso es exactamente lo que viene en el Nivel 21, el examen de todo este episodio."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase3-sgsi.txt`."

**Cierre de nivel:** conjunto completo de políticas del SGSI redactado. INGenioso anuncia el Nivel 21: un SGSI que nunca se audita es solo un documento.

---

## Nivel 21 — Auditoría del SGSI — SGSI (📋 Arquitecto de Seguridad → examen)

*Nivel examen (6, 13, 21, 31): auditar con rigor lo que el propio jugador construyó en los tres niveles anteriores.*

### Etapa 1/8 — `cat checklist-auditoria.txt`
- **Transición:** "Alcance, riesgos y políticas: los tres pilares del SGSI están en pie. Ahora, ponlos a prueba de verdad."
- **Diálogo:** "Una auditoría interna necesita una lista de verificación estructurada — sin eso, corres el riesgo de revisar solo lo que ya sabes que está bien y pasar por alto lo que no."
- **Instrucción:** "Prepárala con `cat checklist-auditoria.txt`."

### Etapa 2/8 — `echo "..." > hallazgos-auditoria.txt`
- **Transición:** "Checklist en mano. Ejecuta la auditoría contra tus propios documentos."
- **Diálogo:** "La auditoría interna verifica evidencia real contra cada política que redactaste — no si suena bien en el papel, sino si efectivamente se cumple."
- **Instrucción:** "Ejecútala con `echo \"...\" > hallazgos-auditoria.txt`."

### Etapa 3/8 — `echo "..." >> hallazgos-auditoria.txt`
- **Transición:** "Primeros hallazgos registrados. Encontrar cero problemas sería, en realidad, mala señal."
- **Diálogo:** "Una **no conformidad** es algo que no cumple lo que la propia política exige. Encontrar cero no conformidades suele ser señal de una auditoría poco rigurosa, no de perfección — así que sigue mirando con ojo crítico."
- **Instrucción:** "Registra la no conformidad con `echo \"...\" >> hallazgos-auditoria.txt`."

### Etapa 4/8 — `echo "..." > accion-correctiva.txt`
- **Transición:** "No conformidad encontrada y registrada. Ahora, no la dejes ahí — corrígela formalmente."
- **Diálogo:** "Una acción correctiva formal necesita responsable y plazo concretos. Sin eso, 'lo vamos a arreglar' es solo una intención, no un compromiso verificable."
- **Instrucción:** "Defínela con `echo \"...\" > accion-correctiva.txt`."

### Etapa 5/8 — `cat revision-direccion.txt`
- **Transición:** "Acción correctiva definida. La seguridad no puede quedar aislada como 'un tema técnico' — necesita respaldo desde arriba."
- **Diálogo:** "La revisión por la dirección (cláusula 9.3 del estándar) asegura que quienes lideran la organización estén al tanto y respalden las decisiones de seguridad — no solo el equipo técnico trabajando en silencio."
- **Instrucción:** "Prepárala con `cat revision-direccion.txt`."

### Etapa 6/8 — `echo "..." > kpis-sgsi.txt`
- **Transición:** "Revisión de dirección lista. Define cómo vas a medir, con números, si todo esto realmente funciona."
- **Diálogo:** "Indicadores (KPIs) concretos — tiempo de respuesta a incidentes, porcentaje de hallazgos cerrados a tiempo — son lo que convierte 'creemos que el SGSI funciona' en algo medible y verificable."
- **Instrucción:** "Defínelos con `echo \"...\" > kpis-sgsi.txt`."

### Etapa 7/8 — `cat fase1-sgsi.txt fase2-sgsi.txt fase3-sgsi.txt`
- **Transición:** "KPIs definidos. Antes de cerrar, reúne el recorrido completo del SGSI en un solo lugar."
- **Diálogo:** "Compilar las tres fases anteriores — fundamentos, riesgos, políticas — de una sola vez es la última verificación de que nada quedó suelto o contradictorio entre ellas."
- **Instrucción:** "Compílalas con `cat fase1-sgsi.txt fase2-sgsi.txt fase3-sgsi.txt`."

### Etapa 8/8 — `echo "..." > informe-final-sgsi.txt`
- **Transición:** "Todo el SGSI compilado, auditado, con hallazgos corregidos y respaldo de dirección. Ciérralo."
- **Diálogo:** "Certificarse en ISO 27001 es un proceso real que muchas organizaciones atraviesan — la certificación 'ISO 27001 Lead Implementer' es una de las más reconocidas en el campo de Gobierno, Riesgo y Cumplimiento (GRC)."
- **Instrucción:** "Cierra el SGSI completo con `echo \"...\" > informe-final-sgsi.txt`."

**Cierre de nivel:** SGSI completo, auditado y cerrado formalmente. Vera revisa el trabajo en silencio... y entonces suena su teléfono. INGenioso anuncia el Nivel 22: algo grande está por comenzar.

---

## Nivel 22 — Alerta y Primer Contacto (☁️ Agente de Rescate)

*Cambio de rango: par experimentado. Poca mano tomada; INGenioso refuerza conexiones explícitas con episodios anteriores en vez de re-explicar desde cero.*

### Etapa 1/8 — `cat solicitud-ayuda.txt`
- **Transición:** "'Te necesito para algo grande.' Vera cuelga el teléfono y te mira serio. Una universidad aliada, la Universidad Metropolitana de Tecnología, está perdiendo calificaciones de estudiantes de verdad. Vas a representarla al club."
- **Diálogo:** "Todo caso empieza leyendo lo que reportó quien pide ayuda — sin eso, cualquier hipótesis que armes es solo una suposición sin base."
- **Instrucción:** "Lee la solicitud con `cat solicitud-ayuda.txt`."

### Etapa 2/8 — `cat autorizacion-auditoria.txt`
- **Transición:** "Ya sabes qué reportan. Antes de tocar cualquier sistema de la UMT, confirma tu autorización — igual que en cada pentest que ya hiciste."
- **Diálogo:** "Estás sola en esto ahora — pero ya no eres la recluta del Nivel 1. La disciplina de siempre no cambia: nunca actúas sobre infraestructura ajena sin autorización explícita, sin importar cuán urgente parezca el caso."
- **Instrucción:** "Confírmala con `cat autorizacion-auditoria.txt`."

### Etapa 3/8 — `cat tickets-soporte.txt`
- **Transición:** "Autorización confirmada. Revisa los reportes concretos de los estudiantes afectados."
- **Diálogo:** "Los tickets de soporte son tu primera fuente de evidencia real — no una descripción abstracta del problema, sino casos concretos con fecha, curso y estudiante."
- **Instrucción:** "Revísalos con `cat tickets-soporte.txt`."

### Etapa 4/8 — `curl -I https://siga.umt.lab`
- **Transición:** "Varios cursos afectados. Confirma que el sistema académico sigue respondiendo, al menos por ahora."
- **Diálogo:** "El mismo `curl -I` que usaste para confirmar disponibilidad en el Nivel 10 — la metodología no cambia solo porque el sistema no es tuyo."
- **Instrucción:** "Verifica el sitio con `curl -I https://siga.umt.lab`."

### Etapa 5/8 — `ping datacenter.umt.lab`
- **Transición:** "El sistema académico responde. Ahora confirma la infraestructura que hay detrás."
- **Diálogo:** "Un `ping` básico al datacenter — el mismo primer paso del Nivel 1, reconocimiento puro, aplicado ahora a una infraestructura ajena y mucho más grande."
- **Instrucción:** "Confirma con `ping datacenter.umt.lab`."

### Etapa 6/8 — `cat diagrama-red.txt`
- **Transición:** "Datacenter en línea. Antes de investigar nada más, entiende cómo está armado todo el sistema."
- **Diálogo:** "El diagrama de red muestra la arquitectura completa: SIGA (la aplicación) conecta con una base de datos on-premise, que sincroniza con un servicio hacia almacenamiento en la nube. Tres piezas distintas — vas a auditar las tres antes de tener el cuadro completo."
- **Instrucción:** "Revísalo con `cat diagrama-red.txt`."

### Etapa 7/8 — `echo "..." > alcance-auditoria.txt`
- **Transición:** "Arquitectura entendida: on-premise y nube, conectados por un servicio de sincronización. Define formalmente qué vas a auditar."
- **Diálogo:** "Con un sistema híbrido tan grande, delimitar el alcance por escrito — igual que en el Nivel 18 — evita que la investigación se disperse sin dirección clara."
- **Instrucción:** "Documenta el alcance con `echo \"...\" > alcance-auditoria.txt`."

### Etapa 8/8 — `echo "..." > triage-inicial.txt`
- **Transición:** "Alcance definido. Cierra el primer contacto con tu evaluación inicial."
- **Diálogo:** "Todo caso grande empieza con triage y autorización — entender los síntomas reportados antes de asumir causas. A partir de aquí, la investigación real empieza por el datacenter físico."
- **Instrucción:** "Documenta el triage inicial con `echo \"...\" > triage-inicial.txt`."

**Cierre de nivel:** primer contacto completo, alcance de auditoría definido. INGenioso anuncia el Nivel 23: con autorización de TI de la UMT, hora de auditar el datacenter on-premise.

---

## Nivel 23 — Datacenter: Controles (☁️ Agente de Rescate)

### Etapa 1/8 — `cat bitacora-acceso-fisico.txt`
- **Transición:** "Con autorización de TI de la UMT, empieza por lo más básico: quién ha entrado físicamente al datacenter."
- **Diálogo:** "La auditoría de datacenter combina controles **físicos** y **lógicos** — no basta con revisar configuraciones si nadie audita también quién tiene acceso al edificio y a las salas de servidores."
- **Instrucción:** "Revísala con `cat bitacora-acceso-fisico.txt`."

### Etapa 2/8 — `cat monitoreo-ambiental.txt`
- **Transición:** "Hay una salida de un técnico que no quedó registrada del todo. Sigue revisando las condiciones físicas del lugar."
- **Diálogo:** "El monitoreo ambiental (temperatura, humedad, vibración) es un control físico tan real como una cerradura — condiciones fuera de rango pueden ser la causa directa de una falla de hardware, no un ataque."
- **Instrucción:** "Revísalo con `cat monitoreo-ambiental.txt`."

### Etapa 3/8 — `cat inventario-datacenter.txt`
- **Transición:** "Una alerta de vibración en un rack específico. Antes de investigar ese rack, confirma qué hardware hay ahí registrado."
- **Diálogo:** "El inventario lógico del datacenter — qué equipo hay, dónde, con qué función — es tu mapa antes de investigar cualquier anomalía específica."
- **Instrucción:** "Revísalo con `cat inventario-datacenter.txt`."

### Etapa 4/8 — `cat estado-raid.txt`
- **Transición:** "Ese rack aloja el arreglo de discos de la base de datos. Revisa su estado de salud."
- **Diálogo:** "Un **RAID degradado** sigue funcionando, pero sin margen de tolerancia a fallos — si falla un disco más, el arreglo completo puede perder datos. Es una alerta seria, aunque el sistema 'siga funcionando' de cara al usuario."
- **Instrucción:** "Revísalo con `cat estado-raid.txt`."

### Etapa 5/8 — `smartctl -a /dev/sda`
- **Transición:** "RAID degradado confirmado. Revisa la salud real del disco específico antes de decidir cómo repararlo."
- **Diálogo:** "`smartctl` revisa la salud S.M.A.R.T. de un disco — un indicador temprano de fallo real basado en métricas internas del propio hardware, no solo una sospecha externa."
- **Instrucción:** "Revísalo con `smartctl -a /dev/sda`."

### Etapa 6/8 — `cat politica-acceso-fisico.txt`
- **Transición:** "Disco confirmado con problemas reales. Antes de reparar nada, confirma qué dice la política sobre quién puede tocar este hardware."
- **Diálogo:** "Reparar 'siguiendo el procedimiento formal' — no a las carreras — es la diferencia entre un mantenimiento de rutina y un segundo incidente. La política existente define exactamente ese procedimiento."
- **Instrucción:** "Revísala con `cat politica-acceso-fisico.txt`."

### Etapa 7/8 — `cat notas-operaciones.txt`
- **Transición:** "Política revisada. Un último documento antes de cerrar este primer hallazgo — las notas de quien opera el datacenter día a día."
- **Diálogo:** "Las notas de operaciones a menudo contienen detalles que ningún sistema automatizado registra — como que alguien reemplazó un disco 'la semana pasada' sin abrir el ticket de cambio correspondiente."
- **Instrucción:** "Revísalas con `cat notas-operaciones.txt`."

### Etapa 8/8 — `echo "..." > hallazgo-datacenter-1.txt`
- **Transición:** "Acceso no registrado, RAID degradado, disco reemplazado sin ticket. Documenta este primer hallazgo con todo su contexto."
- **Diálogo:** "Cada hallazgo de esta investigación híbrida se documenta por separado — vas a correlacionarlos todos juntos más adelante, en el Nivel 28, para llegar a la causa raíz real."
- **Instrucción:** "Documéntalo con `echo \"...\" > hallazgo-datacenter-1.txt`."

**Cierre de nivel:** primer hallazgo del datacenter documentado — controles físicos con huecos, RAID degradado. INGenioso anuncia el Nivel 24: si algo falla de verdad, los respaldos deberían salvar todo. ¿Realmente funcionan?

---

## Nivel 24 — Datacenter: Respaldos (☁️ Agente de Rescate)

### Etapa 1/8 — `cat logs-backup.txt`
- **Transición:** "El datacenter tiene problemas físicos reales. Si algo falla del todo, los respaldos deberían salvar la situación — confírmalo, no lo asumas."
- **Diálogo:** "Empieza por los logs del sistema de respaldo: ¿se están ejecutando en el horario que deberían? Un respaldo que nadie revisa puede estar fallando en silencio durante semanas sin que nadie lo note."
- **Instrucción:** "Revísalos con `cat logs-backup.txt`."

### Etapa 2/8 — `grep ERROR logs-backup.txt`
- **Transición:** "Muchas líneas de log. Filtra directamente por lo que te interesa: los errores."
- **Diálogo:** "`grep ERROR` extrae solo las líneas que reportaron fallo — la misma técnica de filtrado que usaste en el Nivel 4 para encontrar la aguja en el pajar de un log grande."
- **Instrucción:** "Búscalos con `grep ERROR logs-backup.txt`."

### Etapa 3/8 — `cat politica-respaldo-datacenter.txt`
- **Transición:** "Hay errores reales en el log. Confirma qué debería estar pasando según la política, para poder decir con precisión qué está fallando."
- **Diálogo:** "Comparar 'lo que dice la política' contra 'lo que realmente está pasando' es exactamente el ejercicio de auditoría que hiciste formalmente en el Nivel 21 — aquí, aplicado a un caso concreto."
- **Instrucción:** "Revísala con `cat politica-respaldo-datacenter.txt`."

### Etapa 4/8 — `sha256sum backup-2026-08-01.tar.gz`
- **Transición:** "La política es clara. Verifica la integridad del respaldo más reciente que debería existir."
- **Diálogo:** "El mismo principio de integridad de siempre — pero esta vez, la sorpresa es que el archivo está corrupto o vacío. Un respaldo que 'existe' en el sistema de archivos pero no contiene datos reales es peor que no tener respaldo: da una falsa sensación de seguridad."
- **Instrucción:** "Verifícalo con `sha256sum backup-2026-08-01.tar.gz`."

### Etapa 5/8 — `restauracion-prueba --backup backup-2026-07-15.tar.gz --sandbox`
- **Transición:** "El respaldo más reciente está corrupto. Busca hacia atrás hasta encontrar uno que sí puedas confirmar como válido — probándolo de verdad."
- **Diálogo:** "Un respaldo que nunca se prueba no es un respaldo confiable, es una suposición. La única forma real de confiar en uno es restaurarlo en un entorno aislado (sandbox) y confirmar que los datos están completos e íntegros — no solo que 'el archivo existe'."
- **Instrucción:** "Pruébalo con `restauracion-prueba --backup backup-2026-07-15.tar.gz --sandbox`."

### Etapa 6/8 — `cat ultimo-backup-valido.txt`
- **Transición:** "La prueba en sandbox confirma que ese respaldo sí es válido. Deja registrado cuál es exactamente el último punto confiable."
- **Diálogo:** "Saber con precisión cuál es tu último respaldo *verdaderamente* válido —no el más reciente en la lista, sino el más reciente que realmente funciona— es información crítica si más adelante necesitas restaurar datos de verdad."
- **Instrucción:** "Confírmalo con `cat ultimo-backup-valido.txt`."

### Etapa 7/8 — `echo "..." > hallazgo-datacenter-2.txt`
- **Transición:** "Ya sabes exactamente qué respaldo es confiable y cuáles no. Documenta este segundo hallazgo del episodio."
- **Diálogo:** "Este hallazgo es tan grave como el del RAID degradado — probablemente más, porque un respaldo roto solo se descubre cuando ya es demasiado tarde, a menos que alguien lo audite antes."
- **Instrucción:** "Documéntalo con `echo \"...\" > hallazgo-datacenter-2.txt`."

### Etapa 8/8 — `echo "..." > fase-datacenter.txt`
- **Transición:** "Dos hallazgos serios del datacenter documentados. Cierra esta fase de la investigación."
- **Diálogo:** "Con el datacenter auditado de punta a punta, toca revisar la otra mitad de la arquitectura híbrida: el proveedor cloud."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-datacenter.txt`."

**Cierre de nivel:** auditoría de datacenter cerrada con dos hallazgos críticos. INGenioso anuncia el Nivel 25: la UMT también usa un proveedor cloud — momento de auditar identidad y accesos.

---

## Nivel 25 — Nube: Identidad y Accesos (☁️ Agente de Rescate)

### Etapa 1/8 — `cat cloud-config.txt`
- **Transición:** "Datacenter auditado. La otra mitad de la arquitectura vive en la nube — y ahí las reglas del juego cambian."
- **Diálogo:** "La seguridad en la nube sigue el **modelo de responsabilidad compartida**: el proveedor asegura la infraestructura física; tú eres responsable de cómo configuras identidad, permisos y monitoreo. Empieza por entender esa configuración base."
- **Instrucción:** "Revísala con `cat cloud-config.txt`."

### Etapa 2/8 — `cloudcli iam list-users`
- **Transición:** "Configuración general revisada. Ahora, específicamente: ¿quién tiene identidad en este entorno?"
- **Diálogo:** "IAM (Identity and Access Management) es el corazón de la seguridad en la nube — la inmensa mayoría de los incidentes reales en la nube son de configuración de IAM, no fallas del proveedor."
- **Instrucción:** "Lístalos con `cloudcli iam list-users`."

### Etapa 3/8 — `cloudcli iam get-policy --role sync-service`
- **Transición:** "Usuarios listados. Presta atención especial al rol que conecta el datacenter con la nube — el que vive en el diagrama que revisaste en el Nivel 22."
- **Diálogo:** "Un rol de servicio con política `\"Action\": \"*\", \"Resource\": \"*\"` viola el principio de **mínimo privilegio** de forma flagrante: un proceso automatizado no debería poder hacer *cualquier cosa* sobre *cualquier recurso* — solo lo estrictamente necesario para su función."
- **Instrucción:** "Revisa su política con `cloudcli iam get-policy --role sync-service`."

### Etapa 4/8 — `cloudcli iam list-access-keys`
- **Transición:** "Permisos excesivos confirmados. Revisa además hace cuánto tiempo se usan esas credenciales."
- **Diálogo:** "Llaves de acceso sin rotar durante años agravan cualquier riesgo de permisos excesivos — si alguna vez se filtraron, siguen siendo válidas todo ese tiempo, sin que nadie lo sepa."
- **Instrucción:** "Revísalas con `cloudcli iam list-access-keys`."

### Etapa 5/8 — `cloudcli logging status`
- **Transición:** "Llaves sin rotar desde hace años. Confirma si al menos hay registro de lo que ese rol ha estado haciendo."
- **Diálogo:** "Sin logs, no hay forma de reconstruir qué pasó cuando algo falla — es la misma lección del Nivel 4, aplicada ahora a un entorno cloud completo en vez de un solo servidor."
- **Instrucción:** "Revísalo con `cloudcli logging status`."

### Etapa 6/8 — `cat modelo-responsabilidad-compartida.txt`
- **Transición:** "Hay un hueco real en el registro. Antes de seguir, repasa formalmente qué le corresponde a quién en este modelo."
- **Diálogo:** "Entender con precisión dónde termina la responsabilidad del proveedor y dónde empieza la tuya evita atribuir un problema de configuración propia a 'una falla de la nube' — cuando casi nunca es así."
- **Instrucción:** "Revísalo con `cat modelo-responsabilidad-compartida.txt`."

### Etapa 7/8 — `echo "..." > hallazgo-iam.txt`
- **Transición:** "Modelo de responsabilidad claro. Documenta este hallazgo de IAM con toda su gravedad."
- **Diálogo:** "Permisos excesivos, llaves sin rotar, hueco en el logging: tres problemas de configuración, ninguno culpa del proveedor cloud. Este es exactamente el patrón que el mundo real reproduce una y otra vez."
- **Instrucción:** "Documéntalo con `echo \"...\" > hallazgo-iam.txt`."

### Etapa 8/8 — `echo "..." > fase-iam.txt`
- **Transición:** "Hallazgo de IAM documentado. Cierra esta fase antes de seguir con el almacenamiento."
- **Diálogo:** "IAM controla *quién* puede hacer *qué* — el siguiente paso lógico es revisar *dónde* viven realmente los datos: el almacenamiento en la nube."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-iam.txt`."

**Cierre de nivel:** hallazgo grave de IAM documentado — permisos excesivos, llaves sin rotar, logging con huecos. INGenioso anuncia el Nivel 26: revisar dónde viven las calificaciones en la nube.

---

## Nivel 26 — Nube: Almacenamiento (☁️ Agente de Rescate)

### Etapa 1/8 — `cloudcli storage list-buckets`
- **Transición:** "IAM auditado, con hallazgos serios. Ahora, dónde viven realmente los datos que importan en este caso."
- **Diálogo:** "Empieza por lo básico: qué contenedores de almacenamiento (buckets) existen en este entorno cloud."
- **Instrucción:** "Lístalos con `cloudcli storage list-buckets`."

### Etapa 2/8 — `cloudcli storage get-acl --bucket calificaciones-sync`
- **Transición:** "Encontraste el bucket de sincronización de calificaciones. Revisa quién tiene permiso sobre él."
- **Diálogo:** "Los permisos de un bucket determinan quién puede leer, escribir o borrar su contenido. Vas a ver que ese mismo rol `sync-service` con permisos excesivos del Nivel 25 tiene acceso completo aquí también — la misma causa, reapareciendo."
- **Instrucción:** "Revisa los permisos con `cloudcli storage get-acl --bucket calificaciones-sync`."

### Etapa 3/8 — `cloudcli storage get-versioning --bucket calificaciones-sync`
- **Transición:** "Permisos excesivos confirmados sobre este bucket específico. Revisa si al menos hay una red de seguridad contra borrados accidentales."
- **Diálogo:** "El **versionado** permite deshacer un borrado o sobrescritura accidental — sin él, cualquier eliminación (accidental o no) es definitiva. Es una configuración de bajo costo que evita pérdidas de datos irreversibles."
- **Instrucción:** "Revísalo con `cloudcli storage get-versioning --bucket calificaciones-sync`."

### Etapa 4/8 — `sha256sum calificaciones-2026.json`
- **Transición:** "Versionado desactivado — sin red de seguridad. Verifica si el archivo de calificaciones sigue ahí."
- **Diálogo:** "Intentas calcular el hash de un archivo que debería existir... y el sistema responde que no lo encuentra. Sin versionado activo, un archivo borrado no deja rastro fácil de recuperar."
- **Instrucción:** "Verifícalo con `sha256sum calificaciones-2026.json`."

### Etapa 5/8 — `cloudcli storage list-deleted --bucket calificaciones-sync`
- **Transición:** "El archivo no está. Confirma qué se borró exactamente y cuándo."
- **Diálogo:** "Aunque el versionado esté desactivado, algunos proveedores mantienen un registro breve de objetos eliminados recientemente — tu única ventana para reconstruir qué pasó antes de que esa información también desaparezca."
- **Instrucción:** "Revísalos con `cloudcli storage list-deleted --bucket calificaciones-sync`."

### Etapa 6/8 — `cloudcli logging query --event DeleteObject`
- **Transición:** "Tres archivos borrados en el mismo segundo exacto. Eso no lo hizo una persona a mano — investiga quién o qué lo hizo."
- **Diálogo:** "Consultar el log filtrando específicamente por el evento `DeleteObject` te dice, con precisión, qué identidad ejecutó cada borrado — y aquí es donde la historia da un giro importante."
- **Instrucción:** "Investígalo con `cloudcli logging query --event DeleteObject`."

### Etapa 7/8 — `echo "..." > hallazgo-storage.txt`
- **Transición:** "Las eliminaciones se atribuyen al propio rol `sync-service` — el servicio de sincronización automatizado, no un atacante externo. Documenta este giro con precisión."
- **Diálogo:** "Esto ilustra un punto real y contraintuitivo: muchos incidentes de 'pérdida de datos' son causados por fallos internos de automatización, no por ataques — y por eso la causa raíz nunca debe asumirse de antemano."
- **Instrucción:** "Documéntalo con `echo \"...\" > hallazgo-storage.txt`."

### Etapa 8/8 — `echo "..." > fase-storage.txt`
- **Transición:** "El propio servicio de sincronización parece ser el responsable. Cierra esta fase antes de investigarlo a fondo."
- **Diálogo:** "Tienes una sospecha fuerte pero todavía no la causa raíz completa — eso significa investigar el servicio de sincronización mismo, directamente, en el siguiente nivel."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-storage.txt`."

**Cierre de nivel:** hallazgo clave — el propio servicio de sincronización, no un atacante, ejecutó los borrados. INGenioso anuncia el Nivel 27: investigar ese servicio a fondo, sin asumir que es un ataque solo porque duele como uno.

---

## Nivel 27 — Nube: Monitoreo y Sincronización (☁️ Agente de Rescate)

### Etapa 1/8 — `cat servicio-sincronizacion.txt`
- **Transición:** "El servicio de sincronización parece ser el responsable directo. Entiende primero qué se supone que hace normalmente."
- **Diálogo:** "Antes de acusar a un servicio de estar roto, hay que entender su comportamiento esperado — sin esa base, no puedes distinguir un fallo real de un comportamiento normal que simplemente no reconoces."
- **Instrucción:** "Revísalo con `cat servicio-sincronizacion.txt`."

### Etapa 2/8 — `cat logs-sincronizacion.txt`
- **Transición:** "Comportamiento esperado, entendido. Ahora revisa qué hizo realmente ese día."
- **Diálogo:** "Los logs del propio servicio son tu evidencia más directa — y vas a encontrar algo muy específico: una excepción no controlada seguida de una 'limpieza de respaldo' automática."
- **Instrucción:** "Revísalos con `cat logs-sincronizacion.txt`."

### Etapa 3/8 — `cat historial-cambios.txt`
- **Transición:** "Una excepción justo antes del incidente. ¿Cambió algo en el servicio poco antes de que esto pasara?"
- **Diálogo:** "El historial de cambios (historial de despliegues) revela si hubo una actualización reciente al servicio — y la correlación temporal entre 'se desplegó código nuevo' y 'empezó a fallar' rara vez es coincidencia."
- **Instrucción:** "Revísalo con `cat historial-cambios.txt`."

### Etapa 4/8 — `grep ERROR logs-sincronizacion.txt`
- **Transición:** "Un despliegue nuevo horas antes del incidente. Filtra los logs para confirmar el patrón completo de errores desde ese momento."
- **Diálogo:** "Correlacionar el momento exacto del despliegue con el primer error en los logs es lo que convierte una sospecha razonable en una conclusión bien fundamentada."
- **Instrucción:** "Correlaciónalos con `grep ERROR logs-sincronizacion.txt`."

### Etapa 5/8 — `cloudcli monitoring list-alarms`
- **Transición:** "El patrón está claro: el despliegue nuevo introdujo el bug. ¿Por qué nadie fue alertado cuando empezó a fallar?"
- **Diálogo:** "Revisar las alarmas configuradas revela la otra mitad del problema: cero alarmas activas para este servicio. Un fallo silencioso, en un sistema sin nadie vigilándolo, puede correr sin que nadie lo note durante días."
- **Instrucción:** "Revísalas con `cloudcli monitoring list-alarms`."

### Etapa 6/8 — `cat proceso-escalamiento.txt`
- **Transición:** "Cero alarmas configuradas. Revisa además si, en caso de haberse detectado, alguien habría sabido a quién avisar."
- **Diálogo:** "Un canal de escalamiento archivado hace meses significa que incluso una alerta que sí hubiera disparado probablemente habría caído en el vacío. Los fallos de proceso rara vez tienen una sola causa."
- **Instrucción:** "Revísalo con `cat proceso-escalamiento.txt`."

### Etapa 7/8 — `echo "..." > hallazgo-monitoreo.txt`
- **Transición:** "Bug de despliegue, cero alarmas, canal de escalamiento muerto. Documenta este hallazgo completo."
- **Diálogo:** "Este es el hallazgo más técnico de todo el episodio de nube — y el que más directamente explica el 'cómo' de lo que pasó, más allá del 'quién'."
- **Instrucción:** "Documéntalo con `echo \"...\" > hallazgo-monitoreo.txt`."

### Etapa 8/8 — `echo "..." > fase-monitoreo.txt`
- **Transición:** "Hallazgo de monitoreo documentado. Cierra esta última fase de investigación antes de correlacionarlo todo."
- **Diálogo:** "Tienes cinco hallazgos independientes ahora: dos del datacenter, uno de IAM, uno de almacenamiento, uno de monitoreo. Ninguno por separado cuenta la historia completa — eso viene en el Nivel 28."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-monitoreo.txt`."

**Cierre de nivel:** investigación de nube completa — bug de despliegue sin monitoreo ni escalamiento. INGenioso anuncia el Nivel 28: correlacionar todos los hallazgos sueltos en una causa raíz real.

---

## Nivel 28 — Causa Raíz (☁️ Agente de Rescate)

### Etapa 1/8 — `cat hallazgo-datacenter-1.txt hallazgo-datacenter-2.txt hallazgo-iam.txt hallazgo-storage.txt hallazgo-monitoreo.txt`
- **Transición:** "Cinco hallazgos, cinco investigaciones separadas. Ninguno por sí solo es la historia completa — reúnelos todos de una vez."
- **Diálogo:** "Un buen análisis de causa raíz (RCA) no se conforma con la primera explicación plausible — correlaciona *todos* los hallazgos en una sola vista antes de sacar conclusiones."
- **Instrucción:** "Reúnelos con `cat hallazgo-datacenter-1.txt hallazgo-datacenter-2.txt hallazgo-iam.txt hallazgo-storage.txt hallazgo-monitoreo.txt`."

### Etapa 2/8 — `echo "..." > linea-tiempo-incidente.txt`
- **Transición:** "Cinco hallazgos reunidos. Ordénalos en una sola línea de tiempo coherente."
- **Diálogo:** "Igual que en el Nivel 13, una línea de tiempo unificada revela relaciones entre eventos que, vistos por separado, parecían no tener conexión."
- **Instrucción:** "Constrúyela con `echo \"...\" > linea-tiempo-incidente.txt`."

### Etapa 3/8 — `echo "Causa raiz: bug en despliegue + rol IAM sobre-permisivo" > causa-raiz.txt`
- **Transición:** "La línea de tiempo conecta todo: el despliegue con bug, ejecutado con un rol que tenía permisos para borrar cualquier cosa. Redacta la causa raíz con esa combinación exacta."
- **Diálogo:** "La causa raíz real casi nunca es una sola cosa — aquí son dos factores que, combinados, permitieron el daño: un bug de software y un permiso excesivo que dejó que ese bug hiciera más daño del que debería haber podido hacer."
- **Instrucción:** "Redáctala con `echo \"Causa raiz: bug en despliegue + rol IAM sobre-permisivo\" > causa-raiz.txt`."

### Etapa 4/8 — `sandboxcli replay --deploy v2.3.1 --dry-run`
- **Transición:** "Tienes una hipótesis sólida. No la des por confirmada todavía — reprodúcela en un entorno controlado."
- **Diálogo:** "Correlación no es lo mismo que causalidad. Reproducir el fallo en un sandbox, con `--dry-run` (sin efectos reales), es lo que separa una teoría convincente de una causa raíz demostrada."
- **Instrucción:** "Reprodúcelo con `sandboxcli replay --deploy v2.3.1 --dry-run`."

### Etapa 5/8 — `sandboxcli confirm`
- **Transición:** "La reproducción muestra exactamente el mismo comportamiento: el despliegue con bug ejecuta `DeleteObject` en vez de `CopyObject` durante la 'limpieza de respaldo'. Confírmalo formalmente."
- **Diálogo:** "Ahora tienes una causa raíz demostrada, no solo plausible — el tipo de conclusión que puede sostenerse ante cualquier pregunta difícil que te hagan después."
- **Instrucción:** "Confirma la reproducción con `sandboxcli confirm`."

### Etapa 6/8 — `cat bitacora-acceso-fisico.txt`
- **Transición:** "Causa raíz confirmada. Antes de cerrar, descarta explícitamente la otra teoría que quedó abierta desde el Nivel 23."
- **Diálogo:** "Un RCA riguroso también descarta explícitamente teorías alternativas — en este caso, confirmar que no hubo acceso físico no autorizado relacionado, para que el informe final sea defendible en todos los frentes, no solo en el que resultó ser cierto."
- **Instrucción:** "Descártala con `cat bitacora-acceso-fisico.txt`."

### Etapa 7/8 — `echo "..." > hipotesis-descartadas.txt`
- **Transición:** "Teoría alternativa descartada formalmente. Documéntala igual que la causa raíz confirmada."
- **Diálogo:** "Un informe serio documenta tanto lo que se confirmó como lo que se descartó y por qué — eso demuestra rigor, no solo una conclusión conveniente."
- **Instrucción:** "Documéntalo con `echo \"...\" > hipotesis-descartadas.txt`."

### Etapa 8/8 — `echo "..." > fase-causa-raiz.txt`
- **Transición:** "Causa raíz confirmada, reproducida, y alternativas descartadas con evidencia. Cierra esta fase central del caso."
- **Diálogo:** "Con la causa raíz completamente resuelta, falta dimensionar el daño real antes de empezar a corregir nada — eso es exactamente el siguiente nivel."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-causa-raiz.txt`."

**Cierre de nivel:** causa raíz confirmada y reproducida: bug de despliegue + permisos IAM excesivos. INGenioso anuncia el Nivel 29: antes de arreglar nada, entender qué tan grave fue esto de verdad.

---

## Nivel 29 — Evaluación de Impacto (☁️ Agente de Rescate)

### Etapa 1/8 — `cloudcli storage list-deleted --bucket calificaciones-sync --count`
- **Transición:** "Causa raíz resuelta. Antes de corregir nada, dimensiona el daño real — sin exagerar ni minimizar."
- **Diálogo:** "Contar exactamente cuántos registros se vieron afectados —no una estimación vaga— es lo primero que evita una reacción desproporcionada en cualquier dirección."
- **Instrucción:** "Cuéntalos con `cloudcli storage list-deleted --bucket calificaciones-sync --count`."

### Etapa 2/8 — `cat estado-bd-onprem.txt`
- **Transición:** "47 objetos, de 3 cursos, cerca de 210 estudiantes. Ahora, el giro clave de este nivel: revisa la base de datos on-premise."
- **Diálogo:** "Antes de asumir que todo está perdido, verifica dónde vive realmente el dato original. La copia en la nube fue lo que se dañó — pero ¿es esa la única fuente de verdad?"
- **Instrucción:** "Revísalo con `cat estado-bd-onprem.txt`."

### Etapa 3/8 — `dbcli verify-integrity --table calificaciones`
- **Transición:** "La base on-premise sigue en línea, sin errores reportados. Verifica su integridad real, no solo que 'está prendida'."
- **Diálogo:** "Saber *dónde vive realmente el dato original* cambia por completo la gravedad de un incidente. Si la base on-premise tiene los datos íntegros, la pérdida en la nube — grave igual — deja de ser una catástrofe irreversible."
- **Instrucción:** "Verifícala con `dbcli verify-integrity --table calificaciones`."

### Etapa 4/8 — `echo "..." > alcance-impacto.txt`
- **Transición:** "92% de integridad confirmada en la fuente real. Documenta el alcance completo del impacto con este contexto crucial."
- **Diálogo:** "El alcance del impacto ahora es mucho más preciso: no 'se perdieron las calificaciones', sino 'se perdió una copia en la nube, con la fuente original mayormente íntegra' — una diferencia enorme para cualquiera que lea este informe."
- **Instrucción:** "Documéntalo con `echo \"...\" > alcance-impacto.txt`."

### Etapa 5/8 — `echo "Severidad: Alta" > severidad-impacto.txt`
- **Transición:** "Alcance documentado con precisión. Clasifica formalmente la severidad."
- **Diálogo:** "Alta, no crítica — porque el dato original sobrevivió. La severidad debe reflejar la realidad exacta del daño, ni más ni menos, para que la respuesta que sigue esté bien calibrada."
- **Instrucción:** "Documéntala con `echo \"Severidad: Alta\" > severidad-impacto.txt`."

### Etapa 6/8 — `cat plan-comunicacion.txt`
- **Transición:** "Severidad clasificada. Antes de notificar a nadie, revisa cómo se debe comunicar algo así."
- **Diálogo:** "Comunicar con un plan estructurado — qué pasó, a quién afecta, qué se está haciendo — es tan parte de la respuesta como la corrección técnica misma. Una mala comunicación puede dañar la confianza incluso cuando la solución técnica es sólida."
- **Instrucción:** "Revísalo con `cat plan-comunicacion.txt`."

### Etapa 7/8 — `echo "..." > notificacion-partes-interesadas.txt`
- **Transición:** "Plan de comunicación revisado. Notifica formalmente a quienes tienen algo en juego en este caso."
- **Diálogo:** "Los números que traigas hoy —47 registros, 210 estudiantes, fuente original 92% íntegra— son los que la UMT va a recordar de este incidente. La precisión con la que comuniques importa tanto como la precisión con la que investigaste."
- **Instrucción:** "Notifícalas con `echo \"...\" > notificacion-partes-interesadas.txt`."

### Etapa 8/8 — `echo "..." > fase-impacto.txt`
- **Transición:** "Impacto evaluado, comunicado con precisión. Cierra esta fase antes de empezar la remediación real."
- **Diálogo:** "Con la causa raíz confirmada y el impacto dimensionado con exactitud, ya tienes todo lo necesario para corregir el problema de fondo — no solo mitigar el síntoma."
- **Instrucción:** "Cierra la fase con `echo \"...\" > fase-impacto.txt`."

**Cierre de nivel:** impacto real dimensionado con precisión — grave, pero no irreversible gracias a la fuente on-premise íntegra. INGenioso anuncia el Nivel 30: corregir la causa raíz de verdad y recuperar lo que se perdió.

---

## Nivel 30 — Remediación y Recuperación (☁️ Agente de Rescate)

### Etapa 1/8 — `cloudcli deploy rollback --service sync-service --to v2.2.0`
- **Transición:** "Causa raíz confirmada, impacto dimensionado. Ahora corrige todo de verdad — cada pieza de la causa raíz, no solo el síntoma visible."
- **Diálogo:** "Corregir la causa raíz significa revertir el cambio defectuoso, no solo mitigar sus efectos. El despliegue `v2.3.1` introdujo el bug — vuelve a la última versión confirmada como buena."
- **Instrucción:** "Revierte el despliegue con `cloudcli deploy rollback --service sync-service --to v2.2.0`."

### Etapa 2/8 — `cloudcli iam update-policy --role sync-service --policy least-privilege.json`
- **Transición:** "Bug revertido. La otra mitad de la causa raíz — los permisos excesivos — sigue sin corregir."
- **Diálogo:** "Aplicar mínimo privilegio donde antes no lo había es lo que evita que un bug futuro, si aparece otro, pueda hacer tanto daño como este. No estás solo arreglando el problema de hoy — estás reduciendo el radio de explosión del próximo."
- **Instrucción:** "Corrígela con `cloudcli iam update-policy --role sync-service --policy least-privilege.json`."

### Etapa 3/8 — `cloudcli monitoring create-alarm --metric sync-errors --threshold 1`
- **Transición:** "Bug corregido, permisos corregidos. El tercer hueco de la causa raíz: nadie fue alertado cuando esto empezó a fallar."
- **Diálogo:** "Crear una alarma con un umbral bajo (`--threshold 1`) para este tipo de error específico cierra exactamente el hueco de monitoreo que permitió que el problema pasara desapercibido durante tanto tiempo."
- **Instrucción:** "Créala con `cloudcli monitoring create-alarm --metric sync-errors --threshold 1`."

### Etapa 4/8 — `cloudcli storage enable-versioning --bucket calificaciones-sync`
- **Transición:** "Monitoreo corregido. Activa además el control preventivo que habría evitado la pérdida de datos desde el principio."
- **Diálogo:** "El versionado que encontraste desactivado en el Nivel 26 se activa ahora — un control preventivo para el futuro: si algo vuelve a intentar borrar datos por error, esta vez sí se podrán recuperar."
- **Instrucción:** "Actívalo con `cloudcli storage enable-versioning --bucket calificaciones-sync`."

### Etapa 5/8 — `dbcli export --table calificaciones --to cloud-restore.json`
- **Transición:** "Los tres controles preventivos están en su lugar. Ahora sí, restaura los datos afectados — desde la fuente que confirmaste íntegra."
- **Diálogo:** "Restaurar solo *después* de que la causa está corregida es el orden correcto — restaurar antes habría significado que el mismo bug, todavía activo, volviera a borrar los datos recién recuperados."
- **Instrucción:** "Restaura los datos con `dbcli export --table calificaciones --to cloud-restore.json`."

### Etapa 6/8 — `raidcli rebuild --array raid5-db01 --follow-procedure`
- **Transición:** "Datos restaurados. Queda un hallazgo pendiente desde el Nivel 23: el RAID degradado del datacenter físico."
- **Diálogo:** "Repararlo *siguiendo el procedimiento formal* — la misma frase de la política que revisaste en el Nivel 23 — es lo que separa un mantenimiento de rutina bien hecho de un segundo incidente autoinfligido por las prisas."
- **Instrucción:** "Repáralo con `raidcli rebuild --array raid5-db01 --follow-procedure`."

### Etapa 7/8 — `dbcli verify-integrity --table calificaciones`
- **Transición:** "RAID reparado según el procedimiento. Un último cierre: confirma la integridad total, ahora que todo está corregido."
- **Diálogo:** "El mismo comando del Nivel 29, ahora debería mostrar 100% en vez del 92% de entonces — tu confirmación objetiva de que la recuperación fue completa, no solo aparente."
- **Instrucción:** "Verifícala con `dbcli verify-integrity --table calificaciones`."

### Etapa 8/8 — `echo "..." > recuperacion-completa.txt`
- **Transición:** "Integridad al 100%. Cada pieza de la causa raíz corregida, los datos recuperados, controles preventivos activos. Documenta la recuperación completa."
- **Diálogo:** "Cada paso de este nivel fue algo que ya hiciste antes, en otro nombre, en otro nivel — pero esta vez lo hiciste sola, de punta a punta, sin que nadie te lo indicara paso a paso."
- **Instrucción:** "Documenta la recuperación con `echo \"...\" > recuperacion-completa.txt`."

**Cierre de nivel:** recuperación completa: causa raíz corregida en sus tres componentes, datos restaurados desde una fuente íntegra, controles preventivos activos para el futuro. INGenioso anuncia el Nivel 31: el examen final — compilar todo en un informe y cerrar Kernel Cero.

---

## Nivel 31 — Informe Final y Reconocimiento (🦸 Héroe del Club → examen final)

*Cierre del juego. Tono de reconocimiento genuino — INGenioso mira hacia atrás, al recorrido completo de los 30 niveles anteriores, no solo hacia adelante.*

### Etapa 1/8 — `cat fase-datacenter.txt fase-iam.txt fase-storage.txt fase-monitoreo.txt fase-causa-raiz.txt fase-impacto.txt`
- **Transición:** "Datacenter, IAM, almacenamiento, monitoreo, causa raíz, impacto, remediación — recorriste el caso completo. Reúne todas las fases de una vez, por última vez."
- **Diálogo:** "Compilar todas las fases juntas es el primer paso de cualquier informe final serio — nada se documenta de memoria, todo se reúne de lo que ya quedó registrado en el camino."
- **Instrucción:** "Compílalas con `cat fase-datacenter.txt fase-iam.txt fase-storage.txt fase-monitoreo.txt fase-causa-raiz.txt fase-impacto.txt`."

### Etapa 2/8 — `echo "..." > resumen-ejecutivo.txt`
- **Transición:** "Todo compilado. Empieza el informe por quien menos tiempo tiene de leerlo entero."
- **Diálogo:** "Un resumen ejecutivo condensa el caso completo para quien no tiene tiempo — ni necesidad — de leer cada detalle técnico, pero sí necesita entender qué pasó y qué tan grave fue."
- **Instrucción:** "Redáctalo con `echo \"...\" > resumen-ejecutivo.txt`."

### Etapa 3/8 — `echo "..." > hallazgos-tecnicos.txt`
- **Transición:** "Resumen ejecutivo listo. Ahora, la versión completa para quien sí necesita cada detalle."
- **Diálogo:** "Los hallazgos técnicos son para el equipo que va a mantener este sistema después de que te vayas — con el nivel de detalle que un resumen ejecutivo, a propósito, no tiene."
- **Instrucción:** "Redáctalos con `echo \"...\" > hallazgos-tecnicos.txt`."

### Etapa 4/8 — `echo "..." > recomendaciones.txt`
- **Transición:** "Hallazgos documentados. Un buen informe no termina en 'esto está mal' — termina en qué hacer al respecto."
- **Diálogo:** "Recomendaciones concretas y accionables — no 'mejorar la seguridad' en abstracto, sino compromisos verificables como revisión trimestral de IAM o pruebas de restauración mensuales — son lo que convierte un informe en algo que realmente cambia cómo opera una organización."
- **Instrucción:** "Redáctalas con `echo \"...\" > recomendaciones.txt`."

### Etapa 5/8 — `echo "..." > informe-final-umt.txt`
- **Transición:** "Resumen, hallazgos y recomendaciones listos. Compílalo todo en el informe final para la UMT."
- **Diálogo:** "Este es el documento que la Universidad Metropolitana de Tecnología va a conservar — la prueba tangible de una auditoría híbrida completa, hecha con el mismo rigor en cada uno de sus 31 niveles."
- **Instrucción:** "Entrega el informe final con `echo \"...\" > informe-final-umt.txt`."

### Etapa 6/8 — `cat carta-agradecimiento.txt`
- **Transición:** "Informe entregado. Antes de cerrar del todo, hay algo esperándote."
- **Diálogo:** "A veces el cierre de un caso viene con algo que ningún comando técnico puede generar: reconocimiento genuino de quienes recibieron tu ayuda."
- **Instrucción:** "Léela con `cat carta-agradecimiento.txt`."

### Etapa 7/8 — `echo "..." > reconocimiento-club.txt`
- **Transición:** "La UMT agradece al Club de la Ingeniería — y por extensión, a ti. Recibe formalmente ese reconocimiento."
- **Diálogo:** "Desde la agente que no sabía qué buscar en su primer `pwd` hasta quien Vera envió a representar al club fuera de casa — este documento es el cierre de ese recorrido completo, no solo de este último caso."
- **Instrucción:** "Recíbelo con `echo \"...\" > reconocimiento-club.txt`."

### Etapa 8/8 — `echo "Mision cumplida" > cierre-final.txt`
- **Transición:** "Todo cerrado: el caso de la UMT, y con él, Kernel Cero completo. Escribe el último comando, agente. Te lo ganaste."
- **Diálogo:** "31 niveles, 8 etapas cada uno, de reconocimiento de red a auditoría de nube — cada comando que escribiste tenía un porqué real detrás, no solo una sintaxis que memorizar. Eso es lo que te llevas de aquí."
- **Instrucción:** "Cierra la misión con `echo \"Mision cumplida\" > cierre-final.txt`."

**Cierre del juego:** `finishGame()` — certificado simbólico, estadísticas finales (tiempo, pistas usadas, comandos aprendidos), cheatsheet completo desbloqueado, y el cierre narrativo ya implementado: "CASO NULLSHADOW77 — ESTADO: CERRADO". INGenioso reconoce el recorrido completo con un mensaje final que nombra el esfuerzo real del jugador, no talento innato — consistente con la calibración de halagos del resto del juego.

---

## Resumen para revisión

- **248 diálogos de etapa** (31 niveles × 8) + plantilla de tono por rango, completos en este documento.
- Cada instrucción fue verificada contra la lógica real de `handleLevelN` en el código — no contra suposiciones.
- Cada explicación técnica es una adaptación narrada de `docs/teoria-operacion-laboratorio-b.md` — ninguna teoría nueva inventada.
- **Nada de esto está implementado todavía.** El siguiente paso, cuando lo apruebes, es traducir cada entrada a los `BRIEFINGS`/nuevas estructuras de etapa en `linux-cli.html`, reutilizando `showInstrPanel()` ya construido — sin tocar el parser de comandos existente.
