# SYSTEM AUDIT - Ruta Directa

> Auditoría realizada el 2026-05-05. Describe el estado del código en esa fecha; ante cualquier diferencia, el código es la fuente de verdad.

## 1. Resumen ejecutivo

Ruta Directa es hoy un monorepo profesional con base tecnica solida para autenticacion, roles, onboarding de transportistas, administracion de transportistas, flota basica, ofertas de viaje y reservas. El producto todavia no esta listo como MVP comercial completo: tiene varios modulos core implementados en backend, pero parte importante de la experiencia publica y transaccional del frontend sigue siendo estatica, mockeada o sin conexion real.

Modulos implementados:
- Auth y sesiones: registro, login, `me`, refresh y logout con access token y refresh cookie HttpOnly.
- Roles: `CLIENT`, `TRANSPORTER`, `ADMIN`, con guards backend y guards frontend.
- Perfil transportista: lectura, actualizacion y transicion automatica `INCOMPLETE -> PENDING`.
- Admin transportistas: listado, detalle y aprobacion/rechazo desde `PENDING`.
- Vehiculos y trailers: alta, listado, edicion y desactivacion logica para transportistas.
- Ofertas de viaje: busqueda publica, detalle publico, CRUD operativo de ofertas propias y transiciones publicar/cerrar/cancelar en backend.
- Booking: creacion, detalle y cancelacion de reservas propias para clientes en backend, con control transaccional de cupos.

Modulos parciales:
- Frontend publico de busqueda/detalle/reserva: existen pantallas visuales, pero usan datos hardcodeados y no consumen endpoints reales de `trip-offers` ni `bookings`.
- Dashboard: existe como hub protegido y navega por rol, pero no muestra metricas reales.
- Admin users: existe pantalla frontend con mock, pero no hay endpoint backend de usuarios.
- Booking: backend implementado, sin pantallas ni services frontend reales.

Modulos faltantes:
- Pagos/Mercado Pago.
- Webhooks.
- Proof/Evidence.
- Reviews.
- Disputes.
- Chat/contacto restringido.
- Comprobante PDF.
- Green metrics.
- Recuperacion de contrasena backend.

Riesgos tecnicos principales:
- Desalineacion entre UI publica aspiracional y backend real: el usuario ve pagos, chat, comprobantes y reputacion como si existieran, pero son mock/hardcode.
- No hay integracion frontend para ofertas reales ni reservas reales.
- No existen pagos ni webhooks, por lo que booking queda en `PENDING_PAYMENT` sin continuidad real.
- `CODEX_CONTEXT.md` esta desactualizado respecto del schema actual: indica que `Vehicle`, `Trailer`, `TripOffer` y `Booking` no existen, pero si existen.
- Algunos textos del frontend muestran caracteres mal codificados.
- La UI menciona flujos sensibles no implementados: pago protegido, comprobante PDF, fotos, chat, reputacion.

Nivel de coherencia frontend-backend:
- Alto en auth, onboarding transportista, admin transportistas, vehicles y trailers.
- Medio en dashboard, porque es real como ruta protegida pero no operativo.
- Bajo en home, detalle de viaje, detalle de transportista, busqueda publica y reserva, porque no consumen los endpoints reales disponibles.

## 2. Mapa de roles del sistema

Roles reales encontrados:
- `CLIENT`: enum Prisma `AccountRole.CLIENT`, permitido en registro publico y en endpoints de booking.
- `TRANSPORTER`: enum Prisma `AccountRole.TRANSPORTER`, permitido en registro publico y flujos de perfil, flota y ofertas.
- `ADMIN`: enum Prisma `AccountRole.ADMIN`, no se registra publicamente; existe soporte de admin mock de desarrollo y guards administrativos.

Estados relacionados:
- `AccountStatus`: `ACTIVE`, `SUSPENDED`, `DISABLED`.
- `TransporterVerificationStatus`: `INCOMPLETE`, `PENDING`, `VERIFIED`, `REJECTED`.
- `TripOfferStatus`: `DRAFT`, `PUBLISHED`, `FULL`, `CLOSED`, `CANCELLED`.
- `BookingStatus`: `PENDING_PAYMENT`, `EXPIRED`, `CONFIRMED`, `IN_PROGRESS`, `DELIVERED_PENDING_CONFIRMATION`, `COMPLETED`, `CANCELLED`, `DISPUTED`.

### Usuario CLIENT

Que puede hacer actualmente:
- Registrarse como cliente desde `/register`.
- Iniciar sesion desde `/login`.
- Entrar al dashboard protegido `/dashboard`.
- Crear una reserva por API con `POST /bookings`, siempre que consuma el endpoint con token `CLIENT`.
- Consultar una reserva propia por API con `GET /bookings/:id`.
- Cancelar una reserva propia pendiente de pago por API con `POST /bookings/:id/cancel`.
- Ver pantallas publicas de home, como funciona, detalle de viaje y detalle de transportista, pero esas pantallas no estan conectadas a datos reales.

Rutas frontend:
- `/`
- `/como-funciona`
- `/forgot-password`
- `/login`
- `/register`
- `/dashboard`
- `/viaje/[id]`
- `/transportista/[id]`

