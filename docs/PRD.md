# PRD

## MVP profesional

**Plataforma de cupos y retornos para transporte**
Vertical inicial: **Equinos**

## 1. Resumen ejecutivo

Aplicación que conecta clientes que necesitan trasladar caballos con transportistas verificados, permitiendo compartir viajes por cupos, llenar retornos y reducir la milla libre.

El MVP incluye:

* pago protegido con seña
* trazabilidad mínima con check-in y check-out con evidencia
* comprobante digital
* reputación entre las partes

La meta no es construir un sistema logístico total, sino un producto enfocado, vendible y operable.

## 2. Problema

El transporte de equinos en Argentina opera mayormente por canales
informales (WhatsApp, contactos directos). Esto genera:

* viajes de retorno vacíos frecuentes → costo directo para el transportista
* sin trazabilidad → sin evidencia en caso de conflicto
* coordinación manual → tiempo perdido y cancelaciones de último momento
* pagos sin protección → riesgo de no cobro o no prestación del servicio

**Hipótesis central:** un transportista con trailer de 4 cupos que hace
2 viajes por semana pierde en promedio entre 1 y 2 cupos por viaje en
retorno. Si puede vender esos cupos, aumenta ingresos sin aumentar costos.

**Validación mínima esperada:** 10 transportistas activos en los primeros
60 días que publiquen al menos una oferta y cierren al menos una reserva.

## 3. Objetivos del MVP

## 3. Objetivos del MVP

| Objetivo | Indicador de éxito |
|---|---|
| Reducir milla libre | Al menos el 30% de las ofertas publican retorno disponible |
| Aumentar confianza | Rating promedio de transportistas ≥ 4.0 en primeras 50 operaciones |
| Cerrar flujo completo | 20 operaciones end-to-end cerradas sin intervención manual de soporte |

## 4. Público objetivo

### Cliente primario del MVP

Para el MVP, el cliente objetivo principal es el **dueño o administrador
de caballos que necesita mover entre 1 y 4 animales de forma puntual**,
ya sea para eventos, competencias o traslados entre establecimientos.

Este perfil tiene urgencia real, presupuesto definido y tolerancia baja
al caos operativo. Es el más fácil de convertir en early adopter.

Perfiles secundarios (para fases posteriores):
* studs / haras con necesidad recurrente
* veterinarias con necesidad esporádica
* organizadores de eventos con volumen alto

### Cliente

* dueños o administradores de caballos
* studs / haras
* veterinarias
* centros ecuestres
* organizadores de eventos

### Transportista

* transportistas independientes
* pequeñas empresas con trailers de 2 a 5 cupos
* con posibilidad de escalar a operaciones mayores más adelante

## 5. Propuesta de valor

### Para clientes

* transporte más confiable
* pago protegido
* estado visible del traslado

### Para transportistas

* más ocupación en ida y retorno
* menos riesgo de no cobro
* agenda más ordenada

### Para la plataforma

* monetización por suscripción Pro
* fee por operación

## 6. Alcance funcional del MVP

### 6.1 Onboarding y verificación del transportista

Incluye:

* registro de transportista
* carga de documentos

  * DNI + selfie
  * licencia
  * patente
  * fotos del trailer/vehículo
  * seguro o habilitación
* estado de verificación:

  * Pendiente
  * Verificado
  * Rechazado con motivo

Para el MVP, la verificación será **manual por admin**.

### 6.2 Gestión de vehículo / trailer

Permite crear y editar trailer con:

* capacidad total en `SLOTS`
* tipo de trailer
* fotos

### 6.3 Publicación de oferta

El transportista puede crear una `TripOffer` con:

* origen y destino con coordenadas
* fecha exacta o rango horario
* cupos disponibles
* precio por cupo
* desvío máximo en km
* condiciones o notas
* política de cancelación simple

### 6.4 Búsqueda y exploración

