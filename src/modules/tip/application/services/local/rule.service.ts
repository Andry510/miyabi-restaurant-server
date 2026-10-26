import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { IRuleRepository } from '../../../domain/interfaces/repositories';
import type { IRuleService } from '../../../domain/interfaces/services';
import type { TRulesBodySchema } from '../../../domain/schemas';
import type { TTipRulesOutput } from '../../../domain/types/entities';
import type { ICatalogService } from '../../../../repository/domain/interfaces/services';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Money } from '@infrastructure/utils';
import {
  TIP_LOGGER_NAME,
  TIP_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { TipMapper } from '../../../infrastructure/mappers';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

@Injectable()
export class RuleService implements IRuleService {
  private readonly logger = new Logger(TIP_LOGGER_NAME.SERVICE.RULE);

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG)
    private readonly catalog_service: ICatalogService,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(TIP_PROVIDER_TOKENS.REPOSITORIES.RULE)
    private readonly rule_repository: IRuleRepository,
  ) {}

  async rules(): Promise<ResultPattern<TTipRulesOutput, ServiceError>> {
    const [settingsResult, rulesResult] = await Promise.all([
      this.setting_service.settings(),
      this.rule_repository.findRules(),
    ]);

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    if (rulesResult.IsFailure) {
      this.logger.error(rulesResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const configs = rulesResult.Value;

    return ServiceResultMapper.Ok({
      period: settingsResult.Value.tip_period,
      total_percentage: Money.fromCents(
        configs.reduce(
          (total, config) => total + (config.percentage_bp ?? 0),
          0,
        ),
      ),
      rules: configs.map((config) => TipMapper.toRuleOutput(config)),
    });
  }

  async update(
    input: TRulesBodySchema,
  ): Promise<ResultPattern<TTipRulesOutput, ServiceError>> {
    const existResult = await this.catalog_service.workAreasExist(
      input.rules.map((rule) => rule.work_area_id),
    );

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    const replaceResult = await this.rule_repository.replaceRules(input.rules);

    if (replaceResult.IsFailure) {
      this.logger.error(replaceResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!replaceResult.Value) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.POSITION_NOT_LINKED,
      );
    }

    return this.rules();
  }
}