Endpoints consumibles:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /trip-offers/search`
- `GET /trip-offers/:id/public`
- `POST /bookings`
- `GET /bookings/:id`
- `POST /bookings/:id/cancel`

Pantallas existentes:
- Registro y login reales.
- Dashboard protegido generico.
- Home publica con cards hardcodeadas.
- Detalle de viaje hardcodeado con modal de reserva simulado.
- Detalle de transportista hardcodeado con propuesta simulada.
- Recuperacion de contrasena placeholder.

Flujo completo:
- Auth basico: registro, login, bootstrap de sesion, refresh y logout.
- Booking solo en backend: creacion/cancelacion/detalle existen, pero no hay UI ni pago.

Flujo incompleto:
- Busqueda real de ofertas: endpoint existe, UI no lo consume.
- Detalle real de oferta: endpoint existe, UI no lo consume.
- Reserva real desde UI: no implementada.
- Pago de sena: no implementado.
- Mis reservas: no encontrado.

Errores o gaps:
- `/viaje/[id]` no usa el `id` real ni llama a `GET /trip-offers/:id/public`.
- La reserva visual no llama a `POST /bookings`.
- La UI habla de pagos, chat, fotos, PDF y reputacion sin soporte real.

### Usuario TRANSPORTER

Que puede hacer actualmente:
- Registrarse como transportista desde `/register`.
- Iniciar sesion desde `/login`.
- Completar perfil desde `/onboarding/transporter`.
- Consultar y actualizar su perfil por API.
- Gestionar vehiculos y trailers desde UI conectada.
- Crear, listar, editar, publicar, cerrar y cancelar ofertas por API.
- Entrar al dashboard protegido.

Rutas frontend:
- `/dashboard`
- `/onboarding/transporter`
- `/vehicles`
- `/vehicles/new`
- `/vehicles/[id]/edit`
- `/trailers/new`
- `/trailers/[id]/edit`

Endpoints consume desde frontend:
- `GET /transporter/profile`
- `PATCH /transporter/profile`
- `GET /vehicles`
- `POST /vehicles`
- `PATCH /vehicles/:id`
- `PATCH /vehicles/:id/deactivate`
- `GET /trailers`
- `POST /trailers`
- `PATCH /trailers/:id`
- `PATCH /trailers/:id/deactivate`

Endpoints disponibles pero sin UI encontrada:
- `GET /trip-offers/my`
- `POST /trip-offers`
- `POST /trip-offers/:id/publish`
- `PATCH /trip-offers/:id`
- `POST /trip-offers/:id/close`
- `POST /trip-offers/:id/cancel`

Pantallas existentes:
- Dashboard transportista.
- Onboarding/perfil transportista con vistas por estado.
- Hub de flota.
- Alta/edicion de vehiculos.
- Alta/edicion de trailers.

Flujo completo:
- Registro transportista crea `Account + TransporterProfile`.
- Perfil basico: `displayName` y `contactPhone` permiten pasar de `INCOMPLETE` a `PENDING`.
- Flota: listado, alta, edicion y baja logica de vehiculos/trailers.

Flujo incompleto:
- Carga documental/verificacion documental.
- Publicacion de ofertas desde UI.
- Gestion de reservas recibidas.
- Operacion de viaje, check-in/check-out, evidencias y cobro.

Errores o gaps:
- El backend no valida que el transportista este `VERIFIED` para crear/publicar ofertas.
- No se encontro precondicion en `TripOfferService` que exija trailer activo.
- La UI no expone todavia el modulo real de ofertas.

### Usuario ADMIN

Que puede hacer actualmente:
- Iniciar sesion si existe cuenta admin o con admin mock de desarrollo.
- Acceder a dashboard protegido.
- Ver listado de transportistas.
- Ver detalle de transportista.
- Cambiar estado de verificacion de transportista desde `PENDING` hacia `VERIFIED` o `REJECTED`.
- Ver una pantalla de usuarios mockeada en frontend.

Rutas frontend:
- `/dashboard`
- `/admin/transporters`
- `/admin/transporters/[id]`
- `/admin/users`

Endpoints consume desde frontend:
- `GET /admin/transporters`
- `GET /admin/transporters/:id`
- `PATCH /admin/transporters/:id/verification-status`

Pantallas existentes:
- Dashboard admin.
- Listado admin de transportistas real.
- Detalle admin de transportista real.
- Listado admin de usuarios mock.

Flujo completo:
- Revision basica de transportista y cambio de estado `PENDING -> VERIFIED|REJECTED`.

Flujo incompleto:
- Admin users real.
- Motivo de rechazo.
- Revision documental.
- Auditoria de acciones administrativas.
- Gestion de bookings, pagos, disputas o usuarios.

Errores o gaps:
- No hay backend para `/admin/users`; el frontend usa `admin-users-mock-api.ts`.
- Admin no puede crear ni gestionar roles desde UI/API.
- La transicion admin solo permite aprobar/rechazar desde `PENDING`.

## 3. Funcionalidades por usuario

### CLIENT

| Funcionalidad | Estado | Ruta frontend | Endpoint backend | Archivos relevantes | Observaciones | Riesgos o deuda tecnica |
|---|---|---|---|---|---|---|
| Registro cliente | implementada | `/register` | `POST /auth/register` | `apps/web/features/auth`, `apps/api/src/identity/authentication` | Crea `Account + UserProfile`. | No hay verificacion de email real. |
| Login cliente | implementada | `/login` | `POST /auth/login` | `auth-api.ts`, `authentication.controller.ts` | Retorna access token y setea refresh cookie. | Textos con encoding defectuoso en UI. |
| Sesion actual | implementada | global `AuthProvider` | `GET /auth/me`, `POST /auth/refresh` | `auth-provider.tsx`, `bootstrap-session.ts` | Bootstrap client-side. | Depende de access token en memoria. |
| Logout | implementada | `LogoutButton` | `POST /auth/logout` | `logout-button.tsx`, `auth-api.ts` | Limpia cookie y token local. | No hay logout-all. |
| Recuperar contrasena | faltante | `/forgot-password` | No encontrado | `apps/web/app/forgot-password/page.tsx` | Pantalla placeholder. | Flujo auth incompleto. |
| Buscar ofertas | parcial | `/` | `GET /trip-offers/search` | `trip-offer.controller.ts`, `app/page.tsx` | Endpoint existe, home no lo consume. | UI muestra datos inventados. |
| Ver detalle de oferta | parcial | `/viaje/[id]` | `GET /trip-offers/:id/public` | `trip-detail-page.tsx`, `trip-offer.controller.ts` | Pantalla hardcodeada. | El `id` no se usa para fetch real. |
| Reservar cupos | parcial | `/viaje/[id]` | `POST /bookings` | `booking.controller.ts`, `booking.service.ts`, `trip-detail-page.tsx` | Backend existe; modal UI simulado. | Usuario puede creer que reservo/pago cuando no hay persistencia. |
| Ver reserva propia | parcial | No encontrado | `GET /bookings/:id` | `booking.controller.ts` | Endpoint existe sin pantalla. | No hay "mis reservas". |
| Cancelar reserva | parcial | No encontrado | `POST /bookings/:id/cancel` | `booking.service.ts` | Solo cancela `PENDING_PAYMENT`. | Sin UI ni politica visible real. |
| Pago de sena | faltante | Mock visual en `/viaje/[id]` | No encontrado | No encontrado | No existe `Payment`. | Critico para MVP. |
| Contacto/chat post-pago | faltante | Mock visual | No encontrado | No encontrado | No existe modulo chat/contacto. | Riesgo de promesa incumplida. |

### TRANSPORTER

| Funcionalidad | Estado | Ruta frontend | Endpoint backend | Archivos relevantes | Observaciones | Riesgos o deuda tecnica |
|---|---|---|---|---|---|---|
| Registro transportista | implementada | `/register` | `POST /auth/register` | `RegisterTransporterSchema`, `AccountsRepository` | Crea `Account + TransporterProfile`. | Sin documentos ni validacion manual completa. |
| Login transportista | implementada | `/login` | `POST /auth/login` | `auth-api.ts`, `authentication.service.ts` | Redireccion por rol. | No hay MFA. |
| Completar perfil | implementada | `/onboarding/transporter` | `GET/PATCH /transporter/profile` | `transporter-onboarding`, `TransporterProfileService` | `INCOMPLETE -> PENDING` si hay displayName y contactPhone. | No hay documentos ni motivo de rechazo. |
| Ver estado de verificacion | implementada | `/onboarding/transporter`, guards | `GET /transporter/profile` | `TransporterProfileGuard` | Redirige si corresponde. | `PENDING` puede entrar al area protegida. |
| Gestionar vehiculos | implementada | `/vehicles`, `/vehicles/new`, `/vehicles/[id]/edit` | `GET/POST/PATCH /vehicles`, `PATCH /vehicles/:id/deactivate` | `vehicle` backend y `features/vehicle` | Alta, edicion, listado, desactivacion. | Sin detalle individual endpoint separado. |
| Gestionar trailers | implementada | `/vehicles`, `/trailers/new`, `/trailers/[id]/edit` | `GET/POST/PATCH /trailers`, `PATCH /trailers/:id/deactivate` | `trailer` backend y `features/vehicle` | Alta, edicion, listado, desactivacion. | No se muestra ruta `/trailers` index, solo integrado en `/vehicles`. |
| Crear oferta | parcial | No encontrado | `POST /trip-offers` | `TripOfferService` | Backend existe. | Sin UI; no valida VERIFIED ni trailer activo. |
| Listar ofertas propias | parcial | No encontrado | `GET /trip-offers/my` | `TripOfferController` | Backend existe. | Sin pantalla de gestion de ofertas. |
| Editar oferta | parcial | No encontrado | `PATCH /trip-offers/:id` | `TripOfferService` | Solo `DRAFT`. | Sin UI. |
| Publicar oferta | parcial | No encontrado | `POST /trip-offers/:id/publish` | `TripOfferService` | `DRAFT -> PUBLISHED|FULL`. | Sin UI; sin condicion de verificacion. |
| Cerrar oferta | parcial | No encontrado | `POST /trip-offers/:id/close` | `TripOfferService` | Permite `DRAFT`, `PUBLISHED`, `FULL`. | Sin UI. |
| Cancelar oferta | parcial | No encontrado | `POST /trip-offers/:id/cancel` | `TripOfferService` | Permite `DRAFT`, `PUBLISHED`, `FULL`. | Sin UI. |
| Gestionar reservas recibidas | faltante | No encontrado | No encontrado | No encontrado | No existe endpoint transporter bookings. | Alto para operacion. |
| Check-in/out con evidencia | faltante | No encontrado | No encontrado | No encontrado | No existe `Proof`. | Critico para trazabilidad. |

### ADMIN

| Funcionalidad | Estado | Ruta frontend | Endpoint backend | Archivos relevantes | Observaciones | Riesgos o deuda tecnica |
|---|---|---|---|---|---|---|
| Login admin | parcial | `/login` | `POST /auth/login` | `development-admin-auth.config.ts` | Soporta admin mock dev. | Creacion/admin real no documentada en UI. |
| Dashboard admin | implementada | `/dashboard` | `GET /auth/me` | `DashboardPageView` | Navegacion por rol. | No hay metricas reales. |
| Listar transportistas | implementada | `/admin/transporters` | `GET /admin/transporters` | `admin-transporters-api.ts`, `AdminController` | Filtro por `status`. | Sin paginacion. |
| Ver transportista | implementada | `/admin/transporters/[id]` | `GET /admin/transporters/:id` | `admin-transporter-detail-api.ts` | Detalle basico. | Sin documentos ni historial. |
| Aprobar/rechazar transportista | implementada | `/admin/transporters/[id]` | `PATCH /admin/transporters/:id/verification-status` | `AdminService` | Solo `PENDING -> VERIFIED|REJECTED`. | Sin motivo de rechazo. |
| Listar usuarios | parcial/mock | `/admin/users` | No encontrado | `admin-users-mock-api.ts` | Mock frontend. | Puede confundir operacion real. |
| Gestionar bookings/pagos/disputas | faltante | No encontrado | No encontrado | No encontrado | No implementado. | Critico para soporte MVP. |

## 4. Inventario completo de endpoints backend

Total encontrado: 29 endpoints reales en controllers NestJS.

### Auth

#### POST /auth/register

- Controller: `AuthenticationController.register`
- Service: `AuthenticationService.register`
- DTO request: `RegisterDto`, validado con `RegisterSchema`
- DTO response: `IRegisterResponse`
- Guards: `AuthRateLimitGuard`
- Roles: publico; solo permite `CLIENT` y `TRANSPORTER` por schema
- Validaciones relevantes: email, password, discriminated union por rol
- Entidad Prisma relacionada: `Account`, `UserProfile`, `TransporterProfile`
- Tests existentes: `authentication.controller.spec.ts`, `authentication.service.spec.ts`, `authentication.schemas.spec.ts`
- Estado: funcional
- Observaciones: no crea `ADMIN`; no verifica email.

#### POST /auth/login

- Controller: `AuthenticationController.login`
- Service: `AuthenticationService.login`
- DTO request: `LoginDto`, validado con `LoginSchema`
- DTO response: `ILoginResponse`
- Guards: `AuthRateLimitGuard`
- Roles: publico
- Validaciones relevantes: credenciales, rate limit
- Entidad Prisma relacionada: `Account`, `Session`
- Tests existentes: si
- Estado: funcional
- Observaciones: setea refresh cookie; soporta admin mock dev segun configuracion.

#### GET /auth/me

- Controller: `AuthenticationController.me`
- Service: `AuthenticationService.getCurrentAccount`
- DTO request: No aplica
- DTO response: `IMeResponse`
- Guards: `JwtAuthGuard`
- Roles: autenticado
- Validaciones relevantes: JWT access token
- Entidad Prisma relacionada: `Account`
- Tests existentes: si
- Estado: funcional
- Observaciones: retorna campos publicos seguros.

#### POST /auth/refresh

- Controller: `AuthenticationController.refresh`
- Service: `AuthenticationService.refresh`
- DTO request: refresh cookie
- DTO response: `IRefreshResponse`
- Guards: ninguno explicito
- Roles: sesion con refresh valido
- Validaciones relevantes: cookie, token family, sesion, expiracion
- Entidad Prisma relacionada: `Session`
- Tests existentes: si
- Estado: funcional
- Observaciones: rota refresh token y limpia cookie si falla con Unauthorized.

#### POST /auth/logout

- Controller: `AuthenticationController.logout`
- Service: `AuthenticationService.logout`
- DTO request: refresh cookie
- DTO response: 204 sin body
- Guards: ninguno explicito
- Roles: sesion con o sin cookie
- Validaciones relevantes: logout idempotente
- Entidad Prisma relacionada: `Session`
- Tests existentes: si
- Estado: funcional
- Observaciones: limpia cookie aunque no haya cookie.

### Transporter Profile

#### GET /transporter/profile

- Controller: `TransporterProfileController.getOwnProfile`
- Service: `TransporterProfileService.getOwnProfile`
- DTO request: No aplica
- DTO response: `GetOwnTransporterProfileResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: perfil asociado al account autenticado
- Entidad Prisma relacionada: `TransporterProfile`
- Tests existentes: `transporter-profile.controller.spec.ts`, `transporter-profile.service.spec.ts`
- Estado: funcional
- Observaciones: 404 si no existe perfil.

