# AGENTS.md
<!-- version: 1.0 | última actualización: 11/03/2026| revisar si cambia stack, estados o zonas protegidas -->

## Propósito del proyecto

Este repositorio implementa una **plataforma de cupos y retornos para transporte**, con vertical inicial **Equinos**, pero con **core multi-rubro preparado** desde el día 1.

La propuesta de valor del producto es:

* reducir viajes vacíos / milla libre
* permitir publicar cupos y retornos
* reservar capacidad disponible
* operar con pago protegido
* dar trazabilidad mínima, comprobante y reputación

## Norte del MVP

Este MVP debe ser **vendible**, no experimental.

### Sí incluye

* registro/login con roles
* perfil de transportista
* verificación manual inicial
* carga de trailer/vehículo
* publicación de oferta de viaje
* búsqueda de ofertas por origen, destino, fecha y cupos
* reserva de cupos
* control transaccional para evitar sobreventa
* pago con seña usando PSP
* webhook idempotente
* evidencias de check-in y check-out
* confirmación de entrega
* reputación básica
* comprobante digital
* panel de pagos: retenido / disponible
* base preparada para multi-rubro

### No incluye en MVP

* tracking GPS complejo
* automatización KYC avanzada
* subasta compleja de cotizaciones
* multi-rubro activo en UI
* billetera propia
* token cripto
* automatizaciones sofisticadas no esenciales

## Principios del producto

* La UI del MVP expone solo **Equinos**.
* El modelo de dominio debe quedar preparado para otros rubros.
* No se debe hardcodear lógica de negocio que impida crecer a `FOOD`, `PEOPLE`, `GENERAL_CARGO` u otros.
* El sistema debe usar `cargo_type`, `capacity_unit` y estructuras extensibles desde el inicio.

## Stack oficial

### Frontend

* Next.js
* Tailwind CSS
* shadcn/ui

### Backend

* NestJS
* Prisma

### Base de datos

* PostgreSQL

### Storage

* Cloudflare R2 o S3 compatible

### Jobs

* BullMQ + Redis cuando sea necesario
* En MVP temprano se puede empezar sin colas, si no bloquea arquitectura futura

### Observabilidad

* Sentry free tier
* logs estructurados

### Pagos

* PSP externo
* no custodiar saldo dentro de la app
* usar webhooks idempotentes

## Estructura esperada del repo

```text
/
├─ README.md
├─ AGENTS.md
├─ CODEX_CONTEXT.md
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ .gitignore
├─ .editorconfig
├─ .prettierrc
├─ .eslintrc.cjs
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  │  ├─ epic.yml
│  │  ├─ feature.yml
│  │  ├─ bug.yml
│  │  └─ task.yml
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ workflows/
│     └─ ci.yml
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  ├─ config/
│  ├─ types/
│  ├─ ui/
│  └─ shared/
└─ docs/
   ├─ PRD.md
   ├─ backlog.md
   ├─ architecture.md
   ├─ governance.md
   ├─ api.md
   ├─ glossary.md
   ├─ runbook.md
   ├─ TECH_DEBT.md
   └─ decisions/
```

## Convenciones generales

* monorepo desde el inicio
* PRs chicos
* una tarea por PR
* evitar acoplamientos innecesarios entre frontend y backend
* preferir nombres explícitos sobre abreviaciones opacas
* mantener documentación viva y alineada con el código

## Convenciones de código

### Generales

* TypeScript estricto
* preferir tipos explícitos en módulos críticos
* evitar lógica de negocio en controladores o componentes de UI
* separar dominio, aplicación e infraestructura cuando el módulo lo justifique
* no introducir abstracciones complejas sin necesidad real

### Naming

* `PascalCase` para clases, DTOs, tipos y componentes
* `camelCase` para variables y funciones
* `SCREAMING_SNAKE_CASE` para constantes de configuración
* nombres de archivos consistentes con el estándar del framework

### Backend

* controladores delgados
* servicios con reglas de negocio
* acceso a DB encapsulado y testeable
* validar inputs server-side siempre
* estados de negocio centralizados y consistentes

### Frontend

