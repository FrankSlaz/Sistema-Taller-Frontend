# Sistema Taller — Frontend

Aplicacion web del sistema de gestion de taller, construida con **Astro
+ React Islands + Tailwind CSS + TypeScript**, consumiendo la API REST
de `backend-nest`.

## Stack

-   **Astro** — enrutamiento, layouts, paginas, componentes estaticos.
-   **React** (solo como islas) — tablas dinamicas, formularios, filtros,
    graficos y dashboards que requieren interaccion.
-   **Tailwind CSS v4** — estilos, mediante tokens en `src/styles/global.css`.
-   **TanStack Query** — estado de datos remotos dentro de cada isla React.
-   **TypeScript** (`strict`).

## Requisitos

-   Node.js >= 22.12
-   Backend `backend-nest` corriendo en `http://localhost:3000/api`
    (ver `../backend-nest/README.md`)

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:4321`. El backend debe
tener `CORS_ORIGIN=http://localhost:4321` en su `.env` (ya es el valor
por defecto en `backend-nest/.env.example`).

## Variables de entorno

| Variable          | Descripcion                    | Default                     |
| ----------------- | ------------------------------- | ---------------------------- |
| `PUBLIC_API_URL`  | Base URL de la API NestJS       | `http://localhost:3000/api` |
| `PUBLIC_APP_NAME` | Nombre mostrado en la interfaz  | `Sistema Taller`            |

Definidas y tipadas en `astro.config.mjs` (`env.schema`), se acceden
con `import { PUBLIC_API_URL } from 'astro:env/client'`.

## Estructura de carpetas

```
src/
├── layouts/                  Layouts Astro (Base, Dashboard)
├── components/
│   ├── astro/                 Navbar, Sidebar, Cards, UI estatica
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   ├── cards/
│   │   └── ui/
│   └── react/                  Islas: interaccion dinamica
│       ├── tables/             Tablas dinamicas (DataTable generico)
│       ├── forms/               Formularios (LoginForm, ...)
│       ├── filters/             Filtros de listados
│       ├── charts/              Graficos
│       ├── dashboards/          Widgets de dashboard (UserMenu, ...)
│       └── providers/           QueryProvider (TanStack Query)
├── lib/
│   ├── api/                    Cliente HTTP (client.ts, auth.ts, ...)
│   ├── hooks/                   Hooks React (useAuth, ...)
│   └── utils/                   Utilidades (cn, ...)
├── types/                      Tipos compartidos (api.ts, auth.ts, ...)
├── stores/                      Estado compartido entre islas (si aplica)
├── styles/                      global.css (tokens Tailwind)
└── pages/                       Rutas de la aplicacion
```

## Convenciones

-   **Astro** para todo lo estatico: layouts, navegacion, cards,
    landing de cada modulo.
-   **React (`client:load` / `client:visible`)** unicamente en
    componentes con estado o interaccion: tablas, formularios,
    filtros, graficos.
-   Cada isla React que necesite datos del backend se envuelve con
    `<QueryProvider>` y usa `src/lib/api/*` para las llamadas HTTP
    (nunca `fetch` directo dentro del componente).
-   Los tipos de dominio (`Usuario`, `Rol`, etc.) reflejan
    `backend-nest/prisma/schema.prisma`; al agregar un modulo nuevo,
    agregar su tipo en `src/types/` antes de construir la UI.

## Estado

-   [x] Entorno de trabajo (Astro + React + Tailwind + TS)
-   [x] Cliente API + manejo de sesion (JWT)
-   [x] Layout base (Navbar + Sidebar) y login
-   [ ] Modulos funcionales (clientes, equipos, reparaciones, inventario, ...)
