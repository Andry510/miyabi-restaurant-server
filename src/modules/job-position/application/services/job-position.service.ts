import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_JOB_POSITION_MESSAGE } from '../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IJobPositionRepository } from '../../domain/interfaces/repositories';
import type { IJobPositionService } from '../../domain/interfaces/services';
import type {
  TJobPositionsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../domain/schemas';
import type { TJobPositionOutput } from '../../domain/types/entities';
import type { ICatalogService } from '../../../repository/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  JOB_POSITION_LOGGER_NAME,
  JOB_POSITION_PROVIDER_TOKENS,
} from '../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../repository/infrastructure/constants';

@Injectable()
export class JobPositionService implements IJobPositionService {
  private readonly logger = new Logger(
    JOB_POSITION_LOGGER_NAME.SERVICE.JOB_POSITION,
  );

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG)
    private readonly catalog_service: ICatalogService,
    @Inject(JOB_POSITION_PROVIDER_TOKENS.REPOSITORIES.JOB_POSITION)
    private readonly job_position_repository: IJobPositionRepository,
  ) {}

  //<--------- Validations --------->

  private async validateNameFree(
    name: string | undefined,
    exceptId: string | null,
  ): Promise<ResultPattern<null, ServiceError>> {
    if (!name) {
      return ServiceResultMapper.Ok(null);
    }

    const inUseResult = await this.job_position_repository.isNameInUse(
      name,
      exceptId,
    );

    if (inUseResult.IsFailure) {
      this.logger.error(inUseResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (inUseResult.Value) {
      return ServiceResultMapper.Conflict(
        API_JOB_POSITION_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  //<--------- Service --------->

  async jobPositions(
    input: TJobPositionsQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TJobPositionOutput>, ServiceError>
  > {
    const listResult = await this.job_position_repository.findMany(input);

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async jobPosition(
    id: string,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>> {
    const findResult = await this.job_position_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(
        API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(findResult.Value);
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>> {
    const [nameResult, existResult] = await Promise.all([
      this.validateNameFree(input.name, null),
      this.catalog_service.workAreasExist(input.work_areas_ids),
    ]);

    if (nameResult.IsFailure) {
      return ResultPattern.Failure(nameResult.Error);
    }

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_JOB_POSITION_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    const createResult = await this.job_position_repository.create(input);

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(createResult.Value);
  }

  async update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>> {
    const nameResult = await this.validateNameFree(input.name, id);

    if (nameResult.IsFailure) {
      return ResultPattern.Failure(nameResult.Error);
    }

    const updateResult = await this.job_position_repository.update({
      ...input,
      id,
    });

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.NotFound(
        API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(updateResult.Value);
  }

  async remove(id: string): Promise<ResultPattern<null, ServiceError>> {
    const removeResult = await this.job_position_repository.softDelete(id);

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (removeResult.Value === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
      );
    }

    if (removeResult.Value === 'has_employees') {
      return ServiceResultMapper.Conflict(
        API_JOB_POSITION_MESSAGE.ERROR.HAS_EMPLOYEES,
      );
    }

    return ServiceResultMapper.Ok(null);
  }
}