#### PATCH /transporter/profile

- Controller: `TransporterProfileController.updateOwnProfile`
- Service: `TransporterProfileService.updateOwnProfile`
- DTO request: `UpdateTransporterProfileDto`, validado con `UpdateTransporterProfileSchema`
- DTO response: `GetOwnTransporterProfileResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: normaliza strings; `INCOMPLETE -> PENDING` si perfil queda completo
- Entidad Prisma relacionada: `TransporterProfile`
- Tests existentes: si
- Estado: funcional
- Observaciones: no carga documentos.

### Admin

#### GET /admin/transporters

- Controller: `AdminController.listTransporters`
- Service: `AdminService.listTransporters`
- DTO request: `GetAdminTransportersQueryDto`
- DTO response: `AdminTransporterListItemResponseDto[]`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `ADMIN`
- Validaciones relevantes: query `status` si se envia
- Entidad Prisma relacionada: `TransporterProfile`
- Tests existentes: `admin.controller.spec.ts`, `admin.service.spec.ts`
- Estado: funcional
- Observaciones: sin paginacion.

#### GET /admin/transporters/:id

- Controller: `AdminController.getTransporterDetail`
- Service: `AdminService.getTransporterDetail`
- DTO request: `GetAdminTransporterParamsDto`
- DTO response: `AdminTransporterDetailResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `ADMIN`
- Validaciones relevantes: `id` CUID
- Entidad Prisma relacionada: `TransporterProfile`
- Tests existentes: si
- Estado: funcional
- Observaciones: no incluye flota ni documentos.

#### PATCH /admin/transporters/:id/verification-status

- Controller: `AdminController.updateTransporterVerificationStatus`
- Service: `AdminService.updateTransporterVerificationStatus`
- DTO request: `UpdateAdminTransporterVerificationStatusDto`
- DTO response: `AdminTransporterDetailResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `ADMIN`
- Validaciones relevantes: solo transiciones desde `PENDING` a `VERIFIED` o `REJECTED`
- Entidad Prisma relacionada: `TransporterProfile`
- Tests existentes: si
- Estado: funcional
- Observaciones: no registra motivo ni auditoria.

### Vehicles

#### GET /vehicles

- Controller: `VehicleController.listOwnVehicles`
- Service: `VehicleService.listOwnVehicles`
- DTO request: No aplica
- DTO response: `VehicleResponseDto[]`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: account autenticado
- Entidad Prisma relacionada: `Vehicle`, `TransporterProfile`
- Tests existentes: `vehicle.controller.spec.ts`, `vehicle.service.spec.ts`
- Estado: funcional
- Observaciones: lista vehiculos propios.

#### POST /vehicles

- Controller: `VehicleController.createOwnVehicle`
- Service: `VehicleService.createOwnVehicle`
- DTO request: `CreateVehicleDto`, validado con `CreateVehicleSchema`
- DTO response: `VehicleResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: patente unica, normalizacion uppercase
- Entidad Prisma relacionada: `Vehicle`
- Tests existentes: si
- Estado: funcional
- Observaciones: captura violacion unica `P2002`.

#### PATCH /vehicles/:id

