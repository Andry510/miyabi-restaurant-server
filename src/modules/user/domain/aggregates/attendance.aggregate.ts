//Domain
import type {
  TAttendanceOutput,
  TAttendanceSummaryOutput,
  TShiftOutput,
} from '../types/entities';

const MINUTE_MS = 60 * 1000;

export class AttendanceAggregate {
  private readonly from: string;
  private readonly to: string;
  private readonly shifts: TShiftOutput[];

  private constructor(from: string, to: string, shifts: TShiftOutput[]) {
    this.from = from;
    this.to = to;
    this.shifts = shifts;
  }

  //Create
  static register = (
    from: string,
    to: string,
    shifts: TShiftOutput[],
  ): AttendanceAggregate => new AttendanceAggregate(from, to, shifts);

  //Get
  get Summary(): TAttendanceSummaryOutput {
    const summary: TAttendanceSummaryOutput = {
      shifts: this.shifts.length,
      cancelled: 0,
      present: 0,
      absent: 0,
      excused: 0,
      incomplete: 0,
      without_record: 0,
      worked_minutes: 0,
    };

    for (const shift of this.shifts) {
      if (shift.status === 'cancelled') {
        summary.cancelled++;
        continue;
      }

      const record = shift.attendance;

      if (!record) {
        summary.without_record++;
        continue;
      }

      summary[record.status]++;

      if (record.clock_in && record.clock_out) {
        summary.worked_minutes += Math.floor(
          (record.clock_out.getTime() - record.clock_in.getTime()) / MINUTE_MS,
        );
      }
    }

    return summary;
  }

  get Output(): TAttendanceOutput {
    return {
      from: this.from,
      to: this.to,
      summary: this.Summary,
      shifts: this.shifts,
    };
  }
}
