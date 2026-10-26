//Domain
import { ATTENDANCE_STATUS, SHIFT_STATUS } from '@domain/enums/shared';
import type {
  TAgendaDayOutput,
  TAgendaDayStatus,
  TAttendanceOutput,
  TAttendanceSummaryOutput,
  TShiftOutput,
} from '../../types/entities';

//Infrastructure
import { Duration, TimeZone } from '@infrastructure/utils';

type TShiftOutcome =
  'attended' | 'excused' | 'absent' | 'pending' | 'cancelled';

export class AttendanceAggregate {
  private readonly from: string;
  private readonly to: string;
  private readonly timezone: string;
  private readonly now: Date;
  private readonly shifts: TShiftOutput[];

  private constructor(
    from: string,
    to: string,
    timezone: string,
    now: Date,
    shifts: TShiftOutput[],
  ) {
    this.from = from;
    this.to = to;
    this.timezone = timezone;
    this.now = now;
    this.shifts = shifts;
  }

  //Create
  static register = (
    from: string,
    to: string,
    timezone: string,
    now: Date,
    shifts: TShiftOutput[],
  ): AttendanceAggregate =>
    new AttendanceAggregate(from, to, timezone, now, shifts);

  //Get
  get Days(): TAgendaDayOutput[] {
    const byDay = new Map<string, TShiftOutput[]>();

    for (const shift of this.shifts) {
      const day = TimeZone.dayOf(shift.scheduled_start, this.timezone);
      byDay.set(day, [...(byDay.get(day) ?? []), shift]);
    }

    const days: TAgendaDayOutput[] = [];

    for (let day = this.from; day <= this.to; day = TimeZone.addDays(day, 1)) {
      const shifts = byDay.get(day) ?? [];
      days.push({ date: day, status: this.dayStatus(shifts), shifts });
    }

    return days;
  }

  get Output(): TAttendanceOutput {
    const days = this.Days;

    return {
      from: this.from,
      to: this.to,
      summary: this.summary(days),
      days,
    };
  }

  //Functions
  private summary(days: TAgendaDayOutput[]): TAttendanceSummaryOutput {
    const summary: TAttendanceSummaryOutput = {
      shifts: this.shifts.length,
      cancelled: 0,
      present: 0,
      absent: 0,
      excused: 0,
      incomplete: 0,
      without_record: 0,
      worked_minutes: 0,
      days: {
        present: 0,
        partial: 0,
        absent: 0,
        excused: 0,
        scheduled: 0,
        cancelled: 0,
        off: 0,
      },
    };

    for (const day of days) {
      summary.days[day.status]++;
    }

    for (const shift of this.shifts) {
      if (shift.status === SHIFT_STATUS.CANCELLED) {
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
        summary.worked_minutes += Duration.minutesBetween(
          record.clock_in,
          record.clock_out,
        );
      }
    }

    return summary;
  }

  private dayStatus(shifts: TShiftOutput[]): TAgendaDayStatus {
    if (shifts.length === 0) {
      return 'off';
    }

    const active = shifts
      .map((shift) => this.outcome(shift))
      .filter((outcome) => outcome !== 'cancelled');

    if (active.length === 0) {
      return 'cancelled';
    }

    const finished = active.filter((outcome) => outcome !== 'pending');

    if (finished.length === 0) {
      return 'scheduled';
    }

    const attended = finished.filter(
      (outcome) => outcome === 'attended',
    ).length;

    if (attended === finished.length) {
      return 'present';
    }

    if (attended > 0) {
      return 'partial';
    }

    return finished.every((outcome) => outcome === 'excused')
      ? 'excused'
      : 'absent';
  }

  private outcome(shift: TShiftOutput): TShiftOutcome {
    if (shift.status === SHIFT_STATUS.CANCELLED) {
      return 'cancelled';
    }

    const record = shift.attendance;

    if (record?.clock_in) {
      return 'attended';
    }

    if (record?.status === ATTENDANCE_STATUS.EXCUSED) {
      return 'excused';
    }

    if (record?.status === ATTENDANCE_STATUS.ABSENT) {
      return 'absent';
    }

    return shift.scheduled_end > this.now ? 'pending' : 'absent';
  }
}
