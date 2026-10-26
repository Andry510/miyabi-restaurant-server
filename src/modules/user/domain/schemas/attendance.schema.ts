import {
  check,
  type InferOutput,
  isoDate,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 92;

export const AttendanceQuerySchema = pipe(
  strictObject({
    from: pipe(
      string(ERROR_MESSAGE_SCHEMA.from.type),
      isoDate(ERROR_MESSAGE_SCHEMA.from.date),
    ),
    to: pipe(
      string(ERROR_MESSAGE_SCHEMA.to.type),
      isoDate(ERROR_MESSAGE_SCHEMA.to.date),
    ),
  }),
  check(({ from, to }) => from <= to, ERROR_MESSAGE_SCHEMA.range.order),
  check(
    ({ from, to }) => Date.parse(to) - Date.parse(from) < MAX_DAYS * DAY_MS,
    ERROR_MESSAGE_SCHEMA.range.max,
  ),
);

export type TAttendanceQuerySchema = InferOutput<typeof AttendanceQuerySchema>;
