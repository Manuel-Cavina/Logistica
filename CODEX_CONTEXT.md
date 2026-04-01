# CODEX_CONTEXT.md
<!-- version: 2.0 | última actualización: 2026-04 -->
<!-- Este archivo es el mapa de contexto técnico del proyecto.        -->
<!-- Claude Code lo lee para orientarse en tareas largas o complejas. -->
<!-- ACTUALIZAR cuando cambien entidades, estados o arquitectura.     -->

---

## Qué es este producto

Una **plataforma de cupos y retornos para transporte**, vertical inicial **Equinos**.

Problema real: los transportistas hacen viajes con cupos vacíos (milla libre / empty miles).
La plataforma permite publicar esos cupos, que clientes los reserven, y que todo el flujo
(pago, trazabilidad, reputación) ocurra dentro del sistema.

> "Reducimos viajes vacíos y bajamos costos asegurando cupos, pagos protegidos y trazabilidad."

El MVP es **vendible**, no experimental. Cada feature existe porque mueve el flujo central:
buscar → reservar → pagar → transportar → confirmar → cobrar.

---

## Estado actual del schema (Sprint 0 / Sprint 1)

Entidades **ya implementadas**:

```
Account             ← identidad, roles, estado de cuenta
UserProfile         ← datos personales del cliente
TransporterProfile  ← datos del transportista + estado de verificación
Session             ← refresh token con rotación por familia
```

Entidades **pendientes** (se agregan en el sprint que las requiere, no antes):

```
Trailer             ← E2
TripOffer           ← E3
Booking             ← E5
Payment             ← E6
Proof               ← E7
Review              ← E9
Dispute             ← E9
```

**Regla**: no anticipar entidades futuras en el schema actual.

---

## Schema implementado — referencia exacta

### Enums actuales

```prisma
enum AccountRole {
  CLIENT
  TRANSPORTER    ← es TRANSPORTER, no DRIVER
  ADMIN
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DISABLED
}

enum TransporterVerificationStatus {
  INCOMPLETE    ← estado inicial, sin documentos
  PENDING       ← documentos cargados, esperando revisión admin
  VERIFIED      ← aprobado, puede publicar ofertas
  REJECTED      ← rechazado con motivo
}
```

### Account — tabla: `accounts`

```prisma
model Account {
  id              String        @id @default(cuid())
  email           String        @unique
  passwordHash    String
  role            AccountRole
  status          AccountStatus @default(ACTIVE)
  isEmailVerified Boolean       @default(false)
  lastLoginAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  userProfile        UserProfile?
  transporterProfile TransporterProfile?
  sessions           Session[]
}
```

Notas:
- Un `Account` tiene **uno** de los perfiles: `UserProfile` (CLIENT) o `TransporterProfile` (TRANSPORTER)
- `status` controla acceso: `SUSPENDED` y `DISABLED` bloquean operación aunque el JWT sea válido
- `lastLoginAt` se actualiza en cada login exitoso
- `isEmailVerified` se registra pero no bloquea operación en MVP

### UserProfile — tabla: `user_profiles`

```prisma
model UserProfile {
  id        String   @id @default(cuid())
  accountId String   @unique
  firstName String
  lastName  String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
}
```

Notas:
- Se crea junto al `Account` en el registro de cliente (una sola transacción)
- `phone` es opcional en MVP, recomendado completar antes de hacer una reserva
- Cascade delete: si se borra el `Account`, se borra el perfil

### TransporterProfile — tabla: `transporter_profiles`

```prisma
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

  account             Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
}
```

Notas:
- `verificationStatus` comienza en `INCOMPLETE` al registrarse
- Solo pasa a `PENDING` cuando el transportista carga todos los documentos requeridos
- Solo pasa a `VERIFIED` cuando un admin aprueba manualmente
- Solo los transportistas `VERIFIED` pueden publicar `TripOffer`
- `maxDetourKmDefault` es el desvío por defecto al crear nuevas ofertas
- `displayName` es el nombre público visible en los listados de ofertas
- `contactPhone` se expone al cliente **solo** cuando `Payment.status === 'HELD'` (E6)
- Los documentos (DNI, licencia, patente, seguro) se agregan en E2 como `TransporterDocument`

