# Guía para volver a entender Ruta Directa

Esta guía existe para recuperar contexto rápido: qué es el proyecto, qué partes ya están construidas, cómo está organizada la arquitectura y por dónde conviene leer el código sin perderse.

> **Idea central:** Ruta Directa es un marketplace de cupos y retornos para transporte. La vertical inicial es transporte equino, pero el modelo está preparado para soportar otros rubros con el tiempo.

---

## 1. Resumen en 5 minutos

### Qué problema resuelve

En el transporte de caballos, muchos viajes se coordinan por WhatsApp o contactos directos. Eso trae problemas:

- viajes de retorno vacíos;
- poca trazabilidad;
- coordinación manual;
- pagos y reservas sin protección;
- dificultad para comparar transportistas confiables.

Ruta Directa intenta convertir eso en un flujo más ordenado:

```text
Transportista publica viaje/cupos
        ↓
Cliente busca y compara
        ↓
Cliente reserva cupos
        ↓
Sistema evita sobreventa
        ↓
Pago protegido / seña
        ↓
Viaje con evidencia y trazabilidad
        ↓
Comprobante, reputación y cierre
```

### Estado real del sistema

El proyecto todavía no es un MVP comercial completo. Tiene una base técnica sólida, pero varias partes transaccionales siguen pendientes.

| Área | Estado | Comentario |
|---|---:|---|
| Autenticación y sesiones | Implementado | Registro, login, refresh token, logout y usuario actual. |
| Roles | Implementado | `CLIENT`, `TRANSPORTER`, `ADMIN`. |
| Perfil de transportista | Implementado | Onboarding y estado de verificación. |
| Admin de transportistas | Implementado | Listado, detalle, aprobación y rechazo. |
| Flota | Implementado | Vehículos y trailers. |
| Ofertas de viaje | Parcial | Backend implementado; parte del frontend público todavía usa datos de ejemplo. |
| Reservas | Parcial | Backend implementado; falta experiencia frontend completa y pagos. |
| Pagos / Mercado Pago | Pendiente | No hay integración real todavía. |
| Evidencias, reputación, disputas | Pendiente | Son parte del plan, no del core actual. |

La fuente más completa del estado real es `docs/audits/2026-05-05-system-audit.md`.

---

## 2. Mapa mental del proyecto

Pensalo como tres capas principales:

```text
Usuario en navegador
        ↓
apps/web
Frontend Next.js: pantallas, formularios, guards, hooks
        ↓
apps/api
Backend NestJS: endpoints, reglas de negocio, acceso a datos
        ↓
packages/database
Prisma + PostgreSQL
```

Y dos paquetes que sostienen a esas capas:

```text
packages/shared
Schemas Zod + tipos compartidos entre web y api

packages/database
Prisma schema + PrismaService + cliente generado
```

La regla importante es esta:

> **El frontend no decide reglas críticas del negocio.** El frontend ayuda al usuario a operar. Las reglas fuertes viven en el backend.

Ejemplo:

- el frontend puede mostrar un botón "Reservar";
- el backend decide si hay cupos disponibles;
- la base de datos guarda el resultado real.

---

## 3. Estructura general del repositorio

```text
/
├─ apps/
│  ├─ web/        → aplicación frontend con Next.js
│  └─ api/        → backend con NestJS
├─ packages/
│  ├─ shared/     → contratos compartidos: Zod schemas y tipos
│  ├─ database/   → Prisma schema, migraciones y PrismaService
│  ├─ eslint-config/
│  └─ typescript-config/
├─ docs/          → documentación del producto, arquitectura y auditorías
├─ scripts/       → automatizaciones de issues, ramas y PRs
├─ .github/       → workflows y templates de GitHub
├─ package.json   → scripts raíz del monorepo
├─ pnpm-workspace.yaml
└─ turbo.json
```

### Cómo leer esta estructura

| Carpeta | Pregunta que responde |
|---|---|
| `apps/web` | ¿Qué ve y usa el usuario? |
| `apps/api` | ¿Qué reglas y endpoints existen? |
| `packages/shared` | ¿Qué forma tienen los datos que viajan entre frontend y backend? |
| `packages/database` | ¿Qué entidades existen en la base de datos? |
| `docs` | ¿Qué decisiones, estado y roadmap tiene el producto? |
| `scripts` | ¿Qué automatizaciones ayudan al workflow del proyecto? |

---

## 4. Arquitectura backend: NestJS modular

El backend vive en:

```text
apps/api/src/
```

Hoy tiene estos módulos principales:

```text
apps/api/src/
├─ admin/
├─ booking/
├─ common/
├─ identity/
│  ├─ accounts/
│  ├─ authentication/
│  └─ transporter-profile/
├─ trailer/
├─ trip-offer/
└─ vehicle/
```

### La idea arquitectónica

Cada módulo representa una parte del negocio. Dentro de cada módulo se separan responsabilidades:

```text
controller → service → repository → PrismaService → PostgreSQL
```

| Pieza | Responsabilidad | Qué NO debería hacer |
|---|---|---|
| Controller | Recibe HTTP, valida input y delega. | No debería tener reglas de negocio. |
| Service | Contiene reglas de negocio. | No debería hacer queries Prisma directas si existe repository. |
| Repository | Encapsula acceso a Prisma. | No debería decidir reglas de negocio. |
| DTO | Define/valida datos de entrada. | No debería contener lógica de negocio. |
| Types | Centraliza selects y tipos internos. | No debería mezclar lógica de aplicación. |

### Ejemplo de estructura de módulo

```text
apps/api/src/trip-offer/
├─ trip-offer.module.ts
├─ trip-offer.controller.ts
├─ trip-offer.controller.spec.ts
├─ application/
│  ├─ trip-offer.service.ts
│  └─ trip-offer.service.spec.ts
├─ dto/
├─ repositories/
│  └─ trip-offer.repository.ts
└─ types/
   └─ trip-offer.types.ts
```

### Por qué está separado así

Si mezclás todo en un controller, al principio parece más rápido, pero después se vuelve inmantenible. Esta separación evita que el backend sea una bola de barro.

La lógica queda repartida así:

```text
HTTP y validación superficial      → controller
Reglas del negocio                 → service
Consultas a base de datos          → repository
Modelo persistido                  → Prisma schema
Contratos compartidos con frontend → packages/shared
```

### Endpoints importantes actuales

| Dominio | Endpoints principales |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Transportista | `GET /transporter/profile`, `PATCH /transporter/profile` |
| Admin transportistas | `GET /admin/transporters`, `GET /admin/transporters/:id`, `PATCH /admin/transporters/:id/verification-status` |
| Vehicles | `GET /vehicles`, `POST /vehicles`, `PATCH /vehicles/:id`, `PATCH /vehicles/:id/deactivate` |
| Trailers | `GET /trailers`, `POST /trailers`, `PATCH /trailers/:id`, `PATCH /trailers/:id/deactivate` |
| Trip offers | `GET /trip-offers/search`, `GET /trip-offers/:id/public`, `GET /trip-offers/my`, `POST /trip-offers`, `POST /trip-offers/:id/publish` |
| Bookings | `POST /bookings`, `GET /bookings/:id`, `POST /bookings/:id/cancel` |

---

## 5. Arquitectura frontend: Next.js App Router

El frontend vive en:

```text
apps/web/
```

Las carpetas más importantes son:

```text
apps/web/
├─ app/          → rutas de Next.js App Router
├─ features/     → lógica y UI por dominio
├─ components/   → componentes UI reutilizables
├─ src/lib/      → helpers compartidos: api client, forms, utilidades
└─ public/       → assets públicos
```

### Regla mental para frontend

```text
app/      = rutas y layouts
features/ = la pantalla real y su lógica
src/lib/  = utilidades compartidas
components/ui = piezas visuales base
```

Un `page.tsx` en `app/` debería ser pequeño. Lo normal es que delegue a un componente de `features/`.

Ejemplo mental:

```text
apps/web/app/(guest)/login/page.tsx
        ↓
apps/web/features/auth/pages/login-page.tsx
        ↓
apps/web/features/auth/hooks/...
        ↓
apps/web/features/auth/services/...
        ↓
apps/web/src/lib/api/...
```

### Rutas frontend importantes

| Ruta | Para qué sirve |
|---|---|
| `/` | Home pública. |
| `/como-funciona` | Explicación pública del producto. |
| `/login` | Inicio de sesión. |
| `/register` | Registro. |
| `/dashboard` | Panel protegido. |
| `/onboarding/transporter` | Onboarding del transportista. |
| `/vehicles` | Gestión de vehículos. |
| `/trailers/new` | Alta de trailer. |
| `/admin/transporters` | Panel admin de transportistas. |
| `/viaje/[id]` | Detalle público de viaje, todavía con partes aspiracionales/mock. |
| `/transportista/[id]` | Detalle público de transportista, todavía con partes aspiracionales/mock. |

### Server Components vs Client Components

En Next.js App Router, por defecto los componentes son Server Components. Se usa `"use client"` cuando el componente necesita:

- `useState`;
- `useEffect`;
- eventos como `onClick` o `onChange`;
- `localStorage` o `window`;
- formularios interactivos;
- providers de estado.

Regla práctica:

```text
Solo muestra datos estáticos         → Server Component
Tiene estado, formulario o evento    → Client Component
Es un hook                           → Client Component
Es provider                          → Client Component
```

---

## 6. Paquetes compartidos

### `packages/shared`

Este paquete contiene schemas Zod y tipos usados por frontend y backend.

Sirve para evitar este problema:

```text
Frontend cree que el campo se llama "firstName"
Backend espera que se llame "name"
Resultado: bug por contrato duplicado
```

Con `@logistica/shared`, ambos lados importan el mismo contrato.

Ejemplo conceptual:

```text
packages/shared
        ↓
apps/web valida formulario antes de enviar
apps/api valida request al recibir
```

### `packages/database`

Este paquete contiene:

- `prisma/schema.prisma`;
- migraciones;
- cliente Prisma generado;
- `PrismaService` para NestJS.

El backend no debería inventar entidades por su cuenta. Si querés saber qué existe realmente en la base, empezá por:

```text
packages/database/prisma/schema.prisma
```

---

## 7. Modelo de datos actual

El schema actual tiene estas entidades principales:

| Entidad | Para qué sirve |
|---|---|
| `Account` | Identidad de login: email, password hash, rol y estado. |
| `UserProfile` | Datos personales básicos del usuario. |
| `TransporterProfile` | Perfil extendido del transportista y estado de verificación. |
| `Vehicle` | Vehículo del transportista. |
| `Trailer` | Trailer/capacidad asociada al transportista. |
| `TripOffer` | Oferta de viaje publicada o en borrador. |
| `Booking` | Reserva de cupos hecha por un cliente. |
| `Session` | Refresh sessions para autenticación. |

Y estos enums importantes:

| Enum | Valores relevantes |
|---|---|
| `AccountRole` | `CLIENT`, `TRANSPORTER`, `ADMIN` |
| `AccountStatus` | `ACTIVE`, `SUSPENDED`, `DISABLED` |
| `TransporterVerificationStatus` | `INCOMPLETE`, `PENDING`, `VERIFIED`, `REJECTED` |
| `CargoType` | `EQUINE`, `GENERAL_CARGO`, `FOOD`, `PEOPLE` |
| `CapacityUnit` | `SLOT`, `KG`, `M3`, `SEAT` |
| `TripOfferStatus` | `DRAFT`, `PUBLISHED`, `FULL`, `CLOSED`, `CANCELLED` |
| `BookingStatus` | `PENDING_PAYMENT`, `EXPIRED`, `CONFIRMED`, `IN_PROGRESS`, `DELIVERED_PENDING_CONFIRMATION`, `COMPLETED`, `CANCELLED`, `DISPUTED` |

### Detalle importante sobre multi-rubro

Aunque el MVP se enfoca en equinos, el modelo no está cerrado solamente a caballos.

Por eso existen:

- `CargoType`;
- `CapacityUnit`;
- `cargoType` en `Trailer`;
- `cargoType` en `TripOffer`.

Eso permite que, más adelante, la misma base soporte otros rubros sin rehacer toda la arquitectura.

---

## 8. Flujos principales

### 8.1 Registro e inicio de sesión

```text
Usuario completa formulario
        ↓
apps/web envía request a /auth/register o /auth/login
        ↓
apps/api valida datos
        ↓
AuthenticationService aplica reglas
        ↓
Repository guarda o consulta Account / Session
        ↓
Backend responde usuario + access token
        ↓
Frontend guarda sesión en AuthProvider
```

Puntos clave:

- el access token se usa para requests autenticados;
- el refresh token se maneja con cookie HttpOnly;
- los guards frontend deciden qué pantalla puede ver el usuario;
- los guards backend son la barrera real de seguridad.

### 8.2 Onboarding de transportista

```text
Usuario se registra como TRANSPORTER
        ↓
Entra a onboarding
        ↓
Completa perfil de transportista
        ↓
Backend actualiza TransporterProfile
        ↓
Si está completo, pasa de INCOMPLETE a PENDING
        ↓
Admin lo revisa
        ↓
Admin aprueba o rechaza
```

Estados principales:

```text
INCOMPLETE → PENDING → VERIFIED
                   ↘ REJECTED
```

### 8.3 Flota

El transportista puede gestionar:

- vehículos (`Vehicle`);
- trailers (`Trailer`);
- capacidad total;
- tipo de carga;
- unidad de capacidad.

Este módulo ya tiene backend y frontend conectados.

### 8.4 Ofertas de viaje

Una oferta representa un viaje con cupos disponibles.

Campos conceptuales:

- origen;
- destino;
- fecha o ventana de salida;
- capacidad total;
- capacidad disponible;
- precio por cupo;
- tipo de carga;
- estado.

Estados principales:

```text
DRAFT → PUBLISHED → FULL
          ↓
        CLOSED
          ↓
      CANCELLED
```

El backend existe. La experiencia pública del frontend todavía no está completamente conectada a datos reales.

### 8.5 Reservas

Una reserva (`Booking`) conecta:

- un cliente;
- una oferta de viaje;
- una cantidad de cupos;
- un precio congelado al momento de reservar;
- un vencimiento;
- un estado.

Estado inicial:

```text
PENDING_PAYMENT
```

Esto es importante: como Mercado Pago todavía no está implementado, la reserva queda sin continuidad real de pago.

---

## 9. Arquitectura de seguridad y zonas protegidas

Hay zonas que no se modifican a la ligera porque pueden romper seguridad, dinero o consistencia.

| Zona | Por qué importa |
|---|---|
| Auth | Si se rompe, usuarios pueden perder acceso o entrar donde no deben. |
| Roles y permisos | Afecta autorización de cliente, transportista y admin. |
| Anti-overbooking | Evita vender más cupos de los disponibles. |
| Pagos | Involucra dinero y webhooks externos. |
| Migraciones | Pueden romper o destruir datos. |
| Producción / deploy | Puede afectar ambientes reales. |

Regla sana:

> Si una tarea toca seguridad, dinero, permisos o migraciones, primero se explica el cambio y se pide aprobación.

---

## 10. Carpetas generadas que no se editan a mano

Estas carpetas suelen aparecer al instalar, compilar o correr el proyecto.

| Carpeta | Para qué sirve | ¿Se edita? |
|---|---|---|
| `node_modules/` | Dependencias instaladas. | No. |
| `.next/` | Build/cache de Next.js. | No. |
| `.turbo/` | Cache de Turborepo. | No. |
| `dist/` | Código compilado generado por TypeScript/Nest/paquetes. | No. |
| `packages/database/generated/` | Cliente Prisma generado. | No manualmente. |

### Entonces, ¿para qué sirve `dist`?

`dist` es una carpeta de salida. Guarda código compilado listo para ejecutar o consumir.

Ejemplo:

```text
packages/shared/src/index.ts
        ↓ build
packages/shared/dist/index.js
packages/shared/dist/index.d.ts
```

No es código fuente. Si querés cambiar comportamiento, modificás `src/`, no `dist/`.

---

## 11. Cómo correr el proyecto

Flujo normal:

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm --filter @logistica/database db:migrate
pnpm dev
```

Comandos útiles:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Notas importantes:

- los tests de API necesitan PostgreSQL levantado;
- si Docker no está corriendo, algunos tests de backend pueden fallar por entorno;
- si el build falla descargando Google Fonts por certificados, en esta máquina se usó `NODE_OPTIONS=--use-system-ca pnpm build`.

---

## 12. Cómo leer el código sin perderte

No empieces leyendo archivos al azar. Seguí el flujo de una funcionalidad.

### Receta general

```text
1. Encontrá la ruta en apps/web/app
2. Saltá al componente real en apps/web/features
3. Mirá hooks y services del feature
4. Buscá el endpoint en apps/api/src
5. Leé controller → service → repository
6. Revisá el schema compartido en packages/shared
7. Revisá el modelo Prisma en packages/database
8. Cerrá leyendo los tests del módulo
```

### Ejemplo: login

```text
apps/web/app/(guest)/login/page.tsx
        ↓
apps/web/features/auth/...
        ↓
apps/web/src/lib/api/...
        ↓
apps/api/src/identity/authentication/authentication.controller.ts
        ↓
apps/api/src/identity/authentication/application/...
        ↓
apps/api/src/identity/authentication/repositories/...
        ↓
packages/database/prisma/schema.prisma
```

### Ejemplo: vehículo de transportista

```text
apps/web/app/(protected)/vehicles/page.tsx
        ↓
apps/web/features/vehicle/...
        ↓
apps/api/src/vehicle/vehicle.controller.ts
        ↓
apps/api/src/vehicle/application/vehicle.service.ts
        ↓
apps/api/src/vehicle/repositories/vehicle.repository.ts
        ↓
packages/database/prisma/schema.prisma
```

---

## 13. Qué hiciste recientemente en la limpieza

En una rama reciente de limpieza se revisaron archivos sin uso y se eliminaron piezas obsoletas.

La limpieza apuntó a:

- wrappers legacy de auth en frontend;
- wrappers duplicados de `apps/web/lib`;
- imágenes JPG de auth no referenciadas;
- un alias DTO de transporter-profile no usado;
- placeholders obsoletos;
- formularios viejos de auth reemplazados por pantallas actuales;
- tests ajustados para cubrir el componente real usado por la app.

También se agregaron comentarios explicativos en zonas puntuales para que el código sea más fácil de leer.

La idea de esa limpieza fue correcta: no borrar por intuición, sino verificar referencias con búsqueda/import graph y después validar con typecheck, lint, tests y build.

---

## 14. Qué documentación leer y en qué orden

Si no recordás nada, leé en este orden:

1. `README.md`
   Para entender el producto y cómo correrlo.

2. `docs/README.md`
   Para saber qué documento es fuente de verdad de cada tema.

3. `docs/guia-arquitectura-y-repaso.md`
   Este archivo. Sirve como mapa mental y guía de aprendizaje.

4. `docs/architecture.md`
   Para entender la arquitectura técnica vigente.

5. `docs/api.md`
   Para ver el inventario actual de endpoints.

6. `docs/audits/2026-05-05-system-audit.md`
   Para ver el estado real auditado módulo por módulo.

7. `packages/database/prisma/schema.prisma`
   Para ver qué entidades existen realmente.

8. Tests de cada módulo
   Para entender comportamiento esperado con ejemplos concretos.

---

## 15. Glosario rápido

| Término | Significado |
|---|---|
| Account | Cuenta de acceso: email, password, rol y estado. |
| UserProfile | Datos personales básicos del usuario. |
| TransporterProfile | Perfil de negocio del transportista. |
| Vehicle | Vehículo del transportista. |
| Trailer | Trailer y capacidad disponible. |
| TripOffer | Oferta de viaje/cupos publicada por transportista. |
| Booking | Reserva de cupos hecha por cliente. |
| DTO | Objeto de entrada/salida usado para validar datos. |
| Zod schema | Schema de validación compartido. |
| Guard | Barrera de acceso según sesión o rol. |
| Controller | Entrada HTTP del backend. |
| Service | Lugar de reglas de negocio. |
| Repository | Lugar de consultas a base de datos. |
| Prisma | ORM usado para hablar con PostgreSQL. |
| Monorepo | Un repositorio con varias apps y paquetes relacionados. |
| App Router | Sistema de rutas moderno de Next.js. |

---

## 16. Checklist para recuperar contexto

Usá esta lista cuando vuelvas al proyecto después de varios días.

- [ ] Leer el resumen de esta guía.
- [ ] Correr `git status` para ver en qué rama estás.
- [ ] Leer `README.md`.
- [ ] Revisar `docs/audits/2026-05-05-system-audit.md`.
- [ ] Mirar `packages/database/prisma/schema.prisma`.
- [ ] Levantar base local con `docker compose up -d`.
- [ ] Correr `pnpm dev`.
- [ ] Probar login/register.
- [ ] Probar onboarding de transportista.
- [ ] Revisar el panel admin de transportistas.
- [ ] Correr `pnpm typecheck`.
- [ ] Correr `pnpm lint`.
- [ ] Correr tests del área que vayas a tocar.

---

## 17. Próximo camino recomendado

Si querés entender el proyecto de verdad, no saltes directo a código nuevo. Primero dominá los fundamentos del sistema.

Orden recomendado:

```text
1. Auth y sesiones
2. Roles y guards
3. TransporterProfile
4. Admin transporters
5. Vehicles y trailers
6. TripOffer
7. Booking
8. Pagos y webhooks, cuando toque implementarlos
```

La prioridad funcional más natural después de esta base es conectar la experiencia pública de ofertas y reservas con los endpoints reales. Eso acercaría el producto al flujo comercial completo antes de entrar fuerte en Mercado Pago.

---

## 18. Regla final para no perderte

Cuando dudes, preguntá:

```text
¿Esto pertenece al frontend, al backend, al contrato compartido o al modelo de datos?
```

Si sabés responder eso, ya sabés dónde buscar.

Si no lo sabés, no toques código todavía: seguí el flujo desde la ruta, al feature, al endpoint, al service, al repository y al schema.

Arquitectura no es decorar carpetas. Arquitectura es que cada cosa tenga un lugar claro y que el sistema siga siendo entendible cuando crece.
