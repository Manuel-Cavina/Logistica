# CODEX_CONTEXT.md
<!-- version: 3.0 | ultima actualizacion: 2026-04-06 -->

## Proposito

Mapa tecnico del repositorio para trabajar sobre la base real implementada.
Este archivo debe describir el estado actual del codigo, no el roadmap ideal.

Estado actual confirmado:

- E0 Foundations: implementado
- E1 Auth y roles: implementado
- E2 Onboarding y perfil de transportista: implementado sin carga documental
- E3 Vehiculos y trailers: proxima epica

## Stack vigente

- Monorepo: pnpm workspaces + Turborepo
- Frontend: Next.js 15 App Router + Tailwind CSS
- Backend: NestJS modular + Prisma
- Base de datos: PostgreSQL
- Shared: `@logistica/shared`
- Database package: `@logistica/database`

## Estado actual del dominio

Entidades implementadas hoy:

```text
Account
UserProfile
TransporterProfile
Session
```

Entidades todavia no implementadas:

```text
Vehicle
Trailer
TripOffer
Booking
Payment
Proof
Review
Dispute
```

Regla: no asumir que las entidades futuras ya existen en schema, API o UI.

## Schema real implementado

### Enums actuales

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

### Modelos actuales

```prisma
model Account {
  id                 String              @id @default(cuid())
  email              String              @unique
  passwordHash       String
  role               AccountRole
  status             AccountStatus       @default(ACTIVE)
  isEmailVerified    Boolean             @default(false)
  lastLoginAt        DateTime?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  userProfile        UserProfile?
  transporterProfile TransporterProfile?
  sessions           Session[]
}

model UserProfile {
  id         String   @id @default(cuid())
  accountId  String   @unique
  firstName  String
  lastName   String
  phone      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model TransporterProfile {
  id                  String                        @id @default(cuid())
  accountId           String                        @unique
  displayName         String
  businessName        String?
  contactPhone        String?
  bio                 String?
  maxDetourKmDefault  Int?
  verificationStatus  TransporterVerificationStatus @default(INCOMPLETE)
  createdAt           DateTime                      @default(now())
  updatedAt           DateTime                      @updatedAt
}

model Session {
  id          String    @id @default(cuid())
  accountId   String
  tokenHash   String
  tokenFamily String
  userAgent   String?
  ipAddress   String?
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
}
```

Notas importantes:

- `TransporterProfile` hoy no tiene `verificationNote`.
- No existe todavia `TransporterDocument`.
- No existe todavia `Vehicle`, `Trailer` ni `TripOffer`.
- `Account` es la identidad del sistema. No usar `User` como alias del modelo.

## Flujos implementados hoy

### Auth publica

Rutas implementadas:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

No existe hoy:

- `POST /auth/logout-all`
- recuperacion de password en backend

### Registro

- `CLIENT` crea `Account + UserProfile`
- `TRANSPORTER` crea `Account + TransporterProfile`
- el registro publico no permite crear `ADMIN`

### Sesiones

- access token corto
- refresh token en cookie HttpOnly
- refresh token persistido solo como hash en `Session.tokenHash`
- rotacion de refresh token por `tokenFamily`

## Verificacion de transportista

Flujo real implementado hoy:

1. el transportista se registra
2. se crea `TransporterProfile` con `verificationStatus = INCOMPLETE`
3. el transportista completa perfil basico
4. si el perfil tiene `displayName` y `contactPhone`, pasa a `PENDING`
5. un admin puede cambiarlo de `PENDING` a `VERIFIED` o `REJECTED`

Transiciones reales implementadas:

```text
INCOMPLETE -> PENDING
PENDING -> VERIFIED
PENDING -> REJECTED
```

No esta implementado todavia:

- motivo de rechazo
- carga documental
- presigned URLs para documentos

## API real implementada para E2

### Transportista

- `GET /transporter/profile`
- `PATCH /transporter/profile`

Shape real de respuesta:

```json
{
  "displayName": "string",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null",
  "verificationStatus": "INCOMPLETE | PENDING | VERIFIED | REJECTED"
}
```

### Admin transportistas

- `GET /admin/transporters`
- `GET /admin/transporters/:id`
- `PATCH /admin/transporters/:id/verification-status`

Detalles relevantes:

- el filtro real del listado es `status`
- el body real del patch solo acepta `verificationStatus`
- el admin solo puede aprobar o rechazar perfiles en estado `PENDING`

## Frontend real implementado

### App Router

Rutas existentes hoy:

```text
/(guest)/login
/(guest)/register
/forgot-password
/(protected)/dashboard
/(protected)/onboarding/transporter
/(protected)/admin/transporters
/(protected)/admin/transporters/[id]
/(protected)/admin/users
```

### Guards y acceso

- `ProtectedAppGuard` protege las rutas autenticadas
- `TransporterProfileGuard` redirige al onboarding cuando corresponde
- un `TRANSPORTER` con `INCOMPLETE` o `REJECTED` es redirigido a `/onboarding/transporter`
- un `TRANSPORTER` con `PENDING` o `VERIFIED` puede seguir al area protegida

### Onboarding transportista

Feature implementada en:

- `apps/web/features/transporter-onboarding`

Incluye:

- formulario de perfil
- estado de verificacion visible
- vistas por estado: incomplete, pending, verified, rejected
- consumo real de la API

### Admin transportistas

Feature implementada en:

- `apps/web/features/admin`

Incluye:

- listado de transportistas
- detalle individual
- aprobar perfil
- rechazar perfil

No incluye todavia:

- motivo de rechazo
- revision documental

## Modulos backend reales

```text
apps/api/src/
├─ admin/
├─ common/
└─ identity/
   ├─ accounts/
   ├─ authentication/
   └─ transporter-profile/
```

Modulos cargados hoy en `AppModule`:

- `AdminModule`
- `AccountsModule`
- `AuthenticationModule`
- `TransporterProfileModule`

## Estructura de modulos NestJS

Patron vigente:

```text
modulo/
├─ modulo.module.ts
├─ modulo.controller.ts
├─ modulo.controller.spec.ts
├─ application/
│  ├─ modulo.service.ts
│  └─ modulo.service.spec.ts
├─ dto/
├─ repositories/
└─ types/
```

Reglas:

- controller sin logica de negocio
- service con reglas de negocio
- repository como unico acceso a Prisma
- tests colocalizados, no `__tests__`

## Variables de entorno reales

Tomar como fuente de verdad `.env.example`.

Variables actuales:

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

## Decisiones vigentes que no hay que romper

- usar `accountId` como identidad tecnica, no `userId`
- no tocar auth, pagos o anti-overbooking sin aprobacion explicita
- no asumir documentos, motivo de rechazo o trailers antes de implementarlos
- no usar Server Actions; las mutaciones actuales van por cliente HTTP
- no agregar entidades futuras al schema antes de su epica

## Brechas conocidas antes de E3

- `verificationNote` documentado en algunos docs viejos, pero no implementado
- carga documental de E2 todavia pendiente
- no existe todavia control backend para vehiculos o trailers
- no existe todavia publicacion de ofertas

## Siguiente epica

E3 segun `docs/backlog.md`:

- `Vehicle`
- `Trailer`
- capacidad valida
- edicion y desactivacion
- precondicion futura para publicar ofertas
