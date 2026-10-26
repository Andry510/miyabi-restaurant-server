import {
  array,
  check,
  type InferOutput,
  maxLength,
  nonEmpty,
  optional,
  pipe,
  regex,
  strictObject,
  string,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

const MAX_QTY = 2147483647;

const hasUniqueProducts = <T extends { product_id: string }>(
  items: T[],
): boolean =>
  new Set(items.map(({ product_id }) => product_id)).size === items.length;

const TransferItemSchema = strictObject({
  product_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.product_id.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.product_id.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.product_id.uuid),
  ),
  requested_qty: pipe(
    string(ERROR_MESSAGE_SCHEMA.requested_qty.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.requested_qty.nonEmpty),
    regex(/^\d+$/, ERROR_MESSAGE_SCHEMA.requested_qty.integer),
    check(
      (value) => Number(value) >= 1,
      ERROR_MESSAGE_SCHEMA.requested_qty.minValue,
    ),
    check(
      (value) => Number(value) <= MAX_QTY,
      ERROR_MESSAGE_SCHEMA.requested_qty.maxValue,
    ),
  ),
});

export const RegisterBodySchema = strictObject({
  to_location_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.to_location_id.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.to_location_id.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.to_location_id.uuid),
  ),
  items: pipe(
    array(TransferItemSchema, ERROR_MESSAGE_SCHEMA.items.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.items.nonEmpty),
    check(hasUniqueProducts, ERROR_MESSAGE_SCHEMA.items.unique),
  ),
  note: optional(
    pipe(
      string(ERROR_MESSAGE_SCHEMA.note.type),
      nonEmpty(ERROR_MESSAGE_SCHEMA.note.nonEmpty),
      maxLength(500, ERROR_MESSAGE_SCHEMA.note.maxLength),
    ),
  ),
  idempotency_key: pipe(
    string(ERROR_MESSAGE_SCHEMA.idempotency_key.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.idempotency_key.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.idempotency_key.uuid),
  ),
});

export type TRegisterBodySchema = InferOutput<typeof RegisterBodySchema>;
