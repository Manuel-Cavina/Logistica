# CODEX_CONTEXT.md

## Qué es este proyecto

Este proyecto construye una plataforma de logística para publicar, descubrir y reservar **cupos y retornos de transporte**.

La vertical inicial del MVP es **Equinos**, pero el sistema debe quedar preparado desde el inicio para soportar otros rubros sin rehacer el core.

La idea principal del producto es reducir viajes vacíos, mejorar la ocupación de capacidad disponible y darle a transportistas y clientes una forma simple de operar reservas con pago protegido, trazabilidad mínima y reputación.

## Objetivo del MVP

Validar un producto vendible que permita:

* que un transportista publique un viaje con cupos disponibles
* que un cliente encuentre una oferta adecuada
* que reserve capacidad
* que pague una seña mediante PSP
* que el viaje se opere con evidencia básica
* que ambas partes cierren la operación con comprobante y reputación

No estamos construyendo un sistema logístico total ni un TMS completo.
Estamos construyendo un MVP enfocado, operable y comercializable.

## Vertical inicial y diseño futuro

### Vertical activa en el MVP

* Equinos

### Diseño requerido del core

Aunque la UI del MVP esté centrada en Equinos, el dominio debe quedar preparado para soportar luego otros tipos de carga, por ejemplo:

* FOOD
* PEOPLE
* GENERAL_CARGO
* MOTO
* VEHICLE

Por eso no se debe modelar el negocio de forma rígida alrededor de equinos solamente.

Desde el inicio debe existir una base extensible con conceptos como:

* `cargoType`
* `capacityUnit`
* atributos específicos por rubro

## Qué sí entra en el MVP

* auth con roles base
* perfil de transportista
* verificación manual inicial
* carga de trailer / vehículo
* creación de oferta de viaje
* búsqueda de ofertas
* detalle de oferta
* reserva de cupos
* control anti-overbooking
* seña con PSP
* webhooks idempotentes
* check-in / check-out con evidencia
* confirmación de entrega
* comprobante digital
* reputación básica
* panel básico de pagos y estado de operación

## Qué no entra en el MVP

* tracking GPS complejo
* optimización automática de rutas avanzada
* KYC automatizado complejo
* subastas complejas
* multi-rubro visible en UI
* billetera propia
* marketplace financiero
* tokenización / cripto
* automatizaciones no esenciales

## Entidades núcleo

Las entidades base del dominio son:

* `User`
* `TransportistaProfile`
* `Vehicle`
* `Trailer`
* `TripOffer`
* `Booking`
* `Payment`
* `Proof`
* `Review`
* `Dispute`
* `CargoType`
* `CapacityUnit`

Puede haber ajustes de naming, pero el dominio no debe perder estas piezas.

## Flujo base del negocio

1. un transportista crea su perfil
2. carga vehículo / trailer
3. publica una oferta de viaje con origen, destino, fecha, capacidad y condiciones
4. un cliente busca ofertas
5. ve detalle y reserva cupos
6. paga una seña mediante PSP
7. si el pago se confirma, la reserva pasa a confirmada
8. se habilita la operación del viaje
9. se registran evidencias de check-in y check-out
10. se confirma entrega
11. se genera comprobante
12. ambas partes pueden dejar reputación

## Reglas críticas del negocio

### 1. No billetera propia

La plataforma no debe custodiar dinero como billetera interna.
Los estados monetarios dependen del PSP y de la lógica de negocio asociada.

### 2. Webhooks idempotentes

El backend debe asumir que un webhook puede llegar más de una vez.
Nunca debe producir doble aplicación de efectos.

### 3. No sobreventa

**Por qué existe:** si dos usuarios reservan el último cupo al mismo tiempo
sin control transaccional, ambas reservas pueden quedar confirmadas
con capacidad inexistente. Eso rompe la confianza del producto y genera
disputas manuales difíciles de resolver.

**Implementación requerida:** el decremento de `availableSlots` y la
verificación de disponibilidad deben ocurrir dentro de la misma transacción
de base de datos. Un check a nivel aplicación antes de la transacción
no es suficiente

### 4. Contacto restringido antes de la seña

El acceso libre al contacto entre partes debe estar restringido hasta que exista señal operativa suficiente, idealmente luego de una seña confirmada.

### 5. Evidencia mínima operativa

