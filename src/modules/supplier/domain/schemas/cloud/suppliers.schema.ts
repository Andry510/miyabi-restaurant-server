import {
  type InferOutput,
  optional,
  pipe,
  strictObject,
  string,
  transform,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PaginationQuerySchema, queryArray } from '@domain/schemas/shared';

export const SuppliersQuerySchema = strictObject({
  ...PaginationQuerySchema,
  first_name: optional(string(ERROR_MESSAGE_SCHEMA.first_name.type)),
  last_name: optional(string(ERROR_MESSAGE_SCHEMA.last_name.type)),
  email: optional(string(ERROR_MESSAGE_SCHEMA.email.type)),
  phone_number: pipe(
    queryArray(
      string(ERROR_MESSAGE_SCHEMA.phone_number.type),
      ERROR_MESSAGE_SCHEMA.phone_numbers.type,
    ),
    transform((phones) => phones.filter((phone) => phone.length > 0)),
  ),
});

export type TSuppliersQuerySchema = InferOutput<typeof SuppliersQuerySchema>;