- Controller: `VehicleController.updateOwnVehicle`
- Service: `VehicleService.updateOwnVehicle`
- DTO request: `UpdateVehicleDto`, params `VehicleParamsSchema`
- DTO response: `VehicleResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, patente unica
- Entidad Prisma relacionada: `Vehicle`
- Tests existentes: si
- Estado: funcional
- Observaciones: no hay endpoint GET individual.

#### PATCH /vehicles/:id/deactivate

- Controller: `VehicleController.deactivateOwnVehicle`
- Service: `VehicleService.deactivateOwnVehicle`
- DTO request: params `VehicleParamsSchema`
- DTO response: `VehicleResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad; idempotente si ya esta inactivo
- Entidad Prisma relacionada: `Vehicle`
- Tests existentes: si
- Estado: funcional
- Observaciones: baja logica, no delete.

### Trailers

#### GET /trailers

- Controller: `TrailerController.listOwnTrailers`
- Service: `TrailerService.listOwnTrailers`
- DTO request: No aplica
- DTO response: `TrailerResponseDto[]`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: account autenticado
- Entidad Prisma relacionada: `Trailer`, `TransporterProfile`
- Tests existentes: `trailer.controller.spec.ts`, `trailer.service.spec.ts`
- Estado: funcional
- Observaciones: lista trailers propios.

#### POST /trailers

- Controller: `TrailerController.createOwnTrailer`
- Service: `TrailerService.createOwnTrailer`
- DTO request: `CreateTrailerDto`, validado con `CreateTrailerSchema`
- DTO response: `TrailerResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: capacidad positiva
- Entidad Prisma relacionada: `Trailer`
- Tests existentes: si
- Estado: funcional
- Observaciones: soporta `cargoType` y `capacityUnit`.

#### PATCH /trailers/:id

- Controller: `TrailerController.updateOwnTrailer`
- Service: `TrailerService.updateOwnTrailer`
- DTO request: `UpdateTrailerDto`, params `TrailerParamsSchema`
- DTO response: `TrailerResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, capacidad si se envia
- Entidad Prisma relacionada: `Trailer`
- Tests existentes: si
- Estado: funcional
- Observaciones: no hay endpoint GET individual.

#### PATCH /trailers/:id/deactivate

- Controller: `TrailerController.deactivateOwnTrailer`
- Service: `TrailerService.deactivateOwnTrailer`
- DTO request: params `TrailerParamsSchema`
- DTO response: `TrailerResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad; idempotente si ya esta inactivo
- Entidad Prisma relacionada: `Trailer`
- Tests existentes: si
- Estado: funcional
- Observaciones: baja logica.

### Trip Offers / Search

#### GET /trip-offers/search

- Controller: `TripOfferController.searchTripOffers`
- Service: `TripOfferService.searchPublicTripOffers`
- DTO request: `SearchTripOffersQueryDto`
- DTO response: `SearchTripOffersResponseDto`
- Guards: ninguno
- Roles: publico
- Validaciones relevantes: origin, destination, date, requiredCapacity, price range, verifiedOnly, sorting, limit <= 20
- Entidad Prisma relacionada: `TripOffer`, `TransporterProfile`
- Tests existentes: `trip-offer.controller.spec.ts`, `trip-offer.service.spec.ts`
- Estado: funcional sin UI real
- Observaciones: busca solo `PUBLISHED` y con capacidad suficiente.

#### GET /trip-offers/:id/public

- Controller: `TripOfferController.getPublicTripOfferById`
- Service: `TripOfferService.getPublicTripOfferById`
- DTO request: `TripOfferParamsDto`
- DTO response: `PublicTripOfferDetailResponseDto`
- Guards: ninguno
- Roles: publico
- Validaciones relevantes: `id` CUID; solo `PUBLISHED`
- Entidad Prisma relacionada: `TripOffer`, `TransporterProfile`
- Tests existentes: si
- Estado: funcional sin UI real
- Observaciones: la pantalla `/viaje/[id]` no lo consume.

#### GET /trip-offers/my

- Controller: `TripOfferController.listOwnTripOffers`
- Service: `TripOfferService.listOwnTripOffers`
- DTO request: No aplica
- DTO response: `TripOfferResponseDto[]`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: perfil transportista existente
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: No hay pantalla de ofertas propias.

#### POST /trip-offers

- Controller: `TripOfferController.createOwnTripOffer`
- Service: `TripOfferService.createOwnTripOffer`
- DTO request: `CreateTripOfferDto`, validado con `CreateTripOfferSchema`
- DTO response: `TripOfferResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: temporalidad exacta o rango, capacidad, precio, coordenadas, cargo type
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: crea en `DRAFT`; no exige transportista `VERIFIED`.

#### POST /trip-offers/:id/publish

- Controller: `TripOfferController.publishOwnTripOffer`
- Service: `TripOfferService.publishOwnTripOffer`
- DTO request: params `TripOfferParamsSchema`
- DTO response: `TripOfferResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, status `DRAFT`, draft valido
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: resuelve `PUBLISHED` o `FULL` segun capacidad.

#### PATCH /trip-offers/:id

- Controller: `TripOfferController.updateOwnTripOffer`
- Service: `TripOfferService.updateOwnTripOffer`
- DTO request: `UpdateTripOfferDto`
- DTO response: `TripOfferResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, solo `DRAFT`, al menos un campo, draft final valido
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: resetea `availableCapacity` a `capacityTotal`.

#### POST /trip-offers/:id/close

- Controller: `TripOfferController.closeOwnTripOffer`
- Service: `TripOfferService.closeOwnTripOffer`
- DTO request: params `TripOfferParamsSchema`
- DTO response: `TripOfferResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, status permitido `DRAFT|PUBLISHED|FULL`
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: `CLOSED` no aparece como transicion desde `IN_PROGRESS` porque ese estado no existe en enum actual de oferta.

#### POST /trip-offers/:id/cancel

- Controller: `TripOfferController.cancelOwnTripOffer`
- Service: `TripOfferService.cancelOwnTripOffer`
- DTO request: params `TripOfferParamsSchema`
- DTO response: `TripOfferResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `TRANSPORTER`
- Validaciones relevantes: propiedad, status permitido `DRAFT|PUBLISHED|FULL`
- Entidad Prisma relacionada: `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: no coordina impacto sobre bookings existentes.

### Bookings

#### GET /bookings/:id

- Controller: `BookingController.getOwnBookingById`
- Service: `BookingService.getOwnBookingById`
- DTO request: params `BookingParamsSchema`
- DTO response: `BookingDetailResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `CLIENT`
- Validaciones relevantes: propiedad de booking
- Entidad Prisma relacionada: `Booking`, `TripOffer`
- Tests existentes: `booking.controller.spec.ts`, `booking.service.spec.ts`
- Estado: funcional sin UI
- Observaciones: no hay ruta frontend de mis reservas.

#### POST /bookings/:id/cancel

