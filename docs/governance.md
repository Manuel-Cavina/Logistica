Governance
<!-- version: 1.0 | última actualización: 2026-03-13 | revisar si cambian reglas de trabajo, zonas críticas o uso de agentes -->
1. Objetivo
Definir reglas simples y claras para trabajar este proyecto sin desorden, retrabajo ni decisiones inconsistentes.
Este documento aplica a:

desarrollo
documentación
revisión
uso de agentes
cambios de arquitectura
manejo de módulos críticos


2. Principios de trabajo
2.1 MVP primero
Toda decisión debe favorecer llegar antes a un MVP vendible y operable.
2.2 Claridad antes que complejidad
Se prioriza código claro, modular y entendible.
2.3 PRs chicos
Se evita acumular cambios grandes y difíciles de revisar.
2.4 Documentación viva
Si cambia algo importante del producto o de la arquitectura, se actualiza la documentación en el mismo PR que produce el cambio.
2.5 Revisión fuerte en zonas críticas
Pagos, booking, auth, permisos y webhooks requieren más cuidado que el resto.
2.6 Deuda técnica registrada
La deuda técnica no se esconde. Se registra, se prioriza y se paga en tiempo real.
2.7 Ambigüedad resuelta antes de implementar
Si una tarea tiene más de una interpretación posible, se aclara antes de arrancar. No se implementa sobre supuestos.

3. Branching
Modelo simple recomendado:

main → rama estable, protegida
develop → rama de integración
feature/<id>-<slug> → nuevas funcionalidades
fix/<id>-<slug> → correcciones
chore/<slug> → tareas técnicas o mantenimiento
docs/<slug> → cambios de documentación

Ejemplos:

feature/12-auth-base
feature/34-create-trip-offer
fix/45-booking-capacity-check
docs/update-architecture

Reglas de ramas

nunca trabajar directo en main ni en develop
toda rama sale de develop
toda rama se mergea a develop via PR
main solo recibe merges desde develop en releases

Branch protection requerida en main y develop

PR obligatorio antes de mergear
status checks obligatorios (lint, typecheck, tests)
sin force push
sin borrado de rama protegida


4. Reglas de Pull Requests
4.1 Propósito único
Cada PR debe tener un solo propósito claro.
No mezclar en un mismo PR:

auth + pagos
UI + refactor grande no relacionado
documentación + lógica crítica no conectada

4.2 Qué debe incluir un PR
Todo PR debe explicar:

qué cambia
por qué cambia
alcance
riesgos
cómo probarlo

4.3 Tamaño recomendado
Preferir PRs:

chicos y revisables en poco tiempo
acotados a una feature o ajuste concreto
menos de 400 líneas netas de cambio como referencia

Si el PR empieza a crecer, dividirlo antes de abrirlo.
4.4 Screenshots
Si el PR toca UI, agregar screenshots o explicación visual cuando aporte claridad.
4.5 Cierre de issue
Todo PR debe referenciar el issue que cierra.
Formato: Closes #<número>
4.6 No mergeado sin criterios de aceptación cumplidos
Un PR que no tiene criterios de aceptación definidos en el issue no entra al ciclo de implementación.

5. Definition of Done
Una tarea se considera terminada cuando:

cumple el objetivo funcional definido en el issue
respeta el alcance definido
no rompe el flujo principal
no introduce regresiones en módulos existentes
pasa lint
pasa typecheck
pasa tests relevantes
tiene manejo razonable de errores
está documentada si cambió algo importante
queda lista para review en un PR chico


6. Testing
6.1 Testing obligatorio en módulos críticos
Es obligatorio agregar tests en:

booking
payments
webhooks
auth
permisos
transiciones de estado importantes

6.2 Testing mínimo esperado

unit tests para toda regla de negocio que involucre estado, dinero o permisos
el happy path siempre testeado
al menos dos casos borde por módulo crítico
integration tests donde haya transacciones o concurrencia
test de idempotencia en webhooks: el mismo evento procesado dos veces no debe producir cambios distintos al procesarlo una vez

6.3 No se considera listo si

puede haber overbooking
un webhook puede duplicar efectos
hay cambios de permisos no probados
el flujo monetario depende solo del frontend
no se probaron los estados borde del módulo


7. ADRs
Se deben crear ADRs cuando se tome una decisión importante de arquitectura.
Ejemplos de cuándo crear uno:

estrategia de auth
integración con PSP
diseño anti-overbooking
storage de archivos
estrategia multi-rubro
colas y jobs
cualquier decisión que sea difícil de revertir

Formato sugerido

contexto
decisión tomada
alternativas consideradas
consecuencias

Ubicación
docs/decisions/
Ejemplos de nombres

001-monorepo.md
002-auth-strategy.md
003-payments-psp-escrow.md
004-booking-anti-overbooking.md

Regla
Si una tarea requiere una decisión que no está cubierta por un ADR existente, proponer el ADR como parte del PR. No implementar sin él cuando la decisión sea relevante.

8. Revisión humana obligatoria
Estos cambios requieren revisión humana sí o sí, sin excepción:

