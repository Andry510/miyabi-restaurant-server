import {
  array,
  type InferOutput,
  isoDate,
  maxLength,
  minLength,
  enum_,
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
import { SHIFT_STATUS } from '@domain/enums/shared';
import {
  DateRangeQuerySchema,
  dateRange,
  PaginationQuerySchema,
} from '@domain/schemas/shared';

const workScheduleId = pipe(
  string(ERROR_MESSAGE_SCHEMA.work_schedule_id.type),
  uuid(ERROR_MESSAGE_SCHEMA.work_schedule_id.uuid),
);

const noteField = pipe(
  string(ERROR_MESSAGE_SCHEMA.note.type),
  trim(),
  maxLength(500, ERROR_MESSAGE_SCHEMA.note.maxLength),
);

export const ShiftsQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    ...DateRangeQuerySchema,
    user_id: optional(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.user_id.type),
        uuid(ERROR_MESSAGE_SCHEMA.user_id.uuid),
      ),
    ),
    work_schedule_id: optional(workScheduleId),
    status: optional(enum_(SHIFT_STATUS, ERROR_MESSAGE_SCHEMA.status.enum)),
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

export type TShiftsQuerySchema = InferOutput<typeof ShiftsQuerySchema>;

export const RegisterSchema = strictObject({
  user_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.user_id.type),
    uuid(ERROR_MESSAGE_SCHEMA.user_id.uuid),
  ),
  work_schedule_id: workScheduleId,
  dates: pipe(
    array(
      pipe(
        string(ERROR_MESSAGE_SCHEMA.dates.itemType),
        isoDate(ERROR_MESSAGE_SCHEMA.dates.itemDate),
      ),
      ERROR_MESSAGE_SCHEMA.dates.type,
    ),
    minLength(1, ERROR_MESSAGE_SCHEMA.dates.minLength),
    maxLength(31, ERROR_MESSAGE_SCHEMA.dates.maxLength),
    transform((dates) => [...new Set(dates)].sort()),
  ),
  note: optional(noteField),
});

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = strictObject({
  work_schedule_id: optional(workScheduleId),
  date: optional(
    pipe(
      string(ERROR_MESSAGE_SCHEMA.date.type),
      isoDate(ERROR_MESSAGE_SCHEMA.date.format),
    ),
  ),
  note: optional(noteField),
});

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;
