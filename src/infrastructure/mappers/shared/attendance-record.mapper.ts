import type {
  attendance_incidents,
  attendance_records,
} from '@generated/prisma/client';

//Domain
import type { ATTENDANCE_STATUS, INCIDENT_TYPE } from '@domain/enums/shared';
import type { TAttendanceRecordOutput } from '@domain/types/entities';

export const ATTENDANCE_RECORD_SELECT = {
  status: true,
  clock_in: true,
  clock_out: true,
  note: true,
  corrected_by: true,
  corrected_at: true,
  incidents: {
    select: {
      type: true,
      minutes: true,
      description: true,
      justification: true,
      justified_by: true,
      justified_at: true,
    },
    orderBy: { created_at: 'asc' },
  },
} as const;

export type TAttendanceRecordRow = Pick<
  attendance_records,
  'status' | 'clock_in' | 'clock_out' | 'note' | 'corrected_by' | 'corrected_at'
> & {
  incidents: Array<
    Pick<
      attendance_incidents,
      | 'type'
      | 'minutes'
      | 'description'
      | 'justification'
      | 'justified_by'
      | 'justified_at'
    >
  >;
};

export class AttendanceRecordMapper {
  static toOutput = (
    row: TAttendanceRecordRow | null,
  ): TAttendanceRecordOutput | null =>
    row
      ? {
          status: row.status as ATTENDANCE_STATUS,
          clock_in: row.clock_in,
          clock_out: row.clock_out,
          note: row.note,
          corrected_by: row.corrected_by,
          corrected_at: row.corrected_at,
          incidents: row.incidents.map((incident) => ({
            ...incident,
            type: incident.type as INCIDENT_TYPE,
          })),
        }
      : null;
}
