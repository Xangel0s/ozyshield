# OzyShield — Documentacion del Sistema

Plataforma de monitoreo y seguridad de infraestructura en tiempo real.

---

## Arquitectura General

OzyShield utiliza una arquitectura de tres capas:

| Capa | Tecnologia | Puerto | Funcion |
|------|-----------|--------|---------|
| Frontend | React + Vite + Tailwind CSS | 3000 | Dashboard de monitoreo |
| Backend | Go (Golang) | 8080 | API REST central |
| Agente | Go (Golang) | — | Daemon ligero en cada VM |
| Base de datos | PostgreSQL 15 | 5432 | Almacenamiento persistente |

---

## Frontend — Dashboard UI

### Tema visual: "Obsidian Stealth"

- Modo oscuro permanente con estetica Material Design 3
- Paleta de colores personalizada: fondo `#1a1c1e`, superficies `#141617` a `#323536`
- Tipografia: Inter (cuerpo), JetBrains Mono (codigo)
- Iconografia: Google Material Symbols Outlined
- Componentes reutilizables: `.glass-card`, `.tonal-card`
- Scrollbar personalizado y animaciones (pulse-red para alertas criticas)

### Rutas de navegacion

| Ruta | Componente | Descripcion |
|------|-----------|-------------|
| `/` | DashboardView | Panel principal de monitoreo |
| `/nodes` | NodesView | Gestion de nodos/conexiones |
| `/nodes/:id` | NodesView | Detalle de un nodo especifico |
| `/logs` | LogsView | Triaje de incidentes de seguridad |
| `/incidents/:id` | LogsView | Detalle de un incidente especifico |
| `/settings` | SettingsView | Configuracion del sistema |

### Componente: TopNavBar

- Logo de OzyShield con icono de escudo
- Links de navegacion: Dashboard, Nodes, Logs, Settings
- Estado activo resaltado con color primario y borde inferior
- Boton "Simulate Incident": genera un incidente mock via `POST /v1/simulate-crash`
- Boton "Deploy Node": muestra modal con comando de instalacion del agente
- Avatar de usuario (placeholder)
- Fijo en la parte superior (`fixed top-0 z-50`)

### Componente: DashboardView

**Tarjetas de estadisticas (StatsRow):**

| Metrica | Descripcion |
|---------|-------------|
| Total Nodes | Cantidad total de nodos registrados con indicador de online |
| Active Incidents | Incidentes criticos activos con indicador pulsante rojo |
| Resolved | Incidentes resueltos con barra de progreso decorativa |
| System Health | Porcentaje de nodos online vs total |

**Tabla de flota en vivo (FleetTable):**
- Columnas: Node ID, Status, Services, OS, Last Seen
- Deteccion de online: ultimo heartbeat dentro de 60 segundos
- Filas clickeables que navegan al detalle del nodo
- Badge "Live" indicando actualizacion en tiempo real

**Panel de trafico (TrafficPanel):**
- Ingress Saturation: grafico de barras con 8 puntos de datos
- Network Latency: latencia global en ms con indicador de tendencia

**Pulso de seguridad (SecurityPulse):**
- Timeline vertical con los 5 incidentes mas recientes
- Cada entrada muestra: timestamp UTC, servicio, mensaje, log truncado
- Puntos de colores alternados segun severidad
- Boton "VIEW ALL SECURITY LOGS"

### Componente: NodesView

**Busqueda y filtros:**
- Input de busqueda por nombre o node_id
- Boton de filtros (placeholder de UI)

**Tabla de nodos:**
- Columnas: Machine (icono + nombre + ID), Addresses (con copia al hover), Version (OS + plataforma), Last Seen
- Iconos por SO: Linux, Windows, macOS, Otro
- Indicador de conexion con punto verde brillante
- Filas clickeables

**Sidebar (pantallas xl+):**
- Tarjeta de bienvenida con guia de soluciones
- Panel de estado global: conexiones activas, throughput de datos

**Funcion "Add device":**
- Modal con comando curl de instalacion
- Boton de copiar al portapapeles con confirmacion
- Instrucciones para reemplazar valores

### Componente: LogsView