La operación debe dejar trazabilidad mínima mediante pruebas de carga/entrega o estados equivalentes.

### 6. Multi-rubro preparado

Aunque Equinos sea la vertical activa, el core no debe quedar atado a campos rígidos exclusivos de esa vertical.

## Estados base

### `TripOffer.status`

* `DRAFT`
* `PUBLISHED`
* `FULL`
* `CLOSED`
* `IN_PROGRESS`
* `COMPLETED`
* `CANCELLED`

### `Booking.status`

* `PENDING_PAYMENT`
* `CONFIRMED`
* `IN_PROGRESS`
* `DELIVERED_PENDING_CONFIRMATION`
* `COMPLETED`
* `CANCELLED`
* `DISPUTED`

### `Payment.status`

* `INITIATED`
* `HELD`
* `RELEASED`
* `REFUNDED`
* `DISPUTED`
* `FAILED`

## Transiciones de estado válidas

### TripOffer
DRAFT → PUBLISHED
PUBLISHED → FULL (automático cuando availableSlots = 0)
PUBLISHED → CLOSED (manual por transportista)
PUBLISHED → IN_PROGRESS (cuando inicia el viaje)
IN_PROGRESS → COMPLETED
PUBLISHED → CANCELLED
FULL → PUBLISHED (si se libera un cupo por cancelación)

### Booking
PENDING_PAYMENT → CONFIRMED (webhook de seña exitosa)
PENDING_PAYMENT → CANCELLED (timeout o pago fallido)
CONFIRMED → IN_PROGRESS (check-in)
IN_PROGRESS → DELIVERED_PENDING_CONFIRMATION (check-out)
DELIVERED_PENDING_CONFIRMATION → COMPLETED (confirmación cliente)
DELIVERED_PENDING_CONFIRMATION → DISPUTED (reporte de problema)
CONFIRMED → CANCELLED (cancelación antes de inicio)
DISPUTED → COMPLETED (resolución a favor de transportista)
DISPUTED → REFUNDED (resolución a favor de cliente)

### Payment
INITIATED → HELD (seña capturada por PSP)
HELD → RELEASED (entrega confirmada)
HELD → REFUNDED (cancelación o disputa resuelta a favor cliente)
HELD → DISPUTED (reporte de problema)
INITIATED → FAILED (fallo PSP)

## Arquitectura esperada

### Frontend

* `apps/web` con Next.js
* UI clara, simple y orientada al flujo principal
* formularios y estados visibles

### Backend

* `apps/api` con NestJS
* reglas de negocio en servicios
* validación server-side
* endpoints consistentes

### Datos

* PostgreSQL con Prisma
* modelo preparado para crecimiento multi-rubro

### Storage

* R2 o S3 compatible para evidencias y comprobantes

### Observabilidad

* logs estructurados
* Sentry en módulos importantes

### Jobs

* BullMQ + Redis cuando realmente haga falta
* no introducir colas antes de tiempo si complica el MVP

## Módulos iniciales esperados

Los primeros módulos razonables del sistema son:

* auth
* users / profiles
* vehicles / trailers
* trip-offers
* search
* bookings
* payments
* proofs
* reviews
* disputes

## Responsabilidad de cada módulo

| Módulo | Responsabilidad principal |
|---|---|
| `auth` | registro, login, sesión, guards de acceso |
| `users/profiles` | datos del usuario, rol, estado de verificación |
| `vehicles/trailers` | CRUD de vehículos y trailers del transportista |
| `trip-offers` | publicación, edición, estado y búsqueda de ofertas |
| `search` | lógica de filtrado y ranking de ofertas para el cliente |
| `bookings` | reserva de cupos, control anti-overbooking, estados |
| `payments` | integración PSP, webhook idempotente, estados de pago |
| `proofs` | upload de evidencias, check-in/out, timeline |
| `reviews` | calificaciones de ambas partes al cerrar operación |
| `disputes` | reporte de problema, congelamiento de pago, resolución manual |

## Contratos entre módulos

* `bookings` consume `trip-offers` para verificar disponibilidad,
  pero no debe implementar lógica de oferta dentro de sí mismo
* `payments` es notificado por webhooks externos y actualiza
  su propio estado; luego `bookings` reacciona al estado del pago,
  no al revés
* `proofs` pertenece a un `booking` específico y no debe
  tener lógica de negocio de reserva
* `reviews` solo se habilitan cuando el `booking` está en COMPLETED
* `disputes` congela el `payment` asociado al `booking`; la resolución
  es siempre manual en el MVP
* `search` no debe modificar estado de ninguna entidad;
  es read-only sobre `trip-offers`

## Orden sugerido de implementación

1. foundations
2. auth
3. perfil transportista
4. vehículos / trailers
5. crear oferta
6. buscar ofertas
7. booking con anti-overbooking
8. pagos
9. operación del viaje
10. comprobante / reputación / disputas
11. módulo green

## Restricciones que Codex debe respetar

Codex no debe:

* inventar features fuera del MVP
* endurecer el modelo solo para Equinos
* tocar pagos sin aprobación explícita
* modificar auth o permisos sensibles sin aprobación
* crear abstracciones grandes sin necesidad
* introducir complejidad arquitectónica innecesaria

## Convenciones de API

### Formato de respuesta exitosa
```json
{
  "data": { ... },
  "meta": { "timestamp": "..." }
}
```

### Formato de error
```json
{
  "error": {
    "code": "BOOKING_SLOTS_UNAVAILABLE",
    "message": "No hay cupos disponibles para esta oferta",
    "statusCode": 409
  }
}
```

### Reglas
* errores de negocio con código semántico, no solo HTTP status
* nunca exponer stack traces en producción
* paginación consistente cuando aplique: `{ data, total, page, limit }`
* campos nulos preferidos sobre campos ausentes en respuestas

## Qué priorizar al implementar

Codex debe priorizar:

* claridad
* coherencia de negocio
* extensibilidad razonable
* PRs chicos
* tests en booking / payments / webhooks
* documentación alineada con cambios importantes

## Patrones a evitar

Evitar especialmente:

* lógica de negocio crítica en componentes UI
* controladores gordos
* acoplamiento fuerte entre UI y esquema interno de DB
* enums o campos cerrados que bloqueen multi-rubro
* side effects no idempotentes en pagos
* features “nice to have” antes del flujo principal

## Organización interna del backend (apps/api)

Cada módulo sigue esta estructura:
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
```

Regla: la lógica de negocio vive en el service.
El controller no toma decisiones de negocio.
El repository no tiene lógica de negocio.

## Roles y permisos base

| Rol | Puede hacer |
|---|---|
| `CLIENT` | buscar ofertas, reservar, pagar, confirmar entrega, calificar |
| `DRIVER` | publicar ofertas, gestionar reservas, hacer check-in/out, ver pagos |
| `ADMIN` | verificar transportistas, resolver disputas, ver todo |

### Reglas de acceso
* un usuario no puede acceder a recursos de otro usuario del mismo rol
* un DRIVER no puede reservar en su propia oferta
* un CLIENT no puede hacer check-in/out
* ADMIN tiene acceso de solo lectura a operaciones en curso salvo en disputas

## Glosario de dominio

| Término | Definición en este sistema |
|---|---|
| **Cupo** | unidad de capacidad reservable en una oferta (ej: 1 caballo) |
| **Oferta** | viaje publicado por un transportista con capacidad disponible |
| **Retorno** | oferta publicada para el viaje de regreso de un transportista |
| **Seña** | pago parcial inicial (20-30%) que confirma la reserva |
| **Saldo** | monto restante a pagar, generalmente antes de la salida |
| **Check-in** | registro de carga con evidencia al inicio del viaje |
| **Check-out** | registro de entrega con evidencia al final del viaje |
| **Milla libre** | tramo de viaje realizado sin carga (lo que este producto evita) |
| **Disputa** | conflicto abierto que congela el pago hasta resolución manual |
| **Comprobante** | PDF generado al cerrar la operación con todos los datos |

## Definición práctica del éxito inicial

El MVP está bien encaminado si permite completar este flujo de punta a punta:

* transportista publica oferta
* cliente encuentra oferta con filtros básicos
* cliente reserva cupos
* cliente paga seña
* reserva queda confirmada **sin posibilidad de sobreventa**
* viaje registra evidencia mínima
* operación cierra con comprobante y reputación

### Criterios de calidad mínimos para considerar el flujo válido

* el flujo funciona con dos usuarios simultáneos intentando el último cupo
* un webhook duplicado no produce doble confirmación
* un pago fallido no deja el booking en estado inconsistente
* el comprobante se genera correctamente con los datos del booking cerrado
