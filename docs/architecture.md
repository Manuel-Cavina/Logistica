# Architecture
<!-- version: 2.0 | ultima actualizacion: 2026-04-06 -->

## 1. Objetivo

Definir la arquitectura vigente del MVP sobre la base real implementada y dejar
claro el punto de partida para E3.

Este documento no describe un sistema ideal. Describe:

- que esta implementado hoy
- que decisiones estructurales ya estan tomadas
- que piezas faltan todavia

## 2. Stack oficial

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 15 App Router + Tailwind CSS |
| Backend | NestJS modular |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Monorepo | pnpm workspaces + Turborepo |
| Storage previsto | Cloudflare R2 |
| Pagos previstos | Mercado Pago |

## 3. Estado actual del sistema

Implementado hoy:

- auth publica y autenticada
- sesiones con refresh token rotado
- perfil de cliente en registro
- perfil de transportista
- verificacion manual basica por admin
- onboarding de transportista en frontend
- listado y detalle admin de transportistas

No implementado todavia:

- documentos de transportista
- `verificationNote`
- vehiculos
- trailers
- ofertas
- booking
- pagos
- evidencias

## 4. Bounded contexts actuales

### Identity

Responsabilidad:

- cuentas
- roles
- autenticacion
- sesiones
- perfil del transportista

Modulos actuales:

- `identity/accounts`
- `identity/authentication`
- `identity/transporter-profile`

### Admin

Responsabilidad:

- revision manual de perfiles de transportistas

Modulo actual:

- `admin`

### Common

Responsabilidad:

- pipes y utilidades compartidas del backend

Modulo actual:

- `common`

### Fleet

Responsabilidad prevista para E3:

- `Vehicle`
- `Trailer`
- capacidad operativa del transportista

Todavia no existe implementacion.

## 5. Modelo de datos vigente

### Enums implementados

```prisma
enum AccountRole {
  CLIENT
  TRANSPORTER
  ADMIN
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DISABLED
}

enum TransporterVerificationStatus {
  INCOMPLETE
  PENDING
  VERIFIED
  REJECTED
}
```

### Entidades implementadas

#### Account

Identidad central del sistema.

Campos clave:

- `id`
- `email`
- `passwordHash`
- `role`
- `status`
- `isEmailVerified`
- `lastLoginAt`

#### UserProfile

Perfil de negocio para cuentas `CLIENT`.

Campos clave:

- `accountId`
- `firstName`
- `lastName`
- `phone`

#### TransporterProfile

Perfil de negocio para cuentas `TRANSPORTER`.

Campos clave:

- `accountId`
- `displayName`
- `businessName`
- `contactPhone`
- `bio`
- `maxDetourKmDefault`
- `verificationStatus`

Importante:

- hoy no existe `verificationNote`
- hoy no existe `TransporterDocument`

#### Session

Persistencia de refresh tokens rotados.

Campos clave:

- `accountId`
- `tokenHash`
- `tokenFamily`
- `expiresAt`
- `revokedAt`

## 6. Reglas arquitectonicas vigentes

### Account es la identidad del sistema

No usar `User` como nombre del modelo raiz. La identidad real es `Account`.

Consecuencias:

- en JWT y guards se trabaja con `accountId`
- los perfiles son extensiones de `Account`
- no usar `userId` para referirse a una cuenta

### Controllers delgados

- reciben request
- validan con Zod
- delegan al service

### Services con reglas de negocio

- aplican transiciones
- validan permisos y consistencia
- llaman a repositories

### Repositories como unico acceso a Prisma

- no usar Prisma directo desde services
- centralizar `select`, `where` y `update`

### Tests colocalizados

Cada modulo sigue el patron:

```text
modulo/
├─ modulo.controller.ts
├─ modulo.controller.spec.ts
├─ application/
│  ├─ modulo.service.ts
│  └─ modulo.service.spec.ts
├─ dto/
├─ repositories/
└─ types/
```

No usar `__tests__`.

## 7. API implementada hoy

### Auth

Endpoints reales:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

Detalles relevantes:

- registro publico solo para `CLIENT` y `TRANSPORTER`
- `ADMIN` de desarrollo puede existir via variables `AUTH_MOCK_ADMIN_*`
- `refreshToken` va en cookie HttpOnly

### Transporter profile

Endpoints reales:

- `GET /transporter/profile`
- `PATCH /transporter/profile`

Transicion real implementada:

- `INCOMPLETE -> PENDING` al completar `displayName` y `contactPhone`

### Admin transporters

Endpoints reales:

- `GET /admin/transporters`
- `GET /admin/transporters/:id`
- `PATCH /admin/transporters/:id/verification-status`

Transiciones reales permitidas:

- `PENDING -> VERIFIED`
- `PENDING -> REJECTED`

## 8. Frontend vigente

### Router

Estructura actual:

```text
app/
├─ (guest)/
│  ├─ login/page.tsx
│  └─ register/page.tsx
├─ (protected)/
│  ├─ layout.tsx
│  ├─ dashboard/page.tsx
│  ├─ onboarding/transporter/page.tsx
│  └─ admin/
│     ├─ transporters/page.tsx
│     ├─ transporters/[id]/page.tsx
│     └─ users/page.tsx
└─ forgot-password/page.tsx
```

### Guards

Patron actual:

- `ProtectedAppGuard` protege el arbol autenticado
- `TransporterProfileGuard` resuelve acceso segun `verificationStatus`

Comportamiento actual:

- `INCOMPLETE` o `REJECTED` redirigen a onboarding
- `PENDING` y `VERIFIED` pueden continuar

### Mutaciones

No se usan Server Actions.

Las mutaciones actuales van por cliente HTTP desde hooks y services de
feature.

## 9. Estado de verificacion del transportista

### Lo que existe hoy

```text
INCOMPLETE -> PENDING -> VERIFIED
                      -> REJECTED
```

### Lo que no existe hoy

- documentos
- presigned URLs
- motivo de rechazo
- flujo de reenvio documental

## 10. Variables de entorno vigentes

Fuente de verdad actual: `.env.example`

```env
NODE_ENV=
DATABASE_URL=
AUTH_ACCESS_TOKEN_SECRET=
AUTH_REFRESH_TOKEN_SECRET=
AUTH_ACCESS_TOKEN_TTL_SECONDS=
AUTH_REFRESH_TOKEN_TTL_SECONDS=
AUTH_REFRESH_COOKIE_NAME=
AUTH_MOCK_ADMIN_ENABLED=
AUTH_MOCK_ADMIN_EMAIL=
AUTH_MOCK_ADMIN_PASSWORD=
API_INTERNAL_URL=
CORS_ALLOWED_ORIGINS=
NEXT_PUBLIC_API_URL=
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
SENTRY_DSN=
```

## 11. Decisiones ya tomadas

- monolito modular en NestJS
- App Router en frontend
- `Account` como identidad principal
- `TransporterProfile` como extension de negocio
- sessions persistidas en DB con refresh token hasheado
- verificacion manual de transportistas en MVP
- sin documentos aun en E2 implementado

## 12. Siguiente paso arquitectonico: E3

La siguiente epica debe incorporar el contexto Fleet:

- `Vehicle`
- `Trailer`
- capacidad total
- activacion y desactivacion
- precondicion futura para publicar `TripOffer`

Condiciones para E3:

- mantener el patron controller -> service -> repository
- no anticipar `TripOffer` si no es necesario
- dejar `cargoType` y `capacityUnit` listos en modelo aunque el MVP siga
  operando visualmente como Equinos
