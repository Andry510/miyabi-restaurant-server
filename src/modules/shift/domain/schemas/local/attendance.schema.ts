import {
  check,
  type InferOutput,
  isoTimestamp,
  maxLength,
  minLength,
  optional,
  picklist,
  pipe,
  strictObject,
  string,
  transform,
  trim,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { INCIDENT_TYPE } from '@domain/enums/shared';

const reason = pipe(
  string(ERROR_MESSAGE_SCHEMA.reason.type),
  trim(),
  minLength(3, ERROR_MESSAGE_SCHEMA.reason.minLength),
  maxLength(500, ERROR_MESSAGE_SCHEMA.reason.maxLength),
);

const clockIn = pipe(
  string(ERROR_MESSAGE_SCHEMA.clock_in.type),
  isoTimestamp(ERROR_MESSAGE_SCHEMA.clock_in.type),
  transform((value) => new Date(value)),
);

const clockOut = pipe(
  string(ERROR_MESSAGE_SCHEMA.clock_out.type),
  isoTimestamp(ERROR_MESSAGE_SCHEMA.clock_out.type),
  transform((value) => new Date(value)),
);

export const CorrectAttendanceBodySchema = pipe(
  strictObject({
    clock_in: optional(clockIn),
    clock_out: optional(clockOut),
    reason,
  }),
  check(
    (input) => input.clock_in !== undefined || input.clock_out !== undefined,
    ERROR_MESSAGE_SCHEMA.clock.required,
  ),
);

export type TCorrectAttendanceBodySchema = InferOutput<
  typeof CorrectAttendanceBodySchema
>;

export const JUSTIFIABLE_INCIDENTS = [
  INCIDENT_TYPE.ABSENCE,
  INCIDENT_TYPE.LATE_ARRIVAL,
  INCIDENT_TYPE.EARLY_DEPARTURE,
] as const;

export const JustifyBodySchema = strictObject({
  type: picklist(
    JUSTIFIABLE_INCIDENTS,
    ERROR_MESSAGE_SCHEMA.justification_type.picklist,
  ),
  reason,
});

export type TJustifyBodySchema = InferOutput<typeof JustifyBodySchema>;