El cliente puede crear un nuevo traslado con:

* origen
* destino
* fecha exacta o rango
* cupos requeridos

Debe ver resultados con filtros por:

* transportistas verificados
* cupos mínimos
* precio
* desvío máximo

Y orden por:

* cercanía
* precio
* rating

### 6.5 Reserva por cupos y pago protegido

**Porcentaje de seña:** 30% del total de la operación (configurable por
admin en el futuro, fijo en 30% para el MVP).

**Momento del saldo:** antes de la salida del viaje. El transportista
puede ver si el saldo fue pagado antes de confirmar el check-in.

**Flujo de dinero:**
1. cliente paga seña → PSP captura y retiene (HELD)
2. cliente paga saldo → PSP captura y retiene (HELD)
3. cliente confirma entrega → PSP libera total al transportista (RELEASED)
4. si hay disputa → pago queda HELD hasta resolución manual

**Política de cancelación base:**
* cancelación con más de 48h de anticipación: reembolso total
* cancelación entre 24h y 48h: reembolso del 50% de la seña
* cancelación con menos de 24h: sin reembolso de seña

Esta política es la base del MVP. En el futuro se podrá configurar
por oferta o por rubro.

### 6.6 Chat interno

**Antes de seña confirmada:**
* el cliente puede enviar mensajes al transportista
* el transportista puede responder
* el sistema filtra automáticamente o bloquea el envío de
  teléfonos, emails y links externos
* ninguna parte ve los datos de contacto del otro

**Después de seña confirmada:**
* chat libre sin restricciones de contenido
* se habilita el teléfono del transportista en la interfaz
* ambas partes pueden compartir lo que necesiten

**Nota para el MVP:** el filtro de contacto puede ser simple
(regex sobre números y @) y mejorarse después. Lo importante
es que la restricción exista desde el inicio.

### 6.7 Operación del viaje

Incluye:

* check-in con foto y confirmación
* check-out con foto y confirmación
* timeline visible de estados del viaje

### 6.8 Confirmación de entrega y reputación

Incluye:

* confirmación de entrega por parte del cliente
* calificación mutua entre transportista y cliente
* comentario opcional

### 6.9 Comprobante digital

Generación automática de PDF con:

* datos de reserva
* ruta
* fecha
* cupos
* partes
* monto

Debe poder descargarse desde el detalle de la reserva.

### 6.10 Disputas básicas

Incluye:

* botón “Reportar problema”
* congelamiento del pago manteniendo estado `HELD`
* intervención manual de admin

## 7. Fuera de alcance del MVP

No incluye en esta etapa:

* cotizaciones o subasta sobre pedidos
* tracking GPS avanzado
* KYC automatizado
* multi-rubro operativo en UI
* integraciones contables o ERP
* billetera propia
* automatizaciones sofisticadas no esenciales

## 8. Pantallas del MVP

### Prioridad 1 — Flujo mínimo funcional (sin esto no hay MVP)

**Cliente:**
* login / registro
* nuevo traslado (form de búsqueda)
* resultados
* detalle de oferta
* checkout de seña
* detalle de reserva con timeline

**Transportista:**
* login / registro con rol
* publicar oferta
* mis ofertas / reservas
* operación del viaje (check-in / check-out)
* panel de pagos básico

### Prioridad 2 — Necesario para vender pero no para operar

* dashboard transportista con KPIs
* onboarding documental completo
* comprobante descargable
* calificación mutua

### Prioridad 3 — Deseable pero diferible

* landing page
* home cliente con tips
* panel admin completo
* historial detallado de pagos

## 9. Estados y reglas de negocio

### `Booking.status`

* `PENDING_PAYMENT`
* `CONFIRMED`
* `IN_PROGRESS`
* `DELIVERED_PENDING_CONFIRMATION`
* `COMPLETED`
* `CANCELLED`
* `DISPUTED`

### `Offer.status`

