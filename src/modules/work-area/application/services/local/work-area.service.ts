import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_WORK_AREA_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IWorkAreaRepository } from '../../../domain/interfaces/repositories';
import type { IWorkAreaService } from '../../../domain/interfaces/services';
import type {
  TWorkAreasQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../domain/schemas';
import type { TWorkAreaOutput } from '../../../domain/types/entities';
import type { ICatalogService } from '../../../../repository/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  WORK_AREA_LOGGER_NAME,
  WORK_AREA_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

@Injectable()
export class WorkAreaService implements IWorkAreaService {
  private readonly logger = new Logger(WORK_AREA_LOGGER_NAME.SERVICE.WORK_AREA);

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG)
    private readonly catalog_service: ICatalogService,
    @Inject(WORK_AREA_PROVIDER_TOKENS.REPOSITORIES.WORK_AREA)
    private readonly work_area_repository: IWorkAreaRepository,
  ) {}

  //<--------- Validations --------->

  private async validateNameFree(
    name: string | undefined,
    exceptId: string | null,
  ): Promise<ResultPattern<null, ServiceError>> {
    if (!name) {
      return ServiceResultMapper.Ok(null);
    }

    const inUseResult = await this.work_area_repository.isNameInUse(
      name,
      exceptId,
    );

    if (inUseResult.IsFailure) {
      this.logger.error(inUseResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (inUseResult.Value) {
      return ServiceResultMapper.Conflict(
        API_WORK_AREA_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  //<--------- Service --------->

  async workAreas(
    input: TWorkAreasQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TWorkAreaOutput>, ServiceError>> {
    const listResult = await this.work_area_repository.findMany(input);

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async workArea(
    id: string,
  ): Promise<ResultPattern<TWorkAreaOutput, ServiceError>> {
    const findResult = await this.work_area_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(
        API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(findResult.Value);
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TWorkAreaOutput, ServiceError>> {
    const [nameResult, existResult] = await Promise.all([
      this.validateNameFree(input.name, null),
      this.catalog_service.jobPositionsExist(input.job_positions_ids),
    ]);

    if (nameResult.IsFailure) {
      return ResultPattern.Failure(nameResult.Error);
    }

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_WORK_AREA_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
      );
    }

    const createResult = await this.work_area_repository.create(input);

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(createResult.Value);
  }

  async update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TWorkAreaOutput, ServiceError>> {
    const nameResult = await this.validateNameFree(input.name, id);

    if (nameResult.IsFailure) {
      return ResultPattern.Failure(nameResult.Error);
    }

    const updateResult = await this.work_area_repository.update({
      ...input,
      id,
    });

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.NotFound(
        API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(updateResult.Value);
  }

  async remove(id: string): Promise<ResultPattern<null, ServiceError>> {
    const removeResult = await this.work_area_repository.softDelete(id);

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (removeResult.Value === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    if (removeResult.Value === 'has_employees') {
      return ServiceResultMapper.Conflict(
        API_WORK_AREA_MESSAGE.ERROR.HAS_EMPLOYEES,
      );
    }

    return ServiceResultMapper.Ok(null);
  }
}
