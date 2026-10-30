import {
  type InferOutput,
  isoDate,
  optional,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { uuidList } from '@domain/schemas/shared';

const week = pipe(
  string(ERROR_MESSAGE_SCHEMA.week.isoDate),
  isoDate(ERROR_MESSAGE_SCHEMA.week.isoDate),
);

export const CopyWeekBodySchema = strictObject({
  from_week: week,
  to_week: week,
  user_ids: optional(uuidList(ERROR_MESSAGE_SCHEMA.user_ids)),
});

export type TCopyWeekBodySchema = InferOutput<typeof CopyWeekBodySchema>;