### Session — tabla: `sessions`

```prisma
model Session {
  id          String    @id @default(cuid())
  accountId   String
  tokenHash   String    ← hash del refresh token, nunca el token en texto plano
  tokenFamily String    ← UUID de la familia (para detectar robo por reuso)
  userAgent   String?
  ipAddress   String?
  expiresAt   DateTime
  revokedAt   DateTime? ← null = activa | DateTime = revocada
  createdAt   DateTime  @default(now())

  account     Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
}
```

Notas — **este módulo es zona protegida**:
- El refresh token **nunca** se guarda en texto plano. Solo el hash (bcrypt o sha256)
- `tokenFamily` agrupa todos los tokens de una misma cadena de rotación
- Si se detecta reuso de un token de una familia revocada → revocar **toda la familia** (posible robo)
- `revokedAt` marca la sesión inválida sin borrarla (auditoría)
- Las sesiones expiradas se limpian por job en background, no en el request

---

## Decisión de naming — Account, no User

El modelo de identidad se llama `Account`. Esto es intencional y debe respetarse en todo el código.

`Account` = identidad del sistema (email + password + rol + estado de cuenta).
`UserProfile` y `TransporterProfile` = extensiones de negocio de esa identidad.

**Consecuencias prácticas**:
- En guards y JWT: `accountId`, `accountRole`, `accountStatus`
- En lógica de booking, review, etc.: el campo se llama `clientId` o `transporterId`
  pero su valor **es** un `accountId`
- **Nunca** usar `userId` para referirse a un `accountId`

```typescript
// ✅ correcto
const account = await this.accountRepository.findById(accountId);
guard → verifica account.status === AccountStatus.ACTIVE

// ❌ incorrecto — no existe "User" en el schema
const user = await this.userRepository.findById(userId);
```

---

## Flujo de autenticación implementado

```
REGISTRO
  POST /auth/register
  → body: { email, password, role, firstName, lastName } (CLIENT)
       o: { email, password, role, displayName }         (TRANSPORTER)
  → crea Account + perfil correspondiente en una $transaction
  → devuelve accessToken (JWT 15min) + refreshToken (opaco 7d)
  → guarda Session { tokenHash, tokenFamily: uuid() }

LOGIN
  POST /auth/login
  → valida email + passwordHash
  → actualiza Account.lastLoginAt
  → crea nueva Session
  → devuelve accessToken + refreshToken

REFRESH
  POST /auth/refresh
  → busca Session por hash del token recibido
  → valida: no expirada, no revocada
  → rota: revoca Session actual, crea Session nueva con mismo tokenFamily
  → si token ya revocado → revocar TODA la tokenFamily (detecta robo)
  → devuelve nuevo accessToken + nuevo refreshToken

LOGOUT
  POST /auth/logout
  → setea Session.revokedAt = now()

LOGOUT ALL DEVICES
  POST /auth/logout-all
  → setea revokedAt en todas las Sessions del accountId
```

---

## Flujo completo del producto (end-to-end)

```
[TRANSPORTER — E1/E2]
  1. Registro → Account (TRANSPORTER) + TransporterProfile (INCOMPLETE)
  2. Carga documentos → TransporterProfile (PENDING)
  3. Admin aprueba → TransporterProfile (VERIFIED)
  4. Carga Trailer (capacidad en SLOTS)
  5. Publica TripOffer (ruta, fecha, cupos, precio, desvío)

[CLIENT — E1/E4]
  6. Registro → Account (CLIENT) + UserProfile
  7. Busca traslado (origen, destino, fecha, cupos requeridos)
  8. Ve resultados filtrados (verificados, precio, rating)
  9. Selecciona oferta → ve detalle
 10. Reserva N cupos → crea Booking (PENDING_PAYMENT)
 11. Paga seña 20–30% → Mercado Pago
 12. MP confirma → webhook → Payment (HELD) → Booking (CONFIRMED)
 13. contactPhone de TransporterProfile y chat habilitados

[OPERACIÓN — E7]
 14. Transporter hace check-in con foto → Proof → Booking (IN_PROGRESS)
 15. Transporter hace check-out con foto → Proof → Booking (DELIVERED_PENDING_CONFIRMATION)
 16. Client confirma entrega → Booking (COMPLETED) → Payment (RELEASED)
 17. Ambas partes se califican → Review

[DISPUTAS — E9]
  X. Client reporta problema → Booking (DISPUTED) → Payment se mantiene HELD
  X. Admin interviene → resuelve → Payment (RELEASED o REFUNDED)
```

