//Domain
import type { TIP_PERIOD } from '@domain/enums/shared';

export type TSettingsOutput = {
  timezone: string;
  clock_in_window_minutes: number;
  tip_period: TIP_PERIOD;
  products_synced_at: Date | null;
  updated_at: Date;
};
