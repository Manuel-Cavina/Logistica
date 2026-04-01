# 001 - Estructura del monorepo
<!-- status: accepted | última actualización: 2026-04-01 -->

## Contexto

El proyecto necesita compartir tipos, schemas y configuración entre el backend
(NestJS) y el frontend (Next.js) sin duplicar código ni publicar paquetes npm.
La elección de herramienta de build y la organización de carpetas afecta cómo
se importan los paquetes internos, cómo se ejecutan los comandos y cuánto
overhead tiene agregar una nueva app o paquete.

## Decisión

Se adopta un monorepo con **Turborepo** como orquestador de tareas y **pnpm
workspaces** como gestor de dependencias.

La estructura de primer nivel es:

```
apps/
  api/      ← backend NestJS
  web/      ← frontend Next.js
packages/
  database/         ← PrismaService, PrismaModule, tipos generados (@logistica/database)
  shared/           ← schemas Zod e interfaces compartidas (@logistica/shared)
  eslint-config/    ← configuración ESLint compartida
  typescript-config/ ← configuraciones TypeScript base
```

Los paquetes internos se referencian como workspace dependencies en
`package.json` con el prefijo `@logistica/`.

## Alternativas consideradas

### Repositorios separados

Se descartó mantener `api` y `web` en repos distintos porque requeriría
publicar o linkear manualmente los tipos compartidos en cada cambio, añadiendo
fricción en cada iteración del MVP.

### nx

Se evaluó nx como alternativa a Turborepo. Se eligió Turborepo por menor
configuración inicial y mejor integración con pnpm workspaces en proyectos sin
un framework de generación de código.

### yarn workspaces

Se descartó yarn a favor de pnpm por mejor performance en instalación y
gestión más estricta de dependencias fantasma.

## Consecuencias

### Positivas

- tipos y schemas se comparten desde `@logistica/shared` sin duplicar
- `turbo run build` / `turbo run lint` respeta el grafo de dependencias
- agregar una app o paquete nuevo es copiar la estructura existente y declarar
  la workspace dependency

### Costos y límites

- `packages/database` debe compilarse (tsc) antes de que `apps/api` pueda
  importar los tipos — el orden de build lo gestiona Turborepo vía `dependsOn`
- Prisma v6 auto-descubre `prisma.config.ts` y requiere `DATABASE_URL` al
  generar el client — en CI debe proveerse un valor dummy
- sin barrel files `index.ts` en módulos NestJS para evitar problemas de
  resolución circular
