# Deuda técnica conocida

Decisiones provisionales tomadas durante el MVP con conciencia de que
representan un costo futuro. Ninguna de estas es un olvido — son compromisos
explícitos.

---

## Data fetching client-side en vez de RSC

**Qué:** el frontend hace data fetching en componentes cliente con hooks
custom (`use-*`), no en React Server Components con `fetch()` server-side.

**Por qué se aceptó:** simplifica el modelo mental durante el MVP y evita
complejidad con autenticación basada en cookies HttpOnly en Server Components.

**Costo futuro:** peor TTFB en páginas con datos críticos. Migrar a RSC
requiere refactorizar el modelo de autenticación en el frontend.

---

## Verificación de transportistas manual

**Qué:** el flujo de verificación es `INCOMPLETE → PENDING → VERIFIED/REJECTED`
con revisión manual por un admin a través del panel.

**Por qué se aceptó:** integrar un proveedor de KYC automático (ej. Jumio,
Truora) requiere alta comercial y tiempo de integración que no justifica el
MVP.

**Costo futuro:** no escala con volumen. En Fase 2 se reemplaza por KYC
automático con revisión manual solo en casos límite.

---

## Un solo PSP (Mercado Pago)

**Qué:** la integración de pagos asume Mercado Pago como único proveedor.

**Por qué se aceptó:** el mercado objetivo es Argentina. Mercado Pago tiene la
mayor penetración y el proceso de alta más conocido del equipo.

**Costo futuro:** la estructura del módulo `payments/` usa una capa de
repositorio y tipos abstractos — agregar un segundo PSP requiere implementar
el adaptador, no reescribir la lógica de negocio.

---

## Jobs síncronos en MVP

**Qué:** operaciones diferidas como generación de PDF y envío de emails se
ejecutan síncronamente en el request o se omiten por completo en el MVP.

**Por qué se aceptó:** configurar BullMQ con Redis añade infraestructura que
no está justificada mientras el volumen sea bajo.

**Costo futuro:** requests lentos cuando se active generación de PDF. Migrar a
BullMQ + Redis requiere agregar la infraestructura de colas y refactorizar los
servicios que hoy llaman directamente.

---

## Política de cancelación hardcodeada

**Qué:** no existe una entidad `CancelPolicy` activa. La lógica de cancelación
es fija en el código del servicio.

**Por qué se aceptó:** en el MVP solo existe una política (seña no reembolsable
si cancela el cliente). No vale el overhead de modelar políticas configurables.

**Costo futuro:** cuando los transportistas necesiten configurar sus propias
políticas (ej. reembolso parcial con X días de anticipación), requiere
modelar `CancelPolicy` en Prisma y migrar la lógica hardcodeada.

---

## `PasswordService.needsRehash()` no usado en login

**Qué:** existe lógica para detectar si un hash necesita ser actualizado
(cambio de costo bcrypt), pero no se llama en el flujo de login.

**Por qué se aceptó:** la migración transparente de hashes es un detalle de
operación que no afecta la funcionalidad del MVP.

**Costo futuro:** los hashes creados con configuración vieja no se actualizan
automáticamente. Activar requiere una línea en `AuthenticationService.login`.
