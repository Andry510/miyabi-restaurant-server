//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TUpdateSettingsSchema } from '../../../schemas';
import type { TSettingsOutput } from '../../../types/entities';

export interface ISettingRepository {
  find(): Promise<ResultPattern<TSettingsOutput>>;

  hasOpenTipPools(): Promise<ResultPattern<boolean>>;

  update(input: TUpdateSettingsSchema): Promise<ResultPattern<TSettingsOutput>>;
}
