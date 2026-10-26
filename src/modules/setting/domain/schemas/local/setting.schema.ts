import {
  check,
  enum_,
  type InferOutput,
  integer,
  maxValue,
  minValue,
  number,
  optional,
  pipe,
  strictObject,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { TIMEZONE, TIP_PERIOD } from '@domain/enums/shared';

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
  }),
  check(
    (input) => Object.values(input).some((value) => value !== undefined),
    ERROR_MESSAGE_SCHEMA.empty,
  ),
);

export type TUpdateSettingsSchema = InferOutput<typeof UpdateSettingsSchema>;
