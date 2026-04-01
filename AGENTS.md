# AGENTS.md
<!-- version: 2.0 | última actualización: 2026-04 | revisar si cambia stack, estados o zonas protegidas -->

## Propósito del proyecto

Este repositorio implementa una **plataforma de cupos y retornos para transporte**, con vertical
inicial **Equinos**, pero con **core multi-rubro preparado** desde el día 1.

Propuesta de valor:

- reducir viajes vacíos / milla libre
- permitir publicar cupos y retornos
- reservar capacidad disponible
- operar con pago protegido (PSP: Mercado Pago)
- dar trazabilidad mínima, comprobante y reputación

---

## Stack oficial

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS + shadcn/ui |
| Backend | NestJS (monolito modular) + Prisma ORM |
| Base de datos | PostgreSQL (Neon / Supabase / Render) |
| Storage | Cloudflare R2 + presigned upload directo |
| Jobs | jobs en DB para MVP; BullMQ + Upstash Redis cuando escale |
| Observabilidad | Sentry free tier + logs estructurados |
| Pagos | Mercado Pago (PSP externo); nunca custodiar saldo en la app |
| Monorepo | pnpm workspaces + Turborepo |

**No usar** otras tecnologías sin ADR aprobado y sin actualizar este archivo.

---

## Estructura del repo

```
/
├─ AGENTS.md
├─ CODEX_CONTEXT.md
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ .env.example
├─ .gitignore
├─ .editorconfig
├─ .prettierrc
├─ .eslintrc.cjs
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  │  ├─ epic.yml
│  │  ├─ feature.yml
│  │  ├─ bug.yml
│  │  └─ task.yml
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ workflows/
│     └─ ci.yml
├─ apps/
│  ├─ web/          ← Next.js App Router
│  └─ api/          ← NestJS monolito modular
├─ packages/
│  ├─ database/          ← PrismaService + PrismaModule (@logistica/database)
│  ├─ shared/            ← schemas Zod + interfaces (@logistica/shared)
│  ├─ eslint-config/     ← configuración ESLint compartida
│  └─ typescript-config/ ← configuración TypeScript compartida
└─ docs/
   ├─ PRD.md
   ├─ backlog.md
   ├─ architecture.md
   ├─ api.md
   ├─ glossary.md
   ├─ governance.md
   ├─ runbook.md
   ├─ TECH_DEBT.md
   └─ decisions/
      ├─ 001-monorepo.md
      ├─ 002-auth-strategy.md
      ├─ 003-payments-psp-escrow.md
      └─ 004-booking-anti-overbooking.md
```

---

## Estructura de un módulo NestJS

Todos los módulos de `apps/api/src` siguen esta estructura. El agente debe replicarla exactamente:

```
src/
└─ trip-offer/
   ├─ trip-offer.module.ts
   ├─ trip-offer.controller.ts
   ├─ trip-offer.controller.spec.ts      ← test de integración HTTP (Test.createTestingModule + supertest)
   ├─ application/
   │  ├─ trip-offer.service.ts           ← reglas de negocio
   │  └─ trip-offer.service.spec.ts      ← unit tests con jest.fn()
   ├─ dto/
   │  ├─ create-trip-offer.dto.ts
   │  └─ update-trip-offer.dto.ts
   ├─ repositories/
   │  └─ trip-offer.repository.ts        ← único punto de acceso a PrismaService
   └─ types/
      └─ trip-offer.types.ts             ← Prisma selects tipados + tipos internos
```

### Reglas del módulo NestJS

- Los **controladores** solo reciben request, validan con `ZodValidationPipe` y delegan al service. Sin lógica de negocio.
- Los **services** (en `application/`) contienen las reglas de negocio. Llaman al repository, no a Prisma directo.
- Los **repositories** (en `repositories/`) encapsulan todas las queries de Prisma. Usan selects tipados.
- Los **DTOs** usan schemas Zod de `@logistica/shared` validados con `ZodValidationPipe`. Siempre tipados con TypeScript estricto.
- Los **tipos** (en `types/`) definen los Prisma selects tipados con `Prisma.validator` y los tipos de retorno con `Prisma.ModelGetPayload`.
- **Tests colocados**: `.spec.ts` junto al archivo, nunca en `__tests__/`. Sin barrel files `index.ts` dentro de módulos.

### Ejemplo de repository con Prisma

```typescript
// trip-offer.repository.ts
@Injectable()
export class TripOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TripOffer | null> {
    return this.prisma.tripOffer.findUnique({ where: { id } });
  }

  async decrementSlots(
    offerId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<TripOffer> {
    return tx.tripOffer.update({
      where: { id: offerId },
      data: { availableSlots: { decrement: quantity } },
    });
  }
}
```

### Transacciones Prisma

Siempre usar `prisma.$transaction` para operaciones que involucren más de una tabla o que deban ser atómicas. El cliente de transacción se pasa por parámetro al repository.

```typescript
// en el service
async reserveSlots(bookingDto: CreateBookingDto): Promise<Booking> {
  return this.prisma.$transaction(async (tx) => {
    const offer = await this.tripOfferRepository.lockForUpdate(offerId, tx);
    if (offer.availableSlots < bookingDto.quantity) {
      throw new ConflictException('No hay cupos disponibles');
    }
    await this.tripOfferRepository.decrementSlots(offerId, bookingDto.quantity, tx);
    return this.bookingRepository.create(bookingDto, tx);
  });
}
```

---

## Estructura de Next.js App Router

```
apps/web/
├─ app/
│  ├─ layout.tsx                     ← RootLayout + AuthProvider
│  ├─ page.tsx                       ← home
│  ├─ (guest)/                       ← rutas públicas (login, register)
│  │  ├─ layout.tsx                  ← <AuthRouteGuard mode="guest-only">
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  └─ (protected)/                   ← rutas autenticadas
│     ├─ layout.tsx                  ← <AuthRouteGuard mode="protected">
│     ├─ dashboard/page.tsx
│     └─ onboarding/transporter/
│        ├─ layout.tsx               ← <AuthRouteGuard allowedRoles={["TRANSPORTER"]}>
│        └─ page.tsx
├─ components/
│  └─ ui/                            ← Button, Card, Input, Textarea (custom, estilo shadcn)
├─ features/                         ← lógica por feature (auth, transporter-onboarding, etc.)
│  └─ feature-name/
│     ├─ components/                 ← componentes "use client"
│     ├─ hooks/                      ← hooks "use client"
│     ├─ pages/                      ← componentes de página "use client"
│     ├─ services/                   ← llamadas a la API
│     ├─ types/                      ← tipos + schemas Zod del feature
│     └─ config/                     ← configuración (mapas de estado, etc.)
└─ src/
   └─ lib/
      ├─ api/                        ← apiClient, errores, tipos de respuesta
      └─ forms/                      ← useFormSubmit, schemas de formularios
```

### Reglas de Next.js

- Usar **App Router** siempre. No mezclar con Pages Router.
- Los **Server Components** son el default (`app/page.tsx`). Solo importan y pasan props al componente de feature.
- `'use client'` obligatorio en: hooks, forms, componentes con useState/useEffect/onClick, providers.
- El **fetching de datos** es client-side con hooks custom (ej: `useTransporterProfile`). No se usa `fetch()` en Server Components actualmente.
- Los **layouts** agrupan auth guards por segmento con `<AuthRouteGuard>`.
- Las **rutas de API** (`app/api/`) se usan solo para proxies o callbacks externos. No para lógica de negocio.
- **No se usan Server Actions** — las mutaciones van via `apiClient.patch/post/etc.` desde client hooks.

### Client vs Server Component — criterio de decisión

```
¿Necesita useState, useEffect, onClick, onChange?  → 'use client'
¿Es solo UI que muestra datos?                     → Server Component (default)
¿Es un page.tsx en app/?                           → Server Component mínimo, delega a feature component
¿Necesita acceso a localStorage o window?          → 'use client'
```

---

## Imports y paths de TypeScript

### Alias configurados

**Frontend (`apps/web/tsconfig.json`):**
```json
{ "paths": { "@/*": ["./*"] } }
```
`@/` resuelve a la raíz de `apps/web/`.

**Backend (`apps/api/`):** sin aliases locales. Solo `baseUrl: "./"` para imports relativos.

**Workspace packages:** disponibles como `@logistica/shared` y `@logistica/database`.

### Reglas de imports

**Backend (apps/api/):**
- Workspace: `import { X } from '@logistica/shared'` / `'@logistica/database'`
- Módulo actual: relativo → `'./application/trip-offer.service'`
- Otros módulos: relativo con `../../` según profundidad
- **Sin alias `@/` en el backend**

