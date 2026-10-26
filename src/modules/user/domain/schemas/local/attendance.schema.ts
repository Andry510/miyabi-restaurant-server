import { type InferOutput, pipe, strictObject } from 'valibot';

//Domain
import { DateRangeQuerySchema, dateRange } from '@domain/schemas/shared';

export const AttendanceQuerySchema = pipe(
  strictObject({ ...DateRangeQuerySchema }),
  dateRange(),
);

export type TAttendanceQuerySchema = InferOutput<typeof AttendanceQuerySchema>;
