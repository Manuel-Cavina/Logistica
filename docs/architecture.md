# Architecture
<!-- version: 3.0 | last updated: 2026-10-02 -->

This document is the current technical architecture reference for Ruta Directa. It explains system boundaries, module structure, data model, and rules that should stay stable while the MVP evolves.

> For a learning-oriented explanation, read `docs/guia-arquitectura-y-repaso.md`. For historical implementation detail, read `docs/audits/2026-05-05-system-audit.md`.

---

## 1. System purpose

Ruta Directa is a marketplace for transport capacity and return trips. The first vertical is equine transport, but the core model is prepared for multiple cargo types and capacity units.

Core product path:

```text
Transporter publishes capacity -> Client searches -> Client books -> Payment is handled by PSP -> Trip is operated -> Delivery/reputation closes the flow
```

Current code has foundations for identity, transporter onboarding, admin verification, fleet, trip offers, and bookings. Payments, webhooks, proofs, reviews, disputes, and PDF receipts are still pending product areas.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, React 19, Tailwind CSS |
| Backend | NestJS modular monolith |
| ORM | Prisma |
| Database | PostgreSQL |
| Contracts | Zod schemas and TypeScript types in `@logistica/shared` |
| Monorepo | pnpm workspaces + Turborepo |
| Planned storage | Cloudflare R2 with presigned direct upload |
| Planned payments | Mercado Pago |

---

## 3. Repository boundaries

```text
apps/
├─ web/        Next.js frontend
└─ api/        NestJS backend

packages/
├─ shared/     Zod schemas and shared TypeScript contracts
├─ database/   Prisma schema, migrations, generated client, PrismaService
├─ eslint-config/
└─ typescript-config/

docs/          Product, architecture, API, governance, audit, design docs
scripts/       Project automation
```

Dependency direction:

```text
apps/web ───────┐
                ├─ packages/shared
apps/api ───────┘
   │
   └─ packages/database
```

Rules:

- `apps/web` never imports from `apps/api`.
- `apps/api` never imports from `apps/web`.
- `packages/shared` must not depend on app code.
- `packages/database` owns Prisma concerns; app modules consume it through `PrismaService`.

---

## 4. Backend architecture

Backend source lives in `apps/api/src/`.

Current top-level modules:

```text
admin/
booking/
common/
identity/accounts/
identity/authentication/
identity/transporter-profile/
trailer/
trip-offer/
vehicle/
```

Request flow:

```text
Controller -> Service -> Repository -> PrismaService -> PostgreSQL
```

| Layer | Responsibility |
|---|---|
| Controller | HTTP route, guards, params/body validation, delegation. |
| Service | Business rules, state transitions, transactional orchestration. |
| Repository | Prisma queries and persistence details. |
| DTO/schema | Input/output shape and validation. |
| Types | Prisma selects, internal return types, typed payloads. |

Standard module shape:

```text
src/<module>/
├─ <module>.module.ts
├─ <module>.controller.ts
├─ <module>.controller.spec.ts
├─ application/
│  ├─ <module>.service.ts
│  └─ <module>.service.spec.ts
├─ dto/
├─ repositories/
└─ types/
```

The intent is simple: controllers stay thin, services hold business rules, repositories are the only Prisma access point inside feature modules.

---

## 5. Bounded contexts

| Context | Responsibility | Current modules |
|---|---|---|
| Identity | Accounts, authentication, sessions, roles, transporter profile. | `identity/accounts`, `identity/authentication`, `identity/transporter-profile` |
| Admin | Manual transporter verification and administrative review. | `admin` |
| Fleet | Transporter vehicles and trailers. | `vehicle`, `trailer` |
| Marketplace | Trip offers and public search/detail. | `trip-offer` |
| Booking | Client reservations and anti-overbooking flow. | `booking` |
| Common | Shared backend utilities. | `common` |

Planned later contexts:

- payments/webhooks;
- proofs/evidence;
- reviews/reputation;
- disputes;
- receipts/PDF;
- green metrics.

---

## 6. API surface summary

Canonical endpoint details live in `docs/api.md`. Architecture only keeps the domain map.

| Domain | Implemented routes |
|---|---|
| Auth | Register, login, current user, refresh, logout. |
| Transporter profile | Own profile read/update. |
| Admin transporters | List, detail, verification status update. |
| Vehicles | Own vehicle list/create/update/deactivate. |
| Trailers | Own trailer list/create/update/deactivate. |
| Trip offers | Public search/detail, own list/create/update/publish/close/cancel. |
| Bookings | Client create/detail/cancel. |

---

## 7. Frontend architecture

Frontend source lives in `apps/web/`.

```text
apps/web/
├─ app/          Next.js routes and layouts
├─ features/     Domain-specific UI, hooks, services, types
├─ components/   Shared UI primitives
├─ src/lib/      Shared API/form utilities
└─ public/       Public assets
```

