# Glosario de dominio

Términos del dominio de la plataforma de cupos y retornos para transporte,
vertical inicial Equinos.

---

## Entidades principales

**Account**
Identidad del sistema. Tiene un único rol: `CLIENT`, `TRANSPORTER` o `ADMIN`.
Un `Account` no es un perfil — es la credencial. El perfil extendido vive en
`UserProfile` (para clientes) o `TransporterProfile` (para transportistas).

**TransporterProfile**
Perfil extendido de un transportista. Contiene datos operativos
(`displayName`, `businessName`, `contactPhone`, `bio`, `maxDetourKmDefault`)
y el estado de verificación. No se crea vacío — se crea con estado `INCOMPLETE`
al registrar una cuenta `TRANSPORTER`.

**TripOffer**
Oferta de viaje publicada por un transportista. Define la ruta, fecha, trailer,
capacidad disponible y precio por unidad. Puede ser una oferta de ida o de
retorno (`isReturn = true`).

**Booking**
Reserva de cupos hecha por un cliente sobre una `TripOffer`. Congela el precio
al momento de reservar (`unitPriceSnapshot`). Su ciclo de vida va desde
`PENDING_PAYMENT` hasta `COMPLETED` o `CANCELLED`.

---

## Conceptos operativos

**Cupo**
Unidad de capacidad de un trailer disponible para reservar. En el MVP con
carga `EQUINE`, un cupo equivale a un lugar para un equino (`capacityUnit =
SLOT`).

**Retorno**
Oferta de viaje en sentido inverso a una oferta de ida. Se modela con
`isReturn = true` y `parentOfferId` apuntando a la oferta original. Permite
al transportista aprovechar el viaje de vuelta.

**Seña**
Pago inicial que confirma una reserva. Equivale al 30% del subtotal
(`depositAmount = 0.30 * subtotalAmount`). El tipo de pago en `Payment` es
`DEPOSIT`. Sin seña, el `Booking` permanece en `PENDING_PAYMENT`.

**Saldo**
Pago restante tras la seña. Tipo `BALANCE` en `Payment`. Se libera al
completar la entrega.

**Detour**
Desvío máximo que el transportista acepta hacer desde su ruta principal para
buscar o entregar carga. Se configura en `TransporterProfile.maxDetourKmDefault`
y se puede sobrescribir por oferta en `TripOffer.maxDetourKm`.

**Oferta de viaje**
Sinónimo de `TripOffer`. Se usa en el dominio para referirse a la publicación
del transportista en el marketplace.

---

## Estados de verificación del transportista

| Estado | Significado |
|--------|-------------|
| `INCOMPLETE` | El transportista no completó los datos mínimos del perfil. Estado inicial. |
| `PENDING` | Perfil completo, esperando revisión manual del admin. |
| `VERIFIED` | Admin aprobó el perfil. El transportista puede publicar ofertas. |
| `REJECTED` | Admin rechazó el perfil. Incluye nota de rechazo (`verificationNote`). |

---

## Tipos de carga y unidades

**cargoType**
Tipo de carga que transporta el trailer. En el MVP: `EQUINE`. El modelo
soporta múltiples rubros (`GENERAL_CARGO`, `FOOD`, `PEOPLE`) sin cambio de
arquitectura.

**capacityUnit**
Unidad en la que se mide la capacidad del trailer. En el MVP: `SLOT` (lugar
para un equino). Futuros rubros usan `KG`, `M3` o `SEAT`.

---

## Flujos de pago

**Webhook idempotente**
El PSP (Mercado Pago) puede reenviar el mismo evento varias veces. La
plataforma verifica si el `eventId` ya existe en `WebhookEvent` antes de
procesar. Si ya existe, responde `200` sin hacer nada. Esto garantiza que el
mismo evento no genere doble efecto.

**Idempotency key**
Clave única guardada en `Payment.idempotencyKey` para identificar un intento
de pago específico y evitar cargos duplicados.

---

## Operación del viaje

**Check-in**
Registro del inicio del viaje. El transportista sube una foto o evidencia.
Crea un `Proof` de tipo `CHECKIN_PHOTO`. Transiciona el `Booking` a
`IN_PROGRESS`.

**Check-out**
Registro de la entrega. Similar al check-in. Crea un `Proof` de tipo
`CHECKOUT_PHOTO`. Transiciona el `Booking` a `DELIVERED_PENDING_CONFIRMATION`.

**Proof**
Evidencia operativa asociada a un booking. Puede ser foto de check-in/out,
documento o comprobante de entrega.

**Comprobante**
PDF generado cuando el `Booking` pasa a `COMPLETED`. Incluye los datos del
viaje, los montos y referencias a las evidencias. Se guarda en storage (R2) y
se entrega al cliente y transportista.

---

## Disputas

**Dispute**
Conflicto abierto sobre una reserva. Solo puede abrirse cuando el booking está
en `IN_PROGRESS`, `DELIVERED_PENDING_CONFIRMATION` o `COMPLETED`. Un admin
lo resuelve a favor del cliente (reembolso) o del transportista (liberar pago).
