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
 App del gerente ───┘        │              └── gRPC server.channel (stream) ─ miyabi-api
                             │
                       PostgreSQL local
```

- **Stack:** NestJS 11, Prisma 7 (`@prisma/adapter-pg`), valibot, `@grpc/grpc-js` como cliente (RPCs y el canal `server.channel`), Argon2 y JWT.
- **Una sola entrada:** REST con versión en la URL (`enableVersioning`). No hay microservicio gRPC propio: el servidor es **cliente** del gRPC de la nube.
- **Dos tipos de usuario:**
  - **Empleado:** existe en la base local, inicia sesión contra el servidor y usa tokens firmados con los secretos del `.env`.
  - **Gerente:** es un usuario de la nube con rol `restaurant`. Inicia sesión en la nube a través del servidor (BFF):
    - el servidor guarda cifrados los tokens de la nube y le da a la app un `session_token` opaco (`mss_...`);
    - con ese token, el servidor usa el `access_token` de la nube, lo renueva cuando va a vencer y valida la sesión con `session.validate` (con caché en Redis).
- **Dos lados en cada módulo:** `local/` atiende con la base del local; `cloud/` reenvía a la nube por gRPC. La separación se repite en controllers, routers, services, repositories, interfaces y tipos.
- **Sin internet:** lo `local/` de empleados sigue funcionando. Lo que necesita a la nube responde **503** `ERROR_CLOUD_UNAVAILABLE`. Con un corte corto, el gerente sigue trabajando unos 15 minutos con la sesión en la caché (sección 7).
- **Emparejamiento:** el `server_token` vive cifrado en `server_settings` con su estado (`unpaired`, `paired`, `unlinked`). Si la nube desvincula el servidor, lo local sigue y lo de la nube responde **503** `ERROR_SERVER_UNLINKED` hasta que se pegue un token nuevo.

## 2. Recorrido de una petición

1. **Express + versionado** reciben `/v1/...`.
2. **Guards globales** (`APP_GUARD`, en este orden):
   1. `HttpPairingGuard`: si el servidor nunca se emparejó (`unpaired`) responde 409 `ERROR_SERVER_NOT_PAIRED` (salvo `@HttpPairingAccess()`). Un servidor `unlinked` sí pasa: lo local sigue funcionando.
   2. `HttpLocalAccessGuard`: solo en `@HttpLocalAccess()`. Valida el JWT local, la sesión y que el empleado esté activo; deja el empleado en `request.user`.
   3. `HttpManagerAccessGuard`, en dos pasos:
      1. En cualquier ruta, si el Bearer es un `session_token` (`mss_...`), resuelve la sesión del gerente (`ManagerSessionService.resolve`): vence a los 30 minutos sin uso y renueva el `access_token` de la nube si le falta menos de un minuto. Deja ese token en `request.cloud_access_token`. Las rutas `*/cloud` lo toman con `@HttpCloudAuthorization()`, que solo devuelve ese token: cualquier otro Bearer (por ejemplo el JWT de un empleado) no se reenvía a la nube y la ruta responde 401 `ERROR_MISSING_TOKEN`. `@HttpAuthorization()` devuelve ese token o, si no hay, el Bearer tal cual (lo usan el MFA y el cambio de contraseña de la nube, y las rutas locales).
      2. En `@HttpManagerAccess()` además valida ese token: lo busca en la caché de Redis y, si no está, llama a `session.validate` de la nube y guarda el resultado.
3. **Pipe del controller** (`@UsePipes(HttpValibotPipe)`): valida `@Param`, `@Query` y `@Body` con el `static schema` de cada DTO; si falla lanza 400 `ERROR_BAD_REQUEST`.
4. **Controller** llama a su `service` y responde con `@Res()`: `ControllerResponseMapper` si sale bien, `HttpErrorMapper.reply` si falla.
5. **Service** orquesta y devuelve `ResultPattern`. Los repositorios `local/` usan Prisma; los `cloud/` usan `CloudRequest`.
6. **`HttpExceptionFilter`** (global, en `main.ts`) da el mismo formato con `code` a lo que Nest responde por su cuenta (ruta inexistente, JSON mal formado, error inesperado).

Los diagramas `documents/diagrams/workflows/common/local/*-guard.drawio` y `sequences/manager-access.drawio` muestran este recorrido; `states/manager-session.drawio`, la vida de la sesión del gerente; `sequences/server-pairing.drawio` y `sequences/server-unlink.drawio`, el emparejamiento y la desvinculación.

## 3. Estructura del código

```
src/
├── main.ts / app.module.ts     arranque, CORS, versionado, filtro y guards globales
├── common/
│   ├── decorators/access/      @HttpLocalAccess, @HttpManagerAccess, @HttpPairingAccess
│   ├── decorators/request/http @HttpUser, @HttpAuthorization y @HttpCloudAuthorization (token)
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
| `session` | local + cloud | Renovar y cerrar la sesión del empleado (local). Sesión del gerente (`ManagerSessionService`): abrirla al terminar el login, resolverla en cada petición, renovar sus tokens de la nube, vencerla por inactividad, cerrarla y borrarla cuando la nube la revoca. |
| `me` | local + cloud | Perfil del empleado; perfil, foto, local y notificaciones de la nube del gerente. |
| `notification` | local | Notificaciones del local: las guarda con su plantilla y las lee el empleado (las suyas) o el gerente (las del equipo). |
| `user` | local | Empleados: alta, edición, baja, sesiones y asistencia. |
| `work-area` | local | Áreas de trabajo. |
| `job-position` | local | Puestos. |
| `area-job-position` | local | Qué puestos existen en qué área y quién trabaja ahí. |
| `area-product` | local | Qué productos usa cada área (lo que sus empleados pueden pedir). |
| `work-schedule` | local | Horarios tipo (hora de entrada y salida). |
| `shift` | local | Turnos programados de cada empleado. |
| `check` | local | Entrada y salida del empleado. |
| `order` | local → cloud | Pedido del día: solicitudes de empleados, revisión del gerente y envío a la nube. |
| `tip` | local | Reglas de reparto, bolsas de propinas, sanciones, reparto por área, Excel con firma y propinas del empleado. |
| `setting` | local | Configuración del servidor: zona horaria, ventana de entrada, periodo de propinas, reglas de sanción e inicio de semana. |
| `product` | local + cloud | Productos del área del empleado (copia local) y catálogo de la nube. |
| `server-product` | local + cloud | Sincronización de productos desde la nube (hidratación y mensajes del canal). |
| `supplier`, `supplier-product`, `location` | cloud | Proveedores, sus productos y locales, leídos de la nube. |
| `transfer`, `transfer-item` | cloud | Pedidos del restaurante en la nube: listar, ver, crear, recibir, cancelar y sus productos. Confirma los cambios que se quedaron sin respuesta de la nube y avisa a los gerentes por el socket (`transfer.changed`). |
| `pairing` | cloud | Emparejar el servidor con la nube, cambiar el token cuando la nube lo desvinculó y consultar el estado. Avisa a los gerentes cuando se desvincula. |
| `channel` | cloud | Canal gRPC con la nube (`server.channel`): reparte sus mensajes, responde sus solicitudes y reporta el estado del servidor. |
| `socket` | local | Socket.io del local (`PORT_SOCKET`, 4520): avisos en vivo a las pantallas de empleados y gerentes. |
| `repository` | local + cloud | Validación de acceso para los guards (`validateAccess`, `validateManagerAccess`, `forgetManagerSession`), estado del emparejamiento (`ServerService`: `state`, `pair`, `unlink`, `onUnlinked`; guarda el `server_token` cifrado y lo deja en memoria para `CloudRequest`) y `CatalogService` (`workAreasExist`, `jobPositionsExist`, `productsExist`). |

## 6. Rutas REST

**128 rutas**: 99 locales (79 de gerente, 16 de empleado y 4 públicas de sesión) y 29 que pasan por la nube. Todas, excepto las tres de `pairing`, exigen que el servidor se haya emparejado alguna vez.

- **gerente:** `@HttpManagerAccess()`; Bearer `mss_...`. El servidor resuelve la sesión y valida su `access_token` de la nube con `session.validate` (con caché).
- **gerente (nube):** Bearer `mss_...`; el servidor resuelve la sesión, reenvía el `access_token` de la nube y la nube lo valida en su propio RPC.
- **empleado:** `@HttpLocalAccess()`; JWT local.
- **público:** login, cambio de contraseña obligatoria y sesión (usan su propio token del cuerpo o del header).

La última columna es el diagrama en `documents/diagrams/workflows/`; `—` indica una ruta que todavía no tiene diagrama.

| Método | Ruta | Acceso | Qué hace | Diagrama |
|---|---|---|---|---|
| POST | `/v1/authentication/cloud/login` | público | Iniciar sesión | `authentication/cloud/login` |
| POST | `/v1/authentication/cloud/mfa/code` | público | Verificar el código de MFA | `authentication/cloud/code` |
| GET | `/v1/authentication/cloud/mfa/qr` | público | Obtener el QR de MFA | `authentication/cloud/qr` |
| POST | `/v1/authentication/cloud/password/reset` | público | Cambiar la contraseña obligatoria | `authentication/cloud/reset` |
| POST | `/v1/authentication/local/login` | público | Iniciar sesión | `authentication/local/login` |
| POST | `/v1/authentication/local/password/reset` | público | Cambiar la contraseña obligatoria | `authentication/local/reset_password` |
| POST | `/v1/sessions/cloud/logout` | público | Cerrar la sesión del gerente (Bearer `mss_...`): la cierra en la nube, la borra y desconecta su socket | `session/cloud/logout` |
| POST | `/v1/sessions/local/logout` | público | Cerrar sesión | `session/local/logout` |
| POST | `/v1/sessions/local/refresh` | público | Renovar la sesión | `session/local/refresh_token` |
| GET | `/v1/me/cloud` | gerente (nube) | Mi perfil | `me/cloud/user` |
| GET | `/v1/me/cloud/location` | gerente (nube) | Mi local | `me/cloud/location` |
| GET | `/v1/me/cloud/notifications` | gerente (nube) | Mis notificaciones de la nube (`read`, `cursor`, `limit`) | `me/cloud/notifications` |
| GET | `/v1/me/cloud/notifications/unread-count` | gerente (nube) | Cuántas de la nube no he leído | `me/cloud/unread_count` |
| PATCH | `/v1/me/cloud/notifications/read` | gerente (nube) | Marcar como leídas las de la nube (todas o `notification_ids`) | `me/cloud/read_notifications` |
| DELETE | `/v1/me/cloud/picture` | gerente (nube) | Quitar mi foto | `me/cloud/remove_picture` |
| POST | `/v1/me/cloud/picture` | gerente (nube) | Subir mi foto | `me/cloud/upload_picture` |
| GET | `/v1/me/local` | empleado | Mi perfil | `me/local/user` |
| GET | `/v1/me/local/attendance` | empleado | Mi asistencia | `user/local/my_attendance` |
| PATCH | `/v1/me/local` | empleado | Cambiar mi teléfono | — |
| PATCH | `/v1/me/local/password` | empleado | Cambiar mi contraseña (cierra la sesión) | — |
| GET | `/v1/me/local/notifications` | empleado | Mis notificaciones (`read`, `cursor`, `limit`) | — |
| GET | `/v1/me/local/notifications/unread-count` | empleado | Cuántas no he leído | — |
| PATCH | `/v1/me/local/notifications/read` | empleado | Marcar como leídas (todas o `notification_ids`) | — |
| GET | `/v1/users/local` | gerente | Listar empleados | `user/local/users` |
| POST | `/v1/users/local` | gerente | Crear empleado | `user/local/register` |
| DELETE | `/v1/users/local/:id` | gerente | Eliminar empleado | `user/local/remove` |
| GET | `/v1/users/local/:id` | gerente | Ver empleado | `user/local/user` |
| PATCH | `/v1/users/local/:id` | gerente | Editar empleado | `user/local/update` |
| GET | `/v1/users/local/:id/attendance` | gerente | Asistencia de un empleado | `user/local/attendance` |
| GET | `/v1/users/local/:id/sessions` | gerente | Sesiones de un empleado | `user/local/sessions` |
| DELETE | `/v1/users/local/:id/sessions` | gerente | Cerrar la sesión activa de un empleado | — |
| POST | `/v1/users/local/:id/password/reset` | gerente | Contraseña temporal con Excel | — |
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
| POST | `/v1/shifts/local/copy` | gerente | Copiar los turnos de una semana a otra | — |
| PATCH | `/v1/shifts/local/:id/attendance` | gerente | Corregir hora de entrada o salida | — |
| POST | `/v1/shifts/local/:id/justifications` | gerente | Justificar falta, retardo o salida temprana | — |
| GET | `/v1/checks/local/current` | empleado | Asistencia actual | `check/local/current` |
| POST | `/v1/checks/local/in` | empleado | Registrar entrada | `check/local/check_in` |
| POST | `/v1/checks/local/out` | empleado | Registrar salida | `check/local/check_out` |
| GET | `/v1/me/local/orders` | empleado | Mis solicitudes | `order/local/mine` |
| GET | `/v1/orders/local` | gerente | Listar pedidos | `order/local/orders` |
| GET | `/v1/orders/local/:id` | gerente | Ver pedido | `order/local/order` |
| POST | `/v1/orders/local/:id/retry` | gerente | Reintentar envíos del pedido | `order/local/retry` |
| POST | `/v1/orders/local/retry` | gerente | Reintentar todos los pedidos con envíos pendientes | — |
| GET | `/v1/orders/local/:id/export` | gerente | Excel del pedido | — |
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
| PATCH | `/v1/tips/local/:id/areas/:work_area_id/status` | gerente | Apagar o prender un área en la bolsa | — |
| GET | `/v1/tips/local/:id/export` | gerente | Excel del reparto con columna de firma | — |
| POST | `/v1/tips/local/:id/sanctions` | gerente | Sancionar a un empleado en la bolsa | — |
| DELETE | `/v1/tips/local/:id/sanctions/:sanction_id` | gerente | Quitar una sanción | — |
| GET | `/v1/tip-sanctions/local` | gerente | Listar tipos de sanción | — |
| POST | `/v1/tip-sanctions/local` | gerente | Crear tipo de sanción | — |
| PATCH | `/v1/tip-sanctions/local/:id` | gerente | Editar tipo de sanción | — |
| DELETE | `/v1/tip-sanctions/local/:id` | gerente | Eliminar tipo de sanción (si no se ha usado) | — |
| GET | `/v1/settings/local` | gerente | Ver configuración | `setting/local/settings` |
| PATCH | `/v1/settings/local` | gerente | Editar configuración | `setting/local/update` |
| GET | `/v1/notifications/local` | gerente | Notificaciones del equipo (`read`, `cursor`, `limit`) | — |
| GET | `/v1/notifications/local/unread-count` | gerente | Cuántas del equipo no he leído | — |
| PATCH | `/v1/notifications/local/read` | gerente | Marcar como leídas las del equipo (todas o `notification_ids`) | — |
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
| POST | `/v1/pairing/register` | público (no `paired`) | Emparejar el servidor con un enrollment token | `pairing/cloud/register` |
| POST | `/v1/pairing/token` | público (`unlinked`) | Guardar el token regenerado del mismo local | `pairing/cloud/token` |
| GET | `/v1/pairing/status` | público | Estado del emparejamiento (`status`, `location_id`, `unlinked_reason`, fechas) | `pairing/cloud/status` |

## 7. Seguridad y acceso

### Tokens

| Token | Quién lo emite | Firma | Para qué |
|---|---|---|---|
| `access_token` de empleado | El servidor | `JWT_SECRET_TOKEN` | Rutas `@HttpLocalAccess`. Lleva `email` y `session_key`. |
| `refresh_token` de empleado | El servidor | `JWT_SECRET_REFRESH_TOKEN` | `POST /v1/sessions/local/refresh` y `logout`. |
| `password_token` | El servidor | `JWT_SECRET_PASSWORD_TOKEN` | Cambio de contraseña obligatoria del empleado. |
| `session_token` del gerente (`mss_` + 32 bytes aleatorios en base64url) | El servidor, al terminar el login, el MFA o el cambio de contraseña del gerente | — (opaco) | Lo único que tiene la app del gerente: Bearer en las rutas y `access_token` en el socket. En la base solo se guarda su huella SHA-256 (`manager_sessions.token_hash`). |
| `access_token` y `refresh_token` del gerente | La nube | Secretos de la nube | Nunca salen del servidor: se guardan cifrados con AES-256-GCM en `manager_sessions`. El servidor manda el `access_token` a la nube en cada llamada y lo renueva con el `refresh_token`. |
| `server_token` | La nube, al emparejar | — | Identifica al servidor ante la nube en cada llamada gRPC y al abrir el canal (metadata `server_token`). Se guarda cifrado en `server_settings.server_token_enc` y en memoria para `CloudRequest`. |

### Sesión del gerente (BFF)

No se usan cookies. La app del gerente corre en el webview de Tauri (`tauri.localhost`) y llama al servidor por la LAN sin HTTPS, así que el navegador no mandaría una cookie `SameSite`. Por eso el `session_token` viaja en `Authorization: Bearer`.

- **Abrir:** el login (o el MFA, o el cambio de contraseña) de la nube devuelve tokens; `ManagerSessionService.exchange` los cifra, crea la fila en `manager_sessions` y responde `access: { session_token }` en lugar de los tokens.
- **Usar:** en cada petición `resolve` busca la sesión por su huella.
  - Si pasaron más de **30 minutos sin uso**, la cierra (como un logout) y responde 401 `ERROR_MANAGER_SESSION_EXPIRED`.
  - Si al `access_token` le queda menos de **1 minuto**, lo renueva con la nube. Si varias peticiones llegan a la vez, solo una renueva y las demás esperan ese resultado.
  - El último uso se guarda como mucho una vez por minuto.
- **Renovación rechazada:** si la nube rechaza el `refresh_token` (401), la sesión se borra y responde `ERROR_MANAGER_SESSION_EXPIRED`. Si la nube no responde, la sesión **no** se borra: responde 503 `ERROR_CLOUD_UNAVAILABLE` y se reintenta en la siguiente petición.
- **Cerrar:** el logout, la inactividad y la limpieza de cada hora siguen el mismo camino:
  - piden a la nube cerrar la sesión (si no responde, sigue igual), borran la fila y la caché, y desconectan al momento los sockets de esa sesión;
  - si la nube no responde al cerrar, su sesión queda activa allá hasta que venza el `refresh_token`, pero ya no se puede usar porque el servidor borró los tokens.
- **Revocar desde la nube:** `session_revoked` por el canal borra las sesiones con ese `cloud_session_key`, su caché y sus sockets.
- Un token que no existe responde 401 `ERROR_MANAGER_SESSION_INVALID`.

### Caché de la validación del gerente

- Cuando la nube valida un `access_token` de gerente, el servidor lo guarda en Redis (con su huella SHA-256, no el token) hasta que el token vence. Así responde más rápido y el gerente sigue trabajando si se cae el internet.
- **Sin internet**, el gerente sigue trabajando mientras dure esa caché, unos 15 minutos (lo que dura el `access_token` de la nube). Después necesita renovar con la nube y sus rutas responden 503 `ERROR_CLOUD_UNAVAILABLE` hasta que vuelva.
- **Sin Redis**, no hay caché: cada petición del gerente consulta a la nube.
- La caché de esa sesión se borra al instante cuando la nube manda `session_revoked` por el canal o cuando la sesión se cierra en el local.
- Riesgo aceptado: si la nube cierra la sesión mientras el servidor no tiene internet, el aviso no llega y el token sirve en el local hasta que vence.

### Guards

| Guard | Decorador | Valida | Errores |
|---|---|---|---|
| `HttpPairingGuard` | `@HttpPairingAccess()` lo salta | Que `pairing_status` no sea `unpaired` | 409 `ERROR_SERVER_NOT_PAIRED` |
| `HttpLocalAccessGuard` | `@HttpLocalAccess()` | JWT local válido y vigente, sesión `active` con ese `session_key`, empleado activo | 401 `ERROR_MISSING_TOKEN`, `ERROR_INVALID_ACCESS_TOKEN`, `ERROR_EXPIRED_TOKEN`, `ERROR_UNAUTHORIZED` |
| `HttpManagerAccessGuard` | Cualquier Bearer `mss_...`; `@HttpManagerAccess()` además valida | Sesión del gerente (existe, no inactiva, `access_token` vigente o renovado) y, con el decorador, caché de Redis o `session.validate` en la nube | 401 `ERROR_MISSING_TOKEN`, `ERROR_MANAGER_SESSION_INVALID`, `ERROR_MANAGER_SESSION_EXPIRED`; con un Bearer que no es `mss_`, el error del JWT de empleado (401) o, si es un empleado válido, 403 `ERROR_FORBIDDEN`; 503 `ERROR_CLOUD_UNAVAILABLE`, `ERROR_SERVER_UNLINKED`; el `code` de la nube (401/403) |

Los guards son globales y se activan con su decorador; no se usa `@UseGuards`. Responden con `HttpErrorMapper.reply` y devuelven `false`.

### Datos sensibles

- Contraseñas con **Argon2**.
- `.env` está en `.gitignore`; `DATA_ENCRYPTION_KEY` y los secretos JWT nunca van al repositorio.
- **Cifrado en la base** (`Crypto.encrypt` / `decrypt`, `infrastructure/securities`): AES-256-GCM con `DATA_ENCRYPTION_KEY`, en el formato base64(iv de 12 bytes | tag de 16 | texto cifrado). Lo usan el `server_token` y los tokens de la nube de cada gerente. Si la llave cambia, el servidor no puede leer su token y queda `unlinked` con `ERROR_LOCAL_TOKEN_UNREADABLE`.
- La contraseña del gerente no se guarda: el login pasa por la nube. Sus tokens de la nube sí se guardan, cifrados, y la app nunca los ve.

## 8. Comunicación con la nube

### gRPC

- `CloudModule` registra el cliente con los protos de `src/infrastructure/grpc/cloud/proto/` (copias de los de la nube): `authentication`, `location`, `me`, `product`, `server_product`, `server`, `session`, `supplier_product`, `supplier`, `transfer_item`, `transfer`.
- El cliente reintenta la conexión cada 1 a 5 s (`CLOUD_GRPC_RECONNECT_MS`, opciones `grpc.initial_reconnect_backoff_ms` y `grpc.max_reconnect_backoff_ms`). Sin ese tope, grpc-js deja crecer la espera hasta 120 s y el servidor tardaba más de un minuto en volver a hablar con la nube.
- `CloudRequest.metadata()` agrega el `server_token` que tiene en memoria y, si hay, `authorization: Bearer <token>`. `CloudRequest.options()` pone un plazo de **10 s** (`CLOUD_GRPC_DEADLINE_MS`).
- Sin `server_token` (servidor `unpaired` o `unlinked`), `CloudRequest.send()` no llama a la nube y responde 503 `ERROR_SERVER_UNLINKED`. Si la nube responde `ERROR_INVALID_SERVER_TOKEN`, el servidor se desvincula.
- `CloudRequest.send()` convierte la respuesta en `ResultPattern`. Si falla, `CloudErrorMapper.toServiceError()`:
  - toma el estado gRPC y lo traduce: 3/11 → 400, 16 → 401, 7 → 403, 5 → 404, 6/10/9 → 409, 8 → 413, 14/4 → 503, el resto → 500;
  - toma el `code` de los **trailers** (metadata `code`) que manda la nube, y el texto de `details`;
  - si la nube no manda `code`, usa el mensaje global del tipo de error.

### Canal con la nube (`server.channel`)

- `ChannelService` (módulo `channel`) abre el stream bidireccional `server_service.channel` de `proto/v1/server.proto`, con el `server_token` en la metadata. Lo abre al arrancar (si está `paired`) y al emparejar o cambiar el token, sin reiniciar.
- Si se corta o la nube no responde, reintenta con espera creciente (de 1 a 30 s).
- Si la nube lo rechaza (16 o 7) o le cierra el canal, se detiene:
  - Por `ERROR_SERVER_DISABLED`, `ERROR_SERVER_REVOKED`, `ERROR_SERVER_TOKEN_REGENERATED` o `ERROR_INVALID_SERVER_TOKEN` (`SERVER_UNLINK_REASONS`), además **desvincula** el servidor: `ServerService.unlink` pasa a `unlinked`, borra el token de memoria y avisa (`onUnlinked`). El módulo `pairing` manda `server.unlinked` por el socket y crea la notificación `SERVER_UNLINKED` para los gerentes.
  - Por `ERROR_SERVER_CHANNEL_REPLACED` (otro proceso abrió el canal con el mismo token) solo se detiene, hasta reiniciar.
- Los módulos se suscriben con `channel_service.on(mensaje, handler)` y responden solicitudes con `channel_service.onRequest(solicitud, handler)`:

| Mensaje de la nube (`CHANNEL_EVENT`) | Quién lo atiende | Qué hace |
|---|---|---|
| `sync_required` | `server-product` | Hidratación: pide `server_product.server_products(synced_at)`, guarda los productos, borra `removed_ids` y guarda `products_synced_at`. |
| `product` (`created` / `updated`) | `server-product` | Upsert del producto. |
| `product_removed` | `server-product` | Borra el producto por su id de la nube. |
| `session_revoked` | `session` (`RevocationService`) | Borra las sesiones de ese gerente en el local (`manager_sessions` con ese `cloud_session_key`), su caché y sus sockets. |
| `transfer` | `transfer` (`ConfirmationService`) | Reenvía el cambio a los gerentes por el socket (`transfer.changed`, `{ kind, transfer }`) y da por confirmado un cambio que se había quedado sin respuesta. |
| `session_expired` | `channel` | Cierra el canal y, según el motivo, reintenta o se detiene. |
| `notification` | `notification` (`RelayService`) | Notificación de la nube para un gerente. Se guarda en la nube (la lista es `me/cloud/notifications`) y se le reenvía en vivo por el socket local como `cloud.notification`. |
| `attendance_request` (solicitud) | `shift` (`ReportService`) | Responde con los turnos del rango y su asistencia (empleado, fecha, horario, entrada, salida, estado, retardo, salida anticipada e incidencias). |

- **Estado:** el canal le manda a la nube versión, segundos encendido, si la base responde, `products_synced_at` y envíos pendientes y fallidos. Lo hace al abrir el canal, cada 5 minutos y cuando termina una hidratación o un envío de pedido, con al menos 35 s entre reportes (la nube descarta los que lleguen con menos de 30 s).

Los cambios de productos se aplican en una cola, de uno en uno, y una hidratación pedida mientras otra espera no se duplica. Ver `sequences/product-sync.drawio`.

### Socket local

- Socket.io en su propio puerto (`PORT_SOCKET`, 4520 por defecto). Se conecta con `access_token` en `auth` o en un header; el gerente manda ahí su `session_token` (`mss_...`) y además `audience: "manager"`.
- **Empleado:** se valida su JWT local y entra a `employee:<id>`.
- **Gerente:** se resuelve su sesión sin marcar uso y se valida con la nube (`validateManagerAccess`, con caché). Entra a `managers` y, si la nube devuelve su perfil, también a `manager:<id de la nube>`. A la nube solo se le pregunta al conectar.
- **Revalidación cada 60 s, sin llamar a la nube por el gerente:** el empleado con su JWT local; el gerente solo con su sesión local (que exista y no tenga más de 30 minutos sin uso). Si ya no es válida recibe `session.expired` y se desconecta.
- **Cierre inmediato:** cuando una sesión de gerente se cierra en el local (logout, inactividad, limpieza, revocación de la nube o renovación rechazada), `ManagerSessionService.onClosed` avisa y el socket de esa sesión recibe `session.expired` y se desconecta en el momento. El motivo es `ERROR_MANAGER_SESSION_REVOKED` si la cerró un administrador desde la nube y `ERROR_MANAGER_SESSION_EXPIRED` en los demás casos.
- Eventos:
  - `notification.created`: notificación local nueva, al empleado o a todos los gerentes.
  - `cloud.notification`: la que manda la nube por el canal, al gerente al que va dirigida.
  - `transfer.changed`: un pedido de la nube cambió (`kind`: `created`, `status_changed`…), a todos los gerentes.
  - `server.unlinked`: la nube desvinculó el servidor, con el estado de `pairing/status`, a todos los gerentes.
  - `session.expired`: `{ reason }` con el `code`, antes de desconectar (`ERROR_MANAGER_SESSION_REVOKED` cuando un administrador cerró la sesión del gerente).
- Si falla la conexión, `connect_error` trae `data: { status, code }` con el mismo `code` de la API.

## 9. Reglas de negocio del local

### Empleados, áreas y puestos

- Un empleado tiene un área y un puesto (`user_assignments`); el puesto debe existir en esa área (`area_job_positions`).
- Correo y teléfono son únicos. El empleado puede cambiar su propio teléfono.
- Al dar de alta, la contraseña es opcional: si no se envía se genera una de 15 caracteres. La respuesta es un Excel con correo y contraseña (igual que la nube) y el empleado debe cambiarla al entrar.
- Si el empleado olvida su contraseña, el gerente genera una temporal (`password/reset`): devuelve otro Excel, cierra su sesión y lo obliga a cambiarla.
- El empleado tiene una sola sesión activa. Puede cambiar su contraseña con la actual; al hacerlo se cierra su sesión. El gerente también puede cerrarla.
- No se elimina un área, un puesto ni el vínculo área-puesto mientras tenga empleados.
- Borrar a un empleado cancela sus turnos programados.

### Horarios, turnos y asistencia

- Un turno usa un horario activo y no puede cruzarse con otro turno del mismo empleado.
- Solo se edita o cancela un turno `scheduled`. Un horario con turnos programados no se elimina.
- La entrada se acepta desde `clock_in_window_minutes` antes del turno (`server_settings`, 30 por defecto); antes responde 409 `ERROR_CHECK_TOO_EARLY`. La salida exige una entrada abierta.
- Cada horario tiene dos tolerancias: `late_tolerance_minutes` (retardo) y `early_leave_tolerance_minutes` (salida temprana). Solo pasando la tolerancia se registra la incidencia (`AttendanceRule`).
- La lista de turnos trae la asistencia de cada uno y filtra por `attendance` (`present`, `absent`, `excused`, `incomplete`); un turno terminado sin entrada cuenta como `absent`.
- El gerente corrige horas de cualquier fecha pasada (`attendance`), con motivo obligatorio; se recalculan retardo y salida temprana y se guarda su correo en `corrected_by`.
- El gerente justifica una falta, un retardo o una salida temprana (`justifications`), con motivo obligatorio; se guarda su correo en `justified_by`. Una falta justificada queda `excused`.
- Copiar semana (`shifts/local/copy`): las dos fechas deben caer en `server_settings.week_start_day`. Copia cada turno al mismo día y horario; omite y reporta los que ya pasaron, se cruzan con otro turno, son de un empleado inactivo o usan un horario inactivo.
- Un turno de una bolsa de propinas cerrada no se corrige ni se justifica: responde 409 `ERROR_SHIFT_TIP_POOL_CLOSED` hasta reabrir la bolsa.
- Las fechas se calculan con la zona horaria de `server_settings.timezone`.

### Pedido del día

- Hay un solo pedido `open` a la vez (`transfer_drafts.open_lock` único).
- El empleado crea solicitudes con productos **de su área**; necesita tener área asignada.
- El gerente ajusta la cantidad y el almacén de cada producto, o lo restablece a lo que pidieron los empleados.
- Si la nube borra un producto, su línea sale con `available: false` y no se envía (cuenta como cantidad 0).
- El almacén es opcional (hoy no hay almacenes en producción). Los productos sin almacén van juntos en un solo envío sin destino; la nube registra ese pedido sin almacén y el restaurante lo marca como recibido con `transfer` (`receive_transfer`), sin aceptar, rechazar, repartidor ni envío.
- Al enviar: `open → sending`, se crea un envío por almacén (y uno sin destino) con su `idempotency_key` y se registra en la nube con `transfer.register`. Un fallo no detiene a los demás.
  - Cada envío queda `sent` (con su `transfer_id`), `pending` (error que se puede reintentar, por ejemplo la nube sin responder) o `failed` (la nube lo rechazó), con su `last_error`.
  - El pedido queda `sent` o `partially_sent`.
  - El pedido en curso queda libre para armar otro aunque haya envíos pendientes.
- `POST /v1/orders/local/:id/retry` reintenta los envíos que no quedaron `sent`, con la misma `idempotency_key`, así la nube no duplica el pedido. Sin nada que reintentar responde 409 `ERROR_ORDER_NOTHING_TO_RETRY`. `POST /v1/orders/local/retry` hace lo mismo con todos los pedidos que tengan envíos pendientes. El servidor no reintenta solo, porque el envío necesita el token de un gerente: al volver el canal avisa a los gerentes (`ORDER_DISPATCH_PENDING`).
- La respuesta de `send` y `retry` siempre es 200 con el pedido, pero el mensaje dice cómo quedó. La app debe usar el `code`:
  - `SUCCESS_ORDER_FAILED`: algún envío quedó `failed`.
  - `SUCCESS_ORDER_PENDING`: algún envío quedó `pending` ("se enviará cuando vuelva la conexión").
  - `SUCCESS_ORDER_SENT`: todo llegó.
- `GET /v1/orders/local/:id/export` arma el Excel del pedido para compartirlo (WhatsApp u otra app) sin internet: fecha, estado, quién lo envió y, por producto, código, unidad, cantidad, lo que pidieron los empleados, estado del envío y notas. Las fechas van en la zona horaria del local.

Ver `states/order.drawio`, `states/order-dispatch.drawio` y `sequences/order-send.drawio`.

### Pedidos en la nube (recibir y cancelar)

- `receive` y `cancel` pasan por `ConfirmationService`, que las confirma:
  - Si la nube **no responde**, el cambio pudo haberse aplicado o no. El servidor responde 503 `ERROR_TRANSFER_UNCONFIRMED` y deja el pedido pendiente de confirmar hasta 30 minutos (`TRANSFER_LIMITS.PENDING_TTL_MS`).
  - Mientras está pendiente, otro cambio al mismo pedido responde 409 `ERROR_TRANSFER_PROCESSING`.
  - Se confirma cuando llega el evento `transfer` por el canal o, al reconectar (`sync_required`), consultando el pedido a la nube. En los dos casos se avisa a los gerentes con `transfer.changed`.
  - Si la nube responde que el pedido ya cambió de estado, el servidor responde 409 `ERROR_TRANSFER_INVALID_STATUS` ("actualízalo para ver cómo quedó").

### Propinas

- **Reglas por área** (`tip_area_rules`): porcentaje del total y método `position_weight` (factor del puesto en `area_job_positions.tip_weight`) o `manual`.
- **Bolsas** (`tip_pools`): una por periodo (`day`, `week` o `shift`, según `server_settings.tip_period`), sin cruzarse con otra; cada turno pertenece a una sola bolsa.
- **Qué cuenta:** turnos completos (entrada y salida). Salir antes de la tolerancia sin justificar no cuenta; olvidar la salida no cuenta hasta que el gerente la corrige.
- **Sanciones en turnos:** cada retardo sin justificar quita `late_arrival_shifts` y cada falta sin justificar `absence_shifts` (en `server_settings`). El gerente crea tipos de sanción (`tip_sanction_types`: turnos que quitan o "quita todo") y los aplica a un empleado en una bolsa abierta (`tip_sanctions`).
- **Reparto:** el total se divide entre las áreas activas con gente; el área apagada o sin turnos completos pasa su parte a las demás. Dentro del área, cada persona recibe según *turnos × factor*, en pesos enteros.
- **Dinero sancionado** (`server_settings.tip_sanction_destination`): `fund` lo deja en un fondo aparte (`tip_pools.sanction_amount`), `area` lo reparte entre los demás de la misma área y `all` entre todos los que cobraron, según lo que ganó cada uno. Un área manual no lleva sanciones.
- Se edita mientras está `open`. Para cerrarla, todos los turnos del periodo deben estar cerrados, debe haber participantes y el reparto manual debe sumar el total. `reopen` la vuelve a abrir. Solo se elimina abierta.
- No se puede cambiar el periodo de propinas mientras haya bolsas abiertas.

Ver `states/tip-pool.drawio`.

### Notificaciones

- Son dos listas separadas. Las del local se guardan aquí (`notifications`); las de la nube (pedidos) se guardan en la nube y el gerente las lee con `me/cloud/notifications`, que necesita internet.
- Cada aviso usa una plantilla (`notification_templates`, con `audience` `employee` o `manager`). El servidor crea al arrancar las que falten y no cambia las que ya existen; una plantilla con `status` falso no genera avisos.
- El título y el texto se guardan ya armados, con las fechas en la zona horaria de `server_settings.timezone`.
- **Al empleado** (una fila por empleado, `read_at` vacío = sin leer): `SHIFT_SCHEDULED` (alta de turnos y copiar semana), `SHIFT_CHANGED`, `SHIFT_CANCELLED`, `ATTENDANCE_CORRECTED`, `INCIDENT_JUSTIFIED`, `TIP_POOL_CLOSED` (a cada quien con lo que le tocó) y `TIP_SANCTION_APPLIED`.
- **A los gerentes** (una fila para todos los gerentes del local): `ORDER_REQUEST_SUBMITTED` (cuando un empleado pide un producto nuevo; cambiar la cantidad no avisa), `ATTENDANCE_LATE` (entrada con retardo), `ORDER_DISPATCH_FAILED` (envíos a la nube que fallaron), `ORDER_DISPATCH_PENDING` (al volver el canal quedan envíos pendientes; como mucho cada 15 minutos) y `SERVER_UNLINKED` (la nube desvinculó el servidor). El gerente es un usuario de la nube, así que lo que ya leyó se guarda por su correo en `notification_reads` (el correo no cambia en la nube).
- Se avisa después de guardar y nunca si el paso falla. Si el aviso falla, el paso no falla.
- La lista usa paginación por cursor (`next_cursor`), las más nuevas primero.

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
| `AttendanceRule` | `infrastructure/utils` | Minutos de retardo y de salida temprana con su tolerancia (checador y correcciones). |
| `AttendanceRecordMapper` | `infrastructure/mappers/shared` | Registro de asistencia con incidencias, igual en la agenda y en la lista de turnos. |
| `RedisManager` | `infrastructure/cache` | Caché en Redis (`get`, `set`, `forget`, `forgetGroup`); si Redis no responde, el servidor sigue sin caché. |
| `Xlsx` | `infrastructure/exporters` | Excel de credenciales y de reparto de propinas. |
| `Machine` | `infrastructure/utils` | Plataforma y MAC para emparejar. |
| `TokenPayload` | `infrastructure/utils` | Leer datos de un token ya validado: el correo del gerente (quién envió el pedido, corrigió, justificó o sancionó), su `session_key`, su vencimiento y el `locationId` del `server_token`. |
| `JwtManager`, `Argon2` | `infrastructure/securities` | Tokens y contraseñas. |
| `Crypto` | `infrastructure/securities` | `sha256` y cifrado AES-256-GCM (`encrypt` / `decrypt`) con `DATA_ENCRYPTION_KEY`. |
| `CatalogService` | módulo `repository` | Existencia de áreas, puestos y productos, compartida por los módulos. |

## 12. Nomenclatura

Igual que la nube (`miyabi-api/CLAUDE.md` §4), con estas diferencias:

- Routers: `HTTP_LOCAL_X_ROUTER` y `HTTP_CLOUD_X_ROUTER`; las rutas llevan `/local` o `/cloud` después del recurso.
- Controllers: `XHttpController`; si un módulo tiene los dos lados para el mismo recurso, el local es `LocalXHttpController`. Lo mismo para services (`LocalXService`) y repositorios (`CloudXRepository`).
- Tokens de providers: `SERVICES.LOCAL` / `REPOSITORIES.CLOUD_X` cuando conviven los dos lados.
- No hay archivos `grpc-*`: el único transporte de entrada es HTTP, así que todo lo global lleva prefijo `http-`.

## 13. Notas técnicas y pendientes

- **Estado gRPC 8 de la nube:** `CloudErrorMapper` lo traduce siempre a 413 `PAYLOAD_TOO_LARGE`. La nube también usa 8 para "demasiados intentos" (login, MFA, contraseña), así que un bloqueo por intentos llega a la app como **413** con el `code` de la nube (`ERROR_AUTHENTICATION_TOO_MANY_ATTEMPTS`) en vez de 429.
- **Turno `completed`:** lo asignan la salida del checador y la corrección del gerente cuando hay hora de salida.
- **`.env.example`:** lista todas las variables, incluida `DOCKER_DATABASE_URL` para `docker-compose.yml`.
- **Sin suite de pruebas** automáticas.
- **Notificaciones locales:** el servidor borra al arrancar y cada 24 h las vistas de más de 90 días (`CleanupService`): las del empleado ya leídas y las de gerentes que al menos uno leyó. `ATTENDANCE_ABSENT` no existe porque el servidor aún no detecta las faltas en el momento (se calculan al consultar la asistencia).

## 14. Cómo agregar una ruta

1. Elige el lado: `local/` si usa la base del local, `cloud/` si reenvía a la nube.
2. Agrega la ruta al router `HTTP_LOCAL_X_ROUTER` o `HTTP_CLOUD_X_ROUTER` (sin `/v1`).
3. Crea el schema valibot y su DTO con `static schema`; si ya existe uno igual, reúsalo.
4. Agrega el método a la interfaz del service y su implementación; devuelve `ResultPattern` y usa mensajes `{ code, message }` de `api.message.ts`.
5. En el controller del recurso: decorador de acceso (`@HttpManagerAccess()` o `@HttpLocalAccess()`), `@Param`/`@Query`/`@Body` con su DTO y `@Res()`.
6. Si es `cloud/`: método en el repositorio `CloudXRepository` con `CloudRequest.send(...)`, y el RPC en el proto copiado de la nube (solo campos nuevos, nunca números cambiados).
7. `pnpm build` y `pnpm lint`.
8. Agrega su diagrama en `documents/diagrams/workflows/<módulo>/<lado>/` y la fila en la sección 6.
