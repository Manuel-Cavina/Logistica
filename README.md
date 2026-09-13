<div align="center">

# 🐎 Ruta Directa

**Marketplace de cupos y retornos para el transporte de caballos.**
Menos viajes vacíos para el transportista, más confianza para quien envía.

[![CI](https://github.com/Manuel-Cavina/Logistica/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Manuel-Cavina/Logistica/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![AI-assisted](https://img.shields.io/badge/built%20with-AI%20agents-8A2BE2)

[Qué es](#-qué-es) · [Ejecutarlo](#-cómo-ejecutarlo) · [Recorrido](#-primer-recorrido-por-la-app) · [Arquitectura](#-stack-y-arquitectura) · [Cómo trabajamos](#-cómo-trabajamos) · [Desarrollo con IA](#-desarrollo-asistido-por-ia) · [Roadmap](#-roadmap)

</div>

---

## 🎯 Qué es

En Argentina, el traslado de caballos se coordina casi siempre por WhatsApp. Eso deja **retornos vacíos**, **pagos sin protección** y **cero trazabilidad** si algo sale mal.

Ruta Directa conecta a quien necesita mover caballos con **transportistas verificados** que publican sus viajes y los cupos libres, incluidos los de regreso.

> **Hipótesis central:** un trailer de 4 cupos que hace 2 viajes por semana pierde entre 1 y 2 cupos por viaje en el retorno. Si esos cupos se venden, el transportista gana más **sin gastar más**.

```mermaid
flowchart LR
    A[🚚 Transportista<br/>publica viaje y cupos] --> B[🔎 Cliente<br/>busca y compara]
    B --> C[📅 Reserva<br/>sin sobreventa]
    C --> D[💳 Seña<br/>pago protegido]
    D --> E[📍 Viaje<br/>check-in / check-out]
    E --> F[🧾 Comprobante<br/>y reputación]
```

| Rol | Qué hace |
|---|---|
| **Cliente** | Dueños, studs y haras que buscan y reservan cupos |
| **Transportista** | Publica viajes y gestiona su flota; un admin lo verifica antes de operar |
| **Admin** | Aprueba o rechaza transportistas y supervisa la plataforma |

### Estado del proyecto

MVP en construcción. Esta tabla muestra el estado **real**, auditado contra el código ([`docs/audits`](docs/audits/2026-05-05-system-audit.md)).

| Módulo | Backend | Frontend |
|---|:---:|:---:|
| Autenticación, sesiones y roles | ✅ | ✅ |
| Perfil y verificación de transportistas | ✅ | ✅ |
| Panel admin de transportistas | ✅ | ✅ |
| Flota: vehículos y trailers | ✅ | ✅ |
| Ofertas de viaje y búsqueda pública | ✅ | 🟡 datos de ejemplo |
| Reservas con anti-overbooking | ✅ | ⏳ |
| Pagos (Mercado Pago) y webhooks | ⏳ | ⏳ |
| Evidencia, comprobante PDF, reputación, disputas | ⏳ | ⏳ |

✅ implementado · 🟡 parcial · ⏳ pendiente

---

## 🚀 Cómo ejecutarlo

Levantarlo por primera vez lleva unos 5 minutos. Vas a tener la **web** en `localhost:3000`, la **API** en `localhost:3001` y **PostgreSQL** corriendo en Docker.

### Requisitos

| Herramienta | Versión | Cómo verificarla | Si no la tenés |
|---|---|---|---|
| Node.js | 20 o superior | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 | `pnpm -v` | `corepack enable` (viene con Node) |
| Docker | cualquiera reciente | `docker -v` | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Git | cualquiera | `git --version` | [git-scm.com](https://git-scm.com) |

> En Windows y macOS, Docker Desktop tiene que estar **abierto** antes de seguir.

### Paso 1 — Clonar e instalar dependencias

```bash
git clone https://github.com/Manuel-Cavina/Logistica.git
cd Logistica
pnpm install
```

### Paso 2 — Configurar las variables de entorno

Copiar el archivo de ejemplo en la **raíz** del repo:

```bash
cp .env.example .env
```

> En la consola CMD de Windows: `copy .env.example .env`

Abrir `.env` y completar, como mínimo, estas cinco variables. Sin ellas la API no arranca:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logistica"
AUTH_ACCESS_TOKEN_SECRET="pegar-aca-un-secreto"
AUTH_REFRESH_TOKEN_SECRET="pegar-aca-otro-secreto-distinto"
AUTH_ACCESS_TOKEN_TTL_SECONDS="900"
AUTH_REFRESH_TOKEN_TTL_SECONDS="604800"
```

La `DATABASE_URL` de arriba coincide con el `docker-compose.yml`, así que se puede usar tal cual. Para generar cada secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Las variables de Mercado Pago, Cloudflare R2 y Sentry todavía no son necesarias. La web no necesita un `.env` propio: le habla a la API a través de un proxy de Next.js (`/api/*` → `localhost:3001`).

### Paso 3 — Levantar la base de datos

```bash
docker compose up -d
docker compose ps
```

✅ El contenedor `logistica-postgres` tiene que figurar como `healthy`. Puede tardar unos segundos.

### Paso 4 — Crear las tablas

```bash
pnpm --filter @logistica/database db:migrate
```

✅ Prisma aplica las migraciones y genera el cliente. Solo hace falta la primera vez, o cuando alguien agrega una migración nueva.

### Paso 5 — Levantar la app

```bash
pnpm dev
```

Turborepo muestra una pestaña por aplicación. ✅ Todo está listo cuando la API imprime `API is running on http://localhost:3001` y Next.js avisa que está escuchando en el puerto 3000.

| Servicio | URL |
|---|---|
| 🌐 Web | http://localhost:3000 |
| ⚙️ API | http://localhost:3001 |

### Uso diario

Después de la primera vez, alcanza con esto:

```bash
docker compose up -d   # base de datos
pnpm dev               # web + api
```

Para apagar: `Ctrl + C` en la terminal y después `docker compose down`. Los datos se conservan; `docker compose down -v` los borra por completo.

### Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta web y api en modo desarrollo |
| `pnpm --filter @logistica/web dev` | Levanta solo la web |
| `pnpm --filter @logistica/api dev` | Levanta solo la API |
| `pnpm test` | Corre todos los tests (leer la advertencia de abajo) |
| `pnpm lint` · `pnpm typecheck` | Los mismos chequeos que exige la CI |
| `pnpm build` | Build de producción |
| `pnpm --filter @logistica/database db:studio` | Abre Prisma Studio para ver los datos |

> ⚠️ **Antes de correr `pnpm test`:** el test de concurrencia de reservas se conecta a la base configurada en `.env` y **vacía** las tablas de cuentas, ofertas y reservas. No correrlo contra datos que quieras conservar.

<details>
<summary><b>🛠️ Si algo falla</b></summary>

| Síntoma | Causa probable | Solución |
|---|---|---|
| `DATABASE_URL is required` o `AUTH_… is required` | Falta el `.env` o está incompleto | Revisar el paso 2; el `.env` va en la **raíz** del repo |
| `Can't reach database server at localhost:5432` | PostgreSQL no está corriendo | `docker compose up -d` y esperar a `healthy` |
| `Cannot connect to the Docker daemon` o `error during connect` | Docker Desktop está cerrado | Abrir Docker Desktop y reintentar |
| Puerto 5432 ocupado | Hay otro PostgreSQL local | Detenerlo, o cambiar el puerto en `docker-compose.yml` y en `DATABASE_URL` |
| Puerto 3000 o 3001 ocupado | Otra app usa el puerto | Cerrar esa app y volver a correr `pnpm dev` |
| `The table … does not exist in the current database` | Faltan las migraciones | Correr el paso 4 |
| Quiero empezar con la base vacía | — | `docker compose down -v`, `docker compose up -d` y el paso 4 |

</details>

---

## 🧭 Primer recorrido por la app

La base arranca vacía. Este recorrido muestra el flujo principal que ya funciona de punta a punta.

**1. Habilitar un admin de desarrollo.** Agregar al `.env` y reiniciar `pnpm dev`:

```env
AUTH_MOCK_ADMIN_ENABLED="true"
AUTH_MOCK_ADMIN_EMAIL="admin@example.com"
AUTH_MOCK_ADMIN_PASSWORD="secret123"
```

> Es una cuenta ficticia, solo para desarrollo: en producción queda deshabilitada aunque la variable exista.

**2. Registrarse como transportista.** Entrar a [`/register`](http://localhost:3000/register), elegir el rol *Transportista* y crear la cuenta.

**3. Completar el perfil.** La app redirige al onboarding. Al completar el perfil con nombre y teléfono de contacto, el estado pasa a **Pendiente**.

**4. Aprobarlo como admin.** Cerrar sesión, ingresar en [`/login`](http://localhost:3000/login) con las credenciales del admin y aprobar al transportista desde [`/admin/transporters`](http://localhost:3000/admin/transporters).

**5. Cargar la flota.** Volver a ingresar como transportista y dar de alta vehículos y trailers desde [`/vehicles`](http://localhost:3000/vehicles).

Las páginas públicas ([home](http://localhost:3000), [cómo funciona](http://localhost:3000/como-funciona), detalle de viaje y de transportista) ya tienen el diseño final, pero todavía muestran datos de ejemplo.

---

## 🧱 Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS · React Hook Form |
| Backend | NestJS 11 (monolito modular) · Passport JWT · Argon2 |
| Datos | PostgreSQL 16 · Prisma 6 |
| Contratos | Schemas Zod compartidos entre web y api (`@logistica/shared`) |
| Monorepo | pnpm workspaces · Turborepo |
| Calidad | Jest · Testing Library · Supertest · ESLint · Prettier · GitHub Actions |

### ¿Dónde está cada cosa?

| Si buscás… | Mirá en… |
|---|---|
| Pantallas y rutas de la web | [`apps/web/app/`](apps/web/app) |
| Lógica de cada pantalla (hooks, servicios, formularios) | [`apps/web/features/`](apps/web/features) |
| Endpoints y reglas de negocio | [`apps/api/src/`](apps/api/src), un módulo por dominio |
| Modelo de datos y migraciones | [`packages/database/prisma/`](packages/database/prisma) |
| Validaciones compartidas entre web y api | [`packages/shared/src/schemas/`](packages/shared/src/schemas) |
| Producto, arquitectura y decisiones | [`docs/`](docs) |
| Diseño visual y mockups | [`docs/design/`](docs/design/design-system.md) |

Cada módulo del backend respeta la misma separación: **controller** (HTTP, sin lógica) → **service** (reglas de negocio) → **repository** (único acceso a Prisma). Los tests viven al lado del código que prueban.

**Decisiones que definen el sistema:**

- **Cero sobreventa.** Reservar descuenta cupos dentro de una transacción, y lo cubre un test de concurrencia.
- **Sesiones seguras.** Access token corto + refresh token en cookie `HttpOnly`, guardado solo como hash y rotado por familia.
- **La plataforma nunca custodia dinero.** Los pagos van por un PSP externo (Mercado Pago) con webhooks idempotentes.
- **Multi-rubro en el modelo, equinos en la UI.** El dominio está listo para otras cargas sin reescribir el core.

---

## 🔄 Cómo trabajamos

Cada cambio es **chico, trazable y revisable en 20 minutos**.

```mermaid
flowchart LR
    A[docs/backlog.yaml] -->|pnpm issues:create| B[Issue en GitHub]
    B --> C[Rama desde develop]
    C --> D[Commits atómicos]
    D --> E[PR con template]
    E --> F[CI: lint · typecheck · test · build]
    F --> G[Revisión humana]
    G --> H[Merge a develop]
```

- **Backlog versionado.** Las épicas viven en [`docs/backlog.yaml`](docs/backlog.yaml) y se convierten en issues con un script.
- **1 issue = 1 rama = 1 PR.** Ramas `feature/…`, `fix/…`, `docs/…`, siempre desde `develop` actualizado.
- **Commits convencionales.** `feat(booking): expire pending bookings`, `fix(auth): …`, `test(…): …`.
- **PR con contrato.** El [template](.github/PULL_REQUEST_TEMPLATE.md) pide criterios de aceptación, validación, riesgos y zonas protegidas tocadas.
- **Definition of Done verificable.** Pasa lint, typecheck y tests, y no agrega nada fuera del alcance del issue.

<details>
<summary><b>¿Querés contribuir?</b></summary>

1. Crear una rama desde `develop`: `git checkout -b feature/<numero>-<descripcion>`.
2. Leer [`AGENTS.md`](AGENTS.md): define la estructura de módulos, las convenciones y las zonas que requieren aprobación.
3. Antes de abrir el PR, correr `pnpm lint`, `pnpm typecheck` y `pnpm test`.
4. Abrir el PR contra `develop` completando el template.

</details>

---

## 🤖 Desarrollo asistido por IA

Este proyecto se construyó con agentes de IA (**Claude Code** y **Codex**) como implementadores. La regla es simple:

> **La IA ejecuta. Las decisiones de producto, arquitectura y seguridad las toma una persona.**

Mi rol fue el de product owner, arquitecto y revisor. La IA escribió gran parte del código, pero **dentro de un contrato explícito** y con cada PR revisado antes de mergear.

### El contrato: [`AGENTS.md`](AGENTS.md)

Es el documento que todo agente lee antes de tocar el código:

| Sección | Para qué sirve |
|---|---|
| Stack oficial | Evita que el agente introduzca librerías o patrones por su cuenta |
| Estructura de módulos | Todo módulo nuevo se ve igual que los existentes |
| Reglas críticas del producto | Sin billetera propia, webhooks idempotentes, anti-overbooking transaccional |
| Zonas protegidas | Pagos, auth, roles, migraciones y producción no se tocan sin aprobación |
| Definition of Done | Qué significa "terminado", sin margen de interpretación |

### Las barreras de seguridad

1. **Zonas protegidas.** Si una tarea toca pagos, auth, roles o migraciones, el agente describe el cambio y **se detiene** hasta tener aprobación.
2. **Pausa obligatoria después de cada push.** El agente reporta rama, commits y qué cambió. No arranca la siguiente tarea sin un "continuar" explícito.
3. **La ambigüedad de negocio no la resuelve la IA.** Si hay más de una interpretación, propone una y pregunta antes de implementar.
4. **Tests obligatorios donde duele.** Todo lo que maneja estado, dinero o permisos lleva tests, incluido un test de concurrencia para las reservas.

### Agentes en paralelo

Para avanzar más rápido, dos agentes trabajaron a la vez en **carriles** separados (por ejemplo, backend de flota y rediseño del frontend), cada uno en su propio `git worktree`. Las reglas para que no se pisen están en [`docs/parallel-agent-workflow.md`](docs/parallel-agent-workflow.md): un carril no cambia contratos de API por su cuenta, y si dos carriles tocan `@logistica/shared`, uno mergea primero y el otro hace rebase.

```bash
# backlog.yaml → issues de GitHub
pnpm issues:create

# Rama con el formato correcto
pnpm agent:branch --issue-number 123 --slug e3-schema

# PR con el template completo
pnpm agent:pr --lane backend-e3 --issue-number 123 --issue-title "Extender schema base E3"
```

### Lo que aprendimos

- **La documentación de contexto envejece.** Una auditoría ([`docs/audits`](docs/audits/2026-05-05-system-audit.md)) detectó que un documento de contexto describía un schema viejo. Por eso auditamos el código contra la documentación, y el código es siempre la fuente de verdad.
- **Un agente construye lo que le pedís, aunque sea una maqueta que parece producto.** Las pantallas públicas se adelantaron al backend; conectarlas es ahora la prioridad.
- **PRs chicos ganan.** Casi 100 PRs mergeados, cada uno con un solo propósito. Revisar código generado por IA solo es viable si los cambios son chicos.

---

## 🗺️ Roadmap

- [x] Fundaciones: monorepo, CI, documentación base
- [x] Autenticación, sesiones y roles
- [x] Perfil y verificación de transportistas
- [x] Flota: vehículos y trailers
- [x] Ofertas de viaje y búsqueda pública (backend)
- [x] Reservas con anti-overbooking (backend)
- [ ] Conectar búsqueda, detalle y reserva en el frontend
- [ ] Pagos con Mercado Pago y webhooks idempotentes
- [ ] Operación del viaje: check-in / check-out con evidencia
- [ ] Comprobante PDF, reputación y disputas
- [ ] Métricas de milla libre ahorrada

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Visión de producto, público y métricas de éxito |
| [`docs/architecture.md`](docs/architecture.md) | Arquitectura del sistema |
| [`docs/api.md`](docs/api.md) | Endpoints de la API |
| [`docs/backlog.md`](docs/backlog.md) | Épicas, dependencias y prioridades |
| [`docs/governance.md`](docs/governance.md) | Reglas de trabajo y gobernanza |
| [`docs/TECH_DEBT.md`](docs/TECH_DEBT.md) | Deuda técnica registrada |
| [`docs/audits/`](docs/audits/2026-05-05-system-audit.md) | Auditoría del estado real del sistema |
| [`docs/design/`](docs/design/design-system.md) | Sistema de diseño y mockups de referencia |
| [`AGENTS.md`](AGENTS.md) | Contrato de trabajo para agentes de IA |

---

<div align="center">

Hecho por [Manuel Cavina](https://github.com/Manuel-Cavina) · con agentes de IA como equipo y criterio humano al mando.

</div>
