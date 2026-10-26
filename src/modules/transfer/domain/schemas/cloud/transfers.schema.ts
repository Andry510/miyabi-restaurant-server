import {
  check,
  enum_,
  type InferOutput,
  optional,
  pipe,
  strictObject,
  string,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { TRANSFER_STATUS } from '@domain/enums/shared';
import { PaginationQuerySchema, queryArray } from '@domain/schemas/shared';

//Infrastructure
import { Duration } from '@infrastructure/utils';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value: string): boolean =>
  !Number.isNaN(Date.parse(value));

const toRangeEnd = (value: string): number =>
  DATE_ONLY.test(value)
    ? Date.parse(value) + Duration.DAY_MS
    : Date.parse(value);

export const TransfersQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    status: queryArray(
      enum_(TRANSFER_STATUS, ERROR_MESSAGE_SCHEMA.status.itemEnum),
      ERROR_MESSAGE_SCHEMA.status.type,
    ),
    created_from: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.created_from.type),
        check(isValidDate, ERROR_MESSAGE_SCHEMA.created_from.date),
      ),
    ),
    created_to: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.created_to.type),
        check(isValidDate, ERROR_MESSAGE_SCHEMA.created_to.date),
      ),
    ),
    from_location_id: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.from_location_id.type),
        uuid(ERROR_MESSAGE_SCHEMA.from_location_id.uuid),
      ),
    ),
    to_location_id: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.location_id.type),
        uuid(ERROR_MESSAGE_SCHEMA.location_id.uuid),
      ),
    ),
  }),
  check(
    ({ created_from, created_to }) =>
      !created_from ||
      !created_to ||
      Date.parse(created_from) < toRangeEnd(created_to),
    ERROR_MESSAGE_SCHEMA.created_range.order,
  ),
);

export type TTransfersQuerySchema = InferOutput<typeof TransfersQuerySchema>;
