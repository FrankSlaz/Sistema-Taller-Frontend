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
-   [x] Modulo Clientes (listado, busqueda, paginacion, alta, edicion, baja logica)
-   [x] Modulo Equipos (listado global o filtrado por cliente, alta, edicion, baja logica)
-   [ ] Modulos restantes (reparaciones, inventario, ...)

## Modulo Clientes

Implementado en `src/pages/clientes/index.astro` + isla
`components/react/modules/clientes/ClientesPanel.tsx`.

-   `lib/api/clientes.ts` — llamadas a `GET/POST/PATCH/DELETE /clientes`
    (paginado con `page`, `limit`, `search`, tal como espera
    `FindClientesQueryDto` en el backend).
-   `lib/hooks/useClientes.ts` — `useClientes` (listado) y
    `useClienteMutations` (crear/editar/eliminar) con invalidacion de
    cache de TanStack Query.
-   `ClienteFormModal` — formulario de alta/edicion (modal), valida
    los mismos campos que `CreateClienteDto`/`UpdateClienteDto`.
-   El backend hace **baja logica** (`deletedAt` + `estado: false`);
    el boton de eliminar en la UI dice "Desactivar" para reflejar eso.
-   Cada fila tiene un acceso directo a `/equipos?clienteId=...` para
    ver los equipos de ese cliente.

## Modulo Equipos

Implementado en `src/pages/equipos/index.astro` + isla
`components/react/modules/equipos/EquiposPanel.tsx`.

-   `lib/api/equipos.ts` — `GET/POST/PATCH/DELETE /equipos`, soporta
    filtro por `clienteId` ademas de `search`/paginacion
    (`FindEquiposQueryDto`).
-   `lib/hooks/useEquipos.ts` — mismo patron que `useClientes`.
-   `EquipoFormModal` — incluye `ClienteSelect`, un combobox
    reutilizable que busca clientes en vivo contra `/clientes`
    (se reutilizara en el modulo de Reparaciones).
-   La pagina acepta `?clienteId=&clienteNombre=` para mostrarse
    filtrada y con el cliente preseleccionado al crear un equipo
    nuevo (asi la usa el boton "ver equipos" desde Clientes).
-   Baja logica igual que Clientes (`deletedAt`).

Ambos modulos siguen el mismo patron de capas — `types/` → `lib/api/`
→ `lib/hooks/` → isla en `components/react/modules/<modulo>/` → pagina
en `src/pages/<modulo>/` — que se repetira para Reparaciones,
Inventario, etc.