* componentes presentacionales separados de lógica cuando tenga sentido
* formularios con validación clara
* no duplicar reglas críticas del backend como fuente de verdad
* priorizar UX clara, estados visibles y feedback de error útil

## Entidades núcleo del dominio

* User
* DriverProfile / TransportistaProfile
* Vehicle / Trailer
* TripOffer
* Booking
* Payment
* Proof
* Review
* Dispute
* CargoType
* CapacityUnit

## Estados base que deben respetarse

### Offer.status

* DRAFT
* PUBLISHED
* FULL
* CLOSED
* IN_PROGRESS
* COMPLETED
* CANCELLED

### Booking.status

* PENDING_PAYMENT
* CONFIRMED
* IN_PROGRESS
* DELIVERED_PENDING_CONFIRMATION
* COMPLETED
* CANCELLED
* DISPUTED

### Payment.status

* INITIATED
* HELD
* RELEASED
* REFUNDED
* DISPUTED
* FAILED

## Reglas críticas del producto

### Regla 1 — No billetera propia

La aplicación no custodia dinero como billetera interna.
Siempre se opera con PSP externo y estados sincronizados.

### Regla 2 — Pagos por webhook idempotente

Los webhooks de pago deben ser idempotentes.
Nunca asumir que un evento llega una sola vez.

### Regla 3 — No overbooking

Toda reserva debe consumir cupos con control transaccional.
Nunca confirmar una reserva si no hay capacidad disponible real.

### Regla 4 — Contacto restringido

Los datos de contacto completos y el chat libre se habilitan solo después de seña confirmada.

### Regla 5 — Multi-rubro preparado

La UI del MVP puede estar centrada en Equinos, pero el modelo no puede quedar bloqueado a Equinos.

### Regla 6 — Evidencia operativa

Check-in y check-out deben soportar evidencias y timeline visible.

## Zonas protegidas

Ningún agente debe modificar sin aprobación humana explícita:

* pagos
* webhooks de PSP
* auth
* permisos y roles
* migraciones destructivas
* políticas de cancelación sensibles
* configuración de producción
* workflows sensibles de CI/CD o deploy

## Regla para agentes

### Los agentes sí pueden

* proponer estructura de archivos
* implementar features acotadas
* refactorizar módulos no críticos
* escribir tests
* mejorar documentación
* preparar PRs pequeños
* sugerir ADRs

### Los agentes no pueden decidir por su cuenta

* pricing
* contratos legales
* políticas finales de negocio sensibles
* cambios destructivos de datos
* decisiones de seguridad sensibles
* cambios de arquitectura mayor sin ADR o aprobación
* modificar comportamiento de pagos sin aprobación explícita

## Comandos esperados del proyecto

Estos comandos deben existir y mantenerse funcionando a medida que el repo evolucione:

| Comando            | Cuándo usarlo                                      |
|--------------------|----------------------------------------------------|
| `pnpm install`     | Al clonar el repo o al agregar dependencias        |
| `pnpm dev`         | Durante desarrollo local                           |
| `pnpm build`       | Para validar que el build de producción no rompe   |
| `pnpm lint`        | Antes de abrir un PR                               |
| `pnpm typecheck`   | Antes de abrir un PR                               |
| `pnpm test`        | Después de cada cambio en módulos críticos         |

Si se agregan apps o packages, deben integrarse al workspace sin romper estos comandos base.

## Decisiones provisionales conocidas

Estas decisiones son válidas para el MVP pero deben revisarse antes de escalar:

* verificación de transportistas es manual (fase 2: KYC automatizado)
* jobs en DB para MVP temprano (fase 2: BullMQ + Redis)
* política de cancelación hardcodeada (fase 2: policy engine por cargo_type)
* un solo PSP (Mercado Pago); estructura debe permitir agregar otros sin reescritura

## Decisiones de arquitectura (ADRs)

Antes de proponer cambios estructurales, revisar `/docs/decisions/`.
Cada ADR tiene: contexto, opciones evaluadas, decisión tomada y consecuencias.

Si una tarea requiere una decisión que no está cubierta por un ADR existente,
proponer un nuevo ADR como parte del PR, no implementar sin él.

## Comportamiento ante ambigüedad

Si una tarea tiene más de una interpretación posible, el agente debe:

1. Identificar las interpretaciones posibles
2. Exponer cuál elegiría y por qué
3. Detenerse y pedir confirmación antes de implementar

El agente nunca debe resolver ambigüedad de negocio por su cuenta.
La ambigüedad técnica menor puede resolverse documentando la decisión en el PR.

## Definition of Done

Una tarea se considera terminada cuando:

* cumple el objetivo funcional definido
* respeta el alcance del issue
* no introduce lógica fuera del MVP sin aprobación
* pasa lint
* pasa typecheck
* pasa tests relevantes
* incluye manejo razonable de errores
* actualiza documentación si cambia comportamiento importante
* queda lista para review en un PR chico

## Gestión de secretos

* ningún secreto, token, API key o credencial puede aparecer en el código
* toda variable sensible vive en `.env` (nunca commiteada)
* el repo debe tener `.env.example` con todas las variables necesarias sin valores reales
* si un agente necesita un valor de configuración para implementar algo,
  debe referenciarlo como variable de entorno y documentarlo en `.env.example`
* ante duda sobre si algo es sensible: tratarlo como sensible

## Reglas de testing

### Nivel mínimo esperado

* unit tests para toda regla de negocio que involucre estado, dinero o permisos
* el happy path siempre testeado
* al menos 2 casos borde por módulo crítico
* integration test cuando hay transacción o concurrencia involucrada
* test de idempotencia en webhooks: el mismo evento procesado 2 veces
  no debe producir cambios distintos al procesarlo 1 vez

### Obligatorio testear en módulos críticos

* booking
* payments
* webhooks
* permisos
* lógica de estados

### Nivel mínimo esperado

* unit tests para reglas de negocio críticas
* integration tests cuando haya transacciones o concurrencia
* tests de idempotencia en webhooks de pago

### No conformidades

No marcar como listo un módulo crítico si:

* no tiene cobertura básica de reglas críticas
* no se probaron estados borde
* puede producir sobreventa o inconsistencias de pago

## Reglas de migraciones

* toda migración debe ser revisable y entendible
* no hacer migraciones destructivas sin aprobación explícita
* si una migración implica riesgo, documentarlo en el PR
* mantener nombres de migraciones claros

## Reglas de PR

* 1 PR = 1 propósito
* preferir PRs pequeños y revisables
* incluir contexto, alcance, riesgos y cómo testear
* si toca UI, adjuntar screenshots cuando aplique
* si toca dominio crítico, explicar decisión y casos borde

## Reglas de documentación

Actualizar documentación cuando cambie cualquiera de estos puntos:

* flujo de negocio
* estados
* arquitectura
* contratos API importantes
* políticas del producto

## Orden sugerido de ejecución del producto

1. E0 Foundations
2. E1 Auth base
3. E2 Transportista mínimo
4. E3 Crear oferta
5. E4 Búsqueda simple
6. E5 Booking con protección de cupos
7. E6 Pagos
8. E7 Operación del viaje
9. E9 Comprobante + reputación + disputas
10. E10 Green module

No arrancar por pagos, green o chat antes de validar el flujo base de oferta + búsqueda + booking.

## Criterio de comportamiento esperado para Codex

Cuando Codex trabaje en este repositorio debe:

* respetar el alcance exacto de la tarea
* no inventar features fuera del MVP
* no modificar zonas protegidas sin aprobación
* explicar decisiones no obvias
* dividir trabajo grande en pasos
* preferir claridad antes que sofisticación
* priorizar consistencia del negocio sobre velocidad de implementación

## Criterio de comportamiento para OpenClaw

OpenClaw debe usarse para:
* redactar y refinar issues a partir del backlog
* proponer milestones y orden de sprint
* generar checklists de QA por feature
* revisar PRs contra criterios del issue original
* generar release notes a partir de PRs mergeados

OpenClaw no debe:
* tomar decisiones de producto sin aprobación
* modificar código o contratos API
* mergear PRs
* acceder a datos de producción
* ejecutar comandos destructivos

Ante ambigüedad, OpenClaw pregunta. No asume.
