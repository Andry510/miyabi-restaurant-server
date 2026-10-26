import type {
  attendance_incidents,
  attendance_records,
  employee_shifts,
  work_schedules,
} from '@generated/prisma/client';

//Domain
import type { TShiftOutput } from '../../domain/types/entities';

type TShiftRow = Pick<
  employee_shifts,
  'id' | 'status' | 'scheduled_start' | 'scheduled_end'
> & {
  work_schedule: Pick<work_schedules, 'name'>;
  attendance_record:
    | (Pick<
        attendance_records,
        'status' | 'clock_in' | 'clock_out' | 'note'
      > & {
        incidents: Array<
          Pick<attendance_incidents, 'type' | 'minutes' | 'description'>
        >;
      })
    | null;
};

export class AttendanceMapper {
  static toShiftOutput = (row: TShiftRow): TShiftOutput => ({
    id: row.id,
    schedule: row.work_schedule.name,
    status: row.status,
    scheduled_start: row.scheduled_start,
    scheduled_end: row.scheduled_end,
    attendance: row.attendance_record
      ? {
          status: row.attendance_record.status,
          clock_in: row.attendance_record.clock_in,
          clock_out: row.attendance_record.clock_out,
          note: row.attendance_record.note,
          incidents: row.attendance_record.incidents.map((incident) => ({
            ...incident,
          })),
        }
      : null,
  });
}