pagos
webhooks
auth
permisos y roles
migraciones destructivas
políticas de cancelación
lógica de liberación o retención de dinero
cambios grandes de arquitectura
configuración sensible de producción
modificación de zonas protegidas definidas en AGENTS.md


9. Gestión de secretos

ningún secreto, token, API key o credencial puede aparecer en el código
toda variable sensible vive en .env y nunca se commitea
el repo siempre tiene .env.example con todas las variables necesarias sin valores reales
si una tarea nueva requiere una variable de entorno, debe agregarla al .env.example en el mismo PR
ante duda sobre si algo es sensible: tratarlo como sensible


10. Uso de Codex
Codex se usa para:

scaffold técnico
implementación de features acotadas
refactors controlados
tests
documentación técnica
preparación de PRs

Codex no debe decidir por su cuenta

pricing
políticas sensibles del negocio
cambios críticos de seguridad
arquitectura mayor sin aprobación
reglas de pagos sin aprobación explícita

Cómo pedirle trabajo a Codex
Toda tarea para Codex debe incluir:

contexto del repo y archivos relevantes
objetivo concreto y acotado
criterios de aceptación verificables
restricciones explícitas de qué no debe tocar

Comportamiento ante ambigüedad
Si una tarea tiene más de una interpretación posible, Codex debe exponer las opciones y detenerse para pedir confirmación. No resuelve ambigüedad de negocio por su cuenta.
Regla práctica
Codex implementa dentro de un marco ya definido.
No se usa para inventar producto.

11. Uso de OpenClaw
OpenClaw se usa para:

convertir backlog en issues
proponer milestones
ordenar board
checklists QA
seguimiento operativo
release notes a partir de PRs mergeados

OpenClaw no debe

redefinir el MVP
cambiar prioridades de negocio por su cuenta
tocar lógica crítica
inventar épicas fuera del alcance acordado
mergear PRs

Comportamiento ante ambigüedad
Ante ambigüedad, OpenClaw pregunta. No asume.
Regla práctica
OpenClaw organiza.
No decide producto.

12. Manejo de documentación
Se debe actualizar documentación cuando cambie cualquiera de estos puntos:

alcance del MVP
flujo principal
estados
arquitectura
contratos API importantes
decisiones de infraestructura
políticas del producto

La actualización de documentación va en el mismo PR que produce el cambio, no en uno posterior.
Documentos principales

AGENTS.md
CODEX_CONTEXT.md
docs/PRD.md
docs/architecture.md
docs/backlog.md
docs/governance.md

Criterio de documento vivo
Un documento sin fecha de última actualización es un documento que no se puede confiar. Mantener el encabezado de versión actualizado.

13. Manejo de deuda técnica
La deuda técnica relevante debe registrarse en docs/TECH_DEBT.md.
Registrar al menos:

problema
impacto
riesgo
propuesta futura
prioridad

Reglas

no dejar deuda crítica escondida en comentarios sueltos o memoria informal
reservar al menos el 20% del tiempo de cada sprint para pagar deuda técnica
si no se reserva, nunca se paga

Decisiones provisionales conocidas
Estas decisiones son válidas para el MVP pero deben revisarse antes de escalar:

verificación de transportistas es manual
jobs en DB para tareas simples en MVP temprano
política de cancelación con valores fijos
un solo PSP activo


14. Reglas de migraciones

toda migración debe ser clara y revisable
no hacer migraciones destructivas sin aprobación explícita
documentar riesgos en el PR si afecta datos sensibles
mantener nombres de migración entendibles
si una migración implica pérdida de datos posible, incluir script de rollback o respaldo previo


15. Reglas de seguridad y consistencia
Auth

siempre validación server-side
permisos claros por rol y propiedad del recurso
access token en memoria del cliente, nunca en localStorage
refresh token en httpOnly cookie

Booking

no confirmar capacidad con datos stale
proteger capacidad con consistencia transaccional
liberar cupos en la misma transacción que cancela el booking

Payments

nunca confiar en frontend como fuente de verdad
procesar webhooks de forma idempotente
guardar idempotencyKey y providerReference en todo Payment
verificar firma del webhook antes de procesar

Archivos

guardar binarios en storage externo
guardar metadata en base de datos
usar presigned URLs para uploads directos
el backend no actúa como proxy de archivos


16. Retrospectiva y mejora continua
Al final de cada sprint hacer una retrospectiva corta que responda:

qué funcionó bien
qué no funcionó
qué cambio pequeño haría el próximo sprint mejor

Registrar los cambios de proceso en este documento si son relevantes.

17. Priorización del trabajo
Orden de prioridad:

foundations
auth
perfil transportista
vehículos / trailers
ofertas
búsqueda
booking
pagos
operación
comprobante / reputación / disputas
chat
green

Todo lo que no aporte al flujo principal debe esperar.

18. Criterio de proyecto bien gobernado
El proyecto está bien gobernado si:

el MVP sigue enfocado
no se abren features fuera de alcance
los cambios críticos se revisan bien
el repo sigue ordenado
la documentación acompaña los cambios
los agentes ayudan pero no desvían el producto
la deuda técnica está registrada y se paga progresivamente
los secretos nunca aparecen en el código
cada sprint termina con algo entregable y verificable