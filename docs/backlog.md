Backlog
<!-- version: 1.0 | última actualización: 2026-03-13 | revisar si cambia el orden de épicas, dependencias o criterios de sprint -->
1. Objetivo
Convertir la visión del producto y la arquitectura inicial en un backlog ejecutable, ordenado por épicas, dependencias y prioridad de implementación.
Este backlog está pensado para un MVP profesional, vendible y enfocado.
No busca listar todo lo que podría existir, sino lo necesario para construir el flujo principal sin desorden.

2. Criterios de priorización
Las prioridades se ordenan según estos principios:

primero lo que habilita el flujo principal del negocio
después lo que protege consistencia y monetización
después lo que mejora confianza y operación
al final lo diferencial o expansivo

Flujo principal a habilitar:
transportista publica oferta → cliente busca → cliente reserva → cliente paga seña → viaje se opera → se cierra con comprobante y reputación

3. Épicas del MVP

E0 — Foundations
Objetivo
Dejar el proyecto listo para desarrollar sin caos.
Incluye

monorepo con Turborepo
apps/web
apps/api
packages/config
packages/types
packages/shared
configuración base de TypeScript
lint
format
typecheck
CI inicial
estructura docs/
AGENTS.md
CODEX_CONTEXT.md
PRD.md
architecture.md
backlog.md
governance.md

Entregable
Repo inicial estable, instalable y entendible.
Complejidad estimada
M — entre 8 y 10 issues de setup y configuración
Prioridad
Crítica
Dependencias
Ninguna
Definition of Done

 pnpm install corre sin errores
 pnpm dev levanta web y api en local
 pnpm build produce build limpio
 pnpm lint y pnpm typecheck pasan sin errores
 estructura de docs existe y tiene contenido inicial
 CI corre en cada PR a develop


E1 — Auth y roles
Objetivo
Permitir autenticación y control básico de acceso.
Incluye

registro
login
sesión segura
recuperación básica de acceso si aplica
roles base
guards / authorization
modelo de usuario


Features sugeridas

User base
roles CLIENT, TRANSPORTER, ADMIN
endpoints auth
protección de rutas
perfil inicial mínimo

Entregable
Usuarios pueden autenticarse y entrar según rol.
Complejidad estimada
M — entre 5 y 7 issues
Prioridad
Crítica
Dependencias
E0
Definition of Done

 un usuario puede registrarse con email y contraseña
 un usuario puede hacer login y recibir access token + refresh token
 el access token expira y puede renovarse con refresh token
 rutas protegidas devuelven 401 sin token válido
 rutas con rol devuelven 403 si el rol no corresponde
 un TRANSPORTER no puede acceder a rutas de CLIENT y viceversa

Zona de cuidado
Auth y roles requieren revisión humana antes de mergear cualquier PR que toque rutas protegidas o lógica de permisos.

E2 — Onboarding y perfil de transportista
Objetivo
Permitir que un transportista cree su perfil y quede apto para operar.
Incluye

perfil transportista
carga documental
estado de verificación manual
datos básicos de contacto y operación

Features sugeridas

TransportistaProfile
upload de documentos
verificationStatus
vista de estado de verificación
panel admin mínimo para aprobar/rechazar

Entregable
Transportista puede registrarse, completar perfil y quedar pendiente de verificación.
Complejidad estimada
M — entre 5 y 7 issues
Prioridad
Crítica
Dependencias
E1
Definition of Done

 transportista puede completar su perfil con datos básicos
 puede subir documentos requeridos a storage
 el estado de verificación queda en PENDING al completar
 admin puede ver el perfil y cambiar el estado a VERIFIED o REJECTED
 transportista ve su estado de verificación actualizado


E3 — Vehículos y trailers
Objetivo
Permitir declarar la capacidad operativa del transportista.
Incluye

alta de vehículo
alta de trailer
edición y desactivación
capacidad total
fotos
cargoType y capacityUnit

Features sugeridas

CRUD de Vehicle
CRUD de Trailer
validaciones de capacidad
vista "mis vehículos / trailers"

Entregable
Transportista puede registrar su unidad operativa con capacidad válida.
Complejidad estimada
S — entre 3 y 5 issues
Prioridad
Alta
Dependencias
E2
Definition of Done

 transportista puede crear un vehicle con patente, marca y modelo
 transportista puede crear un trailer con capacidad total, cargoType y capacityUnit
 puede editar y desactivar ambos
 no puede crear una TripOffer sin tener al menos un trailer activo
 cargoType = EQUINE y capacityUnit = SLOT son los únicos valores activos en MVP


E4 — Publicación de ofertas
Objetivo
Permitir que el transportista publique cupos y retornos.
Incluye

crear TripOffer
editar borrador
publicar oferta
listar mis ofertas
cambiar estados simples

Features sugeridas

origen y destino con coordenadas
fecha o rango horario
precio por cupo
cupos disponibles
desvío máximo
notas
política de cancelación simple
flag isReturn para retornos

Entregable
Transportista publica ofertas visibles para búsqueda.
Complejidad estimada
M — entre 5 y 7 issues
Prioridad
Crítica
Dependencias
E3
Definition of Done

 transportista puede crear una oferta en DRAFT y publicarla
 oferta publicada aparece en los resultados de búsqueda
 oferta con availableCapacity = 0 pasa automáticamente a FULL
 transportista puede cerrar o cancelar su oferta
 el campo cargoType se guarda correctamente para filtros futuros


E5 — Búsqueda y exploración de ofertas
Objetivo
Permitir que el cliente descubra ofertas relevantes.
Incluye

formulario de búsqueda
resultados
filtros
ordenamiento
detalle de oferta

Features sugeridas

búsqueda por origen, destino, fecha, cupos
filtros por precio, verificación, desvío
orden por precio, cercanía y rating
detalle completo de la oferta

Entregable
Cliente puede encontrar una oferta viable y entenderla.
Complejidad estimada
M — entre 5 y 6 issues
Prioridad
Crítica
Dependencias
E4
Definition of Done

 cliente puede buscar por origen, destino, fecha y cupos requeridos
 resultados muestran solo ofertas en estado PUBLISHED con capacidad suficiente
 filtros de precio, verificación y desvío funcionan correctamente
 resultados están paginados (máximo 20 por página)
 detalle de oferta muestra toda la información necesaria para decidir


E6 — Booking con anti-overbooking
Objetivo
Permitir reservar cupos sin sobreventa.
Incluye

creación de reserva
validación de capacidad real
consumo transaccional de cupos
estados de reserva
vista de detalle de reserva

Features sugeridas

Booking con PENDING_PAYMENT
snapshot de precio al momento de reservar
requestedUnits
actualización consistente de availableCapacity
manejo de error por falta de cupos

Entregable
Cliente puede reservar y el sistema protege capacidad real.
Complejidad estimada
L — entre 7 y 9 issues incluyendo tests de concurrencia
Prioridad
Crítica
Dependencias
E5
Definition of Done

 cliente puede crear un booking en PENDING_PAYMENT
 availableCapacity se decrementa dentro de una transacción atómica
 dos reservas simultáneas del último cupo resultan en una sola confirmada
 error 409 retorna mensaje semántico claro
 availableCapacity nunca queda en negativo
 booking en PENDING_PAYMENT tiene un tiempo de expiración definido
 al cancelar un booking, los cupos se liberan correctamente

Zona de cuidado
Test de concurrencia obligatorio antes de considerar esta épica cerrada.

E7 — Pagos y webhooks
Objetivo
Permitir seña protegida e impactar correctamente en la reserva.
Incluye

integración con PSP
creación de intención de pago
registro de Payment
webhook idempotente
transición de estados monetarios
confirmación de reserva post pago

Features sugeridas

Payment con INITIATED
providerReference e idempotencyKey
endpoint webhook con verificación de firma
tabla WebhookEvent para idempotencia
transición a HELD
transición de Booking a CONFIRMED

Entregable
Cliente paga seña y la reserva queda confirmada sin inconsistencias.
Complejidad estimada
XL — entre 9 y 12 issues incluyendo tests de idempotencia
Prioridad
Crítica
Dependencias
E6
Definition of Done

 cliente puede iniciar el pago de la seña con PSP
 webhook recibido actualiza Payment a HELD y Booking a CONFIRMED
 el mismo webhook procesado dos veces no produce doble efecto
 firma del webhook se verifica antes de procesar
 pago fallido deja el booking en CANCELLED y libera los cupos
 WebhookEvent registra todos los eventos recibidos

Zona de cuidado
Ningún merge sin revisión humana del flujo de webhook y manejo de estados monetarios.

E8 — Operación del viaje
Objetivo
Permitir ejecutar el traslado con trazabilidad mínima.
Incluye

timeline de estados
check-in
check-out
evidencias
avance operativo del booking

Features sugeridas

Proof con upload de fotos a storage
transición a IN_PROGRESS
transición a DELIVERED_PENDING_CONFIRMATION
vista de timeline con estados y evidencias

Entregable
Reserva operada con evidencia mínima verificable.
Complejidad estimada
M — entre 5 y 7 issues
Prioridad
Alta
Dependencias
E7
Definition of Done

 transportista puede registrar check-in con foto y booking pasa a IN_PROGRESS
 transportista puede registrar check-out con foto y booking pasa a DELIVERED_PENDING_CONFIRMATION
 fotos se suben directamente a storage con presigned URL
 timeline es visible para ambas partes desde el detalle de reserva
 cliente ve claramente el estado actual del viaje


E9 — Comprobante, reputación y disputas
Objetivo
Cerrar la operación con confianza y post-servicio.
Incluye

comprobante PDF
confirmación de entrega
reviews
disputa básica
intervención manual admin

Features sugeridas

generación de PDF al pasar a COMPLETED
Review habilitado solo tras COMPLETED
Dispute con congelamiento de pago
botón "Reportar problema"
panel admin para resolver disputas

Entregable
La operación puede cerrarse formalmente y manejar conflictos simples.
Complejidad estimada
L — entre 7 y 9 issues
Prioridad
Alta
Dependencias
E8
Definition of Done

 cliente puede confirmar entrega y booking pasa a COMPLETED
 PDF se genera automáticamente al completarse y es descargable
 PDF no se regenera si ya existe
 ambas partes pueden dejar review solo tras COMPLETED
 cliente puede reportar problema y pago queda en HELD
 admin puede resolver disputa a favor de cualquiera de las partes
 resolución de disputa libera o devuelve el pago correctamente

Zona de cuidado
Verificar que ninguna disputa pueda liberar pago sin intervención explícita del admin.

E10 — Chat interno
Objetivo
Dar comunicación básica entre las partes sin sacar la operación de la plataforma.
Incluye

mensajería básica
restricción de contacto previo a seña
habilitación completa luego de confirmación

Features sugeridas

thread por booking
reglas anti-puenteo
sistema de permisos por estado del booking

Restricciones técnicas

mensajes en tiempo real: WebSockets o polling simple para MVP
filtro básico de datos de contacto en mensajes (regex sobre teléfonos, emails y links)
thread único por booking
historial de mensajes accesible desde el detalle de reserva
no implementar notificaciones push en MVP

Entregable
Cliente y transportista pueden comunicarse dentro del flujo.
Complejidad estimada
M — entre 5 y 7 issues
Prioridad
Media
Dependencias
E7
Definition of Done

 antes de seña: mensajes permitidos pero sin datos de contacto
 filtro bloquea envío de teléfonos, emails y links en mensajes pre-seña
 después de seña: chat libre habilitado
 historial visible desde el detalle de reserva
 ambas partes pueden ver mensajes anteriores al reabrir la conversación

Nota
Puede entrar antes o después de E9 según necesidad comercial, pero no es más crítico que booking o pagos.

E11 — Módulo green
Objetivo
Medir el impacto positivo del uso de cupos y retornos.
Incluye

ocupación promedio
empty miles evitadas
CO₂ estimado
green score simple

Features sugeridas

cálculo de ocupación por oferta
estimación simple de retorno aprovechado
métricas por transportista
visualización inicial en dashboard

Entregable
La plataforma puede mostrar métricas ambientales básicas y defendibles.
Complejidad estimada
M — entre 4 y 6 issues
Prioridad
Media
Dependencias
E4, E6, E8
Definition of Done

 se calcula ocupación real por oferta completada
 se estiman km vacíos evitados por retorno aprovechado
 transportista puede ver sus métricas en el dashboard
 los cálculos son reproducibles y auditables


4. Orden recomendado de implementación

E0 Foundations
E1 Auth y roles
E2 Onboarding y perfil de transportista
E3 Vehículos y trailers
E4 Publicación de ofertas
E5 Búsqueda y exploración
E6 Booking con anti-overbooking
E7 Pagos y webhooks
E8 Operación del viaje
E9 Comprobante, reputación y disputas
E10 Chat interno
E11 Módulo green


5. Sprint 0
Objetivo
Dejar el repositorio y el marco de trabajo listos para construir sin fricción.
Alcance

crear monorepo con Turborepo
definir estructura apps/ y packages/
crear apps/web
crear apps/api
instalar dependencias base
configurar workspace
configurar lint / typecheck / build
crear docs/
subir documentos rectores
configurar CI inicial
dejar comandos base funcionando

Resultado esperado
Al final del Sprint 0 debe ser posible:

instalar el repo con pnpm install
correr pnpm dev
correr pnpm build
correr pnpm lint
correr pnpm typecheck
entender estructura y reglas del proyecto leyendo README y AGENTS.md

Issues sugeridas

crear monorepo base con Turborepo
crear app web base con Next.js
crear app api base con NestJS
crear paquetes compartidos base
configurar Turbo pipelines
configurar TypeScript compartido
configurar ESLint y Prettier
crear docs iniciales
crear CI inicial con GitHub Actions
configurar branch protection en GitHub
crear .env.example completo
crear issue templates y PR template


6. Sprint 1
Objetivo
Habilitar el lado transportista hasta publicación de oferta.
Alcance

auth base
roles
perfil de transportista
verificación manual mínima
vehículos / trailers
crear oferta
listar mis ofertas

Resultado esperado
Un transportista puede entrar, completar perfil, cargar trailer y publicar una oferta.
Issues sugeridas

registro y login base
JWT + refresh token
roles y guards
perfil transportista
carga documental básica con presigned URLs
panel admin de verificación mínima
CRUD vehicle
CRUD trailer con cargoType y capacityUnit
create trip offer
list my offers con estados


7. Sprint 2
Objetivo
Habilitar descubrimiento y reserva.
Alcance

búsqueda
filtros
detalle de oferta
creación de booking
control anti-overbooking

Resultado esperado
Un cliente puede buscar una oferta y reservar cupos sin sobreventa.
Issues sugeridas

search endpoint con filtros base
paginación de resultados
detalle de oferta pública
create booking con validación transaccional de capacidad
test de concurrencia anti-overbooking
manejo de error 409 en frontend
expiración de booking en PENDING_PAYMENT
vista de detalle de reserva


8. Sprint 3
Objetivo
Habilitar monetización inicial y confirmación real de reserva.
Alcance

PSP
intención de pago
webhook
idempotencia
confirmación de reserva post pago

Resultado esperado
Un cliente puede pagar la seña y la reserva queda confirmada correctamente.
Issues sugeridas

integración PSP sandbox
create payment intent
endpoint webhook con verificación de firma
tabla WebhookEvent
procesamiento idempotente de eventos
transición Payment INITIATED → HELD
transición Booking PENDING_PAYMENT → CONFIRMED
manejo de pago fallido y liberación de cupos
test de webhook duplicado


9. Sprint 4
Objetivo
Cerrar operación y confianza post-servicio.
Alcance

check-in
check-out
timeline
comprobante
reputación
disputas básicas

Resultado esperado
El servicio puede cerrarse con evidencia, comprobante y reputación.
Issues sugeridas

upload de evidencias con presigned URL
check-in con transición a IN_PROGRESS
check-out con transición a DELIVERED_PENDING_CONFIRMATION
confirmación de entrega con transición a COMPLETED
generación de PDF idempotente
descarga de comprobante desde detalle de reserva
create review habilitado solo tras COMPLETED
create dispute con congelamiento de pago
panel admin para resolución de disputas


10. Dependencias críticas

E1 depende de E0
E2 depende de E1
E3 depende de E2
E4 depende de E3
E5 depende de E4
E6 depende de E5
E7 depende de E6
E8 depende de E7
E9 depende de E8
E10 depende de E7
E11 depende de datos generados por E4, E6 y E8


11. Issues transversales
Trabajo que no pertenece a una épica específica pero debe agendarse:

configurar Sentry en api y web
setup de variables de entorno en staging
configurar Dependabot
documentar runbook mínimo
smoke test del flujo completo antes de cada release
revisar y actualizar .env.example al cerrar cada sprint


12. Zonas de especial cuidado
E1 — Auth y roles
Revisar guards y permisos antes de mergear cualquier PR que toque rutas protegidas.
E6 — Booking anti-overbooking
Test de concurrencia obligatorio antes de considerar la épica cerrada.
E7 — Pagos y webhooks
Ningún merge sin revisión humana del flujo de webhook y del manejo de estados monetarios.
E9 — Disputas y liberación de pago
Verificar que ninguna disputa pueda liberar pago sin intervención explícita del admin.

13. Qué no priorizar todavía
No priorizar antes del flujo principal:

tracking complejo
optimización de rutas avanzada
automatizaciones sofisticadas
dashboards analíticos grandes
expansión multi-rubro visible en UI
features cosméticas sin impacto directo en conversión u operación


14. Criterio de backlog bien encaminado
El backlog está bien planteado si mantiene el foco en este objetivo:
lograr un MVP que permita publicar oferta, reservar, cobrar seña, operar el viaje y cerrar con comprobante y reputación
Todo lo que no ayude a eso en esta etapa debe quedar fuera o postergado.