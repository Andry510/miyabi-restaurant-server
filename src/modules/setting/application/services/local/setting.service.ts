import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_SETTING_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ISettingRepository } from '../../../domain/interfaces/repositories';
import type { ISettingService } from '../../../domain/interfaces/services';
import type { TUpdateSettingsSchema } from '../../../domain/schemas';
import type { TSettingsOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
// oxlint-disable-next-line typescript/consistent-type-imports
import { RedisManager } from '@infrastructure/cache';
import { CACHE_KEY, CACHE_TTL_SECONDS } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  SETTING_LOGGER_NAME,
  SETTING_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class SettingService implements ISettingService {
  private readonly logger = new Logger(SETTING_LOGGER_NAME.SERVICE.SETTING);

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.REPOSITORIES.SETTING)
    private readonly setting_repository: ISettingRepository,
    private readonly cache: RedisManager,
  ) {}

  async settings(): Promise<ResultPattern<TSettingsOutput, ServiceError>> {
    const cached = await this.cache.get<TSettingsOutput>(CACHE_KEY.SETTINGS);

    if (cached) {
      return ServiceResultMapper.Ok({
        ...cached,
        products_synced_at: cached.products_synced_at
          ? new Date(cached.products_synced_at)
          : null,
        updated_at: new Date(cached.updated_at),
      });
    }

    const findResult = await this.setting_repository.find();

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    await this.cache.set(
      CACHE_KEY.SETTINGS,
      findResult.Value,
      CACHE_TTL_SECONDS.SETTINGS,
    );

    return ServiceResultMapper.Ok(findResult.Value);
  }

  async update(
    input: TUpdateSettingsSchema,
  ): Promise<ResultPattern<TSettingsOutput, ServiceError>> {
    if (input.tip_period) {
      const openResult = await this.setting_repository.hasOpenTipPools();

      if (openResult.IsFailure) {
        this.logger.error(openResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      if (openResult.Value) {
        return ServiceResultMapper.Conflict(
          API_SETTING_MESSAGE.ERROR.TIP_POOLS_OPEN,
        );
      }
    }

    const updateResult = await this.setting_repository.update(input);

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    await this.cache.forget(CACHE_KEY.SETTINGS);

    return ServiceResultMapper.Ok(updateResult.Value);
  }
}
