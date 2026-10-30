import {
  boolean,
  check,
  type InferOutput,
  integer,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  optional,
  pipe,
  regex,
  strictObject,
  string,
  transform,
  trim,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PaginationQuerySchema } from '@domain/schemas/shared';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const nameField = pipe(
  string(ERROR_MESSAGE_SCHEMA.name.type),
  trim(),
  minLength(2, ERROR_MESSAGE_SCHEMA.name.minLength),
  maxLength(100, ERROR_MESSAGE_SCHEMA.name.maxLength),
);

const startTime = pipe(
  string(ERROR_MESSAGE_SCHEMA.start_time.type),
  regex(TIME, ERROR_MESSAGE_SCHEMA.start_time.format),
);

const endTime = pipe(
  string(ERROR_MESSAGE_SCHEMA.end_time.type),
  regex(TIME, ERROR_MESSAGE_SCHEMA.end_time.format),
);

const breakMinutes = pipe(
  number(ERROR_MESSAGE_SCHEMA.break_minutes.type),
  integer(ERROR_MESSAGE_SCHEMA.break_minutes.integer),
  minValue(0, ERROR_MESSAGE_SCHEMA.break_minutes.range),
  maxValue(480, ERROR_MESSAGE_SCHEMA.break_minutes.range),
);

const lateTolerance = pipe(
  number(ERROR_MESSAGE_SCHEMA.late_tolerance_minutes.type),
  integer(ERROR_MESSAGE_SCHEMA.late_tolerance_minutes.integer),
  minValue(0, ERROR_MESSAGE_SCHEMA.late_tolerance_minutes.range),
  maxValue(120, ERROR_MESSAGE_SCHEMA.late_tolerance_minutes.range),
);

const earlyLeaveTolerance = pipe(
  number(ERROR_MESSAGE_SCHEMA.early_leave_tolerance_minutes.type),
  integer(ERROR_MESSAGE_SCHEMA.early_leave_tolerance_minutes.integer),
  minValue(0, ERROR_MESSAGE_SCHEMA.early_leave_tolerance_minutes.range),
  maxValue(120, ERROR_MESSAGE_SCHEMA.early_leave_tolerance_minutes.range),
);

const differentTimes = <T extends { start_time?: string; end_time?: string }>(
  input: T,
): boolean =>
  !input.start_time || !input.end_time || input.start_time !== input.end_time;

export const WorkSchedulesQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    name: optional(string(ERROR_MESSAGE_SCHEMA.name.type)),
  }),
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TWorkSchedulesQuerySchema = InferOutput<
  typeof WorkSchedulesQuerySchema
>;

export const RegisterSchema = pipe(
  strictObject({
    name: nameField,
    start_time: startTime,
    end_time: endTime,
    break_minutes: optional(breakMinutes),
    late_tolerance_minutes: optional(lateTolerance),
    early_leave_tolerance_minutes: optional(earlyLeaveTolerance),
  }),
  check(differentTimes, ERROR_MESSAGE_SCHEMA.times.equal),
);

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = pipe(
  strictObject({
    name: optional(nameField),
    start_time: optional(startTime),
    end_time: optional(endTime),
    break_minutes: optional(breakMinutes),
    late_tolerance_minutes: optional(lateTolerance),
    early_leave_tolerance_minutes: optional(earlyLeaveTolerance),
    status: optional(boolean(ERROR_MESSAGE_SCHEMA.status.type)),
  }),
  check(differentTimes, ERROR_MESSAGE_SCHEMA.times.equal),
);

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;