Rule:

```text
app/ routes should be small entrypoints.
features/ contains real screen composition and client-side behavior.
src/lib/ contains reusable infrastructure.
components/ui contains reusable visual primitives.
```

Current feature areas:

| Feature | Purpose |
|---|---|
| `features/auth` | Login, register, session provider, auth guards. |
| `features/dashboard` | Protected dashboard hub. |
| `features/transporter-onboarding` | Transporter profile completion. |
| `features/admin` | Admin transporter and user screens. |
| `features/vehicle` | Vehicle/trailer UI. |
| `features/trips` | Public trip/transporter presentation screens. |

Use Server Components by default. Use `"use client"` only for hooks, providers, forms, browser APIs, state, or event handlers.

---

## 8. Data model

Prisma schema lives in `packages/database/prisma/schema.prisma`.

Current implemented models:

| Model | Purpose |
|---|---|
| `Account` | Login identity, role, status, session relation. |
| `UserProfile` | Personal profile attached to an account. |
| `TransporterProfile` | Transporter business profile and verification status. |
| `Vehicle` | Transporter vehicle. |
| `Trailer` | Transporter trailer and capacity metadata. |
| `TripOffer` | Published or draft transport offer. |
| `Booking` | Client reservation for capacity. |
| `Session` | Refresh token session tracking. |

Important enums:

| Enum | Values |
|---|---|
| `AccountRole` | `CLIENT`, `TRANSPORTER`, `ADMIN` |
| `AccountStatus` | `ACTIVE`, `SUSPENDED`, `DISABLED` |
| `TransporterVerificationStatus` | `INCOMPLETE`, `PENDING`, `VERIFIED`, `REJECTED` |
| `CargoType` | `EQUINE`, `GENERAL_CARGO`, `FOOD`, `PEOPLE` |
| `CapacityUnit` | `SLOT`, `KG`, `M3`, `SEAT` |
| `TripOfferStatus` | `DRAFT`, `PUBLISHED`, `FULL`, `CLOSED`, `CANCELLED` |
| `BookingStatus` | `PENDING_PAYMENT`, `EXPIRED`, `CONFIRMED`, `IN_PROGRESS`, `DELIVERED_PENDING_CONFIRMATION`, `COMPLETED`, `CANCELLED`, `DISPUTED` |

Payments, proofs, reviews, and disputes are product concepts but do not currently exist as Prisma models in the checked schema.

---

## 9. State and business rules

### Transporter verification

```text
INCOMPLETE -> PENDING -> VERIFIED
                   └──> REJECTED
```

A transporter starts incomplete, completes onboarding, then waits for admin review.

### Trip offer

Current schema statuses:

```text
DRAFT -> PUBLISHED -> FULL
          ├──> CLOSED
          └──> CANCELLED
```

A transporter owns their offers. Public search/detail must only expose safe public data.

### Booking

Current schema statuses include the full future flow, but the implemented transactional path currently starts at `PENDING_PAYMENT`. Payment continuation is pending because Mercado Pago integration is not implemented yet.

Booking creation must protect capacity updates transactionally.

---

## 10. Protected areas

These areas need extra review and explicit approval for risky changes:

| Area | Why |
|---|---|
| Auth/session/roles | Security and authorization. |
| Booking anti-overbooking | Data consistency and capacity correctness. |
| Payments/webhooks | Money, idempotency, and external PSP behavior. |
| Prisma migrations | Data loss risk. |
| Production configuration/deploy | Environment safety. |

---

## 11. Environment variables

API startup validates these required values:

```text
DATABASE_URL
AUTH_ACCESS_TOKEN_SECRET
AUTH_REFRESH_TOKEN_SECRET
AUTH_ACCESS_TOKEN_TTL_SECONDS
AUTH_REFRESH_TOKEN_TTL_SECONDS
```

Payment and storage variables are expected when those integrations are implemented.

---

## 12. Testing expectations

Minimum expectations:

- colocated `*.spec.ts` files;
- unit tests for service business rules;
- integration/controller tests for HTTP boundaries;
- concurrency/idempotency tests for critical flows;
- lint, typecheck, tests, and build before PR readiness.

Root commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

API tests that touch Prisma require a reachable PostgreSQL database.

---

## 13. Documentation ownership

Avoid duplicating details across docs:

| Topic | Canonical doc |
|---|---|
| Product scope | `docs/PRD.md` |
| Architecture | `docs/architecture.md` |
| Endpoint inventory | `docs/api.md` |
| Learning guide | `docs/guia-arquitectura-y-repaso.md` |
| Historical audit | `docs/audits/2026-05-05-system-audit.md` |
| Doc map | `docs/README.md` |
