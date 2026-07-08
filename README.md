# Villena App — Fiestas de Moros y Cristianos

Aplicación web (SPA) con la agenda de actos, comparsas e información práctica de las Fiestas de Moros y Cristianos de Villena.

> Nota: el stack real de este proyecto es **React + TypeScript + Vite + Supabase**, no Flutter.

## Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool y dev server)
- [React Router 7](https://reactrouter.com/) (navegación)
- [Supabase](https://supabase.com/) (base de datos, auth y backend)
- [Vitest](https://vitest.dev/) + Testing Library (tests)

## Requisitos

- Node.js 18+
- Una cuenta/proyecto de Supabase (opcional — sin configurar, la app funciona con datos locales de ejemplo)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena las claves de tu proyecto de Supabase
npm run dev
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila TypeScript y genera el build de producción |
| `npm run preview` | Sirve el build de producción en local |
| `npm run typecheck` | Comprueba tipos con `tsc --noEmit` |
| `npm run lint` | Linter (ESLint) |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run test:coverage` | Tests con cobertura |

## Estructura del proyecto

```
src/
  components/   componentes reutilizables (Modal, TabBar, ErrorBoundary)
  constants/    rutas, claves de localStorage, configuración del festival
  data/         datos locales de ejemplo (fallback sin Supabase)
  features/     una carpeta por pantalla: inicio, agenda, comparsas, musica, info
  hooks/        hooks compartidos (auth, localStorage, audio)
  services/     capa de acceso a datos (Supabase o fallback local)
  types/        tipos de dominio y tipos del esquema de Supabase
supabase/
  migrations/   esquema SQL y datos semilla
```

## Variables de entorno

Ver `.env.example`. Si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no están configuradas, los servicios de datos usan automáticamente los datos locales de `src/data/`.
