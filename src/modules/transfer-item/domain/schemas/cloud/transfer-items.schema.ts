import {
  enum_,
  type InferOutput,
  optional,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PRODUCT_UNIT, TRANSFER_ITEM_STATUS } from '@domain/enums/shared';
import {
  PaginationQuerySchema,
  ParamIdSchema,
  type TParamIdSchema,
  queryArray,
} from '@domain/schemas/shared';

export const TransferItemParamSchema = pipe(
  strictObject({
    ...ParamIdSchema.entries,
  }),
);

export const TransferItemsQuerySchema = strictObject({
  ...PaginationQuerySchema,
  name: optional(string(ERROR_MESSAGE_SCHEMA.name.type)),
  barcode: optional(string(ERROR_MESSAGE_SCHEMA.barcode.type)),
  storage_code: optional(string(ERROR_MESSAGE_SCHEMA.storage_code.type)),
  units: queryArray(
    enum_(PRODUCT_UNIT, ERROR_MESSAGE_SCHEMA.units.itemEnum),
    ERROR_MESSAGE_SCHEMA.units.type,
  ),
  status: queryArray(
    enum_(TRANSFER_ITEM_STATUS, ERROR_MESSAGE_SCHEMA.status.itemEnum),
    ERROR_MESSAGE_SCHEMA.status.type,
  ),
});

export type TTransferItemsSchema = InferOutput<
  typeof TransferItemsQuerySchema
> &
  TParamIdSchema;
