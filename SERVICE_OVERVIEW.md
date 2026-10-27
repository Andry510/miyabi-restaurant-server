# Miyabi Restaurant Server — Visión técnica del servicio

Cómo está construido por dentro el servidor local del restaurante. Para instalarlo y correrlo, lee [`README.md`](./README.md). Las convenciones de código son las mismas de la nube ([`miyabi-api/CLAUDE.md`](../miyabi-api/CLAUDE.md)); aquí se describen las diferencias propias del restaurante.

## Tabla de contenido

1. [Arquitectura general](#1-arquitectura-general)
2. [Recorrido de una petición](#2-recorrido-de-una-petición)
3. [Estructura del código](#3-estructura-del-código)
4. [Anatomía de un módulo](#4-anatomía-de-un-módulo)
5. [Catálogo de módulos](#5-catálogo-de-módulos)
6. [Rutas REST](#6-rutas-rest)
7. [Seguridad y acceso](#7-seguridad-y-acceso)
8. [Comunicación con la nube](#8-comunicación-con-la-nube)
9. [Reglas de negocio del local](#9-reglas-de-negocio-del-local)
10. [Formato de las respuestas y códigos](#10-formato-de-las-respuestas-y-códigos)
11. [Utilidades reutilizables](#11-utilidades-reutilizables)
12. [Nomenclatura](#12-nomenclatura)
13. [Notas técnicas y pendientes](#13-notas-técnicas-y-pendientes)
14. [Cómo agregar una ruta](#14-cómo-agregar-una-ruta)

---

## 1. Arquitectura general

```
 App del empleado ──┐                       ┌── gRPC  (CLOUD_GRPC_URL)   ── miyabi-api
                    ├── REST /v1 ── Servidor del restaurante
 App del gerente ───┘        │              └── socket.io (CLOUD_SOCKET_URL) ── miyabi-api
                             │
                       PostgreSQL local
```

- **Stack:** NestJS 11, Prisma 7 (`@prisma/adapter-pg`), valibot, `@grpc/grpc-js` como cliente, `socket.io-client`, Argon2 y JWT.
- **Una sola entrada:** REST con versión en la URL (`enableVersioning`). No hay microservicio gRPC propio: el servidor es **cliente** del gRPC de la nube.
- **Dos tipos de usuario:**
  - **Empleado:** existe en la base local, inicia sesión contra el servidor y usa tokens firmados con los secretos del `.env`.
  - **Gerente:** es un usuario de la nube con rol `restaurant`. Inicia sesión en la nube (a través del servidor) y cada petición suya se valida contra la nube con `session.validate`.
- **Dos lados en cada módulo:** `local/` atiende con la base del local; `cloud/` reenvía a la nube por gRPC. La separación se repite en controllers, routers, services, repositories, interfaces y tipos.
- **Sin internet:** lo `local/` de empleados sigue funcionando. Lo que necesita a la nube responde **503** `ERROR_CLOUD_UNAVAILABLE`.

## 2. Recorrido de una petición

1. **Express + versionado** reciben `/v1/...`.
2. **Guards globales** (`APP_GUARD`, en este orden):
   1. `HttpPairingGuard`: sin `SERVER_TOKEN` responde 409 `ERROR_SERVER_NOT_PAIRED` (salvo `@HttpPairingAccess()`).
   2. `HttpLocalAccessGuard`: solo en `@HttpLocalAccess()`. Valida el JWT local, la sesión y que el empleado esté activo; deja el empleado en `request.user`.
   3. `HttpManagerAccessGuard`: solo en `@HttpManagerAccess()`. Llama a `session.validate` de la nube con el Bearer y el `server_token`.
3. **Pipe del controller** (`@UsePipes(HttpValibotPipe)`): valida `@Param`, `@Query` y `@Body` con el `static schema` de cada DTO; si falla lanza 400 `ERROR_BAD_REQUEST`.
4. **Controller** llama a su `service` y responde con `@Res()`: `ControllerResponseMapper` si sale bien, `HttpErrorMapper.reply` si falla.
5. **Service** orquesta y devuelve `ResultPattern`. Los repositorios `local/` usan Prisma; los `cloud/` usan `CloudRequest`.
6. **`HttpExceptionFilter`** (global, en `main.ts`) da el mismo formato con `code` a lo que Nest responde por su cuenta (ruta inexistente, JSON mal formado, error inesperado).

Los diagramas `documents/diagrams/workflows/common/local/*-guard.drawio` y `sequences/manager-access.drawio` muestran este recorrido.

## 3. Estructura del código

```
src/
├── main.ts / app.module.ts     arranque, CORS, versionado, filtro y guards globales
├── common/
│   ├── decorators/access/      @HttpLocalAccess, @HttpManagerAccess, @HttpPairingAccess
│   ├── decorators/request/http @HttpUser, @HttpAuthorization (token)
│   ├── filters/                HttpExceptionFilter
│   ├── guards/                 HttpPairingGuard, HttpLocalAccessGuard, HttpManagerAccessGuard
│   ├── interceptors/           HttpPictureInterceptor (multipart, 6 MB)
│   ├── messages/               API_MESSAGE_GLOBAL, SYSTEM_MESSAGE
│   └── pipes/                  HttpValibotPipe
├── domain/                     enums, errors (ServiceError), patterns (ResultPattern, factories),
│                               schemas (env y compartidos), types, value-objects
├── infrastructure/
│   ├── config/                 Env (valibot), CORS, versionado
│   ├── constants/              logger, metadata gRPC, estados gRPC, base de datos
│   ├── database/               DatabaseModule, DatabaseService (Prisma), errores de Prisma
│   ├── grpc/cloud/             CloudModule, CloudRequest, CloudErrorMapper, protos de la nube
│   ├── http/                   extracción de token y cliente, tipos de Express
│   ├── mappers/shared/         ControllerResponseMapper, HttpErrorMapper, ServiceResultMapper
│   ├── securities/             Argon2, JWT, crypto (SecurityModule)
│   └── utils/                  TimeZone, Duration, Money, Machine, TokenPayload
└── modules/                    un módulo por recurso (sección 5)
```

## 4. Anatomía de un módulo

Igual que en la nube (`miyabi-api/CLAUDE.md` §3), con `local/` y `cloud/` donde la nube usa `grpc/` y `http/`:

```
<módulo>/
├── <módulo>.module.ts, index.ts
├── api/
│   ├── controllers/http/{local,cloud}/   XHttpController (local: LocalXHttpController si hay los dos)
│   ├── messages/                         API_X_MESSAGE { code, message }, ERROR_MESSAGE_SCHEMA
│   └── routers/http/{local,cloud}/       HTTP_LOCAL_X_ROUTER / HTTP_CLOUD_X_ROUTER
├── application/
│   ├── dto/                              clases con static schema
│   └── services/{local,cloud}/ + index   X_SERVICES_PROVIDERS
├── domain/
│   ├── aggregates/, entities/, policies/
│   ├── interfaces/{repositories,services}/{local,cloud}/
│   ├── schemas/
│   └── types/{entities,services,repositories}/{local,cloud}/
└── infrastructure/
    ├── constants/                        X_PROVIDER_TOKENS, X_LOGGER_NAME
    ├── mappers/{local,cloud}/
    └── repositories/{local,cloud}/ + index   X_REPOSITORIES_PROVIDERS
```

- Cada subcarpeta `local/` y `cloud/` tiene su `index.ts`, y la carpeta padre importa desde `./local` y `./cloud`.
- Un controller por recurso, con un solo `service` inyectado (por ejemplo `user` tiene `UserHttpController`, `SessionHttpController` y `AttendanceHttpController`).
- Las rutas llevan el lado en la URL: `users/local/...`, `products/cloud/...`.

## 5. Catálogo de módulos

| Módulo | Lado | Qué hace |
|---|---|---|
| `authentication` | local + cloud | Login de empleados y cambio de contraseña obligatoria; login, MFA y contraseña del gerente reenviados a la nube. |
| `session` | local + cloud | Renovar y cerrar la sesión del empleado (local) o del gerente (nube). |
| `me` | local + cloud | Perfil del empleado; perfil, foto y local del gerente en la nube. |
| `user` | local | Empleados: alta, edición, baja, sesiones y asistencia. |
| `work-area` | local | Áreas de trabajo. |
| `job-position` | local | Puestos. |
| `area-job-position` | local | Qué puestos existen en qué área y quién trabaja ahí. |
| `area-product` | local | Qué productos usa cada área (lo que sus empleados pueden pedir). |
| `work-schedule` | local | Horarios tipo (hora de entrada y salida). |
| `shift` | local | Turnos programados de cada empleado. |
| `check` | local | Entrada y salida del empleado. |
| `order` | local → cloud | Pedido del día: solicitudes de empleados, revisión del gerente y envío a la nube. |
| `tip` | local | Reglas de reparto, bolsas de propinas, reparto por área y propinas del empleado. |
| `setting` | local | Configuración del servidor: zona horaria, ventana de entrada y periodo de propinas. |
| `product` | local + cloud | Productos del área del empleado (copia local) y catálogo de la nube. |
| `server-product` | local + cloud | Sincronización de productos desde la nube (hidratación y eventos del socket). |
| `supplier`, `supplier-product`, `location` | cloud | Proveedores, sus productos y locales, leídos de la nube. |
| `transfer`, `transfer-item` | cloud | Pedidos del restaurante en la nube: listar, ver, crear, recibir, cancelar y sus productos. |
| `pairing` | cloud | Emparejar el servidor con la nube. |
| `socket` | cloud | Conexión socket.io con la nube y reparto de sus eventos. |
| `repository` | local + cloud | Validación de acceso para los guards (`validateAccess`, `validateManagerAccess`, `serverToken`) y `CatalogService` (`workAreasExist`, `jobPositionsExist`, `productsExist`). |

## 6. Rutas REST

**101 rutas**: 76 locales (61 de gerente, 11 de empleado y 4 públicas de sesión) y 25 que pasan por la nube. Todas, excepto `POST /v1/pairing/register`, exigen que el servidor esté emparejado.

- **gerente:** `@HttpManagerAccess()`; el Bearer de la nube se valida con `session.validate`.
- **gerente (nube):** sin guard de acceso local; el servidor reenvía el Bearer y la nube lo valida en su propio RPC.
- **empleado:** `@HttpLocalAccess()`; JWT local.
- **público:** login, cambio de contraseña obligatoria y sesión (usan su propio token del cuerpo o del header).

La última columna es el diagrama en `documents/diagrams/workflows/`.

| Método | Ruta | Acceso | Qué hace | Diagrama |
|---|---|---|---|---|
| POST | `/v1/authentication/cloud/login` | público | Iniciar sesión | `authentication/cloud/login` |
| POST | `/v1/authentication/cloud/mfa/code` | público | Verificar el código de MFA | `authentication/cloud/code` |
| GET | `/v1/authentication/cloud/mfa/qr` | público | Obtener el QR de MFA | `authentication/cloud/qr` |
| POST | `/v1/authentication/cloud/password/reset` | público | Cambiar la contraseña obligatoria | `authentication/cloud/reset` |
| POST | `/v1/authentication/local/login` | público | Iniciar sesión | `authentication/local/login` |
| POST | `/v1/authentication/local/password/reset` | público | Cambiar la contraseña obligatoria | `authentication/local/reset_password` |
| POST | `/v1/sessions/cloud/logout` | público | Cerrar sesión | `session/cloud/logout` |
| POST | `/v1/sessions/cloud/refresh` | público | Renovar la sesión | `session/cloud/refresh_token` |
| POST | `/v1/sessions/local/logout` | público | Cerrar sesión | `session/local/logout` |
| POST | `/v1/sessions/local/refresh` | público | Renovar la sesión | `session/local/refresh_token` |
| GET | `/v1/me/cloud` | gerente (nube) | Mi perfil | `me/cloud/user` |
| GET | `/v1/me/cloud/location` | gerente (nube) | Mi local | `me/cloud/location` |
| DELETE | `/v1/me/cloud/picture` | gerente (nube) | Quitar mi foto | `me/cloud/remove_picture` |
| POST | `/v1/me/cloud/picture` | gerente (nube) | Subir mi foto | `me/cloud/upload_picture` |
| GET | `/v1/me/local` | empleado | Mi perfil | `me/local/user` |
| GET | `/v1/me/local/attendance` | empleado | Mi asistencia | `user/local/my_attendance` |
| GET | `/v1/users/local` | gerente | Listar empleados | `user/local/users` |
| POST | `/v1/users/local` | gerente | Crear empleado | `user/local/register` |
| DELETE | `/v1/users/local/:id` | gerente | Eliminar empleado | `user/local/remove` |
| GET | `/v1/users/local/:id` | gerente | Ver empleado | `user/local/user` |
| PATCH | `/v1/users/local/:id` | gerente | Editar empleado | `user/local/update` |
| GET | `/v1/users/local/:id/attendance` | gerente | Asistencia de un empleado | `user/local/attendance` |
| GET | `/v1/users/local/:id/sessions` | gerente | Sesiones de un empleado | `user/local/sessions` |
| GET | `/v1/work-areas/local` | gerente | Listar áreas | `work-area/local/work_areas` |
| POST | `/v1/work-areas/local` | gerente | Crear área | `work-area/local/register` |
| DELETE | `/v1/work-areas/local/:id` | gerente | Eliminar área | `work-area/local/remove` |
| GET | `/v1/work-areas/local/:id` | gerente | Ver área | `work-area/local/work_area` |
| PATCH | `/v1/work-areas/local/:id` | gerente | Editar área | `work-area/local/update` |
| GET | `/v1/job-positions/local` | gerente | Listar puestos | `job-position/local/job_positions` |
| POST | `/v1/job-positions/local` | gerente | Crear puesto | `job-position/local/register` |
| DELETE | `/v1/job-positions/local/:id` | gerente | Eliminar puesto | `job-position/local/remove` |
| GET | `/v1/job-positions/local/:id` | gerente | Ver puesto | `job-position/local/job_position` |
| PATCH | `/v1/job-positions/local/:id` | gerente | Editar puesto | `job-position/local/update` |
| GET | `/v1/job-positions/local/:id/users` | gerente | Empleados con un puesto o en un área | `area-job-position/local/job_position_users` |
| DELETE | `/v1/job-positions/local/:id/work-areas` | gerente | Desvincular puestos y áreas | `area-job-position/local/job_position_remove` |
| GET | `/v1/job-positions/local/:id/work-areas` | gerente | Áreas de un puesto | `area-job-position/local/work_areas` |
| POST | `/v1/job-positions/local/:id/work-areas` | gerente | Vincular puestos y áreas | `area-job-position/local/job_position_assign` |
| DELETE | `/v1/work-areas/local/:id/job-positions` | gerente | Desvincular puestos y áreas | `area-job-position/local/work_area_remove` |
| GET | `/v1/work-areas/local/:id/job-positions` | gerente | Puestos de un área | `area-job-position/local/job_positions` |
| POST | `/v1/work-areas/local/:id/job-positions` | gerente | Vincular puestos y áreas | `area-job-position/local/work_area_assign` |
| GET | `/v1/work-areas/local/:id/users` | gerente | Empleados con un puesto o en un área | `area-job-position/local/work_area_users` |
| DELETE | `/v1/products/local/:id/work-areas` | gerente | Desvincular productos y áreas | `area-product/local/product_remove` |
| GET | `/v1/products/local/:id/work-areas` | gerente | Áreas de un producto | `area-product/local/work_areas` |
| POST | `/v1/products/local/:id/work-areas` | gerente | Vincular productos y áreas | `area-product/local/product_assign` |
| DELETE | `/v1/work-areas/local/:id/products` | gerente | Desvincular productos y áreas | `area-product/local/work_area_remove` |
| GET | `/v1/work-areas/local/:id/products` | gerente | Productos de un área | `area-product/local/products` |
| POST | `/v1/work-areas/local/:id/products` | gerente | Vincular productos y áreas | `area-product/local/work_area_assign` |
| GET | `/v1/work-schedules/local` | gerente | Listar horarios | `work-schedule/local/work_schedules` |
| POST | `/v1/work-schedules/local` | gerente | Crear horario | `work-schedule/local/register` |
| DELETE | `/v1/work-schedules/local/:id` | gerente | Eliminar horario | `work-schedule/local/remove` |
| GET | `/v1/work-schedules/local/:id` | gerente | Ver horario | `work-schedule/local/work_schedule` |
| PATCH | `/v1/work-schedules/local/:id` | gerente | Editar horario | `work-schedule/local/update` |
| GET | `/v1/shifts/local` | gerente | Listar turnos | `shift/local/shifts` |
| POST | `/v1/shifts/local` | gerente | Programar turnos | `shift/local/register` |
| GET | `/v1/shifts/local/:id` | gerente | Ver turno | `shift/local/shift` |
| PATCH | `/v1/shifts/local/:id` | gerente | Editar turno | `shift/local/update` |
| PATCH | `/v1/shifts/local/:id/cancel` | gerente | Cancelar turno | `shift/local/cancel` |
| GET | `/v1/checks/local/current` | empleado | Asistencia actual | `check/local/current` |
| POST | `/v1/checks/local/in` | empleado | Registrar entrada | `check/local/check_in` |
| POST | `/v1/checks/local/out` | empleado | Registrar salida | `check/local/check_out` |
| GET | `/v1/me/local/orders` | empleado | Mis solicitudes | `order/local/mine` |
| GET | `/v1/orders/local` | gerente | Listar pedidos | `order/local/orders` |
| GET | `/v1/orders/local/:id` | gerente | Ver pedido | `order/local/order` |
| POST | `/v1/orders/local/:id/retry` | gerente | Reintentar envíos del pedido | `order/local/retry` |
| GET | `/v1/orders/local/current` | gerente | Pedido abierto del día | `order/local/current` |
| DELETE | `/v1/orders/local/current/items/:product_id` | gerente | Restablecer un producto del pedido | `order/local/reset_item` |
| PUT | `/v1/orders/local/current/items/:product_id` | gerente | Guardar un producto del pedido | `order/local/save_item` |
| POST | `/v1/orders/local/current/send` | gerente | Enviar el pedido a la nube | `order/local/send` |
| POST | `/v1/orders/local/requests` | empleado | Crear solicitud de productos | `order/local/save` |
| DELETE | `/v1/orders/local/requests/:id` | empleado | Eliminar solicitud | `order/local/remove` |
| PATCH | `/v1/orders/local/requests/:id` | empleado | Editar solicitud | `order/local/update` |
| GET | `/v1/me/local/tips` | empleado | Mis propinas | `tip/local/mine` |
| GET | `/v1/tip-rules/local` | gerente | Ver reglas de propinas | `tip/local/rules` |
| PUT | `/v1/tip-rules/local` | gerente | Editar reglas de propinas | `tip/local/rule_update` |
| GET | `/v1/tips/local` | gerente | Listar bolsas de propinas | `tip/local/pools` |
| POST | `/v1/tips/local` | gerente | Crear bolsa de propinas | `tip/local/register` |
| DELETE | `/v1/tips/local/:id` | gerente | Eliminar bolsa de propinas | `tip/local/remove` |
| GET | `/v1/tips/local/:id` | gerente | Ver bolsa de propinas | `tip/local/pool` |
| PATCH | `/v1/tips/local/:id` | gerente | Editar reglas de propinas | `tip/local/tip_update` |
| DELETE | `/v1/tips/local/:id/areas/:work_area_id` | gerente | Restablecer reparto de un área | `tip/local/reset_area` |
| PUT | `/v1/tips/local/:id/areas/:work_area_id` | gerente | Repartir la propina de un área | `tip/local/area` |
| PATCH | `/v1/tips/local/:id/close` | gerente | Cerrar bolsa de propinas | `tip/local/close` |
| PATCH | `/v1/tips/local/:id/reopen` | gerente | Reabrir bolsa de propinas | `tip/local/reopen` |
| GET | `/v1/settings/local` | gerente | Ver configuración | `setting/local/settings` |
| PATCH | `/v1/settings/local` | gerente | Editar configuración | `setting/local/update` |
| GET | `/v1/products/cloud` | gerente (nube) | Listar productos | `product/cloud/products` |
| GET | `/v1/products/cloud/:id` | gerente (nube) | Ver producto | `product/cloud/product` |
| GET | `/v1/products/local` | empleado | Listar productos | `product/local/products` |
| GET | `/v1/suppliers/cloud` | gerente (nube) | Listar proveedores | `supplier/cloud/suppliers` |
| GET | `/v1/suppliers/cloud/:id` | gerente (nube) | Ver proveedor | `supplier/cloud/supplier` |
| GET | `/v1/products/cloud/:id/suppliers` | gerente (nube) | Proveedores de un producto | `supplier-product/cloud/suppliers` |
| GET | `/v1/suppliers/cloud/:id/products` | gerente (nube) | Productos de un proveedor | `supplier-product/cloud/products` |
| GET | `/v1/suppliers/cloud/:supplier_id/products/:product_id` | gerente (nube) | Detalle de proveedor y producto | `supplier-product/cloud/detail` |
| GET | `/v1/locations/cloud` | gerente (nube) | Listar locales de la nube | `location/cloud/locations` |
| GET | `/v1/transfers/cloud` | gerente (nube) | Listar pedidos de la nube | `transfer/cloud/transfers` |
| POST | `/v1/transfers/cloud` | gerente (nube) | Crear pedido en la nube | `transfer/cloud/register` |
| GET | `/v1/transfers/cloud/:id` | gerente (nube) | Ver pedido de la nube | `transfer/cloud/transfer` |
| PATCH | `/v1/transfers/cloud/:id/cancel` | gerente (nube) | Cancelar pedido | `transfer/cloud/cancel` |
| PATCH | `/v1/transfers/cloud/:id/receive` | gerente (nube) | Recibir pedido | `transfer/cloud/receive` |
| GET | `/v1/transfers/cloud/:id/items` | gerente (nube) | Productos de un pedido | `transfer-item/cloud/items` |
| POST | `/v1/pairing/register` | público (sin emparejar) | Emparejar el servidor | `pairing/cloud/register` |

## 7. Seguridad y acceso

### Tokens

| Token | Quién lo emite | Firma | Para qué |
|---|---|---|---|
| `access_token` de empleado | El servidor | `JWT_SECRET_TOKEN` | Rutas `@HttpLocalAccess`. Lleva `email` y `session_key`. |
| `refresh_token` de empleado | El servidor | `JWT_SECRET_REFRESH_TOKEN` | `POST /v1/sessions/local/refresh` y `logout`. |
| `password_token` | El servidor | `JWT_SECRET_PASSWORD_TOKEN` | Cambio de contraseña obligatoria del empleado. |
| `access_token` y `refresh_token` del gerente | La nube | Secretos de la nube | Rutas de gerente y `*/cloud`. El servidor no los valida solo: pregunta a la nube. |
| `server_token` | La nube, al emparejar | — | Identifica al servidor ante la nube en cada llamada gRPC (metadata `server_token`) y en el socket (`auth.server_token`). |

### Guards

| Guard | Decorador | Valida | Errores |
|---|---|---|---|
| `HttpPairingGuard` | `@HttpPairingAccess()` lo salta | Que exista `SERVER_TOKEN` | 409 `ERROR_SERVER_NOT_PAIRED` |
| `HttpLocalAccessGuard` | `@HttpLocalAccess()` | JWT local válido y vigente, sesión `active` con ese `session_key`, empleado activo | 401 `ERROR_MISSING_TOKEN`, `ERROR_INVALID_ACCESS_TOKEN`, `ERROR_EXPIRED_TOKEN`, `ERROR_UNAUTHORIZED` |
| `HttpManagerAccessGuard` | `@HttpManagerAccess()` | `session.validate` en la nube | 401 `ERROR_MISSING_TOKEN`; 503 `ERROR_CLOUD_UNAVAILABLE`; el `code` de la nube (401/403) |

Los guards son globales y se activan con su decorador; no se usa `@UseGuards`. Responden con `HttpErrorMapper.reply` y devuelven `false`.

### Datos sensibles

- Contraseñas con **Argon2**.
- `.env` está en `.gitignore`; el `SERVER_TOKEN` y los secretos JWT nunca van al repositorio.
- El gerente no tiene credenciales guardadas en el servidor: todo pasa por la nube.

## 8. Comunicación con la nube

### gRPC

- `CloudModule` registra el cliente con los protos de `src/infrastructure/grpc/cloud/proto/` (copias de los de la nube): `authentication`, `location`, `me`, `product`, `server_product`, `server`, `session`, `supplier_product`, `supplier`, `transfer_item`, `transfer`.
- `CloudRequest.metadata()` agrega `server_token` y, si hay, `authorization: Bearer <token>`. `CloudRequest.options()` pone un plazo de **10 s** (`CLOUD_GRPC_DEADLINE_MS`).
- `CloudRequest.send()` convierte la respuesta en `ResultPattern`. Si falla, `CloudErrorMapper.toServiceError()`:
  - toma el estado gRPC y lo traduce: 3/11 → 400, 16 → 401, 7 → 403, 5 → 404, 6/10/9 → 409, 8 → 413, 14/4 → 503, el resto → 500;
  - toma el `code` de los **trailers** (metadata `code`) que manda la nube, y el texto de `details`;
  - si la nube no manda `code`, usa el mensaje global del tipo de error.

### Socket.io

- `SocketService` se conecta al arrancar (`OnApplicationBootstrap`) con `auth.server_token`, solo `websocket`.
- Si la nube rechaza la conexión (16 o 7), cierra y no reintenta. Si no la alcanza, reintenta cada **30 s**.
- Los módulos se suscriben con `socket_service.on(evento, handler)`; hoy lo hace `server-product`:

| Evento (`SOCKET_EVENT`) | Qué hace el servidor |
|---|---|
| `server.sync_required` | Hidratación: pide `server_product.server_products(synced_at)`, guarda los productos, borra `removed_ids` y guarda `products_synced_at`. |
| `product.created`, `product.updated` | Upsert del producto. |
| `product.removed` | Borra el producto por su id de la nube. |
| `session.expired` | Cierra el socket. |

Los cambios se aplican en una cola, de uno en uno, y una hidratación pedida mientras otra espera no se duplica. Ver `sequences/product-sync.drawio`.

## 9. Reglas de negocio del local

### Empleados, áreas y puestos

- Un empleado tiene un área y un puesto (`user_assignments`); el puesto debe existir en esa área (`area_job_positions`).
- Correo y teléfono son únicos.
- No se elimina un área, un puesto ni el vínculo área-puesto mientras tenga empleados.
- Borrar a un empleado cancela sus turnos programados.

### Horarios, turnos y asistencia

- Un turno usa un horario activo y no puede cruzarse con otro turno del mismo empleado.
- Solo se edita o cancela un turno `scheduled`. Un horario con turnos programados no se elimina.
- La entrada se acepta desde `clock_in_window_minutes` antes del turno (`server_settings`, 30 por defecto); antes responde 409 `ERROR_CHECK_TOO_EARLY`. La salida exige una entrada abierta.
- Las fechas se calculan con la zona horaria de `server_settings.timezone`.

### Pedido del día

- Hay un solo pedido `open` a la vez (`transfer_drafts.open_lock` único).
- El empleado crea solicitudes con productos **de su área**; necesita tener área asignada.
- El gerente ajusta la cantidad y el almacén de cada producto, o lo restablece a lo que pidieron los empleados.
- Al enviar: `open → sending`, se crea un envío por almacén con su `idempotency_key` y se registra en la nube con `transfer.register`. Cada envío queda `sent` (con su `transfer_id`) o `failed` (con `last_error`); el pedido queda `sent` o `partially_sent`. Un fallo no detiene a los demás.
- `POST /v1/orders/local/:id/retry` reintenta los envíos que no quedaron `sent`, con la misma `idempotency_key`, así la nube no duplica el pedido.

Ver `states/order.drawio`, `states/order-dispatch.drawio` y `sequences/order-send.drawio`.

### Propinas

- **Reglas por área** (`tip_area_rules`): porcentaje y método `equal`, `minutes`, `position_weight` o `manual`.
- **Bolsas** (`tip_pools`): una por periodo (`day`, `week` o `shift`, según `server_settings.tip_period`), sin cruzarse con otra; cada turno pertenece a una sola bolsa.
- Se edita mientras está `open`. Para cerrarla, todos los turnos del periodo deben estar cerrados, debe haber participantes y el reparto manual debe sumar el total. `reopen` la vuelve a abrir. Solo se elimina abierta.
- No se puede cambiar el periodo de propinas mientras haya bolsas abiertas.

Ver `states/tip-pool.drawio`.

## 10. Formato de las respuestas y códigos

- Todo mensaje es `{ code, message }` (`TApiMessage`); `code` no cambia y `message` es texto en español.
- Éxito: `{ code, message, data?, meta?, timestamp }`. Error: `{ status_code, code, message, timestamp }`.
- Fechas en ISO 8601, UTC.

| Tipo (`SERVICE_ERROR_CODE`) | HTTP | Cuándo |
|---|---|---|
| `BAD_REQUEST` | 400 | Datos inválidos (pipe o service). |
| `UNAUTHORIZED` | 401 | Sin token, token inválido o vencido, sesión cerrada. |
| `FORBIDDEN` | 403 | Cuenta desactivada, sin área asignada, o rechazo de la nube. |
| `NOT_FOUND` | 404 | No existe el recurso. |
| `CONFLICT` | 409 | Estado inválido (servidor sin emparejar, pedido cerrado, turno no editable…). |
| `PAYLOAD_TOO_LARGE` | 413 | Foto de más de 6 MB, o estado 8 de la nube. |
| `UNAVAILABLE` | 503 | La nube no responde. |
| `INTERNAL` | 500 | Error inesperado (se registra en el log). |

## 11. Utilidades reutilizables

| Utilidad | Dónde | Para qué |
|---|---|---|
| `ResultPattern`, `ServiceResultMapper`, `ServiceErrorFactory` | `domain/patterns`, `infrastructure/mappers/shared` | Resultados y errores de dominio. |
| `ControllerResponseMapper` | `infrastructure/mappers/shared` | Respuestas `toDataResult` y `toPaginationResult`. |
| `HttpErrorMapper` | `infrastructure/mappers/shared` | `reply` y `toException`. |
| `CloudRequest`, `CloudErrorMapper` | `infrastructure/grpc/cloud` | Llamadas a la nube. |
| `TimeZone` | `infrastructure/utils` | Inicio de día y día de una fecha en la zona del local. |
| `Duration`, `Money` | `infrastructure/utils` | Minutos entre fechas y cálculos de dinero. |
| `Machine` | `infrastructure/utils` | Plataforma y MAC para emparejar. |
| `TokenPayload` | `infrastructure/utils` | Leer el correo del token del gerente sin validarlo (quién envió el pedido). |
| `JwtManager`, `Argon2` | `infrastructure/securities` | Tokens y contraseñas. |
| `CatalogService` | módulo `repository` | Existencia de áreas, puestos y productos, compartida por los módulos. |

## 12. Nomenclatura

Igual que la nube (`miyabi-api/CLAUDE.md` §4), con estas diferencias:

- Routers: `HTTP_LOCAL_X_ROUTER` y `HTTP_CLOUD_X_ROUTER`; las rutas llevan `/local` o `/cloud` después del recurso.
- Controllers: `XHttpController`; si un módulo tiene los dos lados para el mismo recurso, el local es `LocalXHttpController`. Lo mismo para services (`LocalXService`) y repositorios (`CloudXRepository`).
- Tokens de providers: `SERVICES.LOCAL` / `REPOSITORIES.CLOUD_X` cuando conviven los dos lados.
- No hay archivos `grpc-*`: el único transporte de entrada es HTTP, así que todo lo global lleva prefijo `http-`.

## 13. Notas técnicas y pendientes

- **Estado gRPC 8 de la nube:** `CloudErrorMapper` lo traduce siempre a 413 `PAYLOAD_TOO_LARGE`. La nube también usa 8 para "demasiados intentos" (login, MFA, contraseña), así que un bloqueo por intentos llega a la app como **413** con el `code` de la nube (`ERROR_AUTHENTICATION_TOO_MANY_ATTEMPTS`) en vez de 429.
- **Turno `completed`:** existe en `shift_status`, pero ningún repositorio lo asigna; la asistencia vive en `attendance_records`.
- **`.env.example`:** se eliminó del repositorio; las variables están documentadas en el README.
- **Sin suite de pruebas** automáticas.

## 14. Cómo agregar una ruta

1. Elige el lado: `local/` si usa la base del local, `cloud/` si reenvía a la nube.
2. Agrega la ruta al router `HTTP_LOCAL_X_ROUTER` o `HTTP_CLOUD_X_ROUTER` (sin `/v1`).
3. Crea el schema valibot y su DTO con `static schema`; si ya existe uno igual, reúsalo.
4. Agrega el método a la interfaz del service y su implementación; devuelve `ResultPattern` y usa mensajes `{ code, message }` de `api.message.ts`.
5. En el controller del recurso: decorador de acceso (`@HttpManagerAccess()` o `@HttpLocalAccess()`), `@Param`/`@Query`/`@Body` con su DTO y `@Res()`.
6. Si es `cloud/`: método en el repositorio `CloudXRepository` con `CloudRequest.send(...)`, y el RPC en el proto copiado de la nube (solo campos nuevos, nunca números cambiados).
7. `pnpm build` y `pnpm lint`.
8. Agrega su diagrama en `documents/diagrams/workflows/<módulo>/<lado>/` y la fila en la sección 6.