**Frontend (apps/web/):**
- UI components: `@/components/ui/button`
- Lib: `@/src/lib/api`, `@/src/lib/forms/hooks/useFormSubmit`
- Cross-feature: `@/features/auth/hooks/use-auth`
- Dentro de un feature: relativo → `'../hooks/use-transporter-profile'`
- Shared: `@logistica/shared` para tipos y schemas compartidos

```typescript
// ✅ correcto — frontend
import { Button } from '@/components/ui/button';
import { apiClient } from '@/src/lib/api';
import type { UpdateTransporterProfileDto } from '@logistica/shared';
import { useTransporterProfile } from '../hooks/use-transporter-profile';

// ✅ correcto — backend
import { UpdateTransporterProfileSchema } from '@logistica/shared';
import { PrismaService } from '@logistica/database';
import { TripOfferService } from './application/trip-offer.service';

// ❌ incorrecto
import { TripOffer } from '@equinos/types';          // no existe
import { OfferCard } from '@equinos/ui';             // no existe
import { X } from '../../../packages/shared/src/x'; // ruta relativa fuera de la app
```

---

## Naming conventions

| Concepto | Convención | Ejemplo |
|---|---|---|
| Clases, DTOs, tipos | `PascalCase` | `CreateTripOfferDto` |
| Variables y funciones | `camelCase` | `availableSlots` |
| Constantes de config | `SCREAMING_SNAKE_CASE` | `MAX_SLOTS_PER_BOOKING` |
| Archivos NestJS | `kebab-case.tipo.ts` | `trip-offer.service.ts` |
| Archivos Next.js | `kebab-case.tsx` o convención Next | `offer-card.tsx` |
| Archivos de test | `*.spec.ts` junto al archivo | `trip-offer.service.spec.ts` |
| Tablas Prisma | `PascalCase` singular | `TripOffer`, `Booking` |
| Columnas Prisma | `camelCase` | `availableSlots`, `createdAt` |
| Enums Prisma | `SCREAMING_SNAKE_CASE` | `PENDING_PAYMENT`, `CONFIRMED` |
| Routes Next.js | `kebab-case` en carpetas | `mis-traslados/`, `nueva-oferta/` |
| Variables de entorno | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `MP_ACCESS_TOKEN` |

---

## Entidades núcleo del dominio

```
User
DriverProfile          ← perfil extendido del transportista
Vehicle / Trailer      ← vehículo con capacidad en SLOTS
TripOffer              ← oferta de viaje publicada
Booking                ← reserva de cupos sobre una oferta
Payment                ← estado del pago PSP
Proof                  ← evidencias check-in / check-out
Review                 ← calificación post-viaje
Dispute                ← problema reportado
CargoType              ← EQUINE (ahora), FOOD, PEOPLE, etc. (después)
CapacityUnit           ← SLOT (ahora), KG, M3, SEAT (después)
```

El campo `cargoType` y `capacityUnit` deben existir en el schema desde el Sprint 0.
La UI del MVP puede mostrar solo "Equinos", pero el modelo no puede estar bloqueado.

---

## Estados de negocio — no modificar sin ADR

### Offer.status
```
DRAFT → PUBLISHED → FULL (auto)
PUBLISHED → CLOSED (manual)
PUBLISHED / FULL → IN_PROGRESS (al salir)
IN_PROGRESS → COMPLETED
cualquiera → CANCELLED
```

### Booking.status
```
PENDING_PAYMENT → CONFIRMED (seña recibida)
CONFIRMED → IN_PROGRESS (check-in)
IN_PROGRESS → DELIVERED_PENDING_CONFIRMATION (check-out)
DELIVERED_PENDING_CONFIRMATION → COMPLETED (cliente confirma)
DELIVERED_PENDING_CONFIRMATION → DISPUTED (reporta problema)
cualquiera → CANCELLED
```

### Payment.status
```
INITIATED → HELD (seña capturada por PSP)
HELD → RELEASED (entrega confirmada)
HELD → REFUNDED (cancelación válida)
HELD → DISPUTED (disputa abierta)
cualquiera → FAILED
```

**Regla**: nunca transicionar un estado sin validar el estado previo. Lanzar excepción si la transición no está permitida.

---

## Reglas críticas del producto

### R1 — No billetera propia
La app **no custodia dinero**. Solo registra estados informados por Mercado Pago vía webhook.
Nunca crear lógica que mueva fondos internamente.

### R2 — Webhooks idempotentes
Los webhooks de Mercado Pago pueden llegar más de una vez con el mismo `payment_id`.
Toda lógica de webhook debe ser idempotente: procesar el mismo evento dos veces no debe producir efectos distintos a procesarlo una vez.
Guardar el `external_reference` y el `payment_id` para deduplicar.

### R3 — Anti-overbooking transaccional
Toda reserva que decremente `availableSlots` debe hacerse dentro de `prisma.$transaction`.
Si dos requests concurrentes intentan el último cupo, solo una puede triunfar.
Usar `SELECT FOR UPDATE` (via `prisma.$queryRaw`) o manejo de `ConflictException` con retry controlado.

### R4 — Contacto restringido
Los datos de contacto completos (teléfono, email real, WhatsApp) y el chat libre se habilitan
**solo después de que el `Payment.status` sea `HELD`**.
Antes de eso: chat limitado y sin datos de contacto.

### R5 — Multi-rubro en modelo, UI solo Equinos
Nunca hardcodear `cargoType === 'EQUINE'` en lógica de negocio.
La UI puede tener ese valor fijo en el MVP, pero el backend debe aceptar y procesar cualquier `cargoType` válido.

### R6 — Evidencia obligatoria en check-in/out
Las fotos de check-in y check-out no son opcionales una vez que el booking está `IN_PROGRESS`.
El `Proof` debe existir antes de permitir avanzar el estado del booking.

### R7 — Uploads directo a R2
Las fotos **no pasan por el backend**. El flujo es:
1. Cliente pide presigned URL al backend
2. Cliente sube directo a R2
3. Cliente confirma la URL al backend
4. Backend guarda la URL en `Proof`

---

## Integración Mercado Pago

El PSP es **Mercado Pago**. Usar el SDK oficial: `@mercadopago/sdk-js` (frontend) y `mercadopago` (backend Node.js).

### Variables de entorno requeridas
```
MP_ACCESS_TOKEN=        ← token de producción / test
MP_PUBLIC_KEY=          ← clave pública para el frontend
MP_WEBHOOK_SECRET=      ← para validar firma de webhooks
```

### Flujo de pago (seña)
1. Backend crea preference en MP con `external_reference = bookingId`
2. Frontend redirige a MP Checkout o usa Checkout Bricks
3. MP procesa y llama al webhook con el resultado
4. Backend valida firma, actualiza `Payment.status` a `HELD`
5. Backend activa el acceso a contacto y chat completo

### Validación de webhook
```typescript
// Siempre validar la firma antes de procesar
const isValid = validateMPSignature(req.headers, req.body, process.env.MP_WEBHOOK_SECRET);
if (!isValid) throw new UnauthorizedException('Invalid webhook signature');
```

---

## Zonas protegidas

El agente **no puede modificar** estos archivos o módulos sin aprobación humana explícita:

| Zona | Archivos / módulos |
|---|---|
| Pagos | `src/payment/`, `src/webhook/`, cualquier lógica que cambie `Payment.status` |
| Auth | `src/auth/`, guards, decoradores de roles |
| Anti-overbooking | lógica de `decrementSlots` y `prisma.$transaction` en booking |
| Migraciones | `prisma/migrations/` — nunca generar migraciones destructivas |
| Producción | `.env.production`, workflows de deploy |
| Roles | definición de roles y permisos en Prisma y guards |

Si una tarea toca una zona protegida, el agente debe:
1. Identificar qué zona toca
2. Describir el cambio propuesto
3. Detenerse y esperar aprobación

---

## Comandos del proyecto

```bash
pnpm install          # instalar dependencias
pnpm dev              # levantar todo en modo desarrollo
pnpm build            # build de producción (debe pasar sin errores)
pnpm lint             # linting (correr antes de abrir PR)
pnpm typecheck        # verificación de tipos (correr antes de abrir PR)
pnpm test             # tests (correr después de cambios en módulos críticos)
pnpm test:e2e         # tests de integración
pnpm db:migrate       # aplicar migraciones Prisma
pnpm db:seed          # seed de datos iniciales
pnpm db:studio        # Prisma Studio local
```

Si se agregan apps o packages, deben integrarse sin romper ninguno de estos comandos.

---

## Gestión de secretos y variables de entorno

- **Ningún** secreto, token, API key o credencial puede aparecer en el código.
- Toda variable sensible vive en `.env` (nunca commiteada).
- El repo tiene `.env.example` con todas las variables necesarias sin valores reales.
- Si el agente necesita un valor de configuración, debe referenciarlo como variable de entorno
  y documentarlo en `.env.example`.

