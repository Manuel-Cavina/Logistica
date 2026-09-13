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

[El problema](#-el-problema) · [Cómo funciona](#-cómo-funciona) · [Inicio rápido](#-inicio-rápido) · [Cómo trabajamos](#-cómo-trabajamos) · [Desarrollo con IA](#-desarrollo-asistido-por-ia) · [Roadmap](#-roadmap)

</div>

---

## 🎯 El problema

En Argentina, el traslado de equinos se coordina casi siempre por WhatsApp y contactos directos. El resultado:

| Dolor | Consecuencia |
|---|---|
| Retornos vacíos | El transportista paga el viaje de vuelta sin ingresos |
| Sin trazabilidad | No hay evidencia si algo sale mal |
| Coordinación manual | Tiempo perdido y cancelaciones de último momento |
| Pagos sin protección | Riesgo de no cobrar o de no recibir el servicio |

> **Hipótesis central:** un trailer de 4 cupos que hace 2 viajes por semana pierde entre 1 y 2 cupos por viaje en el retorno. Si esos cupos se venden, el transportista gana más **sin gastar más**.

## 💡 Cómo funciona

```mermaid
flowchart LR
    A[🚚 Transportista<br/>publica viaje y cupos] --> B[🔎 Cliente<br/>busca y compara]
    B --> C[📅 Reserva<br/>sin sobreventa]
    C --> D[💳 Seña<br/>pago protegido]
    D --> E[📍 Viaje<br/>check-in / check-out]
    E --> F[🧾 Comprobante<br/>y reputación]
```

Tres roles: **Cliente** (dueños, studs, haras), **Transportista** (verificado por un admin) y **Admin** (aprueba transportistas y supervisa la operación).

## 📊 Estado del proyecto

MVP en construcción. Lo que ves en la tabla es el estado **real**, auditado contra el código ([`docs/audits`](docs/audits/2026-05-05-system-audit.md)).

| Módulo | Backend | Frontend |
|---|:---:|:---:|
| Autenticación, sesiones y roles | ✅ | ✅ |
| Perfil y verificación de transportistas | ✅ | ✅ |
| Panel admin de transportistas | ✅ | ✅ |
| Flota: vehículos y trailers | ✅ | ✅ |
| Ofertas de viaje y búsqueda pública | ✅ | 🟡 UI con datos de ejemplo |
| Reservas con anti-overbooking | ✅ | ⏳ |
| Pagos (Mercado Pago) y webhooks | ⏳ | ⏳ |
| Evidencia, comprobante PDF, reputación, disputas | ⏳ | ⏳ |

✅ implementado · 🟡 parcial · ⏳ pendiente

## 🧱 Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS · React Hook Form |
| Backend | NestJS 11 (monolito modular) · Passport JWT · Argon2 |
| Datos | PostgreSQL 16 · Prisma 6 |
| Contratos | Schemas Zod compartidos entre web y api (`@logistica/shared`) |
| Monorepo | pnpm workspaces · Turborepo |
| Calidad | Jest · Testing Library · Supertest · ESLint · Prettier · GitHub Actions |

```text
apps/
├─ web/        → Next.js: rutas en app/, lógica por dominio en features/
└─ api/        → NestJS: un módulo por dominio (auth, vehicle, trailer, trip-offer, booking…)
packages/
├─ database/   → Prisma schema, migraciones y PrismaService
├─ shared/     → schemas Zod + tipos compartidos
└─ *-config/   → configuración compartida de ESLint y TypeScript
docs/          → PRD, backlog, arquitectura, API, gobernanza, deuda técnica
```

Cada módulo del backend respeta la misma separación: **controller** (HTTP, sin lógica) → **service** (reglas de negocio) → **repository** (único punto de acceso a Prisma). Los tests viven al lado del código.

**Decisiones que definen el sistema:**

- **Cero sobreventa.** Reservar descuenta cupos dentro de una transacción, y lo cubre un test de concurrencia.
- **Sesiones seguras.** Access token corto + refresh token en cookie `HttpOnly`, guardado solo como hash y rotado por familia.
- **La plataforma nunca custodia dinero.** Los pagos van por un PSP externo (Mercado Pago) con webhooks idempotentes.
- **Multi-rubro en el modelo, equinos en la UI.** El dominio está listo para otras cargas sin reescribir el core.

## 🚀 Inicio rápido

**Requisitos:** Node.js 20+, pnpm 9 y Docker.

```bash
# 1. Clonar e instalar
git clone https://github.com/Manuel-Cavina/Logistica.git
cd Logistica
pnpm install

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Crear el archivo de entorno (en la raíz del repo)
cp .env.example .env

# 4. Aplicar las migraciones
pnpm --filter @logistica/database db:migrate

# 5. Levantar web + api
pnpm dev
```

| Servicio | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |

La web llama a la API a través del proxy `/api/*` de Next.js, así que no hace falta configurar nada extra en local.

<details>
<summary><b>Variables mínimas del <code>.env</code></b></summary>

La API no arranca sin estas cinco. Los valores de ejemplo coinciden con el `docker-compose.yml`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logistica"
AUTH_ACCESS_TOKEN_SECRET="un-secreto-largo-y-aleatorio"
AUTH_REFRESH_TOKEN_SECRET="otro-secreto-largo-y-aleatorio"
AUTH_ACCESS_TOKEN_TTL_SECONDS="900"
AUTH_REFRESH_TOKEN_TTL_SECONDS="604800"
```

El resto de las variables (Mercado Pago, Cloudflare R2, Sentry) todavía no son necesarias para desarrollar. La lista completa está en [`.env.example`](.env.example).

</details>

<details>
<summary><b>Entrar como admin sin crear usuarios</b></summary>

Para probar el panel de administración en local, agregar al `.env`:

```env
AUTH_MOCK_ADMIN_ENABLED="true"
AUTH_MOCK_ADMIN_EMAIL="admin@example.com"
AUTH_MOCK_ADMIN_PASSWORD="secret123"
```

Con eso, `/login` acepta esas credenciales y crea una sesión `ADMIN` de desarrollo. En producción queda deshabilitado aunque la variable exista.

</details>

<details>
<summary><b>Si algo falla</b></summary>

| Síntoma | Causa probable |
|---|---|
| `DATABASE_URL is required` | Falta el `.env` en la **raíz** del repo |
| La API no conecta a la base | El contenedor no está corriendo: `docker compose ps` |
| Puerto 5432 ocupado | Hay otro PostgreSQL local; detenerlo o cambiar el puerto en `docker-compose.yml` y en `DATABASE_URL` |

</details>

### Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta web y api en modo desarrollo |
| `pnpm test` | Corre todos los tests |
| `pnpm lint` · `pnpm typecheck` | Chequeos que exige la CI |
| `pnpm build` | Build de producción |
| `pnpm --filter @logistica/database db:studio` | Abre Prisma Studio |

## 🔄 Cómo trabajamos

El flujo está pensado para que cada cambio sea **chico, trazable y revisable en 20 minutos**.

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
- **1 issue = 1 rama = 1 PR.** Ramas `feature/…`, `fix/…`, `docs/…` siempre desde `develop` actualizado.
- **Commits convencionales.** `feat(booking): expire pending bookings`, `fix(auth): …`, `test(…): …`.
- **PR con contrato.** El [template](.github/PULL_REQUEST_TEMPLATE.md) pide criterios de aceptación, validación, riesgos y zonas protegidas tocadas.
- **Definition of Done verificable.** Pasa lint, typecheck y tests; no agrega nada fuera del alcance del issue.

## 🤖 Desarrollo asistido por IA

Este proyecto se construyó con agentes de IA (**Claude Code** y **Codex**) como implementadores. La regla es simple:

> **La IA ejecuta. Las decisiones de producto, arquitectura y seguridad las toma una persona.**

Mi rol fue el de product owner, arquitecto y revisor. La IA escribió gran parte del código, pero **dentro de un contrato explícito** y con cada PR revisado antes de mergear.

### El contrato: [`AGENTS.md`](AGENTS.md)

Es el documento que todo agente lee antes de tocar el código. Define:

| Sección | Para qué sirve |
|---|---|
| Stack oficial | Evita que el agente introduzca librerías o patrones por su cuenta |
| Estructura de módulos | Todo módulo nuevo se ve igual que los existentes |
| Reglas críticas del producto | Sin billetera propia, webhooks idempotentes, anti-overbooking transaccional |
| Zonas protegidas | Pagos, auth, roles, migraciones y producción no se tocan sin aprobación |
| Definition of Done | Qué significa "terminado", sin interpretación |

### Las barreras de seguridad

1. **Zonas protegidas.** Si una tarea toca pagos, auth, roles o migraciones, el agente describe el cambio y **se detiene** hasta tener aprobación.
2. **Pausa obligatoria después de cada push.** El agente reporta rama, commits y qué cambió. No arranca la siguiente tarea sin un "continuar" explícito.
3. **La ambigüedad de negocio no la resuelve la IA.** Si hay más de una interpretación, propone una y pregunta antes de implementar.
4. **Tests obligatorios donde duele.** Todo lo que maneja estado, dinero o permisos lleva tests, incluido un test de concurrencia para las reservas.

### Agentes en paralelo

Para avanzar más rápido, dos agentes trabajaron a la vez en **carriles** separados (por ejemplo, backend de flota y rediseño del frontend), cada uno en su propio `git worktree`. Las reglas para que no se pisen están en [`docs/parallel-agent-workflow.md`](docs/parallel-agent-workflow.md): un carril no cambia contratos de API por su cuenta, y si dos carriles tocan `@logistica/shared`, uno mergea primero y el otro hace rebase.

Scripts que estandarizan el trabajo de los agentes:

```bash
# backlog.yaml → issues de GitHub
pnpm issues:create

# Rama con el formato correcto
pnpm agent:branch --issue-number 123 --slug e3-schema

# PR con el template completo
pnpm agent:pr --lane backend-e3 --issue-number 123 --issue-title "Extender schema base E3"
```

### Lo que aprendimos

- **La documentación de contexto envejece.** Una auditoría ([`docs/audits`](docs/audits/2026-05-05-system-audit.md)) detectó que un documento de contexto describía un schema viejo. Por eso auditamos el código contra la documentación y el código es siempre la fuente de verdad.
- **Un agente construye lo que le pedís, aunque sea una maqueta que parece producto.** Las pantallas públicas se adelantaron al backend; ahora conectarlas es prioridad.
- **PRs chicos ganan.** Casi 100 PRs mergeados, cada uno con un solo propósito. Revisar código generado por IA solo es viable si los cambios son chicos.

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

Hecho por [Manuel Cavina](https://github.com/Manuel-Cavina) · con agentes de IA como equipo, y criterio humano al mando.

</div>
