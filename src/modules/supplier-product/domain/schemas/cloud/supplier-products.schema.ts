import {
  enum_,
  type InferOutput,
  optional,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PRODUCT_UNIT } from '@domain/enums/shared';
import {
  PaginationQuerySchema,
  type TParamIdSchema,
  queryArray,
} from '@domain/schemas/shared';

export const SupplierProductsQuerySchema = strictObject({
  ...PaginationQuerySchema,
  name: optional(string(ERROR_MESSAGE_SCHEMA.name.type)),
  barcode: optional(string(ERROR_MESSAGE_SCHEMA.barcode.type)),
  storage_code: optional(string(ERROR_MESSAGE_SCHEMA.storage_code.type)),
  units: queryArray(
    enum_(PRODUCT_UNIT, ERROR_MESSAGE_SCHEMA.units.itemEnum),
    ERROR_MESSAGE_SCHEMA.units.type,
  ),
});

export type TSupplierProductsSchema = InferOutput<
  typeof SupplierProductsQuerySchema
> &
  TParamIdSchema;