Variables mínimas requeridas:
```
# Base de datos
DATABASE_URL=

# Auth (JWT)
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Mercado Pago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Sentry
SENTRY_DSN=

# App
NEXT_PUBLIC_API_URL=
NODE_ENV=development
```

---

## Reglas de testing

### Qué testear siempre

| Módulo | Tests obligatorios |
|---|---|
| `booking` | happy path, sin cupos disponibles, concurrencia (2 requests simultáneos) |
| `payment` / `webhook` | idempotencia (mismo evento x2), firma inválida, estado inválido |
| `auth` | login correcto, credenciales incorrectas, token expirado, rol incorrecto |
| `trip-offer` | crear, publicar, FULL automático al llegar a 0 cupos |
| Guards de rol | acceso correcto, acceso denegado por rol, acceso sin token |

### Criterios mínimos

- Unit test para toda regla de negocio con estado, dinero o permisos
- Happy path siempre cubierto
- Al menos 2 casos borde por módulo crítico
- Integration test cuando hay transacciones o concurrencia
- Test de idempotencia en webhooks: mismo evento procesado 2 veces = mismo resultado

### No conformidades

No marcar como `done` un módulo crítico si:
- No tiene cobertura de reglas críticas
- No se probaron estados borde
- Puede producir sobreventa o inconsistencias de pago

---

## Reglas de migraciones Prisma

- Toda migración debe tener un nombre descriptivo: `add_available_slots_to_trip_offer`
- No hacer migraciones destructivas sin aprobación explícita
- Si una migración implica riesgo de pérdida de datos, documentarlo en el PR
- Las migraciones van siempre commiteadas. Nunca ignorar el directorio `prisma/migrations/`
- No usar `prisma db push` en staging o producción. Solo `prisma migrate deploy`

---

## Reglas de PR

- 1 PR = 1 propósito claro
- PRs pequeños y revisables (máximo lo que entra en una revisión de 20 min)
- Incluir en la descripción: contexto, alcance, riesgos y cómo testear
- Si toca UI: adjuntar screenshots
- Si toca dominio crítico: explicar decisión y casos borde cubiertos
- Si toca una zona protegida: mencionar aprobación recibida

---

## Definition of Done

Una tarea está terminada cuando:

- [ ] Cumple el objetivo funcional del issue
- [ ] Respeta el alcance del issue (sin features extras)
- [ ] Pasa `pnpm lint` sin errores
- [ ] Pasa `pnpm typecheck` sin errores
- [ ] Pasa `pnpm test` (incluyendo los tests nuevos)
- [ ] No introduce lógica fuera del MVP sin aprobación
- [ ] Maneja errores razonablemente (no swallows exceptions)
- [ ] Actualiza `.env.example` si agrega variables nuevas
- [ ] Actualiza documentación si cambia comportamiento importante
- [ ] Listo para review en PR chico

---

## Comportamiento del agente ante ambigüedad

Si una tarea tiene más de una interpretación posible:

1. Identificar las interpretaciones posibles
2. Exponer cuál elegiría y por qué
3. **Detenerse y pedir confirmación antes de implementar**

El agente **nunca resuelve ambigüedad de negocio por su cuenta**.
La ambigüedad técnica menor puede resolverse documentando la decisión en el PR.

---

## Qué puede y no puede hacer el agente

### Puede hacer sin aprobación

- Proponer estructura de archivos
- Implementar features acotadas dentro del scope del issue
- Refactorizar módulos no críticos
- Escribir y mejorar tests
- Mejorar documentación
- Preparar PRs pequeños
- Sugerir ADRs

### No puede hacer sin aprobación explícita

- Modificar zonas protegidas
- Cambiar pricing o reglas de cancelación
- Tomar decisiones de arquitectura mayor sin ADR
- Hacer migraciones destructivas
- Cambiar comportamiento de pagos
- Modificar roles y permisos
- Resolver ambigüedad de negocio por su cuenta

---

## Orden de ejecución del producto

```
Sprint 0  → E0 Foundations (monorepo, CI, docs base)
Sprint 1  → E1 Auth + E2 Transportista + E3 Ofertas
Sprint 2  → E4 Búsqueda cliente + E5 Booking anti-overbooking
Sprint 3  → E6 Pagos (Mercado Pago) + E7 Operación del viaje
Sprint 4  → E9 Comprobante PDF + Reputación + Disputas + E10 Green module
```

**No arrancar pagos antes de tener el flujo oferta → búsqueda → booking funcionando.**

