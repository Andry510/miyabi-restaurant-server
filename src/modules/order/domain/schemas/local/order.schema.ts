import {
  check,
  enum_,
  type InferOutput,
  integer,
  maxLength,
  maxValue,
  minValue,
  number,
  optional,
  pipe,
  strictObject,
  string,
  transform,
  trim,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { ORDER_STATUS } from '@domain/enums/shared';
import {
  DateRangeQuerySchema,
  dateRange,
  PaginationQuerySchema,
} from '@domain/schemas/shared';

const MAX_QUANTITY = 99_999;

const productIdField = pipe(
  string(ERROR_MESSAGE_SCHEMA.product_id.type),
  uuid(ERROR_MESSAGE_SCHEMA.product_id.uuid),
);

const requestQuantityField = pipe(
  number(ERROR_MESSAGE_SCHEMA.quantity.type),
  integer(ERROR_MESSAGE_SCHEMA.quantity.integer),
  minValue(1, ERROR_MESSAGE_SCHEMA.quantity.range),
  maxValue(MAX_QUANTITY, ERROR_MESSAGE_SCHEMA.quantity.range),
);

const noteField = pipe(
  string(ERROR_MESSAGE_SCHEMA.note.type),
  trim(),
  maxLength(255, ERROR_MESSAGE_SCHEMA.note.maxLength),
);

export const RequestBodySchema = strictObject({
  product_id: productIdField,
  quantity: requestQuantityField,
  note: optional(noteField),
});

export type TRequestBodySchema = InferOutput<typeof RequestBodySchema>;

export const UpdateRequestSchema = pipe(
  strictObject({
    quantity: optional(requestQuantityField),
    note: optional(noteField),
  }),
  check(
    (input) => Object.values(input).some((value) => value !== undefined),
    ERROR_MESSAGE_SCHEMA.empty,
  ),
);

export type TUpdateRequestSchema = InferOutput<typeof UpdateRequestSchema>;

export const ItemBodySchema = strictObject({
  quantity: pipe(
    number(ERROR_MESSAGE_SCHEMA.quantity.type),
    integer(ERROR_MESSAGE_SCHEMA.quantity.integer),
    minValue(0, ERROR_MESSAGE_SCHEMA.quantity.range),
    maxValue(MAX_QUANTITY, ERROR_MESSAGE_SCHEMA.quantity.range),
  ),
  to_location_id: optional(
    pipe(
      string(ERROR_MESSAGE_SCHEMA.to_location_id.type),
      uuid(ERROR_MESSAGE_SCHEMA.to_location_id.uuid),
    ),
  ),
});

export type TItemBodySchema = InferOutput<typeof ItemBodySchema>;

export const ItemParamSchema = strictObject({
  product_id: productIdField,
});

export type TItemParamSchema = InferOutput<typeof ItemParamSchema>;

export const OrdersQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    ...DateRangeQuerySchema,
    status: optional(enum_(ORDER_STATUS, ERROR_MESSAGE_SCHEMA.status.enum)),
  }),
  dateRange(),
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TOrdersQuerySchema = InferOutput<typeof OrdersQuerySchema>;

export const MineQuerySchema = pipe(
  strictObject({ ...DateRangeQuerySchema }),
  dateRange(),
);

export type TMineQuerySchema = InferOutput<typeof MineQuerySchema>;
