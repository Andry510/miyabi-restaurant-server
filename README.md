# Miyabi Restaurant Server (miyabi-restaurant-server)

Servidor local de cada restaurante de Miyabi. Corre dentro de la sucursal, guarda en su propia base lo que es del local (empleados, áreas, puestos, horarios, turnos, asistencia, pedido del día y propinas) y se conecta con la nube ([`miyabi-api`](../miyabi-api)) por gRPC y socket.io para todo lo que es compartido (catálogo, proveedores, pedidos a almacenes y la sesión del gerente).

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
| Catálogo | Productos, proveedores y locales. Los productos se copian a la base local y se mantienen al día por socket. | Nube (con copia local de productos) |
| Pedidos a almacenes | Ver, recibir y cancelar los pedidos que ya están en la nube. | Nube |

**Quién lo consume:**

| Cliente | Cómo se identifica | Rutas |
|---|---|---|
| App del empleado | `access_token` del propio servidor (`POST /v1/authentication/local/login`) | `@HttpLocalAccess` |
| App del gerente | `access_token` de la nube (`POST /v1/authentication/cloud/login`); el servidor lo valida contra la nube en cada petición | `@HttpManagerAccess` y las rutas `*/cloud` |

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
| **gRPC de la nube** (`CLOUD_GRPC_URL`) | Sí, para gerentes | Login del gerente, validación de su sesión en cada ruta de gerente, catálogo, proveedores y pedidos. Cada llamada tiene 10 s de plazo; si no responde, la ruta contesta **503** `ERROR_CLOUD_UNAVAILABLE`. |
| **socket.io de la nube** (`CLOUD_SOCKET_URL`) | Recomendado | Avisos de productos creados, editados o quitados, y la orden de resincronizar. Sin socket el servidor funciona, pero su copia de productos no se actualiza sola. Reintenta la conexión cada 30 s. |

Lo que es del local (empleados, turnos, asistencia, solicitudes del pedido del día, propinas) **sigue funcionando sin internet** para los empleados. Lo que pasa por la nube (todas las rutas de gerente, el catálogo y el envío del pedido) no.

**Puerto:** `PORT` (la imagen Docker expone **3520**).

## 4. Configuración del proyecto (primera vez)

### 4.1 Instalar dependencias

```bash
pnpm install
```

### 4.2 Variables de entorno

Crea un archivo `.env` en la raíz. El servidor valida todas al arrancar (`src/domain/schemas/config/env.schema.ts`) y no inicia si falta alguna obligatoria.

| Variable | Obligatoria | Ejemplo | Uso |
|---|---|---|---|
| `PORT` | Sí | `3520` | Puerto HTTP. |
| `DATABASE_URL` | Sí | `postgresql://user:pass@localhost:5432/miyabi_restaurant` | Base del local. |
| `CLOUD_GRPC_URL` | Sí | `localhost:5510` | gRPC de la nube. |
| `CLOUD_SOCKET_URL` | Sí | `http://localhost:4510` | socket.io de la nube. |
| `JWT_SECRET_TOKEN` | Sí | (texto largo y aleatorio) | Firma del `access_token` de empleados. |
| `JWT_SECRET_REFRESH_TOKEN` | Sí | (texto largo y aleatorio) | Firma del `refresh_token` de empleados. |
| `JWT_SECRET_PASSWORD_TOKEN` | Sí | (texto largo y aleatorio) | Firma del token para cambiar la contraseña obligatoria. |
| `JWT_EXPIRES_TOKEN` | Sí | `900` | Vigencia del `access_token`, en segundos. |
| `JWT_EXPIRES_REFRESH_TOKEN` | Sí | `604800` | Vigencia de la sesión, en segundos. |
| `JWT_EXPIRES_PASSWORD_TOKEN` | Sí | `600` | Vigencia del token de contraseña, en segundos. |
| `SERVER_TOKEN` | No | (vacío hasta emparejar) | Token que da la nube al emparejar. Sin él, todas las rutas responden **409** `ERROR_SERVER_NOT_PAIRED`, excepto `POST /v1/pairing/register`. |
| `DOCKER_DATABASE_URL` | Solo con Docker | `postgresql://user:pass@host.docker.internal:5432/miyabi_restaurant` | `docker-compose.yml` la usa como `DATABASE_URL` del contenedor. |

Los secretos de JWT del servidor son **solo para empleados**: el gerente usa los tokens de la nube.

### 4.3 Base de datos

```bash
pnpm prisma generate          # genera el cliente en generated/prisma
pnpm prisma migrate deploy    # aplica prisma/migrations
```

La migración inicial es `prisma/migrations/20261027041222_init`. El diagrama de la base está en `documents/database/database.dbml` (se abre en [dbdiagram.io](https://dbdiagram.io)).

Para cambiar el modelo, edita `prisma/schema.prisma` y crea la migración con `pnpm prisma migrate dev --name <cambio>`.

### 4.4 Emparejar el servidor con la nube

1. En la nube, un admin genera un **enrollment token** para el local.
2. Con el servidor corriendo y sin `SERVER_TOKEN`, llama a:

   ```http
   POST /v1/pairing/register
   { "name": "Sucursal Centro", "enrollment_token": "<token de la nube>" }
   ```

3. La respuesta trae `server_token`. Pégalo en `.env` como `SERVER_TOKEN` y **reinicia** el servidor.
4. Al arrancar, el servidor se conecta al socket de la nube, que le pide sincronizar los productos de su local.

Si el servidor ya tiene `SERVER_TOKEN`, la ruta responde **409** `ERROR_SERVER_ALREADY_PAIRED`.

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
| Todo responde 409 `ERROR_SERVER_NOT_PAIRED` | No hay `SERVER_TOKEN`. | Empareja el servidor (sección 4.4) y reinicia. |
| Las rutas de gerente responden 503 `ERROR_CLOUD_UNAVAILABLE` | La nube no responde en 10 s. | Revisa `CLOUD_GRPC_URL` y que la nube esté arriba. Las rutas de empleado siguen funcionando. |
| Los productos no se actualizan | El socket no conecta o la nube lo rechazó. | Revisa `CLOUD_SOCKET_URL` y el log del socket. Si la nube revocó el servidor, hay que volver a emparejarlo. |
| Error de Prisma al arrancar | No se generó el cliente o faltan migraciones. | `pnpm prisma generate` y `pnpm prisma migrate deploy`. |
| Una foto responde 413 | Pasa de 6 MB o del límite de la nube. | Usa una imagen más chica (JPG, PNG o WEBP). |

## 7. Documentación relacionada

- [`SERVICE_OVERVIEW.md`](./SERVICE_OVERVIEW.md): arquitectura, módulos, rutas, seguridad y convenciones.
- `documents/diagrams/` (draw.io):
  - `workflows/<módulo>/<local|cloud>/`: un flujo por ruta, con cada validación y su `code`.
  - `workflows/common/local/`: los tres guards.
  - `sequences/`: emparejamiento, acceso del gerente, pedido del día y sincronización de productos.
  - `states/`: pedido, envío, bolsa de propinas, turno y sesión.
  - `use-cases/`: empleado y gerente.
- `documents/database/`: diagrama de la base.
- La nube: [`miyabi-api/README.md`](../miyabi-api/README.md) y [`miyabi-api/SERVICE_OVERVIEW.md`](../miyabi-api/SERVICE_OVERVIEW.md).
