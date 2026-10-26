import type {
  attendance_incidents,
  attendance_records,
  employee_shifts,
  work_schedules,
} from '@generated/prisma/client';

//Domain
import type {
  ATTENDANCE_STATUS,
  INCIDENT_TYPE,
  SHIFT_STATUS,
} from '@domain/enums/shared';
import type { TShiftOutput } from '../../../domain/types/entities';

type TShiftRow = Pick<
  employee_shifts,
  'id' | 'status' | 'scheduled_start' | 'scheduled_end'
> & {
  work_schedule: Pick<work_schedules, 'id' | 'name'>;
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
    work_schedule: { ...row.work_schedule },
    status: row.status as SHIFT_STATUS,
    scheduled_start: row.scheduled_start,
    scheduled_end: row.scheduled_end,
    attendance: row.attendance_record
      ? {
          status: row.attendance_record.status as ATTENDANCE_STATUS,
          clock_in: row.attendance_record.clock_in,
          clock_out: row.attendance_record.clock_out,
          note: row.attendance_record.note,
          incidents: row.attendance_record.incidents.map((incident) => ({
            ...incident,
            type: incident.type as INCIDENT_TYPE,
          })),
        }
      : null,
  });
}