- Controller: `BookingController.cancelOwnBooking`
- Service: `BookingService.cancelOwnBooking`
- DTO request: params `BookingParamsSchema`
- DTO response: `BookingResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `CLIENT`
- Validaciones relevantes: propiedad, solo `PENDING_PAYMENT`, transaccion, release de capacidad
- Entidad Prisma relacionada: `Booking`, `TripOffer`
- Tests existentes: si
- Estado: funcional sin UI
- Observaciones: no existe politica de reembolso porque no hay pagos.

#### POST /bookings

- Controller: `BookingController.createBooking`
- Service: `BookingService.createBooking`
- DTO request: `CreateBookingDto`, validado con `CreateBookingSchema`
- DTO response: `BookingResponseDto`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Roles: `CLIENT`
- Validaciones relevantes: oferta `PUBLISHED`, capacidad suficiente, expiracion de pendientes vencidas
- Entidad Prisma relacionada: `Booking`, `TripOffer`
- Tests existentes: `booking.service.concurrency.spec.ts`, repository spec
- Estado: funcional sin UI
- Observaciones: usa `SELECT ... FOR UPDATE` via `$queryRaw`; crea `PENDING_PAYMENT`.

### Health

No encontrado endpoint real de health en `apps/api/src`.

### Payments

No encontrado modulo ni endpoints reales.

### Proofs / Evidence

No encontrado modulo ni endpoints reales.

### Reviews

No encontrado modulo ni endpoints reales.

### Disputes

No encontrado modulo ni endpoints reales.

### Users / Accounts

No hay controller publico/administrativo de accounts/users. `AccountsService` existe como servicio interno usado por auth.

## 5. Inventario completo de rutas frontend

Total encontrado: 16 rutas reales `page.tsx`.

### Publicas

#### /

- Tipo de pagina: landing/home publica
- Usuario objetivo: visitante, cliente, transportista
- Componentes principales: page inline en `apps/web/app/page.tsx`
- Servicios/API clients usados: No encontrado
- Endpoints consumidos: No encontrado
- Formularios existentes: buscador visual sin submit real
- Validaciones: No encontrado
- Estado: mock/hardcode
- Observaciones: contiene transportistas y ofertas hardcodeadas; links a `/viaje/1` y `/transportista/1`.

#### /como-funciona

- Tipo de pagina: marketing/informativa
- Usuario objetivo: visitante
- Componentes principales: page inline
- Servicios/API clients usados: No encontrado
- Endpoints consumidos: No encontrado
- Formularios existentes: No
- Validaciones: No
- Estado: estatica
- Observaciones: describe pagos, chat, evidencia y PDF como propuesta, pero no todos existen.

#### /forgot-password

- Tipo de pagina: placeholder
- Usuario objetivo: visitante
- Componentes principales: page inline
- Servicios/API clients usados: No encontrado
- Endpoints consumidos: No encontrado
- Formularios existentes: No
- Validaciones: No
- Estado: planificado/no implementado
- Observaciones: indica proximamente.

#### /viaje/[id]

- Tipo de pagina: detalle publico de viaje
- Usuario objetivo: cliente
- Componentes principales: `TripDetailPage`
- Servicios/API clients usados: No encontrado
- Endpoints consumidos: No encontrado
- Formularios existentes: selector de cupos y modal visual
- Validaciones: estado local basico
- Estado: mock/sin conexion
- Observaciones: no consume `GET /trip-offers/:id/public` ni `POST /bookings`.

#### /transportista/[id]

- Tipo de pagina: detalle publico de transportista
- Usuario objetivo: cliente
- Componentes principales: `TransporterDetailPage`
- Servicios/API clients usados: No encontrado
- Endpoints consumidos: No encontrado
- Formularios existentes: propuesta de viaje visual
- Validaciones: required HTML basico
- Estado: mock/sin conexion
- Observaciones: no existe endpoint publico de transportista ni propuesta.

### Auth

#### /login

- Tipo de pagina: guest-only
- Usuario objetivo: visitante
- Componentes principales: `LoginPageView`, `LoginForm`
- Servicios/API clients usados: `loginRequest`
- Endpoints consumidos: `POST /auth/login`
- Formularios existentes: email/password
- Validaciones: schemas frontend y respuesta compartida
- Estado: funcional
- Observaciones: layout guest usa `AuthRouteGuard mode="guest-only"`.

#### /register

- Tipo de pagina: guest-only
- Usuario objetivo: visitante
- Componentes principales: `RegisterPageView`, `RegisterForm`, `RoleSelector`
- Servicios/API clients usados: `registerRequest`
- Endpoints consumidos: `POST /auth/register`
- Formularios existentes: registro cliente/transportista
- Validaciones: schemas frontend y shared
- Estado: funcional
- Observaciones: no permite admin.

### Protegidas generales

#### /dashboard

- Tipo de pagina: protegida
- Usuario objetivo: roles autenticados
- Componentes principales: `DashboardPageView`, `DashboardNavigation`
- Servicios/API clients usados: `useAuth`
- Endpoints consumidos: indirectamente `GET /auth/me`, `POST /auth/refresh`
- Formularios existentes: No
- Validaciones: guards
- Estado: funcional como hub
- Observaciones: contenido informativo, no metricas reales.

### Transportista

#### /onboarding/transporter

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `TransporterOnboardingPage`, status views, `TransporterProfileForm`
- Servicios/API clients usados: `fetchTransporterProfile`, `updateTransporterProfile`
- Endpoints consumidos: `GET /transporter/profile`, `PATCH /transporter/profile`
- Formularios existentes: perfil basico
- Validaciones: schema de perfil
- Estado: funcional
- Observaciones: sin documentos.

#### /vehicles

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `VehicleFleetPage`, sections de vehicles/trailers
- Servicios/API clients usados: `listVehicles`, `listTrailers`
- Endpoints consumidos: `GET /vehicles`, `GET /trailers`
- Formularios existentes: No
- Validaciones: parsing de payload
- Estado: funcional
- Observaciones: hub de flota.

#### /vehicles/new

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `VehicleCreatePage`, `VehicleForm`
- Servicios/API clients usados: `createVehicle`
- Endpoints consumidos: `POST /vehicles`
- Formularios existentes: vehicle
- Validaciones: frontend/shared vehicle schema
- Estado: funcional
- Observaciones: redirige al hub tras crear.

#### /vehicles/[id]/edit

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `VehicleEditPage`, `VehicleEditForm`
- Servicios/API clients usados: `updateVehicle`, `deactivateVehicle`
- Endpoints consumidos: `PATCH /vehicles/:id`, `PATCH /vehicles/:id/deactivate`
- Formularios existentes: edicion vehicle
- Validaciones: frontend/shared
- Estado: funcional parcial
- Observaciones: no hay endpoint GET individual; la pagina depende del estado/hook disponible en feature.

#### /trailers/new

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `TrailerCreatePage`, `TrailerForm`
- Servicios/API clients usados: `createTrailer`
- Endpoints consumidos: `POST /trailers`
- Formularios existentes: trailer
- Validaciones: frontend/shared trailer schema
- Estado: funcional
- Observaciones: layout protege rol transportista.

#### /trailers/[id]/edit

- Tipo de pagina: protegida para `TRANSPORTER`
- Usuario objetivo: transportista
- Componentes principales: `TrailerEditPage`, `TrailerEditForm`
- Servicios/API clients usados: `updateTrailer`, `deactivateTrailer`
- Endpoints consumidos: `PATCH /trailers/:id`, `PATCH /trailers/:id/deactivate`
- Formularios existentes: edicion trailer
- Validaciones: frontend/shared
- Estado: funcional parcial
- Observaciones: no hay endpoint GET individual.

### Admin

#### /admin/transporters

- Tipo de pagina: protegida para `ADMIN`
- Usuario objetivo: admin
- Componentes principales: `AdminTransportersListPage`, `AdminTransportersTable`
- Servicios/API clients usados: `fetchAdminTransporters`
- Endpoints consumidos: `GET /admin/transporters`
- Formularios existentes: filtros basicos si aplica
- Validaciones: schema frontend
- Estado: funcional
- Observaciones: sin paginacion.

#### /admin/transporters/[id]

- Tipo de pagina: protegida para `ADMIN`
- Usuario objetivo: admin
- Componentes principales: `AdminTransporterDetailPage`, `AdminTransporterReviewActions`
- Servicios/API clients usados: `fetchAdminTransporterDetail`, `updateAdminTransporterStatus`
- Endpoints consumidos: `GET /admin/transporters/:id`, `PATCH /admin/transporters/:id/verification-status`
- Formularios existentes: acciones aprobar/rechazar
- Validaciones: schema frontend
- Estado: funcional
- Observaciones: sin motivo de rechazo.

#### /admin/users

- Tipo de pagina: protegida para `ADMIN`
- Usuario objetivo: admin
- Componentes principales: `AdminUsersListPage`, `AdminUsersTable`
- Servicios/API clients usados: `fetchAdminUsersMock`
- Endpoints consumidos: No encontrado
- Formularios existentes: No
- Validaciones: schema mock frontend
- Estado: mock
- Observaciones: no existe backend de usuarios.

## 6. Conexión frontend-backend

| Ruta frontend | Accion del usuario | Endpoint llamado | Metodo | Estado de integracion | Observaciones |
|---|---|---|---|---|---|
| `/login` | Iniciar sesion | `/auth/login` | POST | conectado | Usa fetch directo con `buildApiUrl`. |
| `/register` | Crear cuenta | `/auth/register` | POST | conectado | Soporta CLIENT/TRANSPORTER. |
| global provider | Restaurar sesion | `/auth/me` | GET | conectado | Usa access token en memoria. |
| global provider | Refrescar sesion | `/auth/refresh` | POST | conectado | Usa refresh cookie. |
| dashboard/logout | Cerrar sesion | `/auth/logout` | POST | conectado | Limpieza local idempotente. |
| `/onboarding/transporter` | Ver perfil | `/transporter/profile` | GET | conectado | Requiere TRANSPORTER. |
| `/onboarding/transporter` | Actualizar perfil | `/transporter/profile` | PATCH | conectado | Puede pasar a `PENDING`. |
| `/vehicles` | Ver vehiculos | `/vehicles` | GET | conectado | Requiere TRANSPORTER. |
| `/vehicles` | Ver trailers | `/trailers` | GET | conectado | Requiere TRANSPORTER. |
| `/vehicles/new` | Crear vehiculo | `/vehicles` | POST | conectado | Requiere TRANSPORTER. |
| `/vehicles/[id]/edit` | Editar vehiculo | `/vehicles/:id` | PATCH | conectado | Sin GET individual. |
| `/vehicles/[id]/edit` | Desactivar vehiculo | `/vehicles/:id/deactivate` | PATCH | conectado | Baja logica. |
| `/trailers/new` | Crear trailer | `/trailers` | POST | conectado | Requiere TRANSPORTER. |
| `/trailers/[id]/edit` | Editar trailer | `/trailers/:id` | PATCH | conectado | Sin GET individual. |
| `/trailers/[id]/edit` | Desactivar trailer | `/trailers/:id/deactivate` | PATCH | conectado | Baja logica. |
| `/admin/transporters` | Listar transportistas | `/admin/transporters` | GET | conectado | Requiere ADMIN. |
| `/admin/transporters/[id]` | Ver detalle | `/admin/transporters/:id` | GET | conectado | Requiere ADMIN. |
| `/admin/transporters/[id]` | Aprobar/rechazar | `/admin/transporters/:id/verification-status` | PATCH | conectado | Solo desde `PENDING`. |
| `/admin/users` | Listar usuarios | No encontrado | No encontrado | mock | Usa `admin-users-mock-api.ts`. |
| `/` | Buscar ofertas | No encontrado | No encontrado | mock/sin conexion | Existe `GET /trip-offers/search` pero no se usa. |
| `/viaje/[id]` | Ver detalle viaje | No encontrado | No encontrado | mock/sin conexion | Existe `GET /trip-offers/:id/public` pero no se usa. |
| `/viaje/[id]` | Reservar | No encontrado | No encontrado | mock/sin conexion | Existe `POST /bookings` pero no se usa. |
| `/transportista/[id]` | Enviar propuesta | No encontrado | No encontrado | mock/sin conexion | No existe endpoint de propuestas. |
| `/forgot-password` | Recuperar clave | No encontrado | No encontrado | faltante | Placeholder. |

Pantallas que no llaman endpoints:
- `/`
- `/como-funciona`
- `/forgot-password`
- `/viaje/[id]`
- `/transportista/[id]`
- `/admin/users` usa mock local, no endpoint.

Endpoints sin pantalla:
- Todos los endpoints de `trip-offers`.
- Todos los endpoints de `bookings`.
- Health no existe.

Inconsistencias relevantes:
- Frontend publico muestra busqueda/reserva/pago/reputacion, pero no consume contratos backend reales.
- Backend usa `TripOffer.availableCapacity`; documentacion historica menciona `availableSlots`.
- `.env.example` usa variables `AUTH_*`, mientras AGENTS menciona `JWT_*` como minimas esperadas.
- `CODEX_CONTEXT.md` esta desactualizado para entidades E3/E4/E5.

## 7. Modelo de datos actual

### Enums

- `AccountRole`: `CLIENT`, `TRANSPORTER`, `ADMIN`.
- `AccountStatus`: `ACTIVE`, `SUSPENDED`, `DISABLED`.
- `TransporterVerificationStatus`: `INCOMPLETE`, `PENDING`, `VERIFIED`, `REJECTED`.
- `CargoType`: `EQUINE`, `GENERAL_CARGO`, `FOOD`, `PEOPLE`.
- `CapacityUnit`: `SLOT`, `KG`, `M3`, `SEAT`.
- `TripOfferStatus`: `DRAFT`, `PUBLISHED`, `FULL`, `CLOSED`, `CANCELLED`.
- `BookingStatus`: `PENDING_PAYMENT`, `EXPIRED`, `CONFIRMED`, `IN_PROGRESS`, `DELIVERED_PENDING_CONFIRMATION`, `COMPLETED`, `CANCELLED`, `DISPUTED`.

### Account/User

Existe `Account`, no `User`.

Campos criticos:
- `email` unico.
- `passwordHash`.
- `role`.
- `status`.
- `isEmailVerified`.
- relaciones a `UserProfile`, `TransporterProfile`, `Session`, `Booking`.

Reglas implicitas:
- Cliente registrado tiene `UserProfile`.
- Transportista registrado tiene `TransporterProfile`.
- Registro publico no acepta `ADMIN`.

Gaps:
- No hay modelo de permisos granular.
- No hay auditoria de cambios.
- No hay verificacion de email implementada aunque existe campo.

### UserProfile

Existe para datos basicos de cliente.

Campos:
- `firstName`, `lastName`, `phone`.

Gaps:
- No hay rutas frontend/backend especificas para editar perfil cliente.

### TransporterProfile

Existe.

Campos:
- `displayName`, `businessName`, `contactPhone`, `bio`, `maxDetourKmDefault`, `verificationStatus`.

Relaciones:
- `Account`.
- `Vehicle[]`.
- `Trailer[]`.
- `TripOffer[]`.

Reglas:
- `INCOMPLETE -> PENDING` si el perfil queda con `displayName` y `contactPhone`.
- Admin solo cambia `PENDING -> VERIFIED|REJECTED`.

Gaps:
- No hay documentos.
- No hay `verificationNote` o motivo de rechazo.
- No hay evidencia de auditoria de aprobacion.

### Vehicle/Trailer

`Vehicle` existe:
- `licensePlate` unico.
- `brand`, `model`, `isActive`.
- relacion opcional con trailers.

`Trailer` existe:
- `totalCapacity`.
- `cargoType`.
- `capacityUnit`.
- `isActive`.
- `vehicleId` opcional.

Reglas:
- Baja logica con `isActive`.
- Capacidad de trailer debe ser positiva.
- `cargoType` y `capacityUnit` preparan multi-rubro.

Gaps:
- No hay documentos/fotos/verificacion de vehiculo o trailer.
- No hay enforcement de trailer activo para publicar ofertas.

### TripOffer

Existe.

Campos criticos:
- origen/destino label y coordenadas.
- fecha exacta o ventana.
- `capacityTotal`, `availableCapacity`.
- `pricePerSlot`.
- `maxDetourKm`.
- `cargoType`.
- `isReturn`.
- `status`.

Reglas:
- Creacion en `DRAFT`.
- Publicacion solo desde `DRAFT`.
- Edicion solo en `DRAFT`.
- Busqueda publica solo `PUBLISHED` con capacidad suficiente.
- `FULL` se deriva cuando capacidad disponible llega a 0.

Inconsistencias:
- Enum actual no tiene `IN_PROGRESS` ni `COMPLETED`, aunque AGENTS lo define como estado esperado de negocio.
- Cancelar/cerrar oferta no revisa reservas existentes.

### Booking

Existe.

Campos criticos:
- `tripOfferId`.
- `clientAccountId`.
- `requestedUnits`.
- snapshots de precio.
- `expiresAt`.
- `status`.

Reglas:
- Se crea en `PENDING_PAYMENT`.
- Descuenta capacidad dentro de `prisma.$transaction`.
- Usa `SELECT FOR UPDATE` sobre oferta.
- Expira bookings pendientes vencidos al crear una nueva reserva sobre la misma oferta.
- Cancelacion libera capacidad si booking esta `PENDING_PAYMENT`.

Gaps:
- No hay Payment asociado.
- No hay endpoint para listar reservas propias.
- No hay endpoint para transportista ver reservas recibidas.
- No hay jobs de expiracion independientes.

### Payment

No existe modelo.

Faltante para MVP:
- `Payment.status`.
- `external_reference`.
- `payment_id`.
- idempotencia webhook.
- relacion con `Booking`.

### Proof/Evidence

No existe modelo.

Faltante para MVP:
- Presigned URL.
- Confirmacion de upload.
- Evidencias check-in/check-out.

### Review

No existe modelo.

### Dispute

No existe modelo.

## 8. Flujos end-to-end existentes

### Flujo de autenticacion

Estado actual: implementado.

Registro:
- `/register` llama `POST /auth/register`.
- `CLIENT` crea `Account + UserProfile`.
- `TRANSPORTER` crea `Account + TransporterProfile`.
- `ADMIN` no esta permitido en registro publico.

Login:
- `/login` llama `POST /auth/login`.
- Retorna access token.
- Setea refresh cookie HttpOnly.
- Soporta admin mock de desarrollo si variables estan habilitadas.

Sesion:
- `AuthProvider` hace bootstrap con `/auth/me`.
- Si falla por 401, intenta `/auth/refresh`.
- Access token se guarda en memoria/local service segun frontend actual.

Refresh/logout:
- `POST /auth/refresh` rota refresh token.
- `POST /auth/logout` revoca/limpia sesion de forma idempotente.

Guards:
- Backend: `JwtAuthGuard`, `RolesGuard`.
- Frontend: `AuthRouteGuard`, `ProtectedAppGuard`, `TransporterProfileGuard`.

Gaps:
- No hay recuperacion de password real.
- No hay email verification.
- No hay logout global.

### Flujo transportista

Estado actual: parcial.

Perfil:
- Registro crea perfil `INCOMPLETE`.
- `/onboarding/transporter` consume `GET /transporter/profile`.
- Formulario actualiza con `PATCH /transporter/profile`.
- Si tiene `displayName` y `contactPhone`, pasa a `PENDING`.

Ver estado:
- Vistas frontend por `INCOMPLETE`, `PENDING`, `VERIFIED`, `REJECTED`.
- Admin puede aprobar/rechazar desde `PENDING`.

Flota:
- `/vehicles` lista `GET /vehicles` y `GET /trailers`.
- Alta/edicion/desactivacion conectadas.

Ofertas:
- Backend permite crear, listar, editar, publicar, cerrar y cancelar.
- Frontend no tiene pantallas ni services de ofertas.

Gaps:
- No hay carga documental.
- No hay publicacion de oferta desde UI.
- No hay gestion de reservas recibidas.
- No hay operacion del viaje.

### Flujo cliente

Estado actual: muy parcial.

Buscar ofertas:
- Backend tiene `GET /trip-offers/search`.
- Home no lo consume.

Ver detalle:
- Backend tiene `GET /trip-offers/:id/public`.
- `/viaje/[id]` no lo consume.

Reservar:
- Backend tiene `POST /bookings`.
- `/viaje/[id]` simula reserva en modal local sin persistir.

Mis reservas:
- No encontrado en frontend.
- Backend solo tiene `GET /bookings/:id`, no listado.

Gaps:
- No hay busqueda real UI.
- No hay reserva real UI.
- No hay pago.
- No hay historial/listado cliente.

### Flujo booking

Estado actual: backend parcial funcional.

Creacion:
- `POST /bookings`.
- Requiere `CLIENT`.
- Valida oferta `PUBLISHED`.
- Valida capacidad.
- Calcula snapshots de precio.
- Crea `PENDING_PAYMENT` con expiracion.

Control de cupos:
- `BookingService` usa `prisma.$transaction`.
- `BookingRepository.lockTripOfferById` usa `SELECT ... FOR UPDATE`.
- Descuenta `availableCapacity`.
- Cambia oferta a `FULL` si queda sin capacidad.

Concurrencia:
- Existe `booking.service.concurrency.spec.ts`.
- Cubre riesgo de dos requests concurrentes por cupos.

Cancelacion:
- `POST /bookings/:id/cancel`.
- Solo `PENDING_PAYMENT`.
- Libera capacidad.

Expiracion:
- Pendientes vencidos se expiran al intentar crear otra reserva sobre la misma oferta.
- No se encontro job periodico.

Gaps:
- No hay pagos.
- No hay confirmacion `PENDING_PAYMENT -> CONFIRMED`.
- No hay UI.
- No hay listado.

### Flujo admin

Estado actual: parcial funcional.

Ver perfiles:
- `/admin/transporters` consume `GET /admin/transporters`.
- `/admin/transporters/[id]` consume `GET /admin/transporters/:id`.

Aprobar/rechazar:
- Acciones consumen `PATCH /admin/transporters/:id/verification-status`.
- Service valida transicion desde `PENDING`.

Gestionar estados:
- Solo verificacion de transportista.

Gaps:
- No hay usuarios reales.
- No hay documentos.
- No hay auditoria.
- No hay pagos, disputas ni reservas.

## 9. Estado de testing y calidad

Comandos disponibles en root:
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm issues:create`
- `pnpm agent:branch`
- `pnpm agent:pr`

