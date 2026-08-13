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
-   [x] Modulo Reparaciones (ordenes: listado, detalle, alta, edicion, cambio de estado, tecnicos, diagnosticos)
-   [x] Modulo Presupuestos (CRUD completo, embebido en la orden + vista global con filtro por estado)
-   [x] Modulo Inventario (productos, categorias, movimientos de stock)
-   [x] Modulo Compras (proveedores + registro de compras, inmutable)
-   [x] Modulo Entregas y Garantias (embebidos en la orden + vistas globales)
-   [ ] Modulos restantes (herramientas, ...)

## Modo de renderizado

El proyecto corre en **output: "server"** con el adaptador
`@astrojs/node` (modo `standalone`), no en `static`. Esto se decidio
al implementar `/reparaciones/[id]`: es una ruta dinamica cuyos IDs
se generan en runtime (no se pueden enumerar con `getStaticPaths` en
build time), asi que necesita SSR real.

```bash
npm run build
npm run start   # sirve dist/server/entry.mjs (por defecto en :4321)
```

Durante el desarrollo (`npm run dev`) esto no cambia nada del flujo
normal de Astro.

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
    (reutilizado tambien en Reparaciones).
-   La pagina acepta `?clienteId=&clienteNombre=` para mostrarse
    filtrada y con el cliente preseleccionado al crear un equipo
    nuevo (asi la usa el boton "ver equipos" desde Clientes).
-   Baja logica igual que Clientes (`deletedAt`).

## Modulo Reparaciones

El modulo central: conecta cliente + equipo + estado + tecnicos +
diagnosticos + presupuestos + historial. Paginas:

-   `src/pages/reparaciones/index.astro` — listado (isla `ReparacionesPanel`).
    Acepta `?clienteId=&equipoId=` para filtrar.
-   `src/pages/reparaciones/[id].astro` — detalle (isla `ReparacionDetail`).
    Requiere SSR (ver "Modo de renderizado" arriba); redirige a
    `/reparaciones` si el `id` no es numerico.

Capa de datos:

-   `types/estado-orden.ts` — catalogo `EstadoOrden`, consumido desde
    el nuevo `GET /estados-orden` (solo lectura, catalogo fijo
    sembrado por `sistema_taller.sql`: `RECIBIDO`, `DIAGNOSTICO`,
    `ESPERANDO_APROBACION`, `EN_REPARACION`, `PRUEBAS`,
    `LISTO_ENTREGA`, `ENTREGADO`, `CANCELADO`, `NO_REPARABLE`).
-   `types/reparacion.ts` — `OrdenReparacion` y todos los payloads
    (`CreateOrdenPayload`, `UpdateOrdenPayload`, `ChangeEstadoPayload`,
    `AssignTecnicoPayload`).
-   `lib/api/reparaciones.ts` — CRUD + `PATCH /reparaciones/:id/estado`
    + `POST/DELETE /reparaciones/:id/tecnicos`.
-   `lib/api/diagnosticos.ts`, `lib/api/usuarios.ts`, `lib/api/estadosOrden.ts`.
-   `lib/hooks/useReparaciones.ts` — `useReparaciones` (listado),
    `useReparacion` (detalle) y `useReparacionMutations` (create,
    update, changeEstado, assignTecnico, removeTecnico, remove,
    addDiagnostico), todo con invalidacion de cache coordinada entre
    listado y detalle.
-   `lib/utils/estado.ts` — mapeo de nombre de estado/prioridad a
    color y etiqueta legible (usado por el `Badge` generico).

Componentes de la isla de detalle (`components/react/modules/reparaciones/`):

-   `EstadoChanger` — cambia el estado con comentario opcional.
-   `TecnicosPanel` — asigna/quita tecnicos. **Nota:** `GET /usuarios`
    esta restringido a rol `Administrador` en el backend
    (`@Roles('Administrador')`); si el usuario logueado no tiene ese
    rol, el combobox de tecnicos mostrara un error 403 en vez de la
    lista. Esto se resolvera cuando implementemos permisos por rol en
    el frontend.
-   `DiagnosticosPanel` — lista los diagnosticos (vienen embebidos en
    el detalle de la orden) y permite registrar uno nuevo inline.
-   `PresupuestosPanel` — CRUD completo (alta, edicion, aprobar,
    rechazar, eliminar), ver seccion "Modulo Presupuestos" abajo.
-   `HistorialTimeline` — linea de tiempo de `historialOrden` (solo
    lectura, se llena automaticamente en el backend con cada cambio
    de estado).

Nuevo componente reutilizable: `EquipoSelect` (combobox de equipo,
filtrado por `clienteId`; se deshabilita hasta elegir un cliente).

## Modulo Presupuestos

Dos superficies distintas sobre el mismo recurso:

-   **Embebido en la orden** (`components/react/modules/reparaciones/PresupuestosPanel.tsx`,
    dentro de `/reparaciones/[id]`) — lista, crea, edita, aprueba,
    rechaza y elimina presupuestos de esa orden especifica.
-   **Vista global** (`src/pages/presupuestos/index.astro` + isla
    `components/react/modules/presupuestos/PresupuestosGlobalPanel.tsx`) —
    lista todos los presupuestos del taller, filtrable por estado,
    con enlace directo a la orden de cada uno. Al crear desde aqui
    (sin contexto de orden) se usa `OrdenSelect`, un combobox que
    busca ordenes por codigo/cliente contra `/reparaciones`.

Capa de datos: `types/presupuesto.ts`, `lib/api/presupuestos.ts`,
`lib/hooks/usePresupuestos.ts` (`usePresupuestos` para el listado,
`usePresupuestoMutations(ordenId?)` para create/update/changeEstado/
remove — si se pasa `ordenId`, ademas de invalidar el listado de
presupuestos invalida el detalle de esa orden).

Detalles de negocio importantes (ver `PresupuestosService` en el
backend):

-   **Al aprobar un presupuesto** (`estado: 'APROBADO'`), el backend
    sincroniza automaticamente `costoManoObra`, `totalRepuestos` y
    `total` de la orden asociada con los montos del presupuesto. Por
    eso las mutaciones invalidan tambien el detalle de la orden — el
    encabezado de `/reparaciones/[id]` refleja el nuevo total al
    instante.
-   `tecnicoId` se asigna automaticamente al usuario autenticado si
    se omite al crear; el formulario no lo expone (no tiene sentido
    reasignar el presupuesto a otro tecnico desde la UI por ahora).
-   `DELETE /presupuestos/:id` es un **borrado fisico** (no hay
    `deletedAt` en el modelo `Presupuesto`), a diferencia de Clientes/
    Equipos/Reparaciones que son baja logica — por eso el dialogo de
    confirmacion dice "Eliminar" y no "Desactivar".

Todos los modulos siguen el mismo patron de capas — `types/` →
`lib/api/` → `lib/hooks/` → isla(s) en
`components/react/modules/<modulo>/` → pagina(s) en
`src/pages/<modulo>/` — que se repetira para Inventario, Entregas,
Garantias, etc.

## Modulo Inventario

Tres recursos del backend (`/categorias-producto`, `/productos`,
`/movimientos-inventario`) unidos en dos paginas:

-   `src/pages/inventario/index.astro` — isla `ProductosPanel`:
    catalogo de productos con busqueda, filtro por categoria y
    checkbox "solo stock bajo" (`stockBajo=true`, comparacion
    `stockActual <= stockMinimo` que el backend resuelve en memoria).
-   `src/pages/inventario/movimientos.astro` — isla `MovimientosPanel`:
    historial global de movimientos, filtrable por producto (via
    `ProductoSelect`, reutilizado tambien en el formulario de
    movimiento). Acepta `?productoId=&productoNombre=`.

Regla de negocio clave, aplicada en toda la UI: **el stock nunca se
edita directamente**. `UpdateProductoDto` excluye `stockActual` a
proposito — el backend obliga a pasar por `/movimientos-inventario`
(tipos `ENTRADA`, `SALIDA`, `AJUSTE`). Por eso:

-   `ProductoFormModal` solo permite fijar `stockActual` (stock
    inicial) al **crear** un producto; en edicion ese campo se
    reemplaza por un texto informativo que remite a "Registrar
    movimiento".
-   Cada fila de la tabla de productos tiene una accion rapida
    (icono ⇄) que abre `MovimientoFormModal` con el producto **fijo**
    (`lockProducto`); desde la pagina de Movimientos, en cambio, el
    producto viene precargado si hay filtro activo pero sigue siendo
    editable.
-   Al registrar un movimiento se invalida tambien el listado de
    productos (`lib/hooks/useMovimientos.ts`), para que el stock
    mostrado se actualice al instante.

Categorias se gestionan con `CategoriasManagerModal` — un modal
autocontenido (lista + alta/edicion inline) accesible desde el boton
"Categorias" del listado de productos o desde el propio formulario de
producto ("Gestionar categorias"). `DELETE /categorias-producto/:id`
falla con 409 si la categoria tiene productos asociados (restriccion
de llave foranea); el mensaje de error del backend se muestra tal
cual en el modal.

Capa de datos: `types/categoria.ts`, `types/producto.ts`,
`types/movimiento.ts`; `lib/api/categorias.ts`, `lib/api/productos.ts`,
`lib/api/movimientos.ts`; `lib/hooks/useCategorias.ts`,
`lib/hooks/useProductos.ts`, `lib/hooks/useMovimientos.ts`. Nuevo
componente reutilizable: `ProductoSelect` (combobox de producto por
busqueda, muestra el stock actual en cada opcion).

Todos los modulos siguen el mismo patron de capas — `types/` →
`lib/api/` → `lib/hooks/` → isla(s) en
`components/react/modules/<modulo>/` → pagina(s) en
`src/pages/<modulo>/` — que se repetira para Compras, Entregas,
Garantias, Herramientas, etc.

## Modulo Compras

`src/pages/compras/index.astro` + isla
`components/react/modules/compras/ComprasPanel.tsx`.

Regla de negocio clave: **las compras son inmutables**. El backend
solo expone `GET /compras` y `POST /compras` — no hay `PATCH` ni
`DELETE` (para corregir un error se usa un movimiento de ajuste
manual en Inventario). Por eso la UI no tiene edicion ni baja: hacer
clic en el numero de una compra abre `CompraDetailModal`, un modal de
**solo lectura** con el desglose completo (incluye el aviso explicito
de por que no es editable).

`CompraFormModal` registra una compra nueva con **lineas de detalle
dinamicas** (agregar/quitar producto), cada una con su propio
`ProductoSelect`, cantidad y precio unitario; calcula subtotal por
linea y total general en vivo. Al confirmar, el backend crea la
compra Y genera automaticamente un movimiento `ENTRADA` de inventario
por cada linea — por eso `useCompraMutations` invalida tambien
`productos` y `movimientos-inventario` ademas de `compras`.

**Crear un producto nuevo sin salir de la compra:** si el producto
que se esta comprando todavia no existe en el catalogo, cada
`ProductoSelect` de una linea tiene un boton "Crear producto
'<termino buscado>'" al fondo del dropdown. Abre `ProductoFormModal`
anidado (un modal sobre otro) en modo alta rapida:

-   El nombre buscado se precarga en el formulario (`initialNombre`).
-   El campo de stock inicial se oculta y se fuerza a **0**
    (`lockStockZero`) — el stock real lo va a establecer la propia
    compra al confirmarse via su movimiento `ENTRADA` automatico. Si
    se dejara elegir un stock inicial aqui, se duplicaria: el
    producto arrancaria con ese stock Y la compra sumaria encima,
    dejando un numero mayor al que realmente ingreso al taller.
-   Al crear, el producto queda automaticamente seleccionado en esa
    linea (`onCreated`) sin cerrar el formulario de compra.

Proveedores (recurso CRUD simple, igual patron que Categorias) se
gestionan con `ProveedoresManagerModal`, accesible desde el boton
"Proveedores" del listado. `DELETE /proveedores/:id` falla con 409 si
el proveedor tiene compras registradas (igual que categorias con
productos).

Capa de datos: `types/proveedor.ts`, `types/compra.ts`,
`lib/api/proveedores.ts`, `lib/api/compras.ts`,
`lib/hooks/useProveedores.ts`, `lib/hooks/useCompras.ts`.

Todos los modulos siguen el mismo patron de capas — `types/` →
`lib/api/` → `lib/hooks/` → isla(s) en
`components/react/modules/<modulo>/` → pagina(s) en
`src/pages/<modulo>/` — que se repetira para Entregas, Garantias,
Herramientas, etc.

## Modulo Entregas y Garantias

Ambos recursos tienen **relacion 1-1 con una OrdenReparacion** y
cierran el ciclo de vida de una orden, asi que viven en dos lugares:

-   **Embebidos en el detalle de la orden** — nuevas secciones en
    `ReparacionDetail.tsx`: `EntregaPanel` y `GarantiaPanel`. Cada una
    muestra el registro si ya existe, o un formulario compacto para
    crearlo si no.
-   **Vistas globales** — `src/pages/entregas/index.astro` y
    `src/pages/garantias/index.astro` (isla `EntregasPanel` /
    `GarantiasPanel`), con boton "Registrar..." que usa `OrdenSelect`
    para elegir la orden desde cero.

Reglas de negocio del backend que la UI respeta:

-   **Entrega → marca la orden ENTREGADO automaticamente.** Por eso
    `EntregaPanel`/`EntregaFormModal` avisan esto antes de confirmar.
    Solo puede existir una entrega por orden (`POST /entregas` falla
    con 409 si ya existe); no hay `PATCH`/`DELETE`.
-   **Garantia requiere que la orden ya tenga Entrega.** Si no la
    tiene, `POST /garantias` responde 400. `GarantiaPanel` verifica
    esto de antemano (via `useEntregaByOrden`) y muestra un mensaje
    en vez de un formulario que fallaria al enviar.
-   `fechaInicio`/`fechaFin` de la garantia los calcula el backend
    (fecha de entrega + dias) — el formulario solo pide `dias`.
-   Cambio de estado de garantia (`ACTIVA` → `VENCIDA`/`ANULADA`) via
    `PATCH /garantias/:id/estado`, disponible tanto en el panel
    embebido como en la vista global (botones inline por fila).

Detalle tecnico de por que `GarantiaPanel` usa un campo distinto al
de `EntregaPanel`: no existe `GET /garantias/orden/:id` en el
backend (solo existe para entregas), asi que la garantia de una
orden se lee del campo `garantia` ya embebido en
`GET /reparaciones/:id` (`types/reparacion.ts`) en vez de una
consulta aparte — mientras que `EntregaPanel` si usa su propio
`GET /entregas/orden/:id` (mas rico, incluye `usuarioEntrega`).

Capa de datos: `types/entrega.ts`, `types/garantia.ts`,
`lib/api/entregas.ts`, `lib/api/garantias.ts`,
`lib/hooks/useEntregas.ts` (incluye `useEntregaByOrden`, que trata un
404 como "todavia no tiene entrega" en vez de un error real),
`lib/hooks/useGarantias.ts`.

Todos los modulos siguen el mismo patron de capas — `types/` →
`lib/api/` → `lib/hooks/` → isla(s) en
`components/react/modules/<modulo>/` → pagina(s) en
`src/pages/<modulo>/` — que se repetira para Herramientas, el ultimo
modulo pendiente.
