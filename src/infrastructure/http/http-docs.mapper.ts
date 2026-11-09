import { HttpStatus } from '@nestjs/common';
import type { ApiResponseOptions } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toJsonSchema } from '@valibot/to-json-schema';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Api
import { API_SESSION_MESSAGE } from '../../modules/session/api/messages';

//Domain
import type { TApiMessage } from '@domain/types/shared';

//Infrastructure
import type {
  THttpDocs,
  THttpDocsAccess,
  THttpDocsData,
  THttpDocsError,
  THttpDocsParameter,
  THttpDocsSchema,
} from './http-docs.type';

const TIMESTAMP_EXAMPLE = '2026-11-08T15:00:00.000Z';

const PAGINATION_SCHEMA: SchemaObject = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 10 },
    total: { type: 'integer', example: 1 },
    total_pages: { type: 'integer', example: 1 },
    next_page: { type: 'boolean', example: false },
    prev_page: { type: 'boolean', example: false },
  },
};

const DATA_SCHEMA: Record<Exclude<THttpDocsData, 'none'>, SchemaObject> = {
  object: { type: 'object' },
  array: { type: 'array', items: { type: 'object' } },
  string: { type: 'string' },
  pagination: { type: 'array', items: { type: 'object' } },
  file: {
    type: 'object',
    description: 'Archivo Excel serializado como Buffer de Node',
    properties: {
      type: { type: 'string', example: 'Buffer' },
      data: { type: 'array', items: { type: 'integer' } },
    },
  },
};

const error = (status: HttpStatus, message: TApiMessage): THttpDocsError => ({
  status,
  message,
});

const CLOUD_ERRORS: readonly THttpDocsError[] = [
  error(
    HttpStatus.SERVICE_UNAVAILABLE,
    API_MESSAGE_GLOBAL.ERROR.CLOUD_UNAVAILABLE,
  ),
  error(
    HttpStatus.SERVICE_UNAVAILABLE,
    API_MESSAGE_GLOBAL.ERROR.SERVER_UNLINKED,
  ),
];

const MANAGER_SESSION_ERRORS: readonly THttpDocsError[] = [
  error(
    HttpStatus.UNAUTHORIZED,
    API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_INVALID,
  ),
  error(
    HttpStatus.UNAUTHORIZED,
    API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED,
  ),
];

const ACCESS_ERRORS: Record<THttpDocsAccess, readonly THttpDocsError[]> = {
  employee: [
    error(HttpStatus.UNAUTHORIZED, API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN),
    error(
      HttpStatus.UNAUTHORIZED,
      API_MESSAGE_GLOBAL.ERROR.INVALID_ACCESS_TOKEN,
    ),
    error(HttpStatus.UNAUTHORIZED, API_MESSAGE_GLOBAL.ERROR.EXPIRED_TOKEN),
    error(HttpStatus.UNAUTHORIZED, API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED),
  ],
  manager: [
    error(HttpStatus.UNAUTHORIZED, API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN),
    ...MANAGER_SESSION_ERRORS,
    error(HttpStatus.UNAUTHORIZED, API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED),
    error(HttpStatus.FORBIDDEN, API_MESSAGE_GLOBAL.ERROR.FORBIDDEN),
    ...CLOUD_ERRORS,
  ],
  manager_cloud: [...MANAGER_SESSION_ERRORS, ...CLOUD_ERRORS],
};

const toSchema = ({ schema }: THttpDocsSchema): SchemaObject => {
  const { $schema: _schema, ...jsonSchema } = toJsonSchema(schema, {
    target: 'openapi-3.0',
    typeMode: 'input',
    errorMode: 'ignore',
  }) as Record<string, unknown>;

  return jsonSchema as SchemaObject;
};

const toParameters = (
  docs: THttpDocsSchema,
  location: 'path' | 'query',
): THttpDocsParameter[] => {
  const { properties = {}, required = [] } = toSchema(docs);

  return Object.entries(properties).map(([name, schema]) => ({
    name,
    required: location === 'path' || required.includes(name),
    schema: schema as SchemaObject,
  }));
};

