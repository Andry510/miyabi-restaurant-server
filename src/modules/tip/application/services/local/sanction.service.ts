import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ISanctionRepository } from '../../../domain/interfaces/repositories';
import type {
  ISanctionService,
  ITipService,
} from '../../../domain/interfaces/services';
import type {
  TPoolSanctionBodySchema,
  TSanctionTypeBodySchema,
  TUpdateSanctionTypeBodySchema,
} from '../../../domain/schemas';
import type {
  TTipPoolDetailOutput,
  TTipSanctionTypeOutput,
} from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TokenPayload } from '@infrastructure/utils';
import {
  TIP_LOGGER_NAME,
  TIP_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class SanctionService implements ISanctionService {
  private readonly logger = new Logger(TIP_LOGGER_NAME.SERVICE.SANCTION);

  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.TIP)
    private readonly tip_service: ITipService,
    @Inject(TIP_PROVIDER_TOKENS.REPOSITORIES.SANCTION)
    private readonly sanction_repository: ISanctionRepository,
  ) {}

  async types(): Promise<
    ResultPattern<TTipSanctionTypeOutput[], ServiceError>
  > {
    const typesResult = await this.sanction_repository.findTypes();

    if (typesResult.IsFailure) {
      this.logger.error(typesResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(typesResult.Value);
  }

  async createType(
    input: TSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput, ServiceError>> {
    const createResult = await this.sanction_repository.createType(input);

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!createResult.Value) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_DUPLICATED,
      );
    }

    return ServiceResultMapper.Ok(createResult.Value);
  }

  async updateType(
    id: string,
    input: TUpdateSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput, ServiceError>> {
    const updateResult = await this.sanction_repository.updateType(id, input);

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (updateResult.Value === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
      );
    }

    if (updateResult.Value === 'duplicated') {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_DUPLICATED,
      );
    }

    return ServiceResultMapper.Ok(updateResult.Value);
  }

  async removeType(id: string): Promise<ResultPattern<null, ServiceError>> {
    const removeResult = await this.sanction_repository.removeType(id);

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (removeResult.Value === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
      );
    }

    if (removeResult.Value === 'in_use') {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_IN_USE,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  async add(
    poolId: string,
    input: TPoolSanctionBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const [poolResult, typeResult] = await Promise.all([
      this.tip_service.openPool(poolId),
      this.sanction_repository.findType(input.sanction_type_id),
    ]);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    if (typeResult.IsFailure) {
      this.logger.error(typeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!typeResult.Value) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
      );
    }

    const allocation = poolResult.Value.areas
      .flatMap((area) => area.allocations)
      .find((item) => item.user.id === input.user_id);

    if (!allocation) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.USER_NOT_IN_POOL,
      );
    }

    const createResult = await this.sanction_repository.create(
      {
        tip_pool_id: poolId,
        assignment_id: allocation.assignment_id,
        sanction_type_id: input.sanction_type_id,
        note: input.note ?? null,
        created_by: TokenPayload.email(accessToken) ?? '',
      },
      typeResult.Value,
    );

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!createResult.Value) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    return this.tip_service.update(poolId, {});
  }

  async remove(
    poolId: string,
    sanctionId: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const poolResult = await this.tip_service.openPool(poolId);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    const removeResult = await this.sanction_repository.remove(
      poolId,
      sanctionId,
    );

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!removeResult.Value) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.SANCTION_NOT_FOUND,
      );
    }

    return this.tip_service.update(poolId, {});
  }
}