Comandos apps:
- API: `dev`, `build`, `lint`, `test`, `typecheck`, `db:generate`, `db:migrate`, `db:studio`, `prisma:deploy`.
- Web: `dev`, `build`, `lint`, `test`, `typecheck`.

CI/CD:
- `.github/workflows/ci.yml` corre install, lint, typecheck, tests y build en push/PR a `main` y `develop`.
- Usa Node 20 y pnpm.
- Define `DATABASE_URL` placeholder.

Tests backend encontrados:
- Auth: controller, service, token, session, password, cookies, schemas, strategy, roles guard.
- Transporter profile: controller y service.
- Admin: controller y service.
- Vehicle: controller y service.
- Trailer: controller y service.
- Trip offer: controller, service, repository.
- Booking: controller, service, repository, concurrency.
- Common pipe: Zod validation.

Tests frontend encontrados:
- API client.
- `useFormSubmit`.
- Auth services/hooks/components/guards.
- Dashboard.
- Onboarding transporter.
- Admin transporters/users mock.
- Vehicle/trailer services, forms y pages.

Cobertura en modulos criticos:
- Auth: buena.
- Permisos/roles: buena.
- Transporter profile/admin verification: buena para flujo basico.
- Vehicle/trailer: buena para flujo basico.
- Trip offer: buena en backend, sin frontend.
- Booking: buena en backend para creacion, cancelacion y concurrencia, sin frontend.
- Payments/webhooks: no aplica, faltante.

