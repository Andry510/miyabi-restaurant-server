import {
  check,
  enum_,
  type InferOutput,
  integer,
  maxValue,
  minValue,
  multipleOf,
  number,
  optional,
  pipe,
  strictObject,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import {
  TIMEZONE,
  TIP_PERIOD,
  TIP_SANCTION_DESTINATION,
  WEEK_DAY,
} from '@domain/enums/shared';

const lateArrivalShifts = pipe(
  number(ERROR_MESSAGE_SCHEMA.late_arrival_shifts.type),
  minValue(0, ERROR_MESSAGE_SCHEMA.late_arrival_shifts.range),
  maxValue(10, ERROR_MESSAGE_SCHEMA.late_arrival_shifts.range),
  multipleOf(0.25, ERROR_MESSAGE_SCHEMA.late_arrival_shifts.step),
);

const absenceShifts = pipe(
  number(ERROR_MESSAGE_SCHEMA.absence_shifts.type),
  minValue(0, ERROR_MESSAGE_SCHEMA.absence_shifts.range),
  maxValue(10, ERROR_MESSAGE_SCHEMA.absence_shifts.range),
  multipleOf(0.25, ERROR_MESSAGE_SCHEMA.absence_shifts.step),
);

export const UpdateSettingsSchema = pipe(
  strictObject({
    timezone: optional(enum_(TIMEZONE, ERROR_MESSAGE_SCHEMA.timezone.enum)),
    tip_period: optional(
      enum_(TIP_PERIOD, ERROR_MESSAGE_SCHEMA.tip_period.enum),
    ),
    clock_in_window_minutes: optional(
      pipe(
        number(ERROR_MESSAGE_SCHEMA.clock_in_window_minutes.type),
        integer(ERROR_MESSAGE_SCHEMA.clock_in_window_minutes.integer),
        minValue(0, ERROR_MESSAGE_SCHEMA.clock_in_window_minutes.range),
        maxValue(240, ERROR_MESSAGE_SCHEMA.clock_in_window_minutes.range),
      ),
    ),
    late_arrival_shifts: optional(lateArrivalShifts),
    absence_shifts: optional(absenceShifts),
    week_start_day: optional(
      enum_(WEEK_DAY, ERROR_MESSAGE_SCHEMA.week_start_day.enum),
    ),
    tip_sanction_destination: optional(
      enum_(
        TIP_SANCTION_DESTINATION,
        ERROR_MESSAGE_SCHEMA.tip_sanction_destination.enum,
      ),
    ),
  }),
  check(
    (input) => Object.values(input).some((value) => value !== undefined),
    ERROR_MESSAGE_SCHEMA.empty,
  ),
);

export type TUpdateSettingsSchema = InferOutput<typeof UpdateSettingsSchema>;