---

## Estados de negocio

### TransporterVerificationStatus ← IMPLEMENTADO
| Estado | Descripción | Transición |
|---|---|---|
| `INCOMPLETE` | Sin documentos | → PENDING |
| `PENDING` | Docs cargados, esperando admin | → VERIFIED, REJECTED |
| `VERIFIED` | Aprobado, puede publicar | estable |
| `REJECTED` | Rechazado con motivo | → INCOMPLETE (puede reintentar) |

### AccountStatus ← IMPLEMENTADO
| Estado | Descripción |
|---|---|
| `ACTIVE` | Operando normalmente |
| `SUSPENDED` | Bloqueado temporalmente |
| `DISABLED` | Baja definitiva |

### OfferStatus ← PRÓXIMO (E3)
| Estado | Transiciones permitidas |
|---|---|
| `DRAFT` | → PUBLISHED |
| `PUBLISHED` | → FULL (auto), CLOSED, IN_PROGRESS, CANCELLED |
| `FULL` | → IN_PROGRESS, CANCELLED |
| `CLOSED` | → CANCELLED |
| `IN_PROGRESS` | → COMPLETED, CANCELLED |
| `COMPLETED` | terminal |
| `CANCELLED` | terminal |

### BookingStatus ← PRÓXIMO (E5)
| Estado | Transiciones permitidas |
|---|---|
| `PENDING_PAYMENT` | → CONFIRMED, CANCELLED |
| `CONFIRMED` | → IN_PROGRESS, CANCELLED |
| `IN_PROGRESS` | → DELIVERED_PENDING_CONFIRMATION |
| `DELIVERED_PENDING_CONFIRMATION` | → COMPLETED, DISPUTED |
| `COMPLETED` | terminal |
| `CANCELLED` | terminal |
| `DISPUTED` | → COMPLETED, CANCELLED (post-resolución admin) |

### PaymentStatus ← PRÓXIMO (E6)
| Estado | Transiciones permitidas |
|---|---|
| `INITIATED` | → HELD, FAILED |
| `HELD` | → RELEASED, REFUNDED, DISPUTED |
| `RELEASED` | terminal |
| `REFUNDED` | terminal |
| `DISPUTED` | → RELEASED, REFUNDED |
| `FAILED` | terminal |

**Regla para todos los estados**: nunca transicionar sin validar el estado previo.
Lanzar `ConflictException` si la transición no está permitida.

---

## Reglas de negocio críticas

### Sesiones y tokens
- Refresh token guardado **solo como hash** en `Session.tokenHash`
- Reuso de token revocado → revocar toda la `tokenFamily`
- `Account.status !== ACTIVE` → denegar acceso en el guard, aunque el JWT sea válido

### Acceso por rol
- `CLIENT` → buscar, reservar, pagar, confirmar entrega, calificar
- `TRANSPORTER` → publicar ofertas, operar viajes, cobrar
- `ADMIN` → verificar transportistas, resolver disputas
- Un `Account` tiene un solo rol. No hay multi-rol en MVP.

### Verificación de transportistas
- `TransporterProfile.verificationStatus !== VERIFIED` → no puede publicar `TripOffer`
- Validación en el service de TripOffer (no solo en frontend)
- Verificación manual por admin en MVP

### Anti-overbooking (E5)
- Decremento de `availableSlots` dentro de `prisma.$transaction`
- `availableSlots < quantity` → `ConflictException`
- `availableSlots === 0` → `Offer.status → FULL` en la misma transacción

