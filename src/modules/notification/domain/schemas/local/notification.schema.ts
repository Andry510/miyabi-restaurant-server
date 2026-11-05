import {
  type InferOutput,
  maxLength,
  maxValue,
  optional,
  picklist,
  pipe,
  strictObject,
  string,
  transform,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PaginationQuerySchema, uuidList } from '@domain/schemas/shared';

//Infrastructure
import { NOTIFICATION_LIMITS } from '../../../infrastructure/constants';

export const NotificationsQuerySchema = pipe(
  strictObject({
    read: optional(picklist(['true', 'false'], ERROR_MESSAGE_SCHEMA.read.type)),
    cursor: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.cursor.type),
        maxLength(
          NOTIFICATION_LIMITS.CURSOR_MAX_LENGTH,
          ERROR_MESSAGE_SCHEMA.cursor.type,
        ),
      ),
    ),
    limit: optional(
      pipe(
        PaginationQuerySchema.limit,
        maxValue(
          NOTIFICATION_LIMITS.MAX_LIMIT,
          ERROR_MESSAGE_SCHEMA.limit.range,
        ),
      ),
    ),
  }),
  transform((input) => ({
    read: input.read === undefined ? null : input.read === 'true',
    cursor: input.cursor || null,
    take: input.limit ?? NOTIFICATION_LIMITS.DEFAULT_LIMIT,
  })),
);

export const ReadNotificationsBodySchema = strictObject({
  notification_ids: optional(
    pipe(
      uuidList({
        type: ERROR_MESSAGE_SCHEMA.notification_ids.type,
        itemType: ERROR_MESSAGE_SCHEMA.notification_ids.type,
        itemUuid: ERROR_MESSAGE_SCHEMA.notification_ids.type,
      }),
      maxLength(
        NOTIFICATION_LIMITS.MAX_LIMIT,
        ERROR_MESSAGE_SCHEMA.notification_ids.max,
      ),
    ),
    [],
  ),
});

export type TNotificationsQuerySchema = InferOutput<
  typeof NotificationsQuerySchema
>;

export type TReadNotificationsBodySchema = InferOutput<
  typeof ReadNotificationsBodySchema
>;
