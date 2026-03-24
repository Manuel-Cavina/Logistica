# 002 - Auth Strategy
<!-- status: accepted | última actualización: 2026-03-23 -->

## Contexto

El MVP necesita autenticación vendible, simple de operar y consistente con zonas
críticas del proyecto: auth, permisos y roles.

Las restricciones activas del producto y del repositorio son:

- una `Account` tiene un único rol
- `CLIENT` usa `UserProfile`
- `TRANSPORTER` usa `TransporterProfile`
- `ADMIN` existe en dominio y autorización, pero no en registro público
- el frontend no debe custodiar refresh tokens en JavaScript persistente
- la solución debe soportar revocación de sesión y detección de reutilización de
  refresh token

La primera versión de este archivo quedó como instrucción de implementación.
Después de ejecutar ese trabajo, el documento debe reflejar la decisión vigente y
no una checklist histórica.

## Decisión

Se adopta una estrategia de autenticación basada en JWT de acceso corto más
refresh token rotado, con sesiones persistidas en base de datos.

La decisión concreta del proyecto es:

- usar `accessToken` firmado para autenticar requests vía bearer token
- usar `refreshToken` firmado solo para renovar sesión
- guardar el refresh token en cookie `HttpOnly`
- persistir cada sesión en la tabla `Session`
- guardar en `Session` un `tokenHash` del refresh token, nunca el token en texto
  plano
- agrupar rotaciones con `tokenFamily` para poder revocar una familia completa si
  se detecta reutilización
- mantener roles en `Account` y aplicar autorización con `JwtAuthGuard`,
  `@Roles()` y `RolesGuard`
- compartir contratos públicos de auth en `packages/shared`

## Implementación vigente

### Modelo y perfiles

El modelo vigente en Prisma usa:

- `Account` como identidad principal
- `UserProfile` para cuentas `CLIENT`
- `TransporterProfile` para cuentas `TRANSPORTER`
- `Session` para persistir sesiones activas y revocadas

La tabla `Session` conserva los campos necesarios para rotación y auditoría
mínima:

- `tokenHash`
- `tokenFamily`
- `expiresAt`
- `revokedAt`
- `userAgent`
- `ipAddress`

### Endpoints públicos

La interfaz pública actual queda unificada en:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

El registro público no expone endpoints separados por rol. El rol se envía en el
payload validado y solo admite `CLIENT` o `TRANSPORTER`.

### Tokens y cookies

El `accessToken` incluye `sub` y `role` y se entrega en el body de respuesta.

El `refreshToken` incluye:

- `sub`
- `sid`
- `family`

El refresh token:

- se firma con secreto y TTL propios
- se persiste como hash SHA-256 en `Session`
- se rota en cada `POST /auth/refresh`
- revoca toda la familia si se detecta reuso de un token ya rotado o revocado

La cookie de refresh se configura con estas reglas:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` en producción
- prefijo `__Host-` en producción si el nombre configurado no lo incluye
- `path=/`

### Contratos y validación

Los contratos compartidos viven en `packages/shared` y definen los schemas y tipos
de:

- registro público
- login
- respuestas de login, refresh, register y me

En la API, los DTOs de auth son aliases tipados sobre esos contratos y la
validación de entrada se aplica con `ZodValidationPipe`.

### Guards y autorización

La autenticación de rutas protegidas usa `JwtAuthGuard` sobre un bearer token.

La autorización por rol usa:

- decorador `@Roles()`
- `RolesGuard`

El endpoint de refresh no usa hoy una `JwtRefreshStrategy` dedicada. La extracción
del refresh token se resuelve en el controller a partir de la cookie configurada y
la validación criptográfica y de sesión se ejecuta en `AuthSessionService`.

## Alternativas consideradas

### Sesiones puras en base de datos

Se descartó usar solo sesiones stateful sin JWT como estrategia principal porque
el proyecto ya necesita integrar API y web con autenticación simple, portable y
de bajo acoplamiento.

### Refresh token expuesto al frontend

Se descartó devolver el refresh token para almacenamiento en `localStorage` o
similar porque aumenta superficie de exposición en cliente y contradice las reglas
de seguridad ya definidas para el proyecto.

### Endpoints públicos separados por rol

Se descartó mantener `POST /auth/register/client` y
`POST /auth/register/transporter` porque la validación actual ya distingue rol y
payload sin duplicar rutas ni lógica pública.

## Consecuencias

### Positivas

- auth queda alineado con el modelo de cuentas y perfiles ya implementado
- la sesión puede revocarse por token o por familia
- el frontend solo necesita custodiar el access token y enviar cookies
- los contratos públicos se comparten entre backend y frontend
- la autorización por rol queda separada de la lógica de negocio

### Costos y límites

- la implementación actual depende de persistencia de sesiones además del JWT
- el refresh flow no está encapsulado en una strategy/guard específica
- `ADMIN` existe en dominio, pero requiere alta interna o flujo no público
- `PasswordService.needsRehash()` existe, pero todavía no se usa para migración
  transparente al hacer login

## Estado resultante

Este ADR reemplaza la versión anterior basada en instrucciones de ejecución.
Desde ahora debe mantenerse sincronizado con cambios relevantes en:

- modelo Prisma de identidad y sesión
- contratos compartidos de auth
- endpoints públicos de autenticación
- cookies, guards y reglas de autorización
