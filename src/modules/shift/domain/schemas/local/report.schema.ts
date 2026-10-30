import { type InferOutput, object, pipe } from 'valibot';

//Domain
import { DateRangeQuerySchema, dateRange } from '@domain/schemas/shared';

export const AttendanceReportSchema = pipe(
  object({ ...DateRangeQuerySchema }),
  dateRange(),
);

export type TAttendanceReportSchema = InferOutput<
  typeof AttendanceReportSchema
>;
