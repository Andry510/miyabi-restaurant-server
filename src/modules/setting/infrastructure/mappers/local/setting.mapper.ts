import type { server_settings } from '@generated/prisma/client';

//Domain
import type {
  TIP_PERIOD,
  TIP_SANCTION_DESTINATION,
  WEEK_DAY,
} from '@domain/enums/shared';
import type { TSettingsOutput } from '../../../domain/types/entities';

type TSettingsRow = Pick<
  server_settings,
  | 'timezone'
  | 'clock_in_window_minutes'
  | 'tip_period'
  | 'late_arrival_shifts'
  | 'absence_shifts'
  | 'tip_sanction_destination'
  | 'week_start_day'
  | 'products_synced_at'
  | 'updated_at'
>;

export class SettingMapper {
  static toOutput = (row: TSettingsRow): TSettingsOutput => ({
    ...row,
    tip_period: row.tip_period as TIP_PERIOD,
    late_arrival_shifts: Number(row.late_arrival_shifts),
    absence_shifts: Number(row.absence_shifts),
    tip_sanction_destination:
      row.tip_sanction_destination as TIP_SANCTION_DESTINATION,
    week_start_day: row.week_start_day as WEEK_DAY,
  });
}
