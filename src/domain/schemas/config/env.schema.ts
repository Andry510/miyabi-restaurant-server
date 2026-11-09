import {
  check,
  type InferOutput,
  number,
  objectWithRest,
  optional,
  picklist,
  pipe,
  string,
  transform,
  unknown,
} from 'valibot';

const requiredNumberSchema = pipe(
  string(),
  transform((value) => Number(value)),
  number(),
);

const requiredStringSchema = pipe(string());

export const EnvSchema = pipe(
  objectWithRest(
    {
      //SERVER
      ENVIRONMENT: optional(
        picklist(['production', 'development']),
        'production',
      ),
      PORT: requiredNumberSchema,
      PORT_SOCKET: pipe(
        optional(string(), '4520'),
        transform((value) => Number(value)),
        number(),
      ),

      //DATABASE
      DATABASE_URL: requiredStringSchema,

      //CACHE
      REDIS_URL: requiredStringSchema,

      //CLOUD
      CLOUD_GRPC_URL: requiredStringSchema,

      //JWT
      JWT_SECRET_TOKEN: requiredStringSchema,
      JWT_SECRET_REFRESH_TOKEN: requiredStringSchema,
      JWT_SECRET_PASSWORD_TOKEN: requiredStringSchema,

      //EXPIRATION
      JWT_EXPIRES_TOKEN: requiredNumberSchema,
      JWT_EXPIRES_REFRESH_TOKEN: requiredNumberSchema,
      JWT_EXPIRES_PASSWORD_TOKEN: requiredNumberSchema,

      //ENCRYPTION
      DATA_ENCRYPTION_KEY: pipe(
        string(),
        check(
          (value) => Buffer.from(value, 'base64').length === 32,
          'DATA_ENCRYPTION_KEY debe ser una llave de 32 bytes en base64',
        ),
      ),
    },
    unknown(),
  ),
  transform((res) => ({
    ...res,

    SESSION_EXPIRES_MS: res.JWT_EXPIRES_REFRESH_TOKEN * 1000,
    IS_PRODUCTION: res.ENVIRONMENT === 'production',
  })),
);

export type TEnvSchema = InferOutput<typeof EnvSchema>;
