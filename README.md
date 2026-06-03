# Logística — Plataforma de Cupos y Retornos

Plataforma web para conectar clientes que necesitan trasladar carga con transportistas que tienen cupos disponibles o viajes de retorno.

El MVP inicial está enfocado en el transporte de equinos, pero la arquitectura está pensada desde el primer día para soportar otros rubros como alimentos, animales, carga general o personas sin reescribir el core del sistema.

---

## Objetivo del producto

El objetivo principal es reducir viajes vacíos, mejorar la ocupación de los transportistas y profesionalizar la contratación de traslados mediante:

- publicación de viajes con cupos disponibles;
- reserva de capacidad por parte del cliente;
- pago protegido con seña;
- trazabilidad mínima del traslado;
- comprobantes digitales;
- reputación y verificación de transportistas;
- métricas de eficiencia como cupos ocupados, retornos aprovechados y kilómetros vacíos evitados.

---

## Problema que resuelve

En muchos traslados, especialmente en el transporte de caballos, existen cupos libres o viajes de retorno que no se aprovechan. Esto genera costos altos, viajes vacíos, coordinación informal por WhatsApp, poca trazabilidad, riesgo de cancelaciones y problemas de cobro.

Esta plataforma busca convertir ese proceso informal en un flujo digital más seguro, ordenado y medible.

---

## Propuesta de valor

Para clientes:

- encontrar transporte confiable de forma más rápida;
- reservar cupos disponibles;
- pagar con protección;
- seguir el estado del traslado;
- recibir comprobantes digitales;
- calificar al transportista.

Para transportistas:

- llenar cupos vacíos;
- publicar retornos;
- mejorar la ocupación de sus viajes;
- cobrar con menor riesgo;
- ordenar reservas, pagos y evidencias;
- construir reputación profesional.

---

## Alcance del MVP

El MVP incluye las funcionalidades necesarias para cerrar un flujo real de negocio:

- registro y login con roles;
- roles base: cliente, transportista y administrador;
- onboarding de transportista;
- verificación manual inicial;
- carga de vehículo o trailer;
- publicación de ofertas de viaje;
- búsqueda de ofertas por origen, destino, fecha y cupos;
- reserva de cupos;
- control transaccional para evitar sobreventa;
- pago con seña mediante PSP externo;
- webhook de pago idempotente;
- chat interno con restricción anti-puenteo;
- check-in y check-out con evidencias;
- confirmación de entrega;
- reputación básica;
- comprobante digital en PDF;
- panel de pagos con estados retenido, disponible o en disputa;
- base preparada para multi-rubro.

---

## Fuera de alcance del MVP

Para mantener el producto realista y vendible, el MVP no incluye:

- tracking GPS avanzado;
- KYC automatizado;
- subastas o cotizaciones complejas;
- billetera propia;
- token cripto;
- multi-rubro visible en UI;
- integraciones contables o ERP;
- automatizaciones sofisticadas no esenciales.

---

## Flujo principal del cliente

1. El cliente crea una solicitud de traslado.
2. Busca ofertas compatibles por ruta, fecha y cupos.
3. Revisa detalle, precio, reputación y condiciones.
4. Reserva cupos.
5. Paga una seña protegida.
6. Sigue el traslado desde un timeline.
7. Confirma la entrega.
8. Descarga el comprobante.
9. Califica al transportista.

---

## Flujo principal del transportista

1. El transportista se registra.
2. Completa su perfil y verificación.
3. Carga su vehículo o trailer.
4. Publica una oferta de viaje con cupos disponibles.
5. Recibe reservas confirmadas.
6. Realiza check-in y check-out con evidencias.
7. Finaliza el traslado.
8. Cobra el pago cuando corresponde.
9. Califica al cliente.

---

## Reglas de negocio principales

### Reservas y cupos

Una oferta puede tener múltiples reservas.  
Los cupos nunca deben sobrevenderse.  
La reserva de cupos debe resolverse mediante transacciones de base de datos.

### Pagos

La plataforma no custodia dinero directamente.  
Los pagos se delegan a un PSP externo.  
El sistema solo gestiona estados de pago como iniciado, retenido, liberado, reembolsado o en disputa.

### Contacto

El contacto completo entre cliente y transportista se habilita solamente después de una reserva confirmada con seña.

### Disputas

Una disputa congela el estado del pago y habilita intervención manual de administración.

---

## Estados principales

### Booking

- `PENDING_PAYMENT`
- `CONFIRMED`
- `IN_PROGRESS`
- `DELIVERED_PENDING_CONFIRMATION`
- `COMPLETED`
- `CANCELLED`
- `DISPUTED`

### Offer

- `DRAFT`
- `PUBLISHED`
- `FULL`
- `CLOSED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### Payment

- `INITIATED`
- `HELD`
- `RELEASED`
- `REFUNDED`
- `DISPUTED`
- `FAILED`

---

## Arquitectura del producto

El sistema está diseñado como una plataforma multi-rubro, aunque el MVP muestre solamente equinos.

Entidades núcleo:

- `User`
- `DriverProfile`
- `Vehicle`
- `TripOffer`
- `Booking`
- `Payment`
- `Proof`
- `Review`
- `Dispute`
- `CargoType`
- `CapacityUnit`

La idea central es que “equinos” sea una configuración inicial, no una limitación estructural.

Ejemplo:

```ts
cargo_type = "EQUINE";
capacity_unit = "SLOT";