**Encabezado del incidente:**
- ID del incidente mas reciente
- Badges: "IN PROGRESS", "CRITICAL" con icono de advertencia
- Vista previa del log (150 caracteres)
- Botones: "Acknowledge", "Assign to Team"

**Tarjetas de detalle (4 columnas):**
1. Detection Time — tiempo relativo + timestamp UTC
2. Target Node — node_id con tipo de instancia
3. Involved Services — chip del servicio afectado
4. Security Impact — puntuacion 94/100 con barra de progreso

**Resumen de diagnostico (AI-Generated):**
- Analisis de causa raiz generado por IA
- Accion recomendada (primer paso de remediacion)
- Nodo objetivo afectado

**Panel de gestion de incidentes:**
- Boton "View Related Alerts"
- Boton "Generate Report" con icono de descarga
- Activity Feed (timeline):
  1. Incident Detected — Sistema
  2. IPS Rule Deployed — Automacion
  3. Pending Assignment — Actual

**Tabla de todos los incidentes:**
- Input de busqueda por log_line, servicio o node_id
- Filtros: All, Critical, Resolved
- Cada fila muestra: Badge, log_line, node_id, servicio, tiempo relativo
- Filas clickeables

### Componente: SettingsView

**Navegacion lateral:**
- General, Authentication, Billing, API Keys, Team, Support

**Seccion: Network Identity**
- Tailnet Name: nombre de la red (default: "ozyshield-alpha-cluster")
- Primary Domain: dominio principal (default: "internal.ozy-ops.net")

**Seccion: Global Visibility**
- Stealth Mode: toggle — descarta paquetes ICMP y de sondeo no solicitados
- Auto-Approval: toggle — autoriza automaticamente nodos verificados via OIDC

**Seccion: Retention Policies**
- Audit Log Retention: slider de 30 a 365 dias (default: 90)
- Advertencia regulatoria: retencion menor a 90 dias puede violar PCI-DSS

### Componentes compartidos

**Modal:**
- Dialogo reutilizable con overlay oscuro (70% negro)
- Bloquea scroll del body al abrirse
- Cierra al hacer click fuera
- z-index: 100

**Badge:**
- Variantes: critical (rojo), warning (ambar), ok (azul), offline (gris), default

### Hook: usePolling

- `usePolling(fetcher, intervalMs)` — polling personalizado
- Retorna `{ data, loading, error, refetch }`
- Intervalo por defecto: 5000ms
- Limpieza automatica al desmontar

### Cliente API

- Base URL: `/v1` (proxy a localhost:8080 via Vite)
- Autenticacion: Bearer token `demo-token-123`
- Metodos: `get()`, `post()`, `put()`, `del()`
- Headers: `Authorization`, `Content-Type: application/json`

---

## Backend — Servidor Central

### Punto de entrada

Archivo: `server/cmd/ozyserver/main.go`

**Secuencia de inicio:**
1. Parseo del flag de puerto (default: 8080)
2. Inicializacion del store (PostgreSQL preferido, fallback a memoria)
3. Inicializacion del cache de diagnosticos con patrones pre-cargados
4. Carga de datos mock (2 nodos + 1 incidente) para modo memoria
5. Carga de tokens de autenticacion desde variable `OZY_AUTH_TOKENS`
6. Registro de rutas API
7. Inicio del servidor HTTP con timeouts de 15s lectura/escritura, 60s idle
8. Apagado graceful en SIGINT/SIGTERM

### Endpoints API

| Metodo | Ruta | Auth | Handler | Descripcion |
|--------|------|------|---------|-------------|
| GET | `/v1/health` | No | GetHealth | Health check (status, version, uptime) |
| GET | `/v1/install.sh` | No | GetInstallScript | Script de instalacion del agente |
| POST | `/v1/discovery` | Si | RegisterDiscovery | Registro de metadata del sistema |
| POST | `/v1/telemetry` | Si | IngestTelemetry | Recepcion de logs de error |
| POST | `/v1/heartbeat` | Si | Heartbeat | Senal de vida del agente |
| GET | `/v1/nodes` | Si | ListNodes | Listar todos los nodos |
| GET | `/v1/nodes/{id}` | Si | GetNode | Obtener nodo especifico |
| DELETE | `/v1/nodes/{id}` | Si | DeleteNode | Eliminar nodo |
| GET | `/v1/incidents` | Si | ListIncidents | Listar todos los incidentes |
| PUT | `/v1/incidents/{id}` | Si | UpdateIncidentStatus | Cambiar estado de incidente |
| POST | `/v1/simulate-crash` | Si | SimulateCrash | Generar incidente mock |

### Middleware de autenticacion

- Bearer token via header `Authorization`
- Tokens cargados desde `OZY_AUTH_TOKENS` (separados por coma)
- Default: `demo-token-123`
- Excepciones: `/v1/health` y `/v1/install.sh`

### Modelos de datos

**Node:**
- `node_id` (PK), `name`, `os`, `platform`, `cpu_count`
- `services` (JSONB) — mapa de nombre de servicio a estado
- `last_seen` — timestamp del ultimo heartbeat

**Incident:**
- `id` (PK), `node_id` (FK -> nodes, CASCADE), `log_line`, `service`
- `diagnosis` — analisis de causa raiz
- `remediation` (JSONB) — pasos de remediacion
- `status` — "critical", "acknowledged", "resolved"
- `timestamp` — momento de deteccion

### Store: PostgreSQL

- Auto-migracion al iniciar:
  - Tabla `nodes`: node_id (PK), name, os, platform, cpu_count, services (JSONB), last_seen
  - Tabla `incidents`: id (PK), node_id (FK), log_line, service, diagnosis, remediation (JSONB), status, timestamp
  - Indices en: node_id, status, timestamp DESC
- Upsert de nodos, delete cascade de incidentes

### Store: Memoria (fallback)

- Thread-safe con `sync.RWMutex`
- Nodos en `map[string]Node`
- Incidentes como slice (mas recientes primero)
- Usado cuando PostgreSQL no esta disponible

### Motor de diagnostico IA

**Modo dual:**

1. **OpenAI (cuando `OPENAI_API_KEY` esta configurada):**
   - Modelo: `gpt-4o-mini`
   - Timeout: 8 segundos
   - Prompt en espanol: experto SRE/arquitecto analizando logs de error
   - Respuesta JSON estructurada: `{ cause, steps[] }`
   - Fallback a heuristicas en caso de fallo

2. **Heuristico (default/MVP):**
   - Motor de coincidencia de patrones:
     - PostgreSQL: lock timeout/deadlock, connection refused, too many connections
     - Nginx: 502 Bad Gateway, 413 Request Entity Too Large, permission denied
     - OOM: out of memory, OOM-killer, killed process
     - Redis: maxmemory limit reached
     - Fallback generico
   - Diagnostico y pasos de remediacion en espanol

### Cache de diagnosticos

- Thread-safe con `sync.RWMutex`
- Clave: SHA-256 del log normalizado (minusculas, sin espacios extra)
- Pre-cargado con patrones conocidos de PostgreSQL y Nginx

---

## Agente — Daemon del Cliente

### Punto de entrada

Archivo: `agent/cmd/ozyagent/main.go`

**Ciclo de vida:**
1. Carga de configuracion (env vars > flags > defaults)
2. Escaneo de descubrimiento del sistema
3. Reporte de metadata al servidor central
4. Inicializacion del rate limiter (5 tokens, 0.2 refill/sec, 15s dedup window)
5. Inicio del tailing de logs configurados (goroutine por ruta)
6. Loop principal: filtrar errores, sanitizar, rate-limit, deduplicar, despachar telemetria
7. Apagado graceful en SIGINT/SIGTERM

### Configuracion

| Parametro | Env Var | Flag | Default |
|-----------|---------|------|---------|
| Token de auth | `OZY_CLIENT_TOKEN` | `-token` | (modo demo si vacio) |
| Node ID | `OZY_NODE_ID` | `-node` | hostname del sistema |
| Rutas de log | `OZY_LOG_PATHS` | `-paths` | Linux: `/var/log/syslog`, `/var/log/nginx/error.log`; Windows: `C:\Windows\Temp\ozy.log` |
| URL del servidor | `OZY_SERVER_URL` | `-server` | `http://localhost:8080` |