### Webhooks Mercado Pago (E6)
- Validar firma HMAC antes de procesar
- Deduplicar por `externalPaymentId`
- Si ya está en estado destino → 200 OK sin hacer nada

### Contacto restringido (E6)
- `TransporterProfile.contactPhone` visible para el cliente **solo** cuando `Payment.status === 'HELD'`
- Chat completo habilitado solo tras seña confirmada
- Validación en backend, no solo en UI

### Uploads de fotos (E7)
- Las fotos **no pasan por el backend**
- Flujo: presigned URL → upload directo a R2 → confirmar URL al backend
- Comprimir antes de subir: WebP/AVIF, max 1920px

---

## Arquitectura de módulos NestJS

```
apps/api/src/
├─ auth/                ← JWT, login, registro, refresh, logout   [IMPLEMENTADO]
├─ account/             ← Account CRUD                            [IMPLEMENTADO]
├─ user-profile/        ← perfil del cliente                      [IMPLEMENTADO]
├─ transporter-profile/ ← perfil + verificación                   [IMPLEMENTADO]
├─ session/             ← gestión de sesiones y rotación          [IMPLEMENTADO]
│
├─ trailer/             ← vehículo / trailer CRUD                 [E2]
├─ trip-offer/          ← crear, publicar, listar, filtrar        [E3]
├─ booking/             ← reservar cupos, anti-overbooking        [E5]
├─ payment/             ← estados de pago, MP                     [E6]
├─ webhook/             ← endpoint MP idempotente                 [E6]
├─ proof/               ← presigned URLs, evidencias              [E7]
├─ review/              ← calificaciones post-viaje               [E9]
├─ dispute/             ← reportes y resolución                   [E9]
├─ chat/                ← mensajería anti-puenteo                 [E8]
├─ notification/        ← emails y alertas (jobs)                 [E7+]
├─ green/               ← métricas ocupación / empty miles        [E10]
├─ admin/               ← verificación y disputas                 [E2+]
├─ common/              ← guards, decoradores, pipes, interceptors
└─ prisma/              ← PrismaService singleton
```

Estructura interna de cada módulo:
```
modulo/
├─ modulo.module.ts
├─ modulo.controller.ts
├─ modulo.service.ts
├─ modulo.repository.ts     ← encapsula Prisma, nunca Prisma directo en el service
├─ dto/
│  ├─ create-modulo.dto.ts
│  └─ update-modulo.dto.ts
├─ entities/
│  └─ modulo.entity.ts
└─ __tests__/
   ├─ modulo.service.spec.ts
   └─ modulo.repository.spec.ts
```

---

## Arquitectura frontend Next.js App Router

```
apps/web/src/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ (cliente)/
│  │  ├─ buscar/page.tsx
│  │  ├─ resultados/page.tsx
│  │  ├─ oferta/[id]/page.tsx
│  │  ├─ traslados/page.tsx
│  │  └─ traslados/[id]/page.tsx
│  ├─ (transportista)/
│  │  ├─ dashboard/page.tsx
│  │  ├─ ofertas/page.tsx
│  │  ├─ ofertas/nueva/page.tsx
│  │  ├─ reservas/page.tsx
│  │  ├─ viaje/[id]/page.tsx
│  │  ├─ pagos/page.tsx
│  │  └─ perfil/page.tsx
│  └─ (admin)/
│     ├─ verificacion/page.tsx
│     └─ disputas/page.tsx
├─ components/
├─ lib/
│  ├─ api.ts      ← cliente HTTP hacia apps/api
│  └─ auth.ts
└─ types/
   └─ index.ts    ← re-exports de @equinos/types
```

Reglas de Next.js:
- App Router siempre. No mezclar con Pages Router.
- Server Components por defecto. `'use client'` solo cuando sea necesario.
- Server Actions para mutaciones de formularios.
- Rutas de API (`app/api/`) solo para webhooks externos.

---

## Patrones que se usan — seguir siempre

