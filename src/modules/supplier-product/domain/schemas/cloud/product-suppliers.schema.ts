import { type InferOutput, optional, strictObject, string } from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import {
  PaginationQuerySchema,
  type TParamIdSchema,
} from '@domain/schemas/shared';

export const ProductSuppliersQuerySchema = strictObject({
  ...PaginationQuerySchema,
  first_name: optional(string(ERROR_MESSAGE_SCHEMA.first_name.type)),
  last_name: optional(string(ERROR_MESSAGE_SCHEMA.last_name.type)),
  email: optional(string(ERROR_MESSAGE_SCHEMA.email.type)),
  phone_number: optional(string(ERROR_MESSAGE_SCHEMA.phone_number.type)),
});

export type TProductSuppliersSchema = InferOutput<
  typeof ProductSuppliersQuerySchema
> &
  TParamIdSchema;
