import type { server_settings } from '@generated/prisma/client';

//Domain
import type { TIP_PERIOD } from '@domain/enums/shared';
import type { TSettingsOutput } from '../../../domain/types/entities';

type TSettingsRow = Pick<
  server_settings,
  | 'timezone'
  | 'clock_in_window_minutes'
  | 'tip_period'
  | 'products_synced_at'
  | 'updated_at'
>;

export class SettingMapper {
  static toOutput = (row: TSettingsRow): TSettingsOutput => ({
    ...row,
    tip_period: row.tip_period as TIP_PERIOD,
  });
}