const errorBody = (
  status: HttpStatus,
  { code, message }: TApiMessage,
): Record<string, unknown> => ({
  status_code: status,
  code,
  message,
  timestamp: TIMESTAMP_EXAMPLE,
});

const successSchema = (data: THttpDocsData): SchemaObject => ({
  type: 'object',
  required: ['code', 'message', 'timestamp'],
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
    ...(data === 'none' ? {} : { data: DATA_SCHEMA[data] }),
    ...(data === 'pagination' ? { meta: PAGINATION_SCHEMA } : {}),
    timestamp: { type: 'string', format: 'date-time' },
  },
});

const ERROR_SCHEMA: SchemaObject = {
  type: 'object',
  required: ['status_code', 'code', 'message', 'timestamp'],
  properties: {
    status_code: { type: 'integer' },
    code: { type: 'string' },
    message: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const CLOUD_NOTE =
  'Pasa por la nube: si la nube rechaza la petición, la respuesta trae el code que manda la nube.';

export class HttpDocsMapper {
  static description = (docs: THttpDocs): string | undefined =>
    docs.cloud
      ? [docs.description, CLOUD_NOTE].filter(Boolean).join(' ')
      : docs.description;

  static body = (docs: THttpDocsSchema): SchemaObject => toSchema(docs);

  static params = (docs: THttpDocsSchema): THttpDocsParameter[] =>
    toParameters(docs, 'path');

  static query = (docs: THttpDocsSchema): THttpDocsParameter[] =>
    toParameters(docs, 'query');

  static success = (docs: THttpDocs): ApiResponseOptions => {
    const messages = ([] as TApiMessage[]).concat(docs.success);
    const data = docs.data ?? 'object';

    return {
      status: docs.status ?? HttpStatus.OK,
      description: messages.map(({ code }) => code).join(' · '),
      content: {
        'application/json': {
          schema: successSchema(data),
          examples: Object.fromEntries(
            messages.map(({ code, message }) => [
              code,
              {
                summary: message,
                value: {
                  code,
                  message,
                  ...(data === 'none' ? {} : { data: {} }),
                  timestamp: TIMESTAMP_EXAMPLE,
                },
              },
            ]),
          ),
        },
      },
    };
  };

  static errors = (docs: THttpDocs): ApiResponseOptions[] => {
    const hasInput = !!(docs.params || docs.query || docs.body);
    const all: THttpDocsError[] = [
      ...(hasInput
        ? [
            {
              status: HttpStatus.BAD_REQUEST,
              message: API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST,
            },
          ]
        : []),
      ...(docs.unpaired
        ? []
        : [
            error(
              HttpStatus.CONFLICT,
              API_MESSAGE_GLOBAL.ERROR.SERVER_NOT_PAIRED,
            ),
          ]),
      ...(docs.access ? ACCESS_ERRORS[docs.access] : []),
      ...(docs.errors ?? []),
      ...(docs.cloud ? CLOUD_ERRORS : []),
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
      },
    ];

    const byStatus = new Map<HttpStatus, TApiMessage[]>();

    for (const { status, message } of all) {
      const messages = byStatus.get(status) ?? [];

      if (!messages.some(({ code }) => code === message.code)) {
        messages.push(message);
      }

      byStatus.set(status, messages);
    }

    return [...byStatus.entries()]
      .sort(([first], [second]) => first - second)
      .map(([status, messages]) => ({
        status,
        description: messages.map(({ code }) => code).join(' · '),
        content: {
          'application/json': {
            schema: ERROR_SCHEMA,
            examples: Object.fromEntries(
              messages.map((message) => [
                message.code,
                { summary: message.message, value: errorBody(status, message) },
              ]),
            ),
          },
        },
      }));
  };
}
