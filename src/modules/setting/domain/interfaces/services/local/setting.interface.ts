//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUpdateSettingsSchema } from '../../../schemas';
import type { TSettingsOutput } from '../../../types/entities';

export interface ISettingService {
  settings(): Promise<ResultPattern<TSettingsOutput, ServiceError>>;

  update(
    input: TUpdateSettingsSchema,
  ): Promise<ResultPattern<TSettingsOutput, ServiceError>>;
}
