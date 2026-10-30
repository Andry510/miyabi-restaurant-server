import {
  type InferOutput,
  number,
  objectWithRest,
  optional,
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
      PORT: requiredNumberSchema,

      //DATABASE
      DATABASE_URL: requiredStringSchema,

      //CACHE
      REDIS_URL: requiredStringSchema,

      //CLOUD
      CLOUD_GRPC_URL: requiredStringSchema,
      CLOUD_SOCKET_URL: requiredStringSchema,

      //JWT
      JWT_SECRET_TOKEN: requiredStringSchema,
      JWT_SECRET_REFRESH_TOKEN: requiredStringSchema,
      JWT_SECRET_PASSWORD_TOKEN: requiredStringSchema,

      //EXPIRATION
      JWT_EXPIRES_TOKEN: requiredNumberSchema,
      JWT_EXPIRES_REFRESH_TOKEN: requiredNumberSchema,
      JWT_EXPIRES_PASSWORD_TOKEN: requiredNumberSchema,

      //PAIRING
      SERVER_TOKEN: optional(string()),
    },
    unknown(),
  ),
  transform(({ SERVER_TOKEN, ...res }) => ({
    ...res,
    SERVER_TOKEN: SERVER_TOKEN?.trim() || null,

    SESSION_EXPIRES_MS: res.JWT_EXPIRES_REFRESH_TOKEN * 1000,
  })),
);

export type TEnvSchema = InferOutput<typeof EnvSchema>;