### Descubrimiento del sistema

**Escaneo al iniciar:**
- Hostname, SO, cantidad de CPUs
- Servicios monitoreados: nginx, postgresql, docker, mysql, redis, apache2, mongodb
- **Linux:** verifica via `systemctl is-active`, luego `service status`, luego `pgrep`
- **Windows:** verifica via `sc query`, fallback a `tasklist`
- Cada servicio clasificado como: `active`, `inactive`, o `not_found`
- Resultados reportados via `POST /v1/discovery`

### Monitoreo de logs (File Tailing)

- Tailing no bloqueante con goroutine por ruta de log
- Busca al final del archivo al iniciar (evita leer historial)
- Buffer de 4KB con acumulacion de lineas parciales
- **Manejo de rotacion de logs:**
  - Copy-truncate: tamano del archivo disminuido = reabrir desde inicio
  - Rename-recreate: comparacion de inodo `os.SameFile()` = reabrir archivo nuevo
  - Logica de reintento con backoff
- Compatible con Windows (elimina `\r` de lineas `\r\n`)

### Sanitizador Zero-Knowledge

**Objetivos de redaccion (aplicados en orden):**
1. URIs de base de datos — `postgresql://user:pass@host` → `postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@host`
2. Bearer tokens — `Bearer eyJhb...` → `Bearer [REDACTED_TOKEN]`
3. Credenciales de config — `password=`, `api_key=`, `secret=`, `token=` → `[REDACTED_SECRET]`
4. Numeros de tarjeta de credito — validados con algoritmo Luhn → `[REDACTED_CARD]`
5. Direcciones de email — `user@example.com` → `[REDACTED_EMAIL]`

### Rate Limiter y Deduplicacion

- **Token bucket:** capacidad de 5 tokens, recarga de 0.2 tokens/segundo (1 token cada 5 segundos)
- **Deduplicacion:** ventana deslizante de 15 segundos usando los primeros 64 caracteres del log como firma
- Previene tormentas de telemetria y alertas duplicadas

### Reporter HTTP

- **Report:** `POST /v1/telemetry` con autenticacion Bearer token; timeout 10s
- **ReportDiscovery:** `POST /v1/discovery` con autenticacion Bearer token; timeout 10s

---

## Infraestructura

### Docker Compose

| Servicio | Puerto | descripcion |
|----------|--------|-------------|
| ozyshield-server | 8080 | Servidor Go central |
| ozyshield-db | 5432 | PostgreSQL 15 Alpine |

- Volumen persistente `pgdata` para la base de datos
- Variables de entorno para credenciales DB y API key de OpenAI

### Dockerfile (Multi-stage)

- **Stage 1 (Build):** Go 1.22 Alpine, compila binario estatico con `-ldflags="-s -w"`
- **Stage 2 (Runtime):** Alpine 3.19 minimo, incluye certificados CA

### Script de instalacion del agente

**One-liner:** `curl -fsSL http://SERVER:8080/v1/install.sh?token=TOKEN | bash`

**Proceso:**
1. Requiere root
2. Detecta arquitectura CPU (amd64/arm64)
3. Descarga binario pre-compilado del servidor
4. Escribe configuracion en `/etc/ozyshield/ozyagent.conf`
5. Crea e inicia servicio systemd (`ozyagent.service`)
6. Configura reinicio automatico en fallo

---

## Caracteristicas transversales

### Autenticacion

- Mecanismo: Bearer token (API key)
- Server-side: middleware valida contra `OZY_AUTH_TOKENS`
- Client-side: token hardcodeado `demo-token-123` en frontend
- Alcance: todos los endpoints excepto health check y install script

### Monitoreo en tiempo real

- Frontend: polling cada 3-5 segundos via hook `usePolling`
- Agente: heartbeats y telemetria en tiempo real
- Deteccion de online: umbral de 60 segundos en `last_seen`

### Diagnostico IA

- Modo dual: OpenAI GPT-4o-mini (con API key) o motor heuristico local
- Cache SHA-256 para evitar analisis redundantes
- Pre-cargado con patrones de PostgreSQL y Nginx
- Diagnostico y remediacion en espanol

### Despliegue de agentes