Listo para CI/CD:
- La configuracion existe y es razonable.
- No se ejecuto `pnpm lint`, `pnpm typecheck`, `pnpm test` ni `pnpm build` durante esta auditoria.
- Riesgo: `apps/web` usa script `next lint`, comando removido/deprecado en versiones modernas de Next; requiere verificacion real.

## 10. Riesgos técnicos y funcionales

### Criticos

| Riesgo | Archivo o modulo | Impacto | Recomendacion |
|---|---|---|---|
| UI publica simula pago protegido, reserva, comprobante y evidencia sin backend real | `apps/web/app/page.tsx`, `TripDetailPage`, `TransporterDetailPage` | Riesgo legal/comercial y de confianza si se demo como funcional. | Etiquetar como mock o conectar a backend real antes de demo externa. |
| No existe modulo de pagos ni webhook Mercado Pago | No encontrado | Booking no puede avanzar a `CONFIRMED`; contacto restringido imposible. | Implementar payments/webhooks idempotentes despues de estabilizar booking UI. |
| Booking crea `PENDING_PAYMENT` pero no hay flujo de pago | `BookingService`, `Booking` schema | Reservas quedan pendientes hasta expirar/cancelar. | Integrar Payment y expiracion operativa. |
| No hay evidencia/check-in/check-out | No encontrado | No se puede cumplir trazabilidad minima del MVP. | Implementar Proof + R2 presigned flow. |

