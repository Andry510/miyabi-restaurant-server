import {
  type InferOutput,
  optional,
  pipe,
  strictObject,
  string,
  transform,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

//Domain
import { PaginationQuerySchema } from '@domain/schemas/shared';

export const UsersQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    first_name: optional(string(ERROR_MESSAGE_SCHEMA.first_name.type)),
    last_name: optional(string(ERROR_MESSAGE_SCHEMA.last_name.type)),
    email: optional(string(ERROR_MESSAGE_SCHEMA.email.type)),
    phone_number: optional(string(ERROR_MESSAGE_SCHEMA.phone_number.type)),
  }),
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TUsersQuerySchema = InferOutput<typeof UsersQuerySchema>;

export const SessionsQuerySchema = pipe(
  strictObject({ ...PaginationQuerySchema }),
  transform(({ limit, page }) => ({
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TSessionsQuerySchema = InferOutput<typeof SessionsQuerySchema>;