### Guards con AccountRole y AccountStatus
```typescript
// ✅ correcto
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.TRANSPORTER)
@Post('offers')
async create(@Body() dto: CreateTripOfferDto, @CurrentAccount() account: Account) {
  return this.tripOfferService.create(dto, account.id);
}

// ✅ el guard verifica status además del JWT
if (account.status !== AccountStatus.ACTIVE) {
  throw new ForbiddenException('Account is not active');
}
```

### Repository con Prisma
```typescript
// ✅ service llama al repository
class AuthService {
  async refresh(token: string) {
    const session = await this.sessionRepository.findByTokenHash(hash(token));
    if (!session || session.revokedAt) {
      await this.sessionRepository.revokeFamily(session.tokenFamily);
      throw new UnauthorizedException();
    }
    // rotación...
  }
}

// ✅ repository encapsula Prisma
class SessionRepository {
  async revokeFamily(tokenFamily: string) {
    await this.prisma.session.updateMany({
      where: { tokenFamily },
      data: { revokedAt: new Date() },
    });
  }
}
```

---

## Patrones prohibidos

| Patrón | Alternativa |
|---|---|
| `userId` para referirse a `accountId` | Usar siempre `accountId` |
| Refresh token en texto plano | Solo hash en `Session.tokenHash` |
| Lógica de negocio en controllers | Mover al service |
| Prisma directo en el service | Encapsular en repository |
| `any` en TypeScript | Tipado explícito o `unknown` |
| Polling activo para estados | Webhooks + invalidación de cache |
| Fotos pasando por el backend | Presigned URL directo a R2 |
| Billetera propia / saldo interno | Mercado Pago como PSP |
| Token cripto / NFT | Green score interno |
| `cargoType === 'EQUINE'` hardcodeado en backend | Valor dinámico del modelo |
| Anticipar entidades de sprints futuros | Agregar solo cuando el sprint lo requiere |
| PRs gigantes | 1 PR = 1 propósito |

---

## Green Software (E10)

### Métricas a calcular
```
empty_miles_avoided = estimatedKm × (1 - occupancyRate) por viaje completado
co2_avoided_kg      = empty_miles_avoided × 0.21
occupancy_rate      = cuposVendidos / totalSlots
green_score         = f(occupancyRate, retornosPublicados, tasaCancelacion)
                      → Bronze / Silver / Gold
```

### Principios aplicados desde ahora
- Geocoding solo al confirmar (no en cada keystroke)
- Paginación y filtros server-side
- Debounce en búsquedas (mínimo 300ms)
- Imágenes comprimidas en cliente (WebP/AVIF, max 1920px)
- Background jobs para PDF, emails y cálculos
- No polling — webhooks cuando aplique

---

## Integración Mercado Pago (E6)

SDK backend: `mercadopago` (Node.js oficial)
SDK frontend: `@mercadopago/sdk-js` (Checkout Bricks)

```
MP_ACCESS_TOKEN    ← token test/producción
MP_PUBLIC_KEY      ← clave pública para frontend
MP_WEBHOOK_SECRET  ← validación firma HMAC del webhook
```

Flujo: backend crea Preference con `external_reference = bookingId` →
frontend redirige a MP → MP llama webhook → backend valida firma →
actualiza `Payment.status` → actualiza `Booking.status`.

---

## Variables de entorno requeridas

```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
SENTRY_DSN=
NEXT_PUBLIC_API_URL=
NODE_ENV=development
```

---

## Restricciones que el agente debe respetar siempre

1. Usar `accountId` y `AccountRole` — nunca `userId` ni `Role` a secas
2. Nunca guardar tokens en texto plano — solo hashes en `Session.tokenHash`
3. Verificar `Account.status` en los guards, no solo el JWT
4. No anticipar entidades futuras en el schema — cada entidad va en su sprint
5. No tocar pagos, sesiones ni anti-overbooking sin aprobación explícita
6. No hardcodear `cargoType` en backend
7. No custodiar dinero internamente — siempre PSP externo
8. No subir fotos a través del backend — presigned URL directo a R2
9. No usar polling activo — webhooks
10. Ante ambigüedad de negocio: parar y preguntar, nunca asumir