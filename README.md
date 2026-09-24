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
-   [x] Modulo Herramientas (inventario + asignaciones a tecnicos)
-   [x] Modulo Usuarios completo (CRUD, Roles con matriz de permisos,
    Mi Perfil, reseteo de contraseña por Admin, RBAC aplicado en toda
    la app via usePermiso)
-   [x] Modulo Configuracion (datos generales del taller, singleton)
-   [x] Modulo Reportes (7 reportes con filtros + descarga de PDF)

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

## Modulo Herramientas

Dos paginas: `src/pages/herramientas/index.astro` (isla
`HerramientasPanel`) y `src/pages/herramientas/asignaciones.astro`
(isla `AsignacionesPanel`, historial global de prestamos con
checkbox "solo activos").

Reglas de negocio que definieron la UI:

-   **No hay `DELETE`.** Una herramienta se retira cambiando su
    estado a `BAJA` via `PATCH /herramientas/:id/estado` — no existe
    boton de "eliminar" en ningun lado.
-   **`ASIGNADA` es un estado automatico**, no seteable a mano: lo
    pone el backend al asignar (`POST /herramientas/:id/asignar`) y
    lo quita al devolver (`PATCH /herramientas/asignaciones/:id/devolver`).
    Los botones de cambio de estado manual
    (`DISPONIBLE`/`MANTENIMIENTO`/`BAJA`) se ocultan mientras la
    herramienta esta asignada — el backend los rechazaria con 409
    de todas formas ("regístrala como devuelta antes").
-   **Asignar exige `estado === DISPONIBLE`**; por eso el boton de
    asignar (icono ⇄) solo aparece en filas con ese estado.
-   `GET /herramientas` admite `search` (nombre, marca, modelo,
    numero de serie) y `estado`, agregados al backend en
    `FindHerramientasQueryDto` (antes solo tenia paginacion) — asi
    que `HerramientasPanel` tiene el mismo patron de `SearchInput` +
    `<select>` que Reparaciones/Inventario.

Detalle de implementacion para evitar N+1 peticiones: la tabla
principal necesita saber, por cada herramienta `ASIGNADA`, el `id`
de su asignacion activa (para el boton "Devolver"), pero el listado
de herramientas no lo incluye. En vez de pedirlo herramienta por
herramienta, `HerramientasPanel` hace **una sola** llamada a
`GET /herramientas/asignaciones?activas=true&limit=100` y arma un
mapa `herramientaId → asignacionId` en memoria.

`HerramientaDetailModal` (icono ojo) es donde vive el flujo completo:
info, cambio de estado, historial de las ultimas 10 asignaciones
(viene embebido en `GET /herramientas/:id`) y registrar devolucion
si esta prestada.

Nuevo componente reutilizable: `UsuarioSelect` — a diferencia de
`ClienteSelect`/`ProductoSelect`/`OrdenSelect`, `GET /usuarios` no
admite busqueda por query ni paginacion (y esta restringido a rol
Administrador, la misma limitacion que ya se documento para el
selector de tecnicos en Reparaciones), asi que trae la lista
completa una vez y filtra en el cliente.

Capa de datos: `types/herramienta.ts`, `lib/api/herramientas.ts`,
`lib/hooks/useHerramientas.ts`, `lib/hooks/useAsignaciones.ts`.

## Modulo Usuarios

`src/pages/usuarios/index.astro` + isla
`components/react/modules/usuarios/UsuariosPanel.tsx`. Alcance
acotado a proposito: **CRUD de usuarios unicamente**, sin pantalla de
gestion de Roles (el `<select>` de rol en el formulario lee
`GET /roles`, que es de lectura libre, pero crear/editar/eliminar
roles queda pendiente).

Dos acciones de "baja" bien diferenciadas, porque el backend en
realidad expone dos mecanismos distintos y no son lo mismo:

-   **Boton ⏻ (encendido/apagado)** — hace `PATCH /usuarios/:id` con
    `{ estado: false }`. **Reversible**: el usuario sigue apareciendo
    en la lista (marcado "Inactivo") y se puede reactivar con el
    mismo boton. Pensado para bloquear el acceso temporalmente (ej.
    alguien de vacaciones o baja médica).
-   **Boton de basurero** — hace `DELETE /usuarios/:id`. El backend
    ahi si setea `deletedAt` ademas de `estado: false`, y tanto
    `GET /usuarios` como `GET /usuarios/:id` filtran
    `deletedAt: null`. Resultado: el usuario **desaparece por
    completo de la API**, sin ningun endpoint para recuperarlo. Por
    eso el dialogo de confirmacion lo dice explicitamente y sugiere
    usar el boton ⏻ en su lugar si la intencion era solo bloquearlo.

Otras notas:

-   `GET /usuarios` no pagina (devuelve un array plano) ni admite
    `search` — `UsuariosPanel` trae la lista completa una vez y
    filtra en el cliente (mismo enfoque que `UsuarioSelect`, que ya
    usaban Reparaciones y Herramientas).
-   La contraseña de otro usuario **no se puede cambiar desde este
    formulario** — `UpdateUsuarioDto` la excluye a proposito; el
    backend solo expone `PATCH /usuarios/me/password`
    (autoservicio, requiere la contraseña actual). Eso implica una
    pantalla de "mi perfil" aparte, fuera del alcance de este pase.
-   Todo el modulo esta protegido por `@Roles('Administrador')` en
    el backend; si el usuario logueado no es admin, `UsuariosPanel`
    muestra el mensaje de error del 403 en vez de un listado vacio
    confuso.

Capa de datos: `types/usuario.ts` (payloads; `Usuario`/`Rol` ya
vivian en `types/auth.ts`), `lib/api/roles.ts` (solo `findAll`,
usado unicamente para el `<select>`), `lib/api/usuarios.ts` (ahora
con `findOne/create/update/remove` ademas del `findAll` que ya
usaban Reparaciones/Herramientas), `lib/hooks/useUsuarios.ts` (ahora
tambien exporta `useUsuarioMutations`), `lib/hooks/useRoles.ts`.

Pendiente dentro de Administracion: **Configuracion** (ajustes del
taller, un solo formulario) y **Reportes** (7 reportes con descarga
de PDF) — quedaron fuera de este pase a proposito, ver conversacion.

## Sistema de permisos (RBAC dinamico)

Este es el corazon de seguridad de toda la app, construido sobre el
backend nuevo (`Permiso`, `RolPermiso`, `PermissionsGuard`). Reemplaza
el enfoque anterior de "roles hardcodeados" por una matriz
recurso×accion editable en runtime desde la UI.

### Flujo de datos

-   `GET /auth/me` devuelve **el payload del JWT + `permisos: string[]`**
    (formato `"recurso:accion"`), NO el perfil completo (sin
    nombre/apellido/telefono). Es intencional: separa "quien sos y que
    podes hacer" (siempre fresco) de "como te mostramos" (mas pesado).
-   Por eso `lib/api/client.ts` ahora tambien persiste un **snapshot
    del usuario** (`setUsuario`/`getStoredUsuario`) tomado de la
    respuesta de `POST /auth/login`, usado solo para mostrar
    nombre/apellido/email/telefono en la UI (Navbar, Mi Perfil). Puede
    quedar desactualizado si el perfil se edita desde otra sesion —
    se refresca en el proximo login. Si esto molesta, la solucion de
    fondo es que el backend agregue un endpoint self-service de
    perfil completo (`GET /usuarios/me`), que hoy no existe.
-   `lib/hooks/useAuth.ts` combina ambas fuentes y expone
    `hasPermiso(permiso)` y el hook standalone `usePermiso(permiso)`.

### Roles y matriz de permisos

-   `src/pages/roles/index.astro` (`RolesPanel`) — CRUD de roles
    (nombre, descripcion), con conteo de usuarios y boton de escudo
    por fila que lleva a la matriz.
-   `src/pages/roles/[id]/permisos.astro` (`PermisosMatrix`) — tabla
    recurso×accion con checkboxes (14 recursos × 4 acciones = 56
    celdas, algunas vacias si ese recurso no tiene esa accion en el
    catalogo — ver abajo). Click en el nombre de un recurso
    marca/desmarca toda la fila. "Guardar" llama a
    `PUT /roles/:id/permisos` con el set completo (reemplaza, no hace
    toggle individual — mas simple de razonar con checkboxes).
-   Ambas paginas requieren `@Roles('Administrador')` **hardcodeado**
    en el backend (no `PermissionsGuard`) a proposito: si se pudiera
    quitarle a Administrador el permiso `roles:editar` desde la propia
    UI de permisos, nadie podria volver a entrar a arreglarlo. Por
    eso, si el usuario logueado no es Administrador, `RolesPanel` y
    `PermisosMatrix` muestran el 403 con `AccessDenied` en vez de
    intentar renderizar una matriz vacia.

### Recursos reales usados por el backend (confirmados, no supuestos)

Se verificaron los `@RequirePermission('recurso:accion')` exactos en
cada controller antes de aplicar nada en el frontend:

| Recurso | Acciones disponibles |
|---|---|
| `clientes` | ver, crear, editar, eliminar |
| `equipos` | ver, crear, editar, eliminar |
| `reparaciones` | ver, crear, editar, eliminar (editar cubre tambien cambiar estado y asignar/quitar tecnico) |
| `diagnosticos` | ver, crear, editar, eliminar |
| `presupuestos` | ver, crear, editar, eliminar |
| `inventario` | ver, crear, editar, eliminar (cubre productos + categorias + movimientos) |
| `compras` | ver, crear, editar, eliminar (cubre compras + proveedores) |
| `entregas` | ver, crear (sin editar/eliminar — una entrega no se modifica) |
| `garantias` | ver, crear, editar (sin eliminar; editar = cambiar estado) |
| `herramientas` | ver, crear, editar (sin eliminar — no hay DELETE en el backend; editar cubre asignar/devolver/cambiar estado) |
| `usuarios`, `roles`, `configuracion`, `reportes` | protegidos con `@Roles('Administrador')` clasico, no con permisos dinamicos |

### Donde se aplico `usePermiso()` en el frontend

En **todos** los modulos de negocio ya construidos, siguiendo el mismo
patron: ocultar (no solo deshabilitar) los botones de crear/editar/
eliminar segun corresponda, y mostrar `AccessDenied` si la peticion de
listado devuelve 403:

-   **Clientes/Equipos** — botones Nuevo/Editar/Eliminar.
-   **Reparaciones** — boton Nueva orden en el listado; boton Editar,
    `EstadoChanger` (select+boton deshabilitados) y `TecnicosPanel`
    (asignar/quitar oculto) en el detalle, todos gateados por
    `reparaciones:editar`.
-   **Diagnosticos** (embebido en la orden) — boton "Registrar
    diagnostico" gateado por `diagnosticos:crear`.
-   **Presupuestos** (embebido en la orden) — crear/editar/eliminar/
    aprobar/rechazar gateados por `presupuestos:crear/editar/eliminar`.
-   **Entregas/Garantias** (embebidos en la orden) — formulario de
    alta gateado por `entregas:crear`/`garantias:crear`; los botones
    "Marcar vencida/anulada" de garantia por `garantias:editar`.
-   **Inventario** — Productos (`ProductosPanel`), Movimientos
    (`MovimientosPanel`) y el mini-CRUD de Categorias
    (`CategoriasManagerModal`), todos con `inventario:crear/editar/eliminar`.
-   **Compras** — boton "Registrar compra" (`compras:crear`);
    `ProveedoresManagerModal` con `compras:crear/editar/eliminar`; la
    creacion rapida de un producto nuevo *dentro* del formulario de
    compra usa `inventario:crear` (es un permiso distinto al de la
    compra en si, y se verifica por separado).
-   **Herramientas** — boton "Nueva herramienta" (`herramientas:crear`);
    editar/asignar/devolver/cambiar-estado en la tabla y en
    `HerramientaDetailModal` (`herramientas:editar`).

Nuevo componente reutilizable: `components/react/ui/AccessDenied.tsx`.

### Importante: esto es UX, no seguridad

`usePermiso()` decide que se **muestra**, nunca que se **permite**. La
seguridad real la impone el backend con `PermissionsGuard` en cada
endpoint — si alguien igual dispara la peticion (herramientas de dev,
`curl`, editar el DOM), el backend la rechaza con 403 sin importar lo
que el frontend haya ocultado. El frontend simplemente evita que un
usuario sin permiso vea u opere botones que de todas formas fallarian,
para que la experiencia sea coherente en vez de confusa.

### Mi Perfil y contraseñas

-   `src/pages/perfil/index.astro` (`PerfilPanel`) — muestra el
    snapshot del usuario + rol actual, y un boton "Cambiar mi
    contraseña" que abre `ChangePasswordModal`
    (`PATCH /usuarios/me/password`, exige la contraseña actual).
-   `ResetPasswordModal` — accesible solo desde `UsuariosPanel` (icono
    de llave por fila), usa `PATCH /usuarios/:id/password` para que un
    Administrador fije una contraseña nueva a **otro** usuario sin
    conocer la actual. Endpoint distinto al de arriba, coexisten.
-   `UserMenu` (navbar) ahora linkea a `/perfil` al hacer click en el
    nombre, ademas de mostrar el rol actual (antes solo mostraba
    nombre y boton de logout).

### Que quedo pendiente (fuera de este pase)

-   **Perfil desactualizado entre sesiones**, como se explico arriba
    (requeriria un endpoint `GET /usuarios/me` en el backend).

### Sidebar filtrado por rol (`SidebarNav`)

`Sidebar.astro` dejo de renderizar el `<nav>` directamente: ahora monta
la isla `components/react/layout/SidebarNav.tsx` (`client:load`), que
lee `rolNombre` de `useAuth()` y oculta los items marcados
`adminOnly: true` en la definicion de `groups` si el usuario logueado
no es `'Administrador'`. Si un grupo entero queda sin items visibles
(como "Administración" para un no-admin), el grupo completo desaparece
— no queda un titulo huerfano sin links debajo.

Esto reemplaza la limitacion documentada antes ("el Sidebar no filtra
por permiso"): ya no era sostenible mostrar siempre los links de
Usuarios/Roles/Compras/Herramientas cuando la mayoria de usuarios no
deberia ni saber que existen esas pantallas.

**Items marcados `adminOnly` (visibles solo para rol Administrador,
sin importar los permisos dinamicos que tenga asignado el rol):**

-   Grupo Administración completo: Usuarios, Roles, Reportes, Configuración.
-   Dentro de Inventario: Compras, Herramientas, Asignaciones.
-   Productos y Movimientos (los otros dos items de Inventario) siguen
    visibles para todos — se filtran por permiso (`inventario:*`)
    dentro de la propia pagina, no a nivel de sidebar.

**Nota de diseño:** esta es una regla mas simple y estricta que el
sistema de permisos dinamicos ("solo Administrador ve el link", en vez
de "se ve si el rol tiene el permiso `compras:ver`"). Fue una decision
explicita para estos modulos puntuales, no una limitacion tecnica —
si mas adelante se quiere que, por ejemplo, un rol `Almacen` vea
Compras/Herramientas sin ser Administrador, hay que cambiar la
condicion en `SidebarNav.tsx` de `rolNombre === 'Administrador'` a
`hasPermiso('compras:ver')` (el backend ya lo soportaria sin cambios,
la matriz de permisos de esos recursos ya existe).

**Trade-off de UX:** como los permisos se resuelven client-side (no
hay cookies, no hay SSR de auth), mientras `/auth/me` esta cargando
los items `adminOnly` se ocultan por defecto — incluso para un
Administrador real va a haber un instante brevisimo donde esos links
no estan, hasta que la consulta resuelve. Se prefirio eso a mostrarlos
primero y ocultarlos despues (evita el flash de "Usuarios/Compras" a
alguien que no deberia verlos ni un instante).

### Fix: selector de técnicos en Reparaciones ya no depende de `GET /usuarios`

El backend agrego `GET /reparaciones/tecnicos` (protegido con
`reparaciones:editar`, no con `@Roles('Administrador')`), que devuelve
solo usuarios activos con rol Tecnico (`{ id, nombre, apellido }`, sin
el objeto `rol` — ya viene pre-filtrado). Esto reemplaza la dependencia
anterior de `GET /usuarios` en `TecnicosPanel`, que le devolvia 403 a
cualquier Tecnico o Recepcion que intentara asignar un compañero a una
orden, aun teniendo permiso sobre Reparaciones.

Cambios: `types/reparacion.ts` (tipo `Tecnico`), `lib/api/reparaciones.ts`
(`findTecnicos`), `lib/hooks/useReparaciones.ts` (`useTecnicos`),
`TecnicosPanel.tsx` (usa `useTecnicos` en vez de `useUsuarios`).

**Pendiente — mismo problema en otro lado:** `AsignarHerramientaFormModal`
(via `UsuarioSelect`) todavia depende de `GET /usuarios` para elegir a
quien asignarle una herramienta, y ese endpoint sigue siendo
`@Roles('Administrador')` exclusivamente. Un usuario con
`herramientas:editar` pero sin ser Administrador va a seguir
recibiendo 403 ahi. No se toco en este pase porque el backend no trajo
un endpoint equivalente para Herramientas — necesitaria algo como
`GET /herramientas/usuarios-disponibles` (o abrir `GET /usuarios` a
`usuarios:ver`/`herramientas:editar` en vez de al rol hardcodeado).

## Modulo Configuracion

`src/pages/configuracion/index.astro` + isla
`components/react/modules/configuracion/ConfiguracionPanel.tsx`.
Es una fila unica (singleton, `id=1`) con los datos generales del
taller: nombre, contacto, moneda/simbolo, y un mensaje libre que se
imprime al pie de documentos.

Particularidad de permisos, distinta al resto de la app: `GET
/configuracion` es libre para **cualquier usuario autenticado** (el
propio backend lo comenta explicitamente: "la usa el frontend para
mostrar nombre del taller, moneda, etc."), pero `PATCH` exige rol
Administrador con el guard clasico (`@Roles`, no el sistema de
permisos dinamicos — mismo patron que Usuarios/Roles/Reportes).

Como el link ya esta marcado `adminOnly` en el Sidebar, en la practica
un no-admin no deberia llegar aca por navegacion normal. Aun asi, el
panel respeta lo que el backend permite en vez de bloquear la pagina
entera: si alguien no-admin entra igual (URL directa), ve el
formulario **con los valores actuales, pero deshabilitado**
(`<fieldset disabled>`) y una nota explicando por que no puede
guardar — refleja fielmente que el GET es publico y el PATCH no,
en vez de tratar todo el modulo como todo-o-nada.

Capa de datos: `types/configuracion.ts`, `lib/api/configuracion.ts`,
`lib/hooks/useConfiguracion.ts`.

**Nota para una futura mejora (no incluida en este pase):** ahora que
existe un `simbolo` de moneda configurable (por defecto `"Bs"`), vale
la pena revisar que varios modulos (Inventario, Compras, Presupuestos,
Reparaciones, Herramientas) tienen el simbolo `"Bs"` **hardcodeado**
en sus funciones `formatMonto`/`formatFecha` locales en vez de leerlo
de `useConfiguracion()`. Funciona hoy porque el valor por defecto
coincide, pero si el taller cambia de moneda no se actualizaria en
ningun otro lado. Es un refactor transversal (toca ~8 archivos), no
se hizo aca porque no fue parte de lo pedido.

## Modulo Reportes

`src/pages/reportes/index.astro` + isla `ReportesPanel.tsx`. Los 7
reportes viven como pestañas dentro de una sola pagina (no 7 rutas
separadas), cada uno con su propio componente en
`components/react/modules/reportes/`:

| Pestaña | Componente | Filtros | Endpoint JSON |
|---|---|---|---|
| Reparaciones por estado | `ReparacionesPorEstadoReport` | mes, año (default: actual) | `/reportes/reparaciones-por-estado` |
| Ingresos | `IngresosReport` | fechaInicio/fechaFin (**obligatorias**) | `/reportes/ingresos` |
| Stock bajo | `StockBajoReport` | ninguno | `/reportes/stock-bajo` |
| Técnicos | `TecnicosMasOrdenesReport` | fechas opcionales, top N | `/reportes/tecnicos-mas-ordenes` |
| Por tipo de equipo | `OrdenesPorTipoServicioReport` | fechas opcionales | `/reportes/ordenes-por-tipo-servicio` |
| Clientes frecuentes | `ClientesFrecuentesReport` | minOrdenes, limit | `/reportes/clientes-frecuentes` |
| Órdenes con retraso | `OrdenesConRetrasoReport` | ninguno | `/reportes/ordenes-retraso` |

Cada uno tiene su endpoint `/pdf` hermano con los mismos filtros,
para descargar el mismo contenido como PDF.

### Como funciona la descarga de PDF

Los endpoints `/pdf` estan protegidos igual que el resto de la API
(Bearer token) y devuelven un `StreamableFile`, no JSON. Un
`<a href="/reportes/.../pdf">` plano no funcionaria: el navegador
navegaria sin el header `Authorization` y el backend respondaria 401.
Por eso se agrego `downloadFile(path, filename)` en
`lib/api/client.ts`: hace `fetch` manual con el token, arma un `Blob`
con la respuesta, y dispara la descarga con un `<a>` temporal apuntando
a un object URL (`URL.createObjectURL` + click programatico +
`revokeObjectURL`). Cada reporte envuelve su llamada `*Pdf` de
`reportesApi` en `useDownloadPdf` (un wrapper fino sobre
`useMutation`) para tener `isPending`/`error` resueltos sin manejar
loading a mano.

### Componentes reutilizables nuevos

-   `ReporteShell.tsx` — layout comun a los 7: descripcion, fila de
    filtros + boton "Descargar PDF", chips de resumen (ej. "Total de
    ordenes: 42"), y el area de contenido (la tabla) con skeleton de
    carga.
-   `ReporteTable.tsx` — tabla de solo lectura generica
    (`columns: {key, header, align, render?}[]`, `rows: T[]`), sin
    necesidad de `getRowId` como `DataTable` porque estas filas no se
    editan ni seleccionan — se indexan por posicion.

### Permisos

Los 7 reportes estan protegidos con `@Roles('Administrador')` clasico
en el backend (no el sistema de permisos dinamicos), igual que
Usuarios/Roles/Configuracion. El link del sidebar ya esta marcado
`adminOnly`, asi que un no-admin no deberia llegar aca por navegacion
normal; si de todas formas entra por URL directa, cada peticion
JSON/PDF simplemente devuelve 403 (no se agrego una pantalla
`AccessDenied` especial para Reportes porque, a diferencia de
Clientes/Compras/etc., aca no hay nada que editar — el 403 en la
descarga de PDF ya es un mensaje de error suficientemente claro via
`ReporteShell`).

Capa de datos: `types/reporte.ts` (una interfaz de respuesta y una de
query por cada reporte, mas la union `ReporteKey`), `lib/api/reportes.ts`,
`lib/hooks/useReportes.ts` (un hook de query por reporte + el
`useDownloadPdf` compartido).

Con este modulo se completaron **todos** los items del sidebar.
