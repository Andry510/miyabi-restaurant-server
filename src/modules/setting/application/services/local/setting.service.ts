import { Inject, Injectable } from '@nestjs/common';

//Domain
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
  ) {}

  async settings(): Promise<ResultPattern<TSettingsOutput, ServiceError>> {
    const findResult = await this.setting_repository.find();

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

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

    return ServiceResultMapper.Ok(updateResult.Value);
  }
}