### Altos

| Riesgo | Archivo o modulo | Impacto | Recomendacion |
|---|---|---|---|
| Frontend no consume endpoints reales de ofertas | `app/page.tsx`, `TripDetailPage` | Cliente no puede buscar ni reservar ofertas reales. | Crear services/hooks de `trip-offers` y reemplazar mocks. |
| No hay UI de ofertas para transportista | `trip-offer` backend sin feature web | Transportista no puede publicar desde producto. | Implementar feature frontend de ofertas. |
| No hay endpoint/listado de mis reservas | `booking` | Cliente no puede operar reservas. | Agregar endpoint y pantalla de mis reservas. |
| Admin users es mock | `admin-users-mock-api.ts` | Admin cree gestionar usuarios pero no hay backend. | Crear endpoint real o ocultar pantalla. |
| `TripOfferStatus` no incluye `IN_PROGRESS`/`COMPLETED` | Prisma schema | Divergencia con reglas AGENTS. | Definir ADR o ajustar enum cuando llegue operacion de viaje. |

### Medios

| Riesgo | Archivo o modulo | Impacto | Recomendacion |
|---|---|---|---|
| `CODEX_CONTEXT.md` desactualizado | `CODEX_CONTEXT.md` | Futuros agentes pueden tomar decisiones erroneas. | Actualizar documentacion tecnica. |
| Textos con encoding defectuoso | multiples archivos web | UX poco profesional. | Normalizar encoding UTF-8 y revisar copy. |
| No hay paginacion admin transportistas | `AdminController` | Escalabilidad limitada. | Agregar paginacion cuando crezca base. |
| No hay GET individual vehicle/trailer | `VehicleController`, `TrailerController` | Edicion depende de estado/lista o workaround. | Agregar endpoint si la UI lo necesita. |
| No hay motivo de rechazo | `AdminService`, `TransporterProfile` | Mala experiencia transportista. | Agregar campo y UI cuando se implemente verificacion completa. |

### Bajos

| Riesgo | Archivo o modulo | Impacto | Recomendacion |
|---|---|---|---|
| Algunos HTML sueltos en raiz | `pagina_*.html` | Ruido en repo. | Documentar si son referencias o mover a docs/design con criterio. |
| `DESGIN_SYSTEM.md` parece tener typo | raiz | Mantenibilidad menor. | Renombrar solo si se aprueba. |
| Dashboard con copy interno de epicas | `DashboardPageView` | UX no final. | Reescribir copy antes de demo. |

## 11. Gaps contra el MVP esperado

| Modulo MVP | Estado actual | Que existe | Que falta | Prioridad |
|---|---|---|---|---|
| Auth y roles | implementado | Registro/login/me/refresh/logout, guards, roles | Email verification, password reset, admin real | Alta |
| Perfil transportista | parcial | Perfil basico y estados | Documentos, motivo de rechazo, auditoria | Alta |
| Verificacion manual | parcial | Admin aprueba/rechaza `PENDING` | Revision documental, evidencia, notas | Alta |
| Trailer/vehiculo | implementado parcial | CRUD basico y baja logica | Fotos/docs, validacion operativa avanzada | Media |
| Publicacion de ofertas | parcial | Backend completo base | UI transportista, precondiciones VERIFIED/trailer | Alta |
| Busqueda | parcial | Endpoint backend | UI conectada, filtros reales | Alta |
| Detalle publico | parcial | Endpoint backend | UI conectada al id real | Alta |
| Booking anti-overbooking | parcial | Backend transaccional con test concurrencia | UI, listado, pago, jobs expiracion | Critica |
| Pagos | faltante | Variables env en ejemplo/docs | Payment model, MP integration, webhook idempotente | Critica |
| Evidencias | faltante | No encontrado | Proof model, R2 presigned, check-in/out | Critica |
| Reputacion | faltante | Mock visual | Review model, endpoints, UI | Media |
| Comprobante PDF | faltante | Mock/marketing | Generacion PDF y descarga real | Media |
| Disputas | faltante | No encontrado | Dispute model, endpoints, admin flow | Media |
| Green metrics | faltante | No encontrado | Modelo/calculo/UI | Baja |
| Admin | parcial | Transportistas real, usuarios mock | Users real, bookings, pagos, disputas, auditoria | Alta |

## 12. Recomendaciones operativas

### Acciones inmediatas

- Alinear documentacion viva: actualizar `CODEX_CONTEXT.md` para reflejar que `Vehicle`, `Trailer`, `TripOffer` y `Booking` ya existen.
- Marcar o aislar pantallas mock antes de cualquier demo externa, especialmente `/`, `/viaje/[id]` y `/transportista/[id]`.
- Conectar `/` y `/viaje/[id]` a `GET /trip-offers/search` y `GET /trip-offers/:id/public`.
- Crear UI minima para `POST /bookings` desde el detalle de viaje, dejando claro que pago aun no esta implementado.
- Validar comandos CI reales: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

### Proximas issues recomendadas

- `feature(search): conectar home a busqueda publica de ofertas`
- `feature(trip-offer-detail): consumir detalle publico real por id`
- `feature(booking): crear reserva real desde detalle de viaje`
- `feature(transporter-offers): CRUD frontend de ofertas propias`
- `feature(admin-users): reemplazar mock de usuarios por API real o remover pantalla`
- `docs(context): actualizar CODEX_CONTEXT al estado actual del schema`
- `fix(web-copy): corregir caracteres mal codificados en pantallas publicas`

### Refactors recomendados

- Separar pantallas mock de marketing de pantallas transaccionales reales.
- Crear services frontend para `trip-offers` y `bookings` con Zod schemas compartidos.
- Revisar precondiciones de publicacion: transportista verificado y trailer activo.
- Evaluar GET individual para `vehicles/:id` y `trailers/:id` si la edicion lo requiere.

### Tests prioritarios

- Frontend: service tests para `trip-offers/search`, `trip-offers/:id/public` y `bookings`.
- Frontend: integration/component tests para detalle de viaje conectado.
- Backend: test de que transportista no verificado no pueda publicar, si esa regla se confirma como negocio.
- Backend: tests de cancelacion de oferta con bookings existentes antes de habilitar UI.
- Backend futuro: idempotencia webhook MP, firma invalida y transiciones de pago.

## 13. Conclusión

El proyecto tiene una base tecnica mas avanzada que una maqueta: auth, roles, onboarding, admin transportistas, flota, ofertas y booking existen con una arquitectura modular consistente y buen nivel de tests backend. Sin embargo, el MVP todavia no es vendible como flujo completo porque la experiencia publica principal no esta conectada al backend real y faltan pagos, evidencia, reputacion, disputas y comprobante.

Para una demo real interna, el sistema puede mostrar auth, roles, onboarding, aprobacion admin y flota. Para una demo comercial del marketplace, el siguiente paso tecnico debe ser conectar busqueda/detalle/reserva con endpoints reales y eliminar o rotular los mocks aspiracionales. Despues de eso, la prioridad critica es pagos/webhooks e integracion con el estado de booking.
