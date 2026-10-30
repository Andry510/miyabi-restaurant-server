//Infrastructure
import { Duration } from './duration.util';

export class AttendanceRule {
  static lateMinutes = (
    scheduledStart: Date,
    clockIn: Date,
    toleranceMinutes: number,
  ): number | null => {
    const minutes = Duration.minutesBetween(scheduledStart, clockIn);

    return minutes > toleranceMinutes ? minutes : null;
  };

  static earlyMinutes = (
    clockOut: Date,
    scheduledEnd: Date,
    toleranceMinutes: number,
  ): number | null => {
    const minutes = Duration.minutesBetween(clockOut, scheduledEnd);

    return minutes > toleranceMinutes ? minutes : null;
  };
}