- Instalacion via one-liner curl-pipe-bash
- Auto-deteccion de arquitectura (amd64/arm64)
- Registro como servicio systemd
- Soporte para Linux, macOS y Windows

### Sanitizacion de datos

- Agente redacta datos sensibles antes de transmision
- Email, tarjetas de credito (validadas con Luhn), URIs de DB, bearer tokens, secretos de config
- Garantiza que ningun PII sale de la maquina del cliente

### Gestion de incidentes

- Flujo de estados: critical → acknowledged → resolved
- Causa raiz + pasos de remediacion generados por IA
- Activity feed con seguimiento (deteccion, regla IPS, asignacion)
- Lista de incidentes buscable y filtrable
- Puntuacion de impacto de seguridad (94/100)

### Gestion de nodos

- Auto-registro via escaneo de descubrimiento
- Monitoreo de estado de servicios (7 servicios: nginx, postgresql, docker, mysql, redis, apache2, mongodb)
- Deteccion online/offline con indicadores visuales
- Soporte para eliminacion de nodos (cascade delete en PostgreSQL)

### Configuracion

- Nombre de Tailnet y dominio principal (identidad de red)
- Modo stealth (descarte de paquetes ICMP/probe)
- Auto-aprobacion para nodos verificados via OIDC
- Retencion de audit logs (30-365 dias) con advertencia de compliance PCI-DSS

### Stack tecnologico

| Capa | Tecnologias |
|------|------------|
| Frontend | React 19, Vite 5, Tailwind CSS 4, React Router 7, Material Symbols |
| Backend | Go 1.22, PostgreSQL 15, pgx/v5, OpenAI API |
| Agente | Go 1.22, systemd, file tailing, token bucket |
| Infraestructura | Docker, Docker Compose, Alpine Linux |
| Fuentes | Inter, JetBrains Mono |

---

## Inventario de archivos

| Archivo | Lineas | Proposito |
|---------|--------|-----------|
| `system/src/App.jsx` | 26 | Routing de React |
| `system/src/main.jsx` | 10 | Punto de entrada React |
| `system/src/index.css` | 61 | Estilos globales |
| `system/src/components/dashboard/DashboardView.jsx` | 214 | Dashboard principal |
| `system/src/components/nodes/NodesView.jsx` | 205 | Gestion de nodos |
| `system/src/components/logs/LogsView.jsx` | 273 | Triaje de incidentes |
| `system/src/components/settings/SettingsView.jsx` | 154 | Configuracion |
| `system/src/components/layout/TopNavBar.jsx` | 80 | Barra de navegacion |
| `system/src/components/shared/Modal.jsx` | 29 | Dialogo modal |
| `system/src/components/shared/Badge.jsx` | 15 | Badge de estado |
| `system/src/hooks/useApi.js` | 27 | Hook de polling |
| `system/src/lib/api.js` | 44 | Cliente HTTP |
| `server/cmd/ozyserver/main.go` | 216 | Entrada del servidor |
| `server/internal/api/routes.go` | 41 | Definicion de rutas |
| `server/internal/api/handlers.go` | 325 | Handlers API |
| `server/internal/api/middleware.go` | 35 | Middleware de auth |
| `server/internal/db/db.go` | 177 | Store en memoria + modelos |
| `server/internal/db/postgres.go` | 238 | Store PostgreSQL |
| `server/internal/engine/ai.go` | 230 | Motor de diagnostico IA |
| `server/internal/engine/cache.go` | 61 | Cache de diagnosticos |
| `agent/cmd/ozyagent/main.go` | 144 | Entrada del agente |
| `agent/internal/config/config.go` | 82 | Configuracion del agente |
| `agent/internal/discovery/discovery.go` | 154 | Descubrimiento del sistema |
| `agent/internal/monitor/tailer.go` | 173 | Tailing de archivos de log |
| `agent/internal/filter/sanitizer.go` | 108 | Redaccion de PII |
| `agent/internal/filter/limiter.go` | 86 | Rate limiting |
| `agent/internal/client/reporter.go` | 90 | Reporte HTTP |

**Total:** 12 archivos frontend, 9 archivos backend, 8 archivos agente = **29 archivos fuente** en toda la pila.
