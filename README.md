# Miyabi Restaurant Server (miyabi-restaurant-server)

Servidor local de cada restaurante de Miyabi. Corre dentro de la sucursal, guarda en su propia base lo que es del local (empleados, áreas, puestos, horarios, turnos, asistencia, pedido del día y propinas) y se conecta con la nube ([`miyabi-api`](../miyabi-api)) por gRPC para todo lo que es compartido (catálogo, proveedores, pedidos a almacenes y la sesión del gerente).

Este documento explica **qué es el servicio y cómo ponerlo a correr**. Para saber **cómo está construido por dentro** lee [`SERVICE_OVERVIEW.md`](./SERVICE_OVERVIEW.md).

## Tabla de contenido

1. [Propósito del repositorio](#1-propósito-del-repositorio)
2. [Requisitos previos](#2-requisitos-previos)
3. [Servicios externos necesarios](#3-servicios-externos-necesarios)
4. [Configuración del proyecto (primera vez)](#4-configuración-del-proyecto-primera-vez)
   - [4.1 Instalar dependencias](#41-instalar-dependencias)
   - [4.2 Variables de entorno](#42-variables-de-entorno)
   - [4.3 Base de datos](#43-base-de-datos)
   - [4.4 Emparejar el servidor con la nube](#44-emparejar-el-servidor-con-la-nube)
5. [Uso del servicio (día a día)](#5-uso-del-servicio-día-a-día)
6. [Problemas comunes](#6-problemas-comunes)
7. [Documentación relacionada](#7-documentación-relacionada)

---

## 1. Propósito del repositorio

| Área | Qué resuelve | Dónde vive el dato |
|---|---|---|
| Empleados | Alta, edición y baja de empleados del local, con su área y su puesto. Inicio de sesión propio del local. | Base local |
| Organización | Áreas de trabajo, puestos, qué puesto existe en qué área y qué productos usa cada área. | Base local |
| Horarios y turnos | Horarios tipo, turnos programados por el gerente y su edición o cancelación. | Base local |
| Asistencia | Entrada y salida del empleado contra su turno, retardos e incidencias. | Base local |
| Pedido del día | Los empleados piden productos de su área; el gerente ajusta, elige el almacén y lo envía a la nube como uno o varios pedidos. | Base local → nube |
| Propinas | Reglas por área (porcentaje y método), bolsas por periodo, reparto y cierre. | Base local |
| Catálogo | Productos, proveedores y locales. Los productos se copian a la base local y se mantienen al día por el canal gRPC con la nube. | Nube (con copia local de productos) |
| Pedidos a almacenes | Ver, recibir y cancelar los pedidos que ya están en la nube. | Nube |

**Quién lo consume:**

| Cliente | Cómo se identifica | Rutas |
|---|---|---|
| App del empleado | `access_token` del propio servidor (`POST /v1/authentication/local/login`) | `@HttpLocalAccess` |
| App del gerente | `session_token` (`mss_...`) que da el servidor al terminar `POST /v1/authentication/cloud/login`. Los tokens de la nube se quedan cifrados en el servidor y nunca llegan a la app | `@HttpManagerAccess` y las rutas `*/cloud` |

Todo entra por **REST** con la versión en la URL (`/v1/...`). El servidor no expone gRPC: lo **consume** de la nube.

## 2. Requisitos previos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | **24.22.1** (LTS) | Es la versión de la imagen Docker. La rama 20 ya no recibe parches de seguridad. |
| pnpm | **10.34.5** | Fijado en `package.json` (`packageManager`). Con Corepack: `corepack enable && corepack prepare pnpm@10.34.5 --activate`. |
| PostgreSQL | Reciente | La base del local. Las tablas van en el esquema por defecto (`public`). |
| La nube (`miyabi-api`) | Corriendo y alcanzable | Para emparejar, para las rutas de gerente y para sincronizar productos. |

## 3. Servicios externos necesarios

| Servicio | Obligatorio | Para qué |
|---|---|---|
| **PostgreSQL** | Sí | Toda la información del local. |
| **Redis** (`REDIS_URL`) | Sí | Caché de la validación de la sesión del gerente y de la configuración. Si Redis no responde el servidor sigue, pero cada petición del gerente consulta a la nube. |
| **gRPC de la nube** (`CLOUD_GRPC_URL`) | Sí, para gerentes | Login del gerente, validación y renovación de su sesión, catálogo, proveedores y pedidos. Cada llamada tiene 10 s de plazo; si no responde, la ruta contesta **503** `ERROR_CLOUD_UNAVAILABLE`. Si la conexión se cae, el cliente reintenta cada 1 a 5 s, así que vuelve a los pocos segundos de que regrese la nube. |
| **Canal gRPC de la nube** (`server.channel`, en `CLOUD_GRPC_URL`) | Recomendado | Canal que abre el servidor y deja abierto: la nube le avisa de productos, pedidos y sesiones, le pide la asistencia y recibe su estado. Sin canal el servidor funciona, pero su copia de productos no se actualiza sola. Si se corta, reintenta solo con espera creciente (de 1 a 30 s). |

Lo que es del local (empleados, turnos, asistencia, solicitudes del pedido del día, propinas) **sigue funcionando sin internet** para los empleados.

El gerente necesita internet. Un corte corto no lo saca:

- Mientras su validación siga en Redis (lo que dura el `access_token` de la nube, unos 15 minutos), puede seguir trabajando y enviar el pedido del día.
- Lo que no llega a la nube queda pendiente y se reintenta después.
- Cuando ese token vence sin internet, sus rutas responden **503** `ERROR_CLOUD_UNAVAILABLE` hasta que vuelva la nube. Su sesión no se pierde.

**Puerto:** `PORT` (la imagen Docker expone **3520**).

## 4. Configuración del proyecto (primera vez)

### 4.1 Instalar dependencias

```bash
pnpm install
```

### 4.2 Variables de entorno

Crea un archivo `.env` en la raíz (puedes copiar `.env.example`). El servidor valida todas al arrancar (`src/domain/schemas/config/env.schema.ts`) y no inicia si falta alguna obligatoria.

| Variable | Obligatoria | Ejemplo | Uso |
|---|---|---|---|
| `PORT` | Sí | `3520` | Puerto HTTP. |
| `PORT_SOCKET` | No | `4520` | Puerto del socket local (avisos en vivo a las pantallas del local). |
| `DATABASE_URL` | Sí | `postgresql://user:pass@localhost:5432/miyabi_restaurant` | Base del local. |
| `REDIS_URL` | Sí | `redis://127.0.0.1:6379` | Caché de sesiones de gerente y de la configuración. En Docker se usa el Redis del `docker-compose.yml`; para desarrollar sin Docker basta un contenedor `redis:7.4-alpine` en el puerto 6379. |
| `CLOUD_GRPC_URL` | Sí | `localhost:5510` | gRPC de la nube. |
| `JWT_SECRET_TOKEN` | Sí | (texto largo y aleatorio) | Firma del `access_token` de empleados. |
| `JWT_SECRET_REFRESH_TOKEN` | Sí | (texto largo y aleatorio) | Firma del `refresh_token` de empleados. |
| `JWT_SECRET_PASSWORD_TOKEN` | Sí | (texto largo y aleatorio) | Firma del token para cambiar la contraseña obligatoria. |
| `JWT_EXPIRES_TOKEN` | Sí | `900` | Vigencia del `access_token`, en segundos. |
| `JWT_EXPIRES_REFRESH_TOKEN` | Sí | `604800` | Vigencia de la sesión, en segundos. |
| `JWT_EXPIRES_PASSWORD_TOKEN` | Sí | `600` | Vigencia del token de contraseña, en segundos. |
| `DATA_ENCRYPTION_KEY` | Sí | (32 bytes en base64) | Llave AES-256-GCM con la que se cifran en la base el `server_token` y los tokens de la nube de cada gerente. Se genera con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Si se cambia o se pierde, el servidor ya no puede leer su token: queda desvinculado (`ERROR_LOCAL_TOKEN_UNREADABLE`) y los gerentes tienen que volver a entrar. |
| `DOCKER_DATABASE_URL` | Solo con Docker | `postgresql://user:pass@host.docker.internal:5432/miyabi_restaurant` | `docker-compose.yml` la usa como `DATABASE_URL` del contenedor. |

Los secretos de JWT del servidor son **solo para empleados**: el gerente usa los tokens de la nube, que el servidor guarda cifrados.

El `server_token` ya no va en el `.env`: el servidor lo recibe al emparejar y lo guarda cifrado en `server_settings` (sección 4.4).

### 4.3 Base de datos

```bash
pnpm prisma generate          # genera el cliente en generated/prisma
pnpm prisma migrate deploy    # aplica prisma/migrations
```

La migración inicial es `prisma/migrations/20261108223345_init`. El diagrama de la base está en `documents/database/database.dbml` (se abre en [dbdiagram.io](https://dbdiagram.io)).

Para cambiar el modelo, edita `prisma/schema.prisma` y crea la migración con `pnpm prisma migrate dev --name <cambio>`.

### 4.4 Emparejar el servidor con la nube

El estado del emparejamiento vive en `server_settings.pairing_status` y se consulta con `GET /v1/pairing/status`:

| Estado | Qué significa | Qué funciona |
|---|---|---|
| `unpaired` | Nunca se emparejó. | Solo `pairing/register` y `pairing/status`; lo demás responde **409** `ERROR_SERVER_NOT_PAIRED`. |
| `paired` | Tiene su `server_token` y habla con la nube. | Todo. |
| `unlinked` | La nube lo desvinculó (`unlinked_reason`). | Lo local sigue; lo que va a la nube responde **503** `ERROR_SERVER_UNLINKED`. |

**Primera vez:**

1. En la nube, un admin genera un **enrollment token** para el local (`POST /v1/pairing/enrollment-token`).
2. Con el servidor corriendo, llama a:

   ```http
   POST /v1/pairing/register
   { "name": "Sucursal Centro", "enrollment_token": "<token de la nube>" }
   ```

3. El servidor guarda el `server_token` cifrado en la base y abre de inmediato su canal con la nube (`server.channel`), que le pide sincronizar los productos de su local. **No hay que reiniciar ni tocar el `.env`.** La respuesta trae `name` y `location_id`; el token nunca sale del servidor.

Si el servidor ya está `paired`, la ruta responde **409** `ERROR_SERVER_ALREADY_PAIRED`.

**Cuando la nube lo desvincula** (el admin desactivó, revocó o regeneró el token del servidor, o la nube rechazó el token):

- El servidor pasa a `unlinked` y avisa a los gerentes por el socket (`server.unlinked`) y con la notificación `SERVER_UNLINKED`.
- Si el admin **regeneró el token**, pégalo con:

  ```http
  POST /v1/pairing/token
  { "server_token": "<token nuevo de la nube>" }
  ```

  El servidor lo prueba con la nube antes de guardarlo y solo lo acepta si es del **mismo local**. Responde:
  - **400** `ERROR_SERVER_TOKEN_INVALID` si no es un token de servidor o la nube lo rechaza;
  - **409** `ERROR_SERVER_LOCATION_MISMATCH` si es de otro local;
  - **409** `ERROR_SERVER_ALREADY_PAIRED` si el servidor ya está `paired`;
  - **409** `ERROR_SERVER_NOT_UNLINKED` si nunca se emparejó.
- También puede volver a emparejarse con un enrollment token nuevo (`pairing/register`). Si es **de otro local**, el servidor borra su copia de productos y todos los pedidos del día antes de emparejarse.

## 5. Uso del servicio (día a día)

| Tarea | Comando |
|---|---|
| Desarrollo con recarga | `pnpm start:dev` |
| Compilar | `pnpm build` |
| Producción (después de compilar) | `pnpm start:prod` |
| Lint | `pnpm lint` / `pnpm lint:fix` |
| Formato | `pnpm format` |

No hay suite de pruebas automáticas (`test`) definida.

**Docker** (PostgreSQL queda fuera del contenedor):

```bash
docker compose up -d --build
```

La imagen compila en una etapa y, al arrancar, aplica las migraciones (`prisma migrate deploy`) y levanta `dist/src/main`. Usa el `.env` de la raíz, con `DOCKER_DATABASE_URL` como base.

**Formato de las respuestas:**

```jsonc
// éxito
{ "code": "SUCCESS_...", "message": "Texto para el usuario", "data": {}, "meta": {}, "timestamp": "2026-10-27T15:00:00.000Z" }
// error
{ "status_code": 409, "code": "ERROR_...", "message": "Texto para el usuario", "timestamp": "2026-10-27T15:00:00.000Z" }
```

`code` es estable y es lo que debe usar la app; `message` es texto en español y puede cambiar. Cuando el error viene de la nube, el `code` es el que mandó la nube.

## 6. Problemas comunes

| Síntoma | Causa | Qué hacer |
|---|---|---|
| El servidor no arranca y el log dice `INVALID_ENV_VARIABLE` | Falta una variable obligatoria o un número no es número. | Revisa la tabla de la sección 4.2. |
| Todo responde 409 `ERROR_SERVER_NOT_PAIRED` | El servidor nunca se emparejó (`pairing_status = unpaired`). | Empareja el servidor (sección 4.4). |
| Lo de la nube responde 503 `ERROR_SERVER_UNLINKED` | La nube desvinculó el servidor; `GET /v1/pairing/status` dice por qué (`unlinked_reason`). | Pide al admin el token regenerado y mándalo a `POST /v1/pairing/token`, o empareja con un enrollment token nuevo. |
| Las rutas de gerente responden 503 `ERROR_CLOUD_UNAVAILABLE` | La nube no responde en 10 s y la sesión del gerente no está en la caché (o ya venció su `access_token`). | Revisa `CLOUD_GRPC_URL`, que la nube esté arriba y que Redis responda. Las rutas de empleado siguen funcionando. |
| El gerente recibe 401 `ERROR_MANAGER_SESSION_EXPIRED` o `ERROR_MANAGER_SESSION_INVALID` | `EXPIRED`: pasaron 30 minutos sin usar la sesión o la nube ya no la renueva. `INVALID`: la sesión no existe (la cerró, la revocó el admin o la borró la limpieza). | Volver a iniciar sesión. |
| Los productos no se actualizan | El canal no abre o la nube lo cerró. | Revisa `CLOUD_GRPC_URL`, el log `CHANNEL-SERVICE` y `GET /v1/pairing/status`. Si la nube cerró el canal porque abrió otro con el mismo token (`ERROR_SERVER_CHANNEL_REPLACED`), reinicia el servidor. |
| Error de Prisma al arrancar | No se generó el cliente o faltan migraciones. | `pnpm prisma generate` y `pnpm prisma migrate deploy`. |
| Una foto responde 413 | Pasa de 6 MB o del límite de la nube. | Usa una imagen más chica (JPG, PNG o WEBP). |

## 7. Documentación relacionada

- [`SERVICE_OVERVIEW.md`](./SERVICE_OVERVIEW.md): arquitectura, módulos, rutas, seguridad y convenciones.
- `documents/diagrams/` (draw.io):
  - `workflows/<módulo>/<local|cloud>/`: un flujo por ruta, con cada validación y su `code`.
  - `workflows/common/local/`: los tres guards.
  - `sequences/`: emparejamiento, desvinculación y token nuevo, sesión del gerente (login, peticiones y cierre), pedido del día y sincronización de productos.
  - `states/`: pedido, envío, bolsa de propinas, turno, sesión del empleado y sesión del gerente.
  - `use-cases/`: empleado y gerente.
- `documents/database/`: diagrama de la base.
- La nube: [`miyabi-api/README.md`](../miyabi-api/README.md) y [`miyabi-api/SERVICE_OVERVIEW.md`](../miyabi-api/SERVICE_OVERVIEW.md).
