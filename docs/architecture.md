Architecture
<!-- version: 1.0 | última actualización: 2026-03-13 | revisar si cambian entidades, estados, módulos o decisiones de arquitectura -->
1. Objetivo
Definir la arquitectura inicial del MVP de la plataforma de cupos y retornos para transporte, con vertical inicial Equinos y core preparado para evolución multi-rubro.
Este documento no busca sobrediseñar el sistema.
Busca dejar claras las piezas principales para implementar el MVP sin caos ni retrabajo.

2. Principios de arquitectura
2.1 MVP primero
La arquitectura debe resolver bien el flujo principal del negocio antes de agregar complejidad innecesaria.
2.2 Core extensible
Aunque la UI del MVP esté centrada en Equinos, el modelo no debe quedar bloqueado a esa vertical.
2.3 Zonas críticas protegidas
Las áreas de booking, payments, webhooks, auth y permisos deben tratarse como módulos sensibles.
2.4 Claridad antes que sofisticación
Se prioriza una arquitectura simple, modular y fácil de mantener.
2.5 Integridad transaccional
Las operaciones que afectan cupos, reservas y pagos deben preservar consistencia.

3. Arquitectura general
El sistema se implementa como un monorepo con:

apps/web → frontend con Next.js
apps/api → backend con NestJS
packages/* → paquetes compartidos
docs/ → documentación del proyecto

Frontend
Responsable de:

autenticación del usuario
formularios
dashboards
búsqueda y exploración
checkout
timeline operativo
vistas de reservas, ofertas y pagos

Backend
Responsable de:

reglas de negocio
validación server-side
auth y permisos
booking y control de cupos
integración con PSP
webhooks
storage metadata
generación de comprobantes
reputación y disputas

Base de datos

PostgreSQL
Prisma como ORM

Storage

Cloudflare R2 o S3 compatible
evidencias, fotos, documentos y PDFs

Observabilidad

logs estructurados
Sentry para errores críticos


3b. Bounded contexts iniciales
Aunque el sistema es un monolito modular, se organiza en bounded contexts para guiar la separación de responsabilidades:
ContextoResponsabilidadMódulosIdentityQuién eres y qué podés hacerauth, users, profilesFleetCapacidad disponible del transportistavehicles, trailersMarketplacePublicar, descubrir y reservar capacidadtrip-offers, search, bookingsOperationsEjecutar y evidenciar el viajeproofs, timelineFinancePagos, estados monetarios, webhookspayments, webhooksTrustReputación, disputas, comprobantesreviews, disputes, documentsPlatformAdministración y configuración internaadmin, config
Regla: los bounded contexts no deben importarse entre sí directamente. La comunicación se hace a través de servicios o eventos, nunca accediendo directamente al repositorio de otro contexto.

4. Módulos iniciales del backend
MóduloContextoResponsabilidad principalauthIdentityRegistro, login, sesión, guards de accesousers / profilesIdentityDatos del usuario, rol, estado de verificaciónvehicles / trailersFleetCRUD de vehículos y trailers del transportistatrip-offersMarketplacePublicación, edición, estado y disponibilidad de ofertassearchMarketplaceLógica de filtrado y ranking de ofertas para el clientebookingsMarketplaceReserva de cupos, control anti-overbooking, estadospaymentsFinanceIntegración PSP, webhook idempotente, estados de pagowebhooksFinanceRecepción, verificación e idempotencia de eventos PSPproofsOperationsUpload de evidencias, check-in/out, timelinereviewsTrustCalificaciones mutuas al cerrar operacióndisputesTrustReporte de problema, congelamiento de pago, resolución manualdocumentsTrustGeneración y entrega de comprobante PDFadminPlatformVerificaciones de transportistas, panel de disputas
No todos tienen que implementarse completos desde el primer sprint, pero esta es la partición lógica del dominio.

5. Entidades núcleo
5.1 User
Representa una cuenta del sistema.
Campos base:

id
email
passwordHash o proveedor auth
role
status → ACTIVE | SUSPENDED | PENDING_VERIFICATION
createdAt
updatedAt

Roles iniciales:

CLIENT
TRANSPORTER
ADMIN


5.2 TransportistaProfile
Perfil extendido del transportista.
Campos base:

id
userId
displayName
phone
verificationStatus
verificationNote → motivo de rechazo si aplica
ratingAvg
ratingCount

Estados de verificación:

PENDING
VERIFIED
REJECTED


5.3 Vehicle
Vehículo tractor o unidad principal.
Campos base:

id
ownerProfileId
plate
brand
model
year
active


5.4 Trailer
Unidad de capacidad asociada al transportista.
Campos base:

id
ownerProfileId
vehicleId opcional
name
cargoType
capacityUnit
totalCapacity
active

Para el MVP:

cargoType = EQUINE
capacityUnit = SLOT


5.5 TripOffer
Oferta publicada por el transportista.
Campos base:

id
transporterProfileId
vehicleId opcional
trailerId
cargoType
capacityUnit
origin
originCoords → { lat, lng }
destination
destinationCoords → { lat, lng }
departureDate
arrivalEstimate
availableCapacity → debe decrementarse transaccionalmente
totalCapacity → copia del trailer al momento de publicar
pricePerUnit
maxDetourKm
isReturn → boolean, si es oferta de retorno
parentOfferId → referencia a la oferta de ida si es retorno
notes
status
cancelPolicyId opcional

Estados:

DRAFT
PUBLISHED
FULL
CLOSED
IN_PROGRESS
COMPLETED
CANCELLED


5.6 Booking
Reserva hecha por un cliente.
Campos base:

id
offerId
clientUserId
requestedUnits
unitPriceSnapshot → precio al momento de reservar
subtotalAmount
depositAmount → 30% del subtotal
currency
notes → observaciones del cliente al reservar
status
confirmedAt → timestamp de confirmación de pago
cancelledAt
cancelledByUserId
createdAt

Estados:

PENDING_PAYMENT
CONFIRMED
IN_PROGRESS
DELIVERED_PENDING_CONFIRMATION
COMPLETED
CANCELLED
DISPUTED


5.7 Payment
Registro del estado de pago vinculado a una reserva.
Campos base:

id
bookingId
type → DEPOSIT (seña) | BALANCE (saldo)
provider
providerReference
idempotencyKey → clave única para evitar doble procesamiento
amount
currency
status
lastWebhookEventId
webhookReceivedAt
metadata → JSON para guardar datos del PSP sin romper el schema
createdAt
updatedAt

Estados:

INITIATED
HELD
RELEASED
REFUNDED
DISPUTED
FAILED


5.8 WebhookEvent
Tabla dedicada para garantizar idempotencia en el procesamiento de webhooks.
Campos base:

id
provider
eventId → clave de idempotencia — unique constraint
eventType → ej: payment.approved
payload → JSON raw del PSP
bookingId opcional → si se puede resolver al recibir
status → RECEIVED | PROCESSED | FAILED
processedAt


5.9 Proof
Evidencia operativa.
Campos base:

id
bookingId
type
fileUrl
uploadedByUserId
createdAt

Tipos iniciales:

CHECKIN_PHOTO
CHECKOUT_PHOTO
DELIVERY_PROOF
DOCUMENT


5.10 Review
Calificación posterior al servicio.
Campos base:

id
bookingId
authorUserId
targetUserId
score
comment
createdAt


Un Review solo puede crearse cuando Booking.status = COMPLETED


5.11 Dispute
Conflicto abierto sobre una reserva o entrega.
Campos base:

id
bookingId
openedByUserId
reason
status
resolutionNote
resolvedAt
resolvedByUserId → admin que resolvió

Estados:

OPEN
UNDER_REVIEW
RESOLVED
REJECTED


Una Dispute solo puede abrirse cuando Booking.status está en IN_PROGRESS, DELIVERED_PENDING_CONFIRMATION o COMPLETED


6. Multi-rubro desde el diseño
Aunque la UI inicial opere solo con Equinos, la arquitectura debe contemplar:

cargoType
capacityUnit
cargoSpec o attributes extensibles
validaciones específicas por rubro más adelante

Ejemplo inicial:

cargoType = EQUINE
capacityUnit = SLOT

Ejemplos futuros:

GENERAL_CARGO + KG
FOOD + M3
PEOPLE + SEAT

La base del dominio no debe asumir que todo transporte son caballos.

El módulo de búsqueda debe filtrar por cargoType desde el inicio, aunque en el MVP solo exista EQUINE. Eso evita reescritura cuando se agreguen rubros.


7. Relaciones principales
User
 ├─ 1:1  TransportistaProfile (si role = TRANSPORTER)
 │    ├─ 1:N  Vehicle
 │    ├─ 1:N  Trailer
 │    └─ 1:N  TripOffer
 │              └─ 1:N  Booking
 │                    ├─ 1:N  Payment
 │                    ├─ 1:N  Proof
 │                    ├─ 1:N  Review  (una por parte)
 │                    └─ 0:1  Dispute
 └─ como CLIENT: referenciado en Booking.clientUserId
Restricciones de integridad

un Booking no puede existir sin una TripOffer válida en estado PUBLISHED o FULL
un Payment siempre tiene un Booking asociado
un Review solo puede crearse cuando Booking.status = COMPLETED
un Dispute solo puede abrirse cuando Booking.status está en IN_PROGRESS, DELIVERED_PENDING_CONFIRMATION o COMPLETED
una TripOffer no puede tener availableCapacity < 0
un transportista no puede tener un Booking en su propia TripOffer


8. Estados y transiciones válidas
8.1 TripOffer.status
TransiciónCondición / DisparadorDRAFT → PUBLISHEDTransportista publica la ofertaPUBLISHED → FULLAutomático cuando availableCapacity = 0PUBLISHED → CLOSEDTransportista cierra manualmentePUBLISHED → IN_PROGRESSInicio del viaje (primer check-in)IN_PROGRESS → COMPLETEDÚltimo check-out y confirmaciónPUBLISHED → CANCELLEDCancelación antes de inicioFULL → PUBLISHEDSe libera un cupo por cancelación de booking
8.2 Booking.status
TransiciónCondición / DisparadorPENDING_PAYMENT → CONFIRMEDWebhook de seña exitosa del PSPPENDING_PAYMENT → CANCELLEDTimeout o pago fallidoCONFIRMED → IN_PROGRESSCheck-in registradoIN_PROGRESS → DELIVERED_PENDING_CONFIRMATIONCheck-out registradoDELIVERED_PENDING_CONFIRMATION → COMPLETEDCliente confirma entregaDELIVERED_PENDING_CONFIRMATION → DISPUTEDCliente reporta problemaCONFIRMED → CANCELLEDCancelación antes del inicioDISPUTED → COMPLETEDAdmin resuelve a favor del transportistaDISPUTED → CANCELLEDAdmin resuelve a favor del cliente
8.3 Payment.status
TransiciónCondición / DisparadorINITIATED → HELDPSP captura y retiene la señaHELD → RELEASEDEntrega confirmada, pago liberado al transportistaHELD → REFUNDEDCancelación o disputa resuelta a favor del clienteHELD → DISPUTEDReporte de problema activoINITIATED → FAILEDFallo en el PSPDISPUTED → RELEASEDAdmin resuelve a favor del transportistaDISPUTED → REFUNDEDAdmin resuelve a favor del cliente

9. Estrategia anti-overbooking
Esta es una de las piezas críticas del sistema.
Problema
Dos usuarios pueden intentar reservar el último cupo simultáneamente. Sin control transaccional, ambas reservas pueden confirmarse con capacidad inexistente. Eso rompe la confianza del producto y genera disputas manuales difíciles de resolver.
Patrón requerido
La reserva debe ejecutarse en una transacción de DB que:

lea availableCapacity con lock (SELECT FOR UPDATE o equivalente en Prisma)
verifique que availableCapacity >= requestedUnits
si no hay capacidad: aborte con error 409 CONFLICT
si hay capacidad: descuente availableCapacity -= requestedUnits
cree el Booking en PENDING_PAYMENT
si availableCapacity llega a 0: actualice TripOffer.status = FULL
todo en la misma transacción atómica

typescript// patrón base — Codex debe seguir esta estructura
await prisma.$transaction(async (tx) => {
  const offer = await tx.tripOffer.findUnique({
    where: { id: offerId },
  });

  if (offer.availableCapacity < requestedUnits) {
    throw new ConflictException('SLOTS_UNAVAILABLE');
  }

  const newCapacity = offer.availableCapacity - requestedUnits;

  await tx.tripOffer.update({
    where: { id: offerId },
    data: {
      availableCapacity: newCapacity,
      status: newCapacity === 0 ? 'FULL' : offer.status,
    },
  });

  return tx.booking.create({ data: { ... } });
});
```

### Liberación de cupos
Si un Booking se cancela o el pago falla:
- `availableCapacity += requestedUnits` (en transacción)
- si `TripOffer.status = FULL`: volver a `PUBLISHED`

### Test obligatorio
Debe existir un test de concurrencia que simule dos reservas simultáneas del último cupo y verifique que solo una se confirma.

---

## 10. Estrategia de pagos y webhooks

### Reglas base
- no hay billetera propia
- el PSP es la fuente de verdad externa
- los webhooks deben ser idempotentes
- ningún cambio importante de estado monetario puede depender solo del frontend

### Flujo de procesamiento de webhook

1. el PSP envía `POST` a `/webhooks/psp`
2. el backend verifica firma del request (header del PSP)
3. extrae `eventId` y `providerReference`
4. busca si `eventId` ya existe en `WebhookEvent`
5. si ya existe → responde `200` sin hacer nada más (idempotencia)
6. si no existe → aplica el cambio de estado en transacción
7. registra `WebhookEvent` como `PROCESSED` en la misma transacción
8. responde `200`

> Regla crítica: si el procesamiento falla, el evento debe ser reintentable sin efecto doble. El update de `Payment` y el registro de `WebhookEvent` van en la misma transacción.

### Requisitos técnicos
- guardar `providerReference` e `idempotencyKey` en todo `Payment`
- soportar reintentos del proveedor sin efectos dobles
- ningún cambio de estado monetario depende solo del frontend

---

## 10b. Estrategia de búsqueda

### Inputs del cliente
- origen (texto o coordenadas)
- destino (texto o coordenadas)
- fecha o rango de fechas
- cupos requeridos

### Lógica de matching
Una oferta es compatible si:
- `status = PUBLISHED`
- `availableCapacity >= requestedUnits`
- `departureDate` dentro del rango solicitado
- origen y destino dentro del radio aceptable o ruta compatible
- `cargoType` coincide con el requerimiento (siempre filtrar, aunque en MVP solo sea `EQUINE`)

### Ordenamiento
- por defecto: proximidad de ruta + rating del transportista
- opciones del usuario: precio, fecha, rating

### Consideraciones de performance para MVP
- no usar geocoding en cada request — cachear coordenadas
- cachear resultados de búsquedas frecuentes por ruta
- paginar resultados (máximo 20 por página)
- debounce en el input del cliente
- índices en: `status`, `cargoType`, `departureDate`, `originCoords`, `destinationCoords`

---

## 11. Evidencias y documentos

Los archivos no deben guardarse en PostgreSQL como binarios pesados.

Se recomienda:
- archivo en R2/S3
- metadata en base de datos
- uploads directos con presigned URLs — el backend no actúa como proxy de archivos

Tipos de archivo esperados:
- fotos de trailer
- documentos de verificación
- evidencias de check-in/check-out
- comprobantes PDF

---

## 11b. Comprobante digital

### Cuándo se genera
Al momento en que `Booking.status` pasa a `COMPLETED`. Se genera una sola vez y se guarda en storage (idempotente).

### Contenido mínimo del PDF
- número de reserva único
- fecha de emisión
- datos del transportista (nombre, verificación)
- datos del cliente
- ruta (origen → destino)
- fecha del viaje
- cupos reservados y tipo de carga
- detalle de montos (seña + saldo + total)
- estado del pago
- referencias a evidencias (check-in/out)
- código identificador único del comprobante

### Implementación recomendada para MVP
- librería server-side: puppeteer o pdfmake
- renderizar template HTML → PDF
- subir a R2/S3 y guardar URL en `Booking` o tabla `DocumentFile`
- URL firmada con expiración para acceso seguro
- no regenerar si ya existe (verificar antes de generar)

---

## 12. Autenticación y permisos

### Estrategia de tokens
- JWT con expiración corta (15-60 min)
- refresh token con rotación guardado en DB para poder revocarlo
- access token en memoria del cliente (no en localStorage)
- refresh token en httpOnly cookie

### Guards en NestJS
- `JwtAuthGuard` para endpoints autenticados
- `RolesGuard` para restricción por rol
- decorador `@Roles(Role.TRANSPORTER)` sobre controllers/endpoints

### Tabla de acceso por recurso y rol

| Recurso | CLIENT | TRANSPORTER | ADMIN |
|---|---|---|---|
| Buscar ofertas | ✓ | ✓ | ✓ |
| Crear / editar oferta | ✗ | Solo propias | ✓ |
| Ver booking | Solo propios | Solo de sus ofertas | ✓ |
| Hacer check-in/out | ✗ | Solo de sus viajes | ✓ |
| Ver pagos | Solo propios | Solo propios | ✓ |
| Verificar transportista | ✗ | ✗ | ✓ |
| Resolver disputa | ✗ | ✗ | ✓ |
| Calificar | Solo tras COMPLETED | Solo tras COMPLETED | ✓ |

> Un transportista no puede reservar en su propia oferta. Validar a nivel service, no solo a nivel guard.

### Restricciones adicionales
- un transportista solo puede editar sus propios recursos
- un cliente solo puede ver y operar sus reservas
- admin puede gestionar verificaciones y disputas

---

## 13. Organización interna del backend

Cada módulo sigue esta estructura interna:
```
/módulo
  módulo.module.ts
  módulo.controller.ts   ← solo recibe y responde, sin lógica
  módulo.service.ts      ← lógica de negocio
  módulo.repository.ts   ← acceso a DB (cuando justifica separación)
  dto/
    create-X.dto.ts
    update-X.dto.ts
  entities/
    X.entity.ts
  tests/
    módulo.service.spec.ts
Regla: la lógica de negocio vive en el service. El controller no toma decisiones de negocio. El repository no tiene lógica de negocio.

14. Frontend: vistas principales
Cliente

login / registro
búsqueda
resultados
detalle de oferta
checkout
mis reservas
detalle de reserva con timeline y comprobante

Transportista

onboarding
verificación
dashboard
vehículos / trailers
publicar oferta
mis ofertas
reservas recibidas
operación del viaje
pagos

Admin

verificaciones
disputas


15. Paquetes compartidos
Estructura sugerida:

packages/types → tipos TypeScript compartidos entre web y api (enums, DTOs base, interfaces)
packages/shared → utilidades compartidas (formateo, validaciones comunes, helpers)
packages/config → config de lint, tsconfig, prettier
packages/ui → componentes reutilizables (agregar cuando haya necesidad real, no antes)


16. Variables de entorno requeridas
Documentar en .env.example. Nunca commitear valores reales. Si un módulo nuevo requiere una variable nueva, debe agregarla al .env.example en el mismo PR.
env# Base de datos
DATABASE_URL=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=

# PSP
PSP_API_KEY=
PSP_WEBHOOK_SECRET=
PSP_BASE_URL=

# Storage
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Observabilidad
SENTRY_DSN=

# App
APP_ENV=development
APP_PORT=3000
APP_URL=

17. Orden de implementación recomendado

foundations
auth
perfil transportista
vehicles / trailers
trip-offers
search
bookings con anti-overbooking
payments + webhooks
proofs
reviews / disputes
documents / PDF
green metrics


18. Decisiones técnicas
18.1 Decisiones tomadas
DecisiónAlternativa descartadaRazónMonolito modular NestJSMicroserviciosComplejidad innecesaria para MVPPostgreSQL + PrismaMongoDBConsistencia transaccional requeridaJWT + refresh tokenSessions en DB purasStateless, escala mejorPSP externo sin billeteraBilletera propiaRegulatorio y complejidadR2/S3 para archivosBinarios en DBPerformance y costoBullMQ diferidoJobs síncronosPDF y emails no deben bloquear requestsVerificación manualKYC automáticoVelocidad de implementación en MVP
18.2 Decisiones pendientes
DecisiónOpcionesCriterio para decidirPSP específicoMercado Pago, Stripe, otroDisponibilidad en AR y tiempo de altaLock en PrismaOptimistic vs SELECT FOR UPDATETestear con carga realCache de búsquedasRedis vs in-memory vs sin cacheVolumen inicial de búsquedasGeocodingGoogle Maps, Mapbox, OpenStreetMapCosto por request en MVPPDF generationPuppeteer, pdfmake, React-pdfPeso del bundle y calidad del output

19. Riesgos principales
RiesgoProbabilidadImpactoMitigaciónModelo atado rígidamente a EquinosMediaAltocargoType y capacityUnit desde el inicioPagos implementados antes de flujo estableMediaAltoPrimero validar oferta, búsqueda y reservaSobreventa de cupos por concurrenciaBajaMuy altoControl transaccional + test de concurrencia obligatorioWebhook duplicado genera doble efectoBajaMuy altoTabla WebhookEvent + idempotencyKey en PaymentPRs gigantes y arquitectura sobrediseñadaAltaMedioMódulos chicos, ADRs, foco en MVPPSP tarda en aprobar integraciónMediaAltoIniciar alta temprano, simular con sandbox

20. Criterio de arquitectura suficiente para MVP
La arquitectura está suficientemente bien si permite implementar de punta a punta este flujo:

transportista publica oferta
cliente encuentra oferta
cliente reserva
cliente paga seña
backend confirma pago correctamente
viaje registra evidencia mínima
operación cierra con comprobante y reputación