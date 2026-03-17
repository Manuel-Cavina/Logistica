Quiero que implementes el documento `docs/decisions/002-auth-strategy.md`.

Objetivo de este bloque:
- dejar cerrada la arquitectura técnica de autenticación del proyecto
- respetar el DER actual basado en `Account`, `UserProfile`, `TransporterProfile` y `Session`
- usar refresh token rotation con `tokenFamily` para detección de reutilización
- dejar contratos compartidos en `packages/shared/src/interfaces`
- dejar DTOs de NestJS implementando esos contratos en `apps/api/src/auth/dto`

Reglas obligatorias:
1. No cambies la regla de negocio: una `Account` tiene un único rol.
2. `CLIENT` usa `UserProfile`. `TRANSPORTER` usa `TransporterProfile`.
3. `ADMIN` no debe exponerse en registro público.
4. La tabla `Session` debe incluir: `tokenHash`, `tokenFamily`, `expiresAt`,
   `revokedAt`, `userAgent`, `ipAddress`.
5. El refresh token payload debe incluir: `sub`, `sid`, `family`.
6. `JwtRefreshStrategy` debe extraer el token desde `req.cookies` via
   `ExtractJwt.fromExtractors` — no desde el header.
7. `PasswordService` debe implementar `hash()`, `verify()` y `needsRehash()`.
8. No implementes features fuera de auth en este bloque.
9. Si encontrás inconsistencias, proponé el ajuste mínimo y explícitalo
   antes de implementar.

Ancla del schema:
- El schema actual está en `apps/api/prisma/schema.prisma`.
- Si no existe, crealo desde cero siguiendo el DER de este documento.
- Si existe, ajustá solo los modelos de auth sin tocar otros modelos existentes.

Orden de implementación:

Bloque 0 — Schema Prisma
- Revisar o crear schema con Account, Session, UserProfile, TransporterProfile
- Ejecutar `prisma migrate dev`
- Ejecutar `prisma generate`

Criterio de aceptación del Bloque 0:
- `prisma migrate dev` corre sin errores
- `prisma generate` corre sin errores
- los cuatro modelos existen con todos los campos requeridos
No avances al Bloque 1 hasta que esto esté verificado.

Bloque 1 — PrismaModule + AccountsModule
- PrismaService + PrismaModule
- AccountsService: findByEmail, findById, createClient, createTransporter,
  createSession, revokeSession, revokeFamily, findSessionById

Bloque 2 — PasswordService + JWT config + cookies
- PasswordService con Argon2id: hash(), verify(), needsRehash()
- auth.config.ts con variables de entorno tipadas via @nestjs/config
- Configuración de cookies por entorno

Bloque 3 — Register y login
- POST /auth/register/client
- POST /auth/register/transporter
- POST /auth/login con emisión de tokens y creación de sesión

Bloque 4 — Sessions, refresh y logout
- POST /auth/refresh con rotación y detección de reutilización
- POST /auth/logout con revocación y limpieza de cookie

Bloque 5 — Strategies, guards y me
- JwtAccessStrategy + JwtRefreshStrategy
- JwtAccessGuard + JwtRefreshGuard
- GET /auth/me

Bloque 6 — Roles, hardening y tests
- @Roles() decorator + RolesGuard
- Rate limiting en login/register
- Tests unitarios de PasswordService y AuthService
- Tests de integración de los endpoints principales