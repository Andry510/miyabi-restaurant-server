//Domain
import type {
  TIP_PERIOD,
  TIP_SANCTION_DESTINATION,
  WEEK_DAY,
} from '@domain/enums/shared';

export type TSettingsOutput = {
  timezone: string;
  clock_in_window_minutes: number;
  tip_period: TIP_PERIOD;
  late_arrival_shifts: number;
  absence_shifts: number;
  tip_sanction_destination: TIP_SANCTION_DESTINATION;
  week_start_day: WEEK_DAY;
  products_synced_at: Date | null;
  updated_at: Date;
};