* `DRAFT`
* `PUBLISHED`
* `FULL`
* `CLOSED`
* `IN_PROGRESS`
* `COMPLETED`

### `Payment.status`

* `INITIATED`
* `HELD`
* `RELEASED`
* `REFUNDED`
* `DISPUTED`

### Reglas clave

* la reserva debe descontar cupos de forma transaccional
* no puede haber overbooking
* el contacto se habilita solo después de la seña
* la cancelación usa plantillas simples, por ejemplo 24h o 48h

## 10. Multi-rubro preparado

Aunque el MVP opere solo en Equinos, la arquitectura debe contemplar:

* `cargo_type` con `EQUINE` ahora y otros después
* `capacity_unit` con `SLOT` ahora y luego `KG`, `M3` o `SEAT`
* `cargo_spec.attributes` como JSON extensible

En la UI del MVP, el tipo de carga queda fijo en Equinos.

## 11. Monetización

### Para el MVP

El MVP opera con un modelo simplificado:

* todos los transportistas comienzan en **Free**
* el plan **Pro** existe en el sistema pero no se cobra aún
* se puede simular la diferencia de visibilidad internamente

**Decisión de MVP:** no implementar cobro de suscripción en la primera
versión. El foco es validar el flujo operativo. La suscripción Pro se
activa en la siguiente fase.

### Estructura futura de planes

| Feature | Free | Pro | Empresa |
|---|---|---|---|
| Publicar ofertas | Hasta 5/mes | Ilimitado | Ilimitado |
| Prioridad en resultados | No | Sí | Sí |
| Feed de retornos | No | Sí | Sí |
| Reportes | No | Básico | Avanzado |
| Multi-chofer | No | No | Sí |

### Fee por operación

En el MVP, el fee puede estar incluido en el precio o no aplicarse.
Definir antes del primer piloto real con usuario pagador.

## 12. Métricas de éxito del MVP

| Métrica | Frecuencia | Objetivo inicial |
|---|---|---|
| Ofertas que completan cupos | Semanal | > 40% |
| Reservas cerradas | Semanal | Crecimiento semana a semana |
| Tiempo medio para encontrar transporte | Mensual | < 48h desde publicación |
| Tasa de cancelación | Mensual | < 20% |
| Tasa de disputas | Mensual | < 5% |
| Rating promedio transportistas | Mensual | ≥ 4.0 sobre 5 |

Estas métricas se revisan al final de cada sprint. Si alguna está
fuera de rango, tiene prioridad de análisis antes de agregar features nuevas.

## 13. Criterio de MVP listo para vender

El MVP está listo para vender si ya funciona de punta a punta este flujo:

* buscar transporte
* reservar cupos
* pagar seña
* ver timeline del viaje
* cerrar con comprobante
* liberar pago según estado

Además, debe incluir como mínimo:

* transportistas verificados manualmente
* chat interno
* check-in y check-out
* confirmación de entrega
* comprobante digital
* panel de pagos retenido / disponible

## 14. Definición práctica de demo vendible

La demo tiene que mostrar un flujo serio, claro y completo:

**buscar → reservar → seña → timeline → comprobante → pago liberado**

Ese recorrido es el que convierte al MVP en un producto que se puede presentar, vender y pilotear con confianza.

## 15. Riesgos principales del MVP

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| PSP rechaza integración o tarda en aprobar | Media | Alto | Iniciar proceso de alta temprano, tener fallback manual |
| Transportistas no adoptan verificación manual | Media | Alto | Simplificar el proceso al mínimo, acompañar onboarding |
| Overbooking por bug de concurrencia | Baja | Muy alto | Tests de concurrencia obligatorios antes de producción |
| Webhook duplicado genera doble cobro | Baja | Muy alto | Idempotencia desde el primer deploy |
| Usuario usa WhatsApp para puentear la plataforma | Alta | Medio | Restricción de contacto + valor real post-seña |