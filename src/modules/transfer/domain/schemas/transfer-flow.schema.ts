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
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';

const MAX_QTY = 2147483647;

const hasUniqueItems = <T extends { item_id: string }>(items: T[]): boolean =>
  new Set(items.map(({ item_id }) => item_id)).size === items.length;

const ReceiveItemSchema = strictObject({
  item_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.item_id.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.item_id.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.item_id.uuid),
  ),
  quantity: pipe(
    string(ERROR_MESSAGE_SCHEMA.quantity.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.quantity.nonEmpty),
    regex(/^\d+$/, ERROR_MESSAGE_SCHEMA.quantity.integer),
    check(
      (value) => Number(value) <= MAX_QTY,
      ERROR_MESSAGE_SCHEMA.quantity.maxValue,
    ),
  ),
  issue_note: optional(
    pipe(
      string(ERROR_MESSAGE_SCHEMA.issue_note.type),
      nonEmpty(ERROR_MESSAGE_SCHEMA.issue_note.nonEmpty),
      maxLength(500, ERROR_MESSAGE_SCHEMA.issue_note.maxLength),
    ),
  ),
});

export const ReceiveTransferBodySchema = strictObject({
  items: pipe(
    array(ReceiveItemSchema, ERROR_MESSAGE_SCHEMA.items.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.items.nonEmpty),
    check(hasUniqueItems, ERROR_MESSAGE_SCHEMA.items.unique),
  ),
});

export type TReceiveTransferSchema = InferOutput<
  typeof ReceiveTransferBodySchema
> &
  TParamIdSchema;