---

## Decisiones de arquitectura (ADRs)

Antes de proponer cambios estructurales, revisar `/docs/decisions/`.

Si una tarea requiere una decisión no cubierta por un ADR existente:
→ proponer un nuevo ADR como parte del PR
→ no implementar el cambio sin el ADR aprobado

---

## Deuda técnica conocida

Registrar toda deuda en `docs/TECH_DEBT.md` con:
- descripción del problema
- por qué se tomó la decisión
- riesgo si no se paga
- prioridad estimada

No swallowear deuda. No ignorarla. Documentarla y priorizarla.

## Protocolo de ramas y PRs

Todo trabajo se ejecuta siguiendo este flujo exacto, sin excepciones.

### Flujo por rama
```bash
# 1. Asegurarse de estar en develop actualizado
git checkout develop
git fetch origin
git pull origin develop

# 2. Crear la rama nueva desde develop
git checkout -b tipo/Numero-Descripcion-En-PascalCase

# 3. Hacer los cambios
# ... implementación ...

# 4. Stagear y commitear en commits atómicos
git add <archivos específicos>
git commit -m "tipo(scope): descripción"
# repetir por cada commit del plan

# 5. Push de la rama
git push origin tipo/Numero-Descripcion-En-PascalCase

# 6. DETENERSE — no continuar hasta confirmación humana
```

### Regla de pausa obligatoria

Después del `git push`, el agente **debe detenerse y reportar**:
- nombre de la rama pusheada
- lista de commits realizados con sus mensajes
- qué cambió exactamente y por qué
- qué viene después (próxima rama del plan)

El agente **no puede** iniciar la siguiente rama hasta recibir confirmación explícita.

### Regla de base

Cada rama nueva parte siempre de `develop` actualizado con `git pull origin develop`.
Nunca crear una rama desde otra rama de feature sin aprobación explícita.

### Formato del reporte post-push
```
✅ Rama pusheada: fix/GitHub-CI-Templates

Commits realizados:
  1. fix: agregar workflow de CI con lint, typecheck, tests y build
  2. docs: agregar templates de issues para GitHub  
  3. docs: agregar plantilla de PR para GitHub

Archivos modificados:
  - .github/workflows/ci.yml (nuevo)
  - .github/ISSUE_TEMPLATE/epic.yml (nuevo)
  - .github/ISSUE_TEMPLATE/feature.yml (nuevo)
  - .github/ISSUE_TEMPLATE/bug.yml (nuevo)
  - .github/ISSUE_TEMPLATE/task.yml (nuevo)
  - .github/PULL_REQUEST_TEMPLATE.md (nuevo)

Podés revisar el PR en GitHub.
Confirmá cuando estés listo para continuar con la siguiente rama:
doc/Documentacion-Base
```
```

---

## Paso 2 — El prompt inicial para arrancar todo el plan

Con el `AGENTS.md` actualizado, este es el prompt que le das a Claude Code para ejecutar las 5 ramas del plan:
```
Leé el AGENTS.md completo, especialmente la sección 
"Protocolo de ramas y PRs".

Tenés que ejecutar el plan de 5 ramas del documento que te paso. 
El orden es exactamente este:

1. doc/Correccion-AGENTS-Stack-y-Estructura (5 commits)
2. fix/GitHub-CI-Templates (3 commits)
3. fix/Configuracion-Formato-Raiz (2 commits)
4. doc/Completar-env-example (1 commit)
5. doc/Documentacion-Base (4 commits)

Reglas que debés seguir sin excepción:

- Cada rama parte de develop actualizado (git fetch origin && git pull origin develop)
- Commits atómicos: un commit por cambio lógico, con el mensaje exacto del plan
- Después de git push de cada rama: DETENETE y reportá según el formato del AGENTS.md
- No inicies la siguiente rama hasta que yo te diga "seguir" o "continuar"
- Si algo no está claro en el plan, preguntá antes de implementar

Arrancá con la rama 1: doc/Correccion-AGENTS-Stack-y-Estructura
```

---

## Paso 3 — Tu flujo de revisión en GitHub

Después de cada push que hace Claude Code, tu flujo es:
```
1. Abrís GitHub → tu repo → Pull Requests → New Pull Request
2. base: develop ← compare: nombre-de-la-rama
3. Revisás los archivos cambiados (Files changed)
4. Si está bien: volvés a Claude Code y escribís "continuar"
5. Si necesita ajustes: se los decís antes de continuar